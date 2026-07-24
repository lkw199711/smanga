<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>漫画分享</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
      </div>
    </div>

    <ResponsiveTable
      :columns="columns"
      :items="list"
      row-key="shareId"
      :total="total"
      v-model:page="page"
      :page-size="pageSize"
      selectable
      v-model:selected="selected"
      empty-text="暂无分享记录"
    >
      <template #cell-link="{ value }">
        <span class="ta-path-cell" :title="value">{{ value || '-' }}</span>
      </template>
      <template #cell-expires="{ value }">
        {{ value ? new Date(value).toLocaleString() : '-' }}
      </template>
      <template #actions="{ item }">
        <button class="ta-btn-sm" @click="showDetail(item)">📋 详情</button>
        <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(item)">🗑 删除</button>
      </template>
    </ResponsiveTable>

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
import { ref, watch, onMounted } from 'vue'
import shareApi from '@/api/share'
import syncApi from '@/api/sync'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const columns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'shareId', label: 'ID' },
  { key: 'shareType', label: '类型' },
  { key: 'shareName', label: '名称' },
  { key: 'link', label: '链接', hideOnMobile: true },
  { key: 'expires', label: '过期时间', hideOnMobile: true },
  { key: 'createTime', label: '创建时间', hideOnMobile: true },
]

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selected = ref<number[]>([])
const detailShow = ref(false)
const detailData = ref<any>({ share: {}, manga: {}, media: {} })

async function load() {
  try { const res = await shareApi.get({ page: page.value, pageSize: pageSize.value }); total.value = res.count || 0; list.value = res.list || [] } catch { list.value = [] }
}
function reload() { page.value = 1; selected.value = []; load() }

watch(page, () => load())

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
.ta-path-cell { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
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
