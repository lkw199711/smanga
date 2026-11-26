<template>
  <div class="srm-root">
    <div class="srm-head">
      <div>
        <h1>存储根管理</h1>
        <p>管理本地磁盘、NAS 和网盘在服务器上的当前挂载位置。</p>
      </div>
      <div class="srm-actions">
        <div class="srm-search">
          <input v-model="keyword" placeholder="搜索名称、标识或路径" @keyup.enter="search" />
          <button class="srm-btn srm-btn-secondary" @click="search">搜索</button>
        </div>
        <button class="srm-btn srm-btn-secondary" :disabled="loading" @click="load">刷新</button>
        <button class="srm-btn srm-btn-primary" @click="openCreate">+ 新建存储根</button>
      </div>
    </div>

    <div class="srm-note">
      Smanga 不负责登录或挂载网盘。请先在飞牛、操作系统或容器中完成挂载，再填写服务器实际可见的目录。
    </div>

    <div v-if="loading" class="srm-empty">正在加载存储根…</div>
    <div v-else-if="roots.length === 0" class="srm-empty">
      <div class="srm-empty-icon">🗂</div>
      <strong>还没有存储根</strong>
      <span>可以从 115 网盘预设开始，也可以创建自定义存储位置。</span>
      <button class="srm-btn srm-btn-primary" @click="openCreate">新建存储根</button>
    </div>
    <div v-else class="srm-grid">
      <article v-for="root in roots" :key="root.storageRootId" class="srm-card">
        <div class="srm-card-top">
          <div :class="['srm-icon', `srm-icon-${root.providerKey}`, { 'has-image': storageRootIconSource(root.iconKey) }]">
            <img v-if="storageRootIconSource(root.iconKey)" :src="storageRootIconSource(root.iconKey)" :alt="`${root.rootName}图标`" />
            <template v-else>{{ storageRootIconText(root.iconKey) }}</template>
          </div>
          <div class="srm-card-title">
            <div class="srm-name-row">
              <h2>{{ root.rootName }}</h2>
              <span :class="['srm-status', statusClass(root)]">{{ statusLabel(root) }}</span>
            </div>
            <code>{{ root.rootKey }}</code>
          </div>
        </div>

        <dl class="srm-details">
          <div><dt>类型</dt><dd>{{ providerLabel(root.providerKey) }}</dd></div>
          <div><dt>当前路径</dt><dd class="srm-path" :title="root.rootPath">{{ root.rootPath }}</dd></div>
          <div><dt>绑定路径</dt><dd>{{ root.pathCount || 0 }}</dd></div>
          <div><dt>最近检测</dt><dd>{{ root.lastCheckTime || '尚未检测' }}</dd></div>
        </dl>

        <p v-if="root.description" class="srm-description">{{ root.description }}</p>
        <p v-if="root.lastCheckMessage" class="srm-check-message">{{ root.lastCheckMessage }}</p>

        <div class="srm-card-actions">
          <button class="srm-link" :disabled="checkingId === root.storageRootId" @click="checkRoot(root)">
            {{ checkingId === root.storageRootId ? '检测中…' : '检测' }}
          </button>
          <button class="srm-link" @click="openEdit(root)">编辑</button>
          <button class="srm-link srm-link-danger" :disabled="(root.pathCount || 0) > 0" @click="removeRoot(root)">删除</button>
        </div>
      </article>
    </div>

    <div v-if="total > pageSize" class="srm-pager">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>第 {{ page }} / {{ Math.ceil(total / pageSize) }} 页，共 {{ total }} 条</span>
      <button :disabled="page >= Math.ceil(total / pageSize)" @click="changePage(page + 1)">下一页</button>
    </div>

    <div v-if="dialogVisible" class="srm-overlay smanga-backable" @click.self="closeDialog">
      <div class="srm-dialog">
        <div class="srm-dialog-head">
          <div>
            <h2>{{ editingId ? '编辑存储根' : '新建存储根' }}</h2>
            <p>{{ editingId ? '修改挂载位置后，绑定路径将在后续阶段使用新位置。' : '先选择一个预设，再确认服务器上的真实目录。' }}</p>
          </div>
          <button class="srm-close smanga-back-close" @click="closeDialog">×</button>
        </div>

        <div class="srm-dialog-body">
          <section v-if="!editingId" class="srm-section">
            <div class="srm-section-title">选择预设</div>
            <div class="srm-presets">
              <button
                v-for="preset in storageRootPresets"
                :key="preset.providerKey"
                :class="['srm-preset', { active: form.providerKey === preset.providerKey }]"
                @click="applyPreset(preset)"
              >
                <span :class="['srm-preset-icon', { 'has-image': preset.iconSrc }]">
                  <img v-if="preset.iconSrc" :src="preset.iconSrc" :alt="`${preset.name}图标`" />
                  <template v-else>{{ preset.iconText }}</template>
                </span>
                <strong>{{ preset.name }}</strong>
                <small>{{ preset.description }}</small>
              </button>
            </div>
          </section>

          <section class="srm-section srm-form">
            <label>
              <span>名称 <b>*</b></span>
              <input v-model.trim="form.rootName" maxlength="100" placeholder="例如：115 网盘" />
            </label>

            <div class="srm-form-row">
              <label>
                <span>类型 <b>*</b></span>
                <select v-model="form.providerKey">
                  <option v-for="preset in storageRootPresets" :key="preset.providerKey" :value="preset.providerKey">
                    {{ preset.name }}
                  </option>
                </select>
              </label>
              <label>
                <span>图标</span>
                <select v-model="form.iconKey">
                  <option v-for="icon in storageRootIcons" :key="icon.key" :value="icon.key">
                    {{ icon.text }} {{ icon.label }}
                  </option>
                </select>
              </label>
            </div>

            <label v-if="!editingId">
              <span>标识 <em>可选，留空自动生成</em></span>
              <input v-model.trim="form.rootKey" maxlength="64" placeholder="例如：115-main" />
              <small>创建后不可修改，只允许小写字母、数字、短横线和下划线。</small>
            </label>
            <label v-else>
              <span>标识</span>
              <input :value="editingRootKey" disabled />
            </label>

            <label>
              <span>当前挂载路径 <b>*</b></span>
              <div class="srm-path-input">
                <input v-model.trim="form.rootPath" :placeholder="currentPlaceholder" @input="checkResult = null" />
                <button class="srm-btn srm-btn-secondary" :disabled="testingPath" @click="testPath">
                  {{ testingPath ? '检测中…' : '测试路径' }}
                </button>
              </div>
              <small>填写 Smanga 服务端或 Docker 容器内可见的绝对路径，不是浏览器所在电脑的路径。</small>
            </label>

            <div v-if="checkResult" :class="['srm-test-result', checkResult.available ? 'ok' : 'error']">
              <strong>{{ checkResult.available ? '目录可访问' : '目录暂不可用' }}</strong>
              <span>{{ checkResult.message }}</span>
              <code v-if="checkResult.normalizedPath">{{ checkResult.normalizedPath }}</code>
            </div>

            <label>
              <span>说明</span>
              <textarea v-model.trim="form.description" rows="3" maxlength="4096" placeholder="可记录挂载来源、硬盘位置或用途"></textarea>
            </label>

            <label class="srm-switch-row">
              <input v-model="enabledBoolean" type="checkbox" />
              <span>启用该存储根</span>
            </label>
          </section>
        </div>

        <div class="srm-dialog-foot">
          <span v-if="formError" class="srm-form-error">{{ formError }}</span>
          <button class="srm-btn srm-btn-secondary" @click="closeDialog">取消</button>
          <button class="srm-btn srm-btn-primary" :disabled="saving" @click="save">
            {{ saving ? '保存中…' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import storageRootApi from '@/api/storage-root'
import {
  storageRootIcons,
  storageRootIconText,
  storageRootIconSource,
  storageRootPresets,
  type StorageRootPreset,
} from '@/constants/storage-root'
import type { StorageRoot, StorageRootCheckResult, StorageRootForm } from '@/type/storage-root'

const roots = ref<StorageRoot[]>([])
const loading = ref(false)
const saving = ref(false)
const testingPath = ref(false)
const checkingId = ref(0)
const dialogVisible = ref(false)
const editingId = ref(0)
const editingRootKey = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)
const keyword = ref('')
const formError = ref('')
const checkResult = ref<StorageRootCheckResult | null>(null)

const form = reactive<StorageRootForm>({
  rootKey: '',
  rootName: '115 网盘',
  providerKey: '115',
  iconKey: 'provider-115',
  rootPath: '',
  enabled: 1,
  description: '',
})

const enabledBoolean = computed({
  get: () => form.enabled === 1,
  set: (value: boolean) => { form.enabled = value ? 1 : 0 },
})

const currentPlaceholder = computed(() =>
  storageRootPresets.find((preset) => preset.providerKey === form.providerKey)?.pathPlaceholder ||
  '请输入服务器上的绝对路径'
)

function errorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

async function load() {
  loading.value = true
  try {
    const response = await storageRootApi.list(page.value, pageSize, keyword.value)
    roots.value = response.list || []
    total.value = Number(response.count) || 0
  } catch (error: any) {
    roots.value = []
    ElMessage.error(errorMessage(error, '加载存储根失败'))
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function changePage(next: number) {
  page.value = next
  load()
}

function resetForm() {
  Object.assign(form, {
    rootKey: '',
    rootName: '115 网盘',
    providerKey: '115',
    iconKey: 'provider-115',
    rootPath: '',
    enabled: 1,
    description: '',
  })
  editingId.value = 0
  editingRootKey.value = ''
  checkResult.value = null
  formError.value = ''
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(root: StorageRoot) {
  editingId.value = root.storageRootId
  editingRootKey.value = root.rootKey
  Object.assign(form, {
    rootKey: undefined,
    rootName: root.rootName,
    providerKey: root.providerKey,
    iconKey: root.iconKey,
    rootPath: root.rootPath,
    enabled: root.enabled,
    description: root.description || '',
  })
  checkResult.value = null
  formError.value = ''
  dialogVisible.value = true
}

function closeDialog() {
  if (saving.value) return
  dialogVisible.value = false
}

function applyPreset(preset: StorageRootPreset) {
  form.providerKey = preset.providerKey
  form.rootName = preset.name
  form.iconKey = preset.iconKey
  checkResult.value = null
}

function validateForm() {
  if (!form.rootName.trim()) return '请输入存储根名称'
  if (!form.rootPath.trim()) return '请输入服务器上的当前挂载路径'
  if (form.rootKey && !/^[a-z0-9][a-z0-9_-]*$/.test(form.rootKey)) {
    return '标识只能使用小写字母、数字、短横线和下划线'
  }
  return ''
}

async function testPath() {
  if (!form.rootPath.trim()) {
    formError.value = '请先填写当前挂载路径'
    return
  }
  testingPath.value = true
  formError.value = ''
  try {
    checkResult.value = await storageRootApi.checkPath(form.rootPath)
  } catch (error: any) {
    formError.value = errorMessage(error, '路径检测失败')
  } finally {
    testingPath.value = false
  }
}

async function save() {
  formError.value = validateForm()
  if (formError.value) return

  saving.value = true
  try {
    const payload: StorageRootForm = {
      rootName: form.rootName.trim(),
      providerKey: form.providerKey,
      iconKey: form.iconKey,
      rootPath: form.rootPath.trim(),
      enabled: form.enabled,
      description: form.description?.trim() || '',
      ...(!editingId.value && form.rootKey?.trim() && { rootKey: form.rootKey.trim() }),
    }
    if (editingId.value) await storageRootApi.update(editingId.value, payload)
    else await storageRootApi.create(payload)
    dialogVisible.value = false
    await load()
  } catch (error: any) {
    formError.value = errorMessage(error, '保存失败')
  } finally {
    saving.value = false
  }
}

async function checkRoot(root: StorageRoot) {
  checkingId.value = root.storageRootId
  try {
    const result = await storageRootApi.check(root.storageRootId)
    ElMessage({ message: result.message, type: result.available ? 'success' : 'warning' })
    await load()
  } catch (error: any) {
    ElMessage.error(errorMessage(error, '检测失败'))
  } finally {
    checkingId.value = 0
  }
}

async function removeRoot(root: StorageRoot) {
  if ((root.pathCount || 0) > 0) return
  try {
    await ElMessageBox.confirm(`确定删除存储根「${root.rootName}」吗？`, '删除存储根', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await storageRootApi.remove(root.storageRootId)
    await load()
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(errorMessage(error, '删除失败'))
  }
}

function providerLabel(providerKey: string) {
  return storageRootPresets.find((preset) => preset.providerKey === providerKey)?.name || '自定义'
}

function statusClass(root: StorageRoot) {
  if (!root.enabled) return 'disabled'
  return root.lastCheckStatus
}

function statusLabel(root: StorageRoot) {
  if (!root.enabled) return '已停用'
  if (root.lastCheckStatus === 'available') return '可访问'
  if (root.lastCheckStatus === 'unavailable') return '不可用'
  return '未检测'
}

onMounted(load)
</script>

<style scoped>
.srm-root { max-width: 112rem; color: #1f2937; }
.srm-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.6rem; margin-bottom: 1.4rem; }
.srm-head h1 { margin: 0 0 .5rem; font-size: 2.2rem; }
.srm-head p { margin: 0; color: #6b7280; font-size: 1.3rem; }
.srm-actions,.srm-search { display: flex; gap: .8rem; align-items: center; flex-wrap: wrap; }
.srm-search input { width: 22rem; }
.srm-btn,.srm-link { border: 0; cursor: pointer; font: inherit; }
.srm-btn { padding: .8rem 1.4rem; border-radius: .8rem; font-size: 1.3rem; }
.srm-btn-primary { background: #2563eb; color: white; }
.srm-btn-primary:hover { background: #1d4ed8; }
.srm-btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
.srm-btn-secondary:hover { background: #f9fafb; }
.srm-btn:disabled,.srm-link:disabled { opacity: .5; cursor: not-allowed; }
.srm-note { padding: 1rem 1.2rem; margin-bottom: 1.6rem; border: 1px solid #bfdbfe; border-radius: .9rem; background: #eff6ff; color: #1e40af; font-size: 1.25rem; line-height: 1.6; }
.srm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(32rem, 1fr)); gap: 1.4rem; }
.srm-card { display: flex; flex-direction: column; gap: 1.2rem; padding: 1.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 1.2rem; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.srm-card-top { display: flex; gap: 1.1rem; align-items: center; }
.srm-icon { display: flex; align-items: center; justify-content: center; width: 4.8rem; height: 4.8rem; flex: 0 0 4.8rem; border-radius: 1rem; background: #eff6ff; color: #2563eb; font-weight: 800; font-size: 1.4rem; }
.srm-icon.has-image { background: transparent; }
.srm-icon img { display: block; width: 100%; height: 100%; object-fit: contain; border-radius: 1rem; }
.srm-icon-115 { background: #fff1f2; color: #e11d48; }
.srm-card-title { min-width: 0; flex: 1; }
.srm-name-row { display: flex; align-items: center; gap: .8rem; }
.srm-card h2 { margin: 0; font-size: 1.55rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.srm-card code { display: block; margin-top: .35rem; color: #9ca3af; font-size: 1.1rem; }
.srm-status { padding: .25rem .65rem; border-radius: 999px; font-size: 1.05rem; white-space: nowrap; }
.srm-status.available { background: #dcfce7; color: #166534; }
.srm-status.unavailable { background: #fee2e2; color: #991b1b; }
.srm-status.unknown,.srm-status.disabled { background: #f3f4f6; color: #6b7280; }
.srm-details { display: grid; gap: .65rem; margin: 0; }
.srm-details div { display: grid; grid-template-columns: 7rem minmax(0,1fr); gap: .8rem; font-size: 1.2rem; }
.srm-details dt { color: #9ca3af; }
.srm-details dd { margin: 0; color: #374151; }
.srm-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.srm-description,.srm-check-message { margin: 0; font-size: 1.15rem; line-height: 1.5; color: #6b7280; }
.srm-check-message { padding: .7rem .9rem; background: #f9fafb; border-radius: .6rem; }
.srm-card-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: auto; padding-top: .9rem; border-top: 1px solid #f3f4f6; }
.srm-link { background: none; color: #2563eb; font-size: 1.2rem; }
.srm-link-danger { color: #dc2626; }
.srm-empty { display: flex; flex-direction: column; align-items: center; gap: .8rem; padding: 5rem 2rem; border: 1px dashed #d1d5db; border-radius: 1.2rem; background: white; color: #6b7280; }
.srm-empty-icon { font-size: 3rem; }
.srm-pager { display: flex; justify-content: center; align-items: center; gap: 1.2rem; margin-top: 1.8rem; color: #6b7280; font-size: 1.2rem; }
.srm-pager button { padding: .6rem 1rem; border: 1px solid #d1d5db; border-radius: .7rem; background: white; cursor: pointer; }
.srm-pager button:disabled { opacity: .4; cursor: not-allowed; }
.srm-overlay { position: fixed; inset: 0; z-index: 3000; display: flex; justify-content: center; align-items: center; padding: 2rem; background: rgba(15,23,42,.55); }
.srm-dialog { width: min(78rem, 96vw); max-height: 92vh; overflow: hidden; display: flex; flex-direction: column; border-radius: 1.4rem; background: white; box-shadow: 0 24px 80px rgba(0,0,0,.2); }
.srm-dialog-head { display: flex; justify-content: space-between; gap: 1rem; padding: 1.6rem 2rem; border-bottom: 1px solid #e5e7eb; }
.srm-dialog-head h2 { margin: 0 0 .35rem; font-size: 1.7rem; }
.srm-dialog-head p { margin: 0; color: #6b7280; font-size: 1.15rem; }
.srm-close { width: 3rem; height: 3rem; border: 0; border-radius: .6rem; background: transparent; color: #9ca3af; font-size: 2.2rem; cursor: pointer; }
.srm-close:hover { background: #f3f4f6; }
.srm-dialog-body { overflow-y: auto; padding: 1.8rem 2rem; }
.srm-section + .srm-section { margin-top: 1.8rem; }
.srm-section-title { margin-bottom: .8rem; font-weight: 700; font-size: 1.25rem; }
.srm-presets { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: .8rem; }
.srm-preset { display: grid; grid-template-columns: 3.2rem 1fr; grid-template-rows: auto auto; column-gap: .8rem; text-align: left; padding: 1rem; border: 1px solid #e5e7eb; border-radius: .9rem; background: white; cursor: pointer; }
.srm-preset:hover,.srm-preset.active { border-color: #2563eb; background: #eff6ff; }
.srm-preset-icon { grid-row: 1 / 3; display: flex; justify-content: center; align-items: center; color: #2563eb; font-weight: 800; font-size: 1.2rem; }
.srm-preset-icon.has-image { align-self: center; width: 3.2rem; height: 3.2rem; }
.srm-preset-icon img { display: block; width: 100%; height: 100%; object-fit: contain; border-radius: .7rem; }
.srm-preset strong { font-size: 1.2rem; }
.srm-preset small { margin-top: .2rem; color: #6b7280; font-size: 1rem; line-height: 1.35; }
.srm-form { display: grid; gap: 1.2rem; }
.srm-form label { display: flex; flex-direction: column; gap: .45rem; }
.srm-form label > span { font-size: 1.2rem; font-weight: 600; color: #374151; }
.srm-form b { color: #dc2626; }
.srm-form em { color: #9ca3af; font-weight: 400; font-style: normal; }
.srm-form input,.srm-form select,.srm-form textarea,.srm-search input { box-sizing: border-box; padding: .8rem 1rem; border: 1px solid #d1d5db; border-radius: .75rem; background: white; color: #111827; font: inherit; font-size: 1.2rem; outline: none; }
.srm-form input:focus,.srm-form select:focus,.srm-form textarea:focus,.srm-search input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
.srm-form input:disabled { background: #f3f4f6; color: #6b7280; }
.srm-form small { color: #6b7280; font-size: 1.05rem; line-height: 1.45; }
.srm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.srm-path-input { display: flex; gap: .7rem; }
.srm-path-input input { flex: 1; min-width: 0; }
.srm-switch-row { flex-direction: row !important; align-items: center; }
.srm-switch-row input { width: 1.6rem; height: 1.6rem; }
.srm-test-result { display: flex; flex-direction: column; gap: .25rem; padding: .9rem 1rem; border-radius: .8rem; font-size: 1.1rem; }
.srm-test-result.ok { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.srm-test-result.error { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
.srm-test-result code { overflow-wrap: anywhere; }
.srm-dialog-foot { display: flex; justify-content: flex-end; align-items: center; gap: .8rem; padding: 1.2rem 2rem; border-top: 1px solid #e5e7eb; }
.srm-form-error { margin-right: auto; color: #dc2626; font-size: 1.15rem; }
@media (max-width: 720px) {
  .srm-head { flex-direction: column; }
  .srm-actions,.srm-search { width: 100%; }
  .srm-search input { width: auto; flex: 1; min-width: 10rem; }
  .srm-grid { grid-template-columns: 1fr; }
  .srm-overlay { padding: .8rem; align-items: flex-end; }
  .srm-dialog { max-height: 95vh; border-radius: 1.2rem 1.2rem 0 0; }
  .srm-dialog-body { padding: 1.2rem; }
  .srm-presets { grid-template-columns: 1fr 1fr; }
  .srm-form-row { grid-template-columns: 1fr; }
  .srm-path-input { flex-direction: column; }
  .srm-dialog-foot { flex-wrap: wrap; padding: 1rem 1.2rem; }
  .srm-form-error { width: 100%; }
}
</style>
