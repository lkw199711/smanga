<template>
    <div class="manga-chapter-item">
        <div class="item-main" @click="go_browse">
            <!--封面图片-->
            <el-image v-if="finish" class="anim" :src="poster" :fit="fit" :style="style" :alt="title"/>

            <!--占位图标-->
            <el-image v-else :src="placeholder" fit="fill" :style="style"/>

            <!--章节名称-->
            <p class="chapter-name">{{title}}</p>
        </div>
    </div>
</template>

<script lang='ts'>
    import {defineComponent} from 'vue'

    export default defineComponent({
        name: 'manga-chapter-item',
        // 数据
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

        // 传值
        props: ['chapterInfo'],

        // 引用
        computed: {
            poster() {
                return this.chapterInfo.blob;
            },
            finish() {
                return this.chapterInfo.finish;
            },
            title(){
                return this.chapterInfo.name;
            },

        },

        // 组件
        components: {},

        // 方法
        methods: {
            go_browse() {
                this.$router.push({
                    path: '/browse-view',
                    query: Object.assign(this.$route.query, {chapter: this.title})
                })
            }
        },

        // 生命周期
        created() {
        },
    })
</script>

<style scoped lang='less' type='text/less'>
    .item-main {
        cursor: pointer;
    }

    .chapter-name {
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