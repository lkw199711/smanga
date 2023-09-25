<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-25 19:09:52
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-25 19:17:46
 * @FilePath: /smanga/src/views/browse-view/components/page-number.vue
-->
<template>
    <div class="page-number">{{ props.page + '/' + props.count }}</div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
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