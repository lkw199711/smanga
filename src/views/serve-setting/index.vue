<template>
    <div class="serve-setting">
        <el-form :model="form">
            <p class="s-form-title">扫描设置</p>
            <!-- 语言设置 -->
            <div class="scan">
                <el-form-item label="扫描周期">
                    <el-input v-model="form.scan.interval" class="interval" :style="{ width: '15rem' }"></el-input>
                    <span class="suffix">cron表达式</span>
                    <el-button type="primary" @click="comfirm_interval">确定</el-button>
                </el-form-item>

                <el-form-item label="媒体库封面生成周期">
                    <el-input v-model="form.scan.mediaPosterInterval" class="interval" :style="{ width: '15rem' }"></el-input>
                    <span class="suffix">cron表达式</span>
                    <el-button type="primary" @click="comfirm_poster_interval">确定</el-button>
                </el-form-item>
            </div>
            <p class="note form-note">
                扫描周期为cron表达式,默认为一天两次
            </p>

            <div class="scan">
                <el-form-item label="同步周期">
                    <el-input v-model="form.sync.interval" class="interval" :style="{ width: '15rem' }"></el-input>
                    <span class="suffix">cron表达式</span>
                    <el-button type="primary" @click="comfirm_sync_interval">确定</el-button>
                </el-form-item>
            </div>
            <p class="note form-note">
                扫描周期为cron表达式,默认为一天两次
            </p>

            <!--自动解压-->
            <el-form-item label="更新漫画与章节封面">
                <el-switch class="auto-compress" v-model="form.scan.reloadCover" :active-value="1"
                    :inactive-value="0" />
                <el-button type="primary" @click="comfirm_update_cover">确定</el-button>
            </el-form-item>

            <p class="note form-note">
                再次扫描媒体库时,是否对已有封面的漫画再次加载封面.开启会增加扫描时间.<br />
                不建议纯压缩包库开启.
            </p>

            <p class="s-form-title">ssl证书设置 </p>
            <div class="ssl">
                <el-form-item label="pem文件">
                    <el-input v-model="form.ssl.pem" class="pem" />
                </el-form-item>

                <el-form-item label="key文件">
                    <el-input v-model="form.ssl.key" class="key" />
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
                    <el-input v-model="form.compress.poster" class="poster-size"></el-input>
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
                    <el-input v-model="form.compress.saveDuration" class="compress-time"></el-input>
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
import { ref, onMounted, reactive } from 'vue';
import serveSettingApi from '@/api/serve-setting'

const coverArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
let activeBack = ref(0);
let backRandom = ref(true);

const form = reactive({
    scan: {
        autoCompress: 0,
        interval: 60,
        reloadCover: 0,
        mediaPosterInterval: 0
    },
    sync: {
        interval: 60
    },
    ssl: {
        pem: '',
        key: ''
    },
    compress: {
        auto: 0,
        saveDuration: 30,
        poster: 300,
        bookmark: 300
    },
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
    serveSettingApi.set('scan', 'interval', form.scan.interval)
}

async function comfirm_poster_interval() {
    serveSettingApi.set('scan', 'mediaPosterInterval', form.scan.mediaPosterInterval)
}

/**
 * @description: 设置自动解压开关
 * @return {*}
 */
async function comfirm_update_cover() {
    serveSettingApi.set('scan', 'reloadCover', form.scan.reloadCover)
}

async function confirm_poster_size() {
    serveSettingApi.set('compress', 'poster', form.compress.poster)
}

async function comfirm_sync_interval() {
    serveSettingApi.set('sync', 'interval', form.sync.interval)
}

async function confirm_compress_duration() {
    serveSettingApi.set('compress', 'saveDuration', form.compress.saveDuration)
}

/**
 * @description: 设置ssl证书
 * @return {*}
 */
async function comfirm_ssl() {
    serveSettingApi.set_ssl(form.ssl.pem, form.ssl.key);
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
    if (val && val !== '0') {
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