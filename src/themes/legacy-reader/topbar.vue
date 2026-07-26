<template>
  <header class="reader-quick-bar" :class="{ 'is-mobile': isMobile }">
    <!-- 章节标题条 -->
    <div class="chapter-name" :title="browse.currentChapter?.chapterName">
      <span class="chapter-name-text">{{ browse.currentChapter?.chapterName || '' }}</span>
    </div>

    <!-- 桌面端: 胶囊快捷条 -->
    <nav v-if="!isMobile" class="quick-capsule" aria-label="reader-quick-nav">
      <button class="qc-btn" title="Smanga · Home" @click="go('home')">
        <i class="iconfont icon-home" />
        <span class="qc-label">Smanga</span>
      </button>
      <button class="qc-btn" :title="$t('sidebar.mediaList')" @click="go('media')">
        <i class="iconfont icon-folder" />
        <span class="qc-label">{{ $t('sidebar.mediaList') }}</span>
      </button>
      <button class="qc-btn" :disabled="!mediaId" :title="$t('sidebar.mangaList')" @click="go('manga-list')">
        <i class="iconfont icon-menu" />
        <span class="qc-label">{{ $t('sidebar.mangaList') }}</span>
      </button>
      <button class="qc-btn" :disabled="!mangaId" :title="$t('sidebar.mangaInfo')" @click="go('manga-info')">
        <i class="iconfont icon-info" />
      <span class="qc-label">{{ $t('sidebar.mangaInfo') }}</span>
      </button>

      <span class="qc-divider" aria-hidden="true" />

      <el-dropdown trigger="click" @command="changeMode">
        <button class="qc-btn is-mode" :title="$t('browse.model')">
          <i class="iconfont icon-view" />
          <span class="qc-label">{{ browseTypeLabel }}</span>
          <i class="iconfont icon-arrow-down qc-caret" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
             v-for="mode in modes"
              :key="mode.key"
              :command="mode.key"
              :class="{ 'is-active': mode.key === currentMode }"
            >
              {{ mode.label }}
        </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <button
        class="qc-btn"
        :class="{ 'is-active': browse.bookmarkShow }"
        :title="bookmarkTitle"
        @click="toggleBookmark"
      >
        <i class="iconfont icon-star" />
        <span class="qc-label">{{ bookmarkTitle }}</span>
      </button>

      <button class="qc-btn is-more" :title="$t('sidebar.rightMenu')" @click="openRightMenu">
        <i class="iconfont icon-more" />
        <span class="qc-label">{{ $t('sidebar.rightMenu') }}</span>
      </button>
    </nav>

    <!-- 移动端: 悬浮 更多 按钮 + 底部抽屉宫格 -->
    <template v-else>
      <button type="button" class="mobile-fab" :title="$t('sidebar.rightMenu')" @click="drawer = true">
        <i class="iconfont icon-more" />
      </button>

      <el-drawer
        v-model="drawer"
        direction="btt"
        size="auto"
        :with-header="false"
        append-to-body
        :z-index="3000"
        modal-class="reader-mobile-sheet-modal"
        class="reader-mobile-sheet"
      >
        <div class="sheet">
          <div class="sheet-handle" />
          <div class="sheet-title">{{ browse.currentChapter?.chapterName || $t('sidebar.rightMenu') }}</div>

          <div class="sheet-grid">
            <button type="button" class="grid-item" @click="run('home')">
              <i class="iconfont icon-home" />
              <span>Smanga</span>
            </button>
            <button type="button" class="grid-item" @click="run('media')">
              <i class="iconfont icon-folder" />
              <span>{{ $t('sidebar.mediaList') }}</span>
            </button>
            <button type="button" class="grid-item" :disabled="!mediaId" @click="run('manga-list')">
              <i class="iconfont icon-menu" />
              <span>{{ $t('sidebar.mangaList') }}</span>
            </button>
            <button type="button" class="grid-item" :disabled="!mangaId" @click="run('manga-info')">
              <i class="iconfont icon-info" />
              <span>{{ $t('sidebar.mangaInfo') }}</span>
            </button>
            <button type="button" class="grid-item" :class="{ 'is-active': browse.bookmarkShow }" @click="run('bookmark')">
              <i class="iconfont icon-star" />
              <span>{{ bookmarkTitle }}</span>
            </button>
            <button type="button" class="grid-item" @click="run('right-menu')">
              <i class="iconfont icon-more" />
              <span>{{ $t('sidebar.rightMenu') }}</span>
            </button>
          </div>

          <div class="sheet-sub-title">{{ $t('browse.model') }}</div>
          <div class="sheet-mode-row">
            <button
              v-for="mode in modes"
              :key="mode.key"
              type="button"
              class="mode-chip"
              :class="{ 'is-active': mode.key === currentMode }"
              @click="run('mode:' + mode.key)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
      </el-drawer>
    </template>
  </header>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { config } from '@/store'
