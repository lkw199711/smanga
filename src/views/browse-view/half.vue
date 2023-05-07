<template>
  <div class="single-page">
    <!--目录列表-->
    <chapterList-menu @before="before" @next="next" @changeChapter="change_chapter"/>

    <!--功能菜单-->
    <right-sidebar  />

    <!--图片容器-->
    <div class="single-page-img-box">
      <bookmark :chapterId="chapterInfo.chapterId"/>
      <img class="single-page-img" :src="imgSrc" alt="接收图片" @click.stop="switch_menu"/>
      
      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
                       @switch-footer="switch_footer"></operation-cover>
    </div>

    <!-- 隐藏的canvas容器 -->
    <canvas id="canvas-cut" width="1920" height="1080" v-show="false"></canvas>

    <!--分页按钮-->
    <div class="footer" v-show="browseFooter">
      <el-button class="btn" type="warning" plain @click="before">{{ $t('page.before') }}</el-button>

      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :count="count"/>

      <el-button class="btn" type="success" plain @click="next">{{ $t('page.next') }}</el-button>
    </div>
  </div>
</template>

<script src='./script/half.ts' lang='ts'></script>

<style src='./style/single-page.less' scoped lang='less'></style>

<style src="./style/pagination.less" scoped lang="less"></style>
