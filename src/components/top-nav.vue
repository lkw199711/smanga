<template>
    <div class="top-nav">
        <el-menu
                :default-active="activeIndex2"
                class="el-menu-demo"
                mode="horizontal"
                router
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
                @select="handleSelect"
        >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/setting-path">设置</el-menu-item>
        </el-menu>
    </div>
</template>

<script lang='ts'>
    import {defineComponent, ref} from 'vue'

    export default defineComponent({
        setup() {
            const activeIndex = ref('1')
            const activeIndex2 = ref('1')
            const handleSelect = (key: any, keyPath: any) => {
                // console.log(key, keyPath)
            }
            return {
                activeIndex,
                activeIndex2,
                handleSelect,
            }
        },

        name: 'top-nav',
        // 数据
        data() {
            return {}
        },

        // 传值
        props: [],

        // 引用
        computed: {},

        // 组件
        components: {},

        // 方法
        methods: {},

        // 生命周期
        created() {
        },
    })
</script>

<style scoped lang='less' type='text/less'>

</style>