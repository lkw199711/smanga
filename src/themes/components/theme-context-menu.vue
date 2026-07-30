<template>
  <Teleport to="body">
    <div v-if="themeContextMenu.visible && themeContextMenu.presentation === 'menu'" class="tcm-backdrop smanga-backable" @mousedown.self="closeThemeContextMenu">
      <div ref="menuEl" class="tcm-menu" :style="[positionStyle, skinStyle]" role="menu" @contextmenu.prevent>
        <div class="tcm-title">{{ title }}</div>
        <button v-for="action in actions" :key="action.key" class="tcm-action" :class="{ danger: action.danger }" :disabled="busy"
          role="menuitem" @click="run(action.key)">
          <span class="tcm-action-icon" aria-hidden="true">{{ action.icon }}</span>
          {{ action.label }}
        </button>
      </div>
    </div>
    <div v-if="themeContextMenu.visible && themeContextMenu.presentation === 'sheet'" class="tcm-sheet-backdrop smanga-backable" @click.self="closeThemeContextMenu">
      <section class="tcm-sheet" :style="skinStyle" role="dialog" aria-modal="true" :aria-label="`${title}操作`">
        <div class="tcm-sheet-handle" />
        <div class="tcm-sheet-title">{{ title }}</div>
        <button v-for="action in actions" :key="action.key" class="tcm-sheet-action" :class="{ danger: action.danger }" :disabled="busy"
          type="button" @click="run(action.key)">
          <span class="tcm-sheet-action-icon" aria-hidden="true">{{ action.icon }}</span>
          <span>{{ action.label }}</span>
        </button>
        <button class="tcm-sheet-cancel smanga-back-close" type="button" @click="closeThemeContextMenu">取消</button>
      </section>
    </div>
  </Teleport>

  <manga-modify v-if="themeContextMenu.target === 'manga'" v-model:editMangaDialog="editMangaDialog" :manga-info="item" @reload="finishDialog" />
  <chapter-modify v-if="themeContextMenu.target === 'chapter'" v-model:editChapterDialog="editChapterDialog" :chapter-info="item" @close="editChapterDialog = false" @reload="finishDialog" />
  <media-edit v-if="themeContextMenu.target === 'media'" v-model:editMediaDialog="editMediaDialog" edit-model="modify" :media-info="item" @reload="finishDialog" />

  <TagEditorDialog v-if="item.mangaId" v-model="editTagsDialog" :manga-id="item.mangaId" :tags="item.tags || []" @update:tags="updateTags" />
  <el-dialog v-model="shareDialog" title="创建分享链接" width="min(92vw, 68rem)">
    <manga-share :manga-info="themeContextMenu.target === 'manga' ? item : undefined" :media-info="themeContextMenu.target === 'media' ? item : undefined" @close_dialog="finishDialog" />
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
import mediaApi from '@/api/media'
import collectApi from '@/api/collect'
import historyApi from '@/api/history'
import latestApi from '@/api/latest'
import { useSessionStore } from '@/store/session'
import {
  closeThemeContextMenu,
  notifyThemeChapterReadChanged,
  notifyThemeContextMenuChanged,
  themeContextMenu,
} from '@/themes/context-menu'
import { themeState } from '@/themes/store'
import MangaModify from '@/themes/components/manga-modify-dialog.vue'
import ChapterModify from '@/themes/components/chapter-modify-dialog.vue'
import MediaEdit from '@/themes/components/media-edit-dialog.vue'
import TagEditorDialog from '@/themes/components/tag-editor-dialog.vue'
import MangaShare from '@/components/share.vue'

