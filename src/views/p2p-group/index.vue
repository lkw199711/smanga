<template>
  <div class="manga-setting-box manage-container">
    <!-- 表头按钮 -->
    <div class="btn-box">
      <el-button type="primary" :icon="Refresh" @click="refresh_groups">{{ $t('p2pGroup.refresh') }}</el-button>
      <el-button class="add-btn" type="success" :icon="Plus" @click="open_create_dialog">{{ $t('p2pGroup.create') }}</el-button>
      <el-button type="warning" :icon="Connection" @click="open_join_dialog">{{ $t('p2pGroup.join') }}</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" stripe border v-loading="loading">
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
      <el-table-column prop="groupNo" :label="t('p2pGroup.groupNo')" width="110"></el-table-column>
      <el-table-column prop="groupName" :label="t('p2pGroup.groupName')" width="160"></el-table-column>
      <el-table-column prop="describe" :label="t('p2pGroup.groupDescribe')" show-overflow-tooltip></el-table-column>
      <el-table-column :label="t('p2pGroup.role')" width="80">
        <template v-slot="scope">
          <el-tag size="small" :type="scope.row.isOwner ? 'warning' : 'info'">
            {{ scope.row.isOwner ? t('p2pGroup.roleOwner') : t('p2pGroup.roleMember') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="trackerUrl" :label="t('p2pGroup.trackerUrl')" width="220" show-overflow-tooltip></el-table-column>
      <el-table-column prop="memberCount" :label="t('p2pGroup.memberCount')" width="80"></el-table-column>
      <el-table-column prop="createTime" :label="t('createTime')" width="160"></el-table-column>
      <el-table-column :label="t('account.option')" width="280" fixed="right">
        <template v-slot="scope">
          <el-button size="small" type="primary" :icon="View" @click="open_detail(scope.row)">
            {{ t('p2pGroup.detail') }}
          </el-button>
          <el-button
            v-if="scope.row.isOwner"
            size="small"
            type="danger"
            :icon="CircleClose"
            @click="dismiss_group(scope.row)"
          >
            {{ t('p2pGroup.dismiss') }}
          </el-button>
          <el-button
            v-else
            size="small"
            type="danger"
            :icon="Delete"
            @click="leave_group(scope.row)"
          >
            {{ t('p2pGroup.leave') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <table-pager ref="pager" :page-size="browse.manageListPageSize" @pageChange="load_table" :count="count" />

    <!-- 创建群组对话框 -->
    <el-dialog v-model="createDialogVisible" :title="$t('p2pGroup.create')" :close-on-click-modal="false" width="520px">
      <el-form :model="createForm" label-width="120px">
        <el-form-item :label="t('p2pGroup.groupName')" required>
          <el-input v-model="createForm.groupName" placeholder=""></el-input>
        </el-form-item>
        <el-form-item :label="t('p2pGroup.groupDescribe')">
          <el-input v-model="createForm.describe" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item :label="t('p2pGroup.groupSecret')">
          <el-input v-model="createForm.password" :placeholder="t('p2pGroup.optional')"></el-input>
        </el-form-item>
        <el-form-item :label="t('p2pGroup.maxMembers')">
          <el-input-number v-model="createForm.maxMembers" :min="1" :max="9999" />
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <div class="btn-box">
          <el-button type="primary" @click="submit_create">{{ $t('option.confirm') }}</el-button>
          <el-button @click="createDialogVisible = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 加入群组对话框 -->
    <el-dialog v-model="joinDialogVisible" :title="$t('p2pGroup.join')" :close-on-click-modal="false" width="520px">
      <el-form :model="joinForm" label-width="120px">
        <el-form-item :label="t('p2pGroup.groupNo')" required>
          <el-input v-model="joinForm.groupNo"></el-input>
        </el-form-item>
        <el-form-item :label="t('p2pGroup.groupSecret')">
          <el-input v-model="joinForm.password" :placeholder="t('p2pGroup.optional')"></el-input>
        </el-form-item>
        <el-form-item :label="t('p2pGroup.inviteCode')">
          <el-input v-model="joinForm.inviteCode" :placeholder="t('p2pGroup.optional')"></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <div class="btn-box">
          <el-button type="primary" @click="submit_join">{{ $t('option.confirm') }}</el-button>
          <el-button @click="joinDialogVisible = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 群组详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="t('p2pGroup.detailTitle')"
      :close-on-click-modal="false"
      width="900px"
      top="6vh"
    >
      <div v-if="detailData" v-loading="detailLoading">
        <el-alert
          v-if="!detailData.fromTracker"
          :title="t('p2pGroup.trackerOffline')"
          type="warning"
          show-icon
          :closable="false"
          style="margin-bottom: 12px"
        />
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item :label="t('p2pGroup.groupNo')">{{ detailData.local.groupNo }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.groupName')">{{ detailData.local.groupName }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.ownerNodeId')" :span="2">
            {{ detailData.local.ownerNodeId || '-' }}
            <el-tag v-if="isOwnerOfDetail" size="small" type="warning" style="margin-left: 6px">
              {{ t('p2pGroup.youAreOwner') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.groupDescribe')" :span="2">
            {{ detailData.local.describe || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.memberCount')">
            {{ detailData.remote ? detailData.remote.memberCount : detailData.local.memberCount }}
            <template v-if="detailData.remote && detailData.remote.maxMembers">
              / {{ detailData.remote.maxMembers }}
            </template>
          </el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.trackerUrl')">{{ detailData.local.trackerUrl || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('createTime')">{{ detailData.local.createTime }}</el-descriptions-item>
          <el-descriptions-item :label="t('p2pGroup.lastSyncTime')">{{ detailData.local.lastSyncTime || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h3 class="section-title">{{ t('p2pGroup.memberList') }}</h3>
        <el-table :data="detailData.members" stripe border size="small" max-height="380">
          <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
          <el-table-column prop="nodeId" :label="t('p2pPeers.nodeId')" width="240" show-overflow-tooltip>
            <template v-slot="scope">
              <span>{{ scope.row.nodeId }}</span>
              <el-tag v-if="scope.row.nodeId === selfNodeId" size="small" type="success" style="margin-left: 4px">
                {{ t('p2pGroup.you') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nodeName" :label="t('p2pPeers.nodeName')" width="160"></el-table-column>
          <el-table-column :label="t('p2pGroup.role')" width="90">
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
          <el-table-column label="Public" width="220">
            <template v-slot="scope">
              <span v-if="scope.row.publicUrl">{{ scope.row.publicUrl }}</span>
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
                :disabled="!can_kick(scope.row)"
                @click="kick_member(scope.row)"
              >
                {{ t('p2pGroup.kick') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {name: 'p2p-group'};
</script>
<script setup lang="ts">
import {Delete, Plus, Refresh, Connection, View, CircleClose} from '@element-plus/icons-vue';
import {computed, onMounted, ref} from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import {Cookies} from '@/utils';
import {p2pGroupApi} from '@/api/p2p';
import type {P2PGroupType, P2PGroupCreateParams, P2PGroupJoinParams} from '@/type/p2p';

const browse = useBrowseStore();
const {t} = i18n.global;

interface MemberRow {
  nodeId: string;
  nodeName: string | null;
  role: string;
  online: number;
  publicUrl: string | null;
  lastHeartbeat: string | null;
  joinTime: string;
}

interface GroupDetail {
  local: P2PGroupType;
  remote: any | null;
  members: MemberRow[];
  fromTracker: boolean;
}

const tableData = ref<P2PGroupType[]>([]);
const count = ref(0);
const loading = ref(false);

const createDialogVisible = ref(false);
const createForm = ref<P2PGroupCreateParams>({
  groupName: '',
  describe: '',
  password: '',
  maxMembers: 50,
});

const joinDialogVisible = ref(false);
const joinForm = ref<P2PGroupJoinParams>({
  groupNo: '',
  password: '',
  inviteCode: '',
});

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<GroupDetail | null>(null);

const selfNodeId = ref('');
const isAdmin = computed(() => Cookies.getRole() === 'admin');
const isOwnerOfDetail = computed(() =>
  !!detailData.value && detailData.value.local.isOwner === 1,
);

onMounted(async () => {
  await load_self_node();
  load_table(browse.manageListPage, browse.manageListPageSizeCache);
});

async function load_self_node() {
  try {
    const res = await p2pGroupApi.whoami();
    selfNodeId.value = res?.data?.nodeId || res?.nodeId || '';
  } catch (err) {
    console.warn('[p2p-group] whoami failed:', err);
  }
}

async function load_table(page = 1, pageSize = 10) {
  loading.value = true;
  try {
    const res = await p2pGroupApi.list({page, pageSize});
    tableData.value = res?.list || res?.data?.list || [];
    count.value = res?.count || res?.data?.count || tableData.value.length;
    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
  } catch (err) {
    console.error('p2p group load failed:', err);
  } finally {
    loading.value = false;
  }
}

async function refresh_groups() {
  loading.value = true;
  try {
    await p2pGroupApi.refresh();
    ElMessage.success(t('option.refresh'));
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err) {
    console.error('p2p group refresh failed:', err);
  } finally {
    loading.value = false;
  }
}

function open_create_dialog() {
  createForm.value = {groupName: '', describe: '', password: '', maxMembers: 50};
  createDialogVisible.value = true;
}

function open_join_dialog() {
  joinForm.value = {groupNo: '', password: '', inviteCode: ''};
  joinDialogVisible.value = true;
}

async function submit_create() {
  if (!createForm.value.groupName.trim()) {
    ElMessage.error(t('p2pGroup.groupName'));
    return;
  }
  try {
    await p2pGroupApi.create(createForm.value);
    ElMessage.success(t('option.confirm'));
    createDialogVisible.value = false;
    await load_table(1, browse.manageListPageSizeCache);
  } catch (err: any) {
    console.error('[p2p] create group failed:', err?.response || err);
    ElMessage.error(err?.response?.data?.message || err?.message || 'create group failed');
  }
}

async function submit_join() {
  if (!joinForm.value.groupNo.trim()) {
    ElMessage.error(t('p2pGroup.groupNo'));
    return;
  }
  try {
    await p2pGroupApi.join(joinForm.value);
    ElMessage.success(t('option.confirm'));
    joinDialogVisible.value = false;
    await load_table(1, browse.manageListPageSizeCache);
  } catch (err: any) {
    console.error('[p2p] join group failed:', err?.response || err);
    ElMessage.error(err?.response?.data?.message || err?.message || 'join group failed');
  }
}

async function leave_group(row: P2PGroupType) {
  try {
    await ElMessageBox.confirm(t('p2pGroup.leaveConfirm'), t('option.warning'), {
      confirmButtonText: t('option.confirm'),
      cancelButtonText: t('option.cancel'),
      type: 'warning',
    });
  } catch {
    return;
  }
  try {
    await p2pGroupApi.leave(row.groupNo);
    ElMessage.success(t('option.confirm'));
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.message || 'leave group failed');
  }
}

async function dismiss_group(row: P2PGroupType) {
  try {
    await ElMessageBox.confirm(
      t('p2pGroup.dismissConfirm', {groupNo: row.groupNo}),
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
    await p2pGroupApi.dismiss(row.groupNo);
    ElMessage.success(t('p2pGroup.dismissOk'));
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'dismiss failed');
  }
}

async function open_detail(row: P2PGroupType) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;
  try {
    const res = await p2pGroupApi.detail(row.groupNo);
    detailData.value = (res?.data ?? res) as GroupDetail;
  } catch (err: any) {
    console.error('[p2p-group] detail failed:', err?.response || err);
    ElMessage.error(err?.response?.data?.message || err?.message || 'detail failed');
    detailVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
}

/** 当前用户是否有踢出 row 的权限:必须是群主,且 row 不是群主自己且不是当前节点 */
function can_kick(row: MemberRow): boolean {
  if (!detailData.value) return false;
  if (row.role === 'owner') return false;
  if (row.nodeId === selfNodeId.value) return false;
  // 仅群主可踢人(走 /p2p/group/kick)
  // 系统管理员可在 tracker-admin 页面操作,此处不重复入口
  return isOwnerOfDetail.value;
}

async function kick_member(row: MemberRow) {
  if (!detailData.value) return;
  if (!can_kick(row)) return;
  try {
    await ElMessageBox.confirm(
      t('p2pGroup.kickConfirm', {nodeName: row.nodeName || row.nodeId}),
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
    await p2pGroupApi.kick(detailData.value.local.groupNo, row.nodeId);
    ElMessage.success(t('p2pGroup.kickOk'));
    await open_detail(detailData.value.local);
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'kick failed');
  }
}

// 显式引用,避免 unused-import 报错(模板已使用)
void isAdmin;
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
<style scoped lang="less">
.section-title {
  margin: 12px 0 8px;
  font-size: 14px;
  color: #606266;
}
</style>