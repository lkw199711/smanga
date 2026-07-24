<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>用户管理</h1>
      <div class="ta-page-actions">
        <button class="ta-btn-ghost" @click="reload">🔄 刷新</button>
        <button class="ta-btn-primary" @click="openAdd">+ 添加用户</button>
        <button class="ta-btn-danger" :disabled="selected.length === 0" @click="batchDelete">🗑 批量删除</button>
      </div>
    </div>

    <ResponsiveTable
      :columns="columns"
      :items="list"
      row-key="userId"
      :total="total"
      v-model:page="page"
      :page-size="pageSize"
      selectable
      v-model:selected="selected"
      empty-text="暂无用户数据"
    >
      <template #cell-role="{ value }">
        <span :class="['ta-badge', value === 'admin' ? 'ta-badge-admin' : 'ta-badge-user']">
          {{ value === 'admin' ? '管理员' : '用户' }}
        </span>
      </template>
      <template #actions="{ item }">
        <button class="ta-btn-sm" @click="openEdit(item)">✏️ 编辑</button>
        <button class="ta-btn-sm ta-btn-sm-danger" @click="doDelete(item)">🗑 删除</button>
      </template>
    </ResponsiveTable>

    <!-- 添加/编辑弹窗 -->
    <div v-if="dialogShow" class="ta-dialog-overlay" @click.self="dialogShow = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head">
          <h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
          <button class="ta-dialog-close" @click="dialogShow = false">×</button>
        </div>
        <div class="ta-dialog-body">
          <label class="ta-field">
            <span>用户名</span>
            <input v-model="form.userName" placeholder="请输入用户名" />
          </label>
          <label class="ta-field">
            <span>密码{{ editingUser ? ' (留空不修改)' : '' }}</span>
            <input v-model="form.passWord" type="password" placeholder="请输入密码" />
          </label>
          <label class="ta-field ta-field-switch">
            <span>管理员</span>
            <label class="ta-switch">
              <input type="checkbox" :true-value="'admin'" :false-value="'user'" v-model="form.role" />
              <span class="ta-switch-slider"></span>
            </label>
          </label>
          <label class="ta-field ta-field-switch">
            <span>全媒体库权限</span>
            <label class="ta-switch">
              <input type="checkbox" :true-value="'all'" :false-value="'limit'" v-model="form.mediaPermit" />
              <span class="ta-switch-slider"></span>
            </label>
          </label>

          <div v-if="form.mediaPermit !== 'all'" class="ta-field-group">
            <p class="ta-field-title">媒体库权限</p>
            <label v-for="m in medias" :key="m.mediaId" class="ta-checkbox">
              <input type="checkbox" v-model="m.permit" />
              <span>{{ m.mediaName }}</span>
            </label>
            <p v-if="medias.length === 0" class="ta-empty">暂无媒体库</p>
          </div>

          <div class="ta-form-note">
            <p>• 用户名: 2-20位，字母开头，可含字母数字下划线</p>
            <p>• 密码: 不能为空</p>
            <p>• 管理员: 开放管理功能</p>
            <p>• 全媒体库: 可浏览全部媒体库</p>
          </div>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="doSave" :disabled="saving">{{ saving ? '保存中...' : '确认' }}</button>
          <button class="ta-btn-ghost" @click="dialogShow = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import userApi from '@/api/account'
import mediaApi from '@/api/media'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const columns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'userId', label: 'ID' },
  { key: 'userName', label: '用户名' },
  { key: 'role', label: '角色', type: 'badge' },
  { key: 'createTime', label: '注册时间', hideOnMobile: true },
]

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selected = ref<number[]>([])
const dialogShow = ref(false)
const editingUser = ref<any>(null)
const saving = ref(false)
const medias = ref<any[]>([])

const form = ref({
  userId: 0,
  userName: '',
  passWord: '',
  role: 'admin',
  mediaPermit: 'all' as string,
})

async function load() {
  try {
    const res = await userApi.get_account(page.value, pageSize.value)
    total.value = Number(res.count) || 0
    list.value = res.list || []
    selected.value = []
  } catch { list.value = [] }
}

async function loadMedias() {
  try {
    const res = await mediaApi.get(1, 10000)
    medias.value = (res.list || []).map((m: any) => ({ ...m, permit: false }))
  } catch { medias.value = [] }
}

