<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-28 03:33:29
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-08-04 22:03:58
 * @FilePath: /smanga/src/views/last-read/index.vue
-->
<template>
    <div class="manga-list">
        <div class="title">继续阅读</div>
        <div :class="['manga-list-box', { block: config.viewType === 'list' }]">
            <manga v-for="item in latestList" :key="item.latestId" :viewType="config.viewType" :mangaInfo="item" />
        </div>
    </div>
</template>

<script setup lang="ts">
import store, { config } from '@/store';
import { onMounted, ref } from 'vue';
import latestApi from '@/api/latest';
import { latestType } from '@/type/latest';
import manga from '@/components/manga.vue';

let latestList = ref<latestType[]>([]);


onMounted(async () => {
    let pageSize = 10;
    
    switch (config.screenType) {
        case '4k':
            pageSize = 36;
            break;
        case '2k':
            pageSize = 36;
            break;
        case 'large':
            pageSize = 12;
            break;
        case 'middle':
            pageSize = 6;
            break;
        case 'tablet':
            pageSize = 10;
            break;
        case 'small':
            pageSize = 6;
            break;
        case 'mini':
            pageSize = 6;
            break;
        default:
            pageSize = 10;
            break;
    }
    latestList.value = await latestApi.get(1, pageSize);
})
</script>
<style lang="less" scoped>
.title{
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0.5rem 0;
    padding-left: 1rem;
    color: #333;
}
</style>
<style src="@/style/manga-list.less" scoped lang="less"></style>