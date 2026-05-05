<template>
  <div class="manga-setting-box manage-container">
    <div class="btn-box">
      <el-select v-model="filterStatus" :placeholder="t('p2pTransfer.status')" clearable style="width: 200px; margin-right: 10px" @change="load_table(1, browse.manageListPageSizeCache)">
        <el-option value="pending" :label="t('p2pTransfer.statusPending')"></el-option>
        <el-option value="running" :label="t('p2pTransfer.statusRunning')"></el-option>
        <el-option value="success" :label="t('p2pTransfer.statusSuccess')"></el-option>
        <el-option value="failed" :label="t('p2pTransfer.statusFailed')"></el-option>
        <el-option value="canceled" :label="t('p2pTransfer.statusCanceled')"></el-option>
      </el-select>
      <el-button type="primary" :icon="Refresh" @click="load_table(browse.manageListPage, browse.manageListPageSizeCache)">
        {{ $t('option.refresh') }}
      </el-button>
      <el-switch v-model="autoRefresh" style="margin-left: 16px" :active-text="$t('option.refresh')" />
    </div>

    <el-table :data="tableData" stripe border v-loading="loading">
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>
      <el-table-column prop="transferType" :label="t('p2pTransfer.transferType')" width="100"></el-table-column>
      <el-table-column prop="remoteName" :label="t('p2pTransfer.resourceName')" show-overflow-tooltip></el-table-column>
      <el-table-column prop="peerNodeId" :label="t('p2pTransfer.fromNodeId')" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="status" :label="t('p2pTransfer.status')" width="100">
        <template v-slot="scope">
          <el-tag :type="status_tag_type(scope.row.status)" size="small">
            {{ status_text(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="progress" :label="t('p2pTransfer.progress')" width="220">
        <template v-slot="scope">
          <el-progress :percentage="progress_percent(scope.row)" :status="scope.row.status === 'failed' ? 'exception' : (scope.row.status === 'success' ? 'success' : undefined)" />
          <span v-if="scope.row.totalBytes" class="progress-meta">
            {{ format_bytes(scope.row.downloadedBytes) }}/{{ format_bytes(scope.row.totalBytes) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="error" :label="t('p2pTransfer.errorMessage')" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="createTime" :label="t('createTime')" width="160"></el-table-column>
      <el-table-column :label="t('account.option')" width="180">
        <template v-slot="scope">
          <el-button v-if="scope.row.status === 'pending' || scope.row.status === 'running'" size="small" type="warning" @click="cancel_transfer(scope.row)">
            {{ t('p2pTransfer.cancel') }}
          </el-button>
          <el-button v-if="scope.row.status === 'failed' || scope.row.status === 'canceled'" size="small" type="success" @click="retry_transfer(scope.row)">
            {{ t('p2pTransfer.retry') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <table-pager ref="pager" :page-size="browse.manageListPageSize" @pageChange="load_table" :count="count" />
  </div>
</template>
<script lang="ts">
export default {name: 'p2p-transfer'};
</script>
<script setup lang="ts">
import {Refresh} from '@element-plus/icons-vue';
import {onMounted, onUnmounted, ref, watch} from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import {p2pTransferApi} from '@/api/p2p';
import type {P2PTransferType} from '@/type/p2p';

const browse = useBrowseStore();
const {t} = i18n.global;

const tableData = ref<P2PTransferType[]>([]);
const count = ref(0);
const loading = ref(false);
const filterStatus = ref<string>('');
const autoRefresh = ref(true);
let timer: any = null;

onMounted(() => {
  load_table(browse.manageListPage, browse.manageListPageSizeCache);
  start_timer();
});

onUnmounted(() => {
  stop_timer();
});

watch(autoRefresh, (v) => {
  if (v) start_timer(); else stop_timer();
});

function start_timer() {
  stop_timer();
  timer = setInterval(() => {
    if (!loading.value) load_table(browse.manageListPage, browse.manageListPageSizeCache);
  }, 5000);
}

function stop_timer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

async function load_table(page = 1, pageSize = 10) {
  loading.value = true;
  try {
    const res = await p2pTransferApi.list({page, pageSize, status: filterStatus.value || undefined});
    tableData.value = res?.list || res?.data?.list || [];
    count.value = res?.count || res?.data?.count || tableData.value.length;
    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
  } catch (err) {
    console.error('p2p transfer load failed:', err);
  } finally {
    loading.value = false;
  }
}

function progress_percent(row: P2PTransferType): number {
  if (typeof row.progress === 'number') {
    return Math.max(0, Math.min(100, Math.round(row.progress)));
  }
  const total = Number(row.totalBytes ?? 0);
  const downloaded = Number(row.downloadedBytes ?? 0);
  if (total > 0) {
    return Math.round((downloaded / total) * 100);
  }
  return row.status === 'success' ? 100 : 0;
}

function format_bytes(value: any): string {
  const v = Number(value ?? 0);
  if (!v || isNaN(v)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let n = v;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function status_tag_type(status: string) {
  switch (status) {
    case 'success': return 'success';
    case 'running': return 'primary';
    case 'failed': return 'danger';
    case 'canceled': return 'info';
    default: return 'warning';
  }
}

function status_text(status: string) {
  switch (status) {
    case 'pending': return t('p2pTransfer.statusPending');
    case 'running': return t('p2pTransfer.statusRunning');
    case 'success': return t('p2pTransfer.statusSuccess');
    case 'failed': return t('p2pTransfer.statusFailed');
    case 'canceled': return t('p2pTransfer.statusCanceled');
    default: return status;
  }
}

async function cancel_transfer(row: P2PTransferType) {
  if (!row.p2pTransferId) return;
  try {
    await p2pTransferApi.cancel(row.p2pTransferId);
    ElMessage.success(t('p2pTransfer.cancel'));
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.message || 'cancel failed');
  }
}

async function retry_transfer(row: P2PTransferType) {
  if (!row.p2pTransferId) return;
  try {
    await p2pTransferApi.retry(row.p2pTransferId);
    ElMessage.success(t('p2pTransfer.retry'));
    await load_table(browse.manageListPage, browse.manageListPageSizeCache);
  } catch (err: any) {
    ElMessage.error(err?.message || 'retry failed');
  }
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
<style scoped lang="less">
.progress-meta {
  display: inline-block;
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>