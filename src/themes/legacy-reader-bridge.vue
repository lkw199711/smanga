<template>
  <main
    :class="['theme-legacy-reader', `theme-legacy-reader-${themeState.current.toLowerCase()}`]"
    @contextmenu.prevent="openControlPanel"
    v-long-press="openControlPanel"
  >
    <android-seat />
    <template v-if="ready">
      <theme-reader-topbar v-if="config.browseTop" />
      <theme-reader-control-panel />
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
import useBrowseStore from '@/store/browse'
import ThemeReaderTopbar from './legacy-reader/topbar.vue'
import ThemeReaderControlPanel from './legacy-reader/control-panel.vue'
import androidSeat from '@/layout/components/android-seat.vue'
import { useNavigationStore } from '@/store/navigation'

const route = useRoute()
const router = useRouter()
// theme 阅读器暂时复用 src/views/browse-view/**。这些旧内容组件以 browse 为
// 唯一状态源，所以桥接层只负责初始化兼容状态，不建立第二套 reader store。
const browseStore = useBrowseStore()
const navigationStore = useNavigationStore()
const error = ref('')
const ready = ref(false)

function openControlPanel() {
  config.controlPanel = true
}

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

    // 旧阅读内容组件使用 1 起始的 browseStore.page。
    // 首页/历史/书签会在跳转前通过 pageJump 传入上次阅读页码。
    const pendingPage = navigationStore.consumeReaderPage()

    // 阅读器视图在 setup 阶段会立即监听 imagePathList。若保留上一章节的图片，
    // 监听器会先以默认 currentPage=1 回写 browseStore.page，覆盖继续阅读页码。
    browseStore.imagePathList = []
    browseStore.imageFileList = []
    browseStore.pageImage = ''
    browseStore.page = pendingPage

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
  padding-top: env(safe-area-inset-top);
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

.theme-legacy-reader-content.single,
.theme-legacy-reader-content.double,
.theme-legacy-reader-content.half {
  height: 100vh;
}

.legacy-reader-bridge {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 1.2rem;
  color: #64748b;
  background: #f8fafc;
  text-align: center;
}

button {
  border: 1px solid #cbd5e1;
  border-radius: 0.6rem;
  padding: 0.7rem 1.2rem;
  background: #fff;
  color: #334155;
  cursor: pointer;
}
</style>
