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
      <el-table-column prop="groupNo" :label="t('p2pGroup.groupNo')" width="180"></el-table-column>
      <el-table-column prop="groupName" :label="t('p2pGroup.groupName')" width="160"></el-table-column>
      <el-table-column prop="describe" :label="t('p2pGroup.groupDescribe')" show-overflow-tooltip></el-table-column>
      <el-table-column prop="trackerUrl" :label="t('p2pGroup.trackerUrl')" width="220" show-overflow-tooltip></el-table-column>
      <el-table-column prop="memberCount" :label="t('p2pGroup.memberCount')" width="90"></el-table-column>
      <el-table-column prop="shareCount" :label="t('p2pGroup.shareCount')" width="90"></el-table-column>
      <el-table-column prop="createTime" :label="t('createTime')" width="160"></el-table-column>
      <el-table-column :label="t('account.option')" width="180">
        <template v-slot="scope">
          <el-button size="small" type="danger" :icon="Delete" @click="leave_group(scope.row)">
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
          <el-input v-model="createForm.password" placeholder="可选"></el-input>
        </el-form-item>
        <el-form-item label="最大成员数">
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
          <el-input v-model="joinForm.password" placeholder="可选"></el-input>
        </el-form-item>
        <el-form-item label="邀请码">
          <el-input v-model="joinForm.inviteCode" placeholder="可选"></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <div class="btn-box">
          <el-button type="primary" @click="submit_join">{{ $t('option.confirm') }}</el-button>
          <el-button @click="joinDialogVisible = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {name: 'p2p-group'};
</script>
<script setup lang="ts">
import {Delete, Plus, Refresh, Connection} from '@element-plus/icons-vue';
import {onMounted, ref} from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import {p2pGroupApi} from '@/api/p2p';
import type {P2PGroupType, P2PGroupCreateParams, P2PGroupJoinParams} from '@/type/p2p';

const browse = useBrowseStore();
const {t} = i18n.global;

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

onMounted(() => {
  load_table(browse.manageListPage, browse.manageListPageSizeCache);
});

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
</script>

<style scoped lang="less" src="@/style/manage.less"></style>