<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>服务器设置</h1>
      <button class="ta-btn-ghost" @click="loadSettings">🔄 刷新</button>
    </div>

    <!-- 扫描设置 -->
    <div class="ta-card ta-card-section">
      <h2 class="ta-section-title">扫描设置</h2>
      <div class="ta-form">
        <div class="ta-form-row">
          <span class="ta-form-label">扫描引擎</span>
          <select v-model="form.scan.engine" class="ta-select">
            <option value="template-v2">模板扫描 v2（混合目录）</option>
            <option value="template-v1">模板扫描 v1（单模板）</option>
            <option value="legacy">旧扫描器（紧急回退）</option>
          </select>
          <button class="ta-btn-sm" @click="saveSetting('scan', 'engine', form.scan.engine)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">扫描周期</span>
          <input v-model="form.scan.interval" class="ta-input" placeholder="cron表达式" style="width:24rem" />
          <span class="ta-form-hint">cron表达式</span>
          <button class="ta-btn-sm" @click="saveSetting('scan', 'interval', form.scan.interval)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">封面生成周期</span>
          <input v-model="form.scan.mediaPosterInterval" class="ta-input" placeholder="cron表达式" style="width:24rem" />
          <span class="ta-form-hint">cron表达式</span>
          <button class="ta-btn-sm" @click="saveSetting('scan', 'mediaPosterInterval', form.scan.mediaPosterInterval)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">同步周期</span>
          <input v-model="form.sync.interval" class="ta-input" placeholder="cron表达式" style="width:24rem" />
          <span class="ta-form-hint">cron表达式</span>
          <button class="ta-btn-sm" @click="saveSetting('sync', 'interval', form.sync.interval)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">更新漫画封面</span>
          <label class="ta-switch"><input type="checkbox" v-model="form.scan.reloadCover" :true-value="1" :false-value="0" @change="saveSetting('scan', 'reloadCover', form.scan.reloadCover)" /><span class="ta-switch-slider"></span></label>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">忽略隐藏文件</span>
          <label class="ta-switch"><input type="checkbox" v-model="form.scan.ignoreHiddenFiles" :true-value="1" :false-value="0" @change="saveSetting('scan', 'ignoreHiddenFiles', form.scan.ignoreHiddenFiles)" /><span class="ta-switch-slider"></span></label>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">生成媒体库封面</span>
          <label class="ta-switch"><input type="checkbox" v-model="form.scan.createMediaPoster" :true-value="1" :false-value="0" @change="saveSetting('scan', 'createMediaPoster', form.scan.createMediaPoster)" /><span class="ta-switch-slider"></span></label>
        </div>
      </div>
    </div>

    <!-- SSL证书设置 -->
    <div class="ta-card ta-card-section">
      <h2 class="ta-section-title">SSL 证书设置</h2>
      <div class="ta-form">
        <div class="ta-form-row">
          <span class="ta-form-label">PEM 文件路径</span>
          <input v-model="form.ssl.pem" class="ta-input" placeholder="PEM文件路径" style="width:40rem" />
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">KEY 文件路径</span>
          <input v-model="form.ssl.key" class="ta-input" placeholder="KEY文件路径" style="width:40rem" />
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label"></span>
          <button class="ta-btn-primary" @click="saveSSL">保存证书</button>
          <button class="ta-btn-ghost" @click="resetSSL">重置证书</button>
        </div>
      </div>
    </div>

    <!-- 压缩与存储设置 -->
    <div class="ta-card ta-card-section">
      <h2 class="ta-section-title">压缩与存储设置</h2>
      <div class="ta-form">
        <div class="ta-form-row">
          <span class="ta-form-label">封面压缩大小</span>
          <input v-model.number="form.compress.poster" class="ta-input" type="number" style="width:12rem" />
          <span class="ta-form-hint">KB</span>
          <button class="ta-btn-sm" @click="saveSetting('compress', 'poster', form.compress.poster)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">文件保存时长</span>
          <input v-model.number="form.compress.saveDuration" class="ta-input" type="number" style="width:12rem" />
          <span class="ta-form-hint">天 (0=不删除)</span>
          <button class="ta-btn-sm" @click="saveSetting('compress', 'saveDuration', form.compress.saveDuration)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">同步加载压缩包</span>
          <label class="ta-switch"><input type="checkbox" v-model="form.compress.sync" :true-value="1" :false-value="0" @change="saveSetting('compress', 'sync', form.compress.sync)" /><span class="ta-switch-slider"></span></label>
        </div>
      </div>
    </div>

    <!-- 队列设置 -->
    <div class="ta-card ta-card-section">
      <h2 class="ta-section-title">队列设置 <span class="ta-form-hint">(修改并发数需重启生效)</span></h2>
      <div class="ta-form">
        <div class="ta-form-row">
          <span class="ta-form-label">Worker 模式</span>
          <select v-model="form.queue.worker.mode" class="ta-select">
            <option value="embedded">Embedded (内嵌)</option>
            <option value="external">External (独立进程)</option>
            <option value="disabled">Disabled (禁用)</option>
          </select>
          <button class="ta-btn-sm" @click="saveSetting('queue', 'worker.mode', form.queue.worker.mode)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">Background 并发</span>
          <input v-model.number="form.queue.workers.background.concurrency" class="ta-input" type="number" min="1" max="10" style="width:8rem" />
          <span class="ta-form-hint">扫描/同步/P2P</span>
          <button class="ta-btn-sm" @click="saveSetting('queue', 'workers.background.concurrency', form.queue.workers.background.concurrency)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">Compress 并发</span>
          <input v-model.number="form.queue.workers.compress.concurrency" class="ta-input" type="number" min="1" max="10" style="width:8rem" />
          <span class="ta-form-hint">压缩与封面处理</span>
          <button class="ta-btn-sm" @click="saveSetting('queue', 'workers.compress.concurrency', form.queue.workers.compress.concurrency)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">重试次数</span>
          <input v-model.number="form.queue.attempts" class="ta-input" type="number" min="1" max="10" style="width:8rem" />
          <span class="ta-form-hint">次</span>
          <button class="ta-btn-sm" @click="saveSetting('queue', 'attempts', form.queue.attempts)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">任务超时</span>
          <input v-model.number="form.queue.timeout" class="ta-input" type="number" style="width:12rem" />
          <span class="ta-form-hint">毫秒</span>
          <button class="ta-btn-sm" @click="saveSetting('queue', 'timeout', form.queue.timeout)">确定</button>
        </div>
        <div class="ta-form-row">
          <span class="ta-form-label">轮询间隔</span>
          <input v-model.number="form.queue.pollIntervalMs" class="ta-input" type="number" style="width:12rem" />
          <span class="ta-form-hint">毫秒</span>
          <button class="ta-btn-sm" @click="saveSetting('queue', 'pollIntervalMs', form.queue.pollIntervalMs)">确定</button>
        </div>
      </div>
    </div>

    <!-- P2P 设置 -->
    <div class="ta-card ta-card-section">
      <h2 class="ta-section-title">P2P 设置</h2>
      <div class="ta-form">
        <div class="ta-form-row">
          <span class="ta-form-label">启用 P2P</span>
          <label class="ta-switch"><input type="checkbox" v-model="form.p2p.enable" @change="saveSetting('p2p', 'enable', form.p2p.enable)" /><span class="ta-switch-slider"></span></label>
        </div>
        <template v-if="form.p2p.enable">
          <div class="ta-form-row">
            <span class="ta-form-label">作为节点 (Node)</span>
            <label class="ta-switch"><input type="checkbox" v-model="form.p2p.role.node" @change="saveSetting('p2p', 'role.node', form.p2p.role.node)" /><span class="ta-switch-slider"></span></label>
          </div>
          <template v-if="form.p2p.role.node">
            <div class="ta-form-row">
              <span class="ta-form-label">节点名称</span>
              <input v-model="form.p2p.node.nodeName" class="ta-input" style="width:24rem" />
              <button class="ta-btn-sm" @click="saveSetting('p2p', 'node.nodeName', form.p2p.node.nodeName)">确定</button>
            </div>
            <div class="ta-form-row">
              <span class="ta-form-label">公网地址</span>
              <input v-model="form.p2p.node.publicUrl" class="ta-input" placeholder="smanga.com:9797/api" style="width:36rem" />
              <button class="ta-btn-sm" @click="saveSetting('p2p', 'node.publicUrl', form.p2p.node.publicUrl)">确定</button>
            </div>
            <div class="ta-form-row">
              <span class="ta-form-label">心跳间隔</span>
              <input v-model.number="form.p2p.node.heartbeatInterval" class="ta-input" type="number" style="width:10rem" />
              <span class="ta-form-hint">秒</span>
              <button class="ta-btn-sm" @click="saveSetting('p2p', 'node.heartbeatInterval', form.p2p.node.heartbeatInterval)">确定</button>
            </div>
            <div class="ta-form-row">
              <span class="ta-form-label">手动注册</span>
              <button class="ta-btn-primary" @click="registerNode">立即注册</button>
            </div>
          </template>
          <div class="ta-form-row">
            <span class="ta-form-label">作为 Tracker</span>
            <label class="ta-switch"><input type="checkbox" v-model="form.p2p.role.tracker" @change="saveSetting('p2p', 'role.tracker', form.p2p.role.tracker)" /><span class="ta-switch-slider"></span></label>
          </div>
          <template v-if="form.p2p.role.tracker">
            <div class="ta-form-row">
              <span class="ta-form-label">Tracker 地址</span>
              <input v-model="form.p2p.tracker.publicUrl" class="ta-input" placeholder="http://tracker.example.com:9797/api" style="width:40rem" />
              <button class="ta-btn-sm" @click="saveSetting('p2p', 'tracker.publicUrl', form.p2p.tracker.publicUrl)">确定</button>
            </div>
            <div class="ta-form-row">
              <span class="ta-form-label">允许公开注册</span>
              <label class="ta-switch"><input type="checkbox" v-model="form.p2p.tracker.allowPublicRegister" @change="saveSetting('p2p', 'tracker.allowPublicRegister', form.p2p.tracker.allowPublicRegister)" /><span class="ta-switch-slider"></span></label>
            </div>
            <div class="ta-form-row">
              <span class="ta-form-label">同步密钥</span>
              <input v-model="form.p2p.tracker.syncKey" class="ta-input" style="width:36rem" placeholder="留空不启用同步" />
              <button class="ta-btn-sm" @click="saveSetting('p2p', 'tracker.syncKey', form.p2p.tracker.syncKey)">确定</button>
            </div>
            <div class="ta-form-row" v-if="form.p2p.tracker.syncKey">
              <span class="ta-form-label">同步间隔</span>
              <input v-model.number="form.p2p.tracker.syncIntervalSec" class="ta-input" type="number" style="width:10rem" />
              <span class="ta-form-hint">秒</span>
              <button class="ta-btn-sm" @click="saveSetting('p2p', 'tracker.syncIntervalSec', form.p2p.tracker.syncIntervalSec)">确定</button>
            </div>
            <div class="ta-form-row">
              <span class="ta-form-label">手动同步</span>
              <button class="ta-btn-primary" @click="triggerSync">立即同步</button>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { showThemeAlert } from '@/themes/components/theme-alert'
