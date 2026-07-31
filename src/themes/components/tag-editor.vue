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
import { useThemeToast } from '@/themes/composables/use-theme-toast'
import { themeConfirm } from '@/themes/composables/use-theme-confirm'
import { useTagPicker, invalidateTagCache } from './composables/use-tag-picker'

const { t } = i18n.global
const toast = useThemeToast()

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
    toast.success(t('tagEditor.savedTip'))
    emit('close')
  } catch (e: any) {
    toast.error(e?.message || t('tagEditor.saveFailed'))
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
    await themeConfirm({
      title: t('tagEditor.discardTitle'),
      message: t('tagEditor.discardConfirm'),
      type: 'warning',
      confirmText: t('option.confirm'),
      cancelText: t('option.cancel'),
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
    toast.info(t('tagEditor.dupWarn'))
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
    toast.success(t('tagEditor.createdTip'))
  } catch (e: any) {
    toast.error(e?.message || t('tagEditor.createFailed'))
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
  gap: clamp(1rem, 2.5cqi, 1.6rem);
  min-width: 0;
  width: 100%;
  color: var(--sd-text, #374151);

  /* Local variables used to keep chip / control sizing consistent */
  --tm-control-h: 3.6rem;
  --tm-chip-min-h: 2.8rem;
  --tm-scroll-max: min(48vh, 32rem);
  --tm-radius: 1rem;
  --tm-font: 1.4rem;
}

/* Touch devices: bump controls/typography for finger targets */
@media (pointer: coarse) {
  .tm-tag-editor {
    --tm-control-h: 4rem;
    --tm-chip-min-h: 3.4rem;
    --tm-font: 1.5rem;
  }
}

/* Toolbar */
.tm-tag-editor__toolbar {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}
.tm-tag-editor__search {
  position: relative;
  flex: 1 1 20rem;
  min-width: 0;
  display: flex;
  align-items: center;
  background: var(--sd-bg2, #f3f4f6);
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: var(--tm-radius);
  padding: 0 1rem;
  height: var(--tm-control-h);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.tm-tag-editor__search:focus-within {
  border-color: var(--sd-primary, #2563eb);
  box-shadow: 0 0 0 0.3rem var(--sd-primary-ring, rgba(37, 99, 235, 0.15));
}
.tm-tag-editor__search-icon {
  font-size: 1.3rem;
  opacity: 0.55;
  margin-right: 0.6rem;
  flex-shrink: 0;
}
.tm-tag-editor__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--tm-font);
  line-height: 1.4;
  padding: 0.6rem 0.2rem;
  color: inherit;
  min-width: 0;
  /* Prevent iOS from zooming when focusing an input smaller than 1.6rem */
  -webkit-appearance: none;
}
.tm-tag-editor__search-input::placeholder { color: var(--sd-text-secondary, #9ca3af); }
.tm-tag-editor__search-clear {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--sd-text-secondary, #9ca3af);
  font-size: 1.8rem;
  line-height: 1;
  padding: 0.4rem 0.8rem;
  border-radius: 99.9rem;
  min-width: 2.8rem;
  min-height: 2.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.tm-tag-editor__search-clear:hover { background: var(--sd-bg-hover, #e5e7eb); color: var(--sd-text, #374151); }

.tm-tag-editor__create-toggle { flex-shrink: 0; }

/* Inline create form */
.tm-tag-editor__create {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  padding: 1rem;
  background: var(--sd-bg2, #f9fafb);
  border: 1px dashed var(--sd-border, #eaeaea);
  border-radius: var(--tm-radius);
  flex-wrap: wrap;
}
.tm-tag-editor__create-name {
  flex: 1 1 16rem;
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: 0.8rem;
  padding: 0 1rem;
  height: var(--tm-control-h);
  font-size: var(--tm-font);
  outline: none;
  min-width: 0;
  background: var(--sd-bg, #fff);
  color: inherit;
}
.tm-tag-editor__create-name:focus {
  border-color: var(--sd-primary, #2563eb);
  box-shadow: 0 0 0 0.3rem var(--sd-primary-ring, rgba(37, 99, 235, 0.15));
}
.tm-tag-editor__create-color {
  width: var(--tm-control-h);
  height: var(--tm-control-h);
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: 0.8rem;
  padding: 0.2rem;
  cursor: pointer;
  background: none;
  flex-shrink: 0;
}
.tm-tag-editor__create-actions {
  display: flex;
  gap: 0.6rem;
  flex-shrink: 0;
  margin-left: auto;
}

/* Sections */
.tm-tag-editor__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}
.tm-tag-editor__section--assigned {
  padding: 1.2rem 1.4rem;
  background: var(--sd-bg2, #f9fafb);
  border-radius: var(--tm-radius);
}
.tm-tag-editor__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}
.tm-tag-editor__section-actions {
  display: flex;
  gap: 0.4rem;
}
.tm-tag-editor__title {
  font-size: var(--tm-font);
  font-weight: 600;
  color: inherit;
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 0.6rem;
}
.tm-tag-editor__count {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--sd-text-secondary, #9ca3af);
}
.tm-tag-editor__link {
  border: none;
  background: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: var(--sd-text-secondary, #6b7280);
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  min-height: 2.8rem;
}
.tm-tag-editor__link:hover { color: var(--sd-primary, #2563eb); background: var(--sd-bg-hover, transparent); }
.tm-tag-editor__link--danger:hover { color: var(--sd-danger, #ef4444); }

.tm-tag-editor__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  min-height: 2.4rem;
}
.tm-tag-editor__chips--scroll {
  max-height: var(--tm-scroll-max);
  overflow-y: auto;
  padding: 0.4rem 0.2rem 0.4rem 0;
  align-content: flex-start;
  /* Smooth touch scrolling + prevent scroll chaining into dialog body */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--sd-border, #d1d5db) transparent;
}
.tm-tag-editor__chips--scroll::-webkit-scrollbar { width: 0.6rem; }
.tm-tag-editor__chips--scroll::-webkit-scrollbar-thumb {
  background: var(--sd-border, #d1d5db);
  border-radius: 0.3rem;
}

.tm-tag-editor__empty {
  font-size: 1.3rem;
  color: var(--sd-text-secondary, #9ca3af);
  margin: 0;
  padding: 0.4rem 0.2rem;
}

/* Footer */
.tm-tag-editor__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--sd-border, #eaeaea);
  flex-wrap: wrap;
  /* Ensure footer never gets covered by iOS home-indicator when in fullscreen dialogs */
  padding-bottom: max(0px, env(safe-area-inset-bottom, 0px));
}
.tm-tag-editor__footer-actions {
  display: flex;
  gap: 0.8rem;
  margin-left: auto;
  flex-wrap: wrap;
}
.tm-tag-editor__switch {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  color: var(--sd-text-secondary, #6b7280);
  cursor: pointer;
  user-select: none;
}
.tm-tag-editor__hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--sd-bg2, #e5e7eb);
  color: var(--sd-text-secondary, #6b7280);
  font-size: 1rem;
  cursor: help;
}
.tm-tag-editor__kbd {
  margin-left: 0.6rem;
  padding: 1px 0.4rem;
  font-size: 1rem;
  border-radius: 0.3rem;
  background: rgba(255, 255, 255, 0.25);
  opacity: 0.85;
}

/* Buttons */
.tm-btn {
  padding: 0 1.6rem;
  height: var(--tm-control-h);
  border-radius: 0.8rem;
  font-size: var(--tm-font);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;
  /* Better tap feedback on mobile */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.tm-btn--sm { padding: 0 1.2rem; height: 3.2rem; font-size: 1.2rem; }
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
  --tm-control-h: 3.2rem;
  --tm-chip-min-h: 2.8rem;
  --tm-scroll-max: min(36vh, 24rem);
  --tm-font: 1.2rem;
  gap: 1rem;
}

/* ------------------------------------------------------------
 * Container query — reacts to the actual editor width,
 * so it adapts inside dialogs, drawers and sidebars alike.
 * Falls back to viewport media query for older browsers.
 * ------------------------------------------------------------ */
@container tag-editor (max-width: 52rem) {
  .tm-tag-editor__toolbar { gap: 0.6rem; }
  .tm-tag-editor__create-toggle-label { display: none; }
  .tm-tag-editor__create-toggle {
    width: var(--tm-control-h);
    padding: 0;
    justify-content: center;
    font-size: 1.6rem;
  }
  .tm-tag-editor__footer { flex-direction: column; align-items: stretch; }
  .tm-tag-editor__footer-actions { margin-left: 0; justify-content: flex-end; }
  .tm-tag-editor__create { flex-direction: column; align-items: stretch; }
  .tm-tag-editor__create-actions { margin-left: 0; justify-content: flex-end; }
}
@container tag-editor (max-width: 36rem) {
  .tm-tag-editor__section--assigned { padding: 0.8rem 1rem; }
  .tm-tag-editor__kbd { display: none; }
}

/* Fallback for browsers without container-query support */
@supports not (container-type: inline-size) {
  @media (max-width: 64rem) {
    .tm-tag-editor__toolbar { gap: 0.6rem; }
    .tm-tag-editor__create-toggle-label { display: none; }
    .tm-tag-editor__create-toggle { width: 3.6rem; padding: 0; justify-content: center; font-size: 1.6rem; }
    .tm-tag-editor__footer { flex-direction: column; align-items: stretch; }
    .tm-tag-editor__footer-actions { margin-left: 0; justify-content: flex-end; }
    .tm-tag-editor__create { flex-direction: column; align-items: stretch; }
    .tm-tag-editor__create-actions { margin-left: 0; justify-content: flex-end; }
    .tm-tag-editor__kbd { display: none; }
  }
}

/* Prevent iOS zoom on focus by using 1.6rem on very small screens */
@media (max-width: 48rem) {
  .tm-tag-editor__search-input,
  .tm-tag-editor__create-name {
    font-size: 1.6rem;
  }
}

/* Coarse-pointer (touch) — enlarge hit targets */
@media (pointer: coarse) {
  .tm-tag-editor { --tm-control-h: 4rem; --tm-chip-min-h: 3.4rem; }
  .tm-btn--sm { height: 3.6rem; }
  .tm-tag-editor__link { min-height: 3.4rem; padding: 0.6rem 1rem; }
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