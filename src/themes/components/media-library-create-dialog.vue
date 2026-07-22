<template>
  <div v-if="visible" class="tm-create-backdrop" @click.self="close">
    <form class="tm-create-dialog" @submit.prevent="submit">
      <header class="tm-create-header">
        <div>
          <h2>新建媒体库</h2>
          <p>创建媒体库后会添加首个扫描路径，并提交首次扫描任务。</p>
        </div>
        <button type="button" class="tm-icon-button" aria-label="关闭" @click="close">×</button>
      </header>

      <div class="tm-create-content">
        <section class="tm-create-section">
          <h3>媒体库</h3>
          <div class="tm-create-grid">
            <label class="tm-field tm-field-wide">
              <span>名称 <b>*</b></span>
              <input v-model="mediaForm.mediaName" required placeholder="例如：少年漫画" />
            </label>
            <label class="tm-field">
              <span>阅读方式</span>
              <select v-model="mediaForm.browseType">
                <option value="flow">条漫</option>
                <option value="single">单页</option>
                <option value="double">双页</option>
                <option value="half">半页</option>
              </select>
            </label>
            <label class="tm-field">
              <span>阅读方向</span>
              <select v-model.number="mediaForm.direction">
                <option :value="1">从右到左</option>
                <option :value="0">从左到右</option>
              </select>
            </label>
            <label class="tm-field">
              <span>来源站点</span>
              <select v-model="mediaForm.sourceWebsite">
                <option value="">无</option>
                <option value="toptoon">toptoon</option>
                <option value="toomics">toomics</option>
              </select>
            </label>
            <label class="tm-check-field">
              <input v-model="mediaForm.isCloudMedia" type="checkbox" :true-value="1" :false-value="0" />
              <span>云盘媒体库</span>
            </label>
            <label class="tm-check-field">
              <input v-model="mediaForm.removeFirst" type="checkbox" :true-value="1" :false-value="0" />
              <span>阅读时跳过首图</span>
            </label>
          </div>
        </section>

        <section class="tm-create-section">
          <div class="tm-section-heading">
            <div>
              <h3>首个扫描路径</h3>
              <p>路径会在创建后立即加入扫描队列。</p>
            </div>
            <button type="button" class="tm-secondary-button" :disabled="previewLoading" @click="previewPath">
              {{ previewLoading ? '试扫描中…' : '试扫描' }}
            </button>
          </div>
          <div class="tm-create-grid">
            <label class="tm-field tm-field-wide">
              <span>目录路径 <b>*</b></span>
              <input v-model="pathForm.pathContent" required placeholder="例如：D:\\Manga" />
            </label>
            <label class="tm-check-field">
              <input v-model="pathForm.autoScan" type="checkbox" :true-value="1" :false-value="0" />
              <span>启用定时自动扫描</span>
            </label>
            <label class="tm-field">
              <span>扫描模板</span>
              <select v-model="pathForm.scanTemplateKey" @change="ensureCustomTemplate">
                <option v-for="template in scanCatalog.templates" :key="template.key" :value="template.key">
                  {{ template.label }}
                </option>
              </select>
            </label>
            <label class="tm-field">
              <span>元数据识别</span>
              <select v-model="pathForm.metadataProfileKey">
                <option v-for="profile in scanCatalog.metadataProfiles" :key="profile.key" :value="profile.key">
                  {{ profile.label }}
                </option>
              </select>
              <small>{{ metadataProfileDescription }}</small>
            </label>
            <label class="tm-field">
              <span>包含规则</span>
              <input v-model="pathForm.include" placeholder="可选，正则表达式" />
            </label>
            <label class="tm-field">
              <span>排除规则</span>
              <input v-model="pathForm.exclude" placeholder="可选，正则表达式" />
            </label>
            <label v-if="pathForm.scanTemplateKey === 'custom'" class="tm-field tm-field-full">
              <span>模板规则 JSON <b>*</b></span>
              <textarea v-model="pathForm.scanTemplateConfig" rows="8" placeholder="请输入 version=1 的自定义模板规则"></textarea>
            </label>
            <label class="tm-field tm-field-full">
              <span>元数据高级配置</span>
              <textarea v-model="pathForm.metadataProfileConfig" rows="4" placeholder="可选：配置来源、优先级、覆盖策略和文件大小限制"></textarea>
            </label>
          </div>
        </section>

        <p v-if="createdMediaId" class="tm-warning">媒体库已创建，请修正路径后再次提交以完成首个扫描路径。</p>
        <p v-if="error" class="tm-error" role="alert">{{ error }}</p>
      </div>

      <footer class="tm-create-actions">
        <button type="button" class="tm-secondary-button" :disabled="submitting" @click="close">取消</button>
        <button type="submit" class="tm-primary-button" :disabled="submitting">
          {{ submitting ? '创建中…' : createdMediaId ? '添加路径并扫描' : '创建并扫描' }}
        </button>
      </footer>
    </form>
  </div>

  <scan-preview-dialog v-model="previewDialog" :result="previewResult" :loading="previewLoading" @apply-template="applyRecommendedTemplate" />
  <scan-run-dialog v-model="scanRunDialog" :media-id="scanMediaId || undefined" :initial-scan-run-id="scanRunId" />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import mediaApi from '@/api/media'
