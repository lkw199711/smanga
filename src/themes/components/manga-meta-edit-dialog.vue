<template>
  <div v-if="modelValue" class="tm-edit-backdrop smanga-backable" @click.self="close">
    <form class="tm-edit-dialog" @submit.prevent="submit">
      <header class="tm-edit-header">
        <div>
          <h2>编辑元数据</h2>
          <p>修改漫画的标题、作者、发布时间、评分和简介等元数据信息。</p>
        </div>
        <button type="button" class="tm-icon-button smanga-back-close" aria-label="关闭" @click="close">×</button>
      </header>

      <div class="tm-edit-content">
        <div class="tm-edit-grid">
          <label class="tm-field tm-field-wide">
            <span>漫画名称</span>
            <input v-model="form.title" placeholder="请输入漫画名称" />
          </label>
          <label class="tm-field">
            <span>作者</span>
            <input v-model="form.author" placeholder="请输入作者名" />
          </label>
          <label class="tm-field">
            <span>发布时间</span>
            <input v-model="form.publishDate" type="date" placeholder="请选择发布时间" />
          </label>
          <label class="tm-field">
            <span>评分</span>
            <input v-model="form.star" placeholder="请输入评分" />
          </label>
          <label class="tm-check-field">
            <input v-model="writeJson" type="checkbox" />
            <span>同时写入 JSON 文件</span>
          </label>
          <label class="tm-field tm-field-wide">
            <span>简介</span>
            <textarea v-model="form.describe" rows="4" placeholder="请输入漫画简介" />
          </label>
        </div>

        <p v-if="error" class="tm-error" role="alert">{{ error }}</p>
      </div>

      <footer class="tm-edit-actions">
        <button type="button" class="tm-secondary-button" :disabled="submitting" @click="close">取消</button>
        <button type="submit" class="tm-primary-button" :disabled="submitting">
          {{ submitting ? '保存中…' : '保存' }}
        </button>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import mangaApi from '@/api/manga'

interface MetaForm {
  mangaId: number
  title: string
  author: string
  publishDate: string
  star: string
  describe: string
}

const props = defineProps<{
  modelValue: boolean
  mangaInfo: any
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'reload'): void
}>()

const form = reactive<MetaForm>({
  mangaId: 0,
  title: '',
  author: '',
  publishDate: '',
  star: '',
  describe: '',
})
const writeJson = ref(true)
const error = ref('')
const submitting = ref(false)

function syncForm() {
  const src = props.mangaInfo || {}
  form.mangaId = src.mangaId || 0
  form.title = src.title || src.mangaName || ''
  form.author = src.author || ''
  form.publishDate = src.publishDate || ''
  form.star = src.star != null ? String(src.star) : ''
  form.describe = src.describe || ''
}

watch(() => props.modelValue, (v) => {
  if (v) {
    error.value = ''
    syncForm()
  }
})

async function submit() {
  error.value = ''
  if (!form.mangaId) { error.value = '缺少漫画 ID'; return }
  submitting.value = true
  try {
    await mangaApi.update_manga_meta({ ...form }, writeJson.value)
    emit('reload')
    close()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '保存失败'
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
.tm-edit-dialog { width: min(58rem, 100%); max-height: min(72rem, calc(100vh - 4.8rem)); display: flex; flex-direction: column; overflow: hidden; color: var(--sd-text, #172033); background: var(--sd-card, #fff); border: 1px solid var(--sd-border, #e5e7eb); border-radius: 1.4rem; box-shadow: 0 2.4rem 6.4rem rgba(15, 23, 42, .22); }
.tm-edit-header { display: flex; align-items: center; justify-content: space-between; gap: 1.6rem; padding: 1.8rem 2.2rem; border-bottom: 1px solid var(--sd-border, #e5e7eb); }
.tm-edit-header h2, .tm-edit-header p { margin: 0; }
.tm-edit-header h2 { font-size: 1.8rem; }
.tm-edit-header p { margin-top: 0.4rem; color: var(--sd-text-muted, #64748b); font-size: 1.2rem; line-height: 1.45; }
.tm-edit-content { overflow: auto; padding: 2.2rem; }
.tm-edit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.4rem 1.6rem; }
.tm-field { display: flex; flex-direction: column; gap: 0.6rem; min-width: 0; color: var(--sd-text-muted, #475569); font-size: 1.3rem; font-weight: 500; }
.tm-field input, .tm-field textarea { box-sizing: border-box; width: 100%; padding: 0.9rem 1rem; color: var(--sd-text, #172033); font: inherit; font-weight: 400; background: var(--sd-back, #fff); border: 1px solid var(--sd-border, #dbe2ea); border-radius: 0.8rem; outline: none; resize: vertical; }
.tm-field input:focus, .tm-field textarea:focus { border-color: var(--sd-primary, #2563eb); box-shadow: 0 0 0 0.3rem color-mix(in srgb, var(--sd-primary, #2563eb) 15%, transparent); }
.tm-field-wide { grid-column: 1 / -1; }
.tm-check-field { display: flex; align-items: center; gap: 0.8rem; align-self: end; min-height: 3.8rem; color: var(--sd-text-muted, #475569); font-size: 1.3rem; cursor: pointer; }
.tm-check-field input { width: 1.5rem; height: 1.5rem; accent-color: var(--sd-primary, #2563eb); }
.tm-edit-actions { display: flex; align-items: center; justify-content: flex-end; gap: 1.6rem; padding: 1.8rem 2.2rem; border-top: 1px solid var(--sd-border, #e5e7eb); }
.tm-primary-button, .tm-secondary-button, .tm-icon-button { border: 0; border-radius: 0.8rem; font: inherit; cursor: pointer; }
.tm-primary-button { padding: 0.9rem 1.5rem; color: #fff; background: var(--sd-primary, #2563eb); }
.tm-secondary-button { padding: 0.8rem 1.3rem; color: var(--sd-text-muted, #475569); background: transparent; border: 1px solid var(--sd-border, #dbe2ea); }
.tm-icon-button { padding: 0.2rem 0.8rem; color: var(--sd-text-muted, #64748b); background: transparent; font-size: 2.4rem; line-height: 1; }
.tm-primary-button:disabled, .tm-secondary-button:disabled { cursor: not-allowed; opacity: .6; }
.tm-error { margin: 1.6rem 0 0; padding: 1rem 1.2rem; border-radius: 0.8rem; font-size: 1.3rem; line-height: 1.45; color: #b42318; background: #fef3f2; }
@media (max-width: 64rem) {
  .tm-edit-backdrop { padding: 1.2rem; }
  .tm-edit-content { padding: 1.6rem; }
  .tm-edit-header, .tm-edit-actions { padding: 1.4rem 1.6rem; }
  .tm-edit-grid { grid-template-columns: 1fr; }
  .tm-field-wide { grid-column: auto; }
}
</style>