<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>漫画分享</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
      </div>
    </div>
    <div class="ta-table-wrap">
      <table class="ta-table">
        <thead>
          <tr>
            <th class="ta-col-check"><input type="checkbox" @change="toggleAll" :checked="allSelected" /></th>
            <th>#</th>
            <th>ID</th>
            <th>类型</th>
            <th>名称</th>
            <th>链接</th>
            <th>过期时间</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in list" :key="row.shareId">
            <td><input type="checkbox" :value="row.shareId" v-model="selected" /></td>
            <td>{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td>{{ row.shareId }}</td>
            <td>{{ row.shareType || '-' }}</td>
            <td>{{ row.shareName || '-' }}</td>
            <td class="ta-path-cell" :title="row.link">{{ row.link || '-' }}</td>
            <td>{{ row.expires ? new Date(row.expires).toLocaleString() : '-' }}</td>
            <td>{{ row.createTime }}</td>
            <td class="ta-col-actions">
              <button class="ta-btn-sm" @click="showDetail(row)">📋 详情</button>
              <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(row)">🗑 删除</button>
            </td>
          </tr>
          <tr v-if="list.length === 0"><td colspan="9" class="ta-empty">暂无分享记录</td></tr>
        </tbody>
      </table>
    </div>
    <div class="ta-pager" v-if="total > pageSize">
      <button :disabled="page <= 1" @click="page--; load()">‹ 上一页</button>
      <span>第 {{ page }} / {{ Math.ceil(total / pageSize) }} 页 (共 {{ total }} 条)</span>
      <button :disabled="page >= Math.ceil(total / pageSize)" @click="page++; load()">下一页 ›</button>
    </div>

    <div v-if="detailShow" class="ta-dialog-overlay" @click.self="detailShow = false">
      <div class="ta-dialog" style="width:560px">
        <div class="ta-dialog-head"><h3>分享详情</h3><button class="ta-dialog-close" @click="detailShow = false">×</button></div>
        <div class="ta-dialog-body">
          <div class="ta-card ta-card-preview" v-if="detailData.share?.shareType">
            <p><strong>类型:</strong> {{ detailData.share.shareType === 'manga' ? '漫画' : '媒体库' }}</p>
            <p v-if="detailData.manga?.mangaName"><strong>漫画:</strong> {{ detailData.manga.mangaName }} ({{ detailData.manga.chapterCount }} 章)</p>
            <p v-if="detailData.media?.mediaName"><strong>媒体库:</strong> {{ detailData.media.mediaName }}</p>
          </div>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-ghost" @click="detailShow = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import shareApi from '@/api/share'
import syncApi from '@/api/sync'

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selected = ref<number[]>([])
const detailShow = ref(false)
const detailData = ref<any>({ share: {}, manga: {}, media: {} })

const allSelected = computed(() => list.value.length > 0 && selected.value.length === list.value.length)
function toggleAll(e: Event) { selected.value = (e.target as HTMLInputElement).checked ? list.value.map(r => r.shareId) : [] }

async function load() {
  try { const res = await shareApi.get({ page: page.value, pageSize: pageSize.value }); total.value = res.count || 0; list.value = res.list || [] } catch { list.value = [] }
}
function reload() { page.value = 1; selected.value = []; load() }

async function showDetail(row: any) {
  try {
    const res = await syncApi.analysis(row.link)
    detailData.value = res.data || {}
  } catch { detailData.value = { share: {} } }
  detailShow.value = true
}

async function doDelete(row: any) {
  if (!confirm(`确定删除此分享记录吗？`)) return
  try { await shareApi.delete(row.shareId); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
async function batchDelete() {
  if (!confirm(`确定删除选中的 ${selected.value.length} 条分享记录吗？`)) return
  try { await shareApi.batch_delete(selected.value); reload() } catch (e: any) { alert(e?.message || '删除失败') }
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
.ta-table-wrap { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; overflow-x: auto; }
.ta-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ta-table th { text-align: left; padding: 10px 12px; color: #6b7280; font-weight: 600; font-size: 12px; border-bottom: 1px solid #eaeaea; background: #fafafa; }
.ta-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
.ta-table tr:last-child td { border-bottom: none; }
.ta-table tr:hover td { background: #fafafa; }
.ta-col-check { width: 40px; text-align: center; }
.ta-col-actions { white-space: nowrap; display: flex; gap: 6px; }
.ta-empty { text-align: center; color: #9ca3af; padding: 32px 0 !important; }
.ta-path-cell { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ta-pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: 13px; color: #6b7280; }
.ta-pager button { padding: 6px 14px; font-size: 13px; border: 1px solid #eaeaea; border-radius: 8px; background: #fff; cursor: pointer; }
.ta-pager button:disabled { opacity: .4; cursor: not-allowed; }
.ta-card { background: #f8f9fa; border: 1px solid #eaeaea; border-radius: 8px; padding: 12px 16px; font-size: 13px; }
.ta-card p { margin: 4px 0; }
.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 14px; width: 480px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
.ta-dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 20px; cursor: pointer; color: #9ca3af; border-radius: 6px; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 20px; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #eaeaea; }
</style>
