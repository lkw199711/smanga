<template>
  <Teleport to="body">
    <div v-if="themeContextMenu.visible && themeContextMenu.presentation === 'menu'" class="tcm-backdrop" @mousedown.self="closeThemeContextMenu">
      <div ref="menuEl" class="tcm-menu" :style="[positionStyle, skinStyle]" role="menu" @contextmenu.prevent>
        <div class="tcm-title">{{ title }}</div>
        <button v-for="action in actions" :key="action.key" class="tcm-action" :class="{ danger: action.danger }" :disabled="busy"
          role="menuitem" @click="run(action.key)">
          <span class="tcm-action-icon" aria-hidden="true">{{ action.icon }}</span>
          {{ action.label }}
        </button>
      </div>
    </div>
    <div v-if="themeContextMenu.visible && themeContextMenu.presentation === 'sheet'" class="tcm-sheet-backdrop" @click.self="closeThemeContextMenu">
      <section class="tcm-sheet" :style="skinStyle" role="dialog" aria-modal="true" :aria-label="`${title}操作`">
        <div class="tcm-sheet-handle" />
        <div class="tcm-sheet-title">{{ title }}</div>
        <button v-for="action in actions" :key="action.key" class="tcm-sheet-action" :class="{ danger: action.danger }" :disabled="busy"
          type="button" @click="run(action.key)">
          <span class="tcm-sheet-action-icon" aria-hidden="true">{{ action.icon }}</span>
          <span>{{ action.label }}</span>
        </button>
        <button class="tcm-sheet-cancel" type="button" @click="closeThemeContextMenu">取消</button>
      </section>
    </div>
  </Teleport>

  <manga-modify v-if="themeContextMenu.target === 'manga'" v-model:editMangaDialog="editMangaDialog" :manga-info="item" @reload="finishDialog" />
  <chapter-modify v-if="themeContextMenu.target === 'chapter'" v-model:editChapterDialog="editChapterDialog" :chapter-info="item" @close="editChapterDialog = false" @reload="finishDialog" />
  <media-edit v-if="themeContextMenu.target === 'media'" v-model:editMediaDialog="editMediaDialog" edit-model="modify" :media-info="item" @reload="finishDialog" />

  <el-dialog v-model="editTagsDialog" title="编辑标签" width="min(92vw, 680px)">
    <manga-tag-box :key="tagsDialogKey" :manga-id="item.mangaId" :tags="item.tags || []" @update_tags="updateTags" @close_dialog="editTagsDialog = false" />
  </el-dialog>
  <el-dialog v-model="shareDialog" title="创建分享链接" width="min(92vw, 680px)">
    <manga-share :manga-info="themeContextMenu.target === 'manga' ? item : undefined" :media-info="themeContextMenu.target === 'media' ? item : undefined" @close_dialog="finishDialog" />
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
import mediaApi from '@/api/media'
import collectApi from '@/api/collect'
import historyApi from '@/api/history'
import latestApi from '@/api/latest'
import { Cookies } from '@/utils'
import { closeThemeContextMenu, notifyThemeContextMenuChanged, themeContextMenu } from '@/themes/context-menu'
import { themeState } from '@/themes/store'
import MangaModify from '@/views/manga-manage/components/mangaModify.vue'
import ChapterModify from '@/views/chapter-manage/components/chapterModify.vue'
import MediaEdit from '@/views/media-manage/components/mediaEdit.vue'
import MangaTagBox from '@/views/manga-info/components/manga-tag-box.vue'
import MangaShare from '@/components/share.vue'

type Action = { key: string; label: string; icon: string; danger?: boolean }
const menuEl = ref<HTMLElement>()
const busy = ref(false)
const collected = ref(false)
const editMangaDialog = ref(false)
const editChapterDialog = ref(false)
const editMediaDialog = ref(false)
const editTagsDialog = ref(false)
const shareDialog = ref(false)
const tagsDialogKey = ref(0)
const isAdmin = computed(() => Cookies.getRole() === 'admin')
const item = computed(() => themeContextMenu.item || {})
const title = computed(() => item.value.mangaName || item.value.chapterName || item.value.mediaName || '操作菜单')
const positionStyle = ref<Record<string, string>>({ left: '0px', top: '0px' })
const skinStyle = computed<Record<string, string>>(() => {
  if (themeState.current === 'B') return { '--tcm-bg': 'rgba(255, 255, 255, .96)', '--tcm-text': '#1f2937', '--tcm-border': 'rgba(0, 0, 0, .1)', '--tcm-hover': '#f8e7f0' }
  if (themeState.current === 'D') return { '--tcm-bg': '#161a20', '--tcm-text': '#e6e8eb', '--tcm-border': '#2a313c', '--tcm-hover': '#252b35' }
  return { '--tcm-bg': '#fff', '--tcm-text': '#171717', '--tcm-border': '#e5e7eb', '--tcm-hover': '#f3f4f6' }
})

