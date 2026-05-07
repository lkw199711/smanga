<template>
  <div class="manga-setting-box manage-container">
    <!-- 顶部:群组选择 + 操作 -->
    <div class="btn-box">
      <el-select v-model="groupId" :placeholder="t('p2pPeers.selectGroup')" style="width: 260px; margin-right: 10px" @change="on_group_change">
        <el-option v-for="g in groupList" :key="g.p2pGroupId" :label="`${g.groupName} (${g.groupNo})`" :value="g.p2pGroupId as number"></el-option>
      </el-select>
      <el-button type="primary" :icon="Refresh" :disabled="!groupNo" @click="load_all">{{ $t('p2pPeers.fromTracker') }}</el-button>
      <el-button type="info" :icon="DocumentCopy" :disabled="!groupNo" @click="load_cache">{{ $t('p2pPeers.fromCache') }}</el-button>
    </div>

    <!-- 成员 -->
    <h3 class="section-title">{{ t('p2pPeers.members') }}</h3>
    <el-table :data="members" stripe border v-loading="loadingMembers" size="small">
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
      <el-table-column prop="nodeId" :label="t('p2pPeers.nodeId')" width="260" show-overflow-tooltip></el-table-column>
      <el-table-column prop="nodeName" :label="t('p2pPeers.nodeName')" width="180"></el-table-column>
      <el-table-column prop="publicUrl" label="Public" width="220" show-overflow-tooltip>
        <template v-slot="scope">
          <span v-if="scope.row.publicUrl">{{ scope.row.publicUrl }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="online" :label="t('p2pPeers.online')" width="80">
        <template v-slot="scope">
          <el-tag :type="scope.row.online ? 'success' : 'info'" size="small">
            {{ scope.row.online ? t('p2pPeers.online') : t('p2pPeers.offline') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastHeartbeat" :label="t('p2pPeers.lastSeen')" width="170"></el-table-column>
    </el-table>

    <!-- 共享索引 -->
    <h3 class="section-title">{{ t('p2pPeers.shares') }}</h3>
    <el-table :data="shares" stripe border v-loading="loadingShares" size="small">
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
      <el-table-column prop="nodeName" :label="t('p2pPeers.nodeName')" width="150"></el-table-column>
      <el-table-column prop="shareType" :label="t('p2pShare.shareType')" width="90">
        <template v-slot="scope">
          {{ scope.row.shareType === 'media' ? t('p2pShare.media') : t('p2pShare.manga') }}
        </template>
      </el-table-column>
      <el-table-column prop="shareName" :label="t('p2pTransfer.resourceName')" show-overflow-tooltip></el-table-column>
      <el-table-column prop="mangaCount" label="Mangas" width="90"></el-table-column>
      <el-table-column prop="updateTime" :label="t('updateTime')" width="160"></el-table-column>
      <el-table-column :label="t('account.option')" width="200">
        <template v-slot="scope">
          <el-button size="small" type="primary" link :icon="View" @click="open_detail_dialog(scope.row)">
            {{ t('p2pPeers.viewDetail') }}
          </el-button>
          <el-button size="small" type="success" :icon="Download" @click="open_pull_dialog(scope.row)">
            {{ t('p2pPeers.pull') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- manifest 详情对话框 -->
    <ManifestDetailDialog
      v-model="detailDialogVisible"
      :group-no="groupNo"
      :share="selectedShare"
    />

    <!-- 拉取对话框 -->
    <el-dialog v-model="pullDialogVisible" :title="$t('p2pPeers.pullDialog')" :close-on-click-modal="false" width="560px">
      <el-form :model="pullForm" label-width="110px">
        <el-form-item :label="t('p2pShare.shareType')">
          <el-input v-model="pullForm.transferType" disabled></el-input>
        </el-form-item>
        <el-form-item :label="t('p2pTransfer.resourceName')">
          <el-input v-model="pullForm.remoteName" disabled></el-input>
        </el-form-item>
        <el-form-item :label="t('p2pPeers.receivedPath')" required>
          <el-select v-model="pullForm.receivedPath" filterable allow-create style="width: 100%" :placeholder="t('p2pPeers.receivedPathPlaceholder')">
            <el-option v-for="p in pathList" :key="p.pathId" :label="p.pathContent" :value="p.pathContent"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <div class="btn-box">
          <el-button type="primary" @click="submit_pull">{{ $t('option.confirm') }}</el-button>
          <el-button @click="pullDialogVisible = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {name: 'p2p-peers'};
</script>
<script setup lang="ts">
import {DocumentCopy, Download, Refresh, View} from '@element-plus/icons-vue';
import ManifestDetailDialog from './ManifestDetailDialog.vue';
import {onMounted, ref, computed} from 'vue';
import i18n from '@/i18n';
import {p2pGroupApi, p2pPeerApi, p2pTransferApi} from '@/api/p2p';
import pathApi from '@/api/path';
import type {P2PGroupType, P2PPeerNodeType, P2PShareIndexType, P2PPullCreateParams} from '@/type/p2p';
import type {pathType} from '@/type/path';

const {t} = i18n.global;

const groupList = ref<P2PGroupType[]>([]);
const groupId = ref<number | undefined>(undefined);
const groupNo = computed(() => {
  const g = groupList.value.find(x => x.p2pGroupId === groupId.value);
  return g?.groupNo || '';
});

const members = ref<P2PPeerNodeType[]>([]);
const shares = ref<P2PShareIndexType[]>([]);
const loadingMembers = ref(false);
const loadingShares = ref(false);

const pathList = ref<pathType[]>([]);

const pullDialogVisible = ref(false);
const pullForm = ref<P2PPullCreateParams>({
  groupNo: '',
  transferType: 'manga',
  remoteMediaId: undefined,
  remoteMangaId: undefined,
  remoteChapterId: undefined,
  remoteName: '',
  receivedPath: '',
});

const detailDialogVisible = ref(false);
const selectedShare = ref<any | null>(null);

onMounted(async () => {
  await load_groups();
  await load_paths();
});

async function load_groups() {
  try {
    const res = await p2pGroupApi.list({page: 1, pageSize: 999});
    groupList.value = res?.list || res?.data?.list || [];
    if (groupList.value.length && !groupId.value) {
      groupId.value = groupList.value[0].p2pGroupId;
      await load_all();
    }
  } catch (err) {
    console.error('load groups failed:', err);
  }
}

async function load_paths() {
  try {
    const res = await pathApi.get(0);
    pathList.value = res?.list || [];
  } catch (err) {
    console.error('load paths failed:', err);
  }
}

async function on_group_change() {
  members.value = [];
  shares.value = [];
  if (groupId.value) await load_all();
}

async function load_all() {
  if (!groupNo.value) return;
  await Promise.all([load_members(), load_shares(true)]);
}

async function load_members() {
  if (!groupNo.value) return;
  loadingMembers.value = true;
  try {
    const res = await p2pPeerApi.members(groupNo.value);
    members.value = res?.list || res?.data?.list || res?.data || [];
  } catch (err) {
    console.error('load members failed:', err);
  } finally {
    loadingMembers.value = false;
  }
}

async function load_shares(fromTracker = false) {
  if (!groupNo.value) return;
  loadingShares.value = true;
  try {
    // 统一走 manifests 接口(摘要版,含 payloadTruncated 字段,供"查看详情"判断)
    // fromTracker=true → tracker 优先 + 本地缓存兜底
    // fromTracker=false → 仅本地缓存(不访问 tracker)
    const res = fromTracker
      ? await p2pPeerApi.manifests(groupNo.value, { sync: 1, fallback: 1 })
      : await p2pPeerApi.manifests(groupNo.value, { sync: 0, fallback: 1 });
    const data = res?.data || res;
    shares.value = data?.list || [];
  } catch (err) {
    console.error('load shares failed:', err);
  } finally {
    loadingShares.value = false;
  }
}

async function load_cache() {
  await load_shares(false);
}

function open_pull_dialog(row: P2PShareIndexType) {
  if (!groupNo.value) return;
  const transferType: 'media' | 'manga' = row.shareType === 'media' ? 'media' : 'manga';
  const remoteName = row.shareName || '';

  pullForm.value = {
    groupNo: groupNo.value,
    transferType,
    remoteMediaId: transferType === 'media' ? (row.remoteMediaId ?? undefined) : undefined,
    remoteMangaId: transferType === 'manga' ? (row.remoteMangaId ?? undefined) : undefined,
    remoteChapterId: undefined,
    remoteName,
    receivedPath: pathList.value[0]?.pathContent || '',
  };
  pullDialogVisible.value = true;
}

function open_detail_dialog(row: any) {
  if (!groupNo.value) return;
  selectedShare.value = {
    nodeId: row.nodeId,
    nodeName: row.nodeName,
    shareType: row.shareType,
    remoteMediaId: row.remoteMediaId ?? null,
    remoteMangaId: row.remoteMangaId ?? null,
    shareName: row.shareName,
    payloadTruncated: row.payloadTruncated ?? 0,
  };
  detailDialogVisible.value = true;
}

async function submit_pull() {
  if (!pullForm.value.receivedPath) {
    ElMessage.error(t('p2pPeers.receivedPath'));
    return;
  }
  if (pullForm.value.transferType === 'media' && !pullForm.value.remoteMediaId) {
    ElMessage.error('remoteMediaId missing');
    return;
  }
  if (pullForm.value.transferType === 'manga' && !pullForm.value.remoteMangaId) {
    ElMessage.error('remoteMangaId missing');
    return;
  }
  if (!pullForm.value.remoteName) {
    ElMessage.error('remoteName missing');
    return;
  }
  try {
    await p2pTransferApi.pull(pullForm.value);
    ElMessage.success(t('option.confirm'));
    pullDialogVisible.value = false;
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'pull failed');
  }
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
<style scoped lang="less">
.section-title {
  margin: 20px 0 10px;
  font-size: 16px;
  color: var(--el-color-primary);
}
</style>