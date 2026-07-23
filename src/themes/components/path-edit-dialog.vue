<template>
  <div v-if="visible" class="ta-dialog-overlay" @click.self="close">
    <div class="ta-dialog" style="width:560px">
      <div class="ta-dialog-head">
        <h3>{{ isAdd ? '添加路径' : '编辑路径' }}</h3>
        <button class="ta-dialog-close" @click="close">×</button>
      </div>
      <div class="ta-dialog-body">
        <!-- 路径输入 (仅添加模式) -->
        <label v-if="isAdd" class="ta-field">
          <span>路径</span>
          <div class="pe-path-add-row">
            <input v-model="form.pathContent" placeholder="/path/to/manga" class="pe-flex-input" />
            <button class="ta-btn-ghost" :disabled="previewLoading" @click="doPreview">🔍 试扫描</button>
          </div>
        </label>
        <!-- 路径只读 (编辑模式) -->
        <label v-else class="ta-field">
          <span>路径</span>
          <input disabled :value="form.pathContent" />
        </label>

        <p class="s-form-title">扫描配置</p>

        <label class="ta-field ta-field-switch">
          <span>自动扫描</span>
          <label class="ta-switch">
            <input type="checkbox" :checked="form.autoScan === 1" @change="form.autoScan = ($event.target as HTMLInputElement).checked ? 1 : 0" />
            <span class="ta-switch-slider"></span>
          </label>
        </label>

        <label class="ta-field"><span>包含 (正则)</span><input v-model="form.include" placeholder="(aaa|bbb)" /></label>
        <label class="ta-field"><span>排除 (正则)</span><input v-model="form.exclude" placeholder="(ccc|ddd)" /></label>

        <label class="ta-field">
          <span>扫描模板</span>
          <select v-model="form.scanTemplateKey" class="ta-select" @change="ensureCustomConfig">
            <option value="legacy">旧版扫描</option>
            <option v-for="t in templates" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
        </label>

        <label v-if="form.scanTemplateKey === 'custom'" class="ta-field">
          <span>模板规则 JSON</span>
          <textarea v-model="form.scanTemplateConfig" rows="6" placeholder='{"version":1,"strategy":"mixed",...}'></textarea>
        </label>

        <label class="ta-field">
          <span>元数据识别</span>
          <select v-model="form.metadataProfileKey" class="ta-select">
            <option v-for="m in metadataProfiles" :key="m.key" :value="m.key">{{ m.label }}</option>
          </select>
        </label>

        <label class="ta-field">
          <span>元数据高级配置</span>
          <textarea v-model="form.metadataProfileConfig" rows="4" placeholder="可选：配置来源、优先级等"></textarea>
        </label>
      </div>

      <div class="ta-dialog-foot">
        <button v-if="!isAdd" class="ta-btn-ghost" :disabled="previewLoading" @click="doPreview">
          {{ previewLoading ? '预检中...' : '🔍 试扫描' }}
        </button>
        <div style="flex:1"></div>
        <button class="ta-btn-primary" :disabled="saving" @click="doSave">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <button class="ta-btn-ghost" @click="close">取消</button>
      </div>
    </div>
  </div>

  <!-- 试扫描预览 -->
  <ScanPreviewDialog
    v-model="previewDialog"
    :result="previewResult"
    :loading="previewLoading"
    @apply-template="applyTemplate"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import pathApi from '@/api/path'
import scanRunApi from '@/api/scan-run'
import { fallbackScanCatalog } from '@/constants/scan'
import ScanPreviewDialog from '@/views/media-manage/components/ScanPreviewDialog.vue'
import type { ScanPreviewResult, ScanTemplateKey, ScanTemplateCatalog } from '@/type/scan'

