<template>
  <div v-if="allowed && (batch.active.value || rows.length)" class="batch-toolbar" :class="{ 'is-touch': config.isMobile }">
    <div v-if="batch.active.value" class="batch-toolbar-selection">
      <span class="batch-toolbar-count" aria-live="polite">已选 {{ count }} 项</span>
      <button type="button" :disabled="batch.locked.value || !pageIds.length" @click="batch.selectPage(kind, rows)">
        {{ allPage ? '取消全选当前页' : '全选当前页' }}
      </button>
      <button type="button" :disabled="batch.locked.value || !count" @click="batch.selected.clear()">清空</button>
    </div>
    <div v-if="batch.active.value" class="batch-toolbar-inline">
      <button v-if="isLibraryItem" type="button" :disabled="actionsDisabled" @click="openTags">批量修改标签</button>
      <button type="button" class="batch-toolbar-danger" :disabled="actionsDisabled" @click="openDelete">{{ deleteLabel }}</button>
    </div>
    <button type="button" :disabled="batch.locked.value || (!batch.active.value && disabled)" @click="toggleMode">{{ batch.active.value ? '退出多选' : '多选' }}</button>
  </div>

  <Teleport to="body">
    <div v-if="allowed && batch.active.value" class="batch-toolbar-fixed" :class="{ 'is-touch': config.isMobile, 'is-dark': isDarkMode }">
      <span class="batch-toolbar-count">已选 {{ count }} 项</span>
      <button v-if="isLibraryItem" type="button" :disabled="actionsDisabled" @click="openTags">修改标签</button>
      <button type="button" class="batch-toolbar-danger" :disabled="actionsDisabled" @click="openDelete">{{ isLibraryItem ? '删除' : deleteLabel }}</button>
    </div>
  </Teleport>

  <BatchTagDialog v-if="tagTarget" v-model="tagOpen" :target="tagTarget" :ids="ids" :manga-count="mangaCount" @applied="onTagsApplied" />
  <el-dialog v-model="deleteOpen" :title="deleteLabel" width="min(48rem, 92vw)" append-to-body
    :close-on-click-modal="false" :close-on-press-escape="!submitting" :show-close="!submitting">
    <p v-if="isLibraryItem">
      {{ physicalStep ? `将永久删除 ${count} ${targetLabel}的源文件，请再次确认。` : `已选 ${count} ${targetLabel}，请选择删除方式。` }}
    </p>
    <p v-else>{{ `确定${deleteVerb}选中的 ${count} ${targetLabel}吗？` }}</p>
    <fieldset v-if="isLibraryItem && !physicalStep" class="batch-delete-options" :disabled="submitting">
      <label><input v-model="deleteFile" type="radio" :value="false" /> 移除记录，保留源文件</label>
      <label><input v-model="deleteFile" type="radio" :value="true" /> 同时删除源文件</label>
      <small v-if="!deleteFile">如果源文件仍在扫描目录里，重新扫描时可能再次导入。</small>
      <small v-if="deleteFile">云媒体库及受存储限制的文件由删除任务校验。</small>
    </fieldset>
    <template #footer>
      <el-button :disabled="submitting" @click="deleteOpen = false">取消</el-button>
      <el-button type="danger" :loading="submitting" :disabled="!count" @click="submitDelete">
        {{ physicalStep ? '确认永久删除' : deleteFile && isLibraryItem ? '下一步' : '确认' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onDeactivated, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { deleteBatch } from '@/api/batch'
import { config } from '@/store'
import { useSessionStore } from '@/store/session'
import { batchError, batchRowId, refreshBatchList, type BatchKind, type BatchRow, type BatchSelection } from '@/themes/composables/use-batch-selection'
import { useColorTheme } from '@/themes/composables/use-color-theme'
import BatchTagDialog from './batch-tag-dialog.vue'

const props = defineProps<{
  batch: BatchSelection
  kind: BatchKind
  rows: BatchRow[]
  scope?: string | number
  disabled?: boolean
  ownerMangaId?: number
  refresh: () => unknown | Promise<unknown>
}>()
const { isDarkMode } = useColorTheme()
const session = useSessionStore()
const labels = {
  manga: ['批量删除', '部漫画', '删除'],
  chapter: ['批量删除', '个章节', '删除'],
  collect: ['取消收藏', '项收藏', '取消'],
  history: ['清除历史', '项阅读历史', '清除'],
  bookmark: ['删除书签', '个书签', '删除'],
  media: ['批量停用', '个媒体库', '停用'],
} as const
const isLibraryItem = computed(() => props.kind === 'manga' || props.kind === 'chapter')
const tagTarget = computed(() => props.kind === 'manga' || props.kind === 'chapter' ? props.kind : null)
const allowed = computed(() => !(isLibraryItem.value || props.kind === 'media') || session.isAdmin)
const count = computed(() => props.batch.selected.size)
const ids = computed(() => [...props.batch.selected.keys()])
const pageIds = computed(() => props.disabled ? [] : props.rows.map((row) => batchRowId(props.kind, row)).filter(Boolean))
const allPage = computed(() => pageIds.value.length > 0 && pageIds.value.every((id) => props.batch.selected.has(id)))
const actionsDisabled = computed(() => !count.value || props.batch.locked.value)
const mangaCount = computed(() => {
  const owners = [...props.batch.selected.values()].map((row) => Number(row.mangaId || props.ownerMangaId))
  return owners.every((id) => id > 0) ? new Set(owners).size : 0
})
const deleteLabel = computed(() => labels[props.kind][0])
const targetLabel = computed(() => labels[props.kind][1])
const deleteVerb = computed(() => labels[props.kind][2])
const tagOpen = ref(false)
const deleteOpen = ref(false)
const deleteFile = ref(false)
const physicalStep = ref(false)
const submitting = ref(false)
let scopeVersion = 0

function reset() {
  scopeVersion++
  props.batch.exit()
  tagOpen.value = false
  deleteOpen.value = false
}

watch([() => props.scope, () => props.kind, allowed], reset)
watch([tagOpen, deleteOpen, submitting], ([tags, deletion, saving]) => {
  props.batch.locked.value = tags || deletion || saving
}, { flush: 'sync' })
onBeforeUnmount(reset)
onDeactivated(reset)

function toggleMode() {
  if (props.batch.active.value) props.batch.exit()
  else props.batch.active.value = true
}

function openTags() {
  if (count.value > 1000) {
    ElMessage.warning('一次最多可为 1000 项修改标签，请减少选择数量。')
    return
  }
  tagOpen.value = true
}

function openDelete() {
  deleteFile.value = false
  physicalStep.value = false
  deleteOpen.value = true
}

function onTagsApplied(appliedIds: number[]) {
  for (const id of appliedIds) props.batch.selected.delete(id)
  void refreshBatchList(props.refresh)
}

async function submitDelete() {
  if (submitting.value || !count.value) return
  const removeFiles = deleteFile.value && isLibraryItem.value
  if (removeFiles && !physicalStep.value) {
    physicalStep.value = true
    return
  }
  const version = scopeVersion
  const kind = props.kind
  const queued = isLibraryItem.value
  const entries = [...props.batch.selected.entries()]
  const submitted = new Set<number>()
  let affected = 0
  let errorMessage = ''
  submitting.value = true
  try {
    for (let start = 0; start < entries.length; start += 100) {
      if (version !== scopeVersion) break
      const group = entries.slice(start, start + 100)
      affected += await deleteBatch(kind, group, removeFiles)
      for (const [id] of group) submitted.add(id)
    }
  } catch (error) {
    errorMessage = batchError(error, '提交失败')
  } finally {
    submitting.value = false
    deleteOpen.value = false
  }
  if (version !== scopeVersion) return
  for (const id of submitted) props.batch.selected.delete(id)
  if (affected > 0) {
    ElMessage.success(queued ? `${affected} 项已加入删除队列，可在任务管理查看` : `已处理 ${affected} 条记录`)
  }
  if (errorMessage) ElMessage.error(errorMessage)
  if (affected < submitted.size) ElMessage.warning('部分所选记录已不存在或不可操作。')
  if (submitted.size) await refreshBatchList(props.refresh)
}
</script>

<style>
:where([data-batch-selected]) { position: relative; }
[data-batch-selected] { cursor: pointer; }
[data-batch-selected='true'] { outline: 2px solid var(--el-color-primary, #2563eb); outline-offset: -2px; }
[data-batch-selected]:focus-visible { outline: 2px solid var(--el-color-primary, #2563eb); outline-offset: 2px; }
.batch-item-check {
  position: absolute;
  z-index: 2;
  top: 0.6rem;
  left: 0.6rem;
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  box-sizing: border-box;
  border: 1px solid #94a3b8;
  border-radius: 0.5rem;
  background: #fff;
  color: transparent;
  font: 700 1.45rem/1 sans-serif;
  pointer-events: none;
}
[data-batch-selected='true'] > .batch-item-check {
  background: var(--el-color-primary, #2563eb);
  border-color: transparent;
  color: #fff;
}
.batch-toolbar { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 0.6rem; margin: 0.6rem 0 1rem; }
.batch-toolbar-selection, .batch-toolbar-inline, .batch-toolbar-fixed { display: flex; align-items: center; flex-wrap: wrap; gap: 0.6rem; }
.batch-toolbar-selection { margin-inline-end: auto; }
.batch-toolbar-fixed { display: none; }
.batch-toolbar button, .batch-toolbar-fixed button {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--el-border-color, #d1d5db);
  border-radius: 0.6rem;
  background: var(--el-fill-color-blank, #fff);
  color: var(--el-text-color-primary, #1f2937);
  font: inherit;
  line-height: 1.3;
  cursor: pointer;
}
.batch-toolbar button:disabled, .batch-toolbar-fixed button:disabled { opacity: 0.5; cursor: default; }
.batch-toolbar button.batch-toolbar-danger, .batch-toolbar-fixed button.batch-toolbar-danger {
  color: var(--el-color-danger, #b91c1c);
}
.batch-toolbar-count { font-weight: 600; white-space: nowrap; }
.batch-delete-options { display: grid; gap: 0.8rem; margin-top: 1rem; }
.batch-toolbar.is-touch .batch-toolbar-inline, .batch-toolbar.is-touch .batch-toolbar-count { display: none; }
.batch-toolbar-fixed.is-touch { display: flex; }
@media (max-width: 767px) {
  .batch-toolbar .batch-toolbar-inline, .batch-toolbar .batch-toolbar-count { display: none; }
  .batch-toolbar-fixed { display: flex; }
}
.batch-toolbar-fixed {
  position: fixed;
  inset: auto 0 0;
  z-index: 150;
  justify-content: flex-end;
  padding: 0.8rem max(1.2rem, env(safe-area-inset-right)) max(0.8rem, env(safe-area-inset-bottom)) max(1.2rem, env(safe-area-inset-left));
  border-top: 1px solid var(--el-border-color, #d1d5db);
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #1f2937);
}
.batch-toolbar-fixed .batch-toolbar-count { margin-inline-end: auto; }
.batch-toolbar-fixed.is-dark { color-scheme: dark; }
</style>
