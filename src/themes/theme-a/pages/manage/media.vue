<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>媒体库管理</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-primary" @click="openAdd">+ 添加媒体库</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
      </div>
    </div>

    <ResponsiveTable
      :columns="columns"
      :items="list"
      row-key="mediaId"
      :total="total"
      v-model:page="page"
      :page-size="pageSize"
      selectable
      v-model:selected="selected"
      empty-text="暂无媒体库"
    >
      <template #actions="{ item }">
        <button class="ta-btn-sm" @click="openEdit(item)">✏️ 编辑</button>
        <button class="ta-btn-sm" @click="openPaths(item)">📂 路径</button>
        <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(item)">🗑 删除</button>
      </template>
    </ResponsiveTable>

    <MediaLibraryCreateDialog v-model:visible="createDialog" @created="reload" />

    <MediaEditDialog
      v-model:editMediaDialog="editDialog"
      edit-model="modify"
      :media-info="editingMedia || {}"
      @reload="reload"
    />

    <!-- 路径管理弹窗 -->
    <div v-if="pathDialog" class="ta-dialog-overlay smanga-backable" @click.self="pathDialog = false">
      <div class="ta-dialog" style="width: 64rem;">
        <div class="ta-dialog-head">
          <h3>{{ pathMedia?.mediaName }} - 路径管理</h3>
          <button class="ta-dialog-close smanga-back-close" @click="pathDialog = false">×</button>
        </div>
        <div class="ta-dialog-body">
          <button class="ta-btn-primary" style="align-self:flex-start" @click="openPathAdd">+ 添加路径</button>
          <div v-if="paths.length === 0" class="ta-empty">暂无路径</div>
          <div v-for="p in paths" :key="p.pathId" class="ta-path-item">
            <span class="ta-path-content">{{ p.pathContent }}</span>
            <button class="ta-btn-sm" @click="openPathEdit(p)">✏️</button>
            <button class="ta-btn-sm" @click="scanPath(p)">🔍</button>
            <button class="ta-btn-sm" @click="rescanPath(p)">🔄</button>
            <button class="ta-btn-sm ta-btn-sm-danger" @click="deletePath(p)">🗑</button>
          </div>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-ghost" @click="pathDialog = false">关闭</button>
        </div>
      </div>
    </div>

    <PathEditDialog v-model="pathAddDialog" mode="add" :media-id="pathMedia?.mediaId" @saved="onPathSaved" />
    <PathEditDialog v-model="pathEditDialog" mode="edit" :path-info="editingPath" @saved="onPathSaved" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import mediaApi from '@/api/media'
import pathApi from '@/api/path'
import MediaEditDialog from '@/themes/components/media-edit-dialog.vue'
import MediaLibraryCreateDialog from '@/themes/components/media-library-create-dialog.vue'
import PathEditDialog from '@/themes/components/path-edit-dialog.vue'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const columns: RtColumn[] = [
  { key: 'mediaId', label: 'ID' },
  { key: 'mediaName', label: '名称' },
  { key: 'createTime', label: '创建时间', hideOnMobile: true },
]

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selected = ref<number[]>([])
const createDialog = ref(false)
const editDialog = ref(false)
const editingMedia = ref<any>(null)
const pathDialog = ref(false)
const pathMedia = ref<any>(null)
const paths = ref<any[]>([])
const pathAddDialog = ref(false)
const pathEditDialog = ref(false)
const editingPath = ref<any>(null)

async function load() {
  try {
    const res = await mediaApi.get(page.value, pageSize.value)
    total.value = Number(res.count) || 0
    list.value = res.list || []
  } catch { list.value = [] }
}

function reload() { page.value = 1; selected.value = []; load() }

watch(page, () => load())

function openAdd() { createDialog.value = true }

function openEdit(row: any) {
  editingMedia.value = { ...row }
  editDialog.value = true
}

