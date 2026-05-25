<template>
  <div class="ta-init">
    <div class="ta-init-card">
      <div class="ta-init-logo">
        <div class="ta-logo-mark">S</div>
        <div class="ta-logo-text">smanga</div>
      </div>
      <h2>系统初始化</h2>

      <div v-if="loading" class="ta-loading">
        <div class="ta-spinner-dark"></div>
        <p>正在读取配置...</p>
      </div>

      <template v-else>

      <!-- 数据库类型选择 -->
      <div class="ta-db-tabs">
        <button
          v-for="db in dbTypes"
          :key="db.key"
          :class="['ta-db-tab', { active: form.client === db.key }]"
          @click="form.client = db.key"
        >
          {{ db.label }}
        </button>
      </div>

      <!-- 数据库连接表单 (SQLite 隐藏) -->
      <div v-if="form.client !== 'sqlite'" class="ta-db-form">
        <div class="ta-form-group">
          <label>主机</label>
          <input v-model="form.host" type="text" placeholder="127.0.0.1" />
        </div>
        <div class="ta-form-group">
          <label>端口</label>
          <input
            v-model.number="form.port"
            type="number"
            :placeholder="form.client === 'pgsql' ? '5432' : '3306'"
          />
        </div>
        <div class="ta-form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="数据库用户名" />
        </div>
        <div class="ta-form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="数据库密码" />
        </div>
        <div class="ta-form-group">
          <label>数据库名</label>
          <input v-model="form.database" type="text" placeholder="smanga" />
        </div>
      </div>
      <p v-else class="ta-db-hint">
        SQLite 无需额外配置，数据将保存在本地文件中。
      </p>

      <!-- 测试连接按钮 (非 SQLite 显示) -->
      <div v-if="form.client !== 'sqlite'" class="ta-test-btn-wrap">
        <button
          class="ta-test-btn"
          :disabled="testing"
          @click="testConnection"
        >
          <span v-if="testing" class="ta-spinner"></span>
          {{ testing ? '测试中...' : '测试数据库连接' }}
        </button>
        <p v-if="testResult" :class="['ta-test-result', testResult.success ? 'ta-test-ok' : 'ta-test-fail']">
          {{ testResult.message }}
        </p>
      </div>

      <!-- 管理员账户 -->
      <div class="ta-section-title">管理员账户</div>
      <div class="ta-form-group">
        <label>用户名</label>
        <input v-model="form.adminUser" type="text" placeholder="请输入管理员用户名" />
      </div>
      <div class="ta-form-group">
        <label>密码</label>
        <input v-model="form.adminPass" type="password" placeholder="请输入管理员密码" />
      </div>
      <div class="ta-form-group">
        <label>确认密码</label>
        <input
          v-model="confirmPass"
          type="password"
          placeholder="请再次输入密码"
        />
      </div>

      <button
        class="ta-btn-submit"
        :disabled="submitting || success"
        @click="doInit"
      >
        <span v-if="submitting" class="ta-spinner"></span>
        {{ submitting ? '正在初始化...' : '开始初始化' }}
      </button>

      <p v-if="error" class="ta-error">{{ error }}</p>

      <!-- 成功状态 -->
      <div v-if="success" class="ta-success">
        <div class="ta-success-icon">✓</div>
        <p>初始化完成！服务即将重启...</p>
        <p class="ta-countdown">{{ countdown }} 秒后自动刷新</p>
      </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { ajax } from '@/api/index'

const dbTypes = [
  { key: 'sqlite', label: 'SQLite' },
  { key: 'mysql', label: 'MySQL' },
  { key: 'pgsql', label: 'PostgreSQL' },
]

const form = reactive({
  client: 'sqlite' as string,
  host: '127.0.0.1',
  port: 3306,
  username: '',
  password: '',
  database: 'smanga',
  adminUser: '',
  adminPass: '',
})

const confirmPass = ref('')
const submitting = ref(false)
const success = ref(false)
const loading = ref(true)
const error = ref('')
const countdown = ref(5)
let timer: ReturnType<typeof setInterval> | null = null

// 页面加载时读取 smanga.json 中已配置的数据库信息并预填
onMounted(async () => {
  try {
    const res = await ajax.get('/deploy/status')
    const sql = res.data?.data?.sql
    if (sql) {
      // client 字段映射：所有 PostgreSQL 别名统一为 pgsql
      const clientMap: Record<string, string> = { postgresql: 'pgsql', postgres: 'pgsql', postgressql: 'pgsql' }
      form.client = clientMap[sql.client] || sql.client || 'sqlite'
      if (sql.host) form.host = sql.host
      if (sql.port) form.port = sql.port
      if (sql.username) form.username = sql.username
      if (sql.password) form.password = sql.password
      if (sql.database) form.database = sql.database
    }
  } catch {
    // 读取失败使用默认值
  } finally {
    loading.value = false
  }
})