function reload() {
  page.value = 1
  load()
}

// 翻页时自动加载
watch(page, () => load())

function openAdd() {
  editingUser.value = null
  form.value = { userId: 0, userName: '', passWord: '', role: 'admin', mediaPermit: 'all' }
  medias.value.forEach((m) => (m.permit = false))
  dialogShow.value = true
}

function openEdit(row: any) {
  editingUser.value = row
  form.value = {
    userId: row.userId,
    userName: row.userName,
    passWord: '',
    role: row.role || 'user',
    mediaPermit: row.mediaPermit || 'all',
  }
  medias.value.forEach((m: any) => {
    m.permit = row.mediaPermissons?.includes(m.mediaId) || false
  })
  dialogShow.value = true
}

async function doSave() {
  if (!/^[a-zA-Z]\w{1,19}$/.test(form.value.userName)) {
    alert('用户名格式不正确：2-20位，字母开头')
    return
  }
  if (!editingUser.value && !form.value.passWord) {
    alert('密码不能为空')
    return
  }
  saving.value = true
  try {
    const data = { ...form.value, mediaLimit: medias.value }
    if (editingUser.value) {
      await userApi.update_account(form.value.userId, data)
    } else {
      await userApi.register(data)
    }
    dialogShow.value = false
    reload()
  } catch (e: any) {
    alert(e?.message || '操作失败')
  } finally {
    saving.value = false
  }
}

async function doDelete(row: any) {
  if (!confirm(`确定删除用户「${row.userName}」吗？`)) return
  try {
    await userApi.delete_account(row.userId)
    reload()
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}

async function batchDelete() {
  if (selected.value.length === 0) return
  if (!confirm(`确定删除选中的 ${selected.value.length} 个用户吗？`)) return
  for (const id of selected.value) {
    try { await userApi.delete_account(id) } catch { /* skip */ }
  }
  reload()
}

onMounted(() => {
  loadMedias()
  load()
})
</script>

<style scoped>
.ta-manage-page { max-width: 1100px; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* 按钮 */
.ta-btn-primary, .ta-btn-ghost, .ta-btn-danger, .ta-btn-sm, .ta-btn-sm-danger { cursor: pointer; font-size: 13px; border-radius: 8px; }
.ta-btn-primary { padding: 8px 16px; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.ta-btn-ghost { padding: 8px 16px; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-danger { padding: 8px 16px; color: #fff; background: #ef4444; border: none; font-weight: 500; }
.ta-btn-danger:hover { background: #dc2626; }
.ta-btn-danger:disabled { opacity: .5; cursor: not-allowed; }
.ta-btn-sm { padding: 5px 10px; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 12px; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }

/* Badge */
.ta-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; white-space: nowrap; }
.ta-badge-admin { background: #fef3c7; color: #92400e; }
.ta-badge-user { background: #e0e7ff; color: #3730a3; }

/* Dialog */
.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 14px; width: 480px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
.ta-dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 20px; cursor: pointer; color: #9ca3af; border-radius: 6px; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #eaeaea; }

.ta-field { display: flex; flex-direction: column; gap: 6px; }
.ta-field span { font-size: 13px; font-weight: 500; color: #374151; }
.ta-field input { padding: 8px 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 13px; outline: none; }
.ta-field input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,.12); }
.ta-field-switch { flex-direction: row; align-items: center; justify-content: space-between; }

.ta-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.ta-switch input { display: none; }
.ta-switch-slider { position: absolute; inset: 0; border-radius: 12px; background: #d1d5db; cursor: pointer; transition: .2s; }
.ta-switch-slider::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: .2s; }
.ta-switch input:checked + .ta-switch-slider { background: #2563eb; }
.ta-switch input:checked + .ta-switch-slider::after { transform: translateX(20px); }

.ta-field-group { display: flex; flex-direction: column; gap: 8px; }
.ta-field-title { font-size: 13px; font-weight: 600; color: #374151; margin: 0; }
.ta-checkbox { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #4b5563; cursor: pointer; }
.ta-form-note { font-size: 12px; color: #9ca3af; line-height: 1.6; }
.ta-form-note p { margin: 2px 0; }

/* 移动端适配 */
@media (max-width: 768px) {
  .ta-page-head { flex-direction: column; align-items: flex-start; }
  .ta-page-actions { width: 100%; justify-content: flex-start; }
}
</style>
