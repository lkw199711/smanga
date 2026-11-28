<template>
  <div class="dmt-root">
    <header class="dmt-head">
      <div>
        <p class="dmt-eyebrow">系统工具</p>
        <h1>漫画迁移</h1>
        <p>把源目录中尚不存在的文件复制到目标目录，适合将漫画增量同步到已挂载的网盘。</p>
      </div>
      <button class="dmt-link" @click="router.push(taskRoute)">查看任务队列</button>
    </header>

    <section class="dmt-card">
      <div class="dmt-note">
        这里填写的是 Smanga 服务端或 Docker 容器内可见的目录，不是当前浏览器所在电脑的目录。
      </div>

      <div class="dmt-field">
        <label for="migration-source">源目录</label>
        <div class="dmt-path-row">
          <input
            id="migration-source"
            v-model.trim="form.sourcePath"
            :disabled="busy"
            placeholder="例如 /data/manga 或 D:\manga"
            @input="clearCheck"
          />
          <select :value="''" :disabled="busy" @change="selectRoot('sourcePath', $event)">
            <option value="">从存储根选择…</option>
            <option v-for="root in storageRoots" :key="`source-${root.storageRootId}`" :value="root.rootPath">
              {{ root.rootName }} · {{ root.rootPath }}
            </option>
          </select>
        </div>
        <small>每个目录分别入队，复制本层的文件。已有同名目标文件会跳过。</small>
      </div>

      <div class="dmt-arrow">↓</div>

      <div class="dmt-field">
        <label for="migration-target">目标目录</label>
        <div class="dmt-path-row">
          <input
            id="migration-target"
            v-model.trim="form.targetPath"
            :disabled="busy"
            placeholder="例如 /mnt/cloud/manga 或 Z:\manga"
            @input="clearCheck"
          />
          <select :value="''" :disabled="busy" @change="selectRoot('targetPath', $event)">
            <option value="">从存储根选择…</option>
            <option v-for="root in storageRoots" :key="`target-${root.storageRootId}`" :value="root.rootPath">
              {{ root.rootName }} · {{ root.rootPath }}
            </option>
          </select>
        </div>
        <small>目标目录必须已存在并可读写。文件复制完整后，才会以正式文件名出现。</small>
        <div v-if="targetResult" role="status" :class="['dmt-target-status', { 'dmt-error': !targetResult.ok }]">
          {{ targetResult.message }}
        </div>
      </div>

      <label class="dmt-mirror">
        <input v-model="form.mirrorDelete" :disabled="busy" type="checkbox" @change="clearCheck" />
        <span>
          <strong>镜像同步：删除目标目录中的多余内容</strong>
          <small>勾选后，源目录中不存在的文件和目录将从目标目录永久删除。复制完整成功后才会开始删除。</small>
        </span>
      </label>

      <label class="dmt-mirror">
        <input v-model="form.deleteSource" :disabled="busy" type="checkbox" @change="clearCheck" />
        <span>
          <strong>迁移后删除源文件</strong>
          <small>复制完成后，逐个核对目标副本。只删除内容一致的源文件，保留源目录结构。</small>
        </span>
      </label>

      <div v-if="checkResult" :class="['dmt-check', checkResult.available ? 'ok' : 'error']">
        <strong>{{ checkResult.available ? '目录检测通过' : '目录检测未通过' }}</strong>
        <span>{{ checkResult.message }}</span>
        <div class="dmt-check-grid">
          <span>源目录：{{ checkResult.source.message }}</span>
          <span>目标目录：{{ checkResult.target.message }}</span>
        </div>
      </div>
      <div v-if="formError" class="dmt-error">{{ formError }}</div>

      <footer class="dmt-actions">
        <button
          type="button"
          class="dmt-btn dmt-btn-secondary"
          :disabled="busy || !form.targetPath"
          @click="createTarget"
        >
          {{ creatingTarget ? '创建中…' : '创建目标目录' }}
        </button>
        <button class="dmt-btn dmt-btn-secondary" :disabled="busy" @click="checkPaths">
          {{ checking ? '检测中…' : '检测目录' }}
        </button>
        <button class="dmt-btn dmt-btn-primary" :disabled="busy" @click="submit">
          {{ submitting ? '正在添加…' : '添加迁移任务' }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import systemToolsApi, { type DirectoryMigrationCheck } from '@/api/system-tools'
import storageRootApi from '@/api/storage-root'
import type { StorageRoot } from '@/type/storage-root'
import { themeState } from '@/themes/store'

const router = useRouter()
const storageRoots = ref<StorageRoot[]>([])
const checking = ref(false)
const submitting = ref(false)
const creatingTarget = ref(false)
const busy = computed(() => checking.value || submitting.value || creatingTarget.value)
const formError = ref('')
const checkResult = ref<DirectoryMigrationCheck | null>(null)
const targetResult = ref<{ ok: boolean; message: string } | null>(null)
const form = reactive({ sourcePath: '', targetPath: '', mirrorDelete: false, deleteSource: false })
const taskRoute = computed(() => themeState.current === 'Legacy' ? '/jobs-setting' : '/t/manage/jobs')

watch(() => form.targetPath, () => { targetResult.value = null })

function errorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

function validate() {
  if (!form.sourcePath) return '请选择或填写源目录'
  if (!form.targetPath) return '请选择或填写目标目录'
  return ''
}

function clearCheck() {
  checkResult.value = null
  formError.value = ''
}

function selectRoot(field: 'sourcePath' | 'targetPath', event: Event) {
  const select = event.target as HTMLSelectElement
  if (select.value) form[field] = select.value
  select.value = ''
  clearCheck()
}

async function checkPaths() {
  if (busy.value) return
  formError.value = validate()
  if (formError.value) return false
  checking.value = true
  try {
    checkResult.value = await systemToolsApi.checkDirectoryMigration({ ...form })
    return checkResult.value.available
  } catch (error: any) {
    formError.value = errorMessage(error, '目录检测失败')
    return false
  } finally {
    checking.value = false
  }
}

async function createTarget() {
  if (busy.value || !form.targetPath) return
  clearCheck()
  targetResult.value = null
  creatingTarget.value = true
  try {
    const result = await systemToolsApi.createDirectoryMigrationTarget(form.targetPath)
    targetResult.value = { ok: result.available, message: result.message }
  } catch (error: any) {
    targetResult.value = { ok: false, message: errorMessage(error, '创建目标目录失败') }
  } finally {
    creatingTarget.value = false
  }
}

async function submit() {
  if (busy.value) return
  formError.value = validate()
  if (formError.value) return

  const input = { ...form }
  const deletionDetails = []
  if (input.mirrorDelete) deletionDetails.push(`将永久删除目标目录（${input.targetPath}）中源目录没有的内容。`)
  if (input.deleteSource) deletionDetails.push(`将永久删除源目录（${input.sourcePath}）中已确认目标副本一致的文件。`)

  submitting.value = true
  try {
    if (deletionDetails.length) {
      try {
        await ElMessageBox.confirm(deletionDetails.join('\n'), '确认迁移删除选项', {
          type: 'warning',
          confirmButtonText: '确认并添加',
          cancelButtonText: '取消',
        })
      } catch {
        return
      }
    }
    const result = await systemToolsApi.createDirectoryMigration(input)
    checkResult.value = result.check
    ElMessage.success(`迁移任务已加入队列（任务 ${result.jobId}）`)
  } catch (error: any) {
    const serverCheck = error?.response?.data?.data
    if (serverCheck) checkResult.value = serverCheck
    formError.value = errorMessage(error, '添加迁移任务失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const response = await storageRootApi.list(1, 100)
    storageRoots.value = (response.list || []).filter((root) => root.enabled)
  } catch {
    storageRoots.value = []
  }
})
</script>

<style scoped>
.dmt-root { max-width: 92rem; color: #1f2937; }
.dmt-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; margin-bottom: 1.8rem; }
.dmt-eyebrow { margin: 0 0 .35rem !important; color: #2563eb !important; font-size: 1.1rem !important; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.dmt-head h1 { margin: 0 0 .55rem; font-size: 2.2rem; }
.dmt-head p { margin: 0; color: #6b7280; font-size: 1.25rem; line-height: 1.6; }
.dmt-link { flex: 0 0 auto; padding: .75rem 1.2rem; border: 1px solid #dbeafe; border-radius: .8rem; background: #eff6ff; color: #2563eb; cursor: pointer; font: inherit; }
.dmt-card { padding: 2rem; border: 1px solid #e5e7eb; border-radius: 1.3rem; background: white; box-shadow: 0 1px 4px rgba(15,23,42,.05); }
.dmt-note { margin-bottom: 1.8rem; padding: 1rem 1.2rem; border: 1px solid #bfdbfe; border-radius: .8rem; background: #eff6ff; color: #1e40af; font-size: 1.15rem; line-height: 1.55; }
.dmt-field { display: grid; gap: .55rem; }
.dmt-field label { font-size: 1.3rem; font-weight: 700; }
.dmt-field small,.dmt-mirror small { color: #6b7280; font-size: 1.05rem; line-height: 1.5; }
.dmt-path-row { display: grid; grid-template-columns: minmax(0, 1fr) 23rem; gap: .8rem; }
.dmt-path-row input,.dmt-path-row select { min-width: 0; box-sizing: border-box; padding: .9rem 1rem; border: 1px solid #d1d5db; border-radius: .8rem; background: white; color: #111827; font: inherit; font-size: 1.2rem; outline: none; }
.dmt-path-row input:focus,.dmt-path-row select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
.dmt-arrow { margin: 1rem 0; color: #9ca3af; font-size: 2rem; text-align: center; }
.dmt-mirror { display: flex; gap: 1rem; align-items: flex-start; margin-top: 2rem; padding: 1.2rem; border: 1px solid #fed7aa; border-radius: .9rem; background: #fff7ed; cursor: pointer; }
.dmt-mirror input { width: 1.7rem; height: 1.7rem; flex: 0 0 auto; margin-top: .1rem; }
.dmt-mirror span { display: grid; gap: .3rem; }
.dmt-mirror strong { color: #9a3412; font-size: 1.2rem; }
.dmt-check { display: grid; gap: .35rem; margin-top: 1.5rem; padding: 1rem 1.2rem; border-radius: .8rem; font-size: 1.1rem; }
.dmt-check.ok { border: 1px solid #bbf7d0; background: #f0fdf4; color: #166534; }
.dmt-check.error { border: 1px solid #fecaca; background: #fef2f2; color: #991b1b; }
.dmt-check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin-top: .3rem; }
.dmt-error { margin-top: 1rem; color: #dc2626; font-size: 1.15rem; }
.dmt-target-status { margin: 0; font-size: 1.15rem; }
.dmt-target-status:not(.dmt-error) { color: #166534; }
.dmt-actions { display: flex; justify-content: flex-end; gap: .8rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f3f4f6; }
.dmt-btn { padding: .85rem 1.5rem; border-radius: .8rem; cursor: pointer; font: inherit; font-size: 1.25rem; }
.dmt-btn:disabled { opacity: .55; cursor: not-allowed; }
.dmt-btn-secondary { border: 1px solid #d1d5db; background: white; color: #374151; }
.dmt-btn-primary { border: 1px solid #2563eb; background: #2563eb; color: white; }
@media (max-width: 720px) {
  .dmt-head { flex-direction: column; }
  .dmt-card { padding: 1.3rem; }
  .dmt-path-row,.dmt-check-grid { grid-template-columns: 1fr; }
  .dmt-actions { flex-direction: column-reverse; }
  .dmt-btn { width: 100%; }
}
</style>
