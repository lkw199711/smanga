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
          <el-button size="small" type="info" @click="open_scan_history(scope.row)">扫描记录</el-button>
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
              <el-button :icon="View" :loading="previewLoading" @click="preview_new_path">试扫描</el-button>
              <el-button :icon="Plus" @click="add_path_cache">{{ $t('option.add') }}</el-button>
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
        <el-form-item label="扫描模板">
          <el-select v-model="pathForm.scanTemplateKey" class="w-full" placeholder="请选择扫描模板">
            <el-option v-for="item in scanTemplateOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="元数据识别">
          <el-select v-model="pathForm.metadataProfileKey" class="w-full" placeholder="请选择元数据识别方式">
            <el-option v-for="item in metadataProfileOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
          <div class="config-description">{{ selectedMetadataProfileDescription }}</div>
        </el-form-item>

        <el-form-item :label="$t('path.form.path')">
          <div v-for="i in pathArr" :key="i.pathId" class="path-item">
            {{ i.pathContent }}
            <el-tag v-if="is_path_dirty(i)" size="small" type="warning">配置未保存</el-tag>
            <div class="path-config-box">
              <el-select v-model="i.scanTemplateKey" size="small" placeholder="扫描模板">
                <el-option v-for="item in savedScanTemplateOptions" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
              <el-select v-model="i.metadataProfileKey" size="small" placeholder="元数据识别">
                <el-option v-for="item in metadataProfileOptions" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
              <el-button class="path-item-btn" size="small" type="primary" :loading="savingPathId === i.pathId" @click="save_path_config(i)">
                保存配置
              </el-button>
            </div>
            <div class="path-btn-box">
              <el-button class="path-item-btn" size="small" :icon="View" :loading="previewLoadingPathId === i.pathId" @click="preview_saved_path(i)">
                试扫
              </el-button>
              <el-button class="path-item-btn" size="small" type="success" :loading="scanningPathId === i.pathId" @click="scan_path(i)">
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

    <scan-preview-dialog
      v-model="previewDialog"
      :result="previewResult"
      :loading="previewLoading || previewLoadingPathId !== null"
      @apply-template="apply_preview_template" />
    <scan-run-dialog v-model="scanRunDialog" :media-id="scanRunMediaId || undefined" :initial-scan-run-id="activeScanRunId" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'media-manage-index',
};
</script>

<script lang="ts" setup>
import {Delete, Edit, Plus, FolderOpened, Refresh, View} from '@element-plus/icons-vue';
import {ref, reactive, onMounted, computed} from 'vue';
import mediaApi from '@/api/media';
import pathApi from '@/api/path';
import scanRunApi from '@/api/scan-run';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import type {pathType} from '@/type/path';
import type {ScanPreviewInput, ScanPreviewResult, ScanTemplateKey} from '@/type/scan';
import {fallbackScanCatalog} from '@/constants/scan';
import {mediaType, mediaInit} from '@/type/media';
import mediaEdit from './components/mediaEdit.vue';
import ScanPreviewDialog from './components/ScanPreviewDialog.vue';
import ScanRunDialog from './components/ScanRunDialog.vue';

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

const pathForm = reactive<ScanPreviewInput>({
  pathContent: '',
  autoScan: 0,
  include: '',
  exclude: '',
  scanTemplateKey: 'auto',
  metadataProfileKey: 'auto',
});
const scanCatalog = ref({...fallbackScanCatalog});
const scanTemplateOptions = computed(() => scanCatalog.value.templates);
const savedScanTemplateOptions = computed(() => [scanCatalog.value.legacyTemplate, ...scanCatalog.value.templates]);
const metadataProfileOptions = computed(() => scanCatalog.value.metadataProfiles);
const selectedMetadataProfileDescription = computed(
  () => metadataProfileOptions.value.find(item => item.key === pathForm.metadataProfileKey)?.description || ''
);
const pathArr = ref<pathType[]>([]);
const multipleSelection = ref<mediaType[]>([]);
const previewDialog = ref(false);
const previewLoading = ref(false);
const previewLoadingPathId = ref<number | null>(null);
const previewResult = ref<ScanPreviewResult | null>(null);
const previewTargetPathId = ref<number | null>(null);
const savingPathId = ref<number | null>(null);
const scanningPathId = ref<number | null>(null);
const savedPathSignatures = reactive<Record<number, string>>({});
const scanRunDialog = ref(false);
const activeScanRunId = ref<number | null>(null);
const scanRunMediaId = ref<number | null>(null);

const {t} = i18n.global;

onMounted(() => {
  // 初始化表格数据
  load_table();
  load_scan_catalog();
});

/**
 * 打开路径编辑弹框
 * @param index
 * @param row
 */
async function path_dialog_open(index: any, row: any) {
  Object.assign(mediaInfo, row);
  reset_path_form();
  addPathDialog.value = true;

  pathArr.value = [];

  load_path(row.mediaId);
}

/**
 * 加载路径列表
 */
async function load_path(mediaId: any) {
  const res = await pathApi.get_path(mediaId, 1, 1000);

  pathArr.value = (res.list || []).map((item: pathType) => normalize_path_config(item));
  for (const item of pathArr.value) {
    savedPathSignatures[item.pathId] = path_config_signature(item);
  }
}

function normalize_path_config(pathInfo: pathType) {
  return {
    ...pathInfo,
    scanTemplateKey: pathInfo.scanTemplateKey || 'legacy',
    metadataProfileKey: pathInfo.metadataProfileKey || 'auto',
  };
}

