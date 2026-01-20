<template>
  <div class="manga-list">
    <div class="title">继续阅读</div>
    <div :class="['manga-list-box', {block: config.viewType === 'list'}]">
      <manga v-for="item in latestList" :key="item.latestId" :viewType="config.viewType" :mangaInfo="item" @contextmenu.prevent="context_menu(item)" />
    </div>
  </div>

  <!--功能菜单-->
  <rightSidebar :mangaInfo="mangaInfo" v-model:rightSidebarVisible="rightSidebarVisible" @reload="page_change" />
</template>

<script setup lang="ts">
import store, {config} from '@/store';
import {onMounted, ref} from 'vue';
import latestApi from '@/api/latest';
import {latestType} from '@/type/latest';
import manga from '@/components/manga.vue';
import { mangaType } from '@/type/manga';
import rightSidebar from '@/views/manga-list/right-sidebar.vue';

let latestList = ref<latestType[]>([]);
let mangaInfo = ref<mangaType>();
let rightSidebarVisible = ref(false);
/**
 * 打开右侧菜单
 */
function context_menu(mangaInfoProps: any) {
	mangaInfo.value = mangaInfoProps;
	rightSidebarVisible.value = true;
}

async function page_change() {
  let pageSize = 10;
  switch (config.screenType) {
    case '4k':
      pageSize = 36;
      break;
    case '2k':
      pageSize = 36;
      break;
    case 'large':
      pageSize = 12;
      break;
    case 'middle':
      pageSize = 6;
      break;
    case 'tablet':
      pageSize = 10;
      break;
    case 'small':
      pageSize = 6;
      break;
    case 'mini':
      pageSize = 6;
      break;
    default:
      pageSize = 10;
      break;
  }
  latestList.value = await latestApi.get(1, pageSize);
}

onMounted(() => {
  page_change();
});
</script>
<style lang="less" scoped>
.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.5rem 0;
  padding-left: 1rem;
  color: @s-text;
}
</style>
<style src="@/style/manga-list.less" scoped lang="less"></style>
