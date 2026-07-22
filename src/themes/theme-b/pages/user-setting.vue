<template>
  <div class="tb-setting">
    <div class="tb-page-head">
      <h1>用户设置</h1>
      <button class="tb-btn-logout" @click="userLogout">登出</button>
    </div>
    
    <div class="tb-setting-groups">
      <!-- 界面设置 -->
      <div class="tb-setting-card">
        <h3>界面设置</h3>
        <div class="tb-setting-row">
          <span class="tb-setting-label">语言</span>
          <select v-model="userConfig.language" @change="save" class="tb-select">
            <option value="zhCn">简体中文</option>
            <option value="zhTw">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">UI 主题</span>
          <div class="tb-theme-options">
            <button 
              :class="['tb-theme-btn', { active: themeState.current === 'A' }]" 
              @click="setTheme('A')"
            >
              A 简约
            </button>
            <button 
              :class="['tb-theme-btn', { active: themeState.current === 'B' }]" 
              @click="setTheme('B')"
            >
              B 漫画
            </button>
            <button 
              :class="['tb-theme-btn', { active: themeState.current === 'D' }]" 
              @click="setTheme('D')"
            >
              D 多主题
            </button>
            <button 
              :class="['tb-theme-btn']" 
              @click="back_old_theme"
            >
              回到旧主题
            </button>
          </div>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">侧边栏媒体库列表</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.showSidebarMediaList" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">漫画默认排序</span>
          <select v-model="userConfig.order" @change="save" class="tb-select">
            <option v-for="item in sortOrder" :key="item" :value="item">
              {{ getSortLabel(item) }}
            </option>
          </select>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">章节默认排序</span>
          <select v-model="userConfig.chapterOrder" @change="save" class="tb-select">
            <option v-for="item in chapterSortOrder" :key="item" :value="item">
              {{ getSortLabel(item) }}
            </option>
          </select>
        </div>
      </div>

      <!-- 阅读设置 -->
      <div class="tb-setting-card">
        <h3>阅读设置</h3>
        <div class="tb-setting-row">
          <span class="tb-setting-label">翻页方向反转</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.pageTurningReverse" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">显示页码</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.showPageNumber" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">滑动翻页</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.enableTouchPageChange" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">使用阅读进度条</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.userSlider" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">跳转时打开新页签</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.openNewTab" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">单本库直接跳转章节</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.singleMediadirectChapterPage" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">条漫自动加载全部</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.loadAllFlowIamge" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">数字排序漫画图</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.orderChapterByNumber" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">章节列表简洁模式</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.simpleChapterView" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">继续阅读按钮仅显示章节号</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.continueReadButtonShowChapterNumberOnly" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">启用翻页动画</span>
          <label class="tb-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.enablePageAnimation" 
              @change="save"
            />
            <span class="tb-switch-slider"></span>
          </label>
        </div>
        <div class="tb-setting-row" v-if="userConfig.enablePageAnimation">
          <span class="tb-setting-label">翻页动画类型</span>
          <select v-model="userConfig.pageAnimationType" @change="save" class="tb-select">
            <option value="fade">淡入淡出</option>
            <option value="slide">左右滑动</option>
            <option value="page">实体书翻页</option>
          </select>
        </div>
        <div class="tb-setting-row" v-if="userConfig.enablePageAnimation">
          <span class="tb-setting-label">动画速度</span>
          <div class="tb-slider-container">
            <input 
              type="range" 
              v-model="userConfig.pageAnimationSpeed" 
              min="100" 
              max="1000" 
              step="50"
              @change="save"
              class="tb-slider"
            />
            <span class="tb-slider-value">{{ userConfig.pageAnimationSpeed }}ms</span>
          </div>
        </div>
      </div>

      <!-- 性能设置 -->
      <div class="tb-setting-card">
        <h3>性能设置</h3>
        <div class="tb-setting-row">
          <span class="tb-setting-label">条漫加载步进</span>
          <input 
            type="number" 
            v-model="userConfig.flowLoadStep" 
            @change="save" 
            class="tb-input-number"
            min="1"
            max="10"
          />
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">封面加载并发数</span>
          <input 
            type="number" 
            v-model="userConfig.loadCoverConcurrency" 
            @change="save" 
            class="tb-input-number"
            min="1"
            max="10"
          />
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">图片缓存数量限制</span>
          <input 
            type="number" 
            v-model="userConfig.imageCacheLimit" 
            @change="save" 
            class="tb-input-number"
            min="0"
          />
          <span class="tb-setting-note">(0表示无限制)</span>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">漫画页面容量</span>
          <input 
            type="number" 
            v-model="mangaPageSize" 
            @change="savePageSize" 
            class="tb-input-number"
            min="0"
          />
          <span class="tb-setting-note">(0使用默认值)</span>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">章节页面容量</span>
          <input 
            type="number" 
            v-model="chapterPageSize" 
            @change="savePageSize" 
            class="tb-input-number"
            min="0"
          />
          <span class="tb-setting-note">(0使用默认值)</span>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="tb-setting-card">
        <h3>高级设置</h3>
        <div class="tb-setting-row">
          <span class="tb-setting-label">顶栏切换范围</span>
          <div class="tb-slider-container">
            <input 
              type="range" 
              v-model="userConfig.browseOperationTop" 
              min="10" 
              max="50" 
              @change="save"
              class="tb-slider"
            />
            <span class="tb-slider-value">{{ userConfig.browseOperationTop }}%</span>
          </div>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">页码切换范围</span>
          <div class="tb-slider-container">
            <input 
              type="range" 
              v-model="userConfig.browseOperationBottom" 
              min="10" 
              max="50" 
              @change="save"
              class="tb-slider"
            />
            <span class="tb-slider-value">{{ userConfig.browseOperationBottom }}%</span>
          </div>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">全屏模式</span>
          <button class="tb-btn-secondary" @click="toggleFullscreen">切换全屏</button>
        </div>
      </div>

      <!-- 账户信息 -->
      <div class="tb-setting-card">
        <h3>账户信息</h3>
        <div class="tb-setting-row">
          <span class="tb-setting-label">用户名</span>
          <span class="tb-setting-value">{{ userInfo.userName }}</span>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">用户ID</span>
          <span class="tb-setting-value">{{ userInfo.userId }}</span>
        </div>
        <div class="tb-setting-row">
          <span class="tb-setting-label">用户头像</span>
          <div class="tb-avatar-container">
            <div class="tb-avatar">{{ userInfo.userName?.charAt(0) || 'U' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tb-setting-footer">
      <button class="tb-btn-primary" @click="saveAll">保存所有设置</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userConfig, userInfo, sortOrder, chapterSortOrder } from '@/store'
import { themeState, setTheme } from '@/themes/store'
import userApi from '@/api/account'
import { Cookies } from '@/utils'

const router = useRouter()

// 本地页面容量设置
const mangaPageSize = ref(0)
const chapterPageSize = ref(0)

onMounted(() => {
  // 初始化本地页面容量设置
  mangaPageSize.value = Number(Cookies.get('mangaPageSize')) || 0
  chapterPageSize.value = Number(Cookies.get('chapterPageSize')) || 0
})

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

// 登出
function userLogout() {
  Cookies.remove('smanga-userName')
  Cookies.remove('smanga-userId')
  router.push('/login')
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
.tb-setting {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  min-height: 100%;
  box-sizing: border-box;
}

.tb-page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.tb-page-head h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.tb-btn-logout {
  padding: 8px 16px;
  font-size: 14px;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tb-btn-logout:hover {
  background: rgba(254, 202, 202, 0.2);
}

.tb-setting-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 0;
  padding-bottom: 0;
}

.tb-setting-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tb-setting-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #1f2937;
}

.tb-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.tb-setting-row:last-child {
  border-bottom: none;
}

.tb-setting-label {
  font-size: 15px;
  color: #4b5563;
  flex: 1;
}

.tb-setting-value {
  font-size: 15px;
  color: #111827;
  font-weight: 500;
}

.tb-setting-note {
  font-size: 13px;
  color: #9ca3af;
  margin-left: 8px;
}

.tb-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #1f2937;
  transition: all 0.2s;
}

