<template>
  <div class="ta-setting">
    <div class="ta-page-head">
      <h1>用户设置</h1>
      <button class="ta-btn-logout" @click="userLogout">登出</button>
    </div>
    
    <div class="ta-setting-groups">
      <!-- 界面设置 -->
      <div class="ta-setting-card">
        <h3>界面设置</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">语言</span>
          <select v-model="userConfig.language" @change="save" class="ta-select">
            <option value="zhCn">中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">UI 主题</span>
          <div class="ta-theme-options">
            <button 
              :class="['ta-theme-btn', { active: themeState.current === 'A' }]" 
              @click="setTheme('A')"
            >
              A 简约
            </button>
            <button 
              :class="['ta-theme-btn', { active: themeState.current === 'B' }]" 
              @click="setTheme('B')"
            >
              B 漫画
            </button>
            <button 
              :class="['ta-theme-btn', { active: themeState.current === 'D' }]" 
              @click="setTheme('D')"
            >
              D 多主题
            </button>
          </div>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">侧边栏媒体库列表</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.showSidebarMediaList" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">漫画默认排序</span>
          <select v-model="userConfig.order" @change="save" class="ta-select">
            <option v-for="item in sortOrder" :key="item" :value="item">
              {{ getSortLabel(item) }}
            </option>
          </select>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">章节默认排序</span>
          <select v-model="userConfig.chapterOrder" @change="save" class="ta-select">
            <option v-for="item in chapterSortOrder" :key="item" :value="item">
              {{ getSortLabel(item) }}
            </option>
          </select>
        </div>
      </div>

      <!-- 阅读设置 -->
      <div class="ta-setting-card">
        <h3>阅读设置</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">翻页方向反转</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.pageTurningReverse" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">显示页码</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.showPageNumber" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">滑动翻页</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.enableTouchPageChange" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">使用阅读进度条</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.userSlider" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">跳转时打开新页签</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.openNewTab" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">单本库直接跳转章节</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.singleMediadirectChapterPage" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">条漫自动加载全部</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.loadAllFlowIamge" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">数字排序漫画图</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.orderChapterByNumber" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">章节列表简洁模式</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.simpleChapterView" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">继续阅读按钮仅显示章节号</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.continueReadButtonShowChapterNumberOnly" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">启用翻页动画</span>
          <label class="ta-switch">
            <input 
              type="checkbox" 
              v-model="userConfig.enablePageAnimation" 
              @change="save"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </div>
        <div class="ta-setting-row" v-if="userConfig.enablePageAnimation">
          <span class="ta-setting-label">翻页动画类型</span>
          <select v-model="userConfig.pageAnimationType" @change="save" class="ta-select">
            <option value="fade">淡入淡出</option>
            <option value="slide">左右滑动</option>
            <option value="page">实体书翻页</option>
          </select>
        </div>
        <div class="ta-setting-row" v-if="userConfig.enablePageAnimation">
          <span class="ta-setting-label">动画速度</span>
          <div class="ta-slider-container">
            <input 
              type="range" 
              v-model="userConfig.pageAnimationSpeed" 
              min="100" 
              max="1000" 
              step="50"
              @change="save"
              class="ta-slider"
            />
            <span class="ta-slider-value">{{ userConfig.pageAnimationSpeed }}ms</span>
          </div>
        </div>
      </div>

      <!-- 性能设置 -->
      <div class="ta-setting-card">
        <h3>性能设置</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">条漫加载步进</span>
          <input 
            type="number" 
            v-model="userConfig.flowLoadStep" 
            @change="save" 
            class="ta-input-number"
            min="1"
            max="10"
          />
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">封面加载并发数</span>
          <input 
            type="number" 
            v-model="userConfig.loadCoverConcurrency" 
            @change="save" 
            class="ta-input-number"
            min="1"
            max="10"
          />
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">图片缓存数量限制</span>
          <input 
            type="number" 
            v-model="userConfig.imageCacheLimit" 
            @change="save" 
            class="ta-input-number"
            min="0"
          />
          <span class="ta-setting-note">(0表示无限制)</span>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">漫画页面容量</span>
          <input 
            type="number" 
            v-model="mangaPageSize" 
            @change="savePageSize" 
            class="ta-input-number"
            min="0"
          />
          <span class="ta-setting-note">(0使用默认值)</span>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">章节页面容量</span>
          <input 
            type="number" 
            v-model="chapterPageSize" 
            @change="savePageSize" 
            class="ta-input-number"
            min="0"
          />
          <span class="ta-setting-note">(0使用默认值)</span>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="ta-setting-card">
        <h3>高级设置</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">顶栏切换范围</span>
          <div class="ta-slider-container">
            <input 
              type="range" 
              v-model="userConfig.browseOperationTop" 
              min="10" 
              max="50" 
              @change="save"
              class="ta-slider"
            />
            <span class="ta-slider-value">{{ userConfig.browseOperationTop }}%</span>
          </div>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">页码切换范围</span>
          <div class="ta-slider-container">
            <input 
              type="range" 
              v-model="userConfig.browseOperationBottom" 
              min="10" 
              max="50" 
              @change="save"
              class="ta-slider"
            />
            <span class="ta-slider-value">{{ userConfig.browseOperationBottom }}%</span>
          </div>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">全屏模式</span>
          <button class="ta-btn-secondary" @click="toggleFullscreen">切换全屏</button>
        </div>
      </div>

      <!-- 账户信息 -->
      <div class="ta-setting-card">
        <h3>账户信息</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">用户名</span>
          <span class="ta-setting-value">{{ userInfo.userName }}</span>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">用户ID</span>
          <span class="ta-setting-value">{{ userInfo.userId }}</span>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">用户头像</span>
          <div class="ta-avatar-container">
            <div class="ta-avatar">{{ userInfo.userName?.charAt(0) || 'U' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="ta-setting-footer">
      <button class="ta-btn-primary" @click="saveAll">保存所有设置</button>
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
</script>

<style scoped>
.ta-setting {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  min-height: 100%; /* 改为相对高度以确保在父元素内 */
  box-sizing: border-box;
}

.ta-page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.ta-page-head h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.ta-btn-logout {
  padding: 8px 16px;
  font-size: 14px;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.ta-btn-logout:hover {
  background: #fee2e2;
}

.ta-setting-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 0; /* 移除底部margin，由吸底按钮处理 */
  padding-bottom: 0; /* 移除底部padding，由吸底按钮处理 */
}

.ta-setting-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ta-setting-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #1f2937;
}

.ta-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.ta-setting-row:last-child {
  border-bottom: none;
}

.ta-setting-label {
  font-size: 15px;
  color: #4b5563;
  flex: 1;
}

.ta-setting-value {
  font-size: 15px;
  color: #111827;
  font-weight: 500;
}

.ta-setting-note {
  font-size: 13px;
  color: #9ca3af;
  margin-left: 8px;
}

.ta-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  color: #1f2937;
}

