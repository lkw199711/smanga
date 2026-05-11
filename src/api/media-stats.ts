import { ajax } from './index';
import mangaApi from './manga';

// 简单的缓存机制，缓存5分钟
let cache: any[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

const mediaStatsApi = {
	/**
	 * @description: 获取媒体库列表及其漫画数量
	 * @return {*}
	 */
	async getMediaWithCounts() {
		try {
			// 检查缓存是否有效
			const now = Date.now();
			if (cache && (now - cacheTime) < CACHE_DURATION) {
				return cache;
			}
			
			// 获取媒体库列表
			const mediaRes = await ajax.get('media', { params: { page: 1, pageSize: 999 } });
			const mediaList = mediaRes.data?.list || [];
			
			// 并行获取每个媒体库的漫画数量
			const mediaWithCounts = await Promise.all(
				mediaList.map(async (media: any) => {
					try {
						const mangaRes = await mangaApi.get(media.mediaId, 1, 1);
						return {
							...media,
							mangaCount: mangaRes?.count || 0
						};
					} catch (e) {
						return {
							...media,
							mangaCount: 0
						};
					}
				})
			);
			
			// 更新缓存
			cache = mediaWithCounts;
			cacheTime = now;
			
			return mediaWithCounts;
		} catch (e) {
			console.error('获取媒体库漫画数量失败:', e);
			return [];
		}
	},
	
	/**
	 * @description: 清除缓存
	 * @return {*}
	 */
	clearCache() {
		cache = null;
		cacheTime = 0;
	}
};

export default mediaStatsApi;