<template>
  <div class="chapter-setting-index">
    <div class="top">
      <el-input v-model="keyWord" class="search-input" placeholder="请输入章节名称" :suffix-icon="Search"
        @change="() => { load_table() }" />
    </div>
    <div class="chapter-setting-box">
      <div class="manga-setting-box">
        <el-table :data="tableData" stripe border>
          <el-table-column type="index" :label="$t('account.serial')" width="54">
          </el-table-column>

          <el-table-column prop="mediaId" :label="$t('mediaManage.id')" width="80">
          </el-table-column>

          <el-table-column prop="chapterId" :label="$t('chapterManage.id')" width="90">
          </el-table-column>

          <el-table-column prop="chapterName" :label="$t('chapterManage.name')" width="180">
          </el-table-column>

          <el-table-column prop="createTime" :label="$t('chapterManage.createTime')" width="170">
          </el-table-column>

          <el-table-column prop="updateTime" :label="$t('chapterManage.updateTime')" width="170">
          </el-table-column>

          <el-table-column :label="$t('option.option')">
            <template v-slot="scope">
              <el-button size="small" type="primary" :icon="Edit" @click="edit_chapter(scope.$index, scope.row)">{{
                $t('option.modify') }}
              </el-button>
              <el-button size="small" type="danger" :icon="Delete"
                @click="do_delete_chapter(scope.$index, scope.row)">{{
                  $t('option.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--表格-->
        <el-dialog :title="$t('chapterManage.modify')" v-model="editChapterDialog" :before-close="dialog_close">
          <el-form :model="form" label-width="11rem">
            <el-form-item :label="$t('chapterManage.form.name')">
              <el-input v-model="form.chapterName" :placeholder="$t('chapterManage.place.name')"></el-input>
            </el-form-item>

            <el-form-item :label="$t('chapterManage.form.path')">
              <el-input v-model="form.chapterPath" :placeholder="$t('chapterManage.place.path')"></el-input>
            </el-form-item>

            <el-form-item :label="$t('chapterManage.form.poster')">
              <el-input v-model="form.chapterCover" :placeholder="$t('chapterManage.place.poster')"></el-input>
            </el-form-item>

            <el-form-item :label="$t('chapterManage.form.chapterNumber')">
              <el-input v-model="form.chapterNumber" :placeholder="$t('chapterManage.place.chapterNumber')"></el-input>
            </el-form-item>
          </el-form>

          <template v-slot:footer>
            <div class="dialog-footer">
              <!--按钮盒子-->
              <div class="btn-box">
                <el-button type="primary" @click="do_update_chapter">{{ $t('option.confirm') }}</el-button>
                <el-button type="warning" @click="editChapterDialog = false">{{ $t('option.cancel') }}</el-button>
              </div>
            </div>
          </template>
        </el-dialog>
        <!--分页-->
        <table-pager ref="pager" @pageChange="load_table" :page-size="browse.manageListPageSize" :count="count" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">export default { name: 'chapter-manage' }</script>
<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Search } from '@element-plus/icons-vue'
import chapterApi from "@/api/chapter";
import tablePager from "@/components/table-pager.vue";
import i18n from '@/i18n';
import { reactive } from 'vue';
import type { mangaInfoType } from '@/type/manga';
import { userConfig } from '@/store';
import useBrowseStore from '@/store/browse';

const browse = useBrowseStore();
const { t } = i18n.global;

const count = ref(0);
const tableData = ref([]);
const editChapterDialog = ref(false);
const keyWord = ref('');
const form = reactive({
  chapterId: '',
  chapterName: '',
  chapterPath: '',
  chapterCover: '',
  chapterNumber: '',
})

const formInit = {
  chapterId: '',
  chapterName: '',
  chapterPath: '',
  chapterCover: '',
  chapterNumber: '',
}

const pager = ref();
/***
 * 关闭弹窗
 */
function dialog_close() {
  editChapterDialog.value = false;
}
/**
 * 开启弹窗
 */
function dialog_open() {
  Object.assign(form, formInit);
  editChapterDialog.value = true;
}

/**
 * 加载表格数据
 */
async function load_table(page = 1, pageSize = browse.manageListPageSize) {
  const res = await chapterApi.get({
    mangaId: 0,
    mediaId: 0,
    page,
    pageSize,
    order: userConfig.order,
    keyWord: keyWord.value
  });
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
 * 编辑漫画
 * @param index
 * @param row
 */
function edit_chapter(index: number, mangaInfo: mangaInfoType) {
  dialog_open();
  Object.assign(form, mangaInfo);
}

/**
 * 执行修改请求
 */
async function do_update_chapter() {
  // 表单验证-章节名
  if (!form.chapterName) {
    ElMessage.warning(t('chapterManage.warning.name'));
    return false;
  }
  // 表单验证-章节路径
  if (!form.chapterPath) {
    ElMessage.warning(t('chapterManage.warning.path'));
    return false;
  }

  const res = await chapterApi.update_chapter(form);
  if (res.code === 0) {
    editChapterDialog.value = false;
    reload_table();
  }
}

/**
 * 删除漫画
 * */
async function do_delete_chapter(index: number, row: any) {
  ElMessageBox.confirm(
    t('chapterManage.confirm.text'),
    t('chapterManage.confirm.title'), {
    type: 'warning'
  }).then(async () => {
    const res = await chapterApi.delete_chapter(row.chapterId);

    if (res.code === 0) {
      reload_table();
    }
  }).catch(() => {
  })
}

onMounted(() => {
  load_table();
})
</script>

<style scoped lang='less'>
.dialog-footer {
  .btn-box {
    display: flex;
    justify-content: flex-end;
  }
}

.top {
  margin: 1rem auto;
}

.search-input {
  max-width: 100vw;
}

@media only screen and (min-width: 1200px) {
  .top {
    width: 100rem;
  }

  .chapter-setting-box {
    width: 100rem;
    margin: 0rem auto;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .top {
    width: 90rem;
  }

  .chapter-setting-box {
    width: 90rem;
    margin: 0rem auto;
  }
}

@media only screen and (max-width: 767px) {
  .top {
    width: 90rem;
  }

  .chapter-setting-box {
    width: 90rem;
    margin: 0rem auto;
  }
}
</style>