async function doDelete(row: any) {
  if (!confirm(`确定删除媒体库「${row.mediaName}」吗？`)) return
  try { await mediaApi.delete_media(row.mediaId); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}

async function batchDelete() {
  if (!confirm(`确定删除选中的 ${selected.value.length} 个媒体库吗？`)) return
  try { await mediaApi.batch_delete_media(selected.value); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}

async function openPaths(row: any) {
  pathMedia.value = row
  pathDialog.value = true
  await loadPaths(row.mediaId)
}

async function loadPaths(mediaId: number) {
  try {
    const res = await pathApi.get_path(mediaId, 1, 1000)
    paths.value = res.list || []
  } catch { paths.value = [] }
}

function openPathAdd() { pathAddDialog.value = true }

function openPathEdit(p: any) {
  editingPath.value = { ...p }
  pathEditDialog.value = true
}

async function onPathSaved() {
  if (pathMedia.value) await loadPaths(pathMedia.value.mediaId)
}

async function scanPath(p: any) {
  if (!confirm('确定要增量扫描该路径吗？')) return
  try { await pathApi.scan_path(p.pathId); alert('扫描任务已提交'); await loadPaths(p.mediaId) } catch (e: any) { alert(e?.message || '扫描失败') }
}

async function rescanPath(p: any) {
  if (!confirm('确定要重新扫描该路径吗？这将重新索引所有漫画。')) return
  try { await pathApi.rescan_path(p.pathId); alert('重扫任务已提交'); await loadPaths(p.mediaId) } catch (e: any) { alert(e?.message || '重扫失败') }
}

async function deletePath(p: any) {
  if (!confirm('确定删除此路径吗？')) return
  try { await pathApi.delete_path(p.pathId); await loadPaths(p.mediaId) } catch (e: any) { alert(e?.message || '删除失败') }
}

onMounted(() => load())
</script>

<style scoped>
.ta-manage-page { max-width: 110rem; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.2rem; }
.ta-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 0.8rem; flex-wrap: wrap; }
.ta-btn-primary, .ta-btn-ghost, .ta-btn-danger, .ta-btn-sm, .ta-btn-sm-danger { cursor: pointer; font-size: 1.3rem; border-radius: 0.8rem; }
.ta-btn-primary { padding: 0.8rem 1.6rem; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-primary:disabled,.ta-btn-danger:disabled { opacity: .5; cursor: not-allowed; }
.ta-btn-ghost { padding: 0.8rem 1.6rem; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-danger { padding: 0.8rem 1.6rem; color: #fff; background: #ef4444; border: none; font-weight: 500; }
.ta-btn-danger:hover { background: #dc2626; }
.ta-btn-sm { padding: 0.5rem 1rem; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 1.2rem; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }
.ta-empty { text-align: center; color: #9ca3af; padding: 3.2rem 0 !important; }

.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 1.4rem; width: 48rem; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 0.8rem 3.2rem rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 1.6rem 2rem; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 1.6rem; font-weight: 600; }
.ta-dialog-close { width: 3.2rem; height: 3.2rem; border: none; background: none; font-size: 2rem; cursor: pointer; color: #9ca3af; border-radius: 0.6rem; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.6rem; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 0.8rem; padding: 1.2rem 2rem; border-top: 1px solid #eaeaea; }
.ta-field { display: flex; flex-direction: column; gap: 0.6rem; }
.ta-field span { font-size: 1.3rem; font-weight: 500; color: #374151; }
.ta-field input, .ta-select { padding: 0.8rem 1.2rem; border: 1px solid #eaeaea; border-radius: 0.8rem; font-size: 1.3rem; outline: none; }
.ta-field input:focus, .ta-select:focus { border-color: #2563eb; }
.ta-select { background: #fff; }
.ta-path-item { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.2rem; background: #f9fafb; border-radius: 0.8rem; border: 1px solid #f3f4f6; }
.ta-path-content { flex: 1; font-size: 1.3rem; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
</style>
