<template>
    <div class="page-number" v-if="userConfig.showPageNumber">{{ props.page + '/' + props.count }}</div>
</template>

<script setup lang="ts">
import { userConfig } from "@/store";
const props = defineProps(['page', 'count']);
</script>

<style scoped lang="less">
// 显示页码
.page-number {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 4.4rem;

    font-size: 2.2rem;
    color: #fff;
    // opacity: 0.7;
    
    text-shadow: 0 0 10px #000;
}
</style>