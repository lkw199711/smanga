<template>
  <div class="tm-tag-editor" :class="{ 'tm-tag-editor--compact': compact }" @keydown="onKeydown">
    <!-- Toolbar: search + create -->
    <div class="tm-tag-editor__toolbar">
      <div class="tm-tag-editor__search">
        <span class="tm-tag-editor__search-icon" aria-hidden="true">🔍</span>
        <input
          ref="searchRef"
          v-model="search"
          class="tm-tag-editor__search-input"
          :placeholder="t('tagEditor.searchPlaceholder')"
          type="text"
          enterkeyhint="search"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <button
          v-if="search"
          class="tm-tag-editor__search-clear"
          type="button"
          :aria-label="t('tagEditor.clearSearch')"
          @click="search = ''"
        >×</button>
      </div>
      <button
        v-if="allowCreate"
        class="tm-btn tm-btn--ghost tm-btn--sm tm-tag-editor__create-toggle"
        type="button"
        :title="t('tagEditor.createTag')"
        @click="showCreate = !showCreate"
      >
        <span aria-hidden="true">+</span>
        <span class="tm-tag-editor__create-toggle-label">{{ t('tagEditor.createTag') }}</span>
      </button>
    </div>

    <!-- Inline create form -->
    <div v-if="allowCreate && showCreate" class="tm-tag-editor__create">
      <input
        v-model="newTagName"
        class="tm-tag-editor__create-name"
        :placeholder="t('tagEditor.newTagName')"
        enterkeyhint="done"
        @keydown.enter.prevent="createTag"
      />
      <input v-model="newTagColor" type="color" class="tm-tag-editor__create-color" :aria-label="t('tagEditor.newTagName')" />
      <div class="tm-tag-editor__create-actions">
        <button class="tm-btn tm-btn--primary tm-btn--sm" type="button" :disabled="!newTagName.trim() || creating" @click="createTag">
          {{ creating ? t('tagEditor.saving') : t('option.confirm') }}
        </button>
        <button class="tm-btn tm-btn--ghost tm-btn--sm" type="button" @click="cancelCreate">{{ t('option.cancel') }}</button>
      </div>
    </div>

    <!-- Assigned tags -->
    <div class="tm-tag-editor__section tm-tag-editor__section--assigned">
      <div class="tm-tag-editor__section-head">
        <p class="tm-tag-editor__title">
          {{ t('tagEditor.assignedTitle') }}
          <span class="tm-tag-editor__count">{{ assigned.length }} / {{ allTags.length }}</span>
        </p>
        <div class="tm-tag-editor__section-actions">
          <button
            v-if="removedStack.length > 0"
            class="tm-tag-editor__link"
            type="button"
            :title="t('tagEditor.undo')"
            @click="undoRemove"
          >↶ {{ t('tagEditor.undo') }}</button>
          <button
            v-if="assigned.length > 0"
            class="tm-tag-editor__link tm-tag-editor__link--danger"
            type="button"
            @click="clearAssigned"
          >{{ t('tagEditor.clearAll') }}</button>
        </div>
      </div>
      <div class="tm-tag-editor__chips">
        <TagChip
          v-for="tag in assigned"
          :key="tag.tagId"
          :name="tag.tagName"
          :color="tag.tagColor"
          :active="true"
          :clickable="true"
          @click="removeTag(tag)"
        />
        <p v-if="assigned.length === 0" class="tm-tag-editor__empty">
          {{ t('tagEditor.emptyAssigned') }}
        </p>
      </div>
    </div>

    <!-- Available tags -->
    <div class="tm-tag-editor__section tm-tag-editor__section--available">
      <p class="tm-tag-editor__title">
        {{ t('tagEditor.availableTitle') }}
        <span class="tm-tag-editor__count">{{ availableFiltered.length }}</span>
      </p>
      <div class="tm-tag-editor__chips tm-tag-editor__chips--scroll">
        <TagChip
          v-for="tag in availableFiltered"
          :key="tag.tagId"
          :name="tag.tagName"
          :color="tag.tagColor"
          :clickable="true"
          @click="addTag(tag)"
        />
        <p v-if="loading" class="tm-tag-editor__empty">{{ t('tagEditor.loading') }}</p>
        <p v-else-if="availableFiltered.length === 0 && search" class="tm-tag-editor__empty">
          {{ t('tagEditor.noMatch') }}
        </p>
        <p v-else-if="availableFiltered.length === 0" class="tm-tag-editor__empty">
          {{ t('tagEditor.allAssigned') }}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="tm-tag-editor__footer">
      <label class="tm-tag-editor__switch" :title="t('tagEditor.jsonHint')">
        <input v-model="metaWriteJson" type="checkbox" />
        <span>{{ t('tagEditor.saveAsJson') }}</span>
        <span class="tm-tag-editor__hint" :title="t('tagEditor.jsonHint')" aria-hidden="true">?</span>
      </label>
      <div class="tm-tag-editor__footer-actions">
        <button class="tm-btn tm-btn--ghost" type="button" @click="tryClose">{{ t('option.cancel') }}</button>
        <button class="tm-btn tm-btn--primary" type="button" :disabled="saving || !dirty" @click="save">
          {{ saving ? t('tagEditor.saving') : t('option.confirm') }}
          <span v-if="dirty" class="tm-tag-editor__kbd">Ctrl+Enter</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import TagChip from './tag-chip.vue'
