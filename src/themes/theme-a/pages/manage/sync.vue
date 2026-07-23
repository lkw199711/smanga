<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>漫画同步</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-primary" @click="openAdd">+ 添加同步</button>
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
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in list" :key="row.syncId">
            <td><input type="checkbox" :value="row.syncId" v-model="selected" /></td>
            <td>{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td>{{ row.syncId }}</td>
            <td>{{ row.syncType || '-' }}</td>
            <td>{{ row.syncName || '-' }}</td>
            <td class="ta-path-cell" :title="row.link">{{ row.link || '-' }}</td>
            <td>{{ row.createTime }}</td>
            <td class="ta-col-actions">
              <button class="ta-btn-sm ta-btn-sm-success" @click="doExecute(row)">🔄 执行</button>
              <button class="ta-btn-sm" @click="showDetail(row)">📋 详情</button>
              <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(row)">🗑 删除</button>
            </td>
          </tr>
          <tr v-if="list.length === 0"><td colspan="8" class="ta-empty">暂无同步记录</td></tr>
        </tbody>
      </table>
    </div>
    <div class="ta-pager" v-if="total > pageSize">
      <button :disabled="page <= 1" @click="page--; load()">‹ 上一页</button>
      <span>第 {{ page }} / {{ Math.ceil(total / pageSize) }} 页 (共 {{ total }} 条)</span>
      <button :disabled="page >= Math.ceil(total / pageSize)" @click="page++; load()">下一页 ›</button>
    </div>

    <!-- 添加同步弹窗 -->
    <div v-if="addShow" class="ta-dialog-overlay" @click.self="addShow = false">
      <div class="ta-dialog" style="width:560px">
        <div class="ta-dialog-head"><h3>添加同步</h3><button class="ta-dialog-close" @click="addShow = false">×</button></div>
        <div class="ta-dialog-body">
          <label class="ta-field"><span>分享链接</span><input v-model="addForm.link" placeholder="输入 smanga 分享链接" @keydown.enter="analysisLink" /></label>
          <button class="ta-btn-primary" @click="analysisLink" style="align-self:flex-start">🔍 解析链接</button>
          <div v-if="analysisResult" class="ta-card ta-card-preview">
            <p><strong>类型:</strong> {{ analysisResult.share?.shareType === 'manga' ? '漫画' : '媒体库' }}</p>
            <p v-if="analysisResult.manga"><strong>漫画:</strong> {{ analysisResult.manga.mangaName }}</p>
            <p v-if="analysisResult.media"><strong>媒体库:</strong> {{ analysisResult.media.mediaName }}</p>
          </div>
          <label class="ta-field"><span>接收路径</span><input v-model="addForm.receivedPath" placeholder="输入接收漫画的路径" /></label>
          <label class="ta-field ta-field-switch"><span>自动同步</span>
            <label class="ta-switch"><input type="checkbox" v-model="addForm.auto" /><span class="ta-switch-slider"></span></label>
          </label>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="doCreate">确认添加</button>
          <button class="ta-btn-ghost" @click="addShow = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="detailShow" class="ta-dialog-overlay" @click.self="detailShow = false">
      <div class="ta-dialog" style="width:560px">
        <div class="ta-dialog-head"><h3>同步详情</h3><button class="ta-dialog-close" @click="detailShow = false">×</button></div>
        <div class="ta-dialog-body">
          <div class="ta-card ta-card-preview" v-if="detailData.share?.shareType">
            <p><strong>类型:</strong> {{ detailData.share.shareType === 'manga' ? '漫画' : '媒体库' }}</p>
            <p v-if="detailData.manga?.mangaName"><strong>漫画:</strong> {{ detailData.manga.mangaName }}</p>
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
import syncApi from '@/api/sync'

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selected = ref<number[]>([])
const addShow = ref(false)
const detailShow = ref(false)
const analysisResult = ref<any>(null)
const detailData = ref<any>({ share: {}, manga: {}, media: {} })
const addForm = ref({ link: '', receivedPath: '', auto: false })

const allSelected = computed(() => list.value.length > 0 && selected.value.length === list.value.length)
function toggleAll(e: Event) { selected.value = (e.target as HTMLInputElement).checked ? list.value.map(r => r.syncId) : [] }

async function load() {
  try { const res = await syncApi.get({ page: page.value, pageSize: pageSize.value }); total.value = res.count || 0; list.value = res.list || [] } catch { list.value = [] }
}
function reload() { page.value = 1; selected.value = []; load() }

function openAdd() { addForm.value = { link: '', receivedPath: '', auto: false }; analysisResult.value = null; addShow.value = true }

async function analysisLink() {
  if (!addForm.value.link.trim()) return alert('请输入分享链接')
  try {
    const res = await syncApi.analysis(addForm.value.link)
    analysisResult.value = res.data
    if (!addForm.value.receivedPath && res.data.share) {
      addForm.value.receivedPath = res.data.share.receivedPath || ''
    }
  } catch (e: any) { alert(e?.message || '解析失败') }
}

async function doCreate() {
  if (!addForm.value.receivedPath) return alert('请选择接收路径')
  if (!analysisResult.value?.share?.shareId) return alert('请先解析链接')
  try {
    const share = analysisResult.value.share
    await syncApi.create({
      syncType: share.shareType,
      syncName: share.shareType === 'manga' ? analysisResult.value.manga?.mangaName : analysisResult.value.media?.mediaName,
      origin: share.origin,
      receivedPath: addForm.value.receivedPath,
      shareId: share.shareId,
      link: share.link,
      secret: share.secret,
      auto: addForm.value.auto ? 1 : 0,
      token: '',
    })
    addShow.value = false; reload()
  } catch (e: any) { alert(e?.message || '添加失败') }
}

async function showDetail(row: any) {
  try {
    const res = await syncApi.analysis(row.link)
    detailData.value = res.data || {}
  } catch { detailData.value = { share: {} } }
  detailShow.value = true
}

async function doExecute(row: any) {
  try { await syncApi.execute(row.syncId); alert('同步任务已提交') } catch (e: any) { alert(e?.message || '执行失败') }
}

async function doDelete(row: any) {
  if (!confirm(`确定删除此同步记录吗？`)) return
  try { await syncApi.delete(row.syncId); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
async function batchDelete() {
  if (!confirm(`确定删除选中的 ${selected.value.length} 条同步记录吗？`)) return
  try { await syncApi.batch_delete(selected.value); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
onMounted(() => load())
</script>

<style scoped>
.ta-manage-page { max-width: 1100px; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-danger,.ta-btn-sm,.ta-btn-sm-danger,.ta-btn-sm-success { cursor: pointer; font-size: 13px; border-radius: 8px; }
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
.ta-btn-sm-success { color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; }
.ta-btn-sm-success:hover { background: #dcfce7; }
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
.ta-card { background: #f8f9fa; border: 1px solid #eaeaea; border-radius: 8px; padding: 12px 16px; margin-top: 8px; font-size: 13px; }
.ta-card p { margin: 4px 0; }
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
