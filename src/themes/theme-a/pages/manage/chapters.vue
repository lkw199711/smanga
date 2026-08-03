<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>章节管理</h1>
      <div class="ta-page-actions">
        <div class="ta-search-box">
          <input v-model="searchMangaId" placeholder="漫画ID" type="number" style="width:12rem" @keydown.enter="search" />
          <input v-model="keyword" placeholder="章节名称..." @keydown.enter="search" />
          <SortSelector v-model="orderBy" model="chapter" class="ta-select" style="width:13rem" @change="search" />
          <button class="ta-btn-ghost" @click="search">🔍</button>
        </div>
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
      </div>
    </div>

    <ResponsiveTable
      :columns="columns"
      :items="list"
      row-key="chapterId"
      :total="total"
      v-model:page="page"
      :page-size="pageSize"
      selectable
      v-model:selected="selected"
      empty-text="暂无章节"
    >
      <template #actions="{ item }">
        <button class="ta-btn-sm" @click="openEdit(item)">✏️ 编辑</button>
        <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(item)">🗑 删除</button>
        <button class="ta-btn-sm" @click="deleteCompress(item)">🗜 删压缩</button>
      </template>
    </ResponsiveTable>

    <ChapterModifyDialog
      v-model:editChapterDialog="editDialog"
      :chapter-info="editingChapter || {}"
      @reload="reload"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { showThemeAlert, showThemeConfirm } from '@/themes/components/theme-alert'
import chapterApi from '@/api/chapter'
import ChapterModifyDialog from '@/themes/components/chapter-modify-dialog.vue'
import SortSelector from '@/themes/components/sort-selector.vue'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const columns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'chapterId', label: '章节ID' },
  { key: 'mangaId', label: '漫画ID', hideOnMobile: true },
  { key: 'chapterName', label: '章节名' },
  { key: 'chapterNumber', label: '章节号' },
  { key: 'chapterPage', label: '页数', hideOnMobile: true },
  { key: 'createTime', label: '创建时间', hideOnMobile: true },
]

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selected = ref<number[]>([])
const searchMangaId = ref('')
const keyword = ref('')
const orderBy = ref('updateTimeDesc')
const editDialog = ref(false)
const editingChapter = ref<any>(null)

async function load() {
  const mid = Number(searchMangaId.value) || 0
  try {
    const res = await chapterApi.get({ mangaId: mid, page: page.value, pageSize: pageSize.value, order: orderBy.value, keyWord: keyword.value })
    total.value = res.count || 0; list.value = res.list || []
  } catch { list.value = [] }
}

function search() { page.value = 1; load() }
function reload() { keyword.value = ''; page.value = 1; selected.value = []; load() }

watch(page, () => load())

function openEdit(row: any) {
  editingChapter.value = { ...row }
  editDialog.value = true
}

async function doDelete(row: any) {
  if (!(await showThemeConfirm(`确定删除章节「${row.chapterName}」吗？`))) return
  try { await chapterApi.delete_chapter(row.chapterId); reload() } catch (e: any) { showThemeAlert(e?.message || '删除失败') }
}

async function deleteCompress(row: any) {
  if (!(await showThemeConfirm(`确定删除章节「${row.chapterName}」的压缩缓存吗？`))) return
  try { await chapterApi.compress_delete(row.chapterId); showThemeAlert('压缩缓存已删除') } catch (e: any) { showThemeAlert(e?.message || '操作失败') }
}

async function batchDelete() {
  if (!(await showThemeConfirm(`确定删除选中的 ${selected.value.length} 个章节吗？`))) return
  try { await chapterApi.batch_delete_chapter(selected.value); reload() } catch (e: any) { showThemeAlert(e?.message || '删除失败') }
}

onMounted(() => load())
</script>

<style scoped>
.ta-manage-page { max-width: 110rem; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.2rem; }
.ta-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; }
.ta-search-box { display: flex; gap: 0.4rem; }
.ta-search-box input { padding: 0.7rem 1.2rem; border: 1px solid #eaeaea; border-radius: 0.8rem; font-size: 1.3rem; outline: none; width: 16rem; }
.ta-search-box input:focus { border-color: #2563eb; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-danger,.ta-btn-sm,.ta-btn-sm-danger { cursor: pointer; font-size: 1.3rem; border-radius: 0.8rem; }
.ta-btn-primary { padding: 0.8rem 1.6rem; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-primary:disabled,.ta-btn-danger:disabled { opacity: .5; cursor: not-allowed; }
.ta-btn-ghost { padding: 0.8rem 1.6rem; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-danger { padding: 0.8rem 1.6rem; color: #fff; background: #ef4444; border: none; font-weight: 500; }
.ta-btn-danger:hover { background: #dc2626; }
.ta-btn-sm { padding: 0.5rem 1rem; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 1.2rem; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }
</style>
