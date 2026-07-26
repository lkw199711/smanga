<template>
  <div class="chapter-list-menu">
    <el-drawer
      v-model="popup"
      size="auto"
      direction="ltr"
      :with-header="false"
      append-to-body
      :z-index="3000"
      modal-class="chapter-list-drawer-modal"
      class="chapter-list-drawer"
    >
      <div class="top-seat" v-if="config.android"></div>
      <el-menu class="chapter-list" active-text-color="#ee0a24" :default-active="String(browse.currentChapterIndex)"
        @select="change_chapter">
        <el-menu-item v-for="(chapter, index) in browse.chapterList" :index="String(index)" :key="chapter.chapterId">{{ chapter.chapterName }}
          <i class="iconfont icon-success-fill icon-is-read" v-if="chapter.latest?.finish" />
        </el-menu-item>
        <seat height="4rem" />
      </el-menu>

      <div class="btn-box" v-show="popup">
        <el-button class="btn" type="warning" plain @click.stop="before">{{ $t('page.before') }}</el-button>
        <el-button class="btn" type="success" plain @click.stop="next">{{ $t('page.next') }}</el-button>
      </div>
    </el-drawer>

    <div
      v-show="config.browseTop && !hideLegacyBtn"
      class="show-menu-btn"
      @click.stop="button_click"
    >
      <i class="colour colour-mulu" />
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'chapter-list-menu' };
</script>
<script setup lang='ts'>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { config } from "@/store";
import Seat from "@/components/seat.vue";
import useBrowseStore from '@/store/browse';
const browse = useBrowseStore();
const route = useRoute();

const emit = defineEmits(['change_chapter', 'before_chapter', 'next_chapter']);

let popup = ref(false);

// 走 legacy-reader-bridge (路由 t-reader) 的阅读页, 顶栏统一入口, 隐藏自身左侧圆按钮
const hideLegacyBtn = computed(() => route.name === 't-reader');

// 外部 (topbar / right-sidebar / control-panel) 通过 config.chapterList 唤起
watch(
  () => (config as any).chapterList,
  (val) => {
    popup.value = !!val;
  }
);
watch(popup, (val) => {
  if (!val) (config as any).chapterList = false;
});

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

.chapter-list {
  width: 60rem;
  max-width: 70vw;
  min-height: 100vh;
}

.btn-box {
  position: fixed;
  bottom: 0;
  display: flex;
  width: 60rem;
  max-width: 70vw;
  transition: .15s;

  .btn {
    margin: 0;
    width: 50%;
    height: 4rem;
  }
}

.show-menu-btn {
  position: fixed;
  top: calc(10rem + env(safe-area-inset-top));
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

<!-- append-to-body 后 el-drawer 挂到 body, 保证覆盖 imagesLoader 的 z-index:2000 遮罩 -->
<style lang="less">
.chapter-list-drawer-modal {
  z-index: 3000 !important;
}
.chapter-list-drawer {
  z-index: 3001 !important;
}
</style>