// 测试数据库连接
const testing = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

async function testConnection() {
  testing.value = true
  testResult.value = null
  try {
    const res = await ajax({
      timeout: 15000,
      url: '/deploy/test-connection',
      method: 'POST',
      data: {
        client: form.client,
        host: form.host,
        port: form.port,
        username: form.username,
        password: form.password,
        database: form.database,
      },
    })
    testResult.value = {
      success: true,
      message: (res.data as any)?.message || '连接成功',
    }
  } catch (e: any) {
    testResult.value = {
      success: false,
      message: e?.response?.data?.message || e?.message || '连接失败',
    }
  } finally {
    testing.value = false
  }
}

// 切换数据库类型时重置端口
watch(
  () => form.client,
  (val) => {
    if (val === 'pgsql') {
      form.port = 5432
    } else if (val === 'mysql') {
      form.port = 3306
    }
  }
)

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function doInit() {
  error.value = ''

  // 前端校验
  if (!form.client) {
    error.value = '请选择数据库类型'
    return
  }
  if (form.client !== 'sqlite') {
    if (!form.host) { error.value = '请填写主机地址'; return }
    if (!form.port) { error.value = '请填写端口'; return }
    if (!form.username) { error.value = '请填写数据库用户名'; return }
    if (!form.database) { error.value = '请填写数据库名'; return }
  }
  if (!form.adminUser) { error.value = '请填写管理员用户名'; return }
  if (!form.adminPass) { error.value = '请填写管理员密码'; return }
  if (form.adminPass !== confirmPass.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  submitting.value = true

  try {
    const payload: Record<string, any> = {
      client: form.client,
      adminUser: form.adminUser,
      adminPass: form.adminPass,
    }
    if (form.client !== 'sqlite') {
      payload.host = form.host
      payload.port = form.port
      payload.username = form.username
      payload.password = form.password
      payload.database = form.database
    }

    const res = await ajax({
      timeout: 3 * 60 * 1000,
      url: 'deploy/init',
      method: 'POST',
      data: payload,
    })

    if (res.data?.code === 200) {
      success.value = true
      startCountdown()
    } else {
      error.value = res.data?.message || '初始化失败'
    }
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      '初始化请求失败，请检查网络连接'
    error.value = msg
  } finally {
    submitting.value = false
  }
}

function startCountdown() {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (timer) clearInterval(timer)
      window.location.reload()
    }
  }, 1000)
}
</script>

<style scoped>
.ta-init {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #fafafa;
  padding: 24px 16px;
  box-sizing: border-box;
}

.ta-init-card {
  width: 440px;
  max-width: 100%;
  padding: 40px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.ta-init-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.ta-logo-mark {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #171717;
  color: #fff;
  font-weight: 700;
  border-radius: 8px;
}

.ta-logo-text {
  font-size: 18px;
  font-weight: 700;
}

.ta-init-card h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px;
}

.ta-db-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.ta-db-tab {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.ta-db-tab:hover {
  color: #374151;
  background: #e5e7eb;
}

.ta-db-tab.active {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
}

.ta-db-form {
  margin-bottom: 8px;
}

.ta-db-hint {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 16px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  text-align: center;
}

.ta-test-btn-wrap {
  margin-bottom: 16px;
}

.ta-test-btn {
  width: 100%;
  padding: 10px 0;
  font-size: 13px;
  font-weight: 500;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ta-test-btn:hover:not(:disabled) {
  background: #dbeafe;
}

.ta-test-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ta-test-result {
  font-size: 13px;
  margin: 8px 0 0;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
}

.ta-test-ok {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.ta-test-fail {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.ta-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 20px 0 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.ta-form-group {
  margin-bottom: 14px;
}

.ta-form-group label {
  display: block;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 6px;
}

.ta-form-group input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.ta-form-group input:focus {
  border-color: #2563eb;
}

.ta-btn-submit {
  width: 100%;
  padding: 11px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
}

.ta-btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.ta-btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ta-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ta-spin 0.6s linear infinite;
}

@keyframes ta-spin {
  to {
    transform: rotate(360deg);
  }
}

.ta-error {
  margin-top: 12px;
  font-size: 13px;
  color: #ef4444;
  text-align: center;
}

.ta-success {
  margin-top: 24px;
  text-align: center;
}

.ta-success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 24px;
  color: #fff;
  background: #22c55e;
  border-radius: 50%;
  margin-bottom: 12px;
}

.ta-success p {
  font-size: 14px;
  color: #374151;
  margin: 4px 0;
}

.ta-countdown {
  font-size: 13px;
  color: #9ca3af;
}

.ta-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 12px;
}

.ta-loading p {
  font-size: 13px;
  color: #9ca3af;
}

.ta-spinner-dark {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: ta-spin 0.6s linear infinite;
}

@keyframes ta-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
