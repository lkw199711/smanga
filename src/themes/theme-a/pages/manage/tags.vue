<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>标签管理</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-primary" @click="openAdd">+ 添加标签</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
      </div>
    </div>

    <ResponsiveTable
      :columns="columns"
      :items="list"
      row-key="tagId"
      :total="total"
      v-model:page="page"
      :page-size="pageSize"
      selectable
      v-model:selected="selected"
      empty-text="暂无标签"
    >
      <template #cell-tagName="{ item }">
        <span class="ta-tag-chip" :style="{ background: item.tagColor || '#e5e7eb' }">{{ item.tagName }}</span>
      </template>
      <template #actions="{ item }">
        <button class="ta-btn-sm" @click="openEdit(item)">✏️ 编辑</button>
        <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(item)">🗑 删除</button>
      </template>
    </ResponsiveTable>

    <div v-if="dialogShow" class="ta-dialog-overlay" @click.self="dialogShow = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head"><h3>{{ editingTag ? '编辑标签' : '添加标签' }}</h3><button class="ta-dialog-close" @click="dialogShow = false">×</button></div>
        <div class="ta-dialog-body">
          <label class="ta-field"><span>名称</span><input v-model="form.tagName" /></label>
          <label class="ta-field"><span>颜色</span><input v-model="form.tagColor" type="color" style="height:4rem;padding:0.4rem" />
            <div class="ta-color-presets">
              <button v-for="c in presetColors" :key="c" class="ta-color-dot" :style="{ background: c }" :class="{ 'ta-color-dot-active': form.tagColor === c }" @click="form.tagColor = c" :title="c"></button>
            </div>
          </label>
          <label class="ta-field"><span>描述</span><input v-model="form.description" /></label>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="doSave">确认</button>
          <button class="ta-btn-ghost" @click="dialogShow = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import tagApi from '@/api/tag'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const columns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'tagId', label: '标签ID' },
  { key: 'tagName', label: '名称' },
  { key: 'tagColor', label: '颜色', hideOnMobile: true },
  { key: 'description', label: '描述', hideOnMobile: true },
  { key: 'mangaCount', label: '关联漫画' },
]

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selected = ref<number[]>([])
const dialogShow = ref(false)
const editingTag = ref<any>(null)
const form = ref({ tagName: '', tagColor: '#6366f1', description: '' })
const presetColors = ['#6366f1','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6','#8b5cf6','#6b7280','#1f2937']

async function load() {
  try { const res = await tagApi.get(page.value, pageSize.value); total.value = res.count || 0; list.value = res.list || [] } catch { list.value = [] }
}
function reload() { page.value = 1; selected.value = []; load() }

watch(page, () => load())
function openAdd() { editingTag.value = null; form.value = { tagName: '', tagColor: '#6366f1', description: '' }; dialogShow.value = true }
function openEdit(row: any) { editingTag.value = row; form.value = { tagName: row.tagName, tagColor: row.tagColor || '#6366f1', description: row.description || '' }; dialogShow.value = true }

async function doSave() {
  if (!form.value.tagName) return alert('标签名不能为空')
  try {
    if (editingTag.value) {
      await tagApi.update({ tagId: editingTag.value.tagId, ...form.value })
    } else {
      await tagApi.add(form.value.tagName, form.value.tagColor, form.value.description)
    }
    dialogShow.value = false; reload()
  } catch (e: any) { alert(e?.message || '操作失败') }
}
async function doDelete(row: any) {
  const countMsg = row.mangaCount ? `（关联 ${row.mangaCount} 部漫画）` : ''
  if (!confirm(`确定删除标签「${row.tagName}」${countMsg}吗？`)) return
  try { await tagApi.delete(row.tagId); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
async function batchDelete() {
  if (!confirm(`确定删除选中的 ${selected.value.length} 个标签吗？`)) return
  try { await tagApi.batch_delete(selected.value); reload() } catch (e: any) { alert(e?.message || '删除失败') }
}
onMounted(() => load())
</script>

<style scoped>
.ta-manage-page { max-width: 110rem; }
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
.ta-tag-chip { padding: 0.2rem 1rem; border-radius: 1rem; font-size: 1.2rem; color: #fff; display: inline-block; }

.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 1.4rem; width: 48rem; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 0.8rem 3.2rem rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 1.6rem 2rem; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 1.6rem; font-weight: 600; }
.ta-dialog-close { width: 3.2rem; height: 3.2rem; border: none; background: none; font-size: 2rem; cursor: pointer; color: #9ca3af; border-radius: 0.6rem; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.6rem; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 0.8rem; padding: 1.2rem 2rem; border-top: 1px solid #eaeaea; }
.ta-field { display: flex; flex-direction: column; gap: 0.6rem; }
.ta-field span { font-size: 1.3rem; font-weight: 500; color: #374151; }
.ta-field input { padding: 0.8rem 1.2rem; border: 1px solid #eaeaea; border-radius: 0.8rem; font-size: 1.3rem; outline: none; }
.ta-field input:focus { border-color: #2563eb; }
.ta-color-presets { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.4rem; }
.ta-color-dot { width: 2.4rem; height: 2.4rem; border-radius: 50%; border: 0.2rem solid transparent; cursor: pointer; padding: 0; transition: all 0.15s; }
.ta-color-dot:hover { transform: scale(1.15); }
.ta-color-dot-active { border-color: #1f2937; box-shadow: 0 0 0 0.2rem #fff, 0 0 0 0.4rem #1f2937; }
</style>
