<template>
    <div class="history-list">
        <div class="chapter-list-box">
            <chapter v-for="(i,k) in list" :key="k" :chapterInfo="i" @click="go_browse(i)"/>
        </div>

        <!--分页组件-->
        <media-pager ref="pager" :count="count" @page-change="page_change"/>
    </div>
</template>

<script src='./script/index.ts' lang="ts"></script>

<style src='@/style/chapter-list.less' scoped lang='less'></style>
