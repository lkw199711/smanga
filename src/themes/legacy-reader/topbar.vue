<template>
  <header class="theme-reader-topbar">
    <el-menu :default-active="activeItem" mode="horizontal" @select="handleSelect">
      <el-menu-item index="home">Smanga</el-menu-item>
      <el-menu-item index="media">{{ $t('sidebar.mediaList') }}</el-menu-item>
      <el-menu-item index="manga-list" :disabled="!mediaId">{{ $t('sidebar.mangaList') }}</el-menu-item>
      <el-menu-item index="manga-info" :disabled="!mangaId">{{ $t('sidebar.mangaInfo') }}</el-menu-item>
      <el-sub-menu index="mode">
        <template #title>{{ browseType }}</template>
        <el-menu-item v-for="mode in modes" :key="mode.key" :index="`mode:${mode.key}`">
          {{ mode.label }}
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item index="right-menu">{{ $t('sidebar.rightMenu') }}</el-menu-item>
      <el-menu-item index="bookmark">{{ bookmarkTitle }}</el-menu-item>
    </el-menu>
    <div class="chapter-name">{{ browse.currentChapter?.chapterName }}</div>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { config } from '@/store'
import i18n from '@/i18n'
import useBrowseStore from '@/store/browse'

const route = useRoute()
const router = useRouter()
const browse = useBrowseStore()
const { t } = i18n.global

const mediaId = computed(() => Number(route.query.mediaId) || 0)
const mangaId = computed(() => Number(route.query.mangaId) || 0)
const activeItem = computed(() => `mode:${route.query.readerMode || 'flow'}`)
const modes = computed(() => [
  { key: 'flow', label: t('browse.flow') },
  { key: 'single', label: t('browse.single') },
  { key: 'double', label: t('browse.double') },
  { key: 'half', label: t('browse.half') },
])
const browseType = computed(() => modes.value.find((mode) => mode.key === route.query.readerMode)?.label || t('browse.model'))
const bookmarkTitle = computed(() => browse.bookmarkShow ? t('bookmarkManage.remove') : t('bookmarkManage.add'))

async function handleSelect(key: string) {
  if (key === 'bookmark') {
    await browse.toggle_bookmark()
    return
  }
  if (key === 'right-menu') {
    config.rightSidebar = true
    return
  }
  if (key.startsWith('mode:')) {
    await router.push({
      name: 't-reader',
      params: { chapterId: route.params.chapterId },
      query: { ...route.query, readerMode: key.slice(5) },
    })
    return
  }

  const targets: Record<string, string> = {
    home: '/t',
    media: '/t/media',
    'manga-list': `/t/media/${mediaId.value}`,
    'manga-info': `/t/manga/${mangaId.value}`,
  }
  if (targets[key]) await router.push(targets[key])
}
</script>

<style scoped>
.theme-reader-topbar {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: env(safe-area-inset-top);
  background: var(--theme-reader-topbar-bg, #111827);
  color: var(--theme-reader-topbar-text, #f8fafc);
  box-shadow: 0 1px 10px rgb(0 0 0 / 22%);
}

.chapter-name {
  display: block;
  width: 100vw;
  height: 3.6rem;
  overflow: hidden;
  color: var(--theme-reader-topbar-text, #f8fafc);
  background: var(--theme-reader-chapter-bg, #1f2937);
  font-size: 1.8rem;
  text-align: center;
  line-height: 2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-menu) {
  --el-menu-bg-color: transparent;
  --el-menu-text-color: var(--theme-reader-topbar-text, #f8fafc);
  --el-menu-hover-bg-color: rgb(255 255 255 / 12%);
  --el-menu-active-color: var(--theme-reader-topbar-accent, #60a5fa);
  border-bottom: 0;
}

@media (max-width: 767px) {
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    padding: 0 0.4rem;
  }

  :deep(.el-menu-item:first-child) {
    display: none;
  }
}
</style>
