<template>
  <div class="manga-setting-box manage-container">
    <div class="btn-box">
      <el-button type="primary" :icon="Refresh" @click="reload_table">{{ $t('option.refresh') }}</el-button>
      <el-button
        type="danger"
        :icon="Delete"
        :disabled="selectedRows.length === 0"
        @click="batch_delete_job"
      >
        {{ $t('option.delete') }}
      </el-button>
    </div>
    <!--表格-->
    <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column type="index" :label="t('account.serial')" width="54"></el-table-column>

      <el-table-column prop="id" :label="t('jobsManage.id')" width="100"></el-table-column>

      <el-table-column prop="name" :label="t('jobsManage.queue')" width="86"></el-table-column>

      <el-table-column prop="status" :label="t('jobsManage.status')" width="100">
        <template v-slot="scope">
          <span v-if="scope.row.failedReason">{{ t('jobsManage.failed') }}</span>
          <span v-else-if="scope.row.finishedOn">{{ t('jobsManage.completed') }}</span>
          <span v-else-if="scope.row.processedOn">{{ t('jobsManage.active') }}</span>
          <span v-else>{{ t('jobsManage.waiting') }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="timestamp" :label="t('createTime')" width="160">
        <template v-slot="scope">
          {{ new Date(scope.row.timestamp).toLocaleString() }}
        </template>
      </el-table-column>

      <el-table-column :label="t('account.option')">
        <template v-slot="scope">
          <el-button size="small" type="primary" :icon="Edit" @click="edit_manga(scope.$index, scope.row)">{{ t('option.check') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="delete_manga(scope.$index, scope.row)">{{ t('option.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <table-pager ref="pager" :page-size="browse.manageListPageSize" @pageChange="load_table" :count="count" />

    <el-dialog :title="t('jobsManage.details')" v-model="editMangaDialog" :before-close="dialog_close">
      <pre id="payload"><code>{{ payload }}</code></pre>

      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="btn-box">
            <el-button type="primary" @click="copy_payload" id="copy-btn">{{ t('option.copy') }}</el-button>
            <el-button type="warning" @click="editMangaDialog = false">{{ t('option.cancel') }}</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'jobs-manage',
};
</script>
<script setup lang="ts">
import {Delete, Edit, Refresh} from '@element-plus/icons-vue';
import {onMounted, ref} from 'vue';
import jobsApi from '@/api/jobs';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import ClipboardJS from 'clipboard';
import useBrowseStore from '@/store/browse';

const browse = useBrowseStore();
const {t} = i18n.global;

const pager = ref();
let tasks: any = [];
let count = ref(0);
let tableData = ref([]);
let editMangaDialog = ref(false);
let payload = ref('');
let loading = ref(false);
let selectedRows = ref<any[]>([]);

onMounted(() => {
  browse.manageListPage = 1;
  browse.manageListPageSizeCache = 10;
  reload_table();
});

/***
 * 关闭弹窗
 */
function dialog_close() {
  editMangaDialog.value = false;
}

/**
 * 加载表格数据
 */
async function load_table(page = 1, pageSize = 10) {
  loading.value = true;
  try {
    tableData.value = tasks.slice((page - 1) * pageSize, page * pageSize);

    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
  } finally {
    loading.value = false;
  }
}

/**
 * 处理表格选择变化
 */
function handleSelectionChange(val: any[]) {
  selectedRows.value = val;
}

/**
 * 批量删除任务
 */
async function batch_delete_job() {
  const ids = selectedRows.value.map(row => row.id);
  
  ElMessageBox.confirm(t('jobsManage.confirm.batchDeleteText'), t('jobsManage.confirm.batchDeleteTitle'), {
    confirmButtonText: t('option.confirm'),
    cancelButtonText: t('option.cancel'),
    type: 'warning'
  })
    .then(async () => {
      loading.value = true;
      try {
        await jobsApi.batch_delete(ids);
        selectedRows.value = [];
        reload_table();
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {});
}
/**
 * 重载数据 页码不变
 */
async function reload_table() {
  loading.value = true;
  try {
    const tasksResponse = await jobsApi.get();
    tasks = tasksResponse.list;
    count.value = tasksResponse.count;
    selectedRows.value = [];
    load_table(browse.manageListPage, browse.manageListPageSize);
  } finally {
    loading.value = false;
  }
}
/**
 * 编辑漫画
 * @param index
 * @param row
 */
function edit_manga(index: number, row: any) {
  editMangaDialog.value = true;
  payload.value = JSON.stringify(row, null, 2);
}

/**
 * 执行修改请求
 */
async function copy_payload() {
  const clipboard = new ClipboardJS('#copy-btn', {
    text() {
      return payload.value;
    },
  });
  clipboard.on('success', () => {
    ElMessage.success('复制成功');
  });
  clipboard.on('error', () => {
    ElMessage.error('复制失败');
  });
}

/**
 * 删除任务
 * */
async function delete_manga(index: number, row: any) {
  ElMessageBox.confirm(t('jobsManage.deleteConfirm'), t('mangaManage.deleteTitle'), {
    confirmButtonText: t('option.confirm'),
    cancelButtonText: t('option.cancel'),
    type: 'warning',
  })
    .then(async () => {
      loading.value = true;
      try {
        const res = await jobsApi.delete(row.id);

        if (res.code === 0) {
          ElMessage.success(t('message.deleteSuccess'));
          reload_table();
        }
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {});
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
