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
        <el-menu-item v-if="idDouble" index="remove-first">{{ removeFirstTitle }}</el-menu-item>
        <el-menu-item index="bookmark">{{ bookmarkTitle }}</el-menu-item>
        <el-menu-item v-if="idDouble" index="direction">{{$t('option.direction')}} ({{ directionTitle }})</el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<script lang='ts' setup>
import {watch, ref, defineProps, defineEmits, computed} from 'vue'
import {useRoute} from "vue-router";
import {cache, config} from "@/store";
import {add_bookmark, delete_bookmark, get_bookmark} from "@/api/bookmark";
import {global_get, global_set_json} from "@/utils";
import i18n from '@/i18n';

const {t} = i18n.global;

const route = useRoute();

const drawer = ref(false)

const props = defineProps(['rightSidebar', 'direction', 'removeFirst']);
const emit = defineEmits(['contextMenu', 'direction', 'removeFirst'])

const removeFirstTitle = computed(() => {
  return props.removeFirst ? t('option.recoveryFirst') : t('option.removeFirst');
});

const bookmarkTitle = computed(() => {
  return config.bookmarkShow ? t('bookmarkManage.remove') : t('bookmarkManage.add');
});

const directionTitle = computed(() => {
  return props.direction ? t('option.rtl') : t('option.ltr');
});

const idDouble = computed(() => {
  return route.name === 'double'
});

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
    case 'bookmark':
      bookmark();
      break;
    case 'direction':
      emit('direction');
      break;
    case 'remove-first':
      emit('removeFirst');
      break;
  }
  close_sidebar();
}

async function bookmark() {
  if (config.bookmarkShow) {
    await delete_bookmark(cache.bookmarkId);
  } else {
    // 区分单双页
    let page = Number(global_get('page'));
    if (route.name === 'double') {
      page = page * 2 - 1;
    }

    await add_bookmark(page);
  }
  const res = await get_bookmark();

  global_set_json('bookmarkList', res.data.list);
}
</script>

<style scoped lang='less'>
.right-sidebar-menu {
  width: 32rem;
  max-width: 70vw;
  height: 100%;
  background-color: #545c64;
}
</style>
