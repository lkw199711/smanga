import { ref, shallowReactive } from 'vue'
import { ElMessage } from 'element-plus'

export type BatchKind = 'manga' | 'chapter' | 'collect' | 'history' | 'bookmark' | 'media'
export type BatchId = number | string | null | undefined

export interface BatchRow {
  mangaId?: BatchId
  chapterId?: BatchId
  collectId?: BatchId
  bookmarkId?: BatchId
  mediaId?: BatchId
  mangaName?: string
  chapterName?: string
  mediaName?: string
}

const idKeys = {
  manga: 'mangaId',
  chapter: 'chapterId',
  collect: 'collectId',
  history: 'chapterId',
  bookmark: 'bookmarkId',
  media: 'mediaId',
} as const

let nextBatchOwner = 0

export function useBatchSelection() {
  const owner = `batch-${++nextBatchOwner}`
  const active = ref(false)
  const locked = ref(false)
  const selected = shallowReactive(new Map<number, BatchRow>())

  function exit() {
    selected.clear()
    active.value = false
  }

  function selectPage(kind: BatchKind, rows: BatchRow[]) {
    const validRows = rows.filter((row) => batchRowId(kind, row))
    const allSelected = validRows.every((row) => selected.has(batchRowId(kind, row)))
    for (const row of validRows) {
      const id = batchRowId(kind, row)
      if (allSelected) selected.delete(id)
      else selected.set(id, row)
    }
  }

  function item(kind: BatchKind, row: BatchRow) {
    const id = active.value ? batchRowId(kind, row) : 0
    return {
      active: id > 0,
      id,
      owner,
      selected: id > 0 && selected.has(id),
      label: row.chapterName || row.mangaName || row.mediaName,
      toggle() {
        if (locked.value || !id) return
        if (selected.has(id)) selected.delete(id)
        else selected.set(id, row)
      },
    }
  }

  return { owner, active, locked, selected, exit, selectPage, item }
}

export function batchRowId(kind: BatchKind, row: BatchRow) {
  const id = Number(row[idKeys[kind]])
  return Number.isSafeInteger(id) && id > 0 ? id : 0
}

export type BatchSelection = ReturnType<typeof useBatchSelection>
export type BatchItemBinding = ReturnType<BatchSelection['item']>

export function batchError(error: unknown, fallback: string) {
  const failure = error as { response?: { data?: { message?: string } }; message?: string }
  return failure?.response?.data?.message || failure?.message || fallback
}

export async function refreshBatchList(refresh: () => unknown | Promise<unknown>) {
  try {
    await refresh()
  } catch (error) {
    ElMessage.warning(`操作已提交，刷新列表失败。 ${batchError(error, '')}`)
  }
}

export async function refreshBatchPage(
  load: (page: number) => unknown | Promise<unknown>,
  page: number,
  lastPage: () => number,
) {
  await load(page)
  const last = Math.max(1, lastPage())
  if (page > last) await load(last)
}
