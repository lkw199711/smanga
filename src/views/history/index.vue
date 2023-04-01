<template>
  <div class="history-list">
    <!--列表-->
    <div :class="['chapter-list-box',{'block':config.viewType==='list'}]">
      <chapter v-for="(i,k) in list" :key="k" :viewType="config.viewType" :chapterInfo="i" @click="go_browse(i)" @contextmenu.prevent="context_menu(i,k)"/>
    </div>

    <!--分页组件-->
    <media-pager ref="pager" :count="count" @page-change="page_change"/>

    <!--功能菜单-->
    <right-sidebar :info="chapterInfo" :menuPoster="menuPoster" @reload="page_change"/>
  </div>
</template>

<script src='./script/index.ts' lang="ts"></script>

<style src='@/style/chapter-list.less' scoped lang='less'></style>
