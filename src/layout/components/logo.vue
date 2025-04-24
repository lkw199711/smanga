<template>
  <div :class="['logo','posted']">
    <img src="@/assets/smanga-logo.png" alt="logo">
  </div>
</template>

<script lang='ts'>export default {name:'logo'}</script>
<script lang='ts' setup></script>

<style scoped lang='less'>
.logo.posted {
  display: flex;
  width: 100%;
  font-size: 3rem;
  height: 6rem;
  line-height: 6rem;
  color: #5cdbd3;
  cursor: pointer;

  span {
    line-height: 6rem;
    text-wrap: inherit;
  }

  img {
    min-width: 20rem;
    max-width: 100%;
    //width: 64px;
    //height: 60px;
  }
}
</style>
