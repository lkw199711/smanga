<template>
<div v-if="config.androidTopSeat" class="android-seat" aria-hidden="true"></div>
</template>
<script lang="ts" setup>
import { config } from '@/store';
</script>
<style lang="less">
.android-seat {
    height: max(3.2rem, env(safe-area-inset-top, 0px));
    flex-shrink: 0;
    background: transparent;
}
</style>
