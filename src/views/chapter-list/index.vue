<template>
    <div class="chapter-list">
        <manga-chapter-item class="chapter-list-item" v-for="(i,k) in list" :key="k" :chapterInfo="i"/>
        <!--填补最后一行的占位元素-->
        <div class="chapter-list-item chapter-seat-posted" v-for="(i) in Array(8)" :key="i"/>
    </div>
</template>

<script src='./script/index.ts' lang="ts"></script>

<style src='./style/index.less' scoped type='text/less' lang='less'></style>