const actions = computed<Action[]>(() => {
  const common: Action[] = [{ key: 'collect', label: collected.value ? '取消收藏' : '收藏', icon: collected.value ? '★' : '☆' }]
  if (themeContextMenu.target === 'manga') {
    return [
      ...common,
      { key: 'read', label: Number(item.value.unWatched) === 0 ? '标记为未读' : '标记为已读', icon: Number(item.value.unWatched) === 0 ? '○' : '✓' },
      ...(isAdmin.value ? [{ key: 'scan', label: '扫描漫画', icon: '↻' }, { key: 'meta', label: '刷新元数据', icon: '⟳' }] : []),
      ...(isAdmin.value ? [{ key: 'tags', label: '编辑标签', icon: '🏷' }, { key: 'share', label: '创建分享链接', icon: '↗' }, { key: 'edit', label: '编辑漫画', icon: '✎' }] : []),
      { key: 'compress-all', label: '解压全部章节', icon: '⇩' },
      { key: 'compress-delete', label: '删除全部解压记录', icon: '⌫' },
      ...(isAdmin.value ? [{ key: 'remove', label: '移除记录', icon: '⊖', danger: true }, { key: 'delete', label: '删除实体文件', icon: '🗑', danger: true }] : []),
    ]
  }
  if (themeContextMenu.target === 'chapter') {
    return [
      ...common,
      { key: 'read', label: item.value.latest?.finish ? '标记为未读' : '标记为已读', icon: item.value.latest?.finish ? '○' : '✓' },
      ...(isAdmin.value ? [{ key: 'edit', label: '编辑章节', icon: '✎' }] : []),
      { key: 'compress-delete', label: '删除解压记录', icon: '⌫' },
      ...(isAdmin.value ? [{ key: 'remove', label: '移除记录', icon: '⊖', danger: true }, { key: 'delete', label: '删除实体文件', icon: '🗑', danger: true }] : []),
    ]
  }
  return isAdmin.value
    ? [{ key: 'scan', label: '扫描媒体库', icon: '↻' }, { key: 'share', label: '创建分享链接', icon: '↗' }, { key: 'edit', label: '编辑媒体库', icon: '✎' }, { key: 'remove', label: '移除记录', icon: '⊖', danger: true }, { key: 'delete', label: '删除实体文件', icon: '🗑', danger: true }]
    : []
})

watch(() => [themeContextMenu.visible, themeContextMenu.target, item.value?.mangaId, item.value?.chapterId] as const, async ([visible, target]) => {
  if (!visible || !item.value) return
  if (target === 'manga') collected.value = await collectApi.is_collect('manga', item.value.mangaId)
  if (target === 'chapter') collected.value = await collectApi.is_collect('chapter', item.value.chapterId)
  await nextTick()
  placeMenu()
})

function placeMenu() {
  const el = menuEl.value
  if (!el) return
  const padding = 8
  const left = Math.min(themeContextMenu.x, window.innerWidth - el.offsetWidth - padding)
  const top = Math.min(themeContextMenu.y, window.innerHeight - el.offsetHeight - padding)
  positionStyle.value = { left: `${Math.max(padding, left)}px`, top: `${Math.max(padding, top)}px` }
}

