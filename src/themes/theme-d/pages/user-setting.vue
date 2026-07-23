<template>
  <div class="td-setting">
    <div class="td-page-head">
      <h1>用户设置</h1>
      <button class="td-btn-logout" @click="userLogout">登出</button>
    </div>
    
    <div class="td-setting-groups">
      <!-- 界面设置 -->
      <div class="td-setting-card">
        <h3>界面设置</h3>
        <div class="td-setting-row">
          <span class="td-setting-label">语言</span>
          <select v-model="userConfig.language" @change="save" class="td-select">
            <option value="zhCn">简体中文</option>
            <option value="zhTw">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">UI 主题</span>
          <div class="td-theme-options">
            <button 
              :class="['td-theme-btn', { active: themeState.current === 'A' }]" 
              @click="setTheme('A')"
            >
              A 简约
            </button>
            <button 
              :class="['td-theme-btn', { active: themeState.current === 'B' }]" 
              @click="setTheme('B')"
            >
              B 漫画
            </button>
            <button 
              :class="['td-theme-btn', { active: themeState.current === 'D' }]" 
              @click="setTheme('D')"
            >
              D 多主题
            </button>
            <button 
              :class="['td-theme-btn']" 
              @click="back_old_theme"
            >
              回到旧主题
            </button>
          </div>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">侧边栏媒体库列表</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.showSidebarMediaList" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">漫画默认排序</span>
          <select v-model="userConfig.order" @change="save" class="td-select">
            <option v-for="item in mangaSortOrder" :key="item" :value="item">
              {{ getSortLabel(item) }}
            </option>
          </select>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">章节默认排序</span>
          <select v-model="userConfig.chapterOrder" @change="save" class="td-select">
            <option v-for="item in chapterSortOrder" :key="item" :value="item">
              {{ getSortLabel(item) }}
            </option>
          </select>
        </div>
      </div>

      <!-- 阅读设置 -->
      <div class="td-setting-card">
        <h3>阅读设置</h3>
        <div class="td-setting-row">
          <span class="td-setting-label">翻页方向反转</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.pageTurningReverse" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">显示页码</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.showPageNumber" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">滑动翻页</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.enableTouchPageChange" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">使用阅读进度条</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.userSlider" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">跳转时打开新页签</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.openNewTab" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">单本库直接跳转章节</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.singleMediadirectChapterPage" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">条漫自动加载全部</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.loadAllFlowIamge" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">数字排序漫画图</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.orderChapterByNumber" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">章节列表简洁模式</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.simpleChapterView" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">继续阅读按钮仅显示章节号</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.continueReadButtonShowChapterNumberOnly" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">启用翻页动画</span>
          <label class="td-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.enablePageAnimation" 
              @change="save"
            />
            <span class="td-switch-slider"></span>
          </label>
        </div>
        <div class="td-setting-row" v-if="userConfig.enablePageAnimation">
          <span class="td-setting-label">翻页动画类型</span>
          <select v-model="userConfig.pageAnimationType" @change="save" class="td-select">
            <option value="fade">淡入淡出</option>
            <option value="slide">左右滑动</option>
            <option value="page">实体书翻页</option>
          </select>
        </div>
        <div class="td-setting-row" v-if="userConfig.enablePageAnimation">
          <span class="td-setting-label">动画速度</span>
          <div class="td-slider-container">
            <input 
              type="range" 
              v-model="userConfig.pageAnimationSpeed" 
              min="100" 
              max="1000" 
              step="50"
              @change="save"
              class="td-slider"
            />
            <span class="td-slider-value">{{ userConfig.pageAnimationSpeed }}ms</span>
          </div>
        </div>
      </div>

      <!-- 性能设置 -->
      <div class="td-setting-card">
        <h3>性能设置</h3>
        <div class="td-setting-row">
          <span class="td-setting-label">条漫加载步进</span>
          <input 
            type="number" 
            v-model="userConfig.flowLoadStep" 
            @change="save" 
            class="td-input-number"
            min="1"
            max="10"
          />
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">封面加载并发数</span>
          <input 
            type="number" 
            v-model="userConfig.loadCoverConcurrency" 
            @change="save" 
            class="td-input-number"
            min="1"
            max="10"
          />
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">图片缓存数量限制</span>
          <input 
            type="number" 
            v-model="userConfig.imageCacheLimit" 
            @change="save" 
            class="td-input-number"
            min="0"
          />
          <span class="td-setting-note">(0表示无限制)</span>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">漫画页面容量</span>
          <input 
            type="number" 
            v-model="mangaPageSize" 
            @change="savePageSize" 
            class="td-input-number"
            min="0"
          />
          <span class="td-setting-note">(0使用默认值)</span>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">章节页面容量</span>
          <input 
            type="number" 
            v-model="chapterPageSize" 
            @change="savePageSize" 
            class="td-input-number"
            min="0"
          />
          <span class="td-setting-note">(0使用默认值)</span>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="td-setting-card">
        <h3>高级设置</h3>
        <div class="td-setting-row">
          <span class="td-setting-label">顶栏切换范围</span>
          <div class="td-slider-container">
            <input 
              type="range" 
              v-model="userConfig.browseOperationTop" 
              min="10" 
              max="50" 
              @change="save"
              class="td-slider"
            />
            <span class="td-slider-value">{{ userConfig.browseOperationTop }}%</span>
          </div>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">页码切换范围</span>
          <div class="td-slider-container">
            <input 
              type="range" 
              v-model="userConfig.browseOperationBottom" 
              min="10" 
              max="50" 
              @change="save"
              class="td-slider"
            />
            <span class="td-slider-value">{{ userConfig.browseOperationBottom }}%</span>
          </div>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">全屏模式</span>
          <button class="td-btn-secondary" @click="toggleFullscreen">切换全屏</button>
        </div>
      </div>

      <!-- 账户信息 -->
      <div class="td-setting-card">
        <h3>账户信息</h3>
        <div class="td-setting-row">
          <span class="td-setting-label">用户名</span>
          <span class="td-setting-value">{{ userInfo.userName }}</span>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">用户ID</span>
          <span class="td-setting-value">{{ userInfo.userId }}</span>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">用户头像</span>
          <div class="td-avatar-container">
            <div class="td-avatar">{{ userInfo.userName?.charAt(0) || 'U' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="td-setting-footer">
      <button class="td-btn-primary" @click="saveAll">保存所有设置</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userConfig, userInfo, mangaSortOrder, chapterSortOrder } from '@/store'
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
.td-setting {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  min-height: 100%;
  box-sizing: border-box;
}

.td-page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.td-page-head h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--fg);
}

