<template>
    <div class="manga-list">
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
            <manga v-for="(i,k) in cList" :key="k" :mangaInfo="i"/>
        </div>

        <!--分页组件-->
        <van-pagination v-show="!keyWord" v-model="currentPage" :total-items="list.length" :items-per-page="pageSize" @change="page_change" />
    </div>
</template>

<script src='./script/index.ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
