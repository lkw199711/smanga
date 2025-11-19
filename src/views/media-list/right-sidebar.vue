<template>
  <div class="right-sidebar">
    <el-drawer v-model="rightSidebarVisible" size="auto" :with-header="false">
      <!-- 安卓端占位 -->
      <android-seat />
      <el-menu class="right-sidebar-menu" active-text-color="#ffd04b" background-color="#545c64" text-color="#fff"
        @select="menu_select">
        <!--封面-->
        <img class="poster" :src="blob" alt="漫画封面" />
        <!--名称-->
        <p class="title">{{ props.mediaInfo.mediaName }}</p>
        <!--操作-->
        <el-menu-item index="remove" v-if="isAdmin">
          <el-icon>
            <TopRight />
          </el-icon>
          {{ $t('option.remove') }}
        </el-menu-item>
        <el-menu-item index="delete" v-if="isAdmin">
          <el-icon>
            <Delete />
          </el-icon>
          {{ $t('option.delete') }}
        </el-menu-item>

        <el-menu-item index="scan" v-if="isAdmin">
          <el-icon>
            <Files />
          </el-icon>
          {{ $t('mediaList.scanMedia') }}
        </el-menu-item>

        <el-menu-item index="share" v-if="isAdmin">
          <el-icon>
            <Share />
          </el-icon>
          {{ $t('mediaList.shareMedia') }}
        </el-menu-item>
        <el-menu-item index="edit" v-if="isAdmin">
          <el-icon>
            <Edit />
          </el-icon>
          {{ $t('rightSidebar.editMedia') }}
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <media-edit v-model:editMediaDialog="editMediaDialog" edit-model="modify" :media-info="props.mediaInfo" @reload="emit('reload', browse.mangaListPage, browse.mangaListPageSize)" />

    <el-dialog :title="$t('mangaInfo.mangaShareDialogTitle')" v-model="mangaShareDialog">
      <mangaShare :mediaInfo="props.mediaInfo" @close_dialog="mangaShareDialog = false" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, computed, onMounted } from 'vue';
import i18n from '@/i18n';
import imageApi from '@/api/image';
import useBrowseStore from '@/store/browse';
import androidSeat from '@/layout/components/android-seat.vue';
import mangaShare from '@/components/share.vue';
import mediaApi from '@/api/media';
import { Cookies } from '@/utils';
import mediaEdit from '@/views/media-manage/components/mediaEdit.vue';

const browse = useBrowseStore();
const placeholder = require('@/assets/s-blue.png');

const { t } = i18n.global;
const mangaShareDialog = ref(false);
const blob = ref('');

const rightSidebarVisible = defineModel('rightSidebarVisible');
const editMediaDialog = ref(false);
const props = defineProps(['mediaInfo']);
const emit = defineEmits(['reload', 'close']);

const isAdmin = computed(() => {
  return Cookies.get('role') === 'admin';
});

watch(
  () => props.mediaInfo?.mediaCover,
  async (mangaCover) => {
    if (mangaCover) {
      blob.value = await imageApi.get({file: mangaCover});
    } else {
      blob.value = placeholder;
    }
  }
);

/**
 * @description: 右侧菜单项选择事件
 * @param {*} key
 * @return {*}
 */
async function menu_select(key: string) {
  switch (key) {
    case 'remove':
      ElMessageBox.confirm(t('mediaList.remove'), { type: 'warning' })
        .then(async () => {
          await mediaApi.delete_media(props.mediaInfo.mediaId);
          emit('reload', browse.mangaListPage, browse.mangaListPageSize);
        })
        .catch();

      break;
    case 'delete':
      ElMessageBox.confirm(t('mediaList.delete'), {
        type: 'warning',
      }).then(async () => {
        await mediaApi.delete_media(props.mediaInfo.mediaId, true);
        emit('reload', browse.mangaListPage, browse.mangaListPageSize);
      });

      break;
    case 'scan':
      await mediaApi.scan(props.mediaInfo.mediaId);
      emit('reload', browse.mangaListPage, browse.mangaListPageSize);
      break;
    case 'share':
      mangaShareDialog.value = true;
      break;
    case 'edit':
      editMediaDialog.value = true;
      break;

  }
  rightSidebarVisible.value = false;
}
</script>

<style scoped lang="less" src="@/style/right-sidebar.less"></style>
