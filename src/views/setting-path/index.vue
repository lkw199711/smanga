<template>
    <div class="setting-path">

        <p class="manga-route" v-for="(i,k) in routeList" :key="k">
            <span>{{i}}</span>
            <el-button class="btn-red remove" @click="remove(i)">移除</el-button>
        </p>

        <el-input v-model="input" class="input" @change="preview" placeholder="请输入路径......">
            <template #append>
                    <el-button class="btn-green" @click="preview">预览</el-button>
            </template>
        </el-input>

        <el-button class="btn-blue add" @click="add">添加</el-button>

        <div class="preview">
            <preview-list-item class="item" v-for="(i,k) in this.previewList.slice(0,10)" :key="k" :chapterInfo="i" />

            <!--填补最后一行的占位元素-->
            <div class="preview-list-item preview-seat-posted" v-for="(i) in Array(8)" :key="i"/>
        </div>
    </div>
</template>

<script src='./script/setting-path.ts' lang='ts'></script>

<style src='./style/setting-path.less' scoped type='text/less' lang='less'></style>