<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>路径管理</h1>
      <div class="ta-page-actions">
        <div class="ta-search-box">
          <input v-model="searchMediaId" placeholder="媒体库ID" type="number" style="width:120px" @keydown.enter="search" />
          <button class="ta-btn-ghost" @click="search">🔍</button>
        </div>
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
      </div>
    </div>

    <div class="ta-table-wrap">
      <table class="ta-table">
        <thead>
          <tr><th>#</th><th>路径ID</th><th>路径</th><th>自动扫描</th><th>创建时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in list" :key="row.pathId">
            <td>{{ idx + 1 }}</td><td>{{ row.pathId }}</td>
            <td class="ta-path-cell">{{ row.pathContent }}</td>
            <td>{{ row.autoScan ? '是' : '否' }}</td><td>{{ row.createTime }}</td>
            <td class="ta-col-actions">
              <button class="ta-btn-sm" @click="openEdit(row)">✏️ 编辑</button>
              <button class="ta-btn-sm" @click="scanPath(row)">🔍 扫描</button>
              <button class="ta-btn-sm" @click="rescanPath(row)">🔄 重扫</button>
              <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(row)">🗑 删除</button>
            </td>
          </tr>
          <tr v-if="list.length === 0"><td colspan="6" class="ta-empty">暂无路径</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 编辑路径弹窗 (共享组件) -->
    <PathEditDialog
      v-model="editDialog"
      mode="edit"
      :path-info="editingPath"
      @saved="load"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import pathApi from '@/api/path'
import PathEditDialog from '@/themes/components/path-edit-dialog.vue'

const list = ref<any[]>([])
const searchMediaId = ref('')
const editDialog = ref(false)
const editingPath = ref<any>(null)

async function load() {
  const mid = Number(searchMediaId.value) || 0
  try { const res = await pathApi.get_path(mid, 1, 1000); list.value = res.list || [] } catch { list.value = [] }
}

function search() { load() }
function reload() { searchMediaId.value = ''; load() }

onMounted(() => load())

// ---------- 编辑路径 ----------
function openEdit(row: any) {
  editingPath.value = { ...row }
  editDialog.value = true
}

// ---------- 扫描 / 重扫 ----------
async function scanPath(row: any) {
  if (!confirm('确定要增量扫描该路径吗？')) return
  try { await pathApi.scan_path(row.pathId); alert('扫描任务已提交'); load() } catch (e: any) { alert(e?.message || '失败') }
}

async function rescanPath(row: any) {
  if (!confirm('确定要重新扫描该路径吗？这将重新索引所有漫画。')) return
  try { await pathApi.rescan_path(row.pathId); alert('重扫任务已提交'); load() } catch (e: any) { alert(e?.message || '失败') }
}

async function doDelete(row: any) {
  if (!confirm(`确定删除路径「${row.pathContent}」吗？`)) return
  try { await pathApi.delete_path(row.pathId); load() } catch (e: any) { alert(e?.message || '删除失败') }
}
</script>

<style scoped>
.ta-manage-page { max-width: 1100px; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ta-search-box { display: flex; gap: 4px; }
.ta-search-box input { padding: 7px 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 13px; outline: none; width: 160px; }
.ta-search-box input:focus { border-color: #2563eb; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-sm,.ta-btn-sm-danger { cursor: pointer; font-size: 13px; border-radius: 8px; }
.ta-btn-primary { padding: 8px 16px; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-ghost { padding: 8px 16px; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
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
.ta-path-cell { max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ta-col-actions { white-space: nowrap; display: flex; gap: 6px; }
.ta-empty { text-align: center; color: #9ca3af; padding: 32px 0 !important; }
</style>
