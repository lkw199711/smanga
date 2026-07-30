import {
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	toValue,
	watch,
	type MaybeRefOrGetter,
	type Ref,
} from 'vue'
import { preferencesStore } from '@/store/preferences'
import type { PageSizeKind } from './use-page-size'

export interface AutoPageSizeOptions {
	kind?: MaybeRefOrGetter<PageSizeKind>
	/** Space kept for the pager below the list, in CSS pixels. */
	bottomReserve?: MaybeRefOrGetter<number>
	maxPageSize?: number
}

const MOBILE_NAV_SELECTOR = [
	'.sa-mobile-nav-bar',
	'.sb-mobile-nav-bar',
	'.sd-mobile-nav-bar',
].join(',')

function finitePixel(value: string) {
	const number = Number.parseFloat(value)
	return Number.isFinite(number) ? number : 0
}

function currentKind(kind: MaybeRefOrGetter<PageSizeKind> | undefined): PageSizeKind {
	return kind ? toValue(kind) : 'chapter'
}

function hasFixedPreference(kind: PageSizeKind) {
	const value = kind === 'manga'
		? preferencesStore.mangaPageSize
		: preferencesStore.chapterPageSize
	return Number(value) > 0
}

function findScrollPort(element: HTMLElement): HTMLElement | null {
	let parent = element.parentElement
	while (parent) {
		const overflowY = getComputedStyle(parent).overflowY
		if (overflowY === 'auto' || overflowY === 'scroll') return parent
		parent = parent.parentElement
	}
	return null
}

function visibleMobileNavHeight() {
	const nav = document.querySelector<HTMLElement>(MOBILE_NAV_SELECTOR)
	if (!nav) return 0
	const style = getComputedStyle(nav)
	if (style.display === 'none' || style.visibility === 'hidden') return 0
	const rect = nav.getBoundingClientRect()
	return rect.height > 0 ? rect.height : 0
}

function firstRowColumnCount(rects: DOMRect[]) {
	if (!rects.length) return 1
	const firstTop = rects[0].top
	return Math.max(1, rects.filter(rect => Math.abs(rect.top - firstTop) < 2).length)
}

/**
 * Calculates a page size from the rendered list rather than viewport
 * breakpoints. A value of 0 means that there is not enough rendered
 * information yet, or that the user selected a fixed page size.
 */
export function useAutoPageSize(
	container: Ref<HTMLElement | null>,
	options: AutoPageSizeOptions = {},
) {
	const autoPageSize = ref(0)
	let resizeObserver: ResizeObserver | null = null
	let mutationObserver: MutationObserver | null = null
	let observedScrollPort: HTMLElement | null = null
	let timer = 0
	let largestItemHeight = 0
	let measuredWidth = 0

	function disconnectObservers() {
		resizeObserver?.disconnect()
		mutationObserver?.disconnect()
		resizeObserver = null
		mutationObserver = null
		observedScrollPort = null
	}

	function measure() {
		const kind = currentKind(options.kind)
		if (hasFixedPreference(kind)) {
			autoPageSize.value = 0
			return
		}

		const element = container.value
		if (!element?.isConnected) return

		const children = Array.from(element.children).filter(
			(child): child is HTMLElement =>
				child instanceof HTMLElement && getComputedStyle(child).display !== 'none',
		)
		if (!children.length) return

		const elementStyle = getComputedStyle(element)
		const rects = children.map(child => child.getBoundingClientRect())
		const rowGap = finitePixel(elementStyle.rowGap)
		const columnGap = finitePixel(elementStyle.columnGap)
		const elementWidth = element.clientWidth

		// Card height changes with its width. Do not retain a measurement from a
		// previous column layout after the container width changes.
		if (Math.abs(elementWidth - measuredWidth) > 1) {
			largestItemHeight = 0
			measuredWidth = elementWidth
		}

		const renderedHeight = Math.max(...rects.map(rect => rect.height), 1)
		const renderedWidth = Math.max(1, Math.min(...rects.map(rect => rect.width)))
		const safeHeight = kind === 'manga'
			? Math.max(renderedHeight, renderedWidth * 4 / 3 + 58)
			: renderedHeight
		largestItemHeight = Math.max(largestItemHeight, safeHeight)

		let columns = 1
		if (elementStyle.display === 'grid') {
			const visibleColumns = firstRowColumnCount(rects)
			const estimatedColumns = Math.max(
				1,
				Math.floor((elementWidth + columnGap) / (renderedWidth + columnGap)),
			)
			columns = Math.max(visibleColumns, estimatedColumns)
		}

		const scrollPort = findScrollPort(element)
		const viewportHeight = scrollPort
			? scrollPort.clientHeight
			: (window.visualViewport?.height || window.innerHeight)
		const rootFontSize = finitePixel(getComputedStyle(document.documentElement).fontSize) || 10
		const configuredReserve = Number(toValue(options.bottomReserve))
		const bottomReserve = Number.isFinite(configuredReserve) && configuredReserve >= 0
			? configuredReserve
			: rootFontSize * 10
		const usableHeight = Math.max(
			largestItemHeight,
			viewportHeight - bottomReserve - visibleMobileNavHeight(),
		)
		const rows = Math.max(
			1,
			Math.floor((usableHeight + rowGap) / (largestItemHeight + rowGap)),
		)
		const maximum = Math.max(columns, options.maxPageSize || (kind === 'manga' ? 120 : 200))
		const nextSize = Math.min(maximum, Math.max(columns, columns * rows))

		if (nextSize !== autoPageSize.value) autoPageSize.value = nextSize
	}

	function scheduleMeasure(delay = 80) {
		window.clearTimeout(timer)
		timer = window.setTimeout(measure, delay)
	}

	function connectObservers() {
		disconnectObservers()
		const element = container.value
		if (!element) return

		observedScrollPort = findScrollPort(element)
		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => scheduleMeasure(120))
			resizeObserver.observe(element)
			if (observedScrollPort && observedScrollPort !== element) {
				resizeObserver.observe(observedScrollPort)
			}
		}

		if (typeof MutationObserver !== 'undefined') {
			mutationObserver = new MutationObserver(() => scheduleMeasure(0))
			mutationObserver.observe(element, { childList: true, subtree: true })
		}
		scheduleMeasure(0)
	}

	function handleViewportResize() {
		scheduleMeasure(120)
	}

	watch(container, () => nextTick(connectObservers), { flush: 'post' })
	watch(
		() => [
			currentKind(options.kind),
			preferencesStore.mangaPageSize,
			preferencesStore.chapterPageSize,
			Number(toValue(options.bottomReserve)),
		],
		() => {
			largestItemHeight = 0
			scheduleMeasure(0)
		},
	)

	onMounted(() => {
		void nextTick(connectObservers)
		window.addEventListener('resize', handleViewportResize)
		window.visualViewport?.addEventListener('resize', handleViewportResize)
		void document.fonts?.ready.then(() => scheduleMeasure(0))
	})

	onBeforeUnmount(() => {
		window.clearTimeout(timer)
		disconnectObservers()
		window.removeEventListener('resize', handleViewportResize)
		window.visualViewport?.removeEventListener('resize', handleViewportResize)
	})

	return { autoPageSize, recalculate: () => scheduleMeasure(0) }
}
