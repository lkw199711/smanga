<template>
  <div class="compress-table-box manage-container">
    <div class="btn-box">
      <el-button type="primary" :icon="Refresh" @click="reload_table">{{ $t('option.refresh') }}</el-button>
      <el-button
        type="danger"
        :icon="Delete"
        :disabled="selectedRows.length === 0"
        @click="batchDeleteCompress"
      >
        {{ $t('option.delete') }}
      </el-button>
      <el-button type="success" :icon="RefreshLeft" @click="clear_compress">{{ $t('option.clear') }}</el-button>
    </div>
    <!--表格-->
    <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column type="index" :label="$t('account.serial')" width="54"></el-table-column>

      <el-table-column prop="compressId" :label="$t('compressManage.id')" width="104"></el-table-column>

      <el-table-column prop="compressType" :label="$t('compressManage.type')" width="82"></el-table-column>

      <el-table-column prop="chapterPath" :label="$t('compressManage.source')" width="320"></el-table-column>

      <el-table-column prop="compressPath" :label="$t('compressManage.path')" width="320"></el-table-column>

      <el-table-column prop="imageCount" :label="$t('compressManage.num')" width="82"></el-table-column>

      <el-table-column prop="createTime" :label="$t('compressManage.createTime')" width="170"></el-table-column>

      <el-table-column :label="$t('option.option')">
        <template v-slot="scope">
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)">{{ $t('option.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <table-pager ref="pager" :page-size="browse.manageListPageSize" @pageChange="load_table" :count="count" />
  </div>
</template>

<script lang="ts">
export default {name: 'compress-manage'};
</script>
<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {Delete, Refresh, RefreshLeft} from '@element-plus/icons-vue';
import compressApi from '@/api/compress';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import { compressType } from '@/type/compress';

const browse = useBrowseStore();
const {t} = i18n.global;

const count = ref(0);
const tableData = ref([]);
const loading = ref(false);
const selectedRows = ref<compressType[]>([]);

onMounted(() => {
  load_table();
});

/**
 * 处理表格选择变化
 */
function handleSelectionChange(val: compressType[]) {
  selectedRows.value = val;
}

/**
 * 批量删除压缩记录
 */
async function batchDeleteCompress() {
  const ids = selectedRows.value.map(row => row.compressId);
  
  ElMessageBox.confirm(t('compressManage.confirm.batchDeleteText'), t('compressManage.confirm.batchDeleteTitle'), {
    confirmButtonText: t('option.confirm'),
    cancelButtonText: t('option.cancel'),
    type: 'warning'
  })
    .then(async () => {
      loading.value = true;
      try {
        await compressApi.batch_delete_compress(ids);
        selectedRows.value = [];
        reload_table();
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {});
}
/**
 * 删除书签
 * @param index
 * @param val
 * @returns {Promise<void>}
 */
async function handleDelete(index: number, val: any) {
  ElMessageBox.confirm(t('compressManage.confirm.text'), t('compressManage.confirm.title'), {
    confirmButtonText: t('option.confirm'),
    cancelButtonText: t('option.cancel'),
    type: 'warning',
  })
    .then(async () => {
      loading.value = true;
      try {
        await compressApi.delete_compress(val.compressId);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {});
}

/**
 * 加载表格
 * @returns {Promise<void>}
 */
async function load_table(page = 1, pageSize = browse.manageListPageSize) {
  loading.value = true;
  try {
    const res = await compressApi.get_compress(page, pageSize);
    count.value = Number(res.count);
    tableData.value = res.list;

    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
  } finally {
    loading.value = false;
  }
}
/**
 * 重载数据 页码不变
 */
function reload_table() {
  tableData.value = [];
  selectedRows.value = [];
  load_table(browse.manageListPage, browse.manageListPageSize);
}
/**
 * 清空压缩记录
 */
async function clear_compress() {
  await compressApi.clear()
  setTimeout(() => {
    reload_table()
  }, 2000);
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
