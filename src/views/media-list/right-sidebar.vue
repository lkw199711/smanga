<template>
  <div class="right-sidebar">
    <el-drawer v-model="props.rightSidebarVisible" size="auto" :with-header="false" :before-close="close_sidebar">
      <!-- 安卓端占位 -->
      <android-seat />
      <el-menu class="right-sidebar-menu" active-text-color="#ffd04b" background-color="#545c64" text-color="#fff"
        @select="menu_select">
        <!--封面-->
        <img class="poster" :src="blob" alt="漫画封面" />
        <!--名称-->
        <p class="title">{{ props.mediaInfo.mediaName }}</p>
        <!--操作-->
        <el-menu-item index="remove">
          <el-icon>
            <TopRight />
          </el-icon>
          {{ $t('option.remove') }}
        </el-menu-item>
        <el-menu-item index="delete">
          <el-icon>
            <Delete />
          </el-icon>
          {{ $t('option.delete') }}
        </el-menu-item>

        <el-menu-item index="scan">
          <el-icon>
            <Files />
          </el-icon>
          {{ $t('mediaList.scanMedia') }}
        </el-menu-item>

        <el-menu-item index="share">
          <el-icon>
            <Share />
          </el-icon>
          {{ $t('mediaList.shareMedia') }}
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <el-dialog :title="$t('mangaInfo.mangaShareDialogTitle')" v-model="mangaShareDialog">
      <mangaShare :mediaInfo="mediaInfo" @close_dialog="mangaShareDialog = false" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import mangaApi from '@/api/manga';
import { ElMessageBox } from 'element-plus';
import i18n from '@/i18n';
import imageApi from '@/api/image';
import useBrowseStore from '@/store/browse';
import androidSeat from '@/layout/components/android-seat.vue';
import mangaShare from '@/components/share.vue';
import mediaApi from '@/api/media';
const browse = useBrowseStore();
const placeholder = require('@/assets/s-blue.png');

const { t } = i18n.global;
const route = useRoute();
const mangaShareDialog = ref(false);
const blob = ref('');


const props = defineProps(['mediaInfo', 'rightSidebarVisible']);
const emit = defineEmits(['reload', 'close']);

const mediaId = computed(() => {
  return props.mediaInfo.mediaId;
});

watch(
  () => props.mediaInfo?.mediaId,
  async (mangaId) => {
    const mangaCover = props.mediaInfo?.mediaCover;
    if (mangaCover) {
      blob.value = await imageApi.get(mangaCover);
    } else {
      blob.value = placeholder;
    }
  }
);

/**
 * @description: 关闭右侧菜单
 * @return {*}
 */
function close_sidebar() {
  emit('close');
}

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
          await mediaApi.delete_media(mediaId.value);
          emit('reload', browse.mangaListPage, browse.mangaListPageSize);
        })
        .catch();

      break;
    case 'delete':
      ElMessageBox.confirm(t('mediaList.delete'), {
        type: 'warning',
      }).then(async () => {
        await mediaApi.delete_media(mediaId.value, true);
        emit('reload', browse.mangaListPage, browse.mangaListPageSize);
      });

      break;
    case 'scan':
      await mediaApi.scan(mediaId.value);
      emit('reload', browse.mangaListPage, browse.mangaListPageSize);
      break;
    case 'share':
      mangaShareDialog.value = true;
      break;

  }
  close_sidebar();
}
</script>

<style scoped lang="less" src="@/style/right-sidebar.less"></style>
