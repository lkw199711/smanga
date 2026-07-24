<template>
  <div v-if="editMangaDialog" class="tm-edit-backdrop" @click.self="close">
    <form class="tm-edit-dialog" @submit.prevent="submit">
      <header class="tm-edit-header">
        <div>
          <h2>编辑漫画</h2>
          <p>修改漫画的基本信息与阅读设置。</p>
        </div>
        <button type="button" class="tm-icon-button" aria-label="关闭" @click="close">×</button>
      </header>

      <div class="tm-edit-content">
        <div class="tm-edit-grid">
          <label class="tm-field tm-field-wide">
            <span>名称 <b>*</b></span>
            <input v-model="form.mangaName" required placeholder="漫画名称" />
          </label>
          <label class="tm-field tm-field-wide">
            <span>路径 <b>*</b></span>
            <input v-model="form.mangaPath" required placeholder="漫画路径" />
          </label>
          <label class="tm-field tm-field-wide">
            <span>封面路径</span>
            <input v-model="form.mangaCover" placeholder="服务器封面路径" />
          </label>
          <label class="tm-field tm-field-wide">
            <span>上传封面</span>
            <CoverUpload
              cover-type="manga"
              :init-cover="form.mangaCover"
              :bind-id="form.mangaId"
              @update:value="value => (form.mangaCover = value)"
            />
          </label>
        </div>

        <section class="tm-section-title"><h3>阅读设置</h3></section>

        <div class="tm-edit-grid">
          <label class="tm-field">
            <span>阅读方式</span>
            <select v-model="form.browseType">
              <option value="flow">条漫</option>
              <option value="single">单页</option>
              <option value="double">双页</option>
              <option value="half">半页</option>
            </select>
          </label>
          <label class="tm-field">
            <span>阅读方向</span>
            <select v-model.number="form.direction">
              <option :value="1">从右到左</option>
              <option :value="0">从左到右</option>
            </select>
          </label>
          <label class="tm-check-field">
            <input v-model.number="form.removeFirst" type="checkbox" :true-value="1" :false-value="0" />
            <span>阅读时跳过首图</span>
          </label>
        </div>

        <p v-if="error" class="tm-error" role="alert">{{ error }}</p>
      </div>

      <footer class="tm-edit-actions">
        <button type="button" class="tm-secondary-button" :disabled="submitting" @click="close">取消</button>
        <button type="submit" class="tm-primary-button" :disabled="submitting">
          {{ submitting ? '保存中…' : '确认' }}
        </button>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import mangaApi from '@/api/manga'
import CoverUpload from '@/components/cover-upload.vue'
import { mangaInit } from '@/type/manga'

const editMangaDialog = defineModel<boolean>('editMangaDialog')
const props = defineProps({
  mangaInfo: { type: Object, default: () => ({ ...mangaInit }) },
})
const emit = defineEmits(['close', 'reload'])

const form = reactive({ ...props.mangaInfo })
const error = ref('')
const submitting = ref(false)

function syncForm() {
  Object.assign(form, mangaInit, props.mangaInfo)
}

watch(() => props.mangaInfo, syncForm, { deep: true, immediate: true })
watch(() => editMangaDialog.value, (open) => {
  if (open) syncForm()
})

async function submit() {
  error.value = ''
  if (!form.mangaName?.trim()) { error.value = '请输入漫画名称。'; return }
  if (!form.mangaPath?.trim()) { error.value = '请输入漫画路径。'; return }
  submitting.value = true
  try {
    const res = await mangaApi.update_manga(form)
    if (res) { editMangaDialog.value = false; emit('reload') }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '操作失败'
  } finally { submitting.value = false }
}

function close() { error.value = ''; emit('close'); editMangaDialog.value = false }
</script>

<style scoped>
.tm-edit-backdrop { position: fixed; inset: 0; z-index: 900; display: grid; place-items: center; padding: 24px; background: rgba(15, 23, 42, .42); backdrop-filter: blur(3px); }
.tm-edit-dialog { width: min(580px, 100%); max-height: min(720px, calc(100vh - 48px)); display: flex; flex-direction: column; overflow: hidden; color: var(--sd-text, #172033); background: var(--sd-card, #fff); border: 1px solid var(--sd-border, #e5e7eb); border-radius: 14px; box-shadow: 0 24px 64px rgba(15, 23, 42, .22); }
.tm-edit-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px; border-bottom: 1px solid var(--sd-border, #e5e7eb); }
.tm-edit-header h2, .tm-edit-header p { margin: 0; }
.tm-edit-header h2 { font-size: 18px; }
.tm-edit-header p { margin-top: 4px; color: var(--sd-text-muted, #64748b); font-size: 12px; line-height: 1.45; }
.tm-edit-content { overflow: auto; padding: 22px; }
.tm-edit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.tm-section-title { margin: 20px 0 10px; padding-top: 18px; border-top: 1px solid var(--sd-border, #e5e7eb); }
.tm-section-title h3 { margin: 0; font-size: 15px; }
.tm-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; color: var(--sd-text-muted, #475569); font-size: 13px; font-weight: 500; }
.tm-field b { color: #dc2626; }
.tm-field input, .tm-field select { box-sizing: border-box; width: 100%; padding: 9px 10px; color: var(--sd-text, #172033); font: inherit; font-weight: 400; background: var(--sd-back, #fff); border: 1px solid var(--sd-border, #dbe2ea); border-radius: 8px; outline: none; }
.tm-field input:focus, .tm-field select:focus { border-color: var(--sd-primary, #2563eb); box-shadow: 0 0 0 3px color-mix(in srgb, var(--sd-primary, #2563eb) 15%, transparent); }
.tm-field-wide { grid-column: 1 / -1; }
.tm-check-field { display: flex; align-items: center; gap: 8px; align-self: end; min-height: 38px; color: var(--sd-text-muted, #475569); font-size: 13px; cursor: pointer; }
.tm-check-field input { width: 15px; height: 15px; accent-color: var(--sd-primary, #2563eb); }
.tm-edit-actions { display: flex; align-items: center; justify-content: flex-end; gap: 16px; padding: 18px 22px; border-top: 1px solid var(--sd-border, #e5e7eb); }
.tm-primary-button, .tm-secondary-button, .tm-icon-button { border: 0; border-radius: 8px; font: inherit; cursor: pointer; }
.tm-primary-button { padding: 9px 15px; color: #fff; background: var(--sd-primary, #2563eb); }
.tm-secondary-button { padding: 8px 13px; color: var(--sd-text-muted, #475569); background: transparent; border: 1px solid var(--sd-border, #dbe2ea); }
.tm-icon-button { padding: 2px 8px; color: var(--sd-text-muted, #64748b); background: transparent; font-size: 24px; line-height: 1; }
.tm-primary-button:disabled, .tm-secondary-button:disabled { cursor: not-allowed; opacity: .6; }
.tm-error { margin: 16px 0 0; padding: 10px 12px; border-radius: 8px; font-size: 13px; line-height: 1.45; color: #b42318; background: #fef3f2; }
@media (max-width: 640px) { .tm-edit-backdrop { padding: 12px; } .tm-edit-content { padding: 16px; } .tm-edit-header, .tm-edit-actions { padding: 14px 16px; } .tm-edit-grid { grid-template-columns: 1fr; } .tm-field-wide { grid-column: auto; } }
</style>
