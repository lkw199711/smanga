<template>
    <div class="manga-list-main">
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

        <div class="manga-list-box">
            <manga-list-item class="item" v-for="(i,k) in cList" :key="k" :mangaInfo="i"/>
            <!--填补最后一行的占位元素-->
            <div class="item seat" v-for="(i) in Array(8)" :key="i"/>
        </div>

        <!--分页组件-->
        <van-pagination v-show="!keyWord" v-model="currentPage" :total-items="list.length" :items-per-page="pageSize" @change="page_change" />
    </div>
</template>

<script src='./script/index.ts'></script>

<style src='./style/index.less' scoped type='text/less' lang='less'></style>