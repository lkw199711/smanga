<template>
    <div class="manga-info">
        <div class="top" :style="[bannerModel === 'toomics' && { marginTop: 0 }]">
            <template v-if="banner.length">
                <el-carousel class="carousel" :interval="interval" :type="carouselType"
                    v-if="bannerModel === 'toptoon'">
                    <el-carousel-item class="banner-box" v-for="item in banner" :key="item">
                        <img class="banner" :src="item.blob" alt="banner">
                    </el-carousel-item>
                    <!-- 使用一张图片撑开容器的高度 -->
                    <img class="banner seat" :src="banner.length ? banner[0].blob : ''" alt="banner">
                </el-carousel>

                <div class="banner-toomics" v-if="bannerModel === 'toomics'">
                    <img class="banner-toomics-fore" :src="banner[0]?.blob" alt="banner">
                    <img class="banner-toomics-back" :src="banner[1]?.blob" alt="bannerBg">
                </div>
            </template>

            <el-image class="anim cover-img" :src="mangaCover" v-else></el-image>

        </div>

        <div class="middle">
            <div class="character" @wheel="character_wheel" v-if="character.length">
                <p class="character-title">角色</p>
                <div class="character-scroll" @wheel="character_wheel"
                    :options="{ suppressScrollX: false, suppressScrollY: true }">
                    <div v-for="item in character" class="character-item" :key="item.characterId">
                        <img :src="item.blob" :alt="item.metaContent">
                        <div class="right">
                            <p class="name">{{ item.metaContent }}</p>
                            <p class="description">{{ item.description }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <el-descriptions class="meta-info" title="漫画信息" :column="infoColum">
                <el-descriptions-item label="漫画名称">{{ mangaInfo.mangaName }}</el-descriptions-item>
                <el-descriptions-item label="作者">{{ mangaInfo.author }}</el-descriptions-item>
                <el-descriptions-item label="发布时间">{{ mangaInfo.publishDate }}</el-descriptions-item>
                <el-descriptions-item label="章节总数">{{ mangaInfo.chapterCount }}</el-descriptions-item>
                <el-descriptions-item label="阅读方式">{{ mangaInfo.browseType }}</el-descriptions-item>
                <el-descriptions-item label="入库时间">{{ mangaInfo.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ mangaInfo.updateTime }}</el-descriptions-item>
                <el-descriptions-item label="评分">{{ mangaInfo.star }}</el-descriptions-item>
                <el-descriptions-item label="标签">
                    <el-tag v-for="item in mangaInfo.tags" :key="item.tagId" class="tag" size="small"
                        :color="item.tagColor">{{
                            item.tagName }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="简介">{{ mangaInfo.describe }}</el-descriptions-item>
            </el-descriptions>
        </div>

        <div class="btn-box bottom">
            <el-button class="btn" type="primary" @click="go_chapter_list">章节列表</el-button>

            <el-button class="btn continue-read" type="warning" @click="go_chapter" v-if="latestChapterInfo">
                {{ latestChapterInfo.chapter.chapterName }}
                第{{ latestChapterInfo.page }}页
            </el-button>
            <el-button class="btn" type="success" @click="go_chapter" v-else>开始阅读</el-button>

            <el-button class="btn" type="warning" @click="remove_collect" v-if="isCollect">取消收藏</el-button>
            <el-button class="btn" type="success" @click="collect_manga" v-else>收藏漫画</el-button>

            <el-button class="btn" type="primary" @click="open_tag_box">编辑标签</el-button>
            <el-button class="btn" type="primary" @click="open_covers_edit" v-if="hasManyCover">编辑封面</el-button>
            <el-button class="btn" type="primary" @click="open_metas_edit">编辑元数据</el-button>
        </div>

        <el-dialog :title="$t('rightSidebar.editTags')" v-model="editTagsDialog">
            <mangaTagBox :mangaId="mangaInfo.mangaId" :tags="mangaInfo.tags" @update_tags="update_tags"
                @close_dialog="editTagsDialog = false" />
        </el-dialog>

        <el-dialog :title="$t('rightSidebar.editCover')" v-model="editCover">
            <div class="cover-setting">
                <div :class="['cover-setting-box', { 'active': item.active }]" v-for="item in covers"
                    :key="item.metaId">
                    <img :src="item.blob" alt="cover" @click="choose_cover(item.metaFile)">
                </div>
            </div>
        </el-dialog>

        <el-dialog :title="$t('rightSidebar.editMetas')" v-model="editMetasDialog">
            <el-form :model="metaForm" label-width="auto" style="max-width: 600px">
                <el-form-item label="漫画名称">
                    <el-input v-model="metaForm.title" placeholder="请输入漫画名称"></el-input>
                </el-form-item>
                <el-form-item label="作者">
                    <el-input v-model="metaForm.author" placeholder="请输入作者名"></el-input>
                </el-form-item>
                <el-form-item label="发布时间">
                    <el-date-picker v-model="metaForm.publishDate" type="date" placeholder="请选择发布时间" />
                </el-form-item>
                <el-form-item label="评分">
                    <el-input v-model="metaForm.star" placeholder="请输入评分"></el-input>
                </el-form-item>
                <el-form-item label="简介">
                    <el-input type="textarea" v-model="metaForm.describe" placeholder="请输入漫画简介"></el-input>
                </el-form-item>
                <!-- 是否写入json -->
                <el-form-item label="存为JSON">
                    <el-switch v-model="metaWriteJson"></el-switch>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="update_metas">保存</el-button>
                    <el-button @click="editMetasDialog = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, reactive, computed } from 'vue';
import mangaApi from '@/api/manga';
import imageApi from '@/api/image'
import { config, userConfig } from '@/store'
import { tagItemType } from '@/type/tag';
import { metaItemType } from '@/type/meta';
import { mangaInfoType } from '@/type/manga';
import { chapterType } from '@/type/chapter';
import chapterApi from '@/api/chapter';
import lastesApi from '@/api/latest';
import collectApi from '@/api/collect';
import mangaTagBox from '@/components/manga-tag-box.vue';
import useBrowseStore from '@/store/browse';
const browse: any = useBrowseStore();
const router = useRouter();
const route = useRoute();

const metaForm = reactive({
    title: '',
    author: '',
    publishDate: '',
    star: '',
    describe: '',
});

let mangaInfo = reactive<mangaInfoType>({
    mediaId: 0,
    mangaId: 0,
    mangaName: '',
    mangaCover: '',
    title: '',
    author: '',
    browseType: '',
    publishDate: '',
    createTime: '',
    updateTime: '',
    describe: '',
    chapterCount: 0,
    tags: [],
    metas: [],
});

let firstChapterInfo = ref<chapterType>();

let latestChapterInfo = ref<chapterType | false>(false);

let banner = ref<metaItemType[]>([]);
let covers = ref<metaItemType[]>([]);
let character = ref<metaItemType[]>([]);
let mangaCover = ref<string>('');
let isCollect = ref(false);
let editTagsDialog = ref(false);
let editCover = ref(false);
let editMetasDialog = ref(false);
let bannerModel = ref<string>('toptoon');
let hasManyCover = ref(false);
let metaWriteJson = ref(true);

// 轮播自动滚动时间间隔 默认为6秒钟
const interval = ref(6 * 1000);

const carouselType = computed(() => {
    const screen = config.screenType;

    if (['middle', 'large', '2k', '4k'].includes(screen)) {
        return 'card';
    } else {
        return '';
    }

})

const infoColum = computed(() => {
    const screen = config.screenType;

    switch (screen) {
        case 'large':
            return 3;
        case 'middle':
            return 2;
        case 'small':
            return 1;
        case 'mini':
            return 1;
        default:
            return 4;
    }
})

onMounted(async () => {
    // 渲染元数据
    await render_meta();
    await get_first_chapter();
    await get_latest_reading();

    get_collect_status();
})

/**
 * @description: 获取漫画首个章节
 * @return {*}
 */
async function get_first_chapter() {
    const mangaId = mangaInfo.mangaId;
    if (!mangaId) return;

    firstChapterInfo.value = await chapterApi.get_first(mangaId, userConfig.order);
}

/**
 * @description: 获取最后一次的阅读记录
 * @return {*}
 */
async function get_latest_reading() {
    const mangaId = mangaInfo.mangaId;
    if (!mangaId) return;

    latestChapterInfo.value = await lastesApi.get_latest(mangaId);
}

/**
 * @description: 开始阅读漫画第一章
 * @return {*}
 */
async function go_chapter() {
    const chapterInfo = latestChapterInfo.value ? latestChapterInfo.value : firstChapterInfo.value;
    if (!chapterInfo) return;
    // 使用pinia存储页码
    if (chapterInfo.page && chapterInfo.page > 1) {
        browse.page = chapterInfo.page;
        localStorage.setItem('pageJump', chapterInfo.page.toString());
    } else {
        browse.page = 1;
    }

    const browsePageRoute = {
        name: mangaInfo.browseType,
        query: {
            mediaId: mangaInfo.mediaId,
            mangaId: mangaInfo.mangaId,
            chapterId: chapterInfo?.chapterId
        }
    }

    if (userConfig.openNewTab) {
        const newUrl = router.resolve(browsePageRoute);
        window.open(newUrl.href, '_blank');
    } else {
        router.push(browsePageRoute);
    }
}

/**
 * @description: 去往漫画章节列表页面
 * @return {*}
 */
function go_chapter_list() {
    browse.chapterListPage = 1;
    router.push({
        name: 'chapter-list',
        query: {
            mangaId: mangaInfo.mangaId,
        },
        params: {
            browseType: mangaInfo.browseType,
            clear: '1'
        },
    });
}

/**
 * @description: 渲染元数据信息
 * @return {*}
 */
async function render_meta() {
    const mangaId = Number(route.query.mangaId);
    Object.assign(mangaInfo, await mangaApi.get_manga_info(mangaId));

    // 漫画封面
    try {
        mangaCover.value = await imageApi.get(mangaInfo.mangaCover);
    } catch (e: any) {
        console.log(e.message);
    }


    if (!mangaInfo.metas) return;

    const title = mangaInfo.metas.find((item: metaItemType) => item.metaName === 'title')?.metaContent;
    if (title) mangaInfo.title = title;

    const author = mangaInfo.metas.find((item: metaItemType) => item.metaName === 'author')?.metaContent;
    if (author) mangaInfo.author = author;

    const publishDate = mangaInfo.metas.find((item: metaItemType) => item.metaName === 'publishDate')?.metaContent;
    if (publishDate) mangaInfo.publishDate = publishDate;

    const describe = mangaInfo.metas.find((item: metaItemType) => item.metaName === 'describe')?.metaContent;
    if (describe) mangaInfo.describe = describe;

    const star = mangaInfo.metas.find((item: metaItemType) => item.metaName === 'star')?.metaContent;
    if (star) mangaInfo.star = star;

    // 封面
    covers.value = mangaInfo.metas.filter((item: metaItemType) => item.metaName === 'cover');
    hasManyCover.value = covers.value.length > 0;

    // 广告图
    banner.value = mangaInfo.metas.filter((item: metaItemType) => item.metaName === 'banner');
    banner.value.length === 2 && banner.value.some((item: metaItemType) => /bannerBackground/.test(item.metaFile)) && (bannerModel.value = 'toomics');
    banner.value.forEach(async (item: metaItemType) => {
        item.blob = await imageApi.get(item.metaFile);
    });

    // 将图片进行排序
    banner.value.sort((a: any, b: any) => { return a.metaFile - b.metaFile });

    // 角色信息
    character.value = mangaInfo.metas.filter((item: metaItemType) => item.metaName === 'character');
    character.value.forEach(async (item: metaItemType) => {
        const blob = await imageApi.get(item.metaFile);
        item.blob = blob;
    })
}

/**
 * @description: 角色列表的横向滚动事件
 * @param {*} event
 * @return {*}
 */
function character_wheel(event: any) {
    const content = document.querySelector('.character-scroll');
    if (!content) return;
    event.preventDefault();

    content.scrollLeft += event.deltaY
}

async function get_collect_status() {
    if (!mangaInfo.mangaId) return;
    isCollect.value = await collectApi.is_collect('manga', mangaInfo.mangaId);
}

async function collect_manga() {
    if (!mangaInfo.mangaId) return;
    await collectApi.add_collect(Object.assign(mangaInfo, {
        collectType: 'manga',
    }));

    get_collect_status();
}

async function remove_collect() {
    if (!mangaInfo.mangaId) return;
    await collectApi.remove_collect('manga', mangaInfo.mangaId);
    get_collect_status();
}

function open_tag_box() {
    editTagsDialog.value = true;
    // update_tags_state();
}

function open_covers_edit() {
    editCover.value = true;
    covers.value.forEach(async (item: metaItemType) => {
        item.active = item.metaFile === mangaInfo.mangaCover;
        const blob = await imageApi.get(item.metaFile);
        item.blob = blob;
    });
}

function open_metas_edit() {
    editMetasDialog.value = true;
    Object.assign(metaForm, mangaInfo);
}

function choose_cover(metaFile: string) {
    if (!metaFile) return;
    covers.value.forEach((item: metaItemType) => {
        item.active = item.metaFile === metaFile;
    });
    mangaApi.update_manga({
        mangaId: mangaInfo.mangaId,
        mangaCover: metaFile
    }).then(() => {
        mangaInfo.mangaCover = metaFile;
        editCover.value = false;
    }).catch((err: any) => {
        console.error('更新封面失败:', err);
    });
}

async function update_metas() {
    if (!mangaInfo.mangaId) return;
    await mangaApi.update_manga_meta(metaForm, metaWriteJson.value)
    editMetasDialog.value = false;
    await render_meta();
}
/**
 * @description: 更新详情页的tag列表
 * @param {*} tagsParams
 * @return {*}
 */
function update_tags(tagsParams: tagItemType[]) {
    mangaInfo.tags = tagsParams;
}
</script>

<style lang="less" scoped>
:deep(.el-carousel__container) {
    height: auto !important;
}

:deep(.el-carousel__mask) {
    background-color: transparent;
}

.banner-toomics {
    position: relative;
    width: 100%;
    height: 32rem;

    img {
        position: absolute;
        bottom: 0;
        display: block;
        margin: 0 auto;
        object-fit: cover;
    }

    &-fore {
        height: 100%;
        max-width: 100%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1;
    }

    &-back {
        width: 100%;
        height: 100%;
        z-index: 0;
        filter: blur(2px);
    }
}
// 自动换行
.continue-read{
    white-space: normal;
}

.cover-setting {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;

    .cover-setting-box {
        width: 20rem;
        height: 30rem;
        border-radius: 1rem;
        overflow: hidden;
        position: relative;
        border: .8rem solid var(--el-border-color);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        &:hover {
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        &.active {
            border-color: var(--el-color-primary);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        }
    }
}

.character-scroll {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    gap: 1rem;
    padding: 1rem;
}

.top {
    margin-top: 2rem;
}

.carousel {
    height: auto;
}

.banner {
    display: block;
    margin: 0 auto;
    max-width: 100%;
}

.seat {
    opacity: 0;
}

.title {
    font-size: 2.4rem;
    text-align: center;
    margin-bottom: 2rem;
}

.character-title {
    color: var(--el-text-color-primary);
    font-size: 1.6rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-indent: 2rem;
}

.character {
    white-space: nowrap;
    margin-top: 0;

    &-scroll {
        display: flex;
    }

    &-item {
        display: flex;
        padding: 1rem;
        margin: 0 1rem;
        border: .4rem @s-background solid;
        border-radius: 2rem;

        img {
            width: 12rem;
        }

        .right {
            margin-left: 1rem;
            width: 20rem;
            white-space: initial;
            text-indent: 1rem;
            line-height: 1.5;
        }

        .description {
            font-size: 1.2rem;
        }
    }
}

.meta-info {
    margin: 2rem 2rem 0 2rem;
}

:deep(.el-descriptions__body) {
    border-radius: 2rem;
    background-color: transparent;
}

.btn-box {
    display: flex;
    margin: 0 2rem;
    flex-wrap: wrap;
    justify-content: space-between;

    .el-button+.el-button {
        margin-left: 0;
    }

    .btn {
        width: 24%;
        margin-bottom: 1rem;
    }
}

// 底层占位符 怕手机点不到
.bottom {
    margin-bottom: 6rem;
}

// 封面
.cover-img {
    display: block;
    margin: 0 auto;
    width: 28rem;
    min-width: 14rem;
    height: 40rem;
}

@media only screen and (min-width: 4096px) {
    .banner {
        width: 100rem;
    }
}

@media only screen and (max-width: 4095px) and (min-width: 2560px) {
    .banner {
        width: 80rem;
    }
}

@media only screen and (max-width: 2559px) and (min-width: 1920px) {
    .banner {
        width: 60rem;
    }
}

@media only screen and (max-width: 1919px) and (min-width: 1200px) {
    .banner {
        width: 50rem;
    }

    .banner-toomics {
        height: 20rem;
    }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
    .top {
        margin-top: 0;
    }

    .character {
        img {
            width: 8rem;
        }

        &-item {
            padding: .6rem;
            border-radius: 1.2rem;
        }

        .right {
            width: 14rem;
            line-height: 1.5;
        }
    }

    .banner {
        width: 40rem;
    }

    .banner-toomics {
        height: 20rem;
    }
}

@media only screen and (max-width: 767px) {
    .top {
        margin-top: 0;
    }

    .character {
        margin-top: 2rem;

        img {
            width: 6rem;
        }

        &-item {
            padding: .4rem;
            border-radius: 1rem;
        }

        .right {
            width: 14rem;
            line-height: 1.5;
        }
    }

    .btn-box .btn {
        width: 48%;
    }

    .banner-toomics {
        height: 10rem;
    }
}
</style>