import pathApi from '@/api/path'
import scanRunApi from '@/api/scan-run'
import { fallbackScanCatalog } from '@/constants/scan'
import type { ScanPreviewInput, ScanPreviewResult, ScanTemplateCatalog, ScanTemplateKey } from '@/type/scan'
import ScanPreviewDialog from '@/views/media-manage/components/ScanPreviewDialog.vue'
import ScanRunDialog from '@/views/media-manage/components/ScanRunDialog.vue'

const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{
  (event: 'created', value: { mediaId: number; scanRunId: number | null }): void
}>()

const defaultCustomTemplateConfig = JSON.stringify(
  {
    version: 1,
    strategy: 'mixed',
    rules: [
      {
        id: 'manga-chapter',
        label: '漫画/章节',
        priority: 100,
        mangaIndex: 0,
        chapterIndex: 1,
        singleChapter: false,
      },
    ],
  },
  null,
  2
)

const mediaForm = reactive({
  mediaName: '',
  mediaType: 0,
  browseType: 'flow',
  direction: 1,
  removeFirst: 0,
  sourceWebsite: '',
  isCloudMedia: 0,
})

const pathForm = reactive<ScanPreviewInput>({
  pathContent: '',
  autoScan: 0,
  include: '',
  exclude: '',
  scanTemplateKey: 'auto',
  scanTemplateConfig: '',
  metadataProfileKey: 'auto',
  metadataProfileConfig: '',
})

const scanCatalog = ref<ScanTemplateCatalog>({ ...fallbackScanCatalog })
const error = ref('')
const submitting = ref(false)
const createdMediaId = ref<number | null>(null)
const previewDialog = ref(false)
const previewLoading = ref(false)
const previewResult = ref<ScanPreviewResult | null>(null)
const scanRunDialog = ref(false)
const scanMediaId = ref<number | null>(null)
const scanRunId = ref<number | null>(null)

const metadataProfileDescription = computed(
  () => scanCatalog.value.metadataProfiles.find((profile) => profile.key === pathForm.metadataProfileKey)?.description || ''
)

watch(visible, (open) => {
  if (open) void loadScanCatalog()
})

async function loadScanCatalog() {
  try {
    scanCatalog.value = await scanRunApi.catalog()
  } catch {
    scanCatalog.value = { ...fallbackScanCatalog }
  }
}

function ensureCustomTemplate() {
  if (pathForm.scanTemplateKey === 'custom' && !pathForm.scanTemplateConfig?.trim()) {
    pathForm.scanTemplateConfig = defaultCustomTemplateConfig
  }
}

