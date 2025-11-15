<template>
  <div class="manga-setting-box manage-container">
    <div class="srarch-box">
      <el-input
        v-model="keyWord"
        class="search-input"
        placeholder="请输入漫画名称"
        @keyup.enter="() => load_table()"
        @clear="() => load_table()"
        @change="() => load_table()">
        <template #append>
          <el-button :icon="Search" @click="() => load_table()" />
        </template>
      </el-input>
    </div>
    <div class="btn-box">
      <el-button type="danger" :icon="Delete" :disabled="multipleSelection.length === 0" @click="batch_delete_manga">{{ $t('option.delete') }}</el-button>
    </div>

    <!--表格-->
    <el-table :data="tableData" stripe border @selection-change="handle_selection_change">
      <el-table-column type="selection" width="54"></el-table-column>
      <el-table-column type="index" :label="$t('account.serial')" width="54"></el-table-column>
      <el-table-column prop="mediaId" :label="$t('mediaManage.id')" width="80"></el-table-column>
      <el-table-column prop="mangaId" :label="$t('mangaManage.id')" width="86"></el-table-column>
      <el-table-column prop="mangaName" :label="$t('mangaManage.name')" width="180"></el-table-column>
      <el-table-column prop="createTime" :label="$t('mangaManage.createTime')" width="160"></el-table-column>
      <el-table-column prop="updateTime" :label="$t('mangaManage.updateTime')" width="160"></el-table-column>
      <el-table-column :label="$t('account.option')">
        <template v-slot="scope">
          <el-button size="small" type="primary" :icon="Edit" @click="edit_manga(scope.$index, scope.row)">{{ $t('option.modify') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="delete_manga(scope.$index, scope.row)">{{ $t('option.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--修改漫画弹窗-->
    <manga-modify v-model:editMangaDialog="editMangaDialog" @reload="reload_table" :mangaInfo="mangaInfo" />

    <!--分页-->
    <table-pager ref="pager" @pageChange="load_table" :pageSize="browse.manageListPageSize" :count="count" />
  </div>
</template>

<script lang="ts">
export default {name: 'manga-manage'};
</script>
<script lang="ts" setup>
import {onMounted, reactive, ref, computed} from 'vue';
import {Delete, Edit} from '@element-plus/icons-vue';
import {ElMessageBox} from 'element-plus';
import mangaApi from '@/api/manga';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import {Search} from '@element-plus/icons-vue';
import useBrowseStore from '@/store/browse';
import {mangaType, mangaInit} from '@/type/manga';
import mangaModify from './components/mangaModify.vue';

const pager = ref();
const browse = useBrowseStore();
const count = ref(0);
const tableData = ref([]);
const editMangaDialog = ref(false);
const keyWord = ref('');
const multipleSelection = ref<mangaType[]>([]);
const mangaInfo = reactive<mangaType>(mangaInit);

const formInit = {
  mangaId: '',
  mangaName: '',
  mangaPath: '',
  mangaCover: '',
  browseType: 'flow',
  removeFirst: 0,
  direction: 1,
};

const {t} = i18n.global;

onMounted(() => {
  // 获取当前页面的配置
  load_table();
});

async function load_table(page = 1, pageSize = browse.manageListPageSize) {
  const res = await mangaApi.get(0, page, pageSize, 'id', keyWord.value);
  count.value = res.count;
  tableData.value = res.list;

  browse.manageListPage = page;
  browse.manageListPageSizeCache = pageSize;
}

function reload_table() {
  tableData.value = [];
  load_table(browse.manageListPage, browse.manageListPageSize);
}

/**
 * 编辑漫画
 * @param index
 * @param row
 */
function edit_manga(index: number, row: any) {
  Object.assign(mangaInfo, formInit, row);
  editMangaDialog.value = true;
}

async function delete_manga(index: number, row: any) {
  ElMessageBox.confirm(t('mangaManage.confirm.text'), t('mangaManage.confirm.title'), {type: 'warning'})
    .then(async () => {
      const res = await mangaApi.delete_manga(row.mangaId);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => {});
}

/**
 * 处理选择项变化
 */
function handle_selection_change(val: mangaType[]) {
  multipleSelection.value = val;
}

/**
 * 批量删除漫画
 */
async function batch_delete_manga() {
  if (multipleSelection.value.length === 0) {
    return;
  }

  ElMessageBox.confirm(t('mangaManage.confirm.text'), t('mangaManage.confirm.title'), {type: 'warning'})
    .then(async () => {
      const ids = multipleSelection.value.map(item => item.mangaId);
      const res = await mangaApi.batch_delete_manga(ids as number[]);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => {});
}
</script>

<style lang="less" scoped src="@/style/manage.less"></style>
