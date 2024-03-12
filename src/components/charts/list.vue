<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-28 15:04:07
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-28 18:02:21
 * @FilePath: /smanga/src/components/charts/list.vue
-->
<template>
    <div class="manga-access">
        <div class="title">漫画浏览量</div>
        <el-table :data="mangaList" style="width: 100%">
            <el-table-column prop="mangaName" label="漫画名称" />
            <el-table-column prop="num" label="Name" width="浏览量" />
        </el-table>
        <!-- <div class="manga-item" v-for="item in mangaList" :key="item.mangaId">{{ item.mangaName }}:{{ item.num }}</div> -->
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import chartsApi from '@/api/charts';

let mangaList = ref([]);

onMounted(async () => {
    const res = await chartsApi.ranking(10);
    mangaList.value = res.request;
})
</script>

<style scoped lang="less">
.manga-access{
    // height: 100%;
    background-color: #fff !important;
}
.title{
    padding: .8rem 0;
    text-align: center;
    font-size: 1.8rem;
    font-weight: bold;
}
</style>