.tb-select:focus {
  outline: none;
  border-color: #a855f7;
}

.tb-input-number {
  width: 80px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background: #fff;
  color: #1f2937;
  transition: all 0.2s;
}

.tb-input-number:focus {
  outline: none;
  border-color: #a855f7;
}

.tb-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tb-slider {
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.tb-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  cursor: pointer;
}

.tb-slider-value {
  font-size: 14px;
  color: #6b7280;
  min-width: 50px;
}

.tb-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.tb-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.tb-switch-slider {
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

.tb-switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: #fff;
  transition: .4s;
  border-radius: 50%;
}

.tb-switch input:checked + .tb-switch-slider {
  background: linear-gradient(135deg, #a855f7, #ec4899);
}

.tb-switch input:checked + .tb-switch-slider:before {
  transform: translateX(20px);
}

.tb-theme-options {
  display: flex;
  gap: 8px;
}

.tb-theme-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s;
}

.tb-theme-btn:hover {
  border-color: #a855f7;
}

.tb-theme-btn.active {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border-color: transparent;
  color: #fff;
}

.tb-avatar-container {
  display: flex;
  align-items: center;
}

.tb-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: #fff;
  font-weight: 600;
  font-size: 20px;
  border-radius: 50%;
}

.tb-btn-primary {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.tb-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
}

.tb-btn-secondary {
  padding: 8px 16px;
  font-size: 14px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tb-btn-secondary:hover {
  background: #e5e7eb;
}

.tb-setting-footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #eaeaea;
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  z-index: 10;
  margin: 0 -24px -24px -24px;
  position: -webkit-sticky;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

@media (max-width: 768px) {
  .tb-setting {
    padding: 16px;
  }
  
  .tb-setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .tb-setting-label {
    margin-bottom: 4px;
  }
  
  .tb-theme-options {
    flex-wrap: wrap;
  }
  
  .tb-setting-footer {
    padding: 12px 16px;
    margin: 0 -16px -16px -16px;
  }
  
  .tb-setting-groups {
    padding-bottom: 0;
  }
}
</style>
