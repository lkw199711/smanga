<template>
  <div class="manga-setting-index">
    <div class="manga-setting-box">
      <!--表格-->
      <el-table :data="tableData" stripe border>
        <el-table-column type="index" :label="t('account.serial')" width="54">
        </el-table-column>

        <el-table-column prop="id" :label="t('jobsManage.id')" width="100">
        </el-table-column>

        <el-table-column prop="queue" :label="t('jobsManage.queue')" width="86">
        </el-table-column>

        <el-table-column prop="created_at" :label="t('createTime')" width="160">
        </el-table-column>

        <el-table-column :label="t('account.option')">
          <template v-slot="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="edit_manga(scope.$index, scope.row)">{{
              t('option.check') }}
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="delete_manga(scope.$index, scope.row)">{{
              t('option.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :count="count" />

      <el-dialog :title="t('jobsManage.details')" v-model="editMangaDialog" :before-close="dialog_close">

        <pre id="payload"><code>{{ payload }}</code></pre>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="copy_payload" id="copy-btn">{{ t('option.copy') }}</el-button>
              <el-button type="warning" @click="editMangaDialog = false">{{ t('option.cancel') }}</el-button>
            </div>
          </div>
        </template>

      </el-dialog>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: 'jobs-manage',
}
</script>
<script setup lang="ts">
import { Delete, Edit } from '@element-plus/icons-vue';
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import jobsApi from '@/api/jobs';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import { Search } from '@element-plus/icons-vue';
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import ClipboardJS from 'clipboard'

const { t } = i18n.global;

const pager = ref();
let count = ref(0);
let tableData = ref([]);
let editMangaDialog = ref(false);
let keyWord = ref('');
let payload = ref('');
let form = reactive({
  mangaId: '',
  mangaName: '',
  mangaPath: '',
  mangaCover: '',
  browseType: '',
  removeFirst: '',
  direction: 0,
});

const formInit = {
  mangaId: '',
  mangaName: '',
  mangaPath: '',
  mangaCover: '',
  browseType: 'flow',
  removeFirst: 0,
  direction: 1,
};

onMounted(() => {
  load_table();
})


/***
 * 关闭弹窗
 */
function dialog_close() {
  editMangaDialog.value = false;
}

/**
 * 加载表格数据
 */
async function load_table(page = 1, pageSize = 10) {
  const res = await jobsApi.get(page, pageSize, '', keyWord.value);
  count.value = res.count;
  tableData.value = res.list;
}
/**
 * 重载数据 页码不变
 */
function reload_table() {
  pager.value.reload_page();
}
/**
 * 编辑漫画
 * @param index
 * @param row
 */
function edit_manga(index: number, row: any) {
  editMangaDialog.value = true;
  payload.value = JSON.stringify(JSON.parse(row.payload), null, 2);
}

/**
 * 执行修改请求
 */
async function copy_payload() {
  const clipboard = new ClipboardJS('#copy-btn', {
    text() {
      return payload.value
    }
  })
  clipboard.on('success', () => {
    ElMessage.success('复制成功')
  })
  clipboard.on('error', () => {
    ElMessage.error('复制失败')
  })
}

/**
 * 删除漫画
 * */
async function delete_manga(index: number, row: any) {
  ElMessageBox.confirm(
    t('jobsManage.deleteConfirm'),
    t('mangaManage.deleteTitle'),
    {
      type: 'warning',
    }
  )
    .then(async () => {
      const res = await jobsApi.delete(row.id);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => { });
}
</script>
<style scope>
#payload {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 1.6rem;
}
</style>
<style src='./style/index.less' scoped lang='less'></style>
