<template>
  <div class="tm-tag-list-page">
    <div class="tm-tag-list-head">
      <h1>标签</h1>
      <span class="tm-tag-list-count" v-if="tags.length">共 {{ tags.length }} 个标签</span>
      <button
        v-if="isAdmin"
        class="tm-tag-list-create-button"
        type="button"
        @click="openCreate"
      >
        + 新增标签
      </button>
    </div>

    <!-- 标签过滤栏 -->
    <div class="tm-tag-list-filter" v-if="tags.length">
      <TagFilterBar
        :tags="tags"
        v-model="selectedTagIds"
        @change="onFilterChange"
      />
    </div>

    <!-- 漫画结果网格 -->
    <div class="tm-tag-list-results" v-if="selectedTagIds.length > 0">
      <div class="tm-tag-list-result-head">
        <span>筛选结果 ({{ total }})</span>
        <SortSelector v-model="orderBy" model="manga" @update:model-value="onSortChange" />
      </div>

      <div class="tm-tag-list-grid" v-if="mangaList.length">
        <MangaCard
          v-for="item in mangaList"
          :key="item.mangaId"
          :item="item"
          :variant="cardVariant"
          @click="goManga(item)"
          @contextmenu="onContextmenu(item, $event)"
        />
      </div>

      <div class="tm-tag-list-empty" v-if="!loading && mangaList.length === 0">
        该标签下暂无漫画
      </div>

      <!-- 分页 -->
      <div class="tm-tag-list-pager" v-if="total > pageSize">
        <button :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
        <span>第 {{ page }} / {{ Math.ceil(total / pageSize) }} 页</span>
        <button :disabled="page >= Math.ceil(total / pageSize)" @click="goPage(page + 1)">下一页</button>
      </div>
    </div>

    <!-- 空标签状态 -->
    <div class="tm-tag-list-empty" v-if="tags.length === 0">
      {{ isAdmin ? '暂无标签，点击右上角新增标签' : '暂无标签' }}
    </div>

    <!-- 新增标签弹框（仅管理员） -->
    <div
      v-if="isAdmin && createDialogVisible"
      class="tm-tag-create-overlay"
      @click.self="closeCreate"
    >
      <form class="tm-tag-create-dialog" @submit.prevent="createTag">
        <div class="tm-tag-create-head">
          <h2>新增标签</h2>
          <button type="button" class="tm-tag-create-close" aria-label="关闭" @click="closeCreate">
            ×
          </button>
        </div>
        <div class="tm-tag-create-body">
          <label class="tm-tag-create-field">
            <span>标签名称</span>
            <input
              ref="tagNameInput"
              v-model="createForm.tagName"
              type="text"
              maxlength="100"
              autocomplete="off"
              placeholder="请输入标签名称"
            />
          </label>
          <label class="tm-tag-create-field">
            <span>标签颜色</span>
            <div class="tm-tag-create-color-row">
              <input v-model="createForm.tagColor" type="color" aria-label="标签颜色" />
              <code>{{ createForm.tagColor }}</code>
            </div>
          </label>
          <label class="tm-tag-create-field">
            <span>描述</span>
            <textarea
              v-model="createForm.description"
              rows="3"
              maxlength="500"
              placeholder="选填"
            />
          </label>
        </div>
        <div class="tm-tag-create-foot">
          <button type="button" class="tm-tag-create-cancel" @click="closeCreate">取消</button>
          <button
            type="submit"
            class="tm-tag-create-submit"
            :disabled="creating || !createForm.tagName.trim()"
          >
            {{ creating ? '创建中…' : '确认新增' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import tagApi from '@/api/tag'
import TagFilterBar from '@/themes/components/tag-filter-bar.vue'
import MangaCard from '@/themes/components/manga-card.vue'
import SortSelector from '@/themes/components/sort-selector.vue'
import { themeState } from '@/themes/store'
import { openThemeActionSheet } from '@/themes/context-menu'
import { Cookies } from '@/utils'
import { invalidateTagCache } from '@/themes/components/composables/use-tag-picker'
import type { TagItem } from '@/themes/components/tag-filter-bar.vue'

const router = useRouter()

const tags = ref<TagItem[]>([])
const selectedTagIds = ref<number[]>([])
const mangaList = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 24
const orderBy = ref('')
const loading = ref(false)
const createDialogVisible = ref(false)
const creating = ref(false)
const tagNameInput = ref<HTMLInputElement | null>(null)
const createForm = ref({ tagName: '', tagColor: '#6366f1', description: '' })
const isAdmin = computed(() => Cookies.getRole() === 'admin')

const cardVariant = computed(() => {
  // Map theme names to MangaCard variant
  const map: Record<string, 'A' | 'B' | 'D'> = { A: 'A', B: 'B', D: 'D', Legacy: 'A' }
  return map[themeState.current] || 'A'
})

async function loadTags() {
  try {
    const res = await tagApi.get(1, 200)
    tags.value = (res?.list || []).map((t: any) => ({
      tagId: t.tagId,
      tagName: t.tagName,
      tagColor: t.tagColor || '#6366f1',
      mangaCount: t.mangaCount,
    }))
  } catch {
    tags.value = []
  }
}

onMounted(() => {
  loadTags()
})

async function openCreate() {
  if (!isAdmin.value) return
  createForm.value = { tagName: '', tagColor: '#6366f1', description: '' }
  createDialogVisible.value = true
  await nextTick()
  tagNameInput.value?.focus()
}

function closeCreate() {
  if (creating.value) return
  createDialogVisible.value = false
}

async function createTag() {
  if (!isAdmin.value || creating.value) return
  const tagName = createForm.value.tagName.trim()
  if (!tagName) return

  creating.value = true
  try {
    await tagApi.add(tagName, createForm.value.tagColor, createForm.value.description.trim())
    invalidateTagCache()
    createDialogVisible.value = false
    await loadTags()
    ElMessage.success('标签新增成功')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || '标签新增失败')
  } finally {
    creating.value = false
  }
}

function onFilterChange(ids: number[]) {
  page.value = 1
  loadManga()
}

function onSortChange() {
  page.value = 1
  loadManga()
}

async function loadManga() {
  if (selectedTagIds.value.length === 0) {
    mangaList.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const res = await tagApi.get_manga_by_tags(
      selectedTagIds.value.join(','),
      page.value,
      pageSize,
      orderBy.value
    )
    mangaList.value = res?.list || []
    total.value = res?.count || 0
  } catch {
    mangaList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function goPage(p: number) {
  page.value = p
  loadManga()
}

function goManga(item: any) {
  router.push(`/t/manga/${item.mangaId}`)
}

function onContextmenu(item: any, event: MouseEvent) {
  openThemeActionSheet('manga', item)
}
</script>

<style scoped>
.tm-tag-list-page {
  padding: 2.4rem;
  max-width: 140rem;
  margin: 0 auto;
}

.tm-tag-list-head {
  display: flex;
  align-items: baseline;
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.tm-tag-list-head h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--sd-text, #1f2937);
}

.tm-tag-list-count {
  font-size: 1.3rem;
  color: var(--sd-text-secondary, #9ca3af);
}

.tm-tag-list-create-button {
  margin-left: auto;
  padding: 0.8rem 1.5rem;
  border: 0;
  border-radius: 0.8rem;
  background: var(--sd-primary, #2563eb);
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s;
}

.tm-tag-list-create-button:hover {
  filter: brightness(0.92);
}

.tm-tag-list-filter {
  margin-bottom: 2.4rem;
}

.tm-tag-list-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.6rem;
  font-size: 1.4rem;
  color: var(--sd-text, #374151);
}

.tm-tag-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.6rem;
  row-gap: 1.2rem;
}

.tm-tag-list-empty {
  text-align: center;
  padding: 6rem 2rem;
  color: var(--sd-text-secondary, #9ca3af);
  font-size: 1.4rem;
}

.tm-tag-list-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  margin-top: 2.4rem;
  font-size: 1.3rem;
  color: var(--sd-text-secondary, #6b7280);
}

.tm-tag-list-pager button {
  padding: 0.6rem 1.4rem;
  font-size: 1.3rem;
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: 0.8rem;
  background: var(--sd-bg2, #fff);
  color: var(--sd-text, #374151);
  cursor: pointer;
  transition: all 0.15s;
}

.tm-tag-list-pager button:hover:not(:disabled) {
  border-color: var(--sd-primary, #2563eb);
  color: var(--sd-primary, #2563eb);
}

.tm-tag-list-pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tm-tag-create-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.6rem;
  background: rgb(0 0 0 / 45%);
}

.tm-tag-create-dialog {
  width: min(46rem, 100%);
  overflow: hidden;
  border: 1px solid var(--sd-border, #e5e7eb);
  border-radius: 1.4rem;
  background: var(--sd-bg2, #fff);
  color: var(--sd-text, #1f2937);
  box-shadow: 0 1.6rem 4rem rgb(0 0 0 / 20%);
}

.tm-tag-create-head,
.tm-tag-create-foot {
  display: flex;
  align-items: center;
  padding: 1.5rem 1.8rem;
}

.tm-tag-create-head {
  justify-content: space-between;
  border-bottom: 1px solid var(--sd-border, #e5e7eb);
}

.tm-tag-create-head h2 {
  margin: 0;
  font-size: 1.7rem;
}

.tm-tag-create-close {
  border: 0;
  background: transparent;
  color: var(--sd-text-secondary, #9ca3af);
  font-size: 2.4rem;
  line-height: 1;
  cursor: pointer;
}

.tm-tag-create-body {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding: 1.8rem;
}

.tm-tag-create-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.tm-tag-create-field input[type='text'],
.tm-tag-create-field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--sd-border, #d1d5db);
  border-radius: 0.8rem;
  outline: none;
  background: var(--sd-bg, #fff);
  color: var(--sd-text, #1f2937);
  font: inherit;
  font-weight: 400;
  resize: vertical;
}

.tm-tag-create-field input:focus,
.tm-tag-create-field textarea:focus {
  border-color: var(--sd-primary, #2563eb);
}

.tm-tag-create-color-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tm-tag-create-color-row input {
  width: 5rem;
  height: 3.6rem;
  padding: 0.2rem;
  border: 1px solid var(--sd-border, #d1d5db);
  border-radius: 0.7rem;
  background: transparent;
  cursor: pointer;
}

.tm-tag-create-color-row code {
  color: var(--sd-text-secondary, #6b7280);
  font-size: 1.2rem;
}

.tm-tag-create-foot {
  justify-content: flex-end;
  gap: 0.8rem;
  border-top: 1px solid var(--sd-border, #e5e7eb);
}

.tm-tag-create-cancel,
.tm-tag-create-submit {
  padding: 0.8rem 1.4rem;
  border-radius: 0.8rem;
  font-size: 1.3rem;
  cursor: pointer;
}

.tm-tag-create-cancel {
  border: 1px solid var(--sd-border, #d1d5db);
  background: transparent;
  color: var(--sd-text, #374151);
}

.tm-tag-create-submit {
  border: 0;
  background: var(--sd-primary, #2563eb);
  color: #fff;
  font-weight: 600;
}

.tm-tag-create-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 76.8rem) {
  .tm-tag-list-page {
    padding: 1.6rem;
  }
  .tm-tag-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 1.2rem;
  }
}
</style>
