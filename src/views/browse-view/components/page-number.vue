<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-25 19:09:52
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-02-28 02:40:06
 * @FilePath: /smanga/src/views/browse-view/components/page-number.vue
-->
<template>
    <div class="page-number" v-if="userConfig.showPageNumber">{{ props.page + '/' + props.count }}</div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { userConfig } from "@/store";
const props = defineProps(['page', 'count']);
</script>

<style scoped lang="less">
// 显示页码
.page-number {
    position: fixed;
    left: 50%;
    bottom: 4rem;

    font-size: 2.2rem;
    color: #fff;
    // opacity: 0.7;
    
    text-shadow: 0 0 10px #000;
}
</style>