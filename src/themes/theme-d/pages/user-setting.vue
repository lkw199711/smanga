<template>
  <div class="td-user-setting">
    <h2 class="td-page-title">用户设置</h2>
    <div class="td-form-card">
      <div class="td-avatar-section">
        <div class="td-avatar">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
        </div>
        <span class="td-avatar-hint">头像功能开发中</span>
      </div>
      <div class="td-form-group">
        <label>用户名</label>
        <input class="td-input" v-model="form.username" />
      </div>
      <div class="td-form-group">
        <label>旧密码</label>
        <input class="td-input" type="password" v-model="form.oldPassword" />
      </div>
      <div class="td-form-group">
        <label>新密码</label>
        <input class="td-input" type="password" v-model="form.newPassword" />
      </div>
      <button class="td-btn" @click="save">保存</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({ username: '', oldPassword: '', newPassword: '' })
function save() { /* TODO */ alert('保存成功(空壳)') }
</script>

<style scoped>
.td-user-setting { max-width: 500px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-form-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.td-avatar-section { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.td-avatar { width: 60px; height: 60px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; }
.td-avatar-hint { font-size: 12px; color: var(--fg2); }
.td-form-group { margin-bottom: 16px; }
.td-form-group label { display: block; font-size: 13px; color: var(--fg2); margin-bottom: 6px; }
.td-input { width: 100%; height: 36px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); font-size: 14px; outline: none; box-sizing: border-box; }
.td-input:focus { border-color: var(--accent); }
.td-btn { padding: 8px 24px; border-radius: 8px; background: var(--accent); color: #fff; border: none; font-size: 14px; cursor: pointer; }
.td-btn:hover { opacity: 0.85; }
</style>
