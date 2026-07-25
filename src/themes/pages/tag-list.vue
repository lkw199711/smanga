<template>
  <div class="tm-tag-list-page">
    <div class="tm-tag-list-head">
      <h1>标签</h1>
      <span class="tm-tag-list-count" v-if="tags.length">共 {{ tags.length }} 个标签</span>
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
      暂无标签，请先在「标签管理」中创建标签
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import tagApi from '@/api/tag'
import TagFilterBar from '@/themes/components/tag-filter-bar.vue'
import MangaCard from '@/themes/components/manga-card.vue'
import SortSelector from '@/themes/components/sort-selector.vue'
import { themeState } from '@/themes/store'
import { openThemeActionSheet } from '@/themes/context-menu'
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

const cardVariant = computed(() => {
  // Map theme names to MangaCard variant
  const map: Record<string, 'A' | 'B' | 'D'> = { A: 'A', B: 'B', D: 'D', Legacy: 'A' }
  return map[themeState.current] || 'A'
})

onMounted(async () => {
  try {
    const res = await tagApi.get(1, 200)
    tags.value = (res?.list || []).map((t: any) => ({
      tagId: t.tagId,
      tagName: t.tagName,
      tagColor: t.tagColor || '#6366f1',
      mangaCount: t.mangaCount,
    }))
  } catch { /* empty */ }
})

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
  row-gap: 4.8rem;
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
