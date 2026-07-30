<template>
  <div :class="['setting-page', `setting-page--${themeState.current.toLowerCase()}`]">
    <div class="setting-page-head">
      <div class="setting-page-head-title">
        <h1>用户设置</h1>
        <p class="setting-page-head-sub">个性化你的阅读体验</p>
      </div>
      <div class="setting-page-head-actions">
        <transition name="setting-toast-fade">
          <span
            v-if="saveHint"
            class="setting-save-hint"
            :class="`setting-save-hint--${saveHintType}`"
          >
            {{ saveHint }}
          </span>
        </transition>
        <button
          class="setting-btn-primary setting-btn-save"
          :disabled="saving"
          @click="saveAll"
        >
          <span v-if="saving" class="setting-btn-spinner"></span>
          <span>{{ saving ? '保存中…' : '保存所有设置' }}</span>
        </button>
      </div>
    </div>
    
    <div class="setting-groups">
      <!-- 账户信息 -->
      <div class="setting-card">
        <h3>账户信息</h3>
        <div class="setting-row">
          <span class="setting-label">用户名</span>
          <span class="setting-value">{{ userInfo.userName }}</span>
        </div>
        <div class="setting-row">
          <span class="setting-label">用户ID</span>
          <span class="setting-value">{{ userInfo.userId }}</span>
        </div>
        <div class="setting-row">
          <span class="setting-label">用户头像</span>
          <div class="setting-avatar-container">
            <div
              class="setting-avatar"
              :class="{ 'setting-avatar-uploading': uploadingAvatar }"
              @click="triggerAvatarUpload"
              :title="'点击更换头像'"
            >
              <img
                v-if="avatarBlobUrl"
                :src="avatarBlobUrl"
                class="setting-avatar-img"
              />
              <span v-else class="setting-avatar-text">{{ userInfo.userName?.charAt(0) || 'U' }}</span>
              <div class="setting-avatar-overlay">
                <span v-if="uploadingAvatar">⏳</span>
                <span v-else>📷</span>
              </div>
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/*"
              class="setting-avatar-input-hidden"
              @change="handleAvatarUpload"
            />
          </div>
        </div>
      </div>

      <!-- 界面设置 -->
      <div class="setting-card">
        <h3>界面设置</h3>
        <div class="setting-row">
          <span class="setting-label">语言</span>
          <select v-model="userConfig.language" @change="save" class="setting-select">
            <option value="zhCn">简体中文</option>
            <option value="zhTw">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="setting-row">
          <span class="setting-label">UI 主题</span>
          <div class="setting-theme-options">
            <button 
              :class="['setting-theme-btn', { active: themeState.current === 'A' }]" 
              @click="setTheme('A')"
            >
              A 简约
            </button>
            <button 
              :class="['setting-theme-btn', { active: themeState.current === 'B' }]" 
              @click="setTheme('B')"
            >
              B 漫画
            </button>
            <button 
              :class="['setting-theme-btn', { active: themeState.current === 'D' }]" 
              @click="setTheme('D')"
            >
              D 多主题
            </button>
            <button 
              :class="['setting-theme-btn']" 
              @click="back_old_theme"
            >
              回到旧主题
            </button>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">配色偏好</span>
          <div class="setting-theme-options">
            <button
              v-for="ct in colorThemeList"
              :key="ct.value"
              :class="['setting-theme-btn', { active: activeColorTheme === ct.value }]"
              @click="applyColorTheme(ct.value)"
            >
              {{ ct.label }}
            </button>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">侧边栏媒体库列表</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.showSidebarMediaList" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">漫画默认排序</span>
          <select v-model="userConfig.order" @change="save" class="setting-select">
            <option v-for="item in mangaSortOrder" :key="item" :value="item">
              {{ getSortLabel(item) }}
            </option>
          </select>
        </div>
        <div class="setting-row">
          <span class="setting-label">章节默认排序</span>
          <select v-model="userConfig.chapterOrder" @change="save" class="setting-select">
            <option v-for="item in chapterSortOrder" :key="item" :value="item">
              {{ getSortLabel(item) }}
            </option>
          </select>
        </div>
      </div>

      <!-- 阅读设置 -->
      <div class="setting-card">
        <h3>阅读设置</h3>
        <div class="setting-row">
          <span class="setting-label">翻页方向反转</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.pageTurningReverse" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">显示页码</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.showPageNumber" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">滑动翻页</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.enableTouchPageChange" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">使用阅读进度条</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.userSlider" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">跳转时打开新页签</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.openNewTab" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">单本库直接跳转章节</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.singleMediadirectChapterPage" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">条漫自动加载全部</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.loadAllFlowIamge" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">数字排序漫画图</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.orderChapterByNumber" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">章节列表简洁模式</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.simpleChapterView" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">继续阅读按钮仅显示章节号</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.continueReadButtonShowChapterNumberOnly" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <span class="setting-label">启用翻页动画</span>
          <label class="setting-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.enablePageAnimation" 
              @change="save"
            />
            <span class="setting-switch-slider"></span>
          </label>
        </div>
        <div class="setting-row" v-if="userConfig.enablePageAnimation">
          <span class="setting-label">翻页动画类型</span>
          <select v-model="userConfig.pageAnimationType" @change="save" class="setting-select">
            <option value="fade">淡入淡出</option>
            <option value="slide">左右滑动</option>
            <option value="page">实体书翻页</option>
          </select>
        </div>
        <div class="setting-row" v-if="userConfig.enablePageAnimation">
          <span class="setting-label">动画速度</span>
          <div class="setting-slider-container">
            <input 
              type="range" 
              v-model="userConfig.pageAnimationSpeed" 
              min="100" 
              max="1000" 
              step="50"
              @change="save"
              class="setting-slider"
            />
            <span class="setting-slider-value">{{ userConfig.pageAnimationSpeed }}ms</span>
          </div>
        </div>
      </div>

      <!-- 性能设置 -->
      <div class="setting-card">
        <h3>性能设置</h3>
        <div class="setting-row">
          <span class="setting-label">条漫加载步进</span>
          <input 
            type="number" 
            v-model="userConfig.flowLoadStep" 
            @change="save" 
            class="setting-input-number"
            min="1"
            max="10"
          />
        </div>
        <div class="setting-row">
          <span class="setting-label">封面加载并发数</span>
          <input 
            type="number" 
            v-model="userConfig.loadCoverConcurrency" 
            @change="save" 
            class="setting-input-number"
            min="1"
            max="10"
          />
        </div>
        <div class="setting-row">
          <span class="setting-label">图片缓存数量限制</span>
          <input 
            type="number" 
            v-model="userConfig.imageCacheLimit" 
            @change="save" 
            class="setting-input-number"
            min="0"
          />
          <span class="setting-note">(0表示无限制)</span>
        </div>
        <div class="setting-row">
          <span class="setting-label">漫画页面容量</span>
          <input 
            type="number" 
            v-model="mangaPageSize" 
            @change="savePageSize" 
            class="setting-input-number"
            min="0"
          />
          <span class="setting-note">(0使用默认值)</span>
        </div>
        <div class="setting-row">
          <span class="setting-label">章节页面容量</span>
          <input 
            type="number" 
            v-model="chapterPageSize" 
            @change="savePageSize" 
            class="setting-input-number"
            min="0"
          />
          <span class="setting-note">(0使用默认值)</span>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="setting-card">
        <h3>高级设置</h3>
        <div class="setting-row">
          <span class="setting-label">顶栏切换范围</span>
          <div class="setting-slider-container">
            <input 
              type="range" 
              v-model="userConfig.browseOperationTop" 
              min="10" 
              max="50" 
              @change="save"
              class="setting-slider"
            />
            <span class="setting-slider-value">{{ userConfig.browseOperationTop }}%</span>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">页码切换范围</span>
          <div class="setting-slider-container">
            <input 
              type="range" 
              v-model="userConfig.browseOperationBottom" 
              min="10" 
              max="50" 
              @change="save"
              class="setting-slider"
            />
            <span class="setting-slider-value">{{ userConfig.browseOperationBottom }}%</span>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">全屏模式</span>
          <button class="setting-btn-secondary" @click="toggleFullscreen">切换全屏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userConfig, userInfo, mangaSortOrder, chapterSortOrder } from '@/store'
import { themeState, setTheme } from '@/themes/store'
import { useColorTheme } from '@/themes/composables/use-color-theme'
import colorThemeList from '@/store/theme'
import userApi from '@/api/account'
import imageApi from '@/api/image'
import { cookieStorage } from '@/utils/persistence'
import { useSessionStore } from '@/store/session'
import { preferencesStore } from '@/store/preferences'

const router = useRouter()
const session = useSessionStore()

const { activeColorTheme, applyColorTheme } = useColorTheme()

// 本地页面容量设置
const mangaPageSize = ref(0)
const chapterPageSize = ref(0)

// 头像上传
const avatarInputRef = ref<HTMLInputElement>()
const uploadingAvatar = ref(false)
const avatarBlobUrl = ref('')

// 保存状态与轻提示
const saving = ref(false)
const saveHint = ref('')
const saveHintType = ref<'success' | 'error'>('success')
let saveHintTimer: ReturnType<typeof setTimeout> | null = null

function showSaveHint(text: string, type: 'success' | 'error' = 'success') {
  saveHint.value = text
  saveHintType.value = type
  if (saveHintTimer) clearTimeout(saveHintTimer)
  saveHintTimer = setTimeout(() => {
    saveHint.value = ''
  }, 1800)
}

// 加载头像 blob
async function loadAvatar() {
  if (!userInfo.avatarPath) {
    avatarBlobUrl.value = ''
    return
  }
  const url = await imageApi.get({ file: userInfo.avatarPath })
  avatarBlobUrl.value = url || ''
}

watch(() => userInfo.avatarPath, loadAvatar, { immediate: true })

onMounted(() => {
  // 初始化本地页面容量设置
  preferencesStore.refreshLegacyValues()
  mangaPageSize.value = preferencesStore.mangaPageSize
  chapterPageSize.value = preferencesStore.chapterPageSize
})

// 头像上传方法
function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

async function handleAvatarUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingAvatar.value = true
  try {
    const res = await userApi.upload_avatar(file)
    if (res?.code === 200 && res?.data?.avatarPath) {
      session.updateProfile({
        header: res.data.header || '',
        avatarPath: res.data.avatarPath || '',
      })
      await loadAvatar()
    }
  } catch (err) {
    console.error('头像上传失败:', err)
  } finally {
    uploadingAvatar.value = false
    target.value = ''
  }
}

// 获取排序标签
function getSortLabel(sort: string): string {
  const labels: Record<string, string> = {
    'id': 'ID 正序',
    'idDesc': 'ID 倒序',
    'name': '名称 正序',
    'nameDesc': '名称 倒序',
    'createTime': '创建时间 正序',
    'createTimeDesc': '创建时间 倒序',
    'updateTime': '更新时间 正序',
    'updateTimeDesc': '更新时间 倒序',
    'chapterUpdate': '章节更新 正序',
    'chapterUpdateDesc': '章节更新 倒序',
    'number': '章节号 正序',
    'numberDesc': '章节号 倒序'
  }
  return labels[sort] || sort
}

// 保存设置
async function save() {
  try {
    preferencesStore.setLanguage(userConfig.language)
    await userApi.update_user_config({ userConfig })
    showSaveHint('已保存', 'success')
  } catch (e) {
    console.error('保存设置失败:', e)
    showSaveHint('保存失败', 'error')
  }
}

// 保存页面容量设置
async function savePageSize() {
  preferencesStore.setPageSizes(mangaPageSize.value, chapterPageSize.value)
}

// 保存所有设置
async function saveAll() {
  if (saving.value) return
  saving.value = true
  try {
    // 保存页面容量
    await savePageSize()
    // 保存用户配置
    await userApi.update_user_config({ userConfig })
    showSaveHint('全部设置已保存', 'success')
  } catch (e) {
    console.error('保存设置失败:', e)
    showSaveHint('保存失败', 'error')
  } finally {
    saving.value = false
  }
}

// 全屏切换
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

function back_old_theme(){
  setTheme('Legacy')
  cookieStorage.remove('useNewTheme')
  router.push('/index')
}
</script>

<style scoped>
.setting-page {
  --setting-accent: #2563eb;
  --setting-accent-hover: #1d4ed8;
  --setting-accent-background: #2563eb;
  --setting-active-border: #2563eb;
  --setting-card-background: #fff;
  --setting-card-border: #eaeaea;
  --setting-card-radius: 1.2rem;
  --setting-card-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.04);
  --setting-control-radius: 0.6rem;
  --setting-theme-button-radius: 0.6rem;
  --setting-primary-radius: 0.8rem;
  --setting-primary-shadow: none;
  --setting-primary-hover-shadow: none;
  --setting-primary-hover-transform: none;
  --setting-footer-background: #fff;
  --setting-avatar-background: linear-gradient(135deg, #6366f1, #8b5cf6);
  --setting-heading: #1f2937;
  --setting-label: #4b5563;
  --setting-value: #111827;
  --setting-note: #9ca3af;
  --setting-row-border: #f3f4f6;
  --setting-control-background: #fff;
  --setting-control-text: #1f2937;
  --setting-switch-background: #e5e7eb;
  --setting-switch-knob: #fff;
  --setting-secondary-background: #f3f4f6;
  --setting-secondary-hover: #e5e7eb;
  --setting-primary-text: #fff;
  --setting-primary-hover-opacity: 1;
  padding: 2.4rem;
  max-width: 80rem;
  margin: 0 auto;
  position: relative;
  min-height: 100%; /* 改为相对高度以确保在父元素内 */
  box-sizing: border-box;
}

