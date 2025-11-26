<template>
  <div class="right-sidebar">
    <el-drawer v-model="rightSidebarVisible" size="auto" :with-header="false">
      <!-- 安卓端占位 -->
      <android-seat />
      <el-menu class="right-sidebar-menu" active-text-color="#ffd04b" background-color="#545c64" text-color="#fff" @select="menu_select">
        <!--封面-->
        <img class="poster" :src="blob" alt="漫画封面" />
        <!--名称-->
        <p class="title">{{ props.chapterInfo?.chapterName }}</p>
        <!--操作-->
        <el-menu-item index="remove" v-if="isAdmin">
          {{ $t('option.remove') }}
        </el-menu-item>
        <el-menu-item index="delete" v-if="isAdmin">
          {{ $t('option.delete') }}
        </el-menu-item>
        <el-menu-item index="collect">
          {{ isCollect ? $t('option.removeCollect') : $t('option.collect') }}
        </el-menu-item>
        <el-menu-item index="alreadyRead">
          {{ alreadyRead ? $t('option.markAsUnRead') : $t('option.markAsRead') }}
        </el-menu-item>
        <el-menu-item index="edit" v-if="isAdmin">
          {{ $t('rightSidebar.editChapter') }}
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>

  <chapter-modify
    :chapterInfo="props.chapterInfo"
    v-model:editChapterDialog="editChapterDialog"
    @close="() => (editChapterDialog = false)"
    @reload="() => emit('reload')"></chapter-modify>
</template>

<script lang="ts" setup>
import {watch, ref, computed} from 'vue';
import chapterApi from '@/api/chapter';
import i18n from '@/i18n';
import collectApi from '@/api/collect';
import imageApi from '@/api/image';
import historyApi from '@/api/history';
import latestApi from '@/api/latest';
import useBrowseStore from '@/store/browse';
import androidSeat from '@/layout/components/android-seat.vue';
import {Cookies} from '@/utils';
import chapterModify from '@/views/chapter-manage/components/chapterModify.vue';
import placeholder from '@/assets/s-blue.png';

const browse = useBrowseStore();
const {t} = i18n.global;
const isCollect = ref(false);
const blob = ref('');

/* 可以使用computed的get set来处理v-model:rightSidebarVisible的变化 进行多层的v-model绑定
const props = defineProps(['chapterInfo', 'rightSidebarVisible']);
const emit = defineEmits(['reload', 'close', 'update:rightSidebarVisible']);

const rightSidebarVisible = computed({
  get: () => props.rightSidebarVisible,
  set: visible => {
    emit('update:rightSidebarVisible', visible);
  },
});
*/
// Vue 3.4+ 推荐使用defineModel宏，它会自动处理prop和update事件
const rightSidebarVisible = defineModel('rightSidebarVisible');
const props = defineProps(['chapterInfo']);
const emit = defineEmits(['reload', 'close']);

const alreadyRead = computed(() => {
  return props.chapterInfo?.latest?.finish;
});

const editChapterDialog = ref(false);

const chapterId = computed(() => {
  return props.chapterInfo.chapterId;
});

const isAdmin = computed(() => {
  return Cookies.get('role') === 'admin';
});

watch(
  () => props.chapterInfo?.chapterId,
  async chapterId => {
    isCollect.value = await collectApi.is_collect('chapter', chapterId);
    const chapterCover = props.chapterInfo?.chapterCover;
    if (chapterCover) {
      blob.value = await imageApi.get({file: chapterCover});
    } else {
      blob.value = placeholder;
    }
  }
);

async function menu_select(key: string) {
  const chapterInfo = props.chapterInfo;

  switch (key) {
    case 'remove':
      ElMessageBox.confirm(t('chapterManage.confirm.text1'), {
        type: 'warning',
      }).then(async () => {
        await chapterApi.delete_chapter(chapterId.value);
        emit('reload', browse.chapterListPage, browse.chapterListPageSize);
      });

      break;
    case 'delete':
      ElMessageBox.confirm(t('chapterManage.confirm.text2'), {
        type: 'warning',
      }).then(async () => {
        await chapterApi.delete_chapter(chapterId.value, true);
        emit('reload', browse.chapterListPage, browse.chapterListPageSize);
      });
      break;
    case 'collect':
      if (isCollect.value) {
        await collectApi.remove_collect('chapter', chapterId.value);
      } else {
        await collectApi.add_collect(
          Object.assign(chapterInfo, {
            collectType: 'chapter',
          })
        );
      }
      // 更新收藏状态
      isCollect.value = await collectApi.is_collect('chapter', chapterId.value);
      break;
    case 'alreadyRead':
      if (alreadyRead.value) {
        await historyApi.delete(chapterId.value);
        await latestApi.delete(chapterId.value);
      } else {
        await historyApi.add(chapterInfo);
        await latestApi.add({
          chapterId: chapterId.value,
          mangaId: chapterInfo.mangaId,
          finish: true,
          page: 0,
          count: 0,
        });
      }
      emit('reload', browse.chapterListPage, browse.chapterListPageSize);
    case 'edit':
      editChapterDialog.value = true;
      break;
  }

  // sidebar 关闭
  rightSidebarVisible.value = false;
}
</script>

<style scoped lang="less">
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
