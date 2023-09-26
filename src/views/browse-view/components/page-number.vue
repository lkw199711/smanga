<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-25 19:09:52
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-26 12:43:27
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

    font-size: 1.8rem;
    color: white;
    opacity: 0.7;
}
</style>