.setting-page--b {
  --setting-accent: #a855f7;
  --setting-accent-hover: #9333ea;
  --setting-accent-background: linear-gradient(135deg, #a855f7, #ec4899);
  --setting-active-border: transparent;
  --setting-card-background: rgba(255, 255, 255, 0.78);
  --setting-card-border: rgba(255, 255, 255, 0.9);
  --setting-card-radius: 1.6rem;
  --setting-card-shadow: 0 0.8rem 2.4rem rgba(108, 141, 255, 0.1);
  --setting-control-radius: 0.8rem;
  --setting-theme-button-radius: 2rem;
  --setting-primary-radius: 1.2rem;
  --setting-primary-shadow: 0 0.4rem 1.2rem rgba(168, 85, 247, 0.3);
  --setting-primary-hover-shadow: 0 0.6rem 1.6rem rgba(168, 85, 247, 0.4);
  --setting-primary-hover-transform: translateY(-0.2rem);
  --setting-footer-background: rgba(255, 255, 255, 0.9);
  --setting-avatar-background: linear-gradient(135deg, #a855f7, #ec4899);
}

.setting-page--d {
  --setting-accent: var(--accent, var(--sd-primary, #2563eb));
  --setting-accent-hover: var(--accent, var(--sd-primary, #2563eb));
  --setting-accent-background: var(--accent, var(--sd-primary, #2563eb));
  --setting-active-border: var(--accent, var(--sd-primary, #2563eb));
  --setting-card-background: var(--bg2, var(--sd-card, #fff));
  --setting-card-border: var(--border, var(--sd-border, #e5e7eb));
  --setting-card-radius: 1.2rem;
  --setting-card-shadow: none;
  --setting-control-radius: 0.8rem;
  --setting-theme-button-radius: 0.8rem;
  --setting-primary-radius: 0.8rem;
  --setting-footer-background: var(--bg2, var(--sd-card, #fff));
  --setting-avatar-background: var(--accent, var(--sd-primary, #2563eb));
  --setting-heading: var(--fg, var(--sd-text, #0f172a));
  --setting-label: var(--fg2, var(--sd-text-muted, #64748b));
  --setting-value: var(--fg, var(--sd-text, #0f172a));
  --setting-note: var(--fg3, var(--sd-text-faint, #94a3b8));
  --setting-row-border: var(--border, var(--sd-border, #e5e7eb));
  --setting-control-background: var(--bg, var(--sd-back, #eff6ff));
  --setting-control-text: var(--fg, var(--sd-text, #0f172a));
  --setting-switch-background: var(--border, var(--sd-border, #e5e7eb));
  --setting-switch-knob: var(--bg, var(--sd-back, #eff6ff));
  --setting-secondary-background: var(--bg, var(--sd-back, #eff6ff));
  --setting-secondary-hover: var(--bg2, var(--sd-card, #fff));
  --setting-primary-text: var(--bg, var(--sd-back, #fff));
  --setting-primary-hover-opacity: 0.85;
}

.setting-page-head {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  flex-wrap: wrap;
  margin: -2.4rem -2.4rem 2.4rem;
  padding: 1.6rem 2.4rem;
  background: var(--setting-footer-background);
  border-bottom: 1px solid var(--setting-card-border);
  backdrop-filter: saturate(1.4) blur(1.4rem);
  -webkit-backdrop-filter: saturate(1.4) blur(1.4rem);
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.04);
}

.setting-page-head-title {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.setting-page-head h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--setting-heading);
  line-height: 1.2;
}

.setting-page-head-sub {
  margin: 0;
  font-size: 1.3rem;
  color: var(--setting-note);
}

.setting-page-head-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.setting-save-hint {
  font-size: 1.3rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  white-space: nowrap;
}

.setting-save-hint--error {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.setting-toast-fade-enter-active,
.setting-toast-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.setting-toast-fade-enter-from,
.setting-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.4rem);
}

.setting-btn-save {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  white-space: nowrap;
}

.setting-btn-save:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: var(--setting-primary-shadow);
}

.setting-btn-spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 0.2rem solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  border-radius: 50%;
  animation: setting-spin 0.7s linear infinite;
}

@keyframes setting-spin {
  to { transform: rotate(360deg); }
}

.setting-groups {
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  margin-bottom: 0; /* 移除底部margin，由吸底按钮处理 */
  padding-bottom: 0; /* 移除底部padding，由吸底按钮处理 */
}

.setting-card {
  background: var(--setting-card-background);
  border: 1px solid var(--setting-card-border);
  border-radius: var(--setting-card-radius);
  padding: 2.4rem;
  box-shadow: var(--setting-card-shadow);
  backdrop-filter: blur(1.6rem);
}

.setting-card h3 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 2rem;
  color: var(--setting-heading);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--setting-row-border);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 1.5rem;
  color: var(--setting-label);
  flex: 1;
}

.setting-value {
  font-size: 1.5rem;
  color: var(--setting-value);
  font-weight: 500;
}

.setting-note {
  font-size: 1.3rem;
  color: var(--setting-note);
  margin-left: 0.8rem;
}

.setting-select {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--setting-card-border);
  border-radius: var(--setting-control-radius);
  font-size: 1.4rem;
  background: var(--setting-control-background);
  color: var(--setting-control-text);
  transition: border-color 0.2s;
}

.setting-select:hover,
.setting-input-number:hover {
  border-color: var(--setting-accent);
}

.setting-select:focus,
.setting-input-number:focus {
  outline: none;
  border-color: var(--setting-accent);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.setting-input-number {
  width: 8rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--setting-card-border);
  border-radius: var(--setting-control-radius);
  font-size: 1.4rem;
  text-align: center;
  background: var(--setting-control-background);
  color: var(--setting-control-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.setting-slider-container {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.setting-slider {
  width: 12rem;
  height: 0.4rem;
  border-radius: 0.2rem;
  background: var(--setting-switch-background);
  outline: none;
  -webkit-appearance: none;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: var(--setting-accent-background);
  cursor: pointer;
}

.setting-slider-value {
  font-size: 1.4rem;
  color: #6b7280;
  min-width: 5rem;
}

.setting-switch {
  position: relative;
  display: inline-block;
  width: 4.4rem;
  height: 2.4rem;
}

.setting-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.setting-switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: .4s;
  border-radius: 2.4rem;
}

.setting-switch-slider:before {
  position: absolute;
  content: "";
  height: 1.8rem;
  width: 1.8rem;
  left: 0.3rem;
  bottom: 0.3rem;
  background-color: var(--setting-switch-knob);
  transition: .4s;
  border-radius: 50%;
}

.setting-switch input:checked + .setting-switch-slider {
  background: var(--setting-accent-background);
}

.setting-switch input:checked + .setting-switch-slider:before {
  transform: translateX(2rem);
}

.setting-theme-options {
  display: flex;
  gap: 0.8rem;
}

.setting-theme-btn {
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  border: 1px solid var(--setting-card-border);
  border-radius: var(--setting-theme-button-radius);
  background: var(--setting-control-background);
  color: var(--setting-control-text);
  cursor: pointer;
  transition: all 0.2s;
}

.setting-theme-btn:hover {
  border-color: var(--setting-accent);
}

.setting-theme-btn.active {
  background: var(--setting-accent-background);
  color: var(--setting-primary-text);
  border-color: var(--setting-active-border);
}

.setting-avatar-container {
  display: flex;
  align-items: center;
}

.setting-avatar {
  width: 4.8rem;
  height: 4.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--setting-avatar-background);
  color: #fff;
  font-weight: 600;
  font-size: 2rem;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: opacity 0.2s;
}

.setting-avatar:hover .setting-avatar-overlay {
  opacity: 1;
}

.setting-avatar.setting-avatar-uploading {
  opacity: 0.7;
  pointer-events: none;
}

.setting-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.setting-avatar-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 1.8rem;
}

.setting-avatar-input-hidden {
  display: none;
}

.setting-btn-primary {
  padding: 1.2rem 2.4rem;
  font-size: 1.6rem;
  font-weight: 500;
  color: #fff;
  background: var(--setting-accent-background);
  border: none;
  border-radius: var(--setting-primary-radius);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--setting-primary-shadow);
}

.setting-btn-primary:hover {
  box-shadow: var(--setting-primary-hover-shadow);
  transform: var(--setting-primary-hover-transform);
  opacity: var(--setting-primary-hover-opacity);
}

.setting-btn-secondary {
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  color: var(--setting-control-text);
  background: var(--setting-secondary-background);
  border: 1px solid var(--setting-card-border);
  border-radius: var(--setting-control-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.setting-btn-secondary:hover {
  background: var(--setting-secondary-hover);
}

@media (max-width: 76.8rem) {
  .setting-page {
    padding: 1.6rem;
  }
  
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .setting-label {
    margin-bottom: 0.4rem;
  }
  
  .setting-theme-options {
    flex-wrap: wrap;
  }

  .setting-page-head {
    margin: -1.6rem -1.6rem 1.6rem;
    padding: 1.2rem 1.6rem;
    align-items: flex-start;
  }

  .setting-page-head h1 {
    font-size: 1.8rem;
  }

  .setting-page-head-sub {
display: none;
  }

  .setting-page-head-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
