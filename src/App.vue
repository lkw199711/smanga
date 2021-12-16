<template>
    <div class="main">
        <top-nav></top-nav>
        <div class="view">
            <router-view/>
        </div>

    </div>

</template>

<script lang="ts">
    import {defineComponent, ref} from 'vue'
    import topNav from './components/top-nav.vue';

    export default defineComponent({
        // 组件
        components: {topNav},
    })
</script>

<style lang="less">
    .main{
        background-color: #d9d9d9;
        min-height: 100vh;
    }

    .view{
        /*padding: 100px;*/
    }
</style>
