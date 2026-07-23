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
        <button class="ta-btn-primary" @click="openAdd">+ 添加路径</button>
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
              <button class="ta-btn-sm" @click="scanPath(row)">🔍 扫描</button>
              <button class="ta-btn-sm" @click="rescanPath(row)">🔄 重扫</button>
              <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(row)">🗑 删除</button>
            </td>
          </tr>
          <tr v-if="list.length === 0"><td colspan="6" class="ta-empty">请先输入媒体库ID搜索</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="addDialog" class="ta-dialog-overlay" @click.self="addDialog = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head"><h3>添加路径</h3><button class="ta-dialog-close" @click="addDialog = false">×</button></div>
        <div class="ta-dialog-body">
          <label class="ta-field"><span>路径</span><input v-model="newPathContent" placeholder="/path/to/manga" /></label>
          <label class="ta-field ta-field-switch"><span>自动扫描</span>
            <label class="ta-switch"><input type="checkbox" v-model="newAutoScan" /><span class="ta-switch-slider"></span></label>
          </label>
          <label class="ta-field"><span>包含 (正则)</span><input v-model="newInclude" placeholder="(aaa|bbb)" /></label>
          <label class="ta-field"><span>排除 (正则)</span><input v-model="newExclude" placeholder="(ccc|ddd)" /></label>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="doAdd">确认</button>
          <button class="ta-btn-ghost" @click="addDialog = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import pathApi from '@/api/path'

const list = ref<any[]>([])
const searchMediaId = ref('')
const addDialog = ref(false)
const newPathContent = ref('')
const newAutoScan = ref(false)
const newInclude = ref('')
const newExclude = ref('')

async function load() {
  const mid = Number(searchMediaId.value)
  if (!mid) { list.value = []; return }
  try { const res = await pathApi.get_path(mid, 1, 1000); list.value = res.list || [] } catch { list.value = [] }
}

function search() { load() }
function reload() { searchMediaId.value = ''; list.value = [] }

function openAdd() { addDialog.value = true; newPathContent.value = ''; newAutoScan.value = false; newInclude.value = ''; newExclude.value = '' }

async function doAdd() {
  if (!newPathContent.value) return alert('路径不能为空')
  try {
    await pathApi.add_path(Number(searchMediaId.value), { pathContent: newPathContent.value, autoScan: newAutoScan.value ? 1 : 0, include: newInclude.value, exclude: newExclude.value })
    addDialog.value = false; load()
  } catch (e: any) { alert(e?.message || '添加失败') }
}

async function scanPath(row: any) {
  try { await pathApi.scan_path(row.pathId); alert('扫描任务已提交') } catch (e: any) { alert(e?.message || '失败') }
}

async function rescanPath(row: any) {
  try { await pathApi.rescan_path(row.pathId); alert('重扫任务已提交') } catch (e: any) { alert(e?.message || '失败') }
}

async function doDelete(row: any) {
  if (!confirm(`确定删除路径「${row.pathContent}」吗？`)) return
  try { await pathApi.delete_path(row.pathId); load() } catch (e: any) { alert(e?.message || '删除失败') }
}

onMounted(() => {})
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
.ta-field input { padding: 8px 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 13px; outline: none; }
.ta-field input:focus { border-color: #2563eb; }
.ta-field-switch { flex-direction: row; align-items: center; justify-content: space-between; }
.ta-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.ta-switch input { display: none; }
.ta-switch-slider { position: absolute; inset: 0; border-radius: 12px; background: #d1d5db; cursor: pointer; transition: .2s; }
.ta-switch-slider::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: .2s; }
.ta-switch input:checked + .ta-switch-slider { background: #2563eb; }
.ta-switch input:checked + .ta-switch-slider::after { transform: translateX(20px); }
</style>
