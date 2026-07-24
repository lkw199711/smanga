import { ref, computed, shallowRef } from 'vue'
import tagApi, { tagItemType } from '@/api/tag'

/**
 * Cache of full tag list to avoid re-fetching every time the editor opens.
 * Shared across all instances in the same session.
 */
const cachedAllTags = shallowRef<tagItemType[] | null>(null)

export function invalidateTagCache() {
  cachedAllTags.value = null
}

/**
 * Composable that manages the assigned / available tag split, search filter,
 * dirty tracking and undo stack for the tag editor UI.
 */
export function useTagPicker(initialAssigned: tagItemType[]) {
  const allTags = ref<tagItemType[]>([])
  const assigned = ref<tagItemType[]>(cloneList(initialAssigned))
  const initialAssignedIds = new Set(initialAssigned.map((t) => t.tagId))
  const search = ref('')
  const loading = ref(false)
  /** Stack of tags recently removed from `assigned`, for undo. */
  const removedStack = ref<tagItemType[]>([])

  async function loadAllTags(force = false) {
    if (!force && cachedAllTags.value) {
      allTags.value = cachedAllTags.value
      return
    }
    loading.value = true
    try {
      const list = (await tagApi.get_nopage()) as tagItemType[]
      cachedAllTags.value = list || []
      allTags.value = cachedAllTags.value
    } catch {
      allTags.value = []
    } finally {
      loading.value = false
    }
  }

  const assignedIds = computed(() => new Set(assigned.value.map((t) => t.tagId)))

  /** All tags not yet assigned.*/
  const available = computed<tagItemType[]>(() =>
    allTags.value.filter((t) => !assignedIds.value.has(t.tagId))
  )

  /** Available tags filtered by search keyword (case-insensitive). */
  const availableFiltered = computed<tagItemType[]>(() => {
    const k = search.value.trim().toLowerCase()
    if (!k) return available.value
    return available.value.filter((t) => t.tagName?.toLowerCase().includes(k))
  })

  /** Whether the current selection differs from the initial one. */
  const dirty = computed(() => {
    if (assigned.value.length !== initialAssignedIds.size) return true
    for (const t of assigned.value) {
      if (!initialAssignedIds.has(t.tagId)) return true
    }
    return false
  })

  function addTag(tag: tagItemType) {
    if (assignedIds.value.has(tag.tagId)) return
    assigned.value.push(tag)
  }

  function removeTag(tag: tagItemType) {
    const idx = assigned.value.findIndex((t) => t.tagId === tag.tagId)
    if (idx >= 0) {
      const [removed] = assigned.value.splice(idx, 1)
      removedStack.value.push(removed)
    }
  }

  function clearAssigned() {
    if (assigned.value.length === 0) return
    removedStack.value.push(...assigned.value)
    assigned.value = []
  }

  function undoRemove(): boolean {
    const last = removedStack.value.pop()
    if (!last) return false
    if (!assignedIds.value.has(last.tagId)) {
      assigned.value.push(last)
    }
    return true
  }

  /** Insert a freshly created tag into both cache and assigned list. */
  function insertNewTag(tag: tagItemType) {
    if (!allTags.value.some((t) => t.tagId === tag.tagId)) {
      allTags.value = [...allTags.value, tag]
      cachedAllTags.value = allTags.value
    }
    if (!assignedIds.value.has(tag.tagId)) {
      assigned.value.push(tag)
    }
  }

  /** Reflect an in-place tag update (rename / recolor) across all lists. */
  function patchTag(tag: tagItemType) {
    const patch = (list: tagItemType[]) => {
      const idx = list.findIndex((t) => t.tagId === tag.tagId)
      if (idx >= 0) list.splice(idx, 1, { ...list[idx], ...tag })
    }
    patch(allTags.value)
    patch(assigned.value)
    if (cachedAllTags.value) {
      const idx = cachedAllTags.value.findIndex((t) => t.tagId === tag.tagId)
      if (idx >= 0) {
        cachedAllTags.value = [
          ...cachedAllTags.value.slice(0, idx),
          { ...cachedAllTags.value[idx], ...tag },
          ...cachedAllTags.value.slice(idx + 1),
        ]
      }
    }
  }

  return {
    // state
    allTags,
    assigned,
    search,
    loading,
    removedStack,
    // derived
    available,
    availableFiltered,
    dirty,
    // actions
    loadAllTags,
    addTag,
    removeTag,
    clearAssigned,
    undoRemove,
    insertNewTag,
    patchTag,
  }
}

function cloneList(list: tagItemType[]): tagItemType[] {
  return list ? list.map((t) => ({ ...t })) : []
}