<template>
  <div class="bookmark-setting">
    <!--表格-->
    <el-table :data="tableData" stripe border>
      <el-table-column type="index" :label="$t('account.serial')" width="54">
      </el-table-column>

      <el-table-column prop="bookmarkId" :label="$t('bookmarkManage.id')" width="72">
      </el-table-column>

      <el-table-column prop="mangaName" :label="$t('mangaManage.name')" width="160">
      </el-table-column>

      <el-table-column prop="chapterName" :label="$t('chapterManage.name')" width="320">
      </el-table-column>

      <el-table-column prop="page" :label="$t('bookmarkManage.page')" width="60">
      </el-table-column>

      <el-table-column prop="createTime" label="添加日期" width="170">
      </el-table-column>

      <el-table-column :label="$t('option.option')">
        <template v-slot="scope">
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)">{{
            $t('option.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <table-pager ref="pager" @pageChange="load_table" :page-size="browse.manageListPageSize" :count="count" />
  </div>
</template>

<script lang='ts'>export default { name: 'bookmark-manage' }</script>
<script lang='ts' setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox } from "element-plus";
import { Delete } from '@element-plus/icons-vue'
import bookmarkApi from "@/api/bookmark";
import tablePager from "@/components/table-pager.vue";
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';

const browse = useBrowseStore();
const { t } = i18n.global;
const count = ref(0);
const tableData = ref([]);

onMounted(() => {
  load_table();
})
/**
 * 删除书签
 * @param index
 * @param val
 * @returns {Promise<void>}
 */
async function handleDelete(index: number, val: any) {

  ElMessageBox.confirm(
    t('bookmarkManage.confirm.text'),
    t('bookmarkManage.confirm.title'), {
    type: 'warning'
  }).then(async () => {
    const res = await bookmarkApi.delete(val.bookmarkId);
    if (res.code === 0) {
      reload_table();
    }
  })
}

/**
 * 加载表格
 * @returns {Promise<void>}
 */
async function load_table(page = 1, pageSize = 10) {
  const res = await bookmarkApi.get(page, pageSize);
  tableData.value = res.list;
  count.value = Number(res.count);

  browse.manageListPage = page; // 保存当前页码
  browse.manageListPageSizeCache = pageSize; // 保存当前页码大小
}

/**
 * 重载数据 页码不变
 */
function reload_table() {
  tableData.value = [];
  load_table(browse.manageListPage, browse.manageListPageSize);
}

</script>

<style scoped lang='less'>
@media only screen and (min-width: 1200px) {
  .bookmark-setting {
    width: 100rem;
    margin: 3rem auto;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .bookmark-setting {
    width: 93rem;
    margin: 2rem auto;
  }
}

@media only screen and (max-width: 767px) {
  .bookmark-setting {
    width: 92rem;
    margin: 1rem auto;
  }
}
</style>
