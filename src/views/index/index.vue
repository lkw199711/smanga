<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-27 11:08:16
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-28 03:33:06
 * @FilePath: /smanga/src/views/index/index.vue
-->
<template>
    <div class="charts">
        <pie ref="pieRef" class="chart charts-pie" v-if="layoutLimit('pie')"></pie>
        <bar ref="barRef" class="chart charts-pie" v-if="layoutLimit('bar')"></bar>
        <line1 ref="lineRef" class="chart charts-pie" v-if="layoutLimit('line')"></line1>
        <div class="chart chart-seat" v-if="layoutLimit('list')"></div>
    </div>
    <lastRead v-if="layoutLimit('last-read')"></lastRead>
</template>

<script setup lang="ts">
import pie from '@/components/charts/pie.vue';
import bar from '@/components/charts/bar.vue';
import line1 from '@/components/charts/line.vue';
import lastRead from "@/views/last-read/index.vue";
import { onMounted, ref, computed } from 'vue';
import { config, userConfig } from '@/store';

const pieRef = ref();

const indexViewDic = {
    '4k': ['pie', 'bar', 'line', 'list', 'last-read'],
    '2k': ['pie', 'bar', 'line', 'list', 'last-read'],
    large: ['pie', 'bar', 'line', 'list', 'last-read'],
    middle: ['pie', 'bar', 'line', 'list', 'last-read'],
    tablet: ['pie', 'bar', 'line', 'list', 'last-read'],
    small: ['bar', 'line', 'last-read'],
    mini: ['bar', 'line', 'last-read'],
}

const layoutLimit = computed(() => (key: string) => {
    const screen = config.screenType;
    let layoutArr = indexViewDic[screen];

    return layoutArr.includes(key);
});

onMounted(() => {
    
    if (!pieRef.value) return;
    window.addEventListener('resize', pieRef.value.resize());
})
</script>

<style scoped lang="less">
.charts {
    display: flex;
    justify-content: space-around;
    padding: 1rem 1rem;

    .chart {
        margin-bottom: 1rem;
        background-color: rgba(255, 255, 255, .6);
        border-radius: 1rem;
        box-shadow: .4rem .3rem .4rem rgb(139, 130, 130);
    }

    .chart-seat {
        height: 0;
    }
}


@media only screen and (min-width: 4096px) {
    .chart {
        width: 24%;
        max-width: 100%;
        height: 50rem;
    }
}

// 2k屏幕
@media only screen and (max-width: 4095px) and (min-width: 2560px) {
    .chart {
        width: 24%;
        max-width: 100%;
        height: 40rem;
    }
}

// 1080p屏幕
@media only screen and (max-width: 2559px) and (min-width: 1920px) {
    .chart {
        width: 24%;
        max-width: 100%;
        height: 30rem;
    }
}

// 平板
@media only screen and (max-width: 1919px) and (min-width: 1200px) {
    .charts {
        flex-wrap: wrap;
    }

    .chart {
        width: 49%;
        max-width: 100%;
        height: 24rem;
    }
}

// 平板竖屏
@media only screen and (max-width: 1199px) and (min-width: 769px) {
    .charts {
        flex-wrap: wrap;
    }

    .chart {
        width: 49%;
        height: 24rem;
    }
}

// 手机
@media only screen and (max-width: 768px) and (min-width: 390px) {
    .charts {
        padding: 1rem 1.4rem 0;
        flex-wrap: wrap;
    }

    .chart {
        width: 100%;
        height: 20rem;
    }
}

@media only screen and (max-width: 389px) {
    .charts {
        flex-wrap: wrap;
    }

    .chart {
        width: 100%;
    }
}
</style>