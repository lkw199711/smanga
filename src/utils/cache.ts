import mediaStatsApi from '@/api/media-stats';

type MediaOperationListener = () => void | Promise<void>;

const mediaOperationListeners = new Set<MediaOperationListener>();

/**
 * 清除媒体库统计缓存
 */
export function clearMediaStatsCache() {
	mediaStatsApi.clearCache();
}

/**
 * 在媒体库操作后清除缓存
 */
export function onMediaOperation(listener: MediaOperationListener): () => void;
export function onMediaOperation(): void;
export function onMediaOperation(listener?: MediaOperationListener) {
	if (listener) {
		mediaOperationListeners.add(listener);
		return () => mediaOperationListeners.delete(listener);
	}

	clearMediaStatsCache();
	for (const registeredListener of mediaOperationListeners) {
		Promise.resolve()
			.then(() => registeredListener())
			.catch(error => console.error('媒体库列表刷新失败', error));
	}
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
