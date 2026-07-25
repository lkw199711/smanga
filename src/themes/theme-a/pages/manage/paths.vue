<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>路径管理</h1>
      <div class="ta-page-actions">
        <div class="ta-search-box">
          <input v-model="searchMediaId" placeholder="媒体库ID" type="number" style="width:12rem" @keydown.enter="search" />
          <button class="ta-btn-ghost" @click="search">🔍</button>
        </div>
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
      </div>
    </div>

    <ResponsiveTable
      :columns="columns"
      :items="list"
      row-key="pathId"
      :total="list.length"
      :page="1"
      :page-size="99999"
      empty-text="暂无路径"
    >
      <template #cell-pathContent="{ value }">
        <span class="ta-path-cell">{{ value }}</span>
      </template>
      <template #actions="{ item }">
        <button class="ta-btn-sm" @click="openEdit(item)">✏️ 编辑</button>
        <button class="ta-btn-sm" @click="scanPath(item)">🔍 扫描</button>
        <button class="ta-btn-sm" @click="rescanPath(item)">🔄 重扫</button>
        <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(item)">🗑 删除</button>
      </template>
    </ResponsiveTable>

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
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const columns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'pathId', label: '路径ID' },
  { key: 'pathContent', label: '路径' },
  { key: 'autoScan', label: '自动扫描', hideOnMobile: true },
  { key: 'createTime', label: '创建时间', hideOnMobile: true },
]

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

function openEdit(row: any) {
  editingPath.value = { ...row }
  editDialog.value = true
}

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
.ta-manage-page { max-width: 110rem; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.2rem; }
.ta-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; }
.ta-search-box { display: flex; gap: 0.4rem; }
.ta-search-box input { padding: 0.7rem 1.2rem; border: 1px solid #eaeaea; border-radius: 0.8rem; font-size: 1.3rem; outline: none; width: 16rem; }
.ta-search-box input:focus { border-color: #2563eb; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-sm,.ta-btn-sm-danger { cursor: pointer; font-size: 1.3rem; border-radius: 0.8rem; }
.ta-btn-primary { padding: 0.8rem 1.6rem; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-ghost { padding: 0.8rem 1.6rem; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-sm { padding: 0.5rem 1rem; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 1.2rem; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }
.ta-path-cell { max-width: 40rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
</style>