import serveSettingApi from '@/api/serve-setting'

const form = reactive({
  scan: { engine: 'template-v2' as string, interval: '', mediaPosterInterval: '', reloadCover: 0, ignoreHiddenFiles: 0, createMediaPoster: 0 },
  sync: { interval: '' },
  ssl: { pem: '', key: '' },
  compress: { poster: 300, saveDuration: 30, sync: 1 },
  queue: {
    worker: { mode: 'embedded' },
    workers: { background: { concurrency: 1 }, compress: { concurrency: 1 } },
    attempts: 3, timeout: 120000, pollIntervalMs: 1000
  },
  p2p: {
    enable: false,
    role: { node: false, tracker: false },
    node: { nodeName: '', publicUrl: '', heartbeatInterval: 30 },
    tracker: { publicUrl: '', allowPublicRegister: true, syncKey: '', syncIntervalSec: 300 }
  }
})

async function loadSettings() {
  try {
    const res = await serveSettingApi.get()
    if (res) Object.assign(form, res)
  } catch { /* ignore */ }
}

async function saveSetting(title: string, key: string, value: any) {
  try { await serveSettingApi.set(title, key, value); showThemeAlert('保存成功') } catch (e: any) { showThemeAlert(e?.message || '保存失败') }
}
async function saveSSL() {
  try { await serveSettingApi.set_ssl(form.ssl.pem, form.ssl.key); showThemeAlert('SSL证书已保存') } catch (e: any) { showThemeAlert(e?.message || '保存失败') }
}
async function resetSSL() {
  try { await serveSettingApi.reset_ssl(); form.ssl.pem = ''; form.ssl.key = ''; showThemeAlert('SSL证书已重置') } catch (e: any) { showThemeAlert(e?.message || '重置失败') }
}
async function registerNode() {
  try {
    const res: any = await serveSettingApi.register_node_now()
    showThemeAlert(res?.code === 200 ? '节点注册成功' : (res?.message || '注册失败'))
  } catch (e: any) { showThemeAlert(e?.message || '注册失败') }
}
async function triggerSync() {
  try {
    const res: any = await serveSettingApi.trigger_tracker_sync()
    showThemeAlert(res?.code === 200 ? '同步完成' : (res?.message || '同步失败'))
  } catch (e: any) { showThemeAlert(e?.message || '同步失败') }
}

