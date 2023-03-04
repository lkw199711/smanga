<template>
  <div class="browse-view">
    <!--目录列表-->
    <chapterList-menu @before="before" @next="next" @changeChapter="change_chapter"/>

    <!-- 书签 -->
    <bookmark :chapterId="chapterInfo.chapterId"/>
    <!--列表-->
    <div v-infinite-scroll="load_img" :infinite-scroll-immediate="false"
         :infinite-scroll-disabled="loading || finished" 
         @click="switch_menu">
      <img class="list-img" v-for="(k, i) in imgFileList" :src="k" :key="i" alt="接收图片"/>
    </div>

    <!--翻页按钮-->
    <div class="btn-box" v-show="imgFileList.length">
      <el-button class="btn" type="warning" plain @click="before">上一章</el-button>
      <el-button class="btn" type="success" plain @click="next">下一章</el-button>
    </div>
  </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
