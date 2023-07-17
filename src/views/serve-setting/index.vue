<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-07-16 12:02:34
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-07-17 20:17:33
 * @FilePath: /smanga/src/views/serve-setting/index.vue
-->
<template>
    <div class="serve-setting">
        <el-form :model="form" label-width="10rem">
            <p class="s-form-title">扫描设置</p>
            <!-- 语言设置 -->
            <div class="scan">
                <el-form-item label="扫描周期">
                    <el-input v-model="form.interval" class="interval"></el-input>
                    <el-button type="primary" @click="comfirm_interval">确定</el-button>
                </el-form-item>
            </div>
            <p class="note form-note">
                扫描周期单位为秒,可使用*表达式.设置周期最短为10
            </p>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import { interval_set, interval_get } from '@/api/serve-setting'

const form = ref({
    interval: ''
})

async function comfirm_interval() {
    interval_set(form.value.interval)
}

onMounted(async () => {
    const res = await interval_get();
    form.value.interval = res.data.data.interval
})

</script>

<style scoped lang="less">
.interval {
    margin-right: 2rem;
    width: 20rem;

    :deep(input) {
        text-align: right;
    }

}


@media only screen and (min-width: 1200px) {

    .serve-setting {
        width: 100rem;
        margin: 3rem 10rem 0;
    }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
    .path-setting-box {
        width: 72rem;
        margin: 2rem auto;
    }
}

@media only screen and (max-width: 767px) {
    .serve-setting {
        width: 100rem;
        margin: 3rem 2rem 0;
    }

    .interval {
        width: 14rem;
    }
}
</style>