<template>
  <teleport to="body">
    <transition name="thd-fade">
      <div v-if="visible" class="thd-mask smanga-backable" @click.self="close" @contextmenu.stop.prevent>
        <div class="thd-card ted-card" role="dialog" aria-modal="true">
          <div class="ted-head">
            <div class="thd-title ted-title">{{ title || t('rightSidebar.editTags') }}</div>
            <button type="button" class="ted-close" :aria-label="t('option.cancel')" @click="close">×</button>
          </div>
          <div class="ted-body">
            <TagEditor
              :manga-id="mangaId"
              :tags="tags || []"
              :allow-create="allowCreate"
              @update:tags="onUpdate"
              @close="close"
            />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import TagEditor from './tag-editor.vue'
import { tagItemType } from '@/api/tag'
import i18n from '@/i18n'

const { t } = i18n.global

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mangaId: number
    tags: tagItemType[]
    title?: string
    allowCreate?: boolean
  }>(),
  {
    allowCreate: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:tags': [tags: tagItemType[]]
}>()

const visible = computed(() => props.modelValue)

function close() {
  emit('update:modelValue', false)
}

function onUpdate(next: tagItemType[]) {
  emit('update:tags', next)
}

// 对齐旧 el-dialog 的 close-on-press-escape 行为
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
watch(visible, (v) => {
  if (v) window.addEventListener('keydown', onEsc)
  else window.removeEventListener('keydown', onEsc)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onEsc))
</script>

<style scoped lang="less">
@import '@/themes/style/dialog.less';

.ted-card {
  width: min(92vw, 72rem);
  max-height: min(86vh, 72rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* TagEditor 内部使用 --sd-* 变量 (浅色兜底), 此处映射为深色毛玻璃配色 */
  --sd-text: var(--theme-reader-topbar-text, #f8fafc);
  --sd-text-secondary: rgba(248, 250, 252, 0.6);
  --sd-bg: rgba(255, 255, 255, 0.06);
  --sd-bg2: rgba(255, 255, 255, 0.08);
  --sd-bg-hover: rgba(255, 255, 255, 0.14);
  --sd-border: rgba(255, 255, 255, 0.16);
  --sd-primary: var(--theme-reader-topbar-accent, #60a5fa);
  --sd-primary-hover: var(--theme-reader-topbar-accent, #3b82f6);
  --sd-primary-ring: rgba(96, 165, 250, 0.25);
  --sd-danger: #f87171;
}

.ted-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
}

.ted-title {
  margin-bottom: 0;
}

.ted-close {
  width: 3.6rem;
  height: 3.6rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font-size: 2.2rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.65;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.ted-close:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.ted-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 1.2rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.ted-body :deep(.tm-tag-editor) {
  flex: 1;
  min-height: 0;
}
</style>
