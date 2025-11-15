<template>
  <div class="manga-setting-box manage-container">
    <!-- 表头按钮 -->
    <div class="btn-box">
      <el-button class="add-btn" type="primary" :icon="Plus" @click="dialog_open">{{ $t('mangaSync.addSync') }}</el-button>
    </div>

    <!--表格-->
    <el-table :data="tableData" stripe border>
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>

      <el-table-column prop="syncType" :label="t('jobsManage.type')" width="100"></el-table-column>

      <el-table-column prop="syncName" :label="t('jobsManage.name')" width="160"></el-table-column>

      <el-table-column prop="syncId" :label="t('jobsManage.id')" width="100"></el-table-column>

      <el-table-column prop="link" :label="t('mangaSync.link')"></el-table-column>

      <el-table-column prop="createTime" :label="t('createTime')" width="160"></el-table-column>

      <el-table-column :label="t('account.option')" width="242 ">
        <template v-slot="scope">
          <el-button size="small" type="success" :icon="Refresh" @click="sync_manga(scope.$index, scope.row)">{{ t('option.sync') }}</el-button>
          <el-button size="small" type="primary" :icon="Edit" @click="edit_manga(scope.$index, scope.row)">{{ t('option.check') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="delete_manga(scope.$index, scope.row)">{{ t('option.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <table-pager ref="pager" :page-size="browse.manageListPageSize" @pageChange="load_table" :count="count" />

    <el-dialog v-model="shareLinkDialog" :title="$t('mangaSync.addSync')" :close-on-click-modal="false">
      <p class="title" v-if="shareData.share?.shareType">{{ shareData.share.sahreType === 'manga' ? '漫画' : '媒体库' }}同步</p>

      <el-input v-model="shareLink" type="text" :rows="10" id="payload" placeholder="请输入smanga分享链接"></el-input>

      <div class="manga-box" v-if="shareData.share.shareType === 'manga'">
        <div class="manga-box-poster">
          <img :src="posterBlob" :alt="shareData.manga.mangaName" />
        </div>

        <!-- 展示漫画信息 手动写结构 -->
        <div class="manga-box-content">
          <h3 class="manga-box-title">{{ shareData.manga.mangaName }}</h3>
          <p class="manga-box-author">{{ shareData.manga.author }}</p>
          <p class="manga-box-count">共 {{ shareData.manga.chapterCount }} 章</p>
          <p class="manga-box-intro">{{ shareData.manga.intro }}</p>
        </div>
      </div>

      <div class="media-box" v-if="shareData.share.shareType === 'media'">
        <!-- 展示媒体库信息 手动写结构 -->
        <div class="manga-box-poster">
          <img :src="posterBlob" :alt="shareData.media.mediaName" />
        </div>
        <div class="manga-box-content">
          <h3 class="manga-box-title">{{ shareData.media.mediaName }}</h3>
          <p class="manga-box-author">{{ shareData.media.author }}</p>
          <p class="manga-box-count">共 {{ shareData.media.mangaCount }} 本漫画</p>
          <p class="manga-box-intro">{{ shareData.media.intro }}</p>
        </div>
      </div>

      <el-form-item label="自动">
        <el-switch v-model="autoSync">{{ $t('mangaSync.mediaSync') }}></el-switch>
      </el-form-item>

      <el-form-item label="路径选择">
        <el-select v-model="pathSelect" filterable allow-create placeholder="请选择或输入接收漫画的路径">
          <el-option v-for="path in pathList" :key="path.pathId" :label="path.pathContent" :value="path.pathContent"></el-option>
        </el-select>
      </el-form-item>

      <div class="dialog-footer">
        <div class="btn-box">
          <el-button type="success" @click="analysis_link">
            {{ $t('mangaSync.analysis') }}
          </el-button>
          <el-button type="primary" @click="sync_create">{{ $t('mangaSync.add') }}</el-button>
          <el-button @click="shareLinkDialog = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="syncDetailDialog" :title="$t('mangaSync.addSync')" :close-on-click-modal="false">
      <p class="title" v-if="shareData.share?.shareType">{{ shareData.share.sahreType === 'manga' ? '漫画' : '媒体库' }}同步</p>

      <div class="manga-box" v-if="shareData.share.shareType === 'manga'">
        <div class="manga-box-poster">
          <img :src="posterBlob" :alt="shareData.manga.mangaName" />
        </div>

        <!-- 展示漫画信息 手动写结构 -->
        <div class="manga-box-content">
          <h3 class="manga-box-title">{{ shareData.manga.mangaName }}</h3>
          <p class="manga-box-author">{{ shareData.manga.author }}</p>
          <p class="manga-box-count">共 {{ shareData.manga.chapterCount }} 章</p>
          <p class="manga-box-intro">{{ shareData.manga.intro }}</p>
        </div>
      </div>

      <div class="media-box" v-if="shareData.share.shareType === 'media'">
        <!-- 展示媒体库信息 手动写结构 -->
        <div class="manga-box-poster">
          <img :src="posterBlob" :alt="shareData.media.mediaName" />
        </div>
        <div class="manga-box-content">
          <h3 class="manga-box-title">{{ shareData.media.mediaName }}</h3>
          <p class="manga-box-author">{{ shareData.media.author }}</p>
          <p class="manga-box-count">共 {{ shareData.media.mangaCount }} 本漫画</p>
          <p class="manga-box-intro">{{ shareData.media.intro }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {name: 'manga-sync'};
</script>
<script setup lang="ts">
import {Delete, Edit, Plus, Refresh} from '@element-plus/icons-vue';
import {onMounted, ref} from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import {ElButton, ElDialog, ElInput, ElMessage, ElMessageBox} from 'element-plus';
import syncApi from '@/api/sync';
import type {mediaType} from '@/type/media';
import {pathType} from '@/type/path';
import pathApi from '@/api/path';
import imageApi from '@/api/image';

const shareLinkDialog = ref(false);
const syncDetailDialog = ref(false);
const browse = useBrowseStore();
const mediaList = ref<mediaType[]>([]);
const pathList = ref<pathType[]>([]);

const autoSync = ref(false);
const mediaSelectId = ref();
const pathSelect = ref('');

const posterBlob = ref('');

const shareLink = ref('');
const shareData: any = ref({
  share: {
    shareType: '', // 假设默认是漫画
    shareLink: '',
    source: '',
    shareId: 0,
    secret: '', // 如果需要，可以添加secret
    link: '', // 如果需要，可以添加link
  },
  manga: {
    id: 0,
    title: '',
    cover: '',
  },
  media: {
    id: 0,
    title: '',
    cover: '',
  },
});

const tableData = ref<any[]>([]);
const {t} = i18n.global;
let count = ref(0);

onMounted(async () => {
  // 初始化加载数据
  load_table(browse.manageListPage, browse.manageListPageSizeCache);
  await load_paths();
});

async function load_paths() {
  const pathListResponse = await pathApi.get(0);
  pathList.value = pathListResponse.list;
}

async function load_table(page = 1, pageSize = 10) {
  // 模拟加载数据
  const listResponse = await syncApi.get({
    page,
    pageSize,
  });

  tableData.value = listResponse.list;
  count.value = listResponse.count;

  browse.manageListPage = page;
  browse.manageListPageSizeCache = pageSize;
}

function dialog_open() {
  shareData.value = {
    share: {
      shareType: '', // 默认类型为漫画
      shareLink: '',
      source: '',
      shareId: 0,
      secret: '', // 如果需要，可以添加secret
      link: '', // 如果需要，可以添加link
    },
    manga: {
      id: 0,
      title: '',
      cover: '',
    },
    media: {
      id: 0,
      title: '',
      cover: '',
    },
  };
  shareLink.value = '';
  mediaSelectId.value = undefined;
  autoSync.value = false;

  shareLinkDialog.value = true;
}

async function analysis_link() {
  if (shareLink.value.trim() === '') {
    ElMessage.error(t('mangaSync.shareLinkEmpty'));
    return;
  }

  const analysisResponse = await syncApi.analysis(shareLink.value);
  shareData.value = analysisResponse.data;

  const share = shareData.value.share;
  if (!share.origin) {
    ElMessage.error('错误源地址');
    return;
  }

  let origin = share.origin;
  if (/\/api/.test(share.link)) {
    origin = origin + '/api';
  }
  console.log(share, origin);
  if (shareData.value.share.shareType === 'manga') {
    const manga = shareData.value.manga;
    // 加载封面
    if (manga.mangaCover) {
      posterBlob.value = await imageApi.get_from({file: manga.mangaCover, origin});
    }

    if (manga.metas) {
      manga.author = manga.metas.find((meta: any) => meta.metaName === 'author')?.metaContent || '';
      manga.intro = manga.metas.find((meta: any) => meta.metaName === 'describe')?.metaContent || '';
    }
  }

  if (shareData.value.share.shareType === 'media') {
    const media = shareData.value.media;
    // 加载封面
    if (media.mediaCover) {
      posterBlob.value = await imageApi.get_from({file: media.mediaCover, origin});
    }
  }
}

async function sync_create() {
  if (!pathSelect.value) {
    ElMessage.error(t('mangaSync.selectPath'));
    return;
  }

  if (!shareData.value.share?.shareId) {
    ElMessage.error(t('mangaSync.shareIdEmpty'));
    return;
  }

  const syncCreateResponse = await syncApi.create({
    syncType: shareData.value.share.shareType,
    syncName: shareData.value.share.shareType === 'manga' ? shareData.value.manga.mangaName : shareData.value.media.mediaName,
    origin: shareData.value.share.origin,
    receivedPath: pathSelect.value,
    shareId: shareData.value.share.shareId,
    link: shareData.value.share.link,
    secret: shareData.value.share.secret, // 如果需要，可以添加secret
    auto: autoSync ? 1 : 0, // 如果需要，可以设置为true
    token: '', // 如果需要，可以添加token
  });

  shareLinkDialog.value = false;
}

async function sync_manga(index: number, row: any) {
  const syncResponse = await syncApi.execute(row.syncId);
}

async function edit_manga(index: number, row: any) {
  const shareResponse = await syncApi.analysis(row.link);
  shareData.value = shareResponse.data;
  syncDetailDialog.value = true;

  const share = shareData.value.share;
  if (!share.origin) {
    ElMessage.error('错误源地址');
    return;
  }

  let origin = share.origin;
  if (/\/api/.test(share.origin)) {
    origin = origin + '/api';
  }

  if (shareData.value.share.shareType === 'manga') {
    const manga = shareData.value.manga;
    // 加载封面
    if (manga.mangaCover) {
      posterBlob.value = await imageApi.get_from({file: manga.mangaCover, origin});
    }

    if (manga.metas) {
      manga.author = manga.metas.find((meta: any) => meta.metaName === 'author')?.metaContent || '';
      manga.intro = manga.metas.find((meta: any) => meta.metaName === 'describe')?.metaContent || '';
    }
  }

  if (shareData.value.share.shareType === 'media') {
    const media = shareData.value.media;
    // 加载封面
    if (media.mediaCover) {
      posterBlob.value = await imageApi.get_from({file: media.mediaCover, origin});
    }
  }
}

async function delete_manga(index: number, row: any) {
  const confirm = await ElMessageBox.confirm(t('option.deleteConfirm'), t('option.warning'), {
    confirmButtonText: t('option.confirm'),
    cancelButtonText: t('option.cancel'),
    type: 'warning',
  });

  if (!confirm) {
    return;
  }

  // 删除漫画逻辑
  syncApi
    .delete(row.syncId)
    .then(() => {
      tableData.value.splice(index, 1);
      count.value--;
    })
    .catch(error => {
      console.error('删除失败:', error);
    });
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
