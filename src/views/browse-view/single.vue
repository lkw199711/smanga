<template>
  <div class="single-page">
    <!--目录列表-->
    <chapterList-menu @before="before" @next="next" @changeChapter="change_chapter"/>

    <!--图片容器-->
    <div class="single-page-img-box">
      <bookmark :chapterId="chapterInfo.chapterId"/>
      <img class="single-page-img" :src="imgSrc" alt="接收图片" @click.stop="switch_menu"/>
      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
                       @switch-footer="switch_footer"></operation-cover>
    </div>

    <!--分页按钮-->
    <div class="footer" v-show="browseFooter">
      <el-button class="btn" type="warning" plain @click="before">上一章</el-button>

      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :count="count"/>

      <el-button class="btn" type="success" plain @click="next">下一章</el-button>
    </div>
  </div>
</template>

<script src='./script/single-page.ts' lang='ts'></script>

<style src='./style/single-page.less' scoped lang='less'></style>

<style src="./style/pagination.less" scoped lang="less"></style>