function validateForm() {
  error.value = ''
  if (!mediaForm.mediaName.trim() || !pathForm.pathContent.trim()) {
    error.value = '请填写媒体库名称和首个扫描路径。'
    return false
  }

  const jsonFields = [
    { label: '模板规则 JSON', value: pathForm.scanTemplateConfig, required: pathForm.scanTemplateKey === 'custom' },
    { label: '元数据高级配置', value: pathForm.metadataProfileConfig, required: false },
  ]
  for (const field of jsonFields) {
    if (field.required && !field.value?.trim()) {
      error.value = `${field.label}不能为空。`
      return false
    }
    if (field.value?.trim()) {
      try {
        JSON.parse(field.value)
      } catch {
        error.value = `${field.label}不是有效 JSON。`
        return false
      }
    }
  }
  return true
}

async function previewPath() {
  if (!validateForm()) return
  previewLoading.value = true
  try {
    previewResult.value = await pathApi.preview_path({
      ...pathForm,
      pathContent: pathForm.pathContent.trim(),
      mediaType: mediaForm.mediaType,
      isCloudMedia: mediaForm.isCloudMedia,
    })
    previewDialog.value = true
  } catch (cause) {
    error.value = errorMessage(cause, '试扫描失败，请检查目录和扫描配置。')
  } finally {
    previewLoading.value = false
  }
}

function applyRecommendedTemplate(templateKey: ScanTemplateKey) {
  pathForm.scanTemplateKey = templateKey
  ensureCustomTemplate()
}

async function submit() {
  if (!validateForm()) return
  submitting.value = true
  try {
    if (!createdMediaId.value) {
      const response = await mediaApi.add_media({
        ...mediaForm,
        mediaName: mediaForm.mediaName.trim(),
      })
      const mediaId = Number((response as any)?.data?.mediaId ?? (response as any)?.mediaId)
      if (!mediaId) throw new Error('媒体库创建成功，但未返回媒体库 ID。')
      createdMediaId.value = mediaId
    }

    const completedMediaId = createdMediaId.value
    if (!completedMediaId) throw new Error('媒体库创建成功，但未返回媒体库 ID。')
    const path = await pathApi.add_path(completedMediaId, {
      ...pathForm,
      pathContent: pathForm.pathContent.trim(),
    })
    const completedScanRunId = Number(path?.scanRunId) || null
    scanMediaId.value = completedMediaId
    scanRunId.value = completedScanRunId
    emit('created', { mediaId: completedMediaId, scanRunId: completedScanRunId })
    resetForm()
    visible.value = false
    if (completedScanRunId) scanRunDialog.value = true
  } catch (cause) {
    const message = errorMessage(cause, createdMediaId.value ? '请修正后再次提交。' : '创建媒体库失败。')
    error.value = createdMediaId.value
      ? `媒体库已创建，但首个路径未添加：${message}`
      : message
  } finally {
    submitting.value = false
  }
}

function errorMessage(cause: unknown, fallback: string) {
  const message = (cause as any)?.response?.data?.message || (cause as Error)?.message
  return message || fallback
}

function close() {
  resetForm()
  visible.value = false
}

function resetForm() {
  Object.assign(mediaForm, {
    mediaName: '', mediaType: 0, browseType: 'flow', direction: 1,
    removeFirst: 0, sourceWebsite: '', isCloudMedia: 0,
  })
  Object.assign(pathForm, {
    pathContent: '', autoScan: 0, include: '', exclude: '', scanTemplateKey: 'auto',
    scanTemplateConfig: '', metadataProfileKey: 'auto', metadataProfileConfig: '',
  })
  error.value = ''
  createdMediaId.value = null
  previewResult.value = null
}
</script>

