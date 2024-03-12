<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-07-16 12:02:34
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-03-12 19:34:35
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
                    <span class="suffix">ms</span>
                    <el-button type="primary" @click="comfirm_interval">确定</el-button>
                </el-form-item>
            </div>
            <p class="note form-note">
                扫描周期单位为秒,可使用*表达式.设置周期最短为10
            </p>

            <!--自动解压-->
            <el-form-item label="自动解压">
                <el-switch class="auto-compress" v-model="form.autoCompress" :active-value="'1'" :inactive-value="'0'" />
                <el-button type="primary" @click="comfirm_auto_compressl">确定</el-button>
            </el-form-item>

            <p class="note form-note">
                在扫描漫画的时候,自动解压缩zip,cbz,rar,pdf等压缩文件,当您需要获取封面的时候可考虑开启此选项.
                无论何时请谨慎开启此项,他会大量占用cpu与内存资源,甚至会使任务队列卡死,尤其是您拥有大量pdf文件的时候.
            </p>

            <p class="s-form-title">ssl证书设置 </p>
            <div class="ssl">
                <el-form-item label="pem文件">
                    <el-input v-model="form.pem" class="pem" />
                </el-form-item>

                <el-form-item label="key文件">
                    <el-input v-model="form.key" class="key" />
                </el-form-item>

                <el-button type="primary" @click="comfirm_ssl">确定</el-button>
                <el-button type="success" @click="reset_ssl">重置ssl证书设置</el-button>

                <p class="note form-note">
                    ssl证书在默认模式下,以http的方式监听443端口,使用http://smanga_domain:443可以访问.
                    你可以使用宿主机的nginx配置反向代理进行设置.
                    如果你在宿主机没有nginx或者不希望通过反代的方式进行配置,可以在此处填写证书使用的文件,smanga会将这些文件写入到nginx配置之中.
                </p>
            </div>


            <p class="s-form-title">封面设置</p>
            <!-- 语言设置 -->
            <div class="scan">
                <el-form-item label="压缩大小">
                    <el-input v-model="form.posterSize" class="poster-size"></el-input>
                    <span class="suffix poster-suffix">KB</span>
                    <el-button type="primary" @click="confirm_poster_size">确定</el-button>
                </el-form-item>
            </div>
            <p class="note form-note">
                扫描周期单位为秒,可使用*表达式.设置周期最短为10
            </p>

            <p class="s-form-title">压缩文件设置</p>
            <!-- 语言设置 -->
            <div class="scan">
                <el-form-item label="文件保存时长">
                    <el-input v-model="form.saveDuration" class="compress-time"></el-input>
                    <span class="suffix compress-suffix">天</span>
                    <el-button type="primary" @click="confirm_compress_duration">确定</el-button>
                </el-form-item>
            </div>
            <p class="note form-note">
                文件保存周期单位为天,填写0不删除文件.
            </p>

            <p class="s-form-title">登录封面设置(每个客户端单独设置)</p>
            <!--自动解压-->
            <el-form-item label="封面随机">
                <el-switch class="auto-compress" v-model="backRandom" @change="back_random" />
                <!-- <el-button type="primary" @click="comfirm_auto_compressl">确定</el-button> -->
            </el-form-item>

            <div class="back">
                <div v-for="item in coverArr" :key="item"
                    :class="['back-item', 'bg' + item, { 'active': activeBack === item }]" @click="back_click(item)" />
            </div>

        </el-form>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, onMounted, reactive } from 'vue';
import serveSettingApi from '@/api/serve-setting'
import { random } from 'lodash';

const coverArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
let activeBack = ref(0);
let backRandom = ref(true);

const form = reactive({
    interval: '',
    autoCompress: 0,
    // 证书pem文件
    pem: '',
    // 证书key文件
    key: '',
    posterSize: 100,
    saveDuration: 30,
})

function back_random(val: boolean) {
    activeBack.value = 0;
    localStorage.setItem('activeBack', String(0));
}

function back_click(item: number) {
    backRandom.value = false;
    activeBack.value = item;
    localStorage.setItem('activeBack', String(item));
}

/**
 * @description: 设置扫描时间间隔
 * @return {*}
 */
async function comfirm_interval() {
    serveSettingApi.set('scan', 'interval', form.interval)
}

/**
 * @description: 设置自动解压开关
 * @return {*}
 */
async function comfirm_auto_compressl() {
    serveSettingApi.set('scan', 'autoCompress', form.autoCompress)
}

async function confirm_poster_size() {
    serveSettingApi.set('poster', 'size', form.posterSize)
}

async function confirm_compress_duration() {
    serveSettingApi.set('compress', 'saveDuration', form.saveDuration)
}

/**
 * @description: 设置ssl证书
 * @return {*}
 */
async function comfirm_ssl() {
    serveSettingApi.set_ssl(form.pem, form.key);
}

/**
 * @description: 重置证书设置
 * @return {*}
 */
async function reset_ssl() {
    serveSettingApi.reset_ssl();
}

onMounted(async () => {
    const res = await serveSettingApi.get();
    Object.assign(form, res);

    const val = localStorage.getItem('activeBack');
    if (val && val!=='0') {
        activeBack.value = Number(val);
        backRandom.value = false;
    }
})

</script>

<style scoped lang="less">
.interval,
.poster-size {
    width: 8rem;

    :deep(input) {
        text-align: right;
    }
}

.ssl {
    .el-input {
        width: 32rem;
    }
}

.auto-compress {
    margin-right: 2rem;
}

.suffix {
    margin: 0 1.2rem;
}

.compress-time {
    width: 8rem;

    :deep(input) {
        text-align: right;
    }
}

.back {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;

    &-item {
        height: 16rem;
        width: 30rem;
        margin-bottom: 2rem;
        border: 1rem solid transparent;
    }

    .active {
        border: 1rem solid @s-background;
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

    .interval,
    .poster-size {
        width: 14rem;
    }
}
</style>

<style scoped lang="less" src="@/style/login-bg.less"></style>