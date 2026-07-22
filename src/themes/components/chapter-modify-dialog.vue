<template>
  <div v-if="editChapterDialog" class="tm-edit-backdrop" @click.self="close">
    <form class="tm-edit-dialog" @submit.prevent="submit">
      <header class="tm-edit-header">
        <div>
          <h2>编辑章节</h2>
          <p>修改章节的基本信息。</p>
        </div>
        <button type="button" class="tm-icon-button" aria-label="关闭" @click="close">×</button>
      </header>

      <div class="tm-edit-content">
        <div class="tm-edit-grid">
          <label class="tm-field tm-field-wide">
            <span>名称 <b>*</b></span>
            <input v-model="form.chapterName" required placeholder="章节名称" />
          </label>
          <label class="tm-field tm-field-wide">
            <span>路径 <b>*</b></span>
            <input v-model="form.chapterPath" required placeholder="章节路径" />
          </label>
          <label class="tm-field">
            <span>章节号</span>
            <input v-model.number="form.chapterNumber" placeholder="章节号" />
          </label>
          <label class="tm-field tm-field-wide">
            <span>封面路径</span>
            <input v-model="form.chapterCover" placeholder="服务器封面路径" />
          </label>
          <label class="tm-field tm-field-wide">
            <span>上传封面</span>
            <CoverUpload
              cover-type="chapter"
              :bind-id="form.chapterId"
              :init-cover="form.chapterCover"
              @update:value="value => (form.chapterCover = value)"
            />
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
import chapterApi from '@/api/chapter'
import CoverUpload from '@/components/cover-upload.vue'
import { chapterInit } from '@/type/chapter'

const editChapterDialog = defineModel<boolean>('editChapterDialog')
const props = defineProps({
  chapterInfo: { type: Object, default: () => ({ ...chapterInit }) },
})
const emit = defineEmits(['close', 'reload'])

const form = reactive({ ...props.chapterInfo })
const error = ref('')
const submitting = ref(false)

watch(() => props.chapterInfo, (v) => Object.assign(form, v))

async function submit() {
  error.value = ''
  if (!form.chapterName?.trim()) { error.value = '请输入章节名称。'; return }
  if (!form.chapterPath?.trim()) { error.value = '请输入章节路径。'; return }
  submitting.value = true
  try {
    const res = await chapterApi.update_chapter(form)
    if (res) { editChapterDialog.value = false; emit('reload') }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '操作失败'
  } finally { submitting.value = false }
}

function close() { error.value = ''; emit('close'); editChapterDialog.value = false }
</script>

<style scoped>
.tm-edit-backdrop { position: fixed; inset: 0; z-index: 900; display: grid; place-items: center; padding: 24px; background: rgba(15, 23, 42, .42); backdrop-filter: blur(3px); }
.tm-edit-dialog { width: min(580px, 100%); max-height: min(600px, calc(100vh - 48px)); display: flex; flex-direction: column; overflow: hidden; color: var(--sd-text, #172033); background: var(--sd-card, #fff); border: 1px solid var(--sd-border, #e5e7eb); border-radius: 14px; box-shadow: 0 24px 64px rgba(15, 23, 42, .22); }
.tm-edit-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px; border-bottom: 1px solid var(--sd-border, #e5e7eb); }
.tm-edit-header h2, .tm-edit-header p { margin: 0; }
.tm-edit-header h2 { font-size: 18px; }
.tm-edit-header p { margin-top: 4px; color: var(--sd-text-muted, #64748b); font-size: 12px; line-height: 1.45; }
.tm-edit-content { overflow: auto; padding: 22px; }
.tm-edit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.tm-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; color: var(--sd-text-muted, #475569); font-size: 13px; font-weight: 500; }
.tm-field b { color: #dc2626; }
.tm-field input { box-sizing: border-box; width: 100%; padding: 9px 10px; color: var(--sd-text, #172033); font: inherit; font-weight: 400; background: var(--sd-back, #fff); border: 1px solid var(--sd-border, #dbe2ea); border-radius: 8px; outline: none; }
.tm-field input:focus { border-color: var(--sd-primary, #2563eb); box-shadow: 0 0 0 3px color-mix(in srgb, var(--sd-primary, #2563eb) 15%, transparent); }
.tm-field-wide { grid-column: 1 / -1; }
.tm-edit-actions { display: flex; align-items: center; justify-content: flex-end; gap: 16px; padding: 18px 22px; border-top: 1px solid var(--sd-border, #e5e7eb); }
.tm-primary-button, .tm-secondary-button, .tm-icon-button { border: 0; border-radius: 8px; font: inherit; cursor: pointer; }
.tm-primary-button { padding: 9px 15px; color: #fff; background: var(--sd-primary, #2563eb); }
.tm-secondary-button { padding: 8px 13px; color: var(--sd-text-muted, #475569); background: transparent; border: 1px solid var(--sd-border, #dbe2ea); }
.tm-icon-button { padding: 2px 8px; color: var(--sd-text-muted, #64748b); background: transparent; font-size: 24px; line-height: 1; }
.tm-primary-button:disabled, .tm-secondary-button:disabled { cursor: not-allowed; opacity: .6; }
.tm-error { margin: 16px 0 0; padding: 10px 12px; border-radius: 8px; font-size: 13px; line-height: 1.45; color: #b42318; background: #fef3f2; }
@media (max-width: 640px) { .tm-edit-backdrop { padding: 12px; } .tm-edit-content { padding: 16px; } .tm-edit-header, .tm-edit-actions { padding: 14px 16px; } .tm-edit-grid { grid-template-columns: 1fr; } .tm-field-wide { grid-column: auto; } }
</style>
