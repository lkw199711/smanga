<template>
    <div class="charts">
        <pie ref="pieRef" class="chart charts-pie" v-if="layoutLimit('pie')"></pie>
        <bar ref="barRef" class="chart charts-pie" v-if="layoutLimit('bar')"></bar>
        <line1 ref="lineRef" class="chart charts-pie" v-if="layoutLimit('line')"></line1>
        <list class="chart" v-if="layoutLimit('list')"></list>
    </div>
    <latest v-if="layoutLimit('latest')">
    </latest>
    <div class="bottom-btn-box">
        <el-button type="primary" @click="new_theme">前往新主题</el-button>
        <el-button class="logout-btn" type="primary" @click="user_logout">登出用户</el-button>
    </div>

</template>

<script setup lang="ts">
import pie from '@/components/charts/pie.vue';
import bar from '@/components/charts/bar.vue';
import line1 from '@/components/charts/line.vue';
import list from '@/components/charts/list.vue';
import latest from "@/views/latest/index.vue";
import { onMounted, ref, computed } from 'vue';
import { config, userConfig } from '@/store';
import { useRouter } from 'vue-router';
import { Cookies } from '@/utils';
import { themeState, setTheme } from '@/themes/store'
const router = useRouter();
const pieRef = ref();

const indexViewDic = {
    '4k': ['pie', 'bar', 'line', 'list', 'latest'],
    '2k': ['pie', 'bar', 'line', 'list', 'latest'],
    large: ['pie', 'bar', 'line', 'list', 'latest'],
    middle: ['pie', 'bar', 'line', 'list', 'latest'],
    tablet: ['pie', 'bar', 'line', 'list', 'latest'],
    small: ['bar', 'line', 'latest'],
    mini: ['bar', 'line', 'latest'],
}

const layoutLimit = computed(() => (key: string) => {
    const screen = config.screenType;
    let layoutArr = indexViewDic[screen];

    return layoutArr.includes(key);
});

onMounted(() => {
    const useNewTheme = Cookies.get('useNewTheme');
    if (useNewTheme) router.push('/t');
    if (!pieRef.value) return;
    window.addEventListener('resize', pieRef.value.resize());
})

function user_logout() {
    Cookies.remove('smanga-userName');
    Cookies.remove('smanga-userId');
    router.push('/login')
}

function new_theme() {
    Cookies.set('useNewTheme', '1')
    router.push('/t')
}
</script>

<style scoped lang="less">
.charts {
    display: flex;
    justify-content: space-around;
    padding: 1rem 1rem;

    .chart {
        margin-bottom: 1rem;
        background-color: rgba(255, 255, 255, .6);
        border-radius: .6rem;
        box-shadow: .4rem .3rem .4rem rgb(139, 130, 130);
        overflow: hidden;
        overflow-y: auto;
    }

    .chart-seat {
        height: 0;
    }
}

.bottom-btn-box {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1000;
    .logout-btn {
    
        width: 10rem;
        height: 3rem;
        border-radius: .6rem;
        box-shadow: .4rem .3rem .4rem rgb(139, 130, 130);
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