import tagApi, { tagItemType } from '@/api/tag'
import i18n from '@/i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTagPicker, invalidateTagCache } from './composables/use-tag-picker'

const { t } = i18n.global

const props = withDefaults(
  defineProps<{
    mangaId: number
    tags: tagItemType[]
    allowCreate?: boolean
    autoFocus?: boolean
    compact?: boolean
  }>(),
  {
    allowCreate: false,
    autoFocus: true,
    compact: false,
  }
)

const emit = defineEmits<{
  'update:tags': [tags: tagItemType[]]
  close: []
}>()

const {
  allTags,
  assigned,
  search,
  loading,
  removedStack,
  availableFiltered,
  dirty,
  loadAllTags,
  addTag,
  removeTag,
  clearAssigned,
  undoRemove,
  insertNewTag,
} = useTagPicker(props.tags || [])

const saving = ref(false)
const metaWriteJson = ref(true)
const searchRef = ref<HTMLInputElement | null>(null)

// Create-new-tag inline form
const showCreate = ref(false)
const creating = ref(false)
const newTagName = ref('')
const newTagColor = ref('#6366f1')

onMounted(async () => {
  await loadAllTags()
  if (props.autoFocus) {
    // Avoid raising the on-screen keyboard on touch devices immediately.
    const isCoarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
    if (!isCoarse) {
      await nextTick()
      searchRef.value?.focus()
    }
  }
})

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    await tagApi.add_manga_tag(props.mangaId, assigned.value, metaWriteJson.value)
    emit('update:tags', [...assigned.value])
    ElMessage.success(t('tagEditor.savedTip'))
    emit('close')
  } catch (e: any) {
    ElMessage.error(e?.message || t('tagEditor.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function tryClose() {
  if (!dirty.value) {
    emit('close')
    return
  }
  try {
    await ElMessageBox.confirm(t('tagEditor.discardConfirm'), t('tagEditor.discardTitle'), {
      confirmButtonText: t('option.confirm'),
      cancelButtonText: t('option.cancel'),
      type: 'warning',
    })
    emit('close')
  } catch {
    /* keep open */
  }
}

async function createTag() {
  const name = newTagName.value.trim()
  if (!name || creating.value) return
  // Guard against duplicate name (case-insensitive)
  const dup = allTags.value.find((tItem) => tItem.tagName?.toLowerCase() === name.toLowerCase())
  if (dup) {
    ElMessage.warning(t('tagEditor.dupWarn'))
    insertNewTag(dup)
    cancelCreate()
    return
  }
  creating.value = true
  try {
    await tagApi.add(name, newTagColor.value, '')
    // Refetch list to obtain server-generated tagId
    invalidateTagCache()
    const listBefore = allTags.value.map((tItem) => tItem.tagId)
    await loadAllTags(true)
    const created = allTags.value.find(
      (tItem) => !listBefore.includes(tItem.tagId) && tItem.tagName === name
    ) || allTags.value.find((tItem) => tItem.tagName === name)
    if (created) insertNewTag(created)
    cancelCreate()
    ElMessage.success(t('tagEditor.createdTip'))
  } catch (e: any) {
    ElMessage.error(e?.message || t('tagEditor.createFailed'))
  } finally {
    creating.value = false
  }
}

function cancelCreate() {
  showCreate.value = false
  newTagName.value = ''
  newTagColor.value = '#6366f1'
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    tryClose()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    if (dirty.value) save()
  }
}
</script>

<style scoped>
/* ============================================================
 * TagEditor — responsive, touch-friendly, theme-aware
 * Uses CSS variables (--sd-*) so any host theme can override.
 * Container-query first, media-query as fallback.
 * ============================================================ */
.tm-tag-editor {
  container-type: inline-size;
  container-name: tag-editor;

  display: flex;
  flex-direction: column;
  gap: clamp(10px, 2.5cqi, 16px);
  min-width: 0;
  width: 100%;
  color: var(--sd-text, #374151);

  /* Local variables used to keep chip / control sizing consistent */
  --tm-control-h: 36px;
  --tm-chip-min-h: 28px;
  --tm-scroll-max: min(48vh, 320px);
  --tm-radius: 10px;
  --tm-font: 14px;
}

/* Touch devices: bump controls/typography for finger targets */
@media (pointer: coarse) {
  .tm-tag-editor {
    --tm-control-h: 40px;
    --tm-chip-min-h: 34px;
    --tm-font: 15px;
  }
}

/* Toolbar */
.tm-tag-editor__toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.tm-tag-editor__search {
  position: relative;
  flex: 1 1 200px;
  min-width: 0;
  display: flex;
  align-items: center;
  background: var(--sd-bg2, #f3f4f6);
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: var(--tm-radius);
  padding: 0 10px;
  height: var(--tm-control-h);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.tm-tag-editor__search:focus-within {
  border-color: var(--sd-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--sd-primary-ring, rgba(37, 99, 235, 0.15));
}
.tm-tag-editor__search-icon {
  font-size: 13px;
  opacity: 0.55;
  margin-right: 6px;
  flex-shrink: 0;
}
.tm-tag-editor__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--tm-font);
  line-height: 1.4;
  padding: 6px 2px;
  color: inherit;
  min-width: 0;
  /* Prevent iOS from zooming when focusing an input smaller than 16px */
  -webkit-appearance: none;
}
.tm-tag-editor__search-input::placeholder { color: var(--sd-text-secondary, #9ca3af); }
.tm-tag-editor__search-clear {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--sd-text-secondary, #9ca3af);
  font-size: 18px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 999px;
  min-width: 28px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.tm-tag-editor__search-clear:hover { background: var(--sd-bg-hover, #e5e7eb); color: var(--sd-text, #374151); }

.tm-tag-editor__create-toggle { flex-shrink: 0; }

/* Inline create form */
.tm-tag-editor__create {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px;
  background: var(--sd-bg2, #f9fafb);
  border: 1px dashed var(--sd-border, #eaeaea);
  border-radius: var(--tm-radius);
  flex-wrap: wrap;
}
.tm-tag-editor__create-name {
  flex: 1 1 160px;
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: 8px;
  padding: 0 10px;
  height: var(--tm-control-h);
  font-size: var(--tm-font);
  outline: none;
  min-width: 0;
  background: var(--sd-bg, #fff);
  color: inherit;
}
.tm-tag-editor__create-name:focus {
  border-color: var(--sd-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--sd-primary-ring, rgba(37, 99, 235, 0.15));
}
.tm-tag-editor__create-color {
  width: var(--tm-control-h);
  height: var(--tm-control-h);
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  background: none;
  flex-shrink: 0;
}
.tm-tag-editor__create-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
}

/* Sections */
.tm-tag-editor__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.tm-tag-editor__section--assigned {
  padding: 12px 14px;
  background: var(--sd-bg2, #f9fafb);
  border-radius: var(--tm-radius);
}
.tm-tag-editor__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.tm-tag-editor__section-actions {
  display: flex;
  gap: 4px;
}
.tm-tag-editor__title {
  font-size: var(--tm-font);
  font-weight: 600;
  color: inherit;
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.tm-tag-editor__count {
  font-size: 12px;
  font-weight: 500;
  color: var(--sd-text-secondary, #9ca3af);
}
.tm-tag-editor__link {
  border: none;
  background: none;
  font-size: 13px;
  cursor: pointer;
  color: var(--sd-text-secondary, #6b7280);
  padding: 4px 8px;
  border-radius: 4px;
  min-height: 28px;
}
.tm-tag-editor__link:hover { color: var(--sd-primary, #2563eb); background: var(--sd-bg-hover, transparent); }
.tm-tag-editor__link--danger:hover { color: var(--sd-danger, #ef4444); }

.tm-tag-editor__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 24px;
}
.tm-tag-editor__chips--scroll {
  max-height: var(--tm-scroll-max);
  overflow-y: auto;
  padding: 4px 2px 4px 0;
  align-content: flex-start;
  /* Smooth touch scrolling + prevent scroll chaining into dialog body */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--sd-border, #d1d5db) transparent;
}
.tm-tag-editor__chips--scroll::-webkit-scrollbar { width: 6px; }
.tm-tag-editor__chips--scroll::-webkit-scrollbar-thumb {
  background: var(--sd-border, #d1d5db);
  border-radius: 3px;
}

.tm-tag-editor__empty {
  font-size: 13px;
  color: var(--sd-text-secondary, #9ca3af);
  margin: 0;
  padding: 4px 2px;
}

/* Footer */
.tm-tag-editor__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--sd-border, #eaeaea);
  flex-wrap: wrap;
  /* Ensure footer never gets covered by iOS home-indicator when in fullscreen dialogs */
  padding-bottom: max(0px, env(safe-area-inset-bottom, 0px));
}
.tm-tag-editor__footer-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-wrap: wrap;
}
.tm-tag-editor__switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--sd-text-secondary, #6b7280);
  cursor: pointer;
  user-select: none;
}
.tm-tag-editor__hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--sd-bg2, #e5e7eb);
  color: var(--sd-text-secondary, #6b7280);
  font-size: 10px;
  cursor: help;
}
.tm-tag-editor__kbd {
  margin-left: 6px;
  padding: 1px 4px;
  font-size: 10px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.25);
  opacity: 0.85;
}

/* Buttons */
.tm-btn {
  padding: 0 16px;
  height: var(--tm-control-h);
  border-radius: 8px;
  font-size: var(--tm-font);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  /* Better tap feedback on mobile */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.tm-btn--sm { padding: 0 12px; height: 32px; font-size: 12px; }
.tm-btn--primary {
  background: var(--sd-primary, #2563eb);
  color: #fff;
}
.tm-btn--primary:hover:not(:disabled) { background: var(--sd-primary-hover, #1d4ed8); }
.tm-btn--primary:active:not(:disabled) { transform: translateY(1px); }
.tm-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.tm-btn--ghost {
  background: var(--sd-bg, #fff);
  color: var(--sd-text, #374151);
  border: 1px solid var(--sd-border, #eaeaea);
}
.tm-btn--ghost:hover:not(:disabled) { background: var(--sd-bg-hover, #f3f4f6); }
.tm-btn--ghost:disabled { opacity: 0.5; cursor: not-allowed; }

/* ------------------------------------------------------------
 * Compact mode — for narrow sidebar embedding, drawer footers, etc.
 * Callers can also just rely on container query below.
 * ------------------------------------------------------------ */
.tm-tag-editor--compact {
  --tm-control-h: 32px;
  --tm-chip-min-h: 28px;
  --tm-scroll-max: min(36vh, 240px);
  --tm-font: 12px;
  gap: 10px;
}

/* ------------------------------------------------------------
 * Container query — reacts to the actual editor width,
 * so it adapts inside dialogs, drawers and sidebars alike.
 * Falls back to viewport media query for older browsers.
 * ------------------------------------------------------------ */
@container tag-editor (max-width: 520px) {
  .tm-tag-editor__toolbar { gap: 6px; }
  .tm-tag-editor__create-toggle-label { display: none; }
  .tm-tag-editor__create-toggle {
    width: var(--tm-control-h);
    padding: 0;
    justify-content: center;
    font-size: 16px;
  }
  .tm-tag-editor__footer { flex-direction: column; align-items: stretch; }
  .tm-tag-editor__footer-actions { margin-left: 0; justify-content: flex-end; }
  .tm-tag-editor__create { flex-direction: column; align-items: stretch; }
  .tm-tag-editor__create-actions { margin-left: 0; justify-content: flex-end; }
}
@container tag-editor (max-width: 360px) {
  .tm-tag-editor__section--assigned { padding: 8px 10px; }
  .tm-tag-editor__kbd { display: none; }
}

/* Fallback for browsers without container-query support */
@supports not (container-type: inline-size) {
  @media (max-width: 640px) {
    .tm-tag-editor__toolbar { gap: 6px; }
    .tm-tag-editor__create-toggle-label { display: none; }
    .tm-tag-editor__create-toggle { width: 36px; padding: 0; justify-content: center; font-size: 16px; }
    .tm-tag-editor__footer { flex-direction: column; align-items: stretch; }
    .tm-tag-editor__footer-actions { margin-left: 0; justify-content: flex-end; }
    .tm-tag-editor__create { flex-direction: column; align-items: stretch; }
    .tm-tag-editor__create-actions { margin-left: 0; justify-content: flex-end; }
    .tm-tag-editor__kbd { display: none; }
  }
}

/* Prevent iOS zoom on focus by using 16px on very small screens */
@media (max-width: 480px) {
  .tm-tag-editor__search-input,
  .tm-tag-editor__create-name {
    font-size: 16px;
  }
}

/* Coarse-pointer (touch) — enlarge hit targets */
@media (pointer: coarse) {
  .tm-tag-editor { --tm-control-h: 40px; --tm-chip-min-h: 34px; }
  .tm-btn--sm { height: 36px; }
  .tm-tag-editor__link { min-height: 34px; padding: 6px 10px; }
}

/* Respect reduced-motion users */
@media (prefers-reduced-motion: reduce) {
  .tm-tag-editor *,
  .tm-tag-editor *::before,
  .tm-tag-editor *::after {
    transition: none !important;
    animation: none !important;
  }
}
</style>