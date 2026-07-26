<template>
  <div v-if="modelValue" class="tm-edit-backdrop smanga-backable" @click.self="close">
    <div class="tm-edit-dialog">
      <header class="tm-edit-header">
        <div>
          <h2>编辑封面</h2>
          <p>从元数据附带的封面图中挑选一张作为该漫画的展示封面。</p>
        </div>
        <button type="button" class="tm-icon-button smanga-back-close" aria-label="关闭" @click="close">×</button>
      </header>

      <div class="tm-edit-content">
        <div v-if="!covers.length" class="tm-empty">暂无可选封面。请先在漫画元数据中添加封面文件。</div>

        <div v-else class="tm-cover-grid">
          <button
            v-for="item in covers"
            :key="item.metaId || item.metaFile"
            type="button"
            :class="['tm-cover-cell', { 'is-active': item.active }]"
            :disabled="submitting"
            @click="choose(item)"
          >
            <img :src="item.blob" :alt="item.metaFile" />
            <span v-if="item.active" class="tm-cover-check">✓</span>
          </button>
        </div>

        <p v-if="error" class="tm-error" role="alert">{{ error }}</p>
      </div>

      <footer class="tm-edit-actions">
        <button type="button" class="tm-secondary-button" :disabled="submitting" @click="close">关闭</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import mangaApi from '@/api/manga'

interface CoverMeta {
  metaId?: number | string
  metaFile: string
  blob?: string
  active?: boolean
  [key: string]: any
}

const props = defineProps<{
  modelValue: boolean
  mangaId: number
  currentCover?: string
  covers: CoverMeta[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'update:cover', v: string): void
  (e: 'reload'): void
}>()

const error = ref('')
const submitting = ref(false)

function refreshActive() {
  props.covers.forEach((it) => {
    it.active = it.metaFile === props.currentCover
  })
}

watch(() => props.modelValue, (v) => {
  if (v) {
    error.value = ''
    refreshActive()
  }
})

async function choose(item: CoverMeta) {
  if (!item?.metaFile || !props.mangaId) return
  submitting.value = true
  error.value = ''
  try {
    await mangaApi.update_manga({
      mangaId: props.mangaId,
      mangaCover: item.metaFile,
    })
    props.covers.forEach((c) => (c.active = c.metaFile === item.metaFile))
    emit('update:cover', item.metaFile)
    emit('reload')
    close()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '更新封面失败'
  } finally {
    submitting.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.tm-edit-backdrop { position: fixed; inset: 0; z-index: 900; display: grid; place-items: center; padding: 2.4rem; background: rgba(15, 23, 42, .42); backdrop-filter: blur(0.3rem); }
.tm-edit-dialog { width: min(72rem, 100%); max-height: min(82rem, calc(100vh - 4.8rem)); display: flex; flex-direction: column; overflow: hidden; color: var(--sd-text, #172033); background: var(--sd-card, #fff); border: 1px solid var(--sd-border, #e5e7eb); border-radius: 1.4rem; box-shadow: 0 2.4rem 6.4rem rgba(15, 23, 42, .22); }
.tm-edit-header { display: flex; align-items: center; justify-content: space-between; gap: 1.6rem; padding: 1.8rem 2.2rem; border-bottom: 1px solid var(--sd-border, #e5e7eb); }
.tm-edit-header h2, .tm-edit-header p { margin: 0; }
.tm-edit-header h2 { font-size: 1.8rem; }
.tm-edit-header p { margin-top: 0.4rem; color: var(--sd-text-muted, #64748b); font-size: 1.2rem; line-height: 1.45; }
.tm-edit-content { overflow: auto; padding: 2.2rem; }
.tm-empty { padding: 3rem 0; text-align: center; color: var(--sd-text-muted, #64748b); font-size: 1.4rem; }
.tm-cover-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1.4rem; }
.tm-cover-cell { position: relative; padding: 0; overflow: hidden; background: var(--sd-back, #f8fafc); border: 0.3rem solid var(--sd-border, #e5e7eb); border-radius: 1rem; cursor: pointer; aspect-ratio: 2 / 3; transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease; }
.tm-cover-cell img { display: block; width: 100%; height: 100%; object-fit: cover; }
.tm-cover-cell:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0.6rem 1.6rem rgba(15, 23, 42, .16); }
.tm-cover-cell.is-active { border-color:var(--sd-primary, #2563eb); box-shadow: 0 0 0 0.3rem color-mix(in srgb, var(--sd-primary, #2563eb) 25%, transparent); }
.tm-cover-cell:disabled { opacity: .6; cursor: not-allowed; }
.tm-cover-check { position: absolute; top: 0.6rem; right: 0.6rem; width: 2.4rem; height: 2.4rem; display: grid; place-items: center; color: #fff; font-size: 1.4rem; font-weight: 700; background: var(--sd-primary, #2563eb); border-radius: 50%; box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, .25); }
.tm-edit-actions { display: flex; align-items: center; justify-content: flex-end; gap: 1.6rem; padding: 1.8rem 2.2rem; border-top: 1px solid var(--sd-border, #e5e7eb); }
.tm-secondary-button, .tm-icon-button { border: 0; border-radius: 0.8rem; font: inherit; cursor: pointer; }
.tm-secondary-button { padding: 0.8rem 1.3rem; color: var(--sd-text-muted, #475569); background: transparent; border: 1px solid var(--sd-border, #dbe2ea); }
.tm-icon-button { padding: 0.2rem 0.8rem; color: var(--sd-text-muted, #64748b); background: transparent; font-size: 2.4rem; line-height: 1; }
.tm-secondary-button:disabled { cursor: not-allowed; opacity: .6; }
.tm-error { margin: 1.6rem 0 0; padding: 1rem 1.2rem; border-radius: 0.8rem; font-size: 1.3rem; line-height: 1.45; color: #b42318; background: #fef3f2; }
@media (max-width: 64rem) {
  .tm-edit-backdrop { padding: 1.2rem; }
  .tm-edit-content { padding: 1.6rem; }
  .tm-edit-header, .tm-edit-actions { padding: 1.4rem 1.6rem; }
  .tm-cover-grid { grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr)); gap: 1rem; }
}
</style>