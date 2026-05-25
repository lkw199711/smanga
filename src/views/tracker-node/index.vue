<template>
  <div class="manga-setting-box manage-container">
    <div class="btn-box">
      <el-input
        v-model="filter.keyword"
        :placeholder="t('trackerNode.searchPlaceholder')"
        clearable
        style="width: 280px; margin-right: 10px"
        @keyup.enter="load_table(1)"
        @clear="load_table(1)"
      ></el-input>
      <el-select
        v-model="filter.online"
        clearable
        :placeholder="t('trackerNode.onlineFilter')"
        style="width: 130px; margin-right: 10px"
        @change="load_table(1)"
      >
        <el-option :label="t('p2pPeers.online')" :value="1" />
        <el-option :label="t('p2pPeers.offline')" :value="0" />
      </el-select>
      <el-select
        v-model="filter.banned"
        clearable
        :placeholder="t('trackerNode.bannedFilter')"
        style="width: 130px; margin-right: 10px"
        @change="load_table(1)"
      >
        <el-option :label="t('trackerNode.normal')" :value="0" />
        <el-option :label="t('trackerNode.banned')" :value="1" />
      </el-select>
      <el-button type="primary" :icon="Refresh" @click="load_table(browse.manageListPage)">
        {{ t('option.refresh') }}
      </el-button>
    </div>

    <el-table :data="tableData" stripe border v-loading="loading">
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
      <el-table-column prop="nodeId" :label="t('p2pPeers.nodeId')" width="240" show-overflow-tooltip></el-table-column>
      <el-table-column prop="nodeName" :label="t('p2pPeers.nodeName')" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column :label="t('p2pPeers.online')" width="82">
        <template v-slot="scope">
          <el-tag size="small" :type="scope.row.online ? 'success' : 'info'">
            {{ scope.row.online ? t('p2pPeers.online') : t('p2pPeers.offline') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('trackerNode.bannedFilter')" width="92">
        <template v-slot="scope">
          <el-tag size="small" :type="scope.row.banned ? 'danger' : 'success'">
            {{ scope.row.banned ? t('trackerNode.banned') : t('trackerNode.normal') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publicUrl" :label="t('trackerNode.publicUrl')" min-width="220" show-overflow-tooltip>
        <template v-slot="scope">
          {{ scope.row.publicUrl || t('trackerNode.noPublicUrl') }}
        </template>
      </el-table-column>
      <el-table-column prop="version" :label="t('trackerNode.version')" width="100" show-overflow-tooltip></el-table-column>
      <el-table-column :label="t('trackerNode.groupCount')" width="82">
        <template v-slot="scope">{{ scope.row.groupCount || 0 }}</template>
      </el-table-column>
      <el-table-column :label="t('trackerNode.ownedGroupCount')" width="82">
        <template v-slot="scope">{{ scope.row.ownedGroupCount || 0 }}</template>
      </el-table-column>
      <el-table-column :label="t('trackerNode.shareCount')" width="94">
        <template v-slot="scope">{{ scope.row.shareIndexCount || 0 }}</template>
      </el-table-column>
      <el-table-column prop="lastHeartbeat" :label="t('trackerNode.lastHeartbeat')" width="170"></el-table-column>
      <el-table-column :label="t('account.option')" width="260" fixed="right">
        <template v-slot="scope">
          <el-button size="small" type="primary" :icon="View" @click="open_detail(scope.row)">
            {{ t('trackerGroup.detail') }}
          </el-button>
          <el-button
            size="small"
            :type="scope.row.banned ? 'success' : 'warning'"
            :icon="Warning"
            @click="toggle_ban(scope.row)"
          >
            {{ scope.row.banned ? t('trackerNode.unban') : t('trackerNode.ban') }}
          </el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="deregister_node(scope.row)">
            {{ t('trackerNode.deregister') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <table-pager
      ref="pager"
      :page-size="browse.manageListPageSize"
      @pageChange="load_table"
      :count="count"
    />

    <el-dialog
      v-model="detailVisible"
      :title="t('trackerNode.detailTitle')"
      :close-on-click-modal="false"
      width="960px"
      top="6vh"
    >
      <div v-if="detailData" v-loading="detailLoading">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item :label="t('p2pPeers.nodeId')" :span="2">{{ detailData.node.nodeId }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pPeers.nodeName')">{{ detailData.node.nodeName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pPeers.online')">
            <el-tag size="small" :type="detailData.node.online ? 'success' : 'info'">
              {{ detailData.node.online ? t('p2pPeers.online') : t('p2pPeers.offline') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('trackerNode.bannedFilter')">
            <el-tag size="small" :type="detailData.node.banned ? 'danger' : 'success'">
              {{ detailData.node.banned ? t('trackerNode.banned') : t('trackerNode.normal') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('trackerNode.banReason')">{{ detailData.node.bannedReason || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('trackerNode.publicUrl')" :span="2">{{ detailData.node.publicUrl || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('trackerNode.version')">{{ detailData.node.version || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('trackerNode.userAgent')">{{ detailData.node.userAgent || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('trackerNode.traffic')">
            {{ format_bytes(detailData.node.totalUpload) }} / {{ format_bytes(detailData.node.totalDownload) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('trackerNode.shareCount')">{{ detailData.shareIndexCount }}</el-descriptions-item>
          <el-descriptions-item :label="t('trackerNode.manifestCount')">{{ detailData.shareManifestCount }}</el-descriptions-item>
          <el-descriptions-item :label="t('createTime')">{{ detailData.node.createTime }}</el-descriptions-item>
          <el-descriptions-item :label="t('updateTime')">{{ detailData.node.updateTime }}</el-descriptions-item>
        </el-descriptions>

        <h3 class="section-title" style="margin-top: 16px">{{ t('trackerNode.membershipList') }}</h3>
        <el-table :data="detailData.memberships" stripe border size="small" max-height="260">
          <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
          <el-table-column prop="group.groupNo" :label="t('p2pGroup.groupNo')" width="110"></el-table-column>
          <el-table-column prop="group.groupName" :label="t('p2pGroup.groupName')" show-overflow-tooltip></el-table-column>
          <el-table-column prop="role" :label="t('trackerGroup.role')" width="90"></el-table-column>
          <el-table-column prop="group.memberCount" :label="t('p2pGroup.memberCount')" width="90"></el-table-column>
          <el-table-column :label="t('trackerGroup.enable')" width="90">
            <template v-slot="scope">
              <el-tag size="small" :type="scope.row.group.enable ? 'success' : 'danger'">
                {{ scope.row.group.enable ? t('trackerGroup.enableOn') : t('trackerGroup.enableOff') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="joinTime" :label="t('trackerGroup.joinTime')" width="170"></el-table-column>
        </el-table>

        <h3 class="section-title" style="margin-top: 16px">{{ t('trackerNode.ownedGroupList') }}</h3>
        <el-table :data="detailData.ownedGroups" stripe border size="small" max-height="220">
          <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
          <el-table-column prop="groupNo" :label="t('p2pGroup.groupNo')" width="110"></el-table-column>
          <el-table-column prop="groupName" :label="t('p2pGroup.groupName')" show-overflow-tooltip></el-table-column>
          <el-table-column prop="memberCount" :label="t('p2pGroup.memberCount')" width="90"></el-table-column>
          <el-table-column :label="t('trackerGroup.enable')" width="90">
            <template v-slot="scope">
              <el-tag size="small" :type="scope.row.enable ? 'success' : 'danger'">
                {{ scope.row.enable ? t('trackerGroup.enableOn') : t('trackerGroup.enableOff') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" :label="t('createTime')" width="170"></el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {name: 'tracker-node'};
</script>
<script setup lang="ts">
import {Delete, Refresh, View, Warning} from '@element-plus/icons-vue';
import {onMounted, reactive, ref} from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import {trackerAdminNodeApi} from '@/api/p2p';
import type {TrackerNodeType} from '@/type/p2p';

const browse = useBrowseStore();
const {t} = i18n.global;

interface TrackerNodeDetail {
  node: TrackerNodeType;
  memberships: Array<{
    trackerMembershipId: number;
    role: string;
    joinTime: string;
    lastAnnounce?: string | null;
    group: {
      trackerGroupId: number;
      groupNo: string;
      groupName: string;
      ownerNodeId: string;
      enable: number;
      memberCount: number;
      createTime: string;
      updateTime: string;
    };
  }>;
  ownedGroups: Array<{
    trackerGroupId: number;
    groupNo: string;
    groupName: string;
    enable: number;
    memberCount: number;
    createTime: string;
    updateTime: string;
  }>;
  shareIndexCount: number;
  shareManifestCount: number;
}

const tableData = ref<TrackerNodeType[]>([]);
const count = ref(0);
const loading = ref(false);
const filter = reactive<{keyword: string; online: number | ''; banned: number | ''}>({
  keyword: '',
  online: '',
  banned: '',
});

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<TrackerNodeDetail | null>(null);

onMounted(() => {
  load_table(browse.manageListPage, browse.manageListPageSizeCache);
});

async function load_table(page = 1, pageSize = 20) {
  loading.value = true;
  try {
    const res = await trackerAdminNodeApi.list({
      page,
      pageSize,
      keyword: filter.keyword || undefined,
      online: filter.online === '' ? undefined : (filter.online as number),
      banned: filter.banned === '' ? undefined : (filter.banned as number),
    });
    tableData.value = res?.list || res?.data?.list || [];
    count.value = res?.count ?? res?.data?.count ?? tableData.value.length;
    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
  } catch (err: any) {
    console.error('[tracker-node] load failed:', err?.response || err);
    ElMessage.error(err?.response?.data?.message || err?.message || 'load failed');
  } finally {
    loading.value = false;
  }
}

async function open_detail(row: TrackerNodeType) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;
  try {
    const res = await trackerAdminNodeApi.detail(row.nodeId);
    detailData.value = (res?.data ?? res) as TrackerNodeDetail;
  } catch (err: any) {
    console.error('[tracker-node] detail failed:', err?.response || err);
    ElMessage.error(err?.response?.data?.message || err?.message || 'detail failed');
    detailVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
}

async function toggle_ban(row: TrackerNodeType) {
  const nodeName = row.nodeName || row.nodeId;
  const nextBanned = row.banned ? 0 : 1;
  let bannedReason = '';

  if (nextBanned === 1) {
    try {
      const result: any = await ElMessageBox.prompt(
        t('trackerNode.banConfirm', {nodeName}),
        t('option.warning'),
        {
          confirmButtonText: t('option.confirm'),
          cancelButtonText: t('option.cancel'),
          inputPlaceholder: t('trackerNode.banReasonPlaceholder'),
          type: 'warning',
        },
      );
      bannedReason = result?.value || '';
    } catch {
      return;
    }
  } else {
    try {
      await ElMessageBox.confirm(
        t('trackerNode.unbanConfirm', {nodeName}),
        t('option.warning'),
        {
          confirmButtonText: t('option.confirm'),
          cancelButtonText: t('option.cancel'),
          type: 'warning',
        },
      );
    } catch {
      return;
    }
  }

  try {
    await trackerAdminNodeApi.ban(row.nodeId, {banned: nextBanned as 0 | 1, bannedReason});
    ElMessage.success(nextBanned ? t('trackerNode.banOk') : t('trackerNode.unbanOk'));
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
    if (detailVisible.value) await open_detail(row);
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'ban failed');
  }
}

async function deregister_node(row: TrackerNodeType) {
  const nodeName = row.nodeName || row.nodeId;
  try {
    await ElMessageBox.confirm(
      t('trackerNode.deregisterConfirm', {nodeName}),
      t('option.warning'),
      {
        confirmButtonText: t('option.confirm'),
        cancelButtonText: t('option.cancel'),
        type: 'warning',
      },
    );
  } catch {
    return;
  }

  try {
    await trackerAdminNodeApi.destroy(row.nodeId);
    ElMessage.success(t('trackerNode.deregisterOk'));
    detailVisible.value = false;
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'deregister failed');
  }
}

function format_bytes(value?: string | number | null) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = n;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
<style scoped lang="less">
.section-title {
  margin: 12px 0 8px;
  font-size: 14px;
  color: #606266;
}
</style>