<style scoped>
.tm-create-backdrop { position: fixed; inset: 0; z-index: 900; display: grid; place-items: center; padding: 24px; background: rgba(15, 23, 42, .42); backdrop-filter: blur(3px); }
.tm-create-dialog { width: min(820px, 100%); max-height: min(880px, calc(100vh - 48px)); display: flex; flex-direction: column; overflow: hidden; color: var(--sd-text, #172033); background: var(--sd-card, #fff); border: 1px solid var(--sd-border, #e5e7eb); border-radius: 14px; box-shadow: 0 24px 64px rgba(15, 23, 42, .22); }
.tm-create-header, .tm-create-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px; border-color: var(--sd-border, #e5e7eb); }
.tm-create-header { border-bottom: 1px solid var(--sd-border, #e5e7eb); }
.tm-create-header h2, .tm-create-header p, .tm-create-section h3, .tm-create-section p { margin: 0; }
.tm-create-header h2 { font-size: 18px; }
.tm-create-header p, .tm-section-heading p, .tm-field small { margin-top: 4px; color: var(--sd-text-muted, #64748b); font-size: 12px; line-height: 1.45; }
.tm-create-content { overflow: auto; padding: 22px; }
.tm-create-section + .tm-create-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--sd-border, #e5e7eb); }
.tm-create-section h3 { font-size: 15px; }
.tm-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.tm-create-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; margin-top: 14px; }
.tm-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; color: var(--sd-text-muted, #475569); font-size: 13px; font-weight: 500; }
.tm-field b { color: #dc2626; }
.tm-field input, .tm-field select, .tm-field textarea { box-sizing: border-box; width: 100%; padding: 9px 10px; color: var(--sd-text, #172033); font: inherit; font-weight: 400; background: var(--sd-back, #fff); border: 1px solid var(--sd-border, #dbe2ea); border-radius: 8px; outline: none; resize: vertical; }
.tm-field input:focus, .tm-field select:focus, .tm-field textarea:focus { border-color: var(--sd-primary, #2563eb); box-shadow: 0 0 0 3px color-mix(in srgb, var(--sd-primary, #2563eb) 15%, transparent); }
.tm-field-wide, .tm-field-full { grid-column: 1 / -1; }
.tm-check-field { display: flex; align-items: center; gap: 8px; align-self: end; min-height: 38px; color: var(--sd-text-muted, #475569); font-size: 13px; cursor: pointer; }
.tm-check-field input { width: 15px; height: 15px; accent-color: var(--sd-primary, #2563eb); }
.tm-create-actions { justify-content: flex-end; border-top: 1px solid var(--sd-border, #e5e7eb); }
.tm-primary-button, .tm-secondary-button, .tm-icon-button { border: 0; border-radius: 8px; font: inherit; cursor: pointer; }
.tm-primary-button { padding: 9px 15px; color: #fff; background: var(--sd-primary, #2563eb); }
.tm-secondary-button { padding: 8px 13px; color: var(--sd-text-muted, #475569); background: transparent; border: 1px solid var(--sd-border, #dbe2ea); }
.tm-icon-button { padding: 2px 8px; color: var(--sd-text-muted, #64748b); background: transparent; font-size: 24px; line-height: 1; }
.tm-primary-button:disabled, .tm-secondary-button:disabled { cursor: not-allowed; opacity: .6; }
.tm-error, .tm-warning { margin: 16px 0 0; padding: 10px 12px; border-radius: 8px; font-size: 13px; line-height: 1.45; }
.tm-error { color: #b42318; background: #fef3f2; }
.tm-warning { color: #92400e; background: #fffbeb; }
@media (max-width: 640px) { .tm-create-backdrop { padding: 12px; } .tm-create-content { padding: 16px; } .tm-create-header, .tm-create-actions { padding: 14px 16px; } .tm-create-grid { grid-template-columns: 1fr; } .tm-field-wide, .tm-field-full { grid-column: auto; } }
</style>
