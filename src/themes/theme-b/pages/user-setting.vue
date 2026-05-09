<template><div class="tb-page"><h1>用户设置</h1><div class="tb-card"><h3>主题切换</h3><div class="tb-row"><button :class="{active:themeState.current==='A'}" @click="setTheme('A')">A 简约</button><button :class="{active:themeState.current==='B'}" @click="setTheme('B')">B 漫画</button><button :class="{active:themeState.current==='D'}" @click="setTheme('D')">D 多主题</button></div></div><div class="tb-card"><h3>阅读设置</h3><div class="tb-row"><label><input type="checkbox" v-model="userConfig.showPageNumber" />显示页码</label></div><div class="tb-row"><label><input type="checkbox" v-model="userConfig.enablePageAnimation" />翻页动画</label></div><div class="tb-row"><label><input type="checkbox" v-model="userConfig.enableTouchPageChange" />滑动翻页</label></div></div></div></template>
<script lang="ts" setup>
import { userConfig } from '@/store'
import { themeState, setTheme } from '@/themes/store'
</script>
<style scoped>
h1{font-size:20px;font-weight:700;margin:0 0 20px;color:#fff}
.tb-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 24px;margin-bottom:16px}
.tb-card h3{font-size:14px;font-weight:600;color:#fff;margin:0 0 14px}
.tb-row{display:flex;gap:8px;margin-bottom:10px;align-items:center}
.tb-row button{padding:8px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:20px;color:#fff;cursor:pointer;font-size:12px}
.tb-row button.active{background:linear-gradient(135deg,#a855f7,#ec4899);border-color:transparent}
.tb-row label{font-size:13px;color:rgba(255,255,255,0.8);display:flex;align-items:center;gap:8px}
.tb-row input[type="checkbox"]{width:16px;height:16px}
</style>
