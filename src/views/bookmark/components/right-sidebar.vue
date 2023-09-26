<template>
  <div class="right-sidebar">
    <el-drawer v-model="drawer" size="auto" :with-header="false" :before-close="close_sidebar">
      <!-- 安卓端顶部占位 -->
      <div class="android-seat-top" v-if="config.android" />
      <el-menu class="right-sidebar-menu" active-text-color="#ffd04b" background-color="#545c64" text-color="#fff"
        @select="menu_select">
        <!--封面-->
        <img class="poster" :src="blob" alt="漫画封面">
        <!--名称-->
        <p class="title">{{ chapterName }}</p>
        <!--操作-->
        <!--<el-menu-item index="read"><el-icon><Memo /></el-icon>阅读</el-menu-item>-->
        <!--<el-menu-item index="collection"><el-icon><Collection /></el-icon>收藏</el-menu-item>-->
        <el-menu-item index="delete">
          <el-icon>
            <Delete />
          </el-icon>
          {{ $t('option.delete') }}
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<script lang='ts' setup>
import { watch, ref, defineProps, defineEmits, computed } from 'vue'
import { useRoute } from "vue-router";
import { config } from "@/store";
import { delete_bookmark } from "@/api/bookmark";
import { ElMessageBox } from "element-plus";
import i18n from '@/i18n';
const { t } = i18n.global;

const route = useRoute();

const drawer = ref(false)

const props = defineProps(['info', 'menuPoster']);
const emit = defineEmits(['reload'])

const chapterName = computed(() => {
  return props.info.chapterName
});

const chapterId = computed(() => {
  return props.info.chapterId
})

const bookmarkId = computed(() => {
  return props.info.bookmarkId
})

const blob = computed(() => {
  return props.menuPoster
})

watch(
  () => config.rightSidebar,
  (val) => {
    drawer.value = val;
  }
)

function close_sidebar() {
  config.rightSidebar = false;
}

function menu_select(key: string) {
  switch (key) {
    case 'delete':
      ElMessageBox.confirm(t('bookmarkManage.confirm.text'), { type: 'warning' }).then(async () => {
        await delete_bookmark(bookmarkId.value);
        emit('reload');
      });

      break;
  }
  close_sidebar();
}
</script>

<style scoped lang='less'>
.right-sidebar-menu {
  width: 32rem;
  max-width: 70vw;
  height: 100%;
  background-color: #545c64;
}

.poster {
  width: 100%;
  max-height: 50%;
  object-fit: cover;
}

.title {
  padding: 1rem 1rem 2rem;
  color: @button-back;
  font-size: 1.6rem;
}
</style>