type Action = { key: string; label: string; icon: string; danger?: boolean }
const menuEl = ref<HTMLElement>()
const route = useRoute()
const busy = ref(false)
const collected = ref(false)
const editMangaDialog = ref(false)
const editChapterDialog = ref(false)
const editMediaDialog = ref(false)
const editTagsDialog = ref(false)
const shareDialog = ref(false)
const tagsDialogKey = ref(0)
const session = useSessionStore()
const isAdmin = computed(() => session.isAdmin)
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
    if (route.name === 't-manga-info' && themeContextMenu.target === 'chapter' && key === 'read') {
      notifyThemeChapterReadChanged(Number(data.chapterId))
    } else {
      notifyThemeContextMenuChanged(themeContextMenu.target)
    }
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
  const id = Number(data.chapterId)
  if (!Number.isInteger(id) || id <= 0) throw new Error('无效的章节 ID')
  if (key === 'collect') {
    if (collected.value) await collectApi.remove_collect('chapter', id)
    else await collectApi.add_chapter_collect('chapter', id, data)
  } else if (key === 'read') {
    if (data.latest?.finish) {
      await Promise.all([historyApi.delete(id), latestApi.delete(id)])
      data.latest = null
      ElMessage.success('已标记为未读')
    } else {
      let mediaId = Number(data.mediaId)
      let mangaId = Number(data.mangaId)
      let chapterName = data.chapterName

      // 首页历史条目在旧接口响应中没有 mediaId。仅当历史记录不存在时才需新建，
      // 此时从章节详情补齐接口校验要求的字段，避免把整个列表对象直接提交。
      const hasHistory = await historyApi.is_read(id)
      if (!hasHistory) {
        if (!Number.isInteger(mediaId) || mediaId <= 0 || !Number.isInteger(mangaId) || mangaId <= 0) {
          const chapter = await chapterApi.get_by_id(id)
          mediaId = Number(chapter?.mediaId)
          mangaId = Number(chapter?.mangaId)
          chapterName ||= chapter?.chapterName
        }
        await historyApi.add({ mediaId, mangaId, chapterId: id, chapterName })
      }

      if (!Number.isInteger(mangaId) || mangaId <= 0) {
        const chapter = await chapterApi.get_by_id(id)
        mangaId = Number(chapter?.mangaId)
      }
      await latestApi.add({ chapterId: id, mangaId, finish: true, page: 0, count: 0 })
      data.latest = { ...(data.latest || {}), finish: 1, page: 0, count: 0 }
      ElMessage.success('已标记为已读')
    }
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
.tcm-menu { position: fixed; width: 19.6rem; padding: 0.6rem; overflow: hidden; border: 1px solid var(--tcm-border, rgba(0,0,0,.12)); border-radius: 1.2rem; background: var(--tcm-bg, #fff); color: var(--tcm-text, #1f2937); box-shadow: 0 1.2rem 3rem rgba(0,0,0,.18); }
.tcm-title { padding: 0.8rem 1rem; overflow: hidden; font-size: 1.2rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; opacity: .65; }
.tcm-action { display: flex; align-items: center; width: 100%; padding: 0.9rem 1rem; border: 0; border-radius: 0.8rem; background: transparent; color: inherit; text-align: left; font: inherit; font-size: 1.3rem; cursor: pointer; }
.tcm-action-icon { display: inline-flex; align-items: center; justify-content: center; width: 2rem; margin-right: 0.7rem; font-size: 1.6rem; line-height: 1; }
.tcm-action:hover:not(:disabled) { background: var(--tcm-hover, #f3f4f6); }
.tcm-action.danger { color: #dc2626; }
.tcm-action:disabled { cursor: wait; opacity: .55; }
.tcm-sheet-backdrop { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .38); }
.tcm-sheet { width: 100%; padding: 0.8rem 1.2rem calc(1.2rem + env(safe-area-inset-bottom)); border-radius: 2rem 2rem 0 0; background: var(--tcm-bg, #fff); color: var(--tcm-text, #1f2937); box-shadow: 0 -0.8rem 2.4rem rgba(0,0,0,.16); animation: tcm-sheet-in .18s ease-out; }
.tcm-sheet-handle { width: 3.6rem; height: 0.4rem; margin: 0.2rem auto 1.2rem; border-radius: 99.9rem; background: currentColor; opacity: .2; }
.tcm-sheet-title { padding: 0 1rem 1rem; overflow: hidden; font-size: 1.4rem; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.tcm-sheet-action { display: flex; align-items: center; width: 100%; min-height: 5.2rem; padding: 1rem 1.2rem; border: 0; border-radius: 1.2rem; background: transparent; color: inherit; font: inherit; font-size: 1.6rem; text-align: left; }
.tcm-sheet-action:active { background: var(--tcm-hover, #f3f4f6); }
.tcm-sheet-action-icon { display: inline-flex; align-items: center; justify-content: center; width: 3rem; margin-right: 1rem; font-size: 2rem; }
.tcm-sheet-action.danger { color: #dc2626; }
.tcm-sheet-cancel { width: 100%; min-height: 5.2rem; margin-top: 0.8rem; border: 0; border-radius: 1.2rem; background: var(--tcm-hover, #f3f4f6); color: inherit; font: inherit; font-size: 1.6rem; font-weight: 600; }
@keyframes tcm-sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
