<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>解压管理</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
        <button class="ta-btn-ghost" @click="clearAll">🧹 清空记录</button>
      </div>
    </div>

    <ResponsiveTable
      :columns="columns"
      :items="list"
      row-key="compressId"
      :total="total"
      v-model:page="page"
      :page-size="pageSize"
      selectable
      v-model:selected="selected"
      empty-text="暂无解压记录"
    >
      <template #cell-chapterPath="{ value }">
        <span class="ta-path-cell">{{ value || '-' }}</span>
      </template>
      <template #cell-compressPath="{ value }">
        <span class="ta-path-cell">{{ value || '-' }}</span>
      </template>
      <template #actions="{ item }">
        <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(item)">🗑 删除</button>
      </template>
    </ResponsiveTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import compressApi from '@/api/compress'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const columns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'compressId', label: 'ID' },
  { key: 'compressType', label: '类型', hideOnMobile: true },
  { key: 'chapterPath', label: '源路径' },
  { key: 'compressPath', label: '解压路径', hideOnMobile: true },
  { key: 'imageCount', label: '图片数' },
  { key: 'createTime', label: '创建时间', hideOnMobile: true },
]

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selected = ref<number[]>([])

async function load() {
  try { const res = await compressApi.get_compress(page.value, pageSize.value); total.value = res.count || 0; list.value = res.list || [] } catch { list.value = [] }
}
function reload() { page.value = 1; selected.value = []; load() }

watch(page, () => load())

async function doDelete(row: any) {
  if (!confirm(`确定删除此解压记录吗？`)) return
  try { await compressApi.delete_compress(row.compressId); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
async function batchDelete() {
  if (!confirm(`确定删除选中的 ${selected.value.length} 条记录吗？`)) return
  try { await compressApi.batch_delete_compress(selected.value); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
async function clearAll() {
  if (!confirm('确定清空所有解压记录吗？此操作不可撤销。')) return
  try { await compressApi.clear(); reload() } catch (e: any) { alert(e?.message || '清空失败') }
}
onMounted(() => load())
</script>

<style scoped>
.ta-manage-page { max-width: 120rem; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.2rem; }
.ta-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 0.8rem; flex-wrap: wrap; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-danger,.ta-btn-sm,.ta-btn-sm-danger { cursor: pointer; font-size: 1.3rem; border-radius: 0.8rem; }
.ta-btn-primary { padding: 0.8rem 1.6rem; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-ghost { padding: 0.8rem 1.6rem; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-danger { padding: 0.8rem 1.6rem; color: #fff; background: #ef4444; border: none; font-weight: 500; }
.ta-btn-danger:hover { background: #dc2626; }
.ta-btn-danger:disabled { opacity: .5; cursor: not-allowed; }
.ta-btn-sm { padding: 0.5rem 1rem; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 1.2rem; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }
.ta-path-cell { max-width: 30rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
</style>
