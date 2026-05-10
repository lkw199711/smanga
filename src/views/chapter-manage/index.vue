<template>
  <div class="manga-setting-box manage-container">
    <div class="srarch-box">
      <el-input
        v-model="keyWord"
        class="search-input"
        placeholder="请输入章节名称"
        @keyup.enter="() => load_table()"
        @clear="() => load_table()"
        @change="() => load_table()">
        <template #append>
          <el-button :icon="Search" @click="() => load_table()" />
        </template>
      </el-input>
    </div>
    <div class="btn-box">
      <el-button type="primary" :icon="Refresh" @click="reload_table">{{ $t('option.refresh') }}</el-button>
      <el-button type="danger" :icon="Delete" :disabled="selectedRows.length === 0" @click="batch_delete_chapter">
        {{ $t('option.delete') }}
      </el-button>
    </div>
    <!--表格-->
    <el-table v-loading="loading" :data="tableData" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="index" :label="$t('account.serial')" width="54"></el-table-column>

      <el-table-column prop="mediaId" :label="$t('mediaManage.id')" width="80"></el-table-column>

      <el-table-column prop="chapterId" :label="$t('chapterManage.id')" width="90"></el-table-column>

      <el-table-column prop="chapterName" :label="$t('chapterManage.name')" width="180"></el-table-column>

      <el-table-column prop="createTime" :label="$t('chapterManage.createTime')" width="170"></el-table-column>

      <el-table-column prop="updateTime" :label="$t('chapterManage.updateTime')" width="170"></el-table-column>

      <el-table-column :label="$t('option.option')">
        <template v-slot="scope">
          <el-button size="small" type="primary" :icon="Edit" @click="edit_chapter(scope.$index, scope.row)">{{ $t('option.modify') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="do_delete_chapter(scope.$index, scope.row)">{{ $t('option.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--修改章节弹窗-->
    <chapter-modify v-model:editChapterDialog="editChapterDialog" :chapterInfo="chapterInfo" @reload="load_table" />
    <!--分页-->
    <table-pager ref="pager" @pageChange="load_table" :page-size="browse.manageListPageSize" :count="count" />
  </div>
</template>

<script lang="ts">
export default {name: 'chapter-manage'};
</script>
<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {Delete, Edit, Search, Refresh} from '@element-plus/icons-vue';
import chapterApi from '@/api/chapter';
import tablePager from '@/components/table-pager.vue';
import chapterModify from './components/chapterModify.vue';

import i18n from '@/i18n';
import {reactive} from 'vue';
import type {mangaType} from '@/type/manga';
import {userConfig} from '@/store';
import useBrowseStore from '@/store/browse';
import {chapterInit, chapterType} from '@/type/chapter';

const browse = useBrowseStore();
const {t} = i18n.global;

const count = ref(0);
const tableData = ref([]);
const editChapterDialog = ref(false);
const keyWord = ref('');
const loading = ref(false);
const selectedRows = ref<chapterType[]>([]);
const chapterInfo = reactive<chapterType>(chapterInit);

const formInit = {
  chapterId: 0,
  chapterName: '',
  chapterPath: '',
  chapterCover: '',
  chapterNumber: '',
};

const pager = ref();
// 处理选择变化
function handleSelectionChange(selection: chapterType[]) {
  selectedRows.value = selection;
}

/*** 批量删除章节 */
async function batch_delete_chapter() {
  if (selectedRows.value.length === 0) {
    return;
  }

  const chapterIds = selectedRows.value.map(row => row.chapterId);

  ElMessageBox.confirm(t('chapterManage.confirm.batchDeleteText'), t('chapterManage.confirm.batchDeleteTitle'), {type: 'warning'})
    .then(async () => {
      loading.value = true;
      const res = await chapterApi.batch_delete_chapter(chapterIds);
      reload_table();
      selectedRows.value = [];
      loading.value = false;
    })
    .catch(() => {
      // 取消删除
    });
}

/**
 * 加载表格数据
 */
async function load_table(page = 1, pageSize = browse.manageListPageSize) {
  loading.value = true;
  const res = await chapterApi.get({
    mangaId: 0,
    mediaId: 0,
    page,
    pageSize,
    order: userConfig.order,
    keyWord: keyWord.value,
  });
  count.value = Number(res.count);
  tableData.value = res.list;

  browse.manageListPage = page;
  browse.manageListPageSizeCache = pageSize;
  loading.value = false;
}
/**
 * 重载数据 页码不变
 */
function reload_table() {
  tableData.value = [];
  load_table(browse.manageListPage, browse.manageListPageSize);
}
/**
 * 编辑漫画
 * @param index
 * @param row
 */
function edit_chapter(index: number, chapterParams: chapterType) {
  Object.assign(chapterInfo, formInit, chapterParams);
  editChapterDialog.value = true;
}

/**
 * 删除漫画
 * */
async function do_delete_chapter(index: number, row: any) {
  ElMessageBox.confirm(t('chapterManage.confirm.text'), t('chapterManage.confirm.title'), {type: 'warning'})
    .then(async () => {
      await chapterApi.delete_chapter(row.chapterId);
      reload_table();
    })
    .catch(() => {});
}

onMounted(() => {
  load_table();
});
</script>
<style scoped lang="less" src="@/style/manage.less"></style>
