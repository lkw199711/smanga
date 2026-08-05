import { nextTick, onMounted, onUnmounted } from 'vue'

const SWIPE_DISTANCE = 56
const SWIPE_AXIS_RATIO = 1.4
const DIRECTION_LOCK_DISTANCE = 8
const DIRECTION_LOCK_RATIO = 1.15
const MAX_DRAG_RATIO = 0.42
const OVER_DRAG_RESISTANCE = 0.2
const DRAG_SETTLE_DURATION = 180
const FOLLOW_UP_CLICK_TIMEOUT = 400

interface PagedReaderNavigationOptions {
	previous: () => false | void | Promise<void>
	next: () => false | void | Promise<void>
	canPrevious: () => boolean
	canNext: () => boolean
	toggleControls: () => void
	isReversed: () => boolean
}

/**
 * Paged-reader navigation without hidden tap zones.
 *
 * A tap anywhere toggles the reader chrome. Touch/pen horizontal swipes turn
 * pages, while vertical movement remains available to the scroll container for
 * manually enlarged images. Keyboard navigation is available on desktop.
 */
export function usePagedReaderNavigation(options: PagedReaderNavigationOptions) {
	let pointerId: number | null = null
	let readerSurface: HTMLElement | null = null
	let startX = 0
	let startY = 0
	let gestureAxis: 'pending' | 'horizontal' | 'vertical' = 'pending'
	let gestureTransitioning = false
	let suppressClick = false
	let suppressClickTimer = 0

	function turnLeft() {
		if (options.isReversed()) return options.next()
		return options.previous()
	}

	function canTurnLeft() {
		if (options.isReversed()) return options.canNext()
		return options.canPrevious()
	}

	function turnRight() {
		if (options.isReversed()) return options.previous()
		return options.next()
	}

	function canTurnRight() {
		if (options.isReversed()) return options.canPrevious()
		return options.canNext()
	}

	function handleReaderPointerDown(event: PointerEvent) {
		if (gestureTransitioning) return
		if (!event.isPrimary || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) return
		pointerId = event.pointerId
		readerSurface = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
		startX = event.clientX
		startY = event.clientY
		gestureAxis = 'pending'
		resetDragPosition()

		try {
			readerSurface?.setPointerCapture(event.pointerId)
		} catch {
			// Pointer capture is an enhancement; the gesture still works without it.
		}
	}

	function handleReaderPointerMove(event: PointerEvent) {
		if (pointerId !== event.pointerId || !readerSurface || gestureAxis === 'vertical') return

		const deltaX = event.clientX - startX
		const deltaY = event.clientY - startY
		const horizontalDistance = Math.abs(deltaX)
		const verticalDistance = Math.abs(deltaY)

		if (gestureAxis === 'pending') {
			if (Math.max(horizontalDistance, verticalDistance) < DIRECTION_LOCK_DISTANCE) return
			if (horizontalDistance > verticalDistance * DIRECTION_LOCK_RATIO) {
				gestureAxis = 'horizontal'
				readerSurface.classList.add('is-reader-dragging')
			} else if (verticalDistance > horizontalDistance * DIRECTION_LOCK_RATIO) {
				gestureAxis = 'vertical'
				return
			} else {
				return
			}
		}

		event.preventDefault()
		readerSurface.style.setProperty('--reader-drag-x', `${getResistedDrag(deltaX, readerSurface.clientWidth)}px`)
	}

	function handleReaderPointerUp(event: PointerEvent) {
		if (pointerId !== event.pointerId) return

		const deltaX = event.clientX - startX
		const deltaY = event.clientY - startY
		const horizontalDistance = Math.abs(deltaX)
		const verticalDistance = Math.abs(deltaY)
		const wasHorizontalDrag = gestureAxis === 'horizontal'

		const isSwipe = wasHorizontalDrag
			&& horizontalDistance >= SWIPE_DISTANCE
			&& horizontalDistance > verticalDistance * SWIPE_AXIS_RATIO
		const isMovedTouch = Math.max(horizontalDistance, verticalDistance) > 12
		if (!isSwipe) {
			finishPointer(event.pointerId)
			if (isMovedTouch) suppressFollowUpClick()
			return
		}

		// Touch browsers may dispatch a click after pointerup. Consume it after
		// either a page swipe or a vertical scroll so neither toggles the controls.
		suppressFollowUpClick()
		const surface = finishPointer(event.pointerId, false)
		if (!surface) return

		const canTurn = deltaX < 0 ? canTurnRight() : canTurnLeft()
		const turnPage = deltaX < 0 ? turnRight : turnLeft
		if (!canTurn) {
			turnPage()
			resetDragPosition(surface)
			return
		}

		void settleCommittedSwipe(surface, deltaX, turnPage).catch((error) => {
			console.error('Failed to change reader page after swipe', error)
		})
	}

	function handleReaderPointerCancel(event: PointerEvent) {
		if (pointerId === event.pointerId) finishPointer(event.pointerId)
	}

	function getResistedDrag(deltaX: number, surfaceWidth: number) {
		const maxDrag = Math.max(surfaceWidth * MAX_DRAG_RATIO, SWIPE_DISTANCE)
		const distance = Math.abs(deltaX)
		if (distance <= maxDrag) return deltaX

		const resistedDistance = maxDrag + (distance - maxDrag) * OVER_DRAG_RESISTANCE
		return Math.sign(deltaX) * Math.min(resistedDistance, surfaceWidth * 0.55)
	}

	function resetDragPosition(surface = readerSurface) {
		surface?.classList.remove('is-reader-dragging', 'is-reader-settling', 'is-reader-resetting')
		surface?.style.setProperty('--reader-drag-x', '0px')
	}

	function finishPointer(id: number, resetPosition = true) {
		const surface = readerSurface
		if (resetPosition) resetDragPosition(surface)

		try {
			if (surface?.hasPointerCapture(id)) surface.releasePointerCapture(id)
		} catch {
			// The browser may already have released capture after pointercancel.
		}

		pointerId = null
		readerSurface = null
		gestureAxis = 'pending'
		return surface
	}

	async function settleCommittedSwipe(
		surface: HTMLElement,
		deltaX: number,
		turnPage: () => false | void | Promise<void>,
	) {
		gestureTransitioning = true
		const pageElement = surface.querySelector<HTMLElement>('.single-page-img-box, .double-page-img-box')
		const renderedOffset = Number.parseFloat(surface.style.getPropertyValue('--reader-drag-x'))
		const currentOffset = Number.isFinite(renderedOffset)
			? renderedOffset
			: getResistedDrag(deltaX, surface.clientWidth)
		const exitDistance = Math.max(surface.clientWidth, window.innerWidth) * Math.sign(deltaX)
		const remainingDistance = exitDistance - currentOffset
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		const exitAnimation = pageElement?.animate(
			[
				{ transform: 'translateX(0)' },
				{ transform: `translateX(${remainingDistance}px)` },
			],
			{
				duration: reducedMotion ? 0 : DRAG_SETTLE_DURATION,
				easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
				fill: 'forwards',
			},
		)
		surface.classList.remove('is-reader-dragging')

		try {
			await exitAnimation?.finished
			// The outgoing page is now fully outside the viewport. Load the next
			// image without the reader's regular Vue transition, then reveal it at
			// the neutral position instead of sliding the old image back.
			await Promise.resolve(turnPage())
			await nextTick()
			surface.classList.add('is-reader-resetting')
			surface.style.setProperty('--reader-drag-x', '0px')
			exitAnimation?.cancel()
			void surface.offsetWidth
			window.requestAnimationFrame(() => surface.classList.remove('is-reader-resetting'))
		} finally {
			exitAnimation?.cancel()
			surface.classList.remove('is-reader-dragging', 'is-reader-settling')
			surface.style.setProperty('--reader-drag-x', '0px')
			gestureTransitioning = false
		}
	}

	function suppressFollowUpClick() {
		suppressClick = true
		window.clearTimeout(suppressClickTimer)
		suppressClickTimer = window.setTimeout(() => {
			suppressClick = false
		}, FOLLOW_UP_CLICK_TIMEOUT)
	}

	function handleReaderClick(event: MouseEvent) {
		if (suppressClick) {
			suppressClick = false
			window.clearTimeout(suppressClickTimer)
			event.preventDefault()
			event.stopPropagation()
			return
		}
		options.toggleControls()
	}

	function isEditableTarget(target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) return false
		return target.isContentEditable || !!target.closest('input, textarea, select, button, [role="slider"]')
	}

	function handleKeydown(event: KeyboardEvent) {
		if (gestureTransitioning) return
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return
		if (isEditableTarget(event.target)) return
		if (document.querySelector('.smanga-backable, .el-overlay')) return

		if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
			event.preventDefault()
			turnLeft()
		} else if (event.key === 'ArrowRight' || event.key === 'PageDown') {
			event.preventDefault()
			turnRight()
		}
	}

	onMounted(() => window.addEventListener('keydown', handleKeydown))
	onUnmounted(() => {
		window.removeEventListener('keydown', handleKeydown)
		window.clearTimeout(suppressClickTimer)
		resetDragPosition()
	})

	return {
		handleReaderClick,
		handleReaderPointerDown,
		handleReaderPointerMove,
		handleReaderPointerUp,
		handleReaderPointerCancel,
	}
}