.td-btn-logout {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.td-btn-logout:hover {
  background: var(--accent-soft-hover);
}

.td-setting-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 0;
  padding-bottom: 0;
}

.td-setting-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.td-setting-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: var(--fg);
}

.td-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.td-setting-row:last-child {
  border-bottom: none;
}

.td-setting-label {
  font-size: 15px;
  color: var(--fg2);
  flex: 1;
}

.td-setting-value {
  font-size: 15px;
  color: var(--fg);
  font-weight: 500;
}

.td-setting-note {
  font-size: 13px;
  color: var(--fg3);
  margin-left: 8px;
}

.td-select {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg);
  color: var(--fg);
  transition: all 0.2s;
}

.td-select:focus {
  outline: none;
  border-color: var(--accent);
}

.td-input-number {
  width: 80px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background: var(--bg);
  color: var(--fg);
  transition: all 0.2s;
}

.td-input-number:focus {
  outline: none;
  border-color: var(--accent);
}

.td-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.td-slider {
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  outline: none;
  -webkit-appearance: none;
}

.td-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}

.td-slider-value {
  font-size: 14px;
  color: var(--fg2);
  min-width: 50px;
}

.td-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.td-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.td-switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: .4s;
  border-radius: 24px;
}

.td-switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--bg);
  transition: .4s;
  border-radius: 50%;
}

.td-switch input:checked + .td-switch-slider {
  background: var(--accent);
}

.td-switch input:checked + .td-switch-slider:before {
  transform: translateX(20px);
}

.td-theme-options {
  display: flex;
  gap: 8px;
}

.td-theme-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--fg);
  cursor: pointer;
  transition: all 0.2s;
}

.td-theme-btn:hover {
  border-color: var(--accent);
}

.td-theme-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.td-avatar-container {
  display: flex;
  align-items: center;
}

.td-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--bg);
  font-weight: 600;
  font-size: 20px;
  border-radius: 50%;
}

.td-btn-primary {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.td-btn-primary:hover {
  opacity: 0.85;
}

.td-btn-secondary {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.td-btn-secondary:hover {
  background: var(--bg2);
}

.td-setting-footer {
  position: sticky;
  bottom: 0;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  z-index: 10;
  margin: 0 -24px -24px -24px;
  position: -webkit-sticky;
}

@media (max-width: 768px) {
  .td-setting {
    padding: 16px;
  }
  
  .td-setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .td-setting-label {
    margin-bottom: 4px;
  }
  
  .td-theme-options {
    flex-wrap: wrap;
  }
  
  .td-setting-footer {
    padding: 12px 16px;
    margin: 0 -16px -16px -16px;
  }
  
  .td-setting-groups {
    padding-bottom: 0;
  }
}
</style>
