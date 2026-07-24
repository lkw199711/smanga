<template>
  <div :class="['setting-page', `setting-page--${themeState.current.toLowerCase()}`]">
    <div class="setting-page-head">
      <h1>用户设置</h1>
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

    <div class="setting-footer">
      <button class="setting-btn-primary" @click="saveAll">保存所有设置</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userConfig, userInfo, mangaSortOrder, chapterSortOrder } from '@/store'
import { themeState, setTheme } from '@/themes/store'
import userApi from '@/api/account'
import imageApi from '@/api/image'
import { Cookies } from '@/utils'

const router = useRouter()

// 本地页面容量设置
const mangaPageSize = ref(0)
const chapterPageSize = ref(0)

// 头像上传
const avatarInputRef = ref<HTMLInputElement>()
const uploadingAvatar = ref(false)
const avatarBlobUrl = ref('')

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
  mangaPageSize.value = Number(Cookies.get('mangaPageSize')) || 0
  chapterPageSize.value = Number(Cookies.get('chapterPageSize')) || 0
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
      userInfo.header = res.data.header
      userInfo.avatarPath = res.data.avatarPath
      Cookies.set('header', res.data.header || '')
      Cookies.set('avatarPath', res.data.avatarPath || '')
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
    await userApi.update_user_config({ userConfig })
  } catch (e) {
    console.error('保存设置失败:', e)
  }
}

// 保存页面容量设置
async function savePageSize() {
  Cookies.set('mangaPageSize', mangaPageSize.value.toString())
  Cookies.set('chapterPageSize', chapterPageSize.value.toString())
}

// 保存所有设置
async function saveAll() {
  try {
    // 保存页面容量
    await savePageSize()
    // 保存用户配置
    await save()
  } catch (e) {
    console.error('保存设置失败:', e)
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
  Cookies.remove('useNewTheme')
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
  --setting-card-radius: 12px;
  --setting-card-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  --setting-control-radius: 6px;
  --setting-theme-button-radius: 6px;
  --setting-primary-radius: 8px;
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
  padding: 24px;
  max-width: 800px;
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
  --setting-card-radius: 16px;
  --setting-card-shadow: 0 8px 24px rgba(108, 141, 255, 0.1);
  --setting-control-radius: 8px;
  --setting-theme-button-radius: 20px;
  --setting-primary-radius: 12px;
  --setting-primary-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
  --setting-primary-hover-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
  --setting-primary-hover-transform: translateY(-2px);
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
  --setting-card-radius: 12px;
  --setting-card-shadow: none;
  --setting-control-radius: 8px;
  --setting-theme-button-radius: 8px;
  --setting-primary-radius: 8px;
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
  margin-bottom: 32px;
}

.setting-page-head h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--setting-heading);
}

.setting-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 0; /* 移除底部margin，由吸底按钮处理 */
  padding-bottom: 0; /* 移除底部padding，由吸底按钮处理 */
}

.setting-card {
  background: var(--setting-card-background);
  border: 1px solid var(--setting-card-border);
  border-radius: var(--setting-card-radius);
  padding: 24px;
  box-shadow: var(--setting-card-shadow);
  backdrop-filter: blur(16px);
}

.setting-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: var(--setting-heading);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--setting-row-border);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 15px;
  color: var(--setting-label);
  flex: 1;
}

.setting-value {
  font-size: 15px;
  color: var(--setting-value);
  font-weight: 500;
}

.setting-note {
  font-size: 13px;
  color: var(--setting-note);
  margin-left: 8px;
}

.setting-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: var(--setting-control-radius);
  font-size: 14px;
  background: var(--setting-control-background);
  color: var(--setting-control-text);
}

.setting-select:focus,
.setting-input-number:focus {
  outline: none;
  border-color: var(--setting-accent);
}

.setting-input-number {
  width: 80px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: var(--setting-control-radius);
  font-size: 14px;
  text-align: center;
  background: var(--setting-control-background);
  color: var(--setting-control-text);
}

.setting-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-slider {
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: var(--setting-switch-background);
  outline: none;
  -webkit-appearance: none;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--setting-accent-background);
  cursor: pointer;
}

.setting-slider-value {
  font-size: 14px;
  color: #6b7280;
  min-width: 50px;
}

.setting-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
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
  border-radius: 24px;
}

.setting-switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--setting-switch-knob);
  transition: .4s;
  border-radius: 50%;
}

.setting-switch input:checked + .setting-switch-slider {
  background: var(--setting-accent-background);
}

.setting-switch input:checked + .setting-switch-slider:before {
  transform: translateX(20px);
}

.setting-theme-options {
  display: flex;
  gap: 8px;
}

.setting-theme-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #d1d5db;
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
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--setting-avatar-background);
  color: #fff;
  font-weight: 600;
  font-size: 20px;
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
  font-size: 18px;
}

.setting-avatar-input-hidden {
  display: none;
}

.setting-btn-primary {
  padding: 12px 24px;
  font-size: 16px;
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
  padding: 8px 16px;
  font-size: 14px;
  color: var(--setting-control-text);
  background: var(--setting-secondary-background);
  border: 1px solid #d1d5db;
  border-radius: var(--setting-control-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.setting-btn-secondary:hover {
  background: var(--setting-secondary-hover);
}

.setting-footer {
  position: sticky;
  bottom: 0;
  background: var(--setting-footer-background);
  border-top: 1px solid var(--setting-card-border);
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
  margin: 0 -24px -24px -24px; /* 抵消父元素的padding，确保按钮占满宽度 */
  position: -webkit-sticky; /* Safari兼容 */
}

@media (max-width: 768px) {
  .setting-page {
    padding: 16px;
  }
  
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .setting-label {
    margin-bottom: 4px;
  }
  
  .setting-theme-options {
    flex-wrap: wrap;
  }
  
  .setting-footer {
    padding: 12px 16px;
    margin: 0 -16px -16px -16px; /* 移动端也抵消父元素padding */
  }
  
  .setting-groups {
    padding-bottom: 0; /* 移动端不需要额外padding */
  }
}
</style>