const props = defineProps<{
  modelValue: boolean
  /** 'add' 添加新路径 | 'edit' 编辑已有路径 */
  mode: 'add' | 'edit'
  /** 媒体库ID (添加模式必传) */
  mediaId?: number
  /** 已有路径数据 (编辑模式必传) */
  pathInfo?: any
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'saved': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isAdd = computed(() => props.mode === 'add')

// ---- 表单 ----
const saving = ref(false)
const form = reactive<any>({
  pathContent: '',
  autoScan: 0,
  include: '',
  exclude: '',
  scanTemplateKey: 'legacy',
  scanTemplateConfig: '',
  metadataProfileKey: 'auto',
  metadataProfileConfig: '',
})

// 重置表单
function resetForm() {
  Object.assign(form, {
    pathContent: '',
    autoScan: 0,
    include: '',
    exclude: '',
    scanTemplateKey: 'auto',
    scanTemplateConfig: '',
    metadataProfileKey: 'auto',
    metadataProfileConfig: '',
  })
}

// 编辑模式：从 pathInfo 初始化
watch(() => props.modelValue, (v) => {
  if (!v) return
  if (!isAdd.value && props.pathInfo) {
    Object.assign(form, {
      pathId: props.pathInfo.pathId,
      mediaId: props.pathInfo.mediaId,
      pathContent: props.pathInfo.pathContent,
      autoScan: props.pathInfo.autoScan ?? 0,
      include: props.pathInfo.include || '',
      exclude: props.pathInfo.exclude || '',
      scanTemplateKey: props.pathInfo.scanTemplateKey || 'legacy',
      scanTemplateConfig: props.pathInfo.scanTemplateConfig || '',
      metadataProfileKey: props.pathInfo.metadataProfileKey || 'auto',
      metadataProfileConfig: props.pathInfo.metadataProfileConfig || '',
    })
  } else {
    resetForm()
  }
})

// ---- 扫描目录 ----
const scanCatalog = ref<ScanTemplateCatalog>({ ...fallbackScanCatalog })
const templates = computed(() => scanCatalog.value.templates)
const metadataProfiles = computed(() => scanCatalog.value.metadataProfiles)

const defaultCustomConfig = JSON.stringify({
  version: 1,
  strategy: 'mixed',
  rules: [{ id: 'manga-chapter', label: '漫画/章节', priority: 100, mangaIndex: 0, chapterIndex: 1, singleChapter: false }],
}, null, 2)

function ensureCustomConfig() {
  if (form.scanTemplateKey === 'custom' && !form.scanTemplateConfig?.trim()) {
    form.scanTemplateConfig = defaultCustomConfig
  }
}

onMounted(async () => {
  try { scanCatalog.value = await scanRunApi.catalog() } catch { /* fallback */ }
})

// ---- 试扫描 ----
const previewDialog = ref(false)
const previewLoading = ref(false)
const previewResult = ref<ScanPreviewResult | null>(null)

function validateConfig(): boolean {
  if (form.scanTemplateConfig) {
    try { JSON.parse(form.scanTemplateConfig) } catch { alert('模板规则 JSON 格式无效'); return false }
  }
  if (form.metadataProfileConfig) {
    try { JSON.parse(form.metadataProfileConfig) } catch { alert('元数据配置 JSON 格式无效'); return false }
  }
  return true
}

async function doPreview() {
  if (!validateConfig()) return
  previewLoading.value = true
  try {
    previewResult.value = await pathApi.preview_path({
      pathContent: form.pathContent,
      mediaId: isAdd.value ? (props.mediaId || 0) : form.mediaId,
      scanTemplateKey: form.scanTemplateKey as ScanTemplateKey,
      scanTemplateConfig: form.scanTemplateConfig,
      metadataProfileKey: form.metadataProfileKey,
      metadataProfileConfig: form.metadataProfileConfig,
      autoScan: form.autoScan,
      include: form.include,
      exclude: form.exclude,
    })
    previewDialog.value = true
  } finally { previewLoading.value = false }
}

function applyTemplate(templateKey: ScanTemplateKey) {
  form.scanTemplateKey = templateKey
}

// ---- 保存 ----
async function doSave() {
  saving.value = true
  try {
    if (isAdd.value) {
      if (!form.pathContent) { alert('路径不能为空'); return }
      if (!validateConfig()) return
      await pathApi.add_path(props.mediaId, { ...form })
    } else {
      await pathApi.update_path(form.pathId, {
        autoScan: form.autoScan,
        include: form.include,
        exclude: form.exclude,
        scanTemplateKey: form.scanTemplateKey,
        scanTemplateConfig: form.scanTemplateConfig,
        metadataProfileKey: form.metadataProfileKey,
        metadataProfileConfig: form.metadataProfileConfig,
      })
    }
    emit('update:modelValue', false)
    emit('saved')
  } catch (e: any) { alert(e?.message || '保存失败') }
  finally { saving.value = false }
}

function close() { emit('update:modelValue', false) }
</script>

<style scoped>
.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 14px; width: 560px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
.ta-dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 20px; cursor: pointer; color: #9ca3af; border-radius: 6px; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #eaeaea; }

.ta-field { display: flex; flex-direction: column; gap: 6px; }
.ta-field span { font-size: 13px; font-weight: 500; color: #374151; }
.ta-field input, .ta-select { padding: 8px 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 13px; outline: none; }
.ta-field input:focus, .ta-select:focus { border-color: #2563eb; }
.ta-field input:disabled { background: #f9fafb; color: #6b7280; cursor: not-allowed; }
.ta-field textarea { padding: 8px 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 13px; outline: none; resize: vertical; font-family: monospace; }
.ta-field textarea:focus { border-color: #2563eb; }
.ta-field-switch { flex-direction: row; align-items: center; justify-content: space-between; }
.ta-select { background: #fff; }

.ta-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.ta-switch input { display: none; }
.ta-switch-slider { position: absolute; inset: 0; border-radius: 12px; background: #d1d5db; cursor: pointer; transition: .2s; }
.ta-switch-slider::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: .2s; }
.ta-switch input:checked + .ta-switch-slider { background: #2563eb; }
.ta-switch input:checked + .ta-switch-slider::after { transform: translateX(20px); }

.pe-path-add-row { display: flex; gap: 8px; }
.pe-flex-input { flex: 1; }

.ta-btn-primary, .ta-btn-ghost { cursor: pointer; font-size: 13px; border-radius: 8px; }
.ta-btn-primary { padding: 8px 16px; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-ghost { padding: 8px 16px; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-ghost:disabled,.ta-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.s-form-title { font-size: 14px; font-weight: 600; color: #374151; margin: 4px 0 0; padding-top: 8px; border-top: 1px solid #eaeaea; }
</style>