onMounted(() => loadSettings())
</script>

<style scoped>
.ta-manage-page { max-width: 90rem; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.4rem; }
.ta-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-card { background: #fff; border: 1px solid #eaeaea; border-radius: 1.2rem; padding: 2rem 2.4rem; }
.ta-card-section { margin-bottom: 2rem; }
.ta-section-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.6rem 0; color: #1f2937; }
.ta-form { display: flex; flex-direction: column; gap: 1.4rem; }
.ta-form-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.ta-form-label { width: 15rem; font-size: 1.3rem; font-weight: 500; color: #374151; flex-shrink: 0; }
.ta-form-hint { font-size: 1.2rem; color: #9ca3af; }
.ta-input { padding: 0.7rem 1.2rem; border: 1px solid #eaeaea; border-radius: 0.8rem; font-size: 1.3rem; outline: none; }
.ta-input:focus { border-color: #2563eb; }
.ta-select { padding: 0.7rem 1.2rem; border: 1px solid #eaeaea; border-radius: 0.8rem; font-size: 1.3rem; outline: none; background: #fff; }
.ta-select:focus { border-color: #2563eb; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-sm { cursor: pointer; font-size: 1.3rem; border-radius: 0.8rem; }
.ta-btn-primary { padding: 0.8rem 1.6rem; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-ghost { padding: 0.8rem 1.6rem; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-sm { padding: 0.5rem 1rem; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 1.2rem; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-switch { position: relative; display: inline-block; width: 4.4rem; height: 2.4rem; }
.ta-switch input { display: none; }
.ta-switch-slider { position: absolute; inset: 0; border-radius: 1.2rem; background: #d1d5db; cursor: pointer; transition: .2s; }
.ta-switch-slider::after { content: ''; position: absolute; top: 0.2rem; left: 0.2rem; width: 2rem; height: 2rem; border-radius: 50%; background: #fff; transition: .2s; }
.ta-switch input:checked + .ta-switch-slider { background: #2563eb; }
.ta-switch input:checked + .ta-switch-slider::after { transform: translateX(2rem); }
</style>
