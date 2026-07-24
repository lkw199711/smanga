<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>任务管理</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
      </div>
    </div>

    <ResponsiveTable
      :columns="columns"
      :items="list"
      row-key="id"
      :total="total"
      v-model:page="page"
      :page-size="pageSize"
      selectable
      v-model:selected="selected"
      empty-text="暂无任务"
    >
      <template #cell-name="{ value }">
        {{ value || '-' }}
      </template>
      <template #cell-_status="{ item }">
        <span v-if="item.failedReason" class="ta-badge ta-badge-danger">失败</span>
        <span v-else-if="item.finishedOn" class="ta-badge ta-badge-success">已完成</span>
        <span v-else-if="item.processedOn" class="ta-badge ta-badge-active">处理中</span>
        <span v-else class="ta-badge ta-badge-wait">等待中</span>
      </template>
      <template #cell-timestamp="{ value }">
        {{ value ? new Date(value).toLocaleString() : '-' }}
      </template>
      <template #actions="{ item }">
        <button class="ta-btn-sm" @click="showDetail(item)">📋 详情</button>
        <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(item)">🗑 删除</button>
      </template>
    </ResponsiveTable>

    <div v-if="detailShow" class="ta-dialog-overlay" @click.self="detailShow = false">
      <div class="ta-dialog" style="width:680px">
        <div class="ta-dialog-head"><h3>任务详情</h3><button class="ta-dialog-close" @click="detailShow = false">×</button></div>
        <div class="ta-dialog-body">
          <pre class="ta-code-block"><code>{{ detailJson }}</code></pre>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="copyDetail">📋 复制</button>
          <button class="ta-btn-ghost" @click="detailShow = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import jobsApi from '@/api/jobs'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const columns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'id', label: 'ID' },
  { key: 'name', label: '队列' },
  { key: '_status', label: '状态' },
  { key: 'timestamp', label: '创建时间', hideOnMobile: true },
]

const allTasks = ref<any[]>([])
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selected = ref<string[]>([])
const detailShow = ref(false)
const detailJson = ref('')

function loadPage() {
  const start = (page.value - 1) * pageSize.value
  list.value = allTasks.value.slice(start, start + pageSize.value)
}

watch(page, () => loadPage())

async function load() {
  try {
    const res = await jobsApi.get()
    allTasks.value = res.list || []
    total.value = res.count || allTasks.value.length
    loadPage()
  } catch { allTasks.value = []; list.value = [] }
}
function reload() { page.value = 1; selected.value = []; load() }

function showDetail(row: any) {
  detailJson.value = JSON.stringify(row, null, 2)
  detailShow.value = true
}
async function copyDetail() {
  try { await navigator.clipboard.writeText(detailJson.value); alert('已复制到剪贴板') } catch { alert('复制失败') }
}

async function doDelete(row: any) {
  if (!confirm('确定删除此任务吗？')) return
  try { await jobsApi.delete(row.id); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
async function batchDelete() {
  if (!confirm(`确定删除选中的 ${selected.value.length} 个任务吗？`)) return
  try { await jobsApi.batch_delete(selected.value.map(Number)); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
onMounted(() => load())
</script>

<style scoped>
.ta-manage-page { max-width: 1100px; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-danger,.ta-btn-sm,.ta-btn-sm-danger { cursor: pointer; font-size: 13px; border-radius: 8px; }
.ta-btn-primary { padding: 8px 16px; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-ghost { padding: 8px 16px; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-danger { padding: 8px 16px; color: #fff; background: #ef4444; border: none; font-weight: 500; }
.ta-btn-danger:hover { background: #dc2626; }
.ta-btn-danger:disabled { opacity: .5; cursor: not-allowed; }
.ta-btn-sm { padding: 5px 10px; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 12px; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }
.ta-badge { padding: 2px 10px; border-radius: 10px; font-size: 12px; display: inline-block; }
.ta-badge-danger { color: #dc2626; background: #fef2f2; }
.ta-badge-success { color: #16a34a; background: #f0fdf4; }
.ta-badge-active { color: #2563eb; background: #eff6ff; }
.ta-badge-wait { color: #d97706; background: #fffbeb; }
.ta-code-block { background: #f8f9fa; border: 1px solid #eaeaea; border-radius: 8px; padding: 16px; overflow-x: auto; max-height: 400px; font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }
.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 14px; width: 480px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
.ta-dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 20px; cursor: pointer; color: #9ca3af; border-radius: 6px; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 20px; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #eaeaea; }
</style>
