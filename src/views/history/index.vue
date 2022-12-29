<template>
    <div class="history-list">
        <!--vant-sousuok-->
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
            <manga-chapter-item class="chapter-list-item" v-for="(i,k) in cList" :key="k" :chapterInfo="i"/>
            <!--填补最后一行的占位元素-->
            <div class="chapter-list-item chapter-seat" v-for="(i) in Array(8)" :key="i"/>
        </div>

        <!--分页组件-->
        <van-pagination v-model="currentPage" :total-items="list.length" :items-per-page="pageSize" :show-page-size="showPage" force-ellipses @change="page_change" />
    </div>
</template>

<script src='./script/index.ts' lang="ts"></script>

<style src='./style/index.less' scoped lang='less'></style>
