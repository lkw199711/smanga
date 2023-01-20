<template>
  <div class="right-sidebar">
    <el-drawer
        v-model="drawer"
        size="auto"
        :with-header="false"
        :before-close="close_sidebar"
    >
      <el-menu
          class="right-sidebar-menu"
          active-text-color="#ffd04b"
          background-color="#545c64"
          text-color="#fff"
          @select="menu_select"
      >
        <!--封面-->
        <img class="poster" :src="blob" alt="漫画封面">
        <!--名称-->
        <p class="title">{{ chapterName }}</p>
        <!--操作-->
        <!--<el-menu-item index="read"><el-icon><Memo /></el-icon>阅读</el-menu-item>-->
        <!--<el-menu-item index="collection"><el-icon><Collection /></el-icon>收藏</el-menu-item>-->
        <el-menu-item index="remove">
          <el-icon>
            <TopRight/>
          </el-icon>
          移除
        </el-menu-item>
        <el-menu-item index="delete">
          <el-icon>
            <Delete/>
          </el-icon>
          删除
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<script lang='ts' setup>
import {watch, ref, defineProps, defineEmits, computed} from 'vue'
import {useRoute} from "vue-router";
import {config} from "@/store";
import {delete_chapter} from "@/api/chapter";
import {ElMessageBox} from "element-plus";

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
    case 'remove':
      ElMessageBox.confirm('确认移除该漫画?', {type: 'warning'}).then(async () => {
        await delete_chapter(chapterId.value);
        emit('reload');
      });

      break;
    case 'delete':
      ElMessageBox.confirm('确认移除该漫画并删除源文件?', {type: 'warning'}).then(async () => {
        await delete_chapter(chapterId.value, true);
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