import i18n from '@/i18n'
import useBrowseStore from '@/store/browse'

const route = useRoute()
const router = useRouter()
const browse = useBrowseStore()
const { t } = i18n.global

const drawer = ref(false)
const isMobile = ref(false)

const mediaId = computed(() => Number(route.query.mediaId) || 0)
const mangaId = computed(() => Number(route.query.mangaId) || 0)
const currentMode = computed(() => String(route.query.readerMode || 'flow'))
const modes = computed(() => [
  { key: 'flow', label: t('browse.flow') },
  { key: 'single', label: t('browse.single') },
  { key: 'double', label: t('browse.double') },
  { key: 'half', label: t('browse.half') },
])
const browseTypeLabel = computed(
  () => modes.value.find((m) => m.key === currentMode.value)?.label || t('browse.model'),
)
const bookmarkTitle = computed(() =>
  browse.bookmarkShow ? t('bookmarkManage.remove') : t('bookmarkManage.add'),
)

let mql: MediaQueryList | null = null
function syncMobile(e: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = 'matches' in e ? e.matches : false
}
onMounted(() => {
  mql = window.matchMedia('(max-width: 767px)')
  isMobile.value = mql.matches
  mql.addEventListener?.('change', syncMobile)
})
onBeforeUnmount(() => {
  mql?.removeEventListener?.('change', syncMobile)
})

async function toggleBookmark() {
  await browse.toggle_bookmark()
}

function openRightMenu() {
  config.rightSidebar = true
}

async function changeMode(mode: string) {
  if (mode === currentMode.value) return
  await router.push({
    name: 't-reader',
    params: { chapterId: route.params.chapterId },
    query: { ...route.query, readerMode: mode },
  })
}

async function go(key: string) {
  const targets: Record<string, string> = {
    home: '/t',
    media: '/t/media',
    'manga-list': `/t/media/${mediaId.value}`,
    'manga-info': `/t/manga/${mangaId.value}`,
  }
  if (targets[key]) await router.push(targets[key])
}

async function run(key: string) {
  // 先关闭抽屉, 等 element-plus 完成本轮渲染再执行导航,
  // 避免抽屉卸载与路由 push 抢占, 导致导航被吞掉
  drawer.value = false
  await nextTick()
  if (key === 'bookmark') return toggleBookmark()
  if (key === 'right-menu') return openRightMenu()
  if (key.startsWith('mode:')) return changeMode(key.slice(5))
  return go(key)
}
</script>

<style scoped lang="less">
.reader-quick-bar {
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  right: 0;
  padding-top: env(safe-area-inset-top);
  pointer-events: none;
}

