<template>
  <main :class="['theme-legacy-reader', `theme-legacy-reader-${themeState.current.toLowerCase()}`]">
    <template v-if="ready">
      <theme-reader-topbar v-if="config.browseTop" />
      <div v-if="config.browseTop" class="theme-reader-topbar-seat" />
      <section class="theme-legacy-reader-content" :class="readerMode">
        <component :is="readerComponent" :key="`${readerMode}-${route.params.chapterId}`" />
      </section>
    </template>
    <section v-else class="legacy-reader-bridge" aria-live="polite">
      <span v-if="!error">正在打开阅读器…</span>
      <template v-else>
        <span>{{ error }}</span>
        <button type="button" @click="router.back()">返回上一页</button>
      </template>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { config } from '@/store'
import { themeState } from '@/themes/store'
import chapterApi from '@/api/chapter'
import mangaApi from '@/api/manga'
import ThemeReaderTopbar from './legacy-reader/topbar.vue'

const route = useRoute()
const router = useRouter()
const error = ref('')
const ready = ref(false)

const readerRoutes = new Set(['flow', 'single', 'double', 'half', 'pdfView'])
const readerMode = computed(() => String(route.query.readerMode || 'flow'))
const readerComponent = computed(() => {
  const readers = {
    flow: defineAsyncComponent(() => import('@/views/browse-view/flow.vue')),
    single: defineAsyncComponent(() => import('@/views/browse-view/single.vue')),
    double: defineAsyncComponent(() => import('@/views/browse-view/double.vue')),
    half: defineAsyncComponent(() => import('@/views/browse-view/half.vue')),
    pdfView: defineAsyncComponent(() => import('@/views/browse-view/pdf.vue')),
  }
  return readers[readerMode.value as keyof typeof readers] || readers.flow
})

async function prepareReader() {
  ready.value = false
  error.value = ''
  const chapterId = Number(route.params.chapterId)
  if (!chapterId) {
    error.value = '无效的章节地址'
    return
  }

  try {
    let chapter: any = null
    let mangaId = Number(route.query.mangaId)
    let mediaId = Number(route.query.mediaId)
    const requestedMode = String(route.query.readerMode || '')
    if (!mangaId || !mediaId || !readerRoutes.has(requestedMode)) {
      chapter = await chapterApi.get_by_id(chapterId)
    }
    chapter ||= { mangaId, mediaId }
    if (!chapter?.mangaId || !chapter?.mediaId) throw new Error('章节不存在或无权访问')

    // 阅读模式来自漫画配置；接口暂时不可用时仍可用条漫模式打开旧阅读器。
    let manga: any = {}
    try {
      manga = await mangaApi.get_manga_info(Number(chapter.mangaId))
    } catch (cause) {
      console.warn('读取漫画阅读模式失败，使用条漫模式:', cause)
    }
    const browseType = chapter.chapterType === 'pdf'
      ? 'pdfView'
      : readerRoutes.has(requestedMode) ? requestedMode : readerRoutes.has(manga?.browseType) ? manga.browseType : 'flow'

    const query = {
      ...route.query,
      mediaId: String(chapter.mediaId),
      mangaId: String(chapter.mangaId),
      chapterId: String(chapterId),
      readerMode: browseType,
    }
    if (route.query.mediaId !== query.mediaId || route.query.mangaId !== query.mangaId || route.query.readerMode !== query.readerMode) {
      await router.replace({ name: 't-reader', params: { chapterId }, query })
    }
    ready.value = true
  } catch (cause) {
    console.error('打开旧阅读器失败:', cause)
    error.value = '无法打开该章节'
  }
}

onMounted(prepareReader)
watch(() => route.params.chapterId, prepareReader)
</script>

<style scoped>
.theme-legacy-reader {
  --theme-reader-topbar-bg: #111827;
  --theme-reader-chapter-bg: #1f2937;
  --theme-reader-topbar-text: #f8fafc;
  --theme-reader-topbar-accent: #60a5fa;
  min-height: 100vh;
  background: #111;
}

.theme-legacy-reader-a {
  --theme-reader-topbar-bg: #0f172a;
  --theme-reader-chapter-bg: #1e293b;
  --theme-reader-topbar-accent: #38bdf8;
}

.theme-legacy-reader-b {
  --theme-reader-topbar-bg: #2e1065;
  --theme-reader-chapter-bg: #4c1d95;
  --theme-reader-topbar-accent: #f0abfc;
}

.theme-legacy-reader-d {
  --theme-reader-topbar-bg: #ffffff;
  --theme-reader-chapter-bg: #f8fafc;
  --theme-reader-topbar-text: #1f2937;
  --theme-reader-topbar-accent: #2563eb;
}

.theme-legacy-reader-content {
  min-height: 100vh;
}

.theme-reader-topbar-seat {
  height: 9.6rem;
}

.theme-legacy-reader-content.single,
.theme-legacy-reader-content.double,
.theme-legacy-reader-content.half {
  height: 100vh;
}

.legacy-reader-bridge {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 12px;
  color: #64748b;
  background: #f8fafc;
  text-align: center;
}

button {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 7px 12px;
  background: #fff;
  color: #334155;
  cursor: pointer;
}
</style>
