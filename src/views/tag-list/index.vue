<template>
    <div class="tag-list">
        <div class="top">
            <el-check-tag v-for="tagItem in tagList" class="check-tag" :color="tagItem.tagColor"
                :checked="tagItem.checked" :key="tagItem.tagId" :style="tagStyle(tagItem.checked, tagItem.tagColor)"
                @change="(status: boolean) => { onChange(tagItem, status) }" effect="dark" size="large">
                {{ tagItem.tagName }}
            </el-check-tag>
        </div>

        <div class="middle">

        </div>

        <div class="bottom">

        </div>
    </div>

    <div class="manga-list">
        <div :class="['manga-list-box', { block: config.viewType === 'list' }]">
            <manga v-for="mangaItem in mangaList" :key="mangaItem.mangaId" :viewType="config.viewType"
                :mangaInfo="mangaItem" @contextmenu.prevent="context_menu(mangaItem)" />
        </div>
    </div>

    <!--分页组件-->
    <media-pager ref="pager" :page="page" :page-size="browse.mangaListPageSize" :count="count"
        :page-size-config="browse.mangaListPageSizes" @page-change="page_change" />
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { config, userConfig } from '@/store';
import tagApi, { tagItemType } from '@/api/tag';
import mangaApi from '@/api/manga';
import manga from '@/components/manga.vue';
import mediaPager from '@/components/media-pager.vue';
import i18n from '@/i18n';
const { t } = i18n.global;

import useBrowseStore from '@/store/browse';
const browse = useBrowseStore();

type mangaItemType = {
    browseType: string;
    chapterCount: number;
    createTime: string;
    direction: number;
    mangaCover: string;
    mangaId: number;
    mangaName: string;
    mangaPath: string;
    mangaTagId: number;
    mediaId: number;
    pathId: number;
    removeFirst: number;
    updateTime: string;
    blob: string;
}

const page = ref(1);
// 漫画列表
let mangaList = ref<mangaItemType[]>([]);
const count = ref(0);
// 标签列表
const tagList = ref<tagItemType[]>([]);
// 标签id拼接
const tagIds = computed<string>(() => {
    const str = tagList.value
        .filter(i => i.checked)
        .map(i => i.tagId).join(',');
    return str;
});

/**
 * @description: 根据标签是否被选择,改变其样式
 * @param {*} computed
 * @return {*}
 */
const tagStyle = computed(() => {

    return function (checked: boolean, color: string) {
        const style = {
            backgroundColor: color,
            color: '#ffffff'
        }

        return checked ? style : {};
    }
})

let mangaInfo = ref({});
let menuPoster = '';

/**
 * 打开右侧菜单
 */
function context_menu(mangaItem: mangaItemType) {
    menuPoster = mangaItem.blob;
    config.rightSidebar = true;
}

// 切换排序规则时 重新加载列表
watch(
    () => userConfig.order,
    () => {
        page_change(1, browse.mangaListPageSize);
    }
);

async function onChange(tagItem: tagItemType, status: boolean) {
    tagItem.checked = status;
    page_change(page.value, browse.mangaListPageSize);
}

onMounted(async () => {
    tagList.value = await tagApi.get_nopage();
})

/**
 * 跳页
 * @param page
 * @param pageSize
 */
async function page_change(
    pageC = 1,
    pageSize: number = 10
) {
    page.value = pageC;
    mangaList.value = [];

    if (tagIds.value === '') {
        count.value = 0;
        return;
    } else {
        const res = await mangaApi.get_by_tags(tagIds.value, page.value, pageSize, userConfig.order);
        mangaList.value = res.list;
        count.value = res.count;
    }
    
    browse.mangaListPage = page.value;
    browse.mangaListPageSizeCache = pageSize;
}
</script>

<style lang="less" scoped>
.check-tag {
    cursor: pointer;
}

@media only screen and (min-width: 1200px) {
    .tag-list {
        width: 120rem;
        margin: 3rem auto;
    }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
    .tag-list {
        width: 91rem;
        margin: 2rem auto;
    }
}

@media only screen and (max-width: 767px) {
    .tag-list {
        width: 91rem;
        margin: 1rem auto;
    }
}
</style>

<style src="@/style/manga-list.less" scoped lang="less"></style>