<template>
  <el-dialog
    v-model="visible"
    :title="title || t('rightSidebar.editTags')"
    :width="dialogWidth"
    :append-to-body="true"
    :destroy-on-close="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :top="dialogTop"
    class="tag-editor-dialog"
    :class="{ 'is-mobile': isMobile }"
    align-center
    @closed="onClosed"
  >
    <TagEditor
      :manga-id="mangaId"
      :tags="tags || []"
      :allow-create="allowCreate"
      @update:tags="onUpdate"
      @close="visible = false"
   />
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
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
    /** dialog width in desktop mode. Accepts CSS length or shortcut. */
    width?: string
  }>(),
  {
    allowCreate: true,
    width: 'min(92vw, 72rem)',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:tags': [tags: tagItemType[]]
}>()

const visible = ref(props.modelValue)
const isMobile = ref(false)

// Detect mobile viewport — used to switch to a compact card layout with visible backdrop.
// We DO NOT use el-dialog fullscreen because it hides the surrounding backdrop and pushes
// the close button into the notch/safe-area, making it hard to tap.
const mql = typeof window !== 'undefined' ? window.matchMedia('(max-width: 64rem)') : null
const updateMobile = () => { isMobile.value = !!mql?.matches }
updateMobile()
mql?.addEventListener?.('change', updateMobile)
onBeforeUnmount(() => mql?.removeEventListener?.('change', updateMobile))

// Mobile: leave 1.2rem on each side so the backdrop is tappable to dismiss.
const dialogWidth = computed(() => (isMobile.value ? 'calc(100vw - 2.4rem)' : props.width))
// Push down slightly on mobile to keep clear of any browser status bar overlays.
const dialogTop = computed(() => (isMobile.value ? '6vh' : '15vh'))

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })

function onUpdate(next: tagItemType[]) {
  emit('update:tags', next)
}
function onClosed() {
  visible.value = false
}
</script>

<style>
/* Global (unscoped) — reach into el-dialog body since it's teleported outside our scope */
.tag-editor-dialog {
  border-radius: 1.4rem;
  overflow: hidden;
}
.tag-editor-dialog .el-dialog__body {
  padding: 1.6rem 2rem 2rem;
}
.tag-editor-dialog .el-dialog__header {
  padding: 1.6rem 2rem;
  margin-right: 0; /* element-plus default reserves space for close btn — keep alignment tidy */
}
.tag-editor-dialog .el-dialog__title {
  font-size: 1.6rem;
  font-weight: 600;
}
/* Enlarge close button hit target for both desktop & mobile */
.tag-editor-dialog .el-dialog__headerbtn {
  top: 0.8rem;
  right: 0.8rem;
  width: 4rem;
  height: 4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color .15s;
}
.tag-editor-dialog .el-dialog__headerbtn:hover {
  background: var(--sd-bg-hover, rgba(0, 0, 0, .06));
}
.tag-editor-dialog .el-dialog__headerbtn .el-dialog__close {
  font-size: 2rem;
}

/* Mobile card layout — NOT fullscreen: keep backdrop visible so user can tap outside to close. */
.tag-editor-dialog.is-mobile {
  border-radius: 1.6rem;
  max-height: calc(100vh - 12vh - 2.4rem);
  display: flex;
  flex-direction: column;
}
.tag-editor-dialog.is-mobile .el-dialog__header {
  padding: 1.2rem 1.4rem;
  padding-right: 5.2rem; /* leave room for the enlarged close button */
  border-bottom: 1px solid var(--sd-border, #eaeaea);
}
.tag-editor-dialog.is-mobile .el-dialog__title {
  font-size: 1.5rem;
}
.tag-editor-dialog.is-mobile .el-dialog__headerbtn {
  top: 0.4rem;
  right: 0.4rem;
  width: 4.4rem;
  height: 4.4rem;
}
.tag-editor-dialog.is-mobile .el-dialog__body {
  padding: 1.2rem 1.4rem calc(1.2rem + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}
.tag-editor-dialog.is-mobile .el-dialog__body > .tm-tag-editor {
  flex: 1;
  min-height: 0;
}
.tag-editor-dialog.is-mobile .tm-tag-editor {
  --tm-scroll-max: 100%;
}
.tag-editor-dialog.is-mobile .tm-tag-editor__section--available {
  flex: 1;
  min-height: 0;
}
.tag-editor-dialog.is-mobile .tm-tag-editor__chips--scroll {
  flex: 1;
  max-height: none;
  min-height: 0;
}
</style>