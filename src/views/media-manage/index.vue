<template>
  <div class="media-manage-index manage-container">
    <div class="btn-box">
      <el-button type="primary" :icon="Refresh" @click="reload_table">{{ $t('option.refresh') }}</el-button>
      <el-button class="add-btn" type="success" :icon="Plus" @click="add_media">{{ $t('option.add') }}</el-button>
      <el-button type="danger" :icon="Delete" :disabled="multipleSelection.length === 0" @click="batch_delete_media">{{ $t('option.delete') }}</el-button>
    </div>

    <!--表格-->
    <el-table :data="tableData" class="custom-table" stripe border @selection-change="handle_selection_change">
      <el-table-column type="selection" width="54"></el-table-column>

      <el-table-column prop="mediaId" :label="$t('mediaManage.id')" width="80"></el-table-column>

      <el-table-column prop="mediaName" :label="$t('mediaManage.name')" width="140"></el-table-column>

      <el-table-column prop="createTime" :label="$t('mediaManage.createTime')" width="180"></el-table-column>

      <el-table-column :label="$t('account.option')">
        <template v-slot="scope">
          <el-button size="small" type="success" :icon="Edit" @click="edit_media(scope.$index, scope.row)">{{ $t('option.modify') }}</el-button>
          <el-button size="small" type="primary" :icon="FolderOpened" @click="path_dialog_open(scope.$index, scope.row)">
            {{ $t('mediaManage.path') }}
          </el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="do_delete_media(scope.$index, scope.row)">{{ $t('option.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <table-pager ref="pager" @pageChange="load_table" :page-size="browse.manageListPageSize" :count="count" />

    <!--新增媒体库弹框-->
    <media-edit v-model:editMediaDialog="addMediaDialog" edit-model="add" :media-info="mediaInfo" @reload="load_table" />

    <!-- 媒体库编辑 -->
    <media-edit v-model:editMediaDialog="editMediaDialog" edit-model="modify" :media-info="mediaInfo" @reload="load_table" />

    <!--编辑媒体库路径弹框-->
    <el-dialog
      :title="$t('path.modify')"
      v-model="addPathDialog"
      :before-close="
        () => {
          addPathDialog = false;
        }
      ">
      <el-form :model="mediaInfo" label-width="100px">
        <el-form-item :label="$t('mediaManage.form.name')">
          <el-input disabled v-model="mediaInfo.mediaName" :placeholder="$t('mediaManage.place.name')" />
        </el-form-item>

        <el-form-item :label="$t('path.form.add')">
          <el-input v-model="pathForm.pathContent" :placeholder="$t('path.place.add')">
            <template #append>
              {{ $t('option.add') }}
              &nbsp;
              <el-button :icon="Plus" @click="add_path_cache" />
            </template>
          </el-input>
        </el-form-item>
        <!--扫描字段-->
        <p class="s-form-title">{{ $t('mediaManage.title.scan') }}</p>
        <!-- 自动扫描还没做好 -->
        <el-form-item :label="$t('mediaManage.form.autoScan')">
          <el-switch v-model.number="pathForm.autoScan" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item :label="$t('path.form.include')">
          <el-input v-model="pathForm.include" :placeholder="$t('path.place.include')" />
        </el-form-item>
        <el-form-item :label="$t('path.form.exclude')">
          <el-input v-model="pathForm.exclude" :placeholder="$t('path.place.exclude')" />
        </el-form-item>

        <el-form-item :label="$t('path.form.path')">
          <div v-for="i in pathArr" :key="i.pathId" class="path-item">
            {{ i.pathContent }}
            <div class="path-btn-box">
              <el-button class="path-item-btn" size="small" type="success" @click="scan_path(i)">
                {{ $t('path.button.update') }}
              </el-button>
              <el-button class="path-item-btn" size="small" type="warning" @click="rescan_path(i)">
                {{ $t('path.button.re') }}
              </el-button>
              <el-button class="path-item-btn" size="small" type="danger" @click="delete_path(i)">
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
            <el-button type="primary" @click="addPathDialog = false">{{ $t('option.confirm') }}</el-button>
            <el-button type="warning" @click="addPathDialog = false">{{ $t('option.cancel') }}</el-button>
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
import {Delete, Edit, Plus, FolderOpened, Refresh} from '@element-plus/icons-vue';
import {ref, reactive, onMounted} from 'vue';
import mediaApi from '@/api/media';
import pathApi from '@/api/path';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import type {pathType} from '@/type/path';
import {mediaType, mediaInit} from '@/type/media';
import mediaEdit from './components/mediaEdit.vue';

const pager = ref();
const browse = useBrowseStore();

const count = ref(0);
const tableData = ref([]);
const addMediaDialog = ref(false);
const addPathDialog = ref(false);
const editMediaDialog = ref(false);
const mediaInfo = reactive<mediaType>(mediaInit);
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

/**
 * 打开路径编辑弹框
 * @param index
 * @param row
 */
async function path_dialog_open(index: any, row: any) {
  Object.assign(mediaInfo, row);
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
 * 开启弹窗
 */
function add_media() {
  Object.assign(mediaInfo, formInit);
  addMediaDialog.value = true;
}

/**
 * 编辑媒体库
 * @param index
 * @param row
 */
function edit_media(index: any, row: any) {
  Object.assign(mediaInfo, formInit, row);
  editMediaDialog.value = true;
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
  const mediaId = mediaInfo.mediaId;
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
      const ids = multipleSelection.value.map(item => item.mediaId);
      const res = await mediaApi.batch_delete_media(ids);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => {});
}
</script>

<style lang="less" scoped src="@/style/manage.less"></style>
