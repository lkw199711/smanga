<template>
  <div class="double-page">
    <!--目录列表-->
    <chapterList-menu @before="before" @next="next" @changeChapter="change_chapter"/>

    <!--图片容器-->
    <div class="double-page-img-box">
      <bookmark :chapterId="chapterInfo.chapterId"/>
      <img class="double-page-img" :src="imgSrc1" alt="接收图片1"/>
      <img class="double-page-img" :src="imgSrc2" alt="接收图片1" v-if="imgSrc2"/>
      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
                       @switch-footer="switch_footer"></operation-cover>
    </div>

    <!--分页按钮-->
    <div class="footer" v-show="browseFooter">
      <el-button class="btn" type="warning" plain @click="before">上一章</el-button>

      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :count="count" :set-page-size="2"/>

      <el-button class="btn" type="success" plain @click="next">下一章</el-button>
    </div>
  </div>
</template>

<script src='./script/double-page.ts' lang='ts'></script>

<style src='./style/double-page.less' scoped lang='less'></style>
