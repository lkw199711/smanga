<template>
  <div class="manga-list">
    <div class="manga-list-box">
      <manga v-for="(i,k) in list" :key="k" :mangaInfo="i"/>
    </div>

    <!--分页组件-->
    <media-pager ref="pager" :count="count" @page-change="page_change" />
  </div>
</template>

<script src='./script/index.ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
