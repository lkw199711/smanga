<template>
  <div class="double-page">
    <!--目录列表-->
    <chapterList-menu @before="before" @next="next" @changeChapter="change_chapter"/>

    <!--功能菜单-->
    <right-sidebar :direction="directionDesc"
                   @direction="switch_direction"
                   :removeFirst="removeFirst" @removeFirst="remove_poster"/>

    <!--图片容器-->
    <div class="double-page-img-box">
      <bookmark :chapterId="chapterInfo.chapterId"/>
      <template v-if="directionDesc">
        <img class="double-page-img" :src="imgSrc2" alt="接收图片2" v-if="imgSrc2"/>
        <img class="double-page-img" :src="imgSrc1" alt="接收图片1"/>
      </template>
      <template v-else>
        <img class="double-page-img" :src="imgSrc1" alt="接收图片1"/>
        <img class="double-page-img" :src="imgSrc2" alt="接收图片1" v-if="imgSrc2"/>
      </template>

      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
                       @switch-footer="switch_footer"/>
    </div>

    <!--分页按钮-->
    <div class="footer" v-show="browseFooter">
      <el-button class="btn" type="warning" plain @click="before">{{ $t('option.before') }}</el-button>
      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :count="count" :set-page-size="2"/>
      <el-button class="btn" type="success" plain @click="next">{{ $t('option.next') }}</el-button>
    </div>
  </div>
</template>

<script src='./script/double-page.ts' lang='ts'></script>

<style src='./style/double-page.less' scoped lang='less'></style>
