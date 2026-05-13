<template>
  <div class="bookmark-table-box manage-container">
    <div class="btn-box">
      <el-button type="primary" :icon="Refresh" @click="reload_table">{{ $t('option.refresh') }}</el-button>
      <el-button type="danger" :icon="Delete" :disabled="selectedRows.length === 0" @click="batch_delete_bookmark">
        {{ $t('option.delete') }}
      </el-button>
    </div>
    <!--表格-->
    <el-table v-loading="loading" :data="tableData" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="index" :label="$t('account.serial')" width="54"></el-table-column>

      <el-table-column prop="bookmarkId" :label="$t('bookmarkManage.id')" width="72"></el-table-column>

      <el-table-column prop="mangaName" :label="$t('mangaManage.name')" width="160"></el-table-column>

      <el-table-column prop="chapterName" :label="$t('chapterManage.name')" width="320"></el-table-column>

      <el-table-column prop="page" :label="$t('bookmarkManage.page')" width="60"></el-table-column>

      <el-table-column prop="createTime" label="添加日期" width="170"></el-table-column>

      <el-table-column :label="$t('option.option')">
        <template v-slot="scope">
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)">{{ $t('option.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <table-pager ref="pager" @pageChange="load_table" :page-size="browse.manageListPageSize" :count="count" />
  </div>
</template>

<script lang="ts">
export default {name: 'bookmark-manage'};
</script>
<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {Delete, Refresh} from '@element-plus/icons-vue';
import bookmarkApi from '@/api/bookmark';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';

const browse = useBrowseStore();
const {t} = i18n.global;
const count = ref(0);
const tableData = ref([]);
const loading = ref(false);
const selectedRows = ref([]);

onMounted(() => {
  load_table();
});

// 处理选择变化
function handleSelectionChange(selection) {
  selectedRows.value = selection;
}

// 批量删除书签
async function batch_delete_bookmark() {
  if (selectedRows.value.length === 0) {
    return;
  }
  
  const bookmarkIds = selectedRows.value.map(row => row.bookmarkId);
  
  ElMessageBox.confirm(
    t('bookmarkManage.confirm.batchDeleteText'),
    t('bookmarkManage.confirm.batchDeleteTitle'),
    { type: 'warning' }
  )
    .then(async () => {
      loading.value = true;
      const res = await bookmarkApi.batch_delete(bookmarkIds);
      reload_table();
      selectedRows.value = [];
      loading.value = false;
    })
    .catch(() => {
      // 取消删除
    });
}
/**
 * 删除书签
 * @param index
 * @param val
 * @returns {Promise<void>}
 */
async function handleDelete(index: number, val: any) {
  ElMessageBox.confirm(t('bookmarkManage.confirm.text'), t('bookmarkManage.confirm.title'), {
    type: 'warning',
  }).then(async () => {
    await bookmarkApi.delete(val.bookmarkId);
    reload_table();
  });
}

/**
 * 加载表格
 * @returns {Promise<void>}
 */
async function load_table(page = 1, pageSize = 10) {
  loading.value = true;
  const res = await bookmarkApi.get(page, pageSize);
  tableData.value = res.list;
  count.value = Number(res.count);

  browse.manageListPage = page; // 保存当前页码
  browse.manageListPageSizeCache = pageSize; // 保存当前页码大小
  loading.value = false;
}

/**
 * 重载数据 页码不变
 */
function reload_table() {
  tableData.value = [];
  load_table(browse.manageListPage, browse.manageListPageSize);
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
