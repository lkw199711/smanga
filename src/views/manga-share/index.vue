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

            <el-dialog v-model="shareDetailDialog" :title="$t('mangaShare.sahreDetail')" :close-on-click-modal="false">
                <p class="title" v-if="shareData.share?.shareType">{{ shareData.share.sahreType === 'manga' ? '漫画'
                    : '媒体库'
                }}分享</p>

                <div class="manga-box" v-if="shareData.share.shareType === 'manga'">
                    <div class="manga-box-poster">
                        <img :src="posterBlob" :alt="shareData.manga.mangaName">
                    </div>

                    <!-- 展示漫画信息 手动写结构 -->
                    <div class="manga-box-content">
                        <h3 class="manga-box-title">{{ shareData.manga.mangaName }}</h3>
                        <p class="manga-box-author">{{ shareData.manga.author }}</p>
                        <p class="manga-box-count">共 {{ shareData.manga.chapterCount }} 章</p>
                        <p class="manga-box-intro">{{ shareData.manga.intro }}</p>
                    </div>
                </div>

                <div class="media-box" v-if="shareData.share.shareType === 'media'">
                    <!-- 展示媒体库信息 手动写结构 -->
                    <div class="manga-box-poster">
                        <img :src="posterBlob" :alt="shareData.media.mediaName">
                    </div>
                    <div class="manga-box-content">
                        <h3 class="manga-box-title">{{ shareData.media.mediaName }}</h3>
                        <p class="manga-box-author">{{ shareData.media.author }}</p>
                        <p class="manga-box-count">共 {{ shareData.media.mangaCount }} 本漫画</p>
                        <p class="manga-box-intro">{{ shareData.media.intro }}</p>
                    </div>
                </div>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import manga from '@/components/manga.vue';
import mangaApi from '@/api/manga';
import syncApi from '@/api/sync';
import imageApi from '@/api/image';

const browse = useBrowseStore();

const tableData = ref<any[]>([]);
const { t } = i18n.global;
let count = ref(0);

const shareDetailDialog = ref(false);
const posterBlob = ref('');

const shareData: any = ref({
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
    const shareResponse = await syncApi.analysis(row.link);
    shareData.value = shareResponse.data;
    shareDetailDialog.value = true;

    const share = shareData.value.share;
    if (!share.origin) {
        ElMessage.error('错误源地址');
        return;
    }

    let origin = share.origin;
    if (/\/api/.test(share.origin)) {
        origin = origin + '/api';
    }

    if (shareData.value.share.shareType === 'manga') {
        const manga = shareData.value.manga;
        // 加载封面
        if (manga.mangaCover) {
            posterBlob.value = await imageApi.get_from({ file: manga.mangaCover, origin });
        }

        if (manga.metas) {
            manga.author = manga.metas.find((meta: any) => meta.metaName === 'author')?.metaContent || '';
            manga.intro = manga.metas.find((meta: any) => meta.metaName === 'describe')?.metaContent || '';
        }
    }

    if (shareData.value.share.shareType === 'media') {
        const media = shareData.value.media;
        // 加载封面
        if (media.mediaCover) {
            posterBlob.value = await imageApi.get_from({ file: media.mediaCover, origin });
        }
    }
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

.manga-box {
    display: flex;
    margin-bottom: 1rem;
    border: 1px solid #eee;
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #fff;

    .manga-box-poster {
        width: 10rem;
        height: 14rem;
        flex-shrink: 0;
        margin-right: 1rem;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0.5rem;
        }
    }

    .manga-box-content {
        flex: 1;
        display: flex;
        flex-direction: column;

        .manga-box-title {
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .manga-box-author {
            font-size: 1.4rem;
            color: #666;
            margin-bottom: 0.5rem;
        }

        .manga-box-count {
            font-size: 1.4rem;
            color: #999;
            margin-bottom: 0.5rem;
        }

        .manga-box-intro {
            font-size: 1.4rem;
            color: #333;
            flex-grow: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            /* 显示的行数 */
            -webkit-box-orient: vertical;
        }
    }
}

.media-box {
    display: flex;
    margin-bottom: 1rem;
    border: 1px solid #eee;
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #fff;

    .manga-box-poster {
        width: 24.6rem;
        height: 9rem;
        flex-shrink: 0;
        margin-right: 1rem;

        img {
            height: 100%;
            object-fit: cover;
            border-radius: 0.5rem;
        }
    }

    .manga-box-content {
        flex: 1;
        display: flex;
        flex-direction: column;

        .manga-box-title {
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .manga-box-author {
            font-size: 1.4rem;
            color: #666;
            margin-bottom: 0.5rem;
        }

        .manga-box-count {
            font-size: 1.4rem;
            color: #999;
            margin-bottom: 0.5rem;
        }

        .manga-box-intro {
            font-size: 1.4rem;
            color: #333;
            flex-grow: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            /* 显示的行数 */
            -webkit-box-orient: vertical;
        }
    }
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