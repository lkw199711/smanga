<template>
  <div class="browse-view">
    <!--目录列表-->
    <chapterList-menu @before="before" @next="next" @changeChapter="change_chapter"/>

    <!--列表下拉刷新-->
    <van-pull-refresh
        v-model="refreshing"
        @refresh="refresh_page"
    >
      <!--列表-->
      <van-list
          v-model="loading"
          :finished="finished"
          :immediate-check="false"
          @load="load_img"
          @click.stop="switch_menu"
      >
        <img v-for="(k, i) in imgFileList" :src="k" :key="i" alt="接收图片"/>
      </van-list>
    </van-pull-refresh>

    <!--翻页按钮-->
    <div class="btn-box" v-show="imgFileList.length">
      <el-button class="btn" type="warning" plain @click="before">上一章</el-button>
      <el-button class="btn" type="success" plain @click="next">下一章</el-button>
    </div>
  </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
