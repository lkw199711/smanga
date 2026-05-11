import mediaStatsApi from '@/api/media-stats';

/**
 * 清除媒体库统计缓存
 */
export function clearMediaStatsCache() {
	mediaStatsApi.clearCache();
}

/**
 * 在媒体库操作后清除缓存
 */
export function onMediaOperation() {
	clearMediaStatsCache();
}

/**
 * 在漫画操作后清除缓存
 */
export function onMangaOperation() {
	clearMediaStatsCache();
}

export default {
	clearMediaStatsCache,
	onMediaOperation,
	onMangaOperation
};