/* 章节标题条: 顶部窄条, 半透明 */
.chapter-name {
  pointer-events: auto;
  height: 3.2rem;
  line-height: 3.2rem;
  padding: 0 12rem 0 1.6rem;
  color: var(--theme-reader-topbar-text, #f8fafc);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));
  font-size: 1.3rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chapter-name-text {
  opacity: 0.95;
}

/* ============ 桌面: 胶囊快捷条 ============ */
.quick-capsule {
  pointer-events: auto;
  position: absolute;
  top: calc(env(safe-area-inset-top) + 0.8rem);
  right: 1.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.4rem 0.6rem;
  border-radius: 999px;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.72));
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4rem 1.4rem rgba(0, 0, 0, 0.22);
  opacity: 0.55;
  transition: opacity 0.18s ease;
}

.quick-capsule:hover,
.quick-capsule:focus-within {
  opacity: 1;
}

.qc-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 3.2rem;
  padding: 0 1rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.3rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.qc-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
}

.qc-btn.is-active {
  color: var(--theme-reader-topbar-accent, #60a5fa);
  background: rgba(255, 255, 255, 0.12);
}

.qc-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qc-btn .iconfont {
  font-size: 1.6rem;
  pointer-events: none;
}

.qc-caret {
  font-size: 1rem !important;
  opacity: 0.7;
  margin-left: 0.2rem;
}

.qc-divider {
  width: 1px;
  height: 1.6rem;
  margin: 0 0.4rem;
  background: rgba(255, 255, 255, 0.18);
}

/* 中等屏 折叠文字, 保留图标 */
@media (max-width: 1080px) {
  .qc-label {
    display: none;
  }

  .qc-btn {
    padding: 0 0.9rem;
  }
}

/* ============ 移动端 ============ */
.reader-quick-bar.is-mobile .chapter-name {
  padding-right: 5rem;
}

.mobile-fab {
  pointer-events: auto;
  position: fixed;
  top: calc(env(safe-area-inset-top) + 0.6rem);
  right: 1rem;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  border: 0;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.78));
  color: var(--theme-reader-topbar-text, #f8fafc);
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(8px);
  cursor: pointer;
  z-index: 21;
}

.mobile-fab .iconfont {
  font-size: 1.8rem;
  pointer-events: none;
}

.sheet-handle {
  width: 3.6rem;
  height: 0.4rem;
  margin: 0.4rem auto 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
}

.sheet-title {
  font-size: 1.4rem;
  text-align: center;
  opacity: 0.85;
  margin-bottom: 1.2rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.sheet-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.4rem;
  border: 0;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.15rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.grid-item:hover:not(:disabled),
.grid-item.is-active {
  background: rgba(255, 255, 255, 0.14);
  color: var(--theme-reader-topbar-accent, #60a5fa);
}

.grid-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.grid-item .iconfont {
  font-size: 2rem;
  pointer-events: none;
}

.sheet-sub-title {
  margin: 1.6rem 0.2rem 0.8rem;
  font-size: 1.15rem;
  opacity: 0.65;
}

.sheet-mode-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.mode-chip {
  height: 3rem;
  padding: 0 1.2rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.2rem;
  cursor: pointer;
}

.mode-chip.is-active {
  background: var(--theme-reader-topbar-accent, #60a5fa);
  color: #0b1120;
}
</style>

<!-- 全局样式: append-to-body 后 el-drawer 被 teleport 到 body, scoped 无法命中 -->
<style lang="less">
/* 抽屉遮罩/容器层级强制高于阅读器内所有元素 (imagesLoader z-index:2000) */
.reader-mobile-sheet-modal {
  z-index: 3000 !important;
}

.reader-mobile-sheet {
  z-index: 3001 !important;
}

.reader-mobile-sheet.el-drawer,
.reader-mobile-sheet .el-drawer {
  border-top-left-radius: 1.6rem;
  border-top-right-radius: 1.6rem;
  background: var(--theme-reader-topbar-bg, #111827);
  color: var(--theme-reader-topbar-text, #f8fafc);
}

.reader-mobile-sheet .el-drawer__body {
  padding: 0.8rem 1.2rem 1.6rem;
}
</style>