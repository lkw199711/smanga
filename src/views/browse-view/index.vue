<template>
    <div class="browse-view" @touchmove="reading_state_update(true)" @click="reading_state_update(false)">
        <!--目录列表-->
        <van-popup v-model:show="popup.menu" position="left">
            <van-sidebar v-model="index" :style="{width:'46vw'}" @change="change_chapter">
                <van-sidebar-item v-for="(k,i) in menu" :title="k" :key="i"/>
            </van-sidebar>
        </van-popup>
        <!--列表下拉刷新-->
        <van-pull-refresh
                v-model="refreshing"
                @refresh="refresh_page"
        >
            <!--列表-->
            <van-list
                    v-model="loading"
                    :finished="finished"
                    :immediate-check="true"
                    @load="load_img"
            >
                <img v-for="(k, i) in imgFileList" :src="k" :key="i" alt="接收图片"/>
            </van-list>
        </van-pull-refresh>
        <!--目录按钮-->
        <van-button class="nopost-show-menu" type="danger" @click.stop="open_popup('menu')">
            <i class="iconfont icon-mulu"/>
        </van-button>
        <!--翻页按钮-->
        <div class="btns">
            <van-button class="btn" type="warning" @click="before">上一章</van-button>
            <van-button class="btn" type="info" @click="next">下一章</van-button>
        </div>
    </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped type='text/less' lang='less'></style>