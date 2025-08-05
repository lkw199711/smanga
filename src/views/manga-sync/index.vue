<template>
    <div class="manga-setting-index">

        <div class="manga-setting-box">
            <!-- 表头按钮 -->
            <div class="btn-box">
                <el-button class="add-btn" type="primary" :icon="Plus" @click="dialog_open">{{
                    $t('mangaSync.addMediaSync')
                }}
                </el-button>
                <el-button class="add-btn" type="primary" :icon="Plus" @click="dialog_open">{{
                    $t('mangaSync.getShare')
                }}
                </el-button>
            </div>

            <!--表格-->
            <el-table :data="tableData" stripe border>
                <el-table-column type="index" :label="t('account.serial')" width="54">
                </el-table-column>

                <el-table-column prop="syncId" :label="t('jobsManage.id')" width="100">
                </el-table-column>

                <el-table-column prop="link" :label="t('mangaSync.link')">
                </el-table-column>

                <el-table-column prop="createTime" :label="t('createTime')" width="160">
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

            <el-dialog v-model="shareLinkDialog" :title="$t('mangaSync.addMediaSync')" :close-on-click-modal="false">
                <el-input v-model="shareLink" type="text" :rows="10" id="payload"
                    placeholder="请输入smanga分享链接"></el-input>

                <manga :manga-info="shareData.manga" view-type="list" v-if="shareData.share.shareType === 'manga'" />

                <el-form-item label="自动">
                    <el-switch v-model="autoSync">
                        {{ $t('mangaSync.mediaSync') }}>
                    </el-switch>
                </el-form-item>

                <el-form-item label="媒体选择">
                    <el-select v-model="mediaSelectId" placeholder="请选择媒体">
                        <el-option v-for="media in mediaList" :key="media.mediaId" :label="media.mediaName"
                            :value="media.mediaId">
                        </el-option>
                    </el-select>
                </el-form-item>


                <div class="dialog-footer">
                    <div class="btn-box">
                        <el-button type="success" @click="analysis_link">
                            {{ $t('mangaSync.analysis') }}</el-button>
                        <el-button type="primary" @click="sync_create">{{
                            $t('mangaSync.add')
                        }}</el-button>
                        <el-button @click="shareLinkDialog = false">{{
                            $t('option.cancel')
                        }}</el-button>
                    </div>
                </div>
            </el-dialog>

            <el-dialog v-model="syncDetailDialog" :title="$t('mangaSync.syncInfoTitle')" :close-on-click-modal="false">
                <manga :manga-info="shareData.manga" view-type="list" v-if="shareData.share.shareType === 'manga'" />
            </el-dialog>
        </div>
    </div>
</template>
<script lang="ts">export default { name: 'manga-sync' }</script>
<script setup lang="ts">
import { Delete, Edit, Plus } from '@element-plus/icons-vue';
import { onMounted, reactive, ref } from 'vue';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import manga from '@/components/manga.vue';
import { ElButton, ElDialog, ElInput, ElMessage, ElMessageBox } from 'element-plus';
import syncApi from '@/api/sync';
import mediaApi from '@/api/media';
import type { mediaType } from '@/type/media';

const shareLinkDialog = ref(false);
const syncDetailDialog = ref(false);
const browse = useBrowseStore();
const mediaList = ref<mediaType[]>([]);

const autoSync = ref(false);
const mediaSelectId = ref();

const shareLink = ref('');
const shareData = ref({
    share: {
        shareType: '', // 假设默认是漫画
        shareLink: '',
        source: '',
        shareId: 0,
        secret: '', // 如果需要，可以添加secret
        link: '', // 如果需要，可以添加link
    },
    manga: {
        id: 0,
        title: '',
        cover: '',
    },
    media: {
        id: 0,
        title: '',
        cover: '',
    },
});

const tableData = ref<any[]>([]);
const { t } = i18n.global;
let count = ref(0);

onMounted(async () => {
    // 初始化加载数据
    load_table(browse.manageListPage, browse.manageListPageSizeCache);
    const mediaListReponse = await mediaApi.get();
    mediaList.value = mediaListReponse.list;
});

async function load_table(page = 1, pageSize = 10) {
    // 模拟加载数据
    const listResponse = await syncApi.get({
        page,
        pageSize,
    });

    tableData.value = listResponse.list;
    count.value = listResponse.count;

    browse.manageListPage = page;
    browse.manageListPageSizeCache = pageSize;
}

function dialog_open() {
    shareData.value = {
        share: {
            shareType: '', // 默认类型为漫画
            shareLink: '',
            source: '',
            shareId: 0,
            secret: '', // 如果需要，可以添加secret
            link: '', // 如果需要，可以添加link
        },
        manga: {
            id: 0,
            title: '',
            cover: '',
        },
        media: {
            id: 0,
            title: '',
            cover: '',
        },
    };
    shareLink.value = '';
    mediaSelectId.value = undefined;
    autoSync.value = false;


    shareLinkDialog.value = true;
}

async function analysis_link() {
    if (shareLink.value.trim() === '') {
        ElMessage.error(t('mangaSync.shareLinkEmpty'));
        return;
    }

    const analysisResponse = await syncApi.analysis(shareLink.value);

    shareData.value = analysisResponse.data;
}

async function sync_create() {
    if (!mediaSelectId.value) {
        ElMessage.error(t('mangaSync.selectMedia'));
        return;
    }

    if (!shareData.value.share?.shareId) {
        ElMessage.error(t('mangaSync.shareIdEmpty'));
        return;
    }

    const syncCreateResponse = await syncApi.create({
        syncType: shareData.value.share.shareType,
        source: shareData.value.share.source,
        mediaId: mediaSelectId.value,
        shareId: shareData.value.share.shareId,
        link: shareData.value.share.link,
        secret: shareData.value.share.secret, // 如果需要，可以添加secret
        auto: autoSync ? 1 : 0, // 如果需要，可以设置为true
        token: '', // 如果需要，可以添加token
    });

    shareLinkDialog.value = false;
}

async function edit_manga(index: number, row: any) {
    const shareResponse = await syncApi.analysis(row.link);
    shareData.value = shareResponse.data;
    syncDetailDialog.value = true;
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
    );

    if (!confirm) {
        return;
    }

    // 删除漫画逻辑
    syncApi.delete(row.syncId).then(() => {
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
    margin-top: 2rem;

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