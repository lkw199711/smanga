<template>
  <div class="manga-setting-index">
    <div class="top">
      <el-input v-model="keyWord" class="search-input" placeholder="请输入漫画名称" @keyup.enter="()=>{load_table()}" @clear="()=>{load_table()}" @change="()=>{load_table()}">
        <template #append>
					<el-button :icon="Search" @click="()=>{load_table()}" />
				</template>
      </el-input>
    </div>
    <div class="manga-setting-box">
      <!--表格-->
      <el-table :data="tableData" stripe border>
        <el-table-column type="index" :label="$t('account.serial')" width="54">
        </el-table-column>

        <el-table-column prop="mediaId" :label="$t('mediaManage.id')" width="80">
        </el-table-column>

        <el-table-column prop="mangaId" :label="$t('mangaManage.id')" width="86">
        </el-table-column>

        <el-table-column prop="mangaName" :label="$t('mangaManage.name')" width="180">
        </el-table-column>

        <el-table-column prop="createTime" :label="$t('mangaManage.createTime')" width="160">
        </el-table-column>

        <el-table-column prop="updateTime" :label="$t('mangaManage.updateTime')" width="160">
        </el-table-column>

        <el-table-column :label="$t('account.option')">
          <template v-slot="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="edit_manga(scope.$index, scope.row)">{{
              $t('option.modify') }}
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="delete_manga(scope.$index, scope.row)">{{
              $t('option.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :pageSize="browse.manageListPageSize" :count="count" />

      <el-dialog :title="$t('mangaManage.modify')" v-model="editMangaDialog" :before-close="dialog_close">
        <el-form :model="form" label-width="11rem">
          <el-form-item :label="$t('mangaManage.form.name')">
            <el-input v-model="form.mangaName" :placeholder="$t('mangaManage.place.name')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('mangaManage.form.path')">
            <el-input v-model="form.mangaPath" :placeholder="$t('mangaManage.place.path')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('mangaManage.form.poster')">
            <el-input v-model="form.mangaCover" :placeholder="$t('mangaManage.place.poster')"></el-input>
          </el-form-item>

          <!--阅读字段-->
          <p class="s-form-title">{{ $t('mediaManage.title.read') }}</p>

          <el-form-item :label="$t('mangaManage.form.browse')">
            <el-select v-model="form.browseType" :placeholder="$t('mangaManage.place.browse')">
              <el-option :label="$t('mediaManage.select.browse0')" value="flow" />
              <el-option :label="$t('mediaManage.select.browse1')" value="single" />
              <el-option :label="$t('mediaManage.select.browse2')" value="double" />
              <el-option :label="$t('mediaManage.select.browse3')" value="half" />
            </el-select>
          </el-form-item>
          <p class="note form-note">{{ $t('mediaManage.note.browse') }}</p>

          <el-form-item :label="$t('mediaManage.form.removeFirst')">
            <el-switch v-model.number="form.removeFirst" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <p class="note form-note">{{ $t('mediaManage.note.removeFirst') }}</p>

          <el-form-item :label="$t('mediaManage.form.direction')">
            <el-radio-group v-model="form.direction" class="ml-4">
              <el-radio :label="0" size="large">{{ $t('mediaManage.select.ltr') }}</el-radio>
              <el-radio :label="1" size="large">{{ $t('mediaManage.select.rtl') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <p class="note form-note">{{ $t('mediaManage.note.direction') }}</p>

        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="update_manga">{{ $t('option.confirm') }}</el-button>
              <el-button type="warning" @click="editMangaDialog = false">{{ $t('option.cancel') }}</el-button>
            </div>
          </div>
        </template>

      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'manga-manage' };
</script>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import mangaApi from '@/api/manga';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import { Search } from '@element-plus/icons-vue';
import useBrowseStore from '@/store/browse';
const pager = ref();
const browse = useBrowseStore();
const count = ref(0);
const tableData = ref([]);
const editMangaDialog = ref(false);
const keyWord = ref('');
const form = reactive({
  mangaId: '',
  mangaName: '',
  mangaPath: '',
  mangaCover: '',
  browseType: 'flow',
  removeFirst: 0,
  direction: 1,
});
const formInit = {
  mangaId: '',
  mangaName: '',
  mangaPath: '',
  mangaCover: '',
  browseType: 'flow',
  removeFirst: 0,
  direction: 1,
}
const { t } = i18n.global;


onMounted(() => {
  // 获取当前页面的配置
  load_table();
});
/**
 * 关闭弹窗
 */
function dialog_close() {
  editMangaDialog.value = false;
}

/**
 * 打开弹窗
 */
function dialog_open() {
  Object.assign(form, formInit);
  editMangaDialog.value = true;
}


async function load_table(page = 1, pageSize = browse.manageListPageSize) {
  const res = await mangaApi.get(0, page, pageSize, 'id', keyWord.value);
  count.value = res.count;
  tableData.value = res.list;

  browse.manageListPage = page;
  browse.manageListPageSizeCache = pageSize;
}

function reload_table() {
  tableData.value = [];
  load_table(browse.manageListPage, browse.manageListPageSizeCache);
}

/**
   * 编辑漫画
   * @param index
   * @param row
   */
function edit_manga(index: number, row: any) {
  dialog_open();
  Object.assign(form, row);
}

async function update_manga() {
  // 表单校验-检查漫画名
  if (!form.mangaName) {
    ElMessage.warning(t('mangaManage.warning.name'));
    return false;
  }
  // 表单校验-检查漫路径
  if (!form.mangaPath) {
    ElMessage.warning(t('mangaManage.warning.path'));
    return false;
  }

  const res = await mangaApi.update_manga(form);

  if (res.code === 0) {
    editMangaDialog.value = false;
    reload_table();
  }
}

async function delete_manga(index: number, row: any) {
  ElMessageBox.confirm(
    t('mangaManage.confirm.text'),
    t('mangaManage.confirm.title'),
    {
      type: 'warning',
    }
  )
    .then(async () => {
      const res = await mangaApi.delete_manga(row.mangaId);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => { });
}

</script>

<style lang="less" scoped>
  .top {
    margin: 1rem auto;
  }
  @media only screen and (min-width: 1200px) {
    .top {
      width: 100rem;
    }
    .search-input {
      max-width: 100vw;
    }
    .manga-setting-box {
      width: 100rem;
      margin: 0rem auto;
    }
  }

  @media only screen and (max-width: 1199px) and (min-width: 768px) {
    .top {
      width: 91rem;
    }
    .search-input {
      max-width: 100vw;
    }
    .manga-setting-box {
      width: 91rem;
      margin: 0rem auto;
    }
  }

  @media only screen and (max-width: 767px) {
    .top {
      width: 91rem;
    }
    .search-input {
      max-width: 100vw;
    }
    .manga-setting-box {
      width: 91rem;
      margin: 0 auto;
    }
  }
</style>
