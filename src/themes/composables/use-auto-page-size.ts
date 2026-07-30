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
import { listDebug } from '@/utils/list-debug'
import type { PageSizeKind } from './use-page-size'

export interface AutoPageSizeOptions {
	kind?: MaybeRefOrGetter<PageSizeKind>
	/** Space kept for the pager below the list, in CSS pixels. */
	bottomReserve?: MaybeRefOrGetter<number>
	/** Expected row height used before real list data exists. */
	estimatedItemHeight?: MaybeRefOrGetter<number>
	maxPageSize?: number
}

const MOBILE_NAV_SELECTOR = [
	'.sa-mobile-nav-bar',
	'.sb-mobile-nav-bar',
	'.sd-mobile-nav-bar',
].join(',')

let autoPageSizeDebugSequence = 0

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

function cssLengthToPixels(value: string, element: HTMLElement) {
	const match = value.trim().match(/^([\d.]+)(px|rem|em)$/)
	if (!match) return 0
	const amount = Number(match[1])
	if (!Number.isFinite(amount)) return 0
	if (match[2] === 'px') return amount
	if (match[2] === 'rem') {
		return amount * finitePixel(getComputedStyle(document.documentElement).fontSize)
	}
	return amount * finitePixel(getComputedStyle(element).fontSize)
}

function countResolvedGridTracks(template: string) {
	if (!template || template === 'none' || template.includes('repeat(')) return 0
	let depth = 0
	let count = 0
	let inTrack = false
	for (const char of template.trim()) {
		if (char === '(') depth += 1
		if (char === ')') depth = Math.max(0, depth - 1)
		if (/\s/.test(char) && depth === 0) {
			if (inTrack) count += 1
			inTrack = false
		} else {
			inTrack = true
		}
	}
	return count + (inTrack ? 1 : 0)
}

function gridColumnCount(
	element: HTMLElement,
	style: CSSStyleDeclaration,
	columnGap: number,
	rects: DOMRect[],
) {
	if (style.display !== 'grid') return 1

	const template = style.gridTemplateColumns
	const fixedRepeat = template.match(/repeat\(\s*(\d+)\s*,/)
	if (fixedRepeat) return Math.max(1, Number(fixedRepeat[1]))

	const autoRepeat = template.match(
		/repeat\(\s*auto-(?:fill|fit)\s*,\s*minmax\(\s*([\d.]+(?:px|rem|em))/,
	)
	if (autoRepeat) {
		const minimumWidth = cssLengthToPixels(autoRepeat[1], element)
		if (minimumWidth > 0) {
			return Math.max(
				1,
				Math.floor((element.clientWidth + columnGap) / (minimumWidth + columnGap)),
			)
		}
	}

	const resolvedTracks = countResolvedGridTracks(template)
	if (resolvedTracks > 0) return resolvedTracks
	if (rects.length) return firstRowColumnCount(rects)
	return 1
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
	const debugId = `auto-size#${++autoPageSizeDebugSequence}`
	const autoPageSize = ref(0)
	const measurementReady = ref(false)
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
			measurementReady.value = true
			listDebug('measure.fixed-preference', { id: debugId, kind })
			return
		}

		const element = container.value
		if (!element?.isConnected || element.clientWidth <= 0) {
			measurementReady.value = false
			listDebug('measure.blocked', {
				id: debugId,
				hasContainer: Boolean(element),
				connected: Boolean(element?.isConnected),
				clientWidth: element?.clientWidth || 0,
			})
			return
		}

		const children = Array.from(element.children).filter(
			(child): child is HTMLElement =>
				child instanceof HTMLElement && getComputedStyle(child).display !== 'none',
		)
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

		const columns = gridColumnCount(element, elementStyle, columnGap, rects)
		const estimatedWidth = Math.max(
			1,
			(elementWidth - Math.max(0, columns - 1) * columnGap) / columns,
		)
		const renderedHeight = rects.length
			? Math.max(...rects.map(rect => rect.height), 1)
			: 0
		const renderedWidth = rects.length
			? Math.max(1, Math.min(...rects.map(rect => rect.width)))
			: estimatedWidth
		const configuredItemHeight = Number(toValue(options.estimatedItemHeight))
		const fallbackItemHeight = Number.isFinite(configuredItemHeight) && configuredItemHeight > 0
			? configuredItemHeight
			: 96
		const safeHeight = kind === 'manga'
			? Math.max(renderedHeight, renderedWidth * 4 / 3 + 82)
			: Math.max(renderedHeight, fallbackItemHeight)
		largestItemHeight = Math.max(largestItemHeight, safeHeight)

		const scrollPort = findScrollPort(element)
		const viewportBottom = window.visualViewport?.height || window.innerHeight
		const elementTop = element.getBoundingClientRect().top
		const scrollPortRect = scrollPort?.getBoundingClientRect()
		const layoutTop = Math.max(elementTop, scrollPortRect?.top || 0)
		const layoutBottom = Math.min(viewportBottom, scrollPortRect?.bottom || viewportBottom)
		const layoutHeight = Math.max(0, layoutBottom - layoutTop)
		const rootFontSize = finitePixel(getComputedStyle(document.documentElement).fontSize) || 10
		const configuredReserve = Number(toValue(options.bottomReserve))
		const bottomReserve = Number.isFinite(configuredReserve) && configuredReserve >= 0
			? configuredReserve
			: rootFontSize * 10
		const usableHeight = Math.max(
			largestItemHeight,
			layoutHeight - bottomReserve - visibleMobileNavHeight(),
		)
		const rows = Math.max(
			1,
			Math.floor((usableHeight + rowGap) / (largestItemHeight + rowGap)),
		)
		const maximum = Math.max(columns, options.maxPageSize || (kind === 'manga' ? 120 : 200))
		const nextSize = Math.min(maximum, Math.max(columns, columns * rows))

		if (nextSize !== autoPageSize.value) autoPageSize.value = nextSize
		measurementReady.value = true
		listDebug('measure.ready', {
			id: debugId,
			kind,
			elementClientWidth: element.clientWidth,
			childCount: children.length,
			renderedHeight,
			renderedWidth,
			largestItemHeight,
			columns,
			rows,
			layoutHeight,
			nextSize,
		})
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
			Number(toValue(options.estimatedItemHeight)),
		],
		() => {
			largestItemHeight = 0
			measurementReady.value = false
			scheduleMeasure(0)
		},
	)

	onMounted(() => {
		listDebug('measure.mounted', {
			id: debugId,
			hasContainer: Boolean(container.value),
		})
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

	return {
		autoPageSize,
		measurementReady,
		recalculate: () => {
			measurementReady.value = false
			scheduleMeasure(0)
		},
	}
}
