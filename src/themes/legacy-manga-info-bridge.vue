<template>
  <main :class="['theme-legacy-manga-info', `theme-legacy-manga-info-${themeState.current.toLowerCase()}`]">
    <template v-if="ready">
      <LegacyMangaInfo :key="mangaId" />
    </template>
    <section v-else class="legacy-manga-info-loading" aria-live="polite">
      <span v-if="!error">正在加载漫画详情…</span>
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
import { themeState } from '@/themes/store'

const LegacyMangaInfo = defineAsyncComponent(() => import('./legacy-manga-info/index.vue'))

const route = useRoute()
const router = useRouter()
const error = ref('')
const ready = ref(false)

const mangaId = computed(() => Number(route.params.mangaId) || 0)

function prepare() {
  ready.value = false
  error.value = ''
  const id = mangaId.value
  if (!id) {
    error.value = '无效的漫画地址'
    return
  }
  ready.value = true
}

onMounted(prepare)
watch(mangaId, prepare)
</script>

<style scoped>
.theme-legacy-manga-info {
  --tmi-bg: #f5f7fa;
  --tmi-card-bg: #fff;
  --tmi-text: #303133;
  --tmi-text-secondary: #606266;
  --tmi-border: #e4e7ed;
  --tmi-accent: #409eff;
  --tmi-accent-hover: #337ecc;
  --tmi-btn-warning: #e6a23c;
  --tmi-btn-success: #67c23a;
  min-height: 100vh;
  background: var(--tmi-bg);
  color: var(--tmi-text);
}

/* 主题A - 现代简约 */
.theme-legacy-manga-info-a {
  --tmi-bg: #fafafa;
  --tmi-card-bg: #fff;
  --tmi-text: #171717;
  --tmi-text-secondary: #4b5563;
  --tmi-border: #eaeaea;
  --tmi-accent: #2563eb;
  --tmi-accent-hover: #1d4ed8;
  --tmi-btn-warning: #f59e0b;
  --tmi-btn-success: #10b981;
}

/* 主题B - 漫画风 */
.theme-legacy-manga-info-b {
  --tmi-bg: #faf5ff;
  --tmi-card-bg: rgba(255, 255, 255, 0.9);
  --tmi-text: #1f2937;
  --tmi-text-secondary: #6b7280;
  --tmi-border: rgba(168, 85, 247, 0.2);
  --tmi-accent: #a855f7;
  --tmi-accent-hover: #9333ea;
  --tmi-btn-warning: #f59e0b;
  --tmi-btn-success: #10b981;
}

/* 主题D - 多主题自适应 */
.theme-legacy-manga-info-d {
  --tmi-bg: var(--bg, #f5f7fa);
  --tmi-card-bg: var(--bg2, #fff);
  --tmi-text: var(--fg, #303133);
  --tmi-text-secondary: var(--fg2, #606266);
  --tmi-border: var(--border, #e4e7ed);
  --tmi-accent: var(--accent, #409eff);
  --tmi-accent-hover: var(--accent-hover, #337ecc);
  --tmi-btn-warning: #e6a23c;
  --tmi-btn-success: #67c23a;
}

.legacy-manga-info-loading {
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
