<template>
    <div class="item-main">
        <el-image :class="{'anim':finish}" :src="test" :fit="fit" :style="style" :alt="alt" el-fade-in @load="anim">
            <template name="el-fade-in-linear" #placeholder>
                <el-image :src="placeholder" fit="fill" :style="style"/>
            </template>
        </el-image>
        <p class="name">单个元素</p>
    </div>
</template>

<script>
    export default {
        name: "manga-list-item",
        data() {
            return {
                name: '',
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
        methods: {
            anim() {
                this.finish = true;
            }
        }
    }
</script>

<style scoped type="text/less" lang="less">
    .item-main {
        cursor: pointer;
    }

    .name {
        text-align: center;
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