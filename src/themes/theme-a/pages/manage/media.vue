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

    <div class="ta-table-wrap">
      <table class="ta-table">
        <thead>
          <tr>
            <th class="ta-col-check"><input type="checkbox" @change="toggleAll" :checked="allSelected" /></th>
            <th>ID</th>
            <th>名称</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.mediaId">
            <td><input type="checkbox" :value="row.mediaId" v-model="selected" /></td>
            <td>{{ row.mediaId }}</td>
            <td>{{ row.mediaName }}</td>
            <td>{{ row.createTime }}</td>
            <td class="ta-col-actions">
              <button class="ta-btn-sm" @click="openEdit(row)">✏️ 编辑</button>
              <button class="ta-btn-sm" @click="openPaths(row)">📂 路径</button>
              <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(row)">🗑 删除</button>
            </td>
          </tr>
          <tr v-if="list.length === 0">
            <td colspan="5" class="ta-empty">暂无媒体库</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ta-pager" v-if="total > pageSize">
      <button :disabled="page <= 1" @click="page--; load()">‹ 上一页</button>
      <span>第 {{ page }} / {{ Math.ceil(total / pageSize) }} 页 (共 {{ total }} 条)</span>
      <button :disabled="page >= Math.ceil(total / pageSize)" @click="page++; load()">下一页 ›</button>
    </div>

    <!-- 新建媒体库 (专用组件) -->
    <MediaLibraryCreateDialog v-model:visible="createDialog" @created="reload" />

    <!-- 编辑媒体库 (使用公用组件) -->
    <MediaEditDialog
      v-model:editMediaDialog="editDialog"
      edit-model="modify"
      :media-info="editingMedia || {}"
      @reload="reload"
    />

    <!-- 路径管理弹窗 -->
    <div v-if="pathDialog" class="ta-dialog-overlay" @click.self="pathDialog = false">
      <div class="ta-dialog" style="width: 640px;">
        <div class="ta-dialog-head">
          <h3>{{ pathMedia?.mediaName }} - 路径管理</h3>
          <button class="ta-dialog-close" @click="pathDialog = false">×</button>
        </div>
        <div class="ta-dialog-body">
          <div class="ta-path-add">
            <input v-model="newPath" placeholder="输入新路径..." class="ta-field-input" @keydown.enter="addPath" />
            <button class="ta-btn-primary" @click="addPath">添加</button>
          </div>
          <div v-if="paths.length === 0" class="ta-empty">暂无路径</div>
          <div v-for="p in paths" :key="p.pathId" class="ta-path-item">
            <span class="ta-path-content">{{ p.pathContent }}</span>
            <button class="ta-btn-sm" @click="scanPath(p)">🔍 扫描</button>
            <button class="ta-btn-sm" @click="rescanPath(p)">🔄 重扫</button>
            <button class="ta-btn-sm ta-btn-sm-danger" @click="deletePath(p)">🗑</button>
          </div>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-ghost" @click="pathDialog = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import mediaApi from '@/api/media'
import pathApi from '@/api/path'
import MediaEditDialog from '@/themes/components/media-edit-dialog.vue'
import MediaLibraryCreateDialog from '@/themes/components/media-library-create-dialog.vue'

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
const newPath = ref('')

const allSelected = computed(() => list.value.length > 0 && selected.value.length === list.value.length)

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  selected.value = checked ? list.value.map((r) => r.mediaId) : []
}

async function load() {
  try {
    const res = await mediaApi.get(page.value, pageSize.value)
    total.value = Number(res.count) || 0
    list.value = res.list || []
  } catch { list.value = [] }
}

function reload() { page.value = 1; selected.value = []; load() }

function openAdd() {
  createDialog.value = true
}

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

async function addPath() {
  if (!newPath.value || !pathMedia.value) return
  try {
    await pathApi.add_path(pathMedia.value.mediaId, { pathContent: newPath.value, autoScan: 0 })
    newPath.value = ''
    await loadPaths(pathMedia.value.mediaId)
  } catch (e: any) { alert(e?.message || '添加失败') }
}

async function scanPath(p: any) {
  try { await pathApi.scan_path(p.pathId); alert('扫描任务已提交') } catch (e: any) { alert(e?.message || '扫描失败') }
}

async function rescanPath(p: any) {
  try { await pathApi.rescan_path(p.pathId); alert('重扫任务已提交') } catch (e: any) { alert(e?.message || '重扫失败') }
}

async function deletePath(p: any) {
  if (!confirm('确定删除此路径吗？')) return
  try { await pathApi.delete_path(p.pathId); await loadPaths(p.mediaId) } catch (e: any) { alert(e?.message || '删除失败') }
}

onMounted(() => load())
</script>

<style scoped>
.ta-manage-page { max-width: 1100px; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ta-btn-primary, .ta-btn-ghost, .ta-btn-danger, .ta-btn-sm, .ta-btn-sm-danger { cursor: pointer; font-size: 13px; border-radius: 8px; }
.ta-btn-primary { padding: 8px 16px; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-primary:disabled,.ta-btn-danger:disabled { opacity: .5; cursor: not-allowed; }
.ta-btn-ghost { padding: 8px 16px; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-danger { padding: 8px 16px; color: #fff; background: #ef4444; border: none; font-weight: 500; }
.ta-btn-danger:hover { background: #dc2626; }
.ta-btn-sm { padding: 5px 10px; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 12px; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }
.ta-table-wrap { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; overflow-x: auto; }
.ta-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ta-table th { text-align: left; padding: 10px 12px; color: #6b7280; font-weight: 600; font-size: 12px; border-bottom: 1px solid #eaeaea; background: #fafafa; }
.ta-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
.ta-table tr:last-child td { border-bottom: none; }
.ta-table tr:hover td { background: #fafafa; }
.ta-col-check { width: 40px; text-align: center; }
.ta-col-actions { white-space: nowrap; display: flex; gap: 6px; }
.ta-empty { text-align: center; color: #9ca3af; padding: 32px 0 !important; }
.ta-pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: 13px; color: #6b7280; }
.ta-pager button { padding: 6px 14px; font-size: 13px; border: 1px solid #eaeaea; border-radius: 8px; background: #fff; cursor: pointer; }
.ta-pager button:disabled { opacity: .4; cursor: not-allowed; }
.ta-pager button:hover:not(:disabled) { background: #f3f4f6; }
.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 14px; width: 480px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
.ta-dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 20px; cursor: pointer; color: #9ca3af; border-radius: 6px; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #eaeaea; }
.ta-field { display: flex; flex-direction: column; gap: 6px; }
.ta-field span { font-size: 13px; font-weight: 500; color: #374151; }
.ta-field input, .ta-select { padding: 8px 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 13px; outline: none; }
.ta-field input:focus, .ta-select:focus { border-color: #2563eb; }
.ta-select { background: #fff; }
.ta-path-add { display: flex; gap: 8px; }
.ta-field-input { flex: 1; padding: 8px 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 13px; outline: none; }
.ta-field-input:focus { border-color: #2563eb; }
.ta-path-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6; }
.ta-path-content { flex: 1; font-size: 13px; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
</style>
