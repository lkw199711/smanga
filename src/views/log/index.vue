<template>
  <div class="log-container">
    <div class="log-header">
      <h2 class="log-title">系统日志</h2>
      <div class="log-filters">
        <el-select v-model="selectedLevel" placeholder="筛选日志级别" size="small" class="filter-select">
          <el-option label="全部" value="0"></el-option>
          <el-option label="调试" value="1"></el-option>
          <el-option label="信息" value="2"></el-option>
          <el-option label="错误" value="3"></el-option>
          <el-option label="警告" value="4"></el-option>
        </el-select>
      </div>
    </div>
    <div class="log-content">
      <el-card v-for="item in filteredLogs" :key="item.logId" :class="['log-item-card', `log-level-${item.logLevel}`]">
        <div class="log-item-header">
          <div class="log-level-badge" :class="logBadgeClass(item.logLevel)">
            <i :class="logIconClass(item.logLevel)"></i>
            <span class="log-level-text">{{ logLevelText(item.logLevel) }}</span>
          </div>
          <span class="log-time">{{ item.createTime }}</span>
        </div>
        <div class="log-message">{{ item.message }}</div>
      </el-card>
      <div v-if="filteredLogs.length === 0" class="empty-log">
        <el-empty description="暂无日志数据"></el-empty>
      </div>
    </div>
    <!-- 分页 -->
    <div class="log-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 15, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="count"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import logApi from '@/api/log';
import { computed, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/empty/style/css';
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/es/components/pagination/style/css';
import 'element-plus/es/components/card/style/css';
import 'element-plus/es/components/badge/style/css';
import 'element-plus/es/components/icon/style/css';

const count = ref(0);
const currentPage = ref(1);
const pageSize = ref(15);
const selectedLevel = ref('0');

type logItemType = {
  logId: number;
  logType: string;
  logLevel: number;
  message: string;
  createTime: string;
}

const list = ref<logItemType[]>([
  {
    logId: 1,
    logType: 'error',
    logLevel: 1,
    message: '无日志信息',
    createTime: '',
  },
]);

const filteredLogs = computed(() => {
  if (selectedLevel.value === '0') {
    return list.value;
  }
  return list.value.filter(item => item.logLevel === Number(selectedLevel.value));
});

const logLevelText = (level: number) => {
  switch (level) {
    case 1: return '调试';
    case 2: return '信息';
    case 3: return '错误';
    case 4: return '警告';
    default: return '未知';
  }
};

const logBadgeClass = (level: number) => {
  switch (level) {
    case 1: return 'debug-badge';
    case 2: return 'info-badge';
    case 3: return 'error-badge';
    case 4: return 'warning-badge';
    default: return 'default-badge';
  }
};

const logIconClass = (level: number) => {
  switch (level) {
    case 1: return 'el-icon-info';
    case 2: return 'el-icon-success';
    case 3: return 'el-icon-error';
    case 4: return 'el-icon-warning';
    default: return 'el-icon-question';
  }
};

async function load_table(page: number, pageSize: number) {
  try {
    const res: any = await logApi.get_log(page, pageSize);
    count.value = res.count;
    list.value = res.list;
  } catch (error) {
    ElMessage.error('加载日志失败');
    console.error('Failed to load logs:', error);
  }
}

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  load_table(currentPage.value, size);
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  load_table(current, pageSize.value);
};

onMounted(async () => {
  load_table(currentPage.value, pageSize.value);
});
</script>

<style lang="less" scoped>
.log-container {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.log-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0;
}

.log-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  width: 140px;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.log-item-card {
  margin-bottom: 12px;
  transition: all 0.3s ease;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.log-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.log-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-level-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.debug-badge {
  background-color: #f0f9eb;
  color: #67c23a;
}

.info-badge {
  background-color: #f4f4f5;
  color: #909399;
}

.error-badge {
  background-color: #fef0f0;
  color: #f56c6c;
}

.warning-badge {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.log-level-text {
  margin-left: 4px;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

.log-message {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  word-break: break-word;
  white-space: pre-wrap;
}

.log-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.empty-log {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
}
</style>
