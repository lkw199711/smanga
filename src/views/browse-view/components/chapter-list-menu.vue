<template>
  <div class="chapter-list-menu">
    <!--目录列表-->
    <el-drawer v-model="popup" size="auto" direction="ltr" :with-header="false">
      <!-- 顶部占位符 -->
      <div class="top-seat" v-if="config.android"></div>
      <el-menu class="chapter-list" active-text-color="#ee0a24" :default-active="String(browse.currentChapterIndex)"
        @select="change_chapter">
        <el-menu-item v-for="(chapter, index) in browse.chapterList" :index="String(index)" :key="chapter.chapterId">{{ chapter.chapterName }}
          <!--已读图标-->
          <i class="iconfont icon-success-fill icon-is-read" v-if="chapter.latest?.finish" />
        </el-menu-item>
        <seat height="4rem" />
      </el-menu>

      <!--翻页按钮-->
      <div class="btn-box" v-show="popup">
        <el-button class="btn" type="warning" plain @click.stop="before">{{ $t('page.before') }}</el-button>
        <el-button class="btn" type="success" plain @click.stop="next">{{ $t('page.next') }}</el-button>
      </div>
    </el-drawer>


    <!--目录按钮-->
    <div v-show="config.browseTop" class="show-menu-btn" @click.stop="button_click">
      <i class="colour colour-mulu" />
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'chapter-list-menu' };
</script>
<script setup lang='ts'>
import { ref } from 'vue';
import { config } from "@/store";
import Seat from "@/components/seat.vue";
import useBrowseStore from '@/store/browse';
const browse = useBrowseStore();

const emit = defineEmits(['change_chapter', 'before_chapter', 'next_chapter']);

let popup = ref(false);

function change_chapter(index: string) {
  emit('change_chapter', browse.chapterList[index].chapterId);
}
function before() {
  emit('before_chapter');
}
function next() {
  emit('next_chapter');
}
function button_click() {
  popup.value = true;
}
</script>

<style scoped lang='less'>
.top-seat {
  height: 4rem;
  background-color: @s-background;
}

// 使抽屉滚动
:deep(.el-drawer__body) {
  overflow-y: auto;
}

:deep(.is-active) {
  background-color: @button-back;
}

:deep(.el-menu-item) {
  line-height: initial;
  white-space: break-spaces;
}

// 菜单列表
.chapter-list {
  width: 60rem;
  max-width: 70vw;
  min-height: 100vh;
}

// 翻页按钮
.btn-box {
  position: fixed;
  bottom: 0;
  display: flex;
  width: 60rem;
  max-width: 70vw;
  //z-index: 100;
  transition: .15s;

  .btn {
    margin: 0;
    width: 50%;
    height: 4rem;
  }
}

// 展开按钮
.show-menu-btn {
  position: fixed;
  top: 10rem;
  left: 4rem;
  width: 5rem;
  height: 5rem;
  line-height: 5rem;
  text-align: center;
  background-color: @button-back;
  border-radius: 100%;
  opacity: .7;
  z-index: 1;

  i {
    color: #fff;
    font-size: 2.6rem;
  }
}

.icon-is-read {
  margin-left: 2.4rem;
  transform: translateY(.1rem);
  color: @s-isread;
}
</style>
