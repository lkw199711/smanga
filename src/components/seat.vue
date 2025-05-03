<template>
  <div v-for="key in Array(props.num || 1)" :key="key" class="seat"
    :style="{ height: props.height, width: props.width }" />
</template>

<script lang="ts">export default { name: 'seat' }</script>
<script lang='ts' setup>
const props = defineProps(['height', 'width', 'num']);
</script>

<style scoped lang='less'></style>
