<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>书签管理</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
      </div>
    </div>
    <div class="ta-table-wrap">
      <table class="ta-table">
        <thead>
          <tr><th class="ta-col-check"><input type="checkbox" @change="toggleAll" :checked="allSelected" /></th><th>#</th><th>书签ID</th><th>漫画</th><th>章节</th><th>页码</th><th>创建时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in list" :key="row.bookmarkId">
            <td><input type="checkbox" :value="row.bookmarkId" v-model="selected" /></td>
            <td>{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td>{{ row.bookmarkId }}</td>
            <td>{{ row.mangaName || '-' }}</td>
            <td>{{ row.chapterName || '-' }}</td>
            <td>{{ row.page }}</td>
            <td>{{ row.createTime }}</td>
            <td class="ta-col-actions">
              <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(row)">🗑 删除</button>
            </td>
          </tr>
          <tr v-if="list.length === 0"><td colspan="8" class="ta-empty">暂无书签</td></tr>
        </tbody>
      </table>
    </div>
    <div class="ta-pager" v-if="total > pageSize">
      <button :disabled="page <= 1" @click="page--; load()">‹ 上一页</button>
      <span>第 {{ page }} / {{ Math.ceil(total / pageSize) }} 页 (共 {{ total }} 条)</span>
      <button :disabled="page >= Math.ceil(total / pageSize)" @click="page++; load()">下一页 ›</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import bookmarkApi from '@/api/bookmark'

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selected = ref<number[]>([])

const allSelected = computed(() => list.value.length > 0 && selected.value.length === list.value.length)
function toggleAll(e: Event) { selected.value = (e.target as HTMLInputElement).checked ? list.value.map(r => r.bookmarkId) : [] }

async function load() {
  try { const res = await bookmarkApi.get(page.value, pageSize.value); total.value = res.count || 0; list.value = res.list || [] } catch { list.value = [] }
}
function reload() { page.value = 1; selected.value = []; load() }
async function doDelete(row: any) {
  if (!confirm(`确定删除此书签吗？`)) return
  try { await bookmarkApi.delete(row.bookmarkId); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
async function batchDelete() {
  if (!confirm(`确定删除选中的 ${selected.value.length} 个书签吗？`)) return
  try { await bookmarkApi.batch_delete(selected.value); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
onMounted(() => load())
</script>

<style scoped>
.ta-manage-page { max-width: 1100px; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ta-btn-ghost,.ta-btn-danger,.ta-btn-sm,.ta-btn-sm-danger { cursor: pointer; font-size: 13px; border-radius: 8px; }
.ta-btn-ghost { padding: 8px 16px; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-danger { padding: 8px 16px; color: #fff; background: #ef4444; border: none; font-weight: 500; }
.ta-btn-danger:hover { background: #dc2626; }
.ta-btn-danger:disabled { opacity: .5; cursor: not-allowed; }
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
</style>