function reset_path_form() {
  Object.assign(pathForm, {
    pathContent: '',
    autoScan: 0,
    include: '',
    exclude: '',
    scanTemplateKey: 'auto',
    metadataProfileKey: 'auto',
  });
}

function path_config_signature(pathInfo: Pick<pathType, 'scanTemplateKey' | 'metadataProfileKey'>) {
  return JSON.stringify({
    scanTemplateKey: pathInfo.scanTemplateKey || 'legacy',
    metadataProfileKey: pathInfo.metadataProfileKey || 'auto',
  });
}

function is_path_dirty(pathInfo: pathType) {
  return savedPathSignatures[pathInfo.pathId] !== path_config_signature(pathInfo);
}

async function load_scan_catalog() {
  try {
    scanCatalog.value = await scanRunApi.catalog();
  } catch (error) {
    console.warn('扫描模板目录加载失败，使用内置定义', error);
  }
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
      await mediaApi.delete_media(row.mediaId);
      reload_table();
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
      await pathApi.delete_path(pathInfo.pathId);
      load_path(pathInfo.mediaId);
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
      if (is_path_dirty(pathInfo)) {
        ElMessage.warning('扫描配置尚未保存，请先保存配置');
        return;
      }
      scanningPathId.value = pathInfo.pathId;
      const result = await pathApi.rescan_path(pathInfo.pathId);
      open_scan_run(result.scanRunId, pathInfo.mediaId);
      load_path(pathInfo.mediaId);
    })
    .finally(() => {
      scanningPathId.value = null;
    })
    .catch(() => {});
}
async function scan_path(pathInfo: any) {
  if (is_path_dirty(pathInfo)) {
    ElMessage.warning('扫描配置尚未保存，请先保存配置');
    return;
  }

  scanningPathId.value = pathInfo.pathId;
  try {
    const result = await pathApi.scan_path(pathInfo.pathId);
    open_scan_run(result.scanRunId, pathInfo.mediaId);
    load_path(pathInfo.mediaId);
  } finally {
    scanningPathId.value = null;
  }
}

async function save_path_config(pathInfo: pathType) {
  savingPathId.value = pathInfo.pathId;
  try {
    await pathApi.update_path(pathInfo.pathId, {
      scanTemplateKey: pathInfo.scanTemplateKey || 'legacy',
      metadataProfileKey: pathInfo.metadataProfileKey || 'auto',
    });
    savedPathSignatures[pathInfo.pathId] = path_config_signature(pathInfo);
    ElMessage({message: '扫描配置已保存', type: 'success'});
    load_path(pathInfo.mediaId);
  } finally {
    savingPathId.value = null;
  }
}

async function preview_new_path() {
  if (!pathForm.pathContent) {
    ElMessage({message: '请先填写路径', type: 'warning'});
    return;
  }

  previewLoading.value = true;
  previewTargetPathId.value = null;
  try {
    previewResult.value = await pathApi.preview_path({
      ...pathForm,
      mediaId: mediaInfo.mediaId,
      mediaType: mediaInfo.mediaType,
      directoryFormat: mediaInfo.directoryFormat,
      isCloudMedia: mediaInfo.isCloudMedia,
    });
    previewDialog.value = true;
  } finally {
    previewLoading.value = false;
  }
}

async function preview_saved_path(pathInfo: any) {
  previewLoadingPathId.value = pathInfo.pathId;
  previewTargetPathId.value = pathInfo.pathId;
  try {
    previewResult.value = await pathApi.preview_path({
      pathContent: pathInfo.pathContent,
      mediaId: pathInfo.mediaId,
      mediaType: mediaInfo.mediaType,
      directoryFormat: mediaInfo.directoryFormat,
      autoScan: pathInfo.autoScan,
      include: pathInfo.include,
      exclude: pathInfo.exclude,
      scanTemplateKey: pathInfo.scanTemplateKey || 'legacy',
      metadataProfileKey: pathInfo.metadataProfileKey || 'auto',
      isCloudMedia: mediaInfo.isCloudMedia,
    });
    previewDialog.value = true;
  } finally {
    previewLoadingPathId.value = null;
  }
}

function apply_preview_template(templateKey: ScanTemplateKey) {
  if (previewTargetPathId.value === null) {
    pathForm.scanTemplateKey = templateKey;
  } else {
    const pathInfo = pathArr.value.find(item => item.pathId === previewTargetPathId.value);
    if (pathInfo) pathInfo.scanTemplateKey = templateKey;
  }
  ElMessage.success('已采用推荐模板，请保存配置后再执行正式扫描');
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
    if (res.scanRunId) open_scan_run(res.scanRunId, mediaId);
    // 重置表单
    reset_path_form();
    load_path(mediaId);
  }
}

function open_scan_run(scanRunId: number, mediaId: number) {
  activeScanRunId.value = scanRunId;
  scanRunMediaId.value = mediaId;
  scanRunDialog.value = true;
}

function open_scan_history(media: mediaType) {
  activeScanRunId.value = null;
  scanRunMediaId.value = media.mediaId;
  scanRunDialog.value = true;
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
      await mediaApi.batch_delete_media(ids);
      reload_table();
    })
    .catch(() => {});
}
</script>

<style lang="less" scoped src="@/style/manage.less"></style>
<style lang="less" scoped>
.path-config-box {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 8px 0;
  flex-wrap: wrap;
}

.config-description {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

@media only screen and (max-width: 767px) {
  .path-config-box,
  .path-btn-box {
    align-items: stretch;
    flex-direction: column;
  }

  .path-config-box :deep(.el-select),
  .path-config-box .el-button,
  .path-btn-box .el-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
