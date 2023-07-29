<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-07-27 10:30:46
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-07-29 15:45:42
 * @FilePath: /smanga/src/views/tag-setting/index.vue
-->
<template>
  <div class="manga-setting-index">
    <div class="manga-setting-box">
      <div class="btn-box">
        <el-button class="add-btn" type="primary" :icon="Plus" @click="new_dialog">{{ $t('tagSetting.addButton') }}
        </el-button>
      </div>
      <!--表格-->
      <el-table :data="tableData" stripe border>
        <el-table-column type="index" :label="$t('account.serial')" width="54">
        </el-table-column>

        <el-table-column prop="tagId" :label="$t('tagSetting.table.tagId')" width="64">
        </el-table-column>

        <el-table-column prop="tagName" :label="$t('tagSetting.table.tagName')" width="120">
        </el-table-column>

        <el-table-column prop="tagColor" :label="$t('tagSetting.table.tagColor')" width="100">
        </el-table-column>

        <el-table-column prop="description" :label="$t('tagSetting.table.description')">
        </el-table-column>

        <el-table-column prop="createTime" :label="$t('mangaManage.createTime')" width="160">
        </el-table-column>

        <el-table-column prop="updateTime" :label="$t('mangaManage.updateTime')" width="160">
        </el-table-column>

        <el-table-column :label="$t('account.option')" width="200">
          <template v-slot="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="update_dialog(true, scope.row)">{{
              $t('option.modify') }}
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="delete_tag(scope.row)">{{
              $t('option.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :count="count" />

      <!-- 新增标签弹框 -->
      <el-dialog :title="$t('tagSetting.dialog.addTitle')" v-model="addTagDialog">
        <el-form :model="form" label-width="11rem">
          <el-form-item :label="$t('tagSetting.dialog.tagName')">
            <el-input v-model="form.tagName" :placeholder="$t('tagSetting.dialog.tagNamePlaceholder')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('tagSetting.dialog.tagColor')">
            <el-input v-model="form.tagColor" :placeholder="$t('tagSetting.dialog.tagColorPlaceholder')"></el-input>
          </el-form-item>
          <p class="note form-note">{{ $t('tagSetting.dialog.tagColorNote') }}</p>

          <el-form-item :label="$t('tagSetting.dialog.description')">
            <el-input v-model="form.description" :placeholder="$t('tagSetting.dialog.descriptionPlaceholder')"></el-input>
          </el-form-item>
        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="add_tag">{{ $t('option.confirm') }}</el-button>
              <el-button type="warning" @click="new_dialog(false)">{{ $t('option.cancel') }}</el-button>
            </div>
          </div>
        </template>
      </el-dialog>

      <!-- 修改标签弹框 -->
      <el-dialog :title="$t('tagSetting.dialog.updateTitle')" v-model="updateTagDialog">
        <el-form :model="form" label-width="11rem">
          <el-form-item :label="$t('tagSetting.dialog.tagName')">
            <el-input v-model="form.tagName" :placeholder="$t('tagSetting.dialog.tagNamePlaceholder')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('tagSetting.dialog.tagColor')">
            <el-input v-model="form.tagColor" :placeholder="$t('tagSetting.dialog.tagColorPlaceholder')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('tagSetting.dialog.description')">
            <el-input v-model="form.description" :placeholder="$t('tagSetting.dialog.descriptionPlaceholder')"></el-input>
          </el-form-item>
        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="update_tag">{{ $t('option.confirm') }}</el-button>
              <el-button type="warning" @click="update_dialog(false)">{{ $t('option.cancel') }}</el-button>
            </div>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  Delete,
  Edit,
  Plus,
} from '@element-plus/icons-vue';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import tagApi, { tagParams } from '@/api/tag';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';

const { t } = i18n.global;
const pager = ref();
let count = ref(0);
let tableData = ref([]);
let addTagDialog = ref(false);
let updateTagDialog = ref(false);
let form = reactive({
  tagId: 0,
  tagName: '',
  tagColor: '',
  description: '',
});

let formInit = {
  tagId: 0,
  tagName: '',
  tagColor: '',
  description: '',
};

onMounted(() => {
  load_table();
})

function new_dialog(bool = true) {
  // 关闭弹窗的时候 清空数据
  if (!bool) {
    Object.assign(form, formInit);
  }

  addTagDialog.value = bool;
}

function update_dialog(bool = true, row?: tagParams) {
  // 打开弹框的时候加载数据
  if (bool) {
    Object.assign(form, row);
  }

  updateTagDialog.value = bool;
}
/**
     * @description: 新增标签
     * @return {*}
     */
async function add_tag() {
  const tagName = form.tagName;
  const tagColor = form.tagColor;
  const description = form.description;

  await tagApi.add(tagName, tagColor, description);

  reload_table();

  new_dialog(false);
}


/**
 * @description: 加载表格数据
 * @param {*} page
 * @param {*} pageSize
 * @return {*}
 */
async function load_table(page = 1, pageSize = 10) {
  const res = await tagApi.get(page, pageSize);

  count.value = res.count;
  tableData.value = res.list;
}


/**
 * @description: 重载数据 页码不变
 * @return {*}
 */
function reload_table() {
  pager.value?.reload_page();
}

/**
 * @description: 执行修改请求
 * @return {*}
 */
async function update_tag() {
  // 表单校验-检查漫画名
  if (!form.tagName) {
    ElMessage.warning(t('tagSetting.dialog.nameWarning'));
    return false;
  }

  await tagApi.update(form);

  reload_table();

  update_dialog(false);
}

/**
 * @description: 删除漫画
 * @param {*} row
 * @return {*}
 */
async function delete_tag(row: any) {
  ElMessageBox.confirm(
    t('tagSetting.dialog.confirmText'),
    t('tagSetting.dialog.confirmTitle'),
    {
      type: 'warning',
    }
  )
    .then(async () => {
      await tagApi.delete(row.tagId);
      reload_table();
    })
    .catch(() => { });
}
</script>

<style src='./style/index.less' scoped lang='less'></style>
