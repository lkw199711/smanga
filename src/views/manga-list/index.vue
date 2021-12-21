<template>
    <div class="manga-list-main">
        <manga-list-item class="item" v-for="(i,k) in list" :key="k" :mangaInfo="i" />
        <!--填补最后一行的占位元素-->
        <div class="item seat" v-for="(i) in Array(8)" :key="i"/>
    </div>
</template>

<script src='./script/index.ts'></script>

<style src='./style/index.less' scoped type='text/less' lang='less'></style>