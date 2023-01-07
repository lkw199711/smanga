<template>
  <div class="history-list">
    <form action="/">
      <van-search
          v-model="keyWord"
          show-action
          placeholder="请输入搜索关键词"
          @search="search"
          @cancel="cancel"
      />
    </form>

    <div class="chapter-list-box">
      <chapter v-for="(i,k) in cList" :key="k" :chapterInfo="i" :bookmark="true" @click="go_browse(i)"/>
    </div>

    <!--分页组件-->
    <van-pagination v-model="currentPage" :total-items="list.length" :items-per-page="pageSize"
                    :show-page-size="showPage" force-ellipses @change="page_change"/>
  </div>
</template>

<script src='./script/index.ts' lang="ts"></script>

<style src='@/style/chapter-list.less' scoped lang='less'></style>
