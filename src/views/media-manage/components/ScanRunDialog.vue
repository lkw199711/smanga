<template>
  <el-dialog v-model="visible" title="扫描记录" width="min(980px, 95vw)" destroy-on-close>
    <div v-if="view === 'list'">
      <div class="toolbar">
        <el-select v-model="statusFilter" clearable placeholder="全部状态" style="width: 150px" @change="loadRuns(1)">
          <el-option label="等待中" value="pending" />
          <el-option label="扫描中" value="running" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
        <el-button :loading="listLoading" @click="loadRuns(runPage)">刷新</el-button>
      </div>

      <el-table v-loading="listLoading" :data="runs" border stripe @row-click="row => openRun(row.scanRunId)">
        <el-table-column prop="scanRunId" label="ID" width="72" />
        <el-table-column label="状态" width="92">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="runType" label="类型" width="100" />
        <el-table-column prop="pathContent" label="扫描路径" min-width="260" show-overflow-tooltip />
        <el-table-column prop="message" label="消息" min-width="180" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="runCount > runPageSize"
        class="pagination"
        background
        layout="prev, pager, next"
        :current-page="runPage"
        :page-size="runPageSize"
        :total="runCount"
        @current-change="loadRuns" />
    </div>

    <div v-else v-loading="detailLoading">
      <div class="toolbar">
        <el-button @click="showList">返回记录</el-button>
        <el-button @click="currentRun && openRun(currentRun.scanRunId)">刷新</el-button>
        <span v-if="isActive" class="polling-hint">任务运行中，正在自动刷新</span>
      </div>

      <template v-if="currentRun">
        <el-alert v-if="currentRun.error" :title="currentRun.error" type="error" :closable="false" show-icon class="mb-4" />

        <el-descriptions :column="detailColumns" border>
          <el-descriptions-item label="任务 ID">{{ currentRun.scanRunId }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentRun.status)" size="small">{{ statusText(currentRun.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="类型">{{ currentRun.runType }}</el-descriptions-item>
          <el-descriptions-item label="触发方式">{{ currentRun.triggerType }}</el-descriptions-item>
          <el-descriptions-item label="扫描路径" :span="detailColumns">{{ currentRun.pathContent || '-' }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatTime(currentRun.startedAt) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatTime(currentRun.finishedAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="currentRun.message" label="消息" :span="detailColumns">{{ currentRun.message }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions v-if="summaryEntries.length" class="mt-4" :column="detailColumns" border>
          <el-descriptions-item v-for="item in summaryEntries" :key="item.key" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="report-title">
          <span>扫描明细（{{ itemCount }}）</span>
          <el-select v-model="levelFilter" clearable placeholder="全部级别" style="width: 130px" @change="loadItems">
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="错误" value="error" />
          </el-select>
        </div>
        <el-table :data="items" size="small" border max-height="360">
          <el-table-column label="级别" width="82">
            <template #default="scope">
              <el-tag :type="levelTagType(scope.row.level)" size="small">{{ levelText(scope.row.level) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="100" />
          <el-table-column prop="reasonCode" label="原因" width="190" show-overflow-tooltip />
          <el-table-column prop="reason" label="说明" min-width="220" show-overflow-tooltip />
          <el-table-column prop="targetName" label="对象" min-width="140" show-overflow-tooltip />
          <el-table-column prop="targetPath" label="路径" min-width="220" show-overflow-tooltip />
        </el-table>
        <el-pagination
          v-if="itemCount > itemPageSize"
          class="pagination"
          background
          layout="prev, pager, next"
          :current-page="itemPage"
          :page-size="itemPageSize"
          :total="itemCount"
          @current-change="loadItems" />
      </template>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed, onUnmounted, ref, watch} from 'vue';
import scanRunApi from '@/api/scan-run';
import type {ScanReportItem, ScanReportLevel, ScanRun, ScanRunStatus} from '@/type/scan';

const props = defineProps<{
  modelValue: boolean;
  mediaId?: number;
  initialScanRunId?: number | null;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});
const view = ref<'list' | 'detail'>('list');
const runs = ref<ScanRun[]>([]);
const runCount = ref(0);
const runPage = ref(1);
const runPageSize = 15;
const statusFilter = ref<ScanRunStatus | ''>('');
const listLoading = ref(false);
const detailLoading = ref(false);
const currentRun = ref<ScanRun | null>(null);
const items = ref<ScanReportItem[]>([]);
const itemCount = ref(0);
const itemPage = ref(1);
const itemPageSize = 100;
const levelFilter = ref<ScanReportLevel | ''>('');
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let pollFailures = 0;

const isActive = computed(() => currentRun.value?.status === 'pending' || currentRun.value?.status === 'running');
const detailColumns = computed(() => (window.innerWidth < 720 ? 1 : 4));
const summaryEntries = computed(() => {
  if (!currentRun.value?.summaryJson) return [];
  try {
    const summary = JSON.parse(currentRun.value.summaryJson) as Record<string, unknown>;
    const labels: Record<string, string> = {
      mangaFound: '发现漫画',
      chapterFound: '发现章节',
      mangaAdded: '新增漫画',
      mangaDeleted: '删除漫画',
      skipped: '跳过',
      warnings: '警告',
      errors: '错误',
    };
    return Object.entries(summary)
      .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
      .map(([key, value]) => ({key, label: labels[key] || key, value}));
  } catch {
    return [];
  }
});

watch(
  () => props.modelValue,
  value => {
    if (!value) {
      stopPolling();
      return;
    }
    if (props.initialScanRunId) openRun(props.initialScanRunId);
    else loadRuns(1);
  }
);

watch(
  () => props.initialScanRunId,
  value => {
    if (props.modelValue && value) openRun(value);
  }
);

onUnmounted(stopPolling);

async function loadRuns(page = 1) {
  stopPolling();
  view.value = 'list';
  runPage.value = page;
  listLoading.value = true;
  try {
    const result = await scanRunApi.get(page, runPageSize, {
      mediaId: props.mediaId,
      status: statusFilter.value || undefined,
    });
    runs.value = result.list || [];
    runCount.value = Number(result.count || 0);
  } finally {
    listLoading.value = false;
  }
}

async function openRun(scanRunId: number) {
  stopPolling();
  view.value = 'detail';
  detailLoading.value = true;
  try {
    currentRun.value = await scanRunApi.show(scanRunId);
    await loadItems(1);
    pollFailures = 0;
    if (isActive.value) schedulePolling(scanRunId);
  } finally {
    detailLoading.value = false;
  }
}

async function loadItems(page = 1) {
  if (!currentRun.value) return;
  itemPage.value = typeof page === 'number' ? page : 1;
  const result = await scanRunApi.items(currentRun.value.scanRunId, itemPage.value, itemPageSize, {
    level: levelFilter.value || undefined,
  });
  items.value = result.list || [];
  itemCount.value = Number(result.count || 0);
}

function schedulePolling(scanRunId: number) {
  stopPolling();
  const delay = Math.min(2000 * 2 ** pollFailures, 10000);
  pollTimer = setTimeout(async () => {
    if (!props.modelValue || view.value !== 'detail') return;
    try {
      currentRun.value = await scanRunApi.show(scanRunId);
      await loadItems(itemPage.value);
      pollFailures = 0;
      if (isActive.value) schedulePolling(scanRunId);
    } catch {
      pollFailures += 1;
      schedulePolling(scanRunId);
    }
  }, delay);
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function showList() {
  currentRun.value = null;
  items.value = [];
  loadRuns(runPage.value);
}

function statusTagType(status: ScanRunStatus) {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'running') return 'primary';
  return 'warning';
}

function statusText(status: ScanRunStatus) {
  return {pending: '等待中', running: '扫描中', success: '成功', failed: '失败'}[status] || status;
}

function levelTagType(level: ScanReportLevel) {
  if (level === 'error') return 'danger';
  if (level === 'warning') return 'warning';
  return 'info';
}

function levelText(level: ScanReportLevel) {
  return {info: '信息', warning: '警告', error: '错误'}[level] || level;
}

function formatTime(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '-';
}
</script>

<style scoped>
.toolbar,
.report-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.report-title {
  justify-content: space-between;
  margin-top: 18px;
  font-weight: 600;
}

.pagination {
  justify-content: flex-end;
  margin-top: 14px;
}

.polling-hint {
  color: var(--el-color-primary);
  font-size: 13px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