async function confirm(message: string) {
  try {
    await ElMessageBox.confirm(message, '请确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    return true
  } catch { return false }
}

async function run(key: string) {
  const data = item.value
  if (!data || busy.value) return
  if (key === 'tags') {
    tagsDialogKey.value += 1
    editTagsDialog.value = true
    closeThemeContextMenu()
    return
  }
  if (key === 'share') {
    shareDialog.value = true
    closeThemeContextMenu()
    return
  }
  if (key === 'edit') {
    if (themeContextMenu.target === 'manga') editMangaDialog.value = true
    if (themeContextMenu.target === 'chapter') editChapterDialog.value = true
    if (themeContextMenu.target === 'media') editMediaDialog.value = true
    closeThemeContextMenu()
    return
  }
  busy.value = true
  try {
    if (key === 'remove' && !(await confirm('仅移除 Smanga 中的记录，不删除磁盘文件。'))) return
    if (key === 'delete' && !(await confirm('将删除记录及对应实体文件，此操作不可恢复。'))) return
    if (themeContextMenu.target === 'manga') await runManga(key, data)
    if (themeContextMenu.target === 'chapter') await runChapter(key, data)
    if (themeContextMenu.target === 'media') await runMedia(key, data)
    notifyThemeContextMenuChanged(themeContextMenu.target)
    closeThemeContextMenu()
  } catch (error) {
    ElMessage.error('操作失败，请稍后重试')
  } finally { busy.value = false }
}

async function runManga(key: string, data: any) {
  const id = data.mangaId
  if (key === 'collect') {
    if (collected.value) await collectApi.remove_collect('manga', id)
    else await collectApi.add_collect({ ...data, collectType: 'manga', chapterId: -1, chapterName: null })
  } else if (key === 'read') {
    if (Number(data.unWatched) === 0) await historyApi.unread_all_chapters(id)
    else await historyApi.read_all_chapters(id)
  } else if (key === 'scan') await mangaApi.scan(id)
  else if (key === 'meta') await mangaApi.reload_meta(id)
  else if (key === 'compress-all') await mangaApi.compress_all(id)
  else if (key === 'compress-delete') await mangaApi.compress_delete(id)
  else if (key === 'remove') await mangaApi.delete_manga(id)
  else if (key === 'delete') await mangaApi.delete_manga(id, true)
}

async function runChapter(key: string, data: any) {
  const id = data.chapterId
  if (key === 'collect') {
    if (collected.value) await collectApi.remove_collect('chapter', id)
    else await collectApi.add_chapter_collect('chapter', id, data)
  } else if (key === 'read') {
    if (data.latest?.finish) { await historyApi.delete(id); await latestApi.delete(id) }
    else { await historyApi.add(data); await latestApi.add({ chapterId: id, mangaId: data.mangaId, finish: true, page: 0, count: 0 }) }
  } else if (key === 'compress-delete') await chapterApi.compress_delete(id)
  else if (key === 'remove') await chapterApi.delete_chapter(id)
  else if (key === 'delete') await chapterApi.delete_chapter(id, true)
}

async function runMedia(key: string, data: any) {
  if (key === 'scan') await mediaApi.scan(data.mediaId)
  else if (key === 'remove') await mediaApi.delete_media(data.mediaId)
  else if (key === 'delete') await mediaApi.delete_media(data.mediaId, true)
}

function updateTags(tags: any[]) {
  item.value.tags = tags
  finishDialog()
}

function finishDialog() {
  editMangaDialog.value = false
  editChapterDialog.value = false
  editMediaDialog.value = false
  editTagsDialog.value = false
  shareDialog.value = false
  notifyThemeContextMenuChanged(themeContextMenu.target)
}

function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') closeThemeContextMenu() }
function onViewportChange() { closeThemeContextMenu() }
onMounted(() => { window.addEventListener('keydown', onKeydown); window.addEventListener('resize', onViewportChange); window.addEventListener('scroll', onViewportChange, true) })
onBeforeUnmount(() => { window.removeEventListener('keydown', onKeydown); window.removeEventListener('resize', onViewportChange); window.removeEventListener('scroll', onViewportChange, true) })
</script>

<style scoped>
.tcm-backdrop { position: fixed; inset: 0; z-index: 3000; }
.tcm-menu { position: fixed; width: 196px; padding: 6px; overflow: hidden; border: 1px solid var(--tcm-border, rgba(0,0,0,.12)); border-radius: 12px; background: var(--tcm-bg, #fff); color: var(--tcm-text, #1f2937); box-shadow: 0 12px 30px rgba(0,0,0,.18); }
.tcm-title { padding: 8px 10px; overflow: hidden; font-size: 12px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; opacity: .65; }
.tcm-action { display: flex; align-items: center; width: 100%; padding: 9px 10px; border: 0; border-radius: 8px; background: transparent; color: inherit; text-align: left; font: inherit; font-size: 13px; cursor: pointer; }
.tcm-action-icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; margin-right: 7px; font-size: 16px; line-height: 1; }
.tcm-action:hover:not(:disabled) { background: var(--tcm-hover, #f3f4f6); }
.tcm-action.danger { color: #dc2626; }
.tcm-action:disabled { cursor: wait; opacity: .55; }
.tcm-sheet-backdrop { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .38); }
.tcm-sheet { width: 100%; padding: 8px 12px calc(12px + env(safe-area-inset-bottom)); border-radius: 20px 20px 0 0; background: var(--tcm-bg, #fff); color: var(--tcm-text, #1f2937); box-shadow: 0 -8px 24px rgba(0,0,0,.16); animation: tcm-sheet-in .18s ease-out; }
.tcm-sheet-handle { width: 36px; height: 4px; margin: 2px auto 12px; border-radius: 999px; background: currentColor; opacity: .2; }
.tcm-sheet-title { padding: 0 10px 10px; overflow: hidden; font-size: 14px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.tcm-sheet-action { display: flex; align-items: center; width: 100%; min-height: 52px; padding: 10px 12px; border: 0; border-radius: 12px; background: transparent; color: inherit; font: inherit; font-size: 16px; text-align: left; }
.tcm-sheet-action:active { background: var(--tcm-hover, #f3f4f6); }
.tcm-sheet-action-icon { display: inline-flex; align-items: center; justify-content: center; width: 30px; margin-right: 10px; font-size: 20px; }
.tcm-sheet-action.danger { color: #dc2626; }
.tcm-sheet-cancel { width: 100%; min-height: 52px; margin-top: 8px; border: 0; border-radius: 12px; background: var(--tcm-hover, #f3f4f6); color: inherit; font: inherit; font-size: 16px; font-weight: 600; }
@keyframes tcm-sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
