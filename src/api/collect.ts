import {ajax} from './index';

type MangaCollectionListener = (mangaId: number, collected: boolean) => void;
type ChapterCollectionListener = (chapterId: number, collected: boolean) => void;
const mangaCollectionListeners = new Set<MangaCollectionListener>();
const chapterCollectionListeners = new Set<ChapterCollectionListener>();

function notifyMangaCollectionChanged(mangaId: number, collected: boolean) {
	for (const listener of mangaCollectionListeners) {
		listener(mangaId, collected);
	}
}

function notifyChapterCollectionChanged(chapterId: number, collected: boolean) {
	for (const listener of chapterCollectionListeners) {
		listener(chapterId, collected);
	}
}

const collectApi = {
	async get_all() {
		const http = await ajax.get('collect');
		return http.data;
	},

	async get(mangaType: string, page: number, pageSize: number, order: string) {
		const http = await ajax.get(`collect-${mangaType}`, {
			params: {page, pageSize, order},
		});

		const response = http.data;

		return response;
	},
	/**
	 * @description: 查询漫画/章节 是否收藏
	 * @param {string} collectType
	 * @param {number} targetId
	 * @return {*}
	 */
	async is_collect(collectType: string, targetId: number) {
		const http = await ajax.get(`${collectType}-iscollect/${targetId}`, {
			params: {
				collectType,
				targetId,
			},
		});
		const response = http.data;
		return response.data;
	},
	/**
	 * @description: 移除漫画/章节 收藏
	 * @param {string} collectType
	 * @param {number} targetId
	 * @return {*}
	 */
	async remove_collect(collectType: string, targetId: number) {
		const res = ajax.post(`collect-${collectType}/${targetId}`, {});
		const response = (await res).data;
		if (collectType === 'manga') {
			notifyMangaCollectionChanged(targetId, false);
		} else if (collectType === 'chapter') {
			notifyChapterCollectionChanged(targetId, false);
		}
		return response;
	},
	/**
	 * @description: 新增收藏
	 * @param {any} data
	 * @return {*}
	 */
	async add_collect(data: any) {
		const http = await ajax.post(
			`collect-${data.collectType}/${data.mangaId}`,
			data
		);
		const response = http.data;
		notifyMangaCollectionChanged(Number(data.mangaId), true);
		return response.data;
	},

	/**
	 * @description: 新增收藏
	 * @param {any} data
	 * @return {*}
	 */
	async add_chapter_collect(collectType: string, chapterId: number, data: any) {
		const http = await ajax.post(
			`collect-${collectType}/${chapterId}`,
			data
		);
		const response = http.data;
		notifyChapterCollectionChanged(chapterId, true);
		return response.data;
	},

	on_manga_collection_changed(listener: MangaCollectionListener) {
		mangaCollectionListeners.add(listener);
		return () => mangaCollectionListeners.delete(listener);
	},

	on_chapter_collection_changed(listener: ChapterCollectionListener) {
		chapterCollectionListeners.add(listener);
		return () => chapterCollectionListeners.delete(listener);
	},
};

export default collectApi;
