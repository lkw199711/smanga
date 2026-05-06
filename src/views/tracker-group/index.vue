<template>
  <div class="manga-setting-box manage-container">
    <!-- 顶部:搜索 + 操作 -->
    <div class="btn-box">
      <el-input
        v-model="filter.keyword"
        :placeholder="t('trackerGroup.searchPlaceholder')"
        clearable
        style="width: 260px; margin-right: 10px"
        @keyup.enter="load_table(1)"
        @clear="load_table(1)"
      ></el-input>
      <el-select
        v-model="filter.enable"
        clearable
        :placeholder="t('trackerGroup.enableFilter')"
        style="width: 140px; margin-right: 10px"
        @change="load_table(1)"
      >
        <el-option :label="t('trackerGroup.enableOn')" :value="1" />
        <el-option :label="t('trackerGroup.enableOff')" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Refresh" @click="load_table(browse.manageListPage)">
        {{ t('option.refresh') }}
      </el-button>
    </div>

    <!-- 群组列表 -->
    <el-table :data="tableData" stripe border v-loading="loading">
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
      <el-table-column prop="groupNo" :label="t('p2pGroup.groupNo')" width="110"></el-table-column>
      <el-table-column prop="groupName" :label="t('p2pGroup.groupName')" width="160"></el-table-column>
      <el-table-column prop="describe" :label="t('p2pGroup.groupDescribe')" show-overflow-tooltip></el-table-column>
      <el-table-column :label="t('trackerGroup.owner')" width="220" show-overflow-tooltip>
        <template v-slot="scope">
          <span>{{ scope.row.ownerNodeName || '-' }}</span>
          <el-tag size="small" :type="scope.row.ownerOnline ? 'success' : 'info'" style="margin-left: 6px">
            {{ scope.row.ownerOnline ? t('p2pPeers.online') : t('p2pPeers.offline') }}
          </el-tag>
          <div style="font-size: 12px; color: #999">{{ scope.row.ownerNodeId }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="memberCount" :label="t('p2pGroup.memberCount')" width="80"></el-table-column>
      <el-table-column prop="maxMembers" :label="t('trackerGroup.maxMembers')" width="80"></el-table-column>
      <el-table-column :label="t('trackerGroup.enable')" width="80">
        <template v-slot="scope">
          <el-tag size="small" :type="scope.row.enable ? 'success' : 'danger'">
            {{ scope.row.enable ? t('trackerGroup.enableOn') : t('trackerGroup.enableOff') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" :label="t('createTime')" width="160"></el-table-column>
      <el-table-column :label="t('account.option')" width="220" fixed="right">
        <template v-slot="scope">
          <el-button size="small" type="primary" :icon="View" @click="open_detail(scope.row)">
            {{ t('trackerGroup.detail') }}
          </el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="dismiss_group(scope.row)">
            {{ t('trackerGroup.dismiss') }}
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="t('trackerGroup.detailTitle')"
      :close-on-click-modal="false"
      width="900px"
      top="6vh"
    >
      <div v-if="detailData" v-loading="detailLoading">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item :label="t('p2pGroup.groupNo')">{{ detailData.group.groupNo }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.groupName')">{{ detailData.group.groupName }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.ownerNodeId')" :span="2">{{ detailData.group.ownerNodeId }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.groupDescribe')" :span="2">{{ detailData.group.describe || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.memberCount')">
            {{ detailData.group.memberCount }} / {{ detailData.group.maxMembers }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('trackerGroup.hasPassword')">
            <el-tag size="small" :type="detailData.group.hasPassword ? 'warning' : 'info'">
              {{ detailData.group.hasPassword ? t('trackerGroup.passwordOn') : t('trackerGroup.passwordOff') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('trackerGroup.inviteCount')">{{ detailData.inviteCount }}</el-descriptions-item>
          <el-descriptions-item :label="t('trackerGroup.shareIndexCount')">{{ detailData.shareIndexCount }}</el-descriptions-item>
          <el-descriptions-item :label="t('createTime')">{{ detailData.group.createTime }}</el-descriptions-item>
          <el-descriptions-item :label="t('updateTime')">{{ detailData.group.updateTime }}</el-descriptions-item>
        </el-descriptions>

        <h3 class="section-title" style="margin-top: 16px">{{ t('trackerGroup.memberList') }}</h3>
        <el-table :data="detailData.members" stripe border size="small" max-height="380">
          <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
          <el-table-column prop="nodeId" :label="t('p2pPeers.nodeId')" width="240" show-overflow-tooltip></el-table-column>
          <el-table-column prop="nodeName" :label="t('p2pPeers.nodeName')" width="160"></el-table-column>
          <el-table-column prop="role" :label="t('trackerGroup.role')" width="90">
            <template v-slot="scope">
              <el-tag size="small" :type="scope.row.role === 'owner' ? 'warning' : 'info'">
                {{ scope.row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('p2pPeers.online')" width="80">
            <template v-slot="scope">
              <el-tag size="small" :type="scope.row.online ? 'success' : 'info'">
                {{ scope.row.online ? t('p2pPeers.online') : t('p2pPeers.offline') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Public" width="170">
            <template v-slot="scope">
              <span v-if="scope.row.publicHost">{{ scope.row.publicHost }}:{{ scope.row.publicPort }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastHeartbeat" :label="t('p2pPeers.lastSeen')" width="170"></el-table-column>
          <el-table-column prop="joinTime" :label="t('trackerGroup.joinTime')" width="170"></el-table-column>
          <el-table-column :label="t('account.option')" width="120" fixed="right">
            <template v-slot="scope">
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                :disabled="scope.row.role === 'owner'"
                @click="kick_member(scope.row)"
              >
                {{ t('trackerGroup.kick') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {name: 'tracker-group'};
</script>
<script setup lang="ts">
import {Refresh, Delete, View} from '@element-plus/icons-vue';
import {onMounted, reactive, ref} from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import {trackerAdminGroupApi} from '@/api/p2p';

const browse = useBrowseStore();
const {t} = i18n.global;

interface TrackerGroupRow {
  trackerGroupId: number;
  groupNo: string;
  groupName: string;
  describe: string | null;
  ownerNodeId: string;
  ownerNodeName: string | null;
  ownerOnline: number;
  maxMembers: number;
  memberCount: number;
  enable: number;
  createTime: string;
  updateTime: string;
}

interface TrackerGroupMember {
  nodeId: string;
  nodeName: string | null;
  role: string;
  online: number;
  publicHost: string | null;
  publicPort: number | null;
  lastHeartbeat: string | null;
  joinTime: string;
}

interface TrackerGroupDetail {
  group: TrackerGroupRow & {hasPassword: boolean};
  members: TrackerGroupMember[];
  inviteCount: number;
  shareIndexCount: number;
}

const tableData = ref<TrackerGroupRow[]>([]);
const count = ref(0);
const loading = ref(false);

const filter = reactive<{keyword: string; enable: number | ''}>({keyword: '', enable: ''});

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<TrackerGroupDetail | null>(null);

onMounted(() => {
  load_table(browse.manageListPage, browse.manageListPageSizeCache);
});

async function load_table(page = 1, pageSize = 20) {
  loading.value = true;
  try {
    const res = await trackerAdminGroupApi.list({
      page,
      pageSize,
      keyword: filter.keyword || undefined,
      enable: filter.enable === '' ? undefined : (filter.enable as number),
    });
    tableData.value = res?.list || res?.data?.list || [];
    count.value = res?.count ?? res?.data?.count ?? tableData.value.length;
    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
  } catch (err: any) {
    console.error('[tracker-group] load failed:', err?.response || err);
    ElMessage.error(err?.response?.data?.message || err?.message || 'load failed');
  } finally {
    loading.value = false;
  }
}

async function open_detail(row: TrackerGroupRow) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;
  try {
    const res = await trackerAdminGroupApi.detail(row.groupNo);
    detailData.value = (res?.data ?? res) as TrackerGroupDetail;
  } catch (err: any) {
    console.error('[tracker-group] detail failed:', err?.response || err);
    ElMessage.error(err?.response?.data?.message || err?.message || 'detail failed');
    detailVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
}

async function dismiss_group(row: TrackerGroupRow) {
  try {
    await ElMessageBox.confirm(
      t('trackerGroup.dismissConfirm', {groupNo: row.groupNo}),
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
    await trackerAdminGroupApi.dismiss(row.groupNo);
    ElMessage.success(t('trackerGroup.dismissOk'));
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'dismiss failed');
  }
}

async function kick_member(row: TrackerGroupMember) {
  if (!detailData.value) return;
  try {
    await ElMessageBox.confirm(
      t('trackerGroup.kickConfirm', {nodeName: row.nodeName || row.nodeId}),
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
    await trackerAdminGroupApi.kick(detailData.value.group.groupNo, row.nodeId);
    ElMessage.success(t('trackerGroup.kickOk'));
    // 刷新详情 + 列表
    await open_detail(detailData.value.group as TrackerGroupRow);
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'kick failed');
  }
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