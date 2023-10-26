<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-07-29 01:17:01
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-26 04:21:41
 * @FilePath: \smanga\src\views\tag-list\index.vue
-->
<template>
    <div class="tag-list">
        <div class="top">
            <el-check-tag v-for="tagItem in tagList" class="check-tag" :color="tagItem.tagColor" :checked="tagItem.checked" :key="tagItem.tagId"
                :style="tagStyle(tagItem.checked, tagItem.tagColor)"
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
    <media-pager ref="pager" :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import store, { config, userConfig, pageSizeConfig } from '@/store';
import tagApi, { tagItemType } from '@/api/tag';
import mangaApi from '@/api/manga';
import manga from '@/components/manga.vue';
import mediaPager from '@/components/media-pager.vue';
import i18n from '@/i18n';
import { mangaPageSize } from '@/store/page-size';
import { screenType } from '@/type/store';
const { t } = i18n.global;

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

let pageSizes: number[] = [];
let defaultPageSize = 10;

get_page_size_array();

function get_page_size_array() {
    const screen: screenType = config.screenType;

    pageSizes = mangaPageSize[screen];
    defaultPageSize = mangaPageSize[screen][0];
}

const page = ref(1);
const pageSize = ref(10);
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
        page_change(1);
    }
);

async function onChange(tagItem: tagItemType, status: boolean) {
    tagItem.checked = status;
    page_change(page.value);
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
    pageSize: number = defaultPageSize
) {
    page.value = pageC;

    const res = await mangaApi.get_by_tags(tagIds.value, page.value, pageSize, userConfig.order);
    mangaList.value = res.list;
    count.value = res.count;
}
</script>

<style lang="less" scoped>
// .tag-list{
//     padding: 1rem 2rem;
//     border: .2rem solid @s-background;
//     border-radius: 1rem;
// }
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