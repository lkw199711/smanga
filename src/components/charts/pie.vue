<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-27 11:08:16
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-29 11:04:37
 * @FilePath: /smanga/src/views/index/index.vue
-->
<template>
    <v-chart ref="chart" class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { ref, provide, onMounted } from 'vue';
import chartsApi from '@/api/charts';

use([
    CanvasRenderer,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
]);

provide(THEME_KEY, 'default');
const chart = ref();

type tag = {
    tagName: string;
    num: number;
}

type series = {
    name: string;
    value: number;
}

let legendArr = ref<string[]>([]);
let seriesArr = ref<series[]>([]);
const option = ref({
    title: {
        text: '标签数量',
        left: 'center',
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        top: 'left',
        data: legendArr,
        // data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
    },
    series: [
        {
            name: 'Traffic Sources',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            // data: [
            //     { value: 335, name: 'Direct' },
            //     { value: 310, name: 'Email' },
            //     { value: 234, name: 'Ad Networks' },
            //     { value: 135, name: 'Video Ads' },
            //     { value: 1548, name: 'Search Engines' },
            // ],
            data: seriesArr,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
            },
        },
    ],
});

function resize() {
    chart.value.resize();
}

defineExpose({ resize });

onMounted(async () => {
    const res = await chartsApi.tag_count(5);
    res.request.map((item: tag) => {
        legendArr.value.push(item.tagName);
        seriesArr.value.push({ name: item.tagName, value: item.num });
    })
    
})
</script>

<style scoped></style>