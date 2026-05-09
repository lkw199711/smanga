<template>
  <div class="ta-reader-layout">
    <header class="ta-reader-top" v-show="showControls">
      <button class="ta-reader-btn" @click="router.back()">← 返回</button>
      <div class="ta-reader-title">{{ globalData.mangaName }} - {{ globalData.chapterName }}</div>
      <button class="ta-reader-btn" @click="showChapters = !showChapters">目录</button>
    </header>
    <div class="ta-reader-body" @click="showControls = !showControls">
      <router-view />
    </div>
    <footer class="ta-reader-bottom" v-show="showControls">
      <button class="ta-reader-btn" @click="prevChapter">上一章</button>
      <span class="ta-reader-page">{{ globalData.page + 1 }}</span>
      <button class="ta-reader-btn" @click="nextChapter">下一章</button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { globalData } from '@/store'

const router = useRouter()
const showControls = ref(true)
const showChapters = ref(false)

function prevChapter() {
  // placeholder
}

function nextChapter() {
  // placeholder
}
</script>

<style scoped>
.ta-reader-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #111;
  color: #fff;
}

.ta-reader-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.ta-reader-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
  text-align: center;
}

.ta-reader-body {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ta-reader-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.ta-reader-btn {
  padding: 6px 14px;
  font-size: 13px;
  color: #fff;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  cursor: pointer;
}

.ta-reader-page {
  font-size: 13px;
  color: #9ca3af;
}
</style>
