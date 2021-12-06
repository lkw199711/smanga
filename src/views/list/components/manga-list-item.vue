<template>
    <div class="item-main">
        <img :src="src" alt="漫画封面">
        <p class="name">单个元素</p>
    </div>
</template>

<script>
    export default {
        name: "manga-list-item",
        data() {
            return {
                name: '',
                src: require('../../../assets/s-blue.png')
            }
        }
    }
</script>

<style scoped type="text/less" lang="less">
    .item-main {
        width: 200px;
        margin: 0 20px;
    }

    img {
        display: block;
        width: 100%;
    }

    .name {
        text-align: center;
    }
</style>