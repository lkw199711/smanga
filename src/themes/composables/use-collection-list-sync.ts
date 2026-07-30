import {onScopeDispose, type Ref} from 'vue';
import collectApi from '@/api/collect';

type CollectionType = 'manga' | 'chapter';

export function useCollectionListSync(
	list: Ref<any[]>,
	count: Ref<number>,
	activeType: () => CollectionType
) {
	const removeItem = (type: CollectionType, targetId: number) => {
		if (activeType() !== type) return;

		const idKey = type === 'manga' ? 'mangaId' : 'chapterId';
		const index = list.value.findIndex(
			(item) => Number(item?.[idKey]) === targetId
		);
		if (index < 0) return;

		list.value.splice(index, 1);
		count.value = Math.max(0, count.value - 1);
	};

	const unsubscribeManga = collectApi.on_manga_collection_changed(
		(mangaId, collected) => {
			if (!collected) removeItem('manga', mangaId);
		}
	);
	const unsubscribeChapter = collectApi.on_chapter_collection_changed(
		(chapterId, collected) => {
			if (!collected) removeItem('chapter', chapterId);
		}
	);

	onScopeDispose(() => {
		unsubscribeManga();
		unsubscribeChapter();
	});
}
