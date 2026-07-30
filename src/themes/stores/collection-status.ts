import {defineStore} from 'pinia';
import collectApi from '@/api/collect';
import {sessionStore} from '@/store/session';

let pendingLoad: Promise<void> | null = null;
let pendingScope = '';

function currentScope() {
	return `${sessionStore.serverKey}:${sessionStore.userId}`;
}

export const useCollectionStatusStore = defineStore('theme-collection-status', {
	state: () => ({
		scope: '',
		loaded: false,
		loading: false,
		mangaIds: {} as Record<number, true>,
		chapterIds: {} as Record<number, true>,
		mangaOverrides: {} as Record<number, boolean>,
		chapterOverrides: {} as Record<number, boolean>,
	}),

	actions: {
		syncScope() {
			const scope = currentScope();
			if (this.scope === scope) return scope;

			this.scope = scope;
			this.loaded = false;
			this.loading = false;
			this.mangaIds = {};
			this.chapterIds = {};
			this.mangaOverrides = {};
			this.chapterOverrides = {};
			return scope;
		},

		async ensureLoaded() {
			const scope = this.syncScope();
			if (!sessionStore.isAuthenticated || this.loaded) return;
			if (pendingLoad && pendingScope === scope) return pendingLoad;

			this.loading = true;
			pendingScope = scope;
			const load = (async () => {
				try {
					const response = await collectApi.get_all();
					if (currentScope() !== scope) return;

					const list = Array.isArray(response?.list)
						? response.list
						: Array.isArray(response?.data?.list)
							? response.data.list
							: [];
					const mangaIds: Record<number, true> = {};
					for (const item of list) {
						const mangaId = Number(item?.mangaId);
						if (
							item?.collectType === 'manga' &&
							Number.isInteger(mangaId) &&
							mangaId > 0
						) {
							mangaIds[mangaId] = true;
						}
					}
					const chapterIds: Record<number, true> = {};
					for (const item of list) {
						const chapterId = Number(item?.chapterId);
						if (
							item?.collectType === 'chapter' &&
							Number.isInteger(chapterId) &&
							chapterId > 0
						) {
							chapterIds[chapterId] = true;
						}
					}
					for (const [mangaId, collected] of Object.entries(this.mangaOverrides)) {
						if (collected) {
							mangaIds[Number(mangaId)] = true;
						} else {
							delete mangaIds[Number(mangaId)];
						}
					}
					for (const [chapterId, collected] of Object.entries(this.chapterOverrides)) {
						if (collected) {
							chapterIds[Number(chapterId)] = true;
						} else {
							delete chapterIds[Number(chapterId)];
						}
					}

					this.mangaIds = mangaIds;
					this.chapterIds = chapterIds;
					this.loaded = true;
				} catch {
					if (currentScope() === scope) {
						this.loaded = false;
					}
				} finally {
					if (this.scope === scope) this.loading = false;
				}
			})();

			pendingLoad = load;
			try {
				await load;
			} finally {
				if (pendingLoad === load) {
					pendingLoad = null;
					pendingScope = '';
				}
			}
		},

		isMangaCollected(mangaId: number) {
			this.syncScope();
			return Boolean(this.mangaIds[mangaId]);
		},

		setMangaCollected(mangaId: number, collected: boolean) {
			if (!Number.isInteger(mangaId) || mangaId <= 0) return;
			this.syncScope();
			this.mangaOverrides[mangaId] = collected;

			if (collected) {
				this.mangaIds[mangaId] = true;
			} else {
				delete this.mangaIds[mangaId];
			}
		},

		isChapterCollected(chapterId: number) {
			this.syncScope();
			return Boolean(this.chapterIds[chapterId]);
		},

		setChapterCollected(chapterId: number, collected: boolean) {
			if (!Number.isInteger(chapterId) || chapterId <= 0) return;
			this.syncScope();
			this.chapterOverrides[chapterId] = collected;

			if (collected) {
				this.chapterIds[chapterId] = true;
			} else {
				delete this.chapterIds[chapterId];
			}
		},
	},
});

collectApi.on_manga_collection_changed((mangaId, collected) => {
	const store = useCollectionStatusStore();
	store.setMangaCollected(mangaId, collected);
});

collectApi.on_chapter_collection_changed((chapterId, collected) => {
	const store = useCollectionStatusStore();
	store.setChapterCollected(chapterId, collected);
});
