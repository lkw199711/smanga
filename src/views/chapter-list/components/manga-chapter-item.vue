<template>
    <div class="manga-chapter-item">
        <div class="item-main" @click="go_browse">
            <el-image :class="{'anim':finish}" :src="poster" :fit="fit" :style="style" :alt="title" el-fade-in
                      @load="anim">
                <template name="el-fade-in-linear" #placeholder>
                    <el-image :src="placeholder" fit="fill" :style="style"/>
                </template>
            </el-image>
            <p class="manga-name">{{title}}</p>
        </div>
    </div>
</template>

<script lang='ts'>
    import {defineComponent} from 'vue'
    import {get_img} from "@/serve";

    export default defineComponent({
        name: 'manga-chapter-item',
        // 数据
        data() {
            return {
                title: '',
                poster: '',
                posterUrl: '',
                placeholder: require('@/assets/s-blue.png'),
                src: '',
                test: 'http://m.tt2.ink:9000/test.jpg',
                fit: 'contain',
                alt: '封面',
                finish: false,
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

        // 组件
        components: {},

        // 方法
        methods: {
            anim() {
                this.finish = true;
            },
            go_browse() {
                this.$router.push({
                    path: '/browse-view',
                    query: Object.assign(this.$route.query, {chapter: this.title})
                })
            }
        },

        // 生命周期
        created() {
            this.title = this.chapterInfo.name;
            this.posterUrl = this.chapterInfo.poster;

            // console.log(this.posterUrl);
            get_img({params: {file: this.posterUrl}}).then(res=>{
                // 获取图片数据,转变为blob链接
                const blob = URL.createObjectURL(res.data);

                this.poster = blob;
            })
        },
    })
</script>

<style scoped lang='less' type='text/less'>
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