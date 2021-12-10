<template>
    <div class="item-main" @click="go_chapter">

        <!--封面图片-->
        <el-image v-if="finish" class="anim" :src="poster" :fit="fit" :style="style" :alt="title"/>

        <!--占位图标-->
        <el-image v-else :src="placeholder" fit="fill" :style="style"/>

        <!--漫画名称-->
        <p class="manga-name">{{title}}</p>
    </div>
</template>

<script>
    export default {
        name: "manga-list-item",
        data() {
            return {
                placeholder: require('@/assets/s-blue.png'),
                test: 'http://m.tt2.ink:9000/test.jpg',
                fit: 'cover',
                style: {
                    width: '200px',
                    height: '260px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px'
                },
            }
        },
        props: ['mangaInfo'],

        // 引用
        computed: {
            poster() {
                return this.mangaInfo.blob;
            },
            finish() {
                return this.mangaInfo.finish;
            },
            title(){
                return this.mangaInfo.name;
            },

        },

        methods: {
            go_chapter() {
                this.$router.push({
                    path: '/chapter-list',
                    query: {manga: this.title},
                });
            }
        },
        created() {

        }
    }
</script>

<style scoped type="text/less" lang="less">
    .item-main {
        cursor: pointer;
    }

    .manga-name {
        text-align: center;
        line-height: 4;
    }

    .anim {
        opacity: 0;
        animation: mymove 1s ease-in forwards;
    }

    @keyframes mymove {
        10% {
            opacity: 0.1;
        }
        50% {
            opacity: 0.5;
        }
        60% {
            opacity: 0.6;
        }
        90% {
            opacity: 0.9;
        }
        100% {
            opacity: 1;
        }
    }
</style>