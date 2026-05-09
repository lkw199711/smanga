<template>
  <div class="ta-setting">
    <div class="ta-page-head"><h1>用户设置</h1></div>
    <div class="ta-setting-groups">
      <!-- UI 主题 -->
      <div class="ta-setting-card">
        <h3>界面主题</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">UI 风格</span>
          <div class="ta-theme-options">
            <button :class="['ta-theme-btn', { active: themeState.current === 'A' }]" @click="setTheme('A')">A 简约</button>
            <button :class="['ta-theme-btn', { active: themeState.current === 'B' }]" @click="setTheme('B')">B 漫画</button>
            <button :class="['ta-theme-btn', { active: themeState.current === 'D' }]" @click="setTheme('D')">D 多主题</button>
          </div>
        </div>
      </div>

      <!-- 阅读设置 -->
      <div class="ta-setting-card">
        <h3>阅读设置</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">翻页方向反转</span>
          <input type="checkbox" v-model="userConfig.pageTurningReverse" @change="save" />
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">显示页码</span>
          <input type="checkbox" v-model="userConfig.showPageNumber" @change="save" />
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">滑动翻页</span>
          <input type="checkbox" v-model="userConfig.enableTouchPageChange" @change="save" />
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">翻页动画</span>
          <input type="checkbox" v-model="userConfig.enablePageAnimation" @change="save" />
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">条漫自动加载</span>
          <input type="checkbox" v-model="userConfig.loadAllFlowIamge" @change="save" />
        </div>
      </div>

      <!-- 显示设置 -->
      <div class="ta-setting-card">
        <h3>显示设置</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">语言</span>
          <select v-model="userConfig.language" @change="save">
            <option value="zhCn">中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">侧边栏媒体库列表</span>
          <input type="checkbox" v-model="userConfig.showSidebarMediaList" @change="save" />
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">章节列表简洁模式</span>
          <input type="checkbox" v-model="userConfig.simpleChapterView" @change="save" />
        </div>
      </div>

      <!-- 账户 -->
      <div class="ta-setting-card">
        <h3>账户信息</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">用户名</span>
          <span class="ta-setting-value">{{ userInfo.userName }}</span>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">用户头像</span>
          <div class="ta-avatar-placeholder">{{ userInfo.userName?.charAt(0) || 'U' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { userConfig, userInfo } from '@/store'
import { themeState, setTheme } from '@/themes/store'
import userApi from '@/api/account'

async function save() {
  try {
    await userApi.update_user_config(userConfig)
  } catch (e) { /* empty */ }
}
</script>

<style scoped>
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }

.ta-setting-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 680px;
}

.ta-setting-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 20px 24px;
}

.ta-setting-card h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #111827;
}

.ta-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.ta-setting-row:last-child {
  border-bottom: none;
}

.ta-setting-label {
  font-size: 13px;
  color: #4b5563;
}

.ta-setting-value {
  font-size: 13px;
  color: #111827;
  font-weight: 500;
}

.ta-setting-row select {
  padding: 5px 10px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  font-size: 13px;
}

.ta-setting-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.ta-theme-options {
  display: flex;
  gap: 6px;
}

.ta-theme-btn {
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.ta-theme-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.ta-avatar-placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  border-radius: 50%;
}
</style>
