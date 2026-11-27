import { ajax } from './index'
import mangaApi from './manga'
import chapterApi from './chapter'
import mediaApi from './media'
import bookmarkApi from './bookmark'
import collectApi from './collect'
import useBrowseStore from '@/store/browse'
import type { BatchKind, BatchRow } from '@/themes/composables/use-batch-selection'
import { onMangaOperation } from '@/utils/cache'

export type BatchTagOperation = 'add' | 'remove' | 'replace'

export async function updateBatchTags(
  target: 'manga' | 'chapter',
  ids: number[],
  operation: BatchTagOperation,
  tagIds: number[],
  metaWriteJson: boolean,
) {
  const { data } = await ajax.put<{ code: number; data: { count: number; metadataFailedIds: number[] } }>(
    'manga/batch/tags',
    { target, ids, operation, tagIds, metaWriteJson },
    { timeout: 60_000 },
  )
  onMangaOperation()
  return data.data
}

export async function deleteBatch(
  kind: BatchKind,
  entries: [number, BatchRow][],
  deleteFile: boolean,
) {
  const ids = entries.map(([id]) => id)
  switch (kind) {
    case 'manga':
      return (await mangaApi.batch_delete_manga(ids, deleteFile)).taskIds?.length || 0
    case 'chapter':
      return (await chapterApi.batch_delete_chapter(ids, deleteFile)).taskIds?.length || 0
    case 'media':
      return (await mediaApi.batch_delete_media(ids)).data?.count || 0
    case 'collect':
      return collectApi.batch_remove(entries)
    case 'history': {
      const { data } = await ajax.post('history/batch-delete', { chapterIds: ids })
      return data.data?.count || 0
    }
    case 'bookmark': {
      const response = await bookmarkApi.batch_delete(ids)
      const browse = useBrowseStore()
      const removed = new Set(ids)
      browse.bookmarkList = browse.bookmarkList.filter((item) => !removed.has(Number(item.bookmarkId)))
      return response.data?.count || 0
    }
  }
}
