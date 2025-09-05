<template>
  <div class="serve-setting-container">
    <h1 class="page-title">服务器设置</h1>

    <!-- 扫描设置卡片 -->
    <el-card class="setting-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">扫描设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="160px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="扫描周期">
              <el-input v-model="form.scan.interval" placeholder="输入cron表达式" :style="{ width: '300px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">cron表达式</span>
              <el-button type="primary" @click="comfirm_interval" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="媒体库封面生成周期">
              <el-input v-model="form.scan.mediaPosterInterval" placeholder="输入cron表达式"
                :style="{ width: '300px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">cron表达式</span>
              <el-button type="primary" @click="comfirm_poster_interval" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="同步周期">
              <el-input v-model="form.sync.interval" placeholder="输入cron表达式" :style="{ width: '300px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">cron表达式</span>
              <el-button type="primary" @click="comfirm_sync_interval" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="更新漫画与章节封面">
              <el-switch v-model="form.scan.reloadCover" :active-value="1" :inactive-value="0" />
              <el-button type="primary" @click="comfirm_update_cover" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="忽略隐藏文件夹和文件">
              <el-switch v-model="form.scan.ignoreHiddenFiles" :active-value="1" :inactive-value="0" />
              <el-button type="primary" @click="comfirm_scan_ignore_hidden" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• 扫描周期为cron表达式,默认为一天两次</p>
        <p>• cron表达式格式:秒 分 时 日 月 周,为六位表达式,位数错误将不能启动定时任务.</p>
        <p>• 再次扫描媒体库时,是否对已有封面的漫画再次加载封面.开启会增加扫描时间.</p>
        <p>• 不建议纯压缩包库开启更新封面功能.</p>
        <p>• 忽略隐藏文件夹和文件,开启后扫描时会忽略以.开头的文件夹和文件.对于群辉,威联通成品nas机器有用,可规避其系统自动生成的隐藏目录.</p>
      </div>
    </el-card>

    <!-- SSL证书设置卡片 -->
    <el-card class="setting-card mt-6" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">SSL证书设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="160px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="PEM文件路径">
              <el-input v-model="form.ssl.pem" placeholder="输入PEM文件路径" :style="{ width: '500px' }"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="KEY文件路径">
              <el-input v-model="form.ssl.key" placeholder="输入KEY文件路径" :style="{ width: '500px' }"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24" class="flex justify-start mt-4">
            <el-button type="primary" @click="comfirm_ssl" class="mr-3">保存证书设置</el-button>
            <el-button type="danger" @click="reset_ssl">重置证书设置</el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• SSL证书在默认模式下,以HTTP的方式监听443端口,使用http://smanga_domain:443可以访问.</p>
        <p>• 你可以使用宿主机的nginx配置反向代理进行设置.</p>
        <p>• 如果你在宿主机没有nginx或者不希望通过反代的方式进行配置,可以在此处填写证书使用的文件,smanga会将这些文件写入到nginx配置之中.</p>
      </div>
    </el-card>

    <!-- 压缩设置卡片 -->
    <el-card class="setting-card mt-6" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">压缩与存储设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="160px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="封面压缩大小">
              <el-input v-model="form.compress.poster" placeholder="输入压缩大小" type="number"
                :style="{ width: '150px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">KB</span>
              <el-button type="primary" @click="confirm_poster_size" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="压缩文件保存时长">
              <el-input v-model="form.compress.saveDuration" placeholder="输入保存天数" type="number"
                :style="{ width: '150px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">天</span>
              <el-button type="primary" @click="confirm_compress_duration" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• 封面压缩大小单位为KB,设置过小将影响封面质量.</p>
        <p>• 文件保存周期单位为天,填写0不删除文件.</p>
      </div>
    </el-card>

    <!-- 登录封面设置卡片 -->
    <el-card class="setting-card mt-6" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">登录封面设置</span>
          <span class="text-sm text-gray-500 ml-2">(每个客户端单独设置)</span>
        </div>
      </template>

      <el-form :model="form" label-width="160px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="封面随机">
              <el-switch v-model="backRandom" @change="back_random" />
            </el-form-item>
          </el-col>

          <el-col :span="24" class="mt-4">
            <div class="cover-selection-title text-gray-600 mb-3">选择封面样式:</div>
            <div class="cover-grid">
              <div v-for="item in coverArr" :key="item"
                :class="['cover-item', 'back-item', 'bg' + item, { 'active': !backRandom && activeBack === item }]"
                @click="back_click(item)">
                <div v-if="!backRandom && activeBack === item" class="cover-select-indicator">
                  <el-icon size="20">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import serveSettingApi from '@/api/serve-setting';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/card/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/switch/style/css';
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/row/style/css';
import 'element-plus/es/components/col/style/css';
import 'element-plus/es/components/icon/style/css';

const coverArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
let activeBack = ref(0);
let backRandom = ref(true);

const form = reactive({
  scan: {
    autoCompress: 0,
    interval: 60,
    reloadCover: 0,
    ignoreHiddenFiles: 0,
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
});

// 计算封面图片URL
const getCoverUrl = (index: number) => {
  // 这里使用占位图URL，实际项目中应替换为真实图片路径
  return `https://picsum.photos/seed/cover${index}/300/200`;
};

function back_random(val: boolean) {
  activeBack.value = 0;
  localStorage.setItem('activeBack', String(0));
  ElMessage.success('已启用随机封面');
}

function back_click(item: number) {
  backRandom.value = false;
  activeBack.value = item;
  localStorage.setItem('activeBack', String(item));
  ElMessage.success(`已选择封面样式 ${item}`);
}

/**
 * @description: 设置扫描时间间隔
 * @return {*}
 */
async function comfirm_interval() {
  try {
    await serveSettingApi.set('scan', 'interval', form.scan.interval);
  } catch (error) {
    console.error('Failed to set scan interval:', error);
  }
}

async function comfirm_poster_interval() {
  try {
    await serveSettingApi.set('scan', 'mediaPosterInterval', form.scan.mediaPosterInterval);
  } catch (error) {
    console.error('Failed to set poster interval:', error);
  }
}

/**
 * @description: 设置更新封面开关
 * @return {*}
 */
async function comfirm_update_cover() {
  try {
    await serveSettingApi.set('scan', 'reloadCover', form.scan.reloadCover);
  } catch (error) {
    console.error('Failed to set reload cover:', error);
  }
}

async function comfirm_scan_ignore_hidden() {
  try {
    await serveSettingApi.set('scan', 'ignoreHiddenFiles', form.scan.ignoreHiddenFiles);
  } catch (error) {
    console.error('Failed to set ignore hidden files:', error);
  }
}

async function confirm_poster_size() {
  try {
    await serveSettingApi.set('compress', 'poster', form.compress.poster);
  } catch (error) {
    console.error('Failed to set poster size:', error);
  }
}

async function comfirm_sync_interval() {
  try {
    await serveSettingApi.set('sync', 'interval', form.sync.interval);
  } catch (error) {
    console.error('Failed to set sync interval:', error);
  }
}

async function confirm_compress_duration() {
  try {
    await serveSettingApi.set('compress', 'saveDuration', form.compress.saveDuration);
  } catch (error) {
    console.error('Failed to set compress duration:', error);
  }
}

/**
 * @description: 设置ssl证书
 * @return {*}
 */
async function comfirm_ssl() {
  try {
    await serveSettingApi.set_ssl(form.ssl.pem, form.ssl.key);
  } catch (error) {
    console.error('Failed to set SSL:', error);
  }
}

/**
 * @description: 重置证书设置
 * @return {*}
 */
async function reset_ssl() {
  try {
    await serveSettingApi.reset_ssl();
    form.ssl.pem = '';
    form.ssl.key = '';
  } catch (error) {
    console.error('Failed to reset SSL:', error);
  }
}

onMounted(async () => {
  try {
    const res = await serveSettingApi.get();
    Object.assign(form, res);

    const val = localStorage.getItem('activeBack');
    if (val && val !== '0') {
      activeBack.value = Number(val);
      backRandom.value = false;
    }
  } catch (error) {
    ElMessage.error('加载设置失败');
    console.error('Failed to load settings:', error);
  }
});
</script>

<style scoped lang="less" src="@/style/login-bg.less"></style>
<style lang="less" scoped>
.serve-setting-container {
  padding: 20px 30px;
  min-height: 100vh;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: @s-back-text;
  margin-bottom: 24px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.setting-card {
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.form-note {
  padding: 10px 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
  line-height: 1.6;
}

.suffix {
  font-size: 14px;
}

.cover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.cover-item {
  height: 100px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.cover-item:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover-item.active {
  border-color: #4096ff;
}

.cover-select-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background-color: rgba(64, 150, 255, 0.9);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.cover-selection-title {
  font-weight: 500;
}

.flex {
  display: flex;
}

.justify-start {
  justify-content: flex-start;
}

.mr-3 {
  margin-right: 12px;
}

.ml-2 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.mt-6 {
  margin-top: 24px;
}

.text-gray-500 {
  color: #909399;
}

.text-gray-600 {
  color: #606266;
}

.text-sm {
  font-size: 12px;
}
</style>