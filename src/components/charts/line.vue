<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-28 01:05:43
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-28 06:45:59
 * @FilePath: /smanga/src/components/charts/line.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

<template>
    <v-chart ref="chart" class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { ref, provide, onMounted, defineExpose } from 'vue';
import chartsApi from '@/api/charts';

use([
    CanvasRenderer,
    LineChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
]);

provide(THEME_KEY, 'default');
const chart = ref();

type history = {
    date: string;
    num: number;
}
let xArr = ref<string[]>([]);
let seriesArr = ref<number[]>([]);
const option = ref({
    title: {
        text: '您的访问频率',
        left: 'center',
    },
    xAxis: {
        type: 'category',
        data: xArr
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            data: seriesArr,
            type: 'line'
        }
    ]
});

function resize() {
    chart.value.resize();
}

defineExpose({ resize });

onMounted(async () => {
    const res = await chartsApi.frequency();
    res.request.map((item: history) => {
        xArr.value.push(item.date.slice(-5));
        seriesArr.value.push(item.num);
    })
})
</script>

<style scoped></style>