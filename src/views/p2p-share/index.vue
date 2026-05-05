<template>
  <div class="manga-setting-box manage-container">
    <!-- 表头按钮 -->
    <div class="btn-box">
      <el-select v-model="filterGroupId" :placeholder="t('p2pShare.selectGroup')" clearable style="width: 240px; margin-right: 10px" @change="load_table(1, browse.manageListPageSizeCache)">
        <el-option v-for="g in groupList" :key="g.p2pGroupId" :label="`${g.groupName} (${g.groupNo})`" :value="g.p2pGroupId as number"></el-option>
      </el-select>
      <el-button type="primary" :icon="Refresh" @click="load_table(browse.manageListPage, browse.manageListPageSizeCache)">{{ $t('option.refresh') }}</el-button>
      <el-button class="add-btn" type="success" :icon="Plus" :disabled="groupList.length === 0" @click="open_add_dialog">{{ $t('p2pShare.add') }}</el-button>
      <el-button type="warning" :icon="Upload" :disabled="!filterGroupId" @click="announce_group">{{ $t('p2pShare.announce') }}</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" stripe border v-loading="loading">
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
      <el-table-column prop="groupName" :label="t('p2pGroup.groupName')" width="160"></el-table-column>
      <el-table-column prop="shareType" :label="t('p2pShare.shareType')" width="100">
        <template v-slot="scope">
          {{ scope.row.shareType === 'media' ? t('p2pShare.media') : t('p2pShare.manga') }}
        </template>
      </el-table-column>
      <el-table-column prop="mediaName" :label="t('p2pShare.media')" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="mangaName" :label="t('p2pShare.manga')" show-overflow-tooltip></el-table-column>
      <el-table-column prop="enable" :label="t('p2pShare.enable')" width="100">
        <template v-slot="scope">
          <el-switch :model-value="scope.row.enable === 1" @change="(v: boolean) => toggle_enable(scope.row, v)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" :label="t('updateTime')" width="160"></el-table-column>
      <el-table-column :label="t('account.option')" width="120">
        <template v-slot="scope">
          <el-button size="small" type="danger" :icon="Delete" @click="delete_share(scope.row)">
            {{ t('option.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <table-pager ref="pager" :page-size="browse.manageListPageSize" @pageChange="load_table" :count="count" />

    <!-- 新增共享对话框 -->
    <el-dialog v-model="addDialogVisible" :title="$t('p2pShare.add')" :close-on-click-modal="false" width="520px">
      <el-form :model="addForm" label-width="110px">
        <el-form-item :label="t('p2pShare.selectGroup')" required>
          <el-select v-model="addForm.p2pGroupId" style="width: 100%">
            <el-option v-for="g in groupList" :key="g.p2pGroupId" :label="`${g.groupName} (${g.groupNo})`" :value="g.p2pGroupId as number"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('p2pShare.shareType')" required>
          <el-radio-group v-model="addForm.shareType" @change="on_share_type_change">
            <el-radio value="media">{{ t('p2pShare.media') }}</el-radio>
            <el-radio value="manga">{{ t('p2pShare.manga') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="addForm.shareType === 'media'" :label="t('p2pShare.media')" required>
          <el-select v-model="addForm.mediaId" filterable style="width: 100%">
            <el-option v-for="m in mediaList" :key="m.mediaId" :label="m.mediaName" :value="m.mediaId"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="addForm.shareType === 'manga'">
          <el-form-item :label="t('p2pShare.media')" required>
            <el-select v-model="mangaSelectMediaId" filterable style="width: 100%" @change="load_mangas_for_media">
              <el-option v-for="m in mediaList" :key="m.mediaId" :label="m.mediaName" :value="m.mediaId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('p2pShare.manga')" required>
            <el-select v-model="addForm.mangaId" filterable style="width: 100%">
              <el-option v-for="m in mangaList" :key="m.mangaId" :label="m.mangaName" :value="m.mangaId"></el-option>
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <div class="dialog-footer">
        <div class="btn-box">
          <el-button type="primary" @click="submit_add">{{ $t('option.confirm') }}</el-button>
          <el-button @click="addDialogVisible = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {name: 'p2p-share'};
</script>
<script setup lang="ts">
import {Delete, Plus, Refresh, Upload} from '@element-plus/icons-vue';
import {onMounted, ref} from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import {p2pGroupApi, p2pShareApi} from '@/api/p2p';
import mediaApi from '@/api/media';
import mangaApi from '@/api/manga';
import type {P2PGroupType, P2PLocalShareType, P2PLocalShareCreateParams} from '@/type/p2p';
import type {mediaType} from '@/type/media';
import type {mangaType} from '@/type/manga';

const browse = useBrowseStore();
const {t} = i18n.global;

const tableData = ref<P2PLocalShareType[]>([]);
const count = ref(0);
const loading = ref(false);

const groupList = ref<P2PGroupType[]>([]);
const mediaList = ref<mediaType[]>([]);
const mangaList = ref<mangaType[]>([]);

const filterGroupId = ref<number | undefined>(undefined);
const mangaSelectMediaId = ref<number>();

const addDialogVisible = ref(false);
const addForm = ref<P2PLocalShareCreateParams>({
  p2pGroupId: 0,
  shareType: 'media',
  mediaId: undefined,
  mangaId: undefined,
  enable: 1,
});

onMounted(async () => {
  await load_groups();
  await load_media();
  await load_table(browse.manageListPage, browse.manageListPageSizeCache);
});

async function load_groups() {
  try {
    const res = await p2pGroupApi.list({page: 1, pageSize: 999});
    groupList.value = res?.list || res?.data?.list || [];
    if (groupList.value.length && !filterGroupId.value) {
      // 不自动选择,让用户选择后再过滤
    }
  } catch (err) {
    console.error('load groups failed:', err);
  }
}

async function load_media() {
  try {
    const res = await mediaApi.get(1, 999);
    mediaList.value = res?.list || [];
  } catch (err) {
    console.error('load media failed:', err);
  }
}

async function load_mangas_for_media(mediaId: number) {
  if (!mediaId) {
    mangaList.value = [];
    return;
  }
  try {
    const res = await mangaApi.get(mediaId, 1, 999);
    mangaList.value = res?.list || [];
  } catch (err) {
    console.error('load mangas failed:', err);
  }
}

async function load_table(page = 1, pageSize = 10) {
  loading.value = true;
  try {
    const res = await p2pShareApi.list({page, pageSize, p2pGroupId: filterGroupId.value});
    tableData.value = res?.list || res?.data?.list || [];
    count.value = res?.count || res?.data?.count || tableData.value.length;
    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
  } catch (err) {
    console.error('p2p share load failed:', err);
  } finally {
    loading.value = false;
  }
}

function open_add_dialog() {
  addForm.value = {
    p2pGroupId: filterGroupId.value || (groupList.value[0]?.p2pGroupId as number) || 0,
    shareType: 'media',
    mediaId: undefined,
    mangaId: undefined,
    enable: 1,
  };
  mangaSelectMediaId.value = undefined;
  mangaList.value = [];
  addDialogVisible.value = true;
}

function on_share_type_change() {
  addForm.value.mediaId = undefined;
  addForm.value.mangaId = undefined;
  mangaSelectMediaId.value = undefined;
  mangaList.value = [];
}

async function submit_add() {
  if (!addForm.value.p2pGroupId) {
    ElMessage.error(t('p2pShare.selectGroup'));
    return;
  }
  if (addForm.value.shareType === 'media' && !addForm.value.mediaId) {
    ElMessage.error(t('p2pShare.selectMedia'));
    return;
  }
  if (addForm.value.shareType === 'manga' && !addForm.value.mangaId) {
    ElMessage.error(t('p2pShare.selectManga'));
    return;
  }
  try {
    await p2pShareApi.create(addForm.value);
    ElMessage.success(t('option.confirm'));
    addDialogVisible.value = false;
    await load_table(1, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.message || 'create share failed');
  }
}

async function toggle_enable(row: P2PLocalShareType, enable: boolean) {
  if (!row.p2pLocalShareId) return;
  try {
    await p2pShareApi.update(row.p2pLocalShareId, {enable: enable ? 1 : 0});
    row.enable = enable ? 1 : 0;
  } catch (err: any) {
    ElMessage.error(err?.message || 'update share failed');
  }
}

async function delete_share(row: P2PLocalShareType) {
  if (!row.p2pLocalShareId) return;
  try {
    await ElMessageBox.confirm(t('option.deleteConfirm'), t('option.warning'), {
      confirmButtonText: t('option.confirm'),
      cancelButtonText: t('option.cancel'),
      type: 'warning',
    });
  } catch {
    return;
  }
  try {
    await p2pShareApi.destroy(row.p2pLocalShareId);
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.message || 'delete failed');
  }
}

async function announce_group() {
  if (!filterGroupId.value) return;
  const group = groupList.value.find(g => g.p2pGroupId === filterGroupId.value);
  if (!group) return;
  try {
    await p2pShareApi.announce(group.groupNo);
    ElMessage.success(t('p2pShare.announceSuccess'));
  } catch (err: any) {
    ElMessage.error(err?.message || 'announce failed');
  }
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>