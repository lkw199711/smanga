<template>
    <div class="main">
        <manga-list-item class="item" v-for="(i,k) in Array(20)" :key="k" :i="i" />
        <!--填补最后一行的占位元素-->
        <div class="width-200-posted item" v-for="(i) in Array(8)" :key="i"></div>
    </div>
</template>

<script src='./script/index.ts'></script>

<style src='./style/index.less' scoped type='text/less' lang='less'></style>