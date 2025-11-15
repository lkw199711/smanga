<template>
  <div class="media-manage-index manage-container">
    <div class="btn-box">
      <el-button
        class="add-btn"
        type="primary"
        :icon="Plus"
        @click="dialog_open"
        >{{ $t('mediaManage.add') }}
      </el-button>
      <el-button
        type="danger"
        :icon="Delete"
        :disabled="multipleSelection.length === 0"
        @click="batch_delete_media"
        >{{ $t('option.delete') }}
      </el-button>
    </div>

    <!--表格-->
    <el-table
      :data="tableData"
      class="custom-table"
      stripe
      border
      @selection-change="handle_selection_change">
      <el-table-column type="selection" width="54"> </el-table-column>

      <el-table-column prop="mediaId" :label="$t('mediaManage.id')" width="80">
      </el-table-column>

      <el-table-column
        prop="mediaName"
        :label="$t('mediaManage.name')"
        width="140">
      </el-table-column>

      <el-table-column
        prop="createTime"
        :label="$t('mediaManage.createTime')"
        width="180">
      </el-table-column>

      <el-table-column :label="$t('account.option')">
        <template v-slot="scope">
          <el-button
            size="small"
            type="success"
            :icon="Edit"
            @click="edit_media(scope.$index, scope.row)"
            >{{ $t('option.modify') }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            :icon="FolderOpened"
            @click="path_dialog_open(scope.$index, scope.row)"
            >{{ $t('mediaManage.path') }}
          </el-button>
          <el-button
            size="small"
            type="danger"
            :icon="Delete"
            @click="do_delete_media(scope.$index, scope.row)"
            >{{ $t('option.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <table-pager
      ref="pager"
      @pageChange="load_table"
      :page-size="browse.manageListPageSize"
      :count="count" />

    <!--新增媒体库弹框-->
    <el-dialog
      :title="$t('mediaManage.add')"
      v-model="addMediaDialog"
      :before-close="dialog_close">
      <el-form :model="form" label-width="11rem">
        <el-form-item :label="$t('mediaManage.form.name')">
          <el-input
            v-model="form.mediaName"
            :placeholder="$t('mediaManage.place.name')"></el-input>
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.type')">
          <el-select v-model.number="form.mediaType">
            <el-option
              :label="$t('mediaManage.select.mediaType0')"
              :value="0" />
            <el-option
              :label="$t('mediaManage.select.mediaType1')"
              :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.browse')">
          <el-select v-model="form.browseType">
            <el-option :label="$t('mediaManage.select.browse0')" value="flow" />
            <el-option
              :label="$t('mediaManage.select.browse1')"
              value="single" />
            <el-option
              :label="$t('mediaManage.select.browse2')"
              value="double" />
            <el-option :label="$t('mediaManage.select.browse3')" value="half" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.directory')">
          <el-select v-model.number="form.directoryFormat" class="r30">
            <el-option
              :label="$t('mediaManage.select.directory0')"
              :value="0" />
            <el-option
              :label="$t('mediaManage.select.directory1')"
              :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.sourceWebsite')">
          <el-select v-model.number="form.sourceWebsite" class="r30">
            <el-option label="无" value="" />
            <el-option label="toptoon" value="toptoon" />
            <el-option label="toomics" value="toomics" />
          </el-select>
        </el-form-item>

        <!--阅读字段-->
        <p class="s-form-title">{{ $t('mediaManage.title.read') }}</p>
        <el-form-item :label="$t('mediaManage.form.removeFirst')">
          <el-switch
            v-model.number="form.removeFirst"
            :active-value="1"
            :inactive-value="0" />
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.direction')">
          <el-radio-group v-model="form.direction" class="ml-4">
            <el-radio :value="0" size="large">{{
              $t('mediaManage.select.ltr')
            }}</el-radio>
            <el-radio :value="1" size="large">{{
              $t('mediaManage.select.rtl')
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div class="form-note mt-4">
        <p>• {{ $t('mediaManage.note.name') }}</p>
        <p>• {{ $t('mediaManage.note.type') }}</p>
        <p>• {{ $t('mediaManage.note.browse') }}</p>
        <p>• {{ $t('mediaManage.note.directory') }}</p>
        <p>• {{ $t('mediaManage.note.sourceWebsite') }}</p>
        <p>• {{ $t('mediaManage.note.removeFirst') }}</p>
        <p>• {{ $t('mediaManage.note.direction') }}</p>
      </div>

      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="dialog-btn-box">
            <el-button type="primary" @click="do_add_media">{{
              $t('option.confirm')
            }}</el-button>
            <el-button type="warning" @click="addMediaDialog = false">{{
              $t('option.cancel')
            }}</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
    <!--编辑媒体库弹框-->
    <el-dialog
      :title="$t('mediaManage.modify')"
      v-model="editMediaDialog"
      :before-close="dialog_close">
      <el-form :model="form" label-width="11rem">
        <el-form-item :label="$t('mediaManage.form.name')">
          <el-input
            v-model="form.mediaName"
            :placeholder="$t('mediaManage.place.name')"></el-input>
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.type')">
          <el-select v-model.number="form.mediaType">
            <el-option
              :label="$t('mediaManage.select.mediaType0')"
              :value="0" />
            <el-option
              :label="$t('mediaManage.select.mediaType1')"
              :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.browse')">
          <el-select v-model="form.browseType">
            <el-option :label="$t('mediaManage.select.browse0')" value="flow" />
            <el-option
              :label="$t('mediaManage.select.browse1')"
              value="single" />
            <el-option
              :label="$t('mediaManage.select.browse2')"
              value="double" />
            <el-option :label="$t('mediaManage.select.browse3')" value="half" />
          </el-select>
        </el-form-item>
        <!-- 封面设置 -->
        <el-form-item :label="$t('mediaManage.form.cover')">
          <el-input v-model="form.mediaCover" disabled>
            <template #append>
              <el-button @click="create_media_cover">生成封面</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <cover-upload
            cover-type="media"
            :bind-id="form.mediaId"
            :init-cover="form.mediaCover"
            v-on:update:value="(value) => (form.mediaCover = value)" />
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.directory')">
          <el-select v-model.number="form.directoryFormat" class="r30">
            <el-option
              :label="$t('mediaManage.select.directory0')"
              :value="0" />
            <el-option
              :label="$t('mediaManage.select.directory1')"
              :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.sourceWebsite')">
          <el-select v-model.number="form.sourceWebsite" class="r30">
            <el-option label="无" value="" />
            <el-option label="toptoon" value="toptoon" />
            <el-option label="toomics" value="toomics" />
          </el-select>
        </el-form-item>

        <!--阅读字段-->
        <p class="s-form-title">{{ $t('mediaManage.title.read') }}</p>
        <el-form-item :label="$t('mediaManage.form.removeFirst')">
          <el-switch
            v-model.number="form.removeFirst"
            :active-value="1"
            :inactive-value="0" />
        </el-form-item>

        <el-form-item :label="$t('mediaManage.form.direction')">
          <el-radio-group v-model="form.direction" class="ml-4">
            <el-radio :value="0" size="large">{{
              $t('mediaManage.select.ltr')
            }}</el-radio>
            <el-radio :value="1" size="large">{{
              $t('mediaManage.select.rtl')
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div class="form-note mt-4">
        <p>• {{ $t('mediaManage.note.name') }}</p>
        <p>• {{ $t('mediaManage.note.type') }}</p>
        <p>• {{ $t('mediaManage.note.browse') }}</p>
        <p>• {{ $t('mediaManage.note.cover') }}</p>
        <p>• {{ $t('mediaManage.note.directory') }}</p>
        <p>• {{ $t('mediaManage.note.sourceWebsite') }}</p>
        <p>• {{ $t('mediaManage.note.removeFirst') }}</p>
        <p>• {{ $t('mediaManage.note.direction') }}</p>
      </div>
      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="dialog-btn-box">
            <el-button type="primary" @click="update_media">{{
              $t('option.confirm')
            }}</el-button>
            <el-button type="warning" @click="editMediaDialog = false">{{
              $t('option.cancel')
            }}</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
    <!--编辑媒体库路径弹框-->
    <el-dialog
      :title="$t('path.modify')"
      v-model="addPathDialog"
      :before-close="
        () => {
          addPathDialog = false;
        }
      ">
      <el-form :model="form" label-width="100px">
        <el-form-item :label="$t('mediaManage.form.name')">
          <el-input
            disabled
            v-model="form.mediaName"
            :placeholder="$t('mediaManage.place.name')" />
        </el-form-item>

        <el-form-item :label="$t('path.form.add')">
          <el-input
            v-model="pathForm.pathContent"
            :placeholder="$t('path.place.add')">
            <template #append>
              <el-button :icon="Plus" @click="add_path_cache" />
            </template>
          </el-input>
        </el-form-item>
        <!--扫描字段-->
        <p class="s-form-title">{{ $t('mediaManage.title.scan') }}</p>
        <!-- 自动扫描还没做好 -->
        <el-form-item :label="$t('mediaManage.form.autoScan')">
          <el-switch
            v-model.number="pathForm.autoScan"
            :active-value="1"
            :inactive-value="0" />
        </el-form-item>

        <el-form-item :label="$t('path.form.include')">
          <el-input
            v-model="pathForm.include"
            :placeholder="$t('path.place.include')" />
        </el-form-item>
        <el-form-item :label="$t('path.form.exclude')">
          <el-input
            v-model="pathForm.exclude"
            :placeholder="$t('path.place.exclude')" />
        </el-form-item>

        <el-form-item :label="$t('path.form.path')">
          <div v-for="i in pathArr" :key="i.pathId" class="path-item">
            {{ i.pathContent }}
            <div class="path-btn-box">
              <el-button
                class="path-item-btn"
                size="small"
                type="success"
                @click="scan_path(i)">
                {{ $t('path.button.update') }}
              </el-button>
              <el-button
                class="path-item-btn"
                size="small"
                type="warning"
                @click="rescan_path(i)">
                {{ $t('path.button.re') }}
              </el-button>
              <el-button
                class="path-item-btn"
                size="small"
                type="danger"
                @click="delete_path(i)">
                {{ $t('option.delete') }}
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <div class="form-note mt-4">
        <p>• {{ $t('mediaManage.note.autoScan') }}</p>
        <p>• {{ $t('path.note.clude', ['(aaa|bbb|ccc)']) }}</p>
      </div>

      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="dialog-btn-box">
            <el-button type="primary" @click="addPathDialog = false">{{
              $t('option.confirm')
            }}</el-button>
            <el-button type="warning" @click="addPathDialog = false">{{
              $t('option.cancel')
            }}</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'media-manage-index',
};
</script>

<script lang="ts" setup>
import {
  Delete,
  Edit,
  Upload,
  Plus,
  FolderOpened,
} from '@element-plus/icons-vue';
import {ref, reactive, onMounted} from 'vue';
import mediaApi from '@/api/media';
import pathApi from '@/api/path';
import {ElMessage, ElMessageBox} from 'element-plus';
import tablePager from '@/components/table-pager.vue';
import coverUpload from '@/components/cover-upload.vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import type {pathType} from '@/type/path';
import {mediaType} from '@/type/media';
const pager = ref();
const browse = useBrowseStore();

const count = ref(0);
const tableData = ref([]);
const addMediaDialog = ref(false);
const addPathDialog = ref(false);
const editMediaDialog = ref(false);
const form = reactive({
  mediaId: 0,
  mediaName: '',
  mediaType: 0,
  browseType: 'flow',
  directoryFormat: 0,
  sourceWebsite: '无',
  removeFirst: 0,
  direction: 1,
  mediaCover: '',
  sidebar: 0,
});
const formInit = {
  mediaId: 0,
  mediaName: '',
  mediaType: 0,
  browseType: 'flow',
  directoryFormat: 0,
  sourceWebsite: '无',
  removeFirst: 0,
  direction: 1,
  mediaCover: '',
  sidebar: 0,
};

const pathForm = reactive({
  pathContent: '',
  autoScan: 0,
  include: '',
  exclude: '',
});
const pathArr = ref<pathType[]>([]);
const multipleSelection = ref<mediaType[]>([]);

const {t} = i18n.global;

onMounted(() => {
  // 初始化表格数据
  load_table();
});
/***
 * 关闭弹窗
 */
function dialog_close() {
  addMediaDialog.value = false;
  editMediaDialog.value = false;
}
/**
 * 开启弹窗
 */
function dialog_open() {
  Object.assign(form, formInit);

  addMediaDialog.value = true;
}

/**
 * 打开路径编辑弹框
 * @param index
 * @param row
 */
async function path_dialog_open(index: any, row: any) {
  Object.assign(form, row);
  addPathDialog.value = true;

  pathArr.value = [];

  load_path(row.mediaId);
}

/**
 * 加载路径列表
 */
async function load_path(mediaId: any) {
  const res = await pathApi.get_path(mediaId, 1, 1000);

  pathArr.value = res.list;
}

/**
 * 加载表格数据
 */
async function load_table(page = 1, pageSize = browse.manageListPageSize) {
  const res = await mediaApi.get(page, pageSize);
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
 * 新增媒体库
 * @returns {Promise<void>}
 */
async function do_add_media() {
  // 表单验证
  if (!form.mediaName) {
    ElMessage({
      message: t('path.warning.name'),
      type: 'warning',
    });

    return false;
  }

  const res = await mediaApi.add_media(form);
  if (res.code === 0) {
    dialog_close();
    reload_table();
  }
}

/**
 * 编辑媒体库
 * @param index
 * @param row
 */
function edit_media(index: any, row: any) {
  Object.assign(form, row);

  editMediaDialog.value = true;
}

/**
 * 编辑媒体库请求
 */
async function update_media() {
  // 表单验证
  if (!form.mediaName) {
    ElMessage({
      message: t('path.warning.name'),
      type: 'warning',
    });

    return false;
  }

  const res = await mediaApi.update_media(form);

  if (res.code === 0) {
    editMediaDialog.value = false;
    reload_table();
  }
}

/**
 * 删除媒体库
 * */
async function do_delete_media(index: any, row: any) {
  ElMessageBox.confirm(t('path.confirm.text'), t('path.confirm.title'), {
    type: 'warning',
  })
    .then(async () => {
      const res = await mediaApi.delete_media(row.mediaId);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => {});
}
/**
 * 删除路径
 * */
async function delete_path(pathInfo: any) {
  ElMessageBox.confirm(t('path.confirm.text1'), t('path.confirm.title'), {
    type: 'warning',
  })
    .then(async () => {
      const res = await pathApi.delete_path(pathInfo.pathId);

      if (res.code === 0) {
        load_path(pathInfo.mediaId);
      }
    })
    .catch(() => {});
}
/**
 * 重新扫面路径
 * @param pathInfo
 */
async function rescan_path(pathInfo: any) {
  ElMessageBox.confirm(t('path.confirm.text2'), t('path.confirm.title2'), {
    type: 'warning',
  })
    .then(async () => {
      const res = await pathApi.rescan_path(pathInfo.pathId);

      if (res.code === 0) {
        load_path(pathInfo.mediaId);
      }
    })
    .catch(() => {});
}
async function scan_path(pathInfo: any) {
  const res = await pathApi.scan_path(pathInfo.pathId);

  if (res.code === 0) {
    load_path(pathInfo.mediaId);
  }
}

/**
 * 添加路径信息到缓存
 */
async function add_path_cache() {
  const pathContent: any = pathForm.pathContent;
  const mediaId = form.mediaId;
  if (!pathContent) return;

  const res = await pathApi.add_path(mediaId, pathForm);

  if (res) {
    // 重置表单
    Object.assign(pathForm, {
      pathContent: '',
      autoScan: 0,
      include: '',
      exclude: '',
    });
    load_path(mediaId);
  }
}

/**
 * 生成海报
 * @param mediaId
 */
async function create_media_cover() {
  const coverFile = await mediaApi.create_cover(form.mediaId);
  form.mediaCover = coverFile;
}

/**
 * 处理选择项变化
 */
function handle_selection_change(val: mediaType[]) {
  multipleSelection.value = val;
}

/**
 * 批量删除媒体库
 */
async function batch_delete_media() {
  if (multipleSelection.value.length === 0) {
    return;
  }

  ElMessageBox.confirm(t('path.confirm.text'), t('path.confirm.title'), {
    type: 'warning',
  })
    .then(async () => {
      const ids = multipleSelection.value.map((item) => item.mediaId);
      const res = await mediaApi.batch_delete_media(ids);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => {});
}
</script>

<style lang="less" scoped src="@/style/manage.less"></style>
