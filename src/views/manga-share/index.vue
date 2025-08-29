<template>
    <div class="manga-setting-index">
        <div class="manga-setting-box">
            <!-- 表头按钮 -->
            <div class="btn-box">
            </div>
            <!--表格-->
            <el-table :data="tableData" stripe border>
                <el-table-column type="index" :label="t('account.serial')" width="54">
                </el-table-column>

                <el-table-column prop="shareId" :label="t('jobsManage.id')" width="100">
                </el-table-column>

                <el-table-column prop="shareType" :label="t('jobsManage.type')" width="100"></el-table-column>

                <el-table-column prop="shareName" :label="t('jobsManage.name')" width="160"></el-table-column>

                <el-table-column prop="link" :label="t('mangaShare.link')">
                </el-table-column>

                <el-table-column prop="createTime" :label="t('createTime')" width="160">
                </el-table-column>

                <el-table-column prop="expires" :label="t('mangaShare.expires')" width="160">
                    <template v-slot="scope">
                        {{ new Date(scope.row.expires).toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('account.option')" width="170">
                    <template v-slot="scope">
                        <el-button size="small" type="primary" :icon="Edit"
                            @click="edit_manga(scope.$index, scope.row)">{{
                                t('option.check') }}
                        </el-button>
                        <el-button size="small" type="danger" :icon="Delete"
                            @click="delete_manga(scope.$index, scope.row)">{{
                                t('option.delete') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!--分页-->
            <table-pager ref="pager" :page-size="browse.manageListPageSize" @pageChange="load_table" :count="count" />

            <el-dialog v-model="mangaDialog">
                <manga :manga-info="mangaInfo" view-type="list" @close_dialog="mangaDialog = false" />
            </el-dialog>
        </div>
    </div>
</template>
<script lang="ts">export default { name: 'manga-share' }</script>
<script setup lang="ts">
import { Delete, Edit, Plus } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import shareApi from '@/api/share';
import { ElMessageBox } from 'element-plus';
import manga from '@/components/manga.vue';
import mangaApi from '@/api/manga';

const browse = useBrowseStore();

const tableData = ref<any[]>([]);
const { t } = i18n.global;
let count = ref(0);

const mangaDialog = ref(false);
const mangaInfo = ref({
    mangaId: 0,
    mangaName: '',
    mangaCover: '',
    mangaPath: '',
    mediaId: 0,
});

onMounted(() => {
    // 初始化加载数据
    load_table(browse.manageListPage, browse.manageListPageSizeCache);
});

async function load_table(page = 1, pageSize = 10) {
    // 模拟加载数据
    const response = await shareApi.get({ page, pageSize });
    tableData.value = response.list;
    count.value = response.count;

    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
}

function dialog_open() {
    // 打开对话框逻辑
    console.log('打开对话框');
}

async function edit_manga(index: number, row: any) {
    mangaInfo.value = await mangaApi.get_manga_info(row.mangaId);
    mangaDialog.value = true;
}

async function delete_manga(index: number, row: any) {
    const confirm = await ElMessageBox.confirm(
        t('option.deleteConfirm'),
        t('option.warning'),
        {
            confirmButtonText: t('option.confirm'),
            cancelButtonText: t('option.cancel'),
            type: 'warning',
        }
    )

    if (!confirm) {
        return;
    }

    // 删除漫画逻辑
    shareApi.delete(row.shareId).then(() => {
        tableData.value.splice(index, 1);
        count.value--;
    }).catch((error) => {
        console.error('删除失败:', error);
    });
}
</script>

<style lang="less" scoped>
.btn-box {
    margin-bottom: 1.4rem;
}

.dialog-footer {
    .btn-box {
        display: flex;
        justify-content: flex-end;
    }
}

#payload {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 1.6rem;
}
</style>
<style scoped lang='less'>
.manga-setting-index {
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