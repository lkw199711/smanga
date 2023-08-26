<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-08-15 23:05:47
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-08-25 10:39:14
 * @FilePath: /smanga/src/views/manga-info/index.vue
-->
<template>
    <div class="manga-info">
        <div class="top">
            <el-carousel class="carousel" :interval="interval" :type="carouselType" v-if="banner.length">
                <el-carousel-item class="banner-box" v-for="item in banner" :key="item">
                    <img class="banner" :src="item.blob" alt="banner">
                </el-carousel-item>
                <!-- 使用一张图片撑开容器的高度 -->
                <img class="banner seat" :src="banner.length ? banner[0].blob : ''" alt="banner">
            </el-carousel>

            <el-image class="anim cover-img" :src="mangaCover" v-else></el-image>
        </div>

        <div class="middle">
            <div class="character" @wheel="character_wheel" v-if="character.length">
                <p class="character-title">角色</p>
                <perfect-scrollbar class="character-scroll" @wheel="character_wheel"
                    :options="{ suppressScrollX: false, suppressScrollY: true }">
                    <div v-for="item in character" class="character-item" :key="item.characterId">
                        <img :src="item.blob" :alt="item.characterName">
                        <div class="right">
                            <p class="name">{{ item.characterName }}</p>
                            <p class="description">{{ item.description }}</p>
                        </div>

                    </div>
                </perfect-scrollbar>
            </div>

            <el-descriptions class="meta-info" title="漫画信息" :column="infoColum">
                <el-descriptions-item label="漫画名称">{{ title }}</el-descriptions-item>
                <el-descriptions-item label="作者">{{ mangaInfo.author }}</el-descriptions-item>
                <el-descriptions-item label="发布时间">{{ mangaInfo.publishDate }}</el-descriptions-item>
                <el-descriptions-item label="章节总数">{{ mangaInfo.chapterCount }}</el-descriptions-item>
                <el-descriptions-item label="阅读方式">{{ mangaInfo.browseType }}</el-descriptions-item>
                <el-descriptions-item label="入库时间">{{ mangaInfo.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ mangaInfo.updateTime }}</el-descriptions-item>
                <el-descriptions-item label="评分">{{ mangaInfo.star }}</el-descriptions-item>
                <el-descriptions-item label="标签">
                    <el-tag v-for="item in tags" :key="item.tagId" class="tag" size="small" :color="item.tagColor">{{
                        item.tagName }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="简介">{{ mangaInfo.describe }}</el-descriptions-item>
            </el-descriptions>
        </div>

        <div class="btn-box bottom">
            <el-button class="btn" type="primary" @click="go_chapter_list">章节列表</el-button>
            <el-button class="btn" type="warning" @click="go_chapter" v-if="latestChapterInfo">继续阅读</el-button>
            <el-button class="btn" type="success" @click="go_chapter" v-else>开始阅读</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, computed } from 'vue';
import mangaApi from '@/api/manga';
import imageApi from '@/api/image'
import { config, userConfig } from '@/store'
import { tagItemType } from '@/type/tag';
import { characterItem, metaItemType } from '@/type/meta';
import { mangaInfoType } from '@/type/manga';
import { chapterInfoType } from '@/type/chapter';
import chapterApi from '@/api/chapter';
import { global_set } from '@/utils'
import historyApi from '@/api/history';

const router = useRouter();

let mangaInfo = ref<mangaInfoType>({
    mangaId: 0,
    mangaName: '',
    author: '',
    browseType: '',
    publishDate: '',
    createTime: '',
    updateTime: '',
    describe: '',
    chapterCount: 0,
});

let firstChapterInfo = ref<chapterInfoType>({
    browseType: '',
    chapterCover: '',
    chapterId: 0,
    chapterName: '',
    chapterPath: '',
    chapterType: '',
    createTime: '',
    mangaId: 0,
    mediaId: 0,
    pathId: 0,
    picNum: 0,
    updateTime: '',
});

let latestChapterInfo = ref<chapterInfoType | false>(false);

let title = ref('');
let tags = ref<tagItemType[]>([]);
let banner = ref<metaItemType[]>([]);
let character = ref<characterItem[]>([]);
let mangaCover = ref<string>('');

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
})

/**
 * @description: 获取漫画首个章节
 * @return {*}
 */
async function get_first_chapter() {
    const mangaId = mangaInfo.value.mangaId;
    if (!mangaId) return;

    const infoRes = await chapterApi.get_first(mangaId, userConfig.order);
    firstChapterInfo.value = infoRes.info;
}

/**
 * @description: 获取最后一次的阅读记录
 * @return {*}
 */
async function get_latest_reading() {
    const mangaId = mangaInfo.value.mangaId;
    if (!mangaId) return;

    latestChapterInfo.value = await historyApi.get_latest(mangaId);
}

/**
 * @description: 开始阅读漫画第一章
 * @return {*}
 */
function go_chapter() {
    const chapterInfo = latestChapterInfo.value ? latestChapterInfo.value : firstChapterInfo.value;

    // 缓存章节信息
    global_set('chapterId', chapterInfo.chapterId);
    global_set('chapterName', chapterInfo.chapterName);
    global_set('chapterPath', chapterInfo.chapterPath);
    global_set('chapterType', chapterInfo.chapterType);
    global_set('chapterCover', chapterInfo.chapterCover);

    let page = 1;
    if (chapterInfo.browseType === 'flow') {
        page = 0;
    }

    router.push({
        name: chapterInfo.browseType,
        query: {
            name: chapterInfo.chapterName,
            path: chapterInfo.chapterPath,
        },
        params: { page },
    });
}

/**
 * @description: 去往漫画章节列表页面
 * @return {*}
 */
function go_chapter_list() {
    router.push({
        name: 'chapter-list',
        query: {
            mangaId: mangaInfo.value.mangaId,
        },
        params: {
            browseType: mangaInfo.value.browseType,
            clear: '1'
        },
    });
}

/**
 * @description: 渲染元数据信息
 * @return {*}
 */
async function render_meta() {
    const route = useRoute();
    const mangaId = Number(route.query.mangaId);
    const info = await mangaApi.get_manga_info(mangaId);
    let bannerSoft: metaItemType[] = [];
    mangaInfo.value = info.info;
    tags.value = info.tags;
    title.value = info.info.mangaName;

    // 角色信息
    character.value = info.character;

    character.value.forEach(async (item: characterItem) => {
        const blob = await imageApi.get(item.characterPicture);
        item.blob = blob;
    })

    if (info.meta.length > 0) {
        // banner图
        for (let i = 0; i < info.meta.length; i++) {
            const metaItem = info.meta[i];
            if (metaItem.metaType === 'banner') {
                metaItem.blob = await imageApi.get(metaItem.metaFile);
                bannerSoft.push(metaItem);
            }
        }
    }

    // 漫画封面
    mangaCover.value = await imageApi.get(info.info.mangaCover);

    // 将图片进行排序
    bannerSoft.sort((a: any, b: any) => { return a.metaFile - b.metaFile });

    // 将处理好的结果赋值给ref对象 (将计算过程整合 避免多次渲染)
    banner.value = bannerSoft;
}

/**
 * @description: 角色列表的横向滚动事件
 * @param {*} event
 * @return {*}
 */
function character_wheel(event: Event) {
    const content = document.querySelector('.character-scroll');
    if (!content) return;
    event.preventDefault();

    content.scrollLeft += event.deltaY
}
</script>

<style lang="less" scoped>
:deep(.el-carousel__container) {
    height: auto !important;
}

:deep(.el-carousel__mask) {
    background-color: transparent;
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
    justify-content: space-between;

    .btn {
        width: 50%;
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
    // height: 26rem;
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
}
</style>

