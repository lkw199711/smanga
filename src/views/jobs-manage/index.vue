<template>
  <div class="manga-setting-index">
    <div class="manga-setting-box">
      <!--表格-->
      <el-table :data="tableData" stripe border>
        <el-table-column type="index" :label="t('account.serial')" width="54">
        </el-table-column>

        <el-table-column prop="id" :label="t('jobsManage.id')" width="100">
        </el-table-column>

        <el-table-column prop="name" :label="t('jobsManage.queue')" width="86">
        </el-table-column>

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
            <el-button size="small" type="primary" :icon="Edit" @click="edit_manga(scope.$index, scope.row)">{{
              t('option.check') }}
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="delete_manga(scope.$index, scope.row)">{{
              t('option.delete') }}
            </el-button>
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
  </div>
</template>

<script lang="ts">
export default {
  name: 'jobs-manage',
}
</script>
<script setup lang="ts">
import { Delete, Edit } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import jobsApi from '@/api/jobs';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import ClipboardJS from 'clipboard'
import useBrowseStore from '@/store/browse';

const browse = useBrowseStore();
const { t } = i18n.global;

const pager = ref();
let tasks: any = [];
let count = ref(0);
let tableData = ref([]);
let editMangaDialog = ref(false);
let payload = ref('');

onMounted(() => {
  browse.manageListPage = 1;
  browse.manageListPageSizeCache = 10;
  reload_table();
})

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
  tableData.value = tasks.slice((page - 1) * pageSize, page * pageSize);;

  browse.manageListPage = page;
  browse.manageListPageSizeCache = pageSize;
}
/**
 * 重载数据 页码不变
 */
async function reload_table() {
  const tasksResponse = await jobsApi.get();
  tasks = tasksResponse.list;
  count.value = tasksResponse.count;
  load_table(browse.manageListPage, browse.manageListPageSize);
}
/**
 * 编辑漫画
 * @param index
 * @param row
 */
function edit_manga(index: number, row: any) {
  editMangaDialog.value = true;
  payload.value = JSON.stringify(row, null, 2);
  console.log('payload', payload.value);
}

/**
 * 执行修改请求
 */
async function copy_payload() {
  const clipboard = new ClipboardJS('#copy-btn', {
    text() {
      return payload.value
    }
  })
  clipboard.on('success', () => {
    ElMessage.success('复制成功')
  })
  clipboard.on('error', () => {
    ElMessage.error('复制失败')
  })
}

/**
 * 删除漫画
 * */
async function delete_manga(index: number, row: any) {
  ElMessageBox.confirm(
    t('jobsManage.deleteConfirm'),
    t('mangaManage.deleteTitle'),
    {
      type: 'warning',
    }
  )
    .then(async () => {
      const res = await jobsApi.delete(row.id);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => { });
}
</script>

<style scoped lang='less'>
@import '@/style/color.less';

.manga-setting-index {
  padding: 20px;
}

.manga-setting-box {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  transition: all 0.3s ease;
}

.btn-box {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// 表格样式
.el-table {
  border-radius: 8px;
  overflow: hidden;

  .el-table__header-wrapper {
    background-color: #f5f7fa;
  }

  .el-table__body tr {
    transition: all 0.2s ease;

    &:hover {
      background-color: #f9fafc;
      transform: scale(1.003);
    }
  }

  .el-table__body tr.el-table__row--striped {
    background-color: #fafafa;
  }

  .el-table__body tr.el-table__row--striped:hover {
    background-color: #f5f7fa;
  }
}

// 按钮样式
.el-button {
  transition: all 0.3s ease;
  border-radius: 6px;

  &.el-button--primary {
    background-color: @s-primary-color;
    border-color: @s-primary-color;

    &:hover {
      background-color: @s-primary-color-hover;
      border-color: @s-primary-color-hover;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  &.el-button--danger {
    background-color: #ff4d4f;
    border-color: #ff4d4f;

    &:hover {
      background-color: #ff7875;
      border-color: #ff7875;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

// 对话框样式
.el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.el-dialog__header {
  background-color: #f5f7fa;
  padding: 16px 24px;
}

.el-dialog__title {
  font-size: 16px;
  font-weight: 500;
}

.el-dialog__body {
  padding: 24px;
}

#payload {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 14px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 6px;
  max-height: 400px;
  overflow-y: auto;
}

// 响应式设计
@media only screen and (min-width: 1200px) {
  .manga-setting-box {
    width: 100%;
    max-width: 1200px;
    margin: 30px auto;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .manga-setting-box {
    width: 100%;
    max-width: 900px;
    margin: 20px auto;
  }
}

@media only screen and (max-width: 767px) {
  .manga-setting-box {
    width: 100%;
    margin: 10px auto;
    padding: 16px;
  }

  .el-table {
    font-size: 12px;
  }

  .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  #payload {
    font-size: 12px;
  }
}
</style>