.ta-input-number {
  width: 80px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.ta-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ta-slider {
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.ta-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
}

.ta-slider-value {
  font-size: 14px;
  color: #6b7280;
  min-width: 50px;
}

.ta-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.ta-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.ta-switch-slider {
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

.ta-switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.ta-switch input:checked + .ta-switch-slider {
  background-color: #2563eb;
}

.ta-switch input:checked + .ta-switch-slider:before {
  transform: translateX(20px);
}

.ta-theme-options {
  display: flex;
  gap: 8px;
}

.ta-theme-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.ta-theme-btn:hover {
  border-color: #2563eb;
}

.ta-theme-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.ta-avatar-container {
  display: flex;
  align-items: center;
}

.ta-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  font-size: 20px;
  border-radius: 50%;
}

.ta-btn-primary {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.ta-btn-primary:hover {
  background: #1d4ed8;
}

.ta-btn-secondary {
  padding: 8px 16px;
  font-size: 14px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.ta-btn-secondary:hover {
  background: #e5e7eb;
}

.ta-setting-footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #eaeaea;
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
  margin: 0 -24px -24px -24px; /* 抵消父元素的padding，确保按钮占满宽度 */
  position: -webkit-sticky; /* Safari兼容 */
}

@media (max-width: 768px) {
  .ta-setting {
    padding: 16px;
  }
  
  .ta-setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .ta-setting-label {
    margin-bottom: 4px;
  }
  
  .ta-theme-options {
    flex-wrap: wrap;
  }
  
  .ta-setting-footer {
    padding: 12px 16px;
    margin: 0 -16px -16px -16px; /* 移动端也抵消父元素padding */
  }
  
  .ta-setting-groups {
    padding-bottom: 0; /* 移动端不需要额外padding */
  }
}
</style>