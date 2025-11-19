<template>
  <div class="path-setting-box manage-container">
    <!--操作按钮区域-->
    <div class="btn-box">
      <el-button type="danger" :icon="Delete" :disabled="selectedRows.length === 0" @click="batch_delete_path">{{ $t('path.button.batchDelete') }}</el-button>
    </div>
    <!--表格-->
    <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="index" :label="$t('account.serial')" width="54"></el-table-column>

      <el-table-column prop="mediaId" :label="$t('mediaManage.id')" width="80"></el-table-column>

      <el-table-column prop="pathId" :label="$t('path.id')" width="80"></el-table-column>

      <el-table-column prop="pathContent" :label="$t('path.path')" width="160"></el-table-column>

      <el-table-column prop="createTime" :label="$t('path.createTime')" width="170"></el-table-column>

      <el-table-column :label="$t('account.option')">
        <template v-slot="scope">
          <el-button size="small" type="primary" :icon="Edit" @click="edit_path(scope.$index, scope.row)">{{ $t('path.button.edit') }}</el-button>
          <el-button size="small" type="success" :icon="RefreshRight" @click="scan_path(scope.$index, scope.row)">{{ $t('path.button.update') }}</el-button>
          <el-button size="small" type="warning" :icon="Refresh" @click="rescan_path(scope.$index, scope.row)">{{ $t('path.button.re') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="delete_path(scope.$index, scope.row)">{{ $t('option.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <table-pager ref="pager" @pageChange="load_table" :page-size="browse.manageListPageSize" :count="count" />

    <!--编辑路径弹框-->
    <el-dialog
      :title="$t('path.modify')"
      v-model="editPathDialogVisible"
      :before-close="
        () => {
          editPathDialogVisible = false;
        }
      ">
      <el-form :model="pathForm" label-width="100px">
        <el-form-item :label="$t('path.form.name')">
          <el-input disabled v-model="pathForm.pathContent" />
        </el-form-item>

        <!--扫描字段-->
        <p class="s-form-title">{{ $t('mediaManage.title.scan') }}</p>
        <!-- 自动扫描 -->
        <el-form-item :label="$t('mediaManage.form.autoScan')">
          <el-switch v-model.number="pathForm.autoScan" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item :label="$t('path.form.include')">
          <el-input v-model="pathForm.include" :placeholder="$t('path.place.include')" />
        </el-form-item>
        <el-form-item :label="$t('path.form.exclude')">
          <el-input v-model="pathForm.exclude" :placeholder="$t('path.place.exclude')" />
        </el-form-item>

        <div class="form-note mt-4 text-gray-500 text-sm">
          <p>• {{ $t('path.note.disabledContent') }}</p>
          <p>• {{ $t('mediaManage.note.autoScan') }}</p>
          <p>• {{ $t('path.note.clude', ['(aaa|bbb|ccc)']) }}</p>
        </div>
      </el-form>

      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="dialog-btn-box">
            <el-button type="primary" @click="save_path">{{ $t('option.confirm') }}</el-button>
            <el-button type="warning" @click="cancel_edit_path">{{ $t('option.cancel') }}</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {name: 'path-manage'};
</script>

<script setup lang="ts">
import {Delete, Edit, Refresh, RefreshRight} from '@element-plus/icons-vue';
import {ref, reactive, onMounted} from 'vue';
import pathApi from '@/api/path';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';

const browse = useBrowseStore();

const {t} = i18n.global;

const editPathDialogVisible = ref(false);
const count = ref(0);
const tableData = ref([]);
const selectedRows = ref([]);
const pathForm = reactive({
  pathId: 0,
  pathContent: '',
  autoScan: 0,
  include: '',
  exclude: '',
});

onMounted(() => {
  load_table();
});
/**
 * 加载表格数据
 */
async function load_table(page = 1, pageSize = browse.manageListPageSize) {
  const res = await pathApi.get_path(0, page, pageSize);
  count.value = Number(res.count);
  tableData.value = res.list;

  browse.manageListPage = page;
  browse.manageListPageSizeCache = pageSize;
}
/**
 * 重载数据 页码不变
 */
function reload_table() {
  tableData.value = [];
  load_table(browse.manageListPage, browse.manageListPageSize);
}
/**
 * 删除漫画
 * */
async function delete_path(index: number, row: any) {
  ElMessageBox.confirm(t('path.confirm.text1'), t('path.confirm.title'), {
    type: 'warning',
  })
    .then(async () => {
      const res = await pathApi.delete_path(row.pathId);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => {});
}

/**
 * 重新扫描路径
 * @param index
 * @param row
 */
async function rescan_path(index: number, row: any) {
  ElMessageBox.confirm(t('path.confirm.text2'), t('path.confirm.title2'), {
    type: 'warning',
  })
    .then(async () => {
      const res = await pathApi.rescan_path(row.mediaId);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => {});
}

/**
 * 增量扫描路径
 * @param index
 * @param row
 */
async function scan_path(index: number, row: any) {
  const res = await pathApi.scan_path(row.mediaId);

  if (res.code === 0) {
    reload_table();
  }
}

async function edit_path(index: number, row: any) {
  editPathDialogVisible.value = true;
  Object.assign(pathForm, row);
}

async function save_path() {
  const res = await pathApi.update_path(pathForm.pathId, pathForm);
  if (res) {
    editPathDialogVisible.value = false;
    reload_table();
  }
}

function cancel_edit_path() {
  editPathDialogVisible.value = false;
  Object.assign(pathForm, {
    pathId: 0,
    pathContent: '',
    autoScan: 0,
    include: '',
    exclude: '',
  });
}

/**
 * 处理表格选择变化
 */
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}

/**
 * 批量删除路径
 */
async function batch_delete_path() {
  if (selectedRows.value.length === 0) {
    return;
  }
  
  ElMessageBox.confirm(t('path.confirm.batchDeleteText'), t('path.confirm.title'), {
    type: 'warning',
  })
    .then(async () => {
      const pathIds = selectedRows.value.map(row => row.pathId);
      const res = await pathApi.batch_delete_path(pathIds);

      if (res.code === 0) {
        selectedRows.value = [];
        reload_table();
      }
    })
    .catch(() => {});
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
