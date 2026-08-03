<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>帮助文档</h1>
      <span class="ta-version">v{{ version }}</span>
    </div>

    <div class="ta-tabs">
      <button v-for="tab in tabs" :key="tab.key" :class="['ta-tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
    </div>

    <div class="ta-content">
      <!-- 项目简介 -->
      <div v-if="activeTab === 'intro'" class="ta-section">
        <h2>项目简介</h2>
        <p>Smanga 是一个简单易用、Docker直装的漫画流媒体阅读工具。以Emby、Plex为灵感，专为解决漫画阅读需求而开发。帮助您管理海量漫画资源，支持多种格式，并提供舒适的阅读体验。</p>
      </div>

      <!-- 功能特点 -->
      <div v-if="activeTab === 'features'" class="ta-section">
        <h2>功能特点</h2>
        <div class="ta-grid">
          <div v-for="f in features" :key="f.title" class="ta-feature-item">
            <h3>{{ f.icon }} {{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 安装指南 -->
      <div v-if="activeTab === 'install'" class="ta-section">
        <h2>安装指南</h2>
        <h3>Docker 安装 (推荐)</h3>
        <pre class="ta-code"><code>docker run -itd --name smanga \
  -p 3333:3306 \
  -p 9797:9797 \
  -v /mnt:/mnt \
  -v /route/smanga:/data \
  lkw199711/smanga-nodejs</code></pre>

        <h3>Docker Compose 部署</h3>
        <pre class="ta-code"><code>version: "3"
services:
  smanga:
    image: lkw199711/smanga:alpha
    ports:
      - 9797:80
    volumes:
      - /route/smanga:/data
      - /mnt:/mnt
    environment:
      PUID: 1000
      PGID: 1000
      TZ: Asia/Shanghai
    restart: unless-stopped
    container_name: smanga-alpha</code></pre>

        <h3>Windows 版本</h3>
        <p>下载解压即可使用，更新时将原 data 目录复制到新版本目录。</p>
      </div>

      <!-- 使用说明 -->
      <div v-if="activeTab === 'usage'" class="ta-section">
        <h2>使用说明</h2>
        <h3>默认账号</h3>
        <p>用户名: <code>smanga</code> | 密码: <code>smanga</code></p>

        <h3>新增媒体库</h3>
        <ol>
          <li>进入媒体库管理页面，点击"新增媒体库"</li>
          <li>选择媒体类型（普通或单本）</li>
          <li>添加媒体路径，单个媒体库可以添加多条路径</li>
          <li>等待扫描完成，点击logo即可前往媒体库列表</li>
        </ol>

        <h3>添加书签</h3>
        <p>阅读时，点击屏幕靠上30%的区域呼出顶栏，最右侧为添加书签按钮。</p>

        <h3>切换浏览模式</h3>
        <p>顶栏有切换模式的选择框，可切换单页、双页与条漫模式。</p>
      </div>

      <!-- 自定义扫描模板 -->
      <div v-if="activeTab === 'scan-template'" class="ta-section">
        <h2>自定义扫描模板</h2>
        <p>自定义模板用于处理内置模板无法覆盖的目录，特别适合同一路径中同时包含连载、单行本或多种分类层级的情况。配置按媒体路径保存，不会影响其他路径。</p>

        <h3>使用流程</h3>
        <ol>
          <li>进入“媒体库管理”，打开目标媒体库的“路径”设置。</li>
          <li>将“扫描模板”选择为“自定义模板规则”。</li>
          <li>填写下面介绍的 <code>version=1</code> JSON。</li>
          <li>点击“试扫描”，核对漫画、章节、跳过项和警告。</li>
          <li>确认结果后保存配置，再执行扫描更新。已有路径必须先保存配置。</li>
        </ol>
        <p class="ta-tip">扫描更新是增量同步；重新扫描会先删除此路径下已入库的漫画。请先试扫描，再决定是否重新扫描。</p>

        <h3>如何计算目录层级</h3>
        <p><code>mangaIndex</code> 和 <code>chapterIndex</code> 从扫描路径的下一层开始按 <code>0</code> 计数：</p>
        <pre class="ta-code"><code>扫描路径/漫画/章节/图片       mangaIndex=0, chapterIndex=1
扫描路径/分类/漫画/章节/图片  mangaIndex=1, chapterIndex=2
扫描路径/漫画/图片            mangaIndex=0, singleChapter=true</code></pre>
        <p><code>singleChapter=true</code> 表示漫画目录本身作为唯一章节，此时不需要填写 <code>chapterIndex</code>。</p>

        <h3>单一结构示例</h3>
        <p>适用于 <code>扫描路径/分类/漫画/章节/图片</code>：</p>
        <pre class="ta-code"><code>{
  "version": 1,
  "strategy": "single",
  "rules": [
    {
      "id": "category-manga-chapter",
      "label": "分类/漫画/章节",
      "priority": 100,
      "mangaIndex": 1,
      "chapterIndex": 2,
      "singleChapter": false
    }
  ]
}</code></pre>
        <p><code>strategy=single</code> 只使用规则数组中的第一条规则。</p>

        <h3>混合目录示例</h3>
        <pre class="ta-code"><code>扫描路径/连载/漫画名/章节名/图片
扫描路径/单行本/漫画名/图片</code></pre>
        <pre class="ta-code"><code>{
  "version": 1,
  "strategy": "mixed",
  "rules": [
    {
      "id": "serial",
      "label": "连载漫画",
      "priority": 200,
      "mangaIndex": 1,
      "chapterIndex": 2,
      "singleChapter": false,
      "directoryInclude": "连载"
    },
    {
      "id": "one-shot",
      "label": "单行本",
      "priority": 100,
      "mangaIndex": 1,
      "singleChapter": true,
      "directoryInclude": "单行本"
    }
  ]
}</code></pre>
        <p><code>mixed</code> 会同时执行所有规则。识别结果发生重叠时，优先采用匹配度较高的规则；匹配度相同时采用 <code>priority</code> 较高的规则。</p>

        <h3>模板字段说明</h3>
        <div class="ta-table-wrap">
          <table class="ta-doc-table">
            <thead>
              <tr><th>字段</th><th>必填</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr v-for="field in scanTemplateFields" :key="field.field">
                <td><code>{{ field.field }}</code></td><td>{{ field.required }}</td><td>{{ field.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>元数据高级配置</h3>
        <p>元数据配置同样按路径保存。高级配置留空时，系统会根据所选的元数据识别方式生成默认值。</p>
        <pre class="ta-code"><code>{
  "version": 1,
  "sources": ["smanga", "series-json", "comicinfo"],
  "precedence": ["smanga", "series-json", "comicinfo"],
  "overwriteExisting": false,
  "maxFileBytes": 1048576
}</code></pre>
        <div class="ta-table-wrap">
          <table class="ta-doc-table">
            <thead>
              <tr><th>字段</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr v-for="field in metadataConfigFields" :key="field.field">
                <td><code>{{ field.field }}</code></td><td>{{ field.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="ta-tip"><code>.smanga</code> 和 <code>series.json</code> 是漫画级元数据，冲突时按 <code>precedence</code> 选择；压缩章节中的 <code>ComicInfo.xml</code> 是章节级元数据。</p>

        <h3>管理、限制与回退</h3>
        <ul>
          <li>模板 JSON 最大 64 KB，每份模板允许 1～20 条规则。</li>
          <li>非法 JSON、重复 ID、无效正则和越界层级会在保存或试扫描时直接提示。</li>
          <li>当前没有全局模板库；需要复用时，可复制 JSON 到其他媒体路径。</li>
          <li>服务器设置中的 <code>template-v2</code> 支持自动混合目录识别，推荐使用。</li>
          <li><code>template-v1</code> 的自动模式只为整条路径选择一个内置模板；<code>legacy</code> 不应用自定义模板，可用于紧急回退。</li>
        </ul>
      </div>

      <!-- OPDS 外部支持 -->
      <div v-if="activeTab === 'external'" class="ta-section">
        <h2>外部支持 (OPDS)</h2>
        <p>Smanga 内置了 OPDS 1.2 协议支持，可使用任意兼容 OPDS 的第三方阅读器（如可达漫画、Chunky Comic Reader、Panels等）直接订阅漫画库并在线阅读。</p>

        <h3>功能概览</h3>
        <ul>
          <li>完整目录浏览: 媒体库 → 漫画 → 章节</li>
          <li>搜索 (OpenSearch) / 最新更新 / 我的收藏 三个专用入口</li>
          <li>章节下载: 压缩包直接下载, 图片目录型章节自动打包为 CBZ</li>
          <li>OPDS-PSE 流式翻页: 支持按页请求, 边下边看</li>
          <li>HTTP Basic Auth 鉴权, 沿用现有 smanga 账号</li>
        </ul>

        <h3>订阅地址</h3>
        <p>在第三方阅读器中添加 OPDS 目录时填写:</p>
        <p><strong>URL</strong>: <code>http(s)://&lt;你的smanga地址&gt;/opds</code></p>
        <p><strong>用户名 / 密码</strong>: 您的 smanga 登录账号</p>

        <h3>Homepage 仪表盘集成</h3>
        <p>Smanga 提供了对 Homepage 的原生适配，通过 customapi 组件即可把漫画库统计数据展示到 Homepage 首页。接口地址: <code>GET /homepage/statistic</code></p>
      </div>

      <!-- 注意事项 -->
      <div v-if="activeTab === 'notes'" class="ta-section">
        <h2>注意事项</h2>
        <div class="ta-note ta-note-warning">
          <strong>⚠ 不支持长图条漫</strong>
          <p>由于网络请求限制，不支持长图条漫（需裁切）。</p>
        </div>
        <div class="ta-note ta-note-info">
          <strong>ℹ 版本兼容性</strong>
          <p>新版本与旧版本不兼容，请分开部署。新版本网页端口为9797。</p>
        </div>
        <div class="ta-note ta-note-info">
          <strong>ℹ 初始化流程</strong>
          <p>初次部署需要走完初始化流程才能访问页面。当看到日志中出现"Server is running on port 9797"时，表示服务启动成功。</p>
        </div>
        <div class="ta-note ta-note-info">
          <strong>ℹ 开发注意事项</strong>
          <p>此项目使用 Node.js 16 运行。</p>
        </div>
      </div>

      <!-- 发布信息 -->
      <div v-if="activeTab === 'links'" class="ta-section">
        <h2>发布信息</h2>
        <div class="ta-links">
          <a href="https://github.com/lkw199711/smanga" target="_blank" class="ta-link-item">🔗 GitHub 仓库</a>
          <a href="https://hub.docker.com/r/lkw199711/smanga" target="_blank" class="ta-link-item">🐳 Docker 镜像</a>
          <a href="https://jq.qq.com/?_wv=1027&k=CaeWd6im" target="_blank" class="ta-link-item">💬 QQ 交流群: 534086782</a>
          <a href="https://t.me/+FFgQ7AMIdrg2M2Y1" target="_blank" class="ta-link-item">📨 Telegram 交流群</a>
        </div>

        <h3 style="margin-top:2.4rem">版本更新记录</h3>
        <div class="ta-version-list">
          <div v-for="v in versionHistory" :key="v.ver" class="ta-version-item">
            <span class="ta-version-num">{{ v.ver }}</span>
            <span class="ta-version-desc">{{ v.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <footer class="ta-footer">
      <p>© {{ new Date().getFullYear() }} Smanga. 励志做最好的流媒体漫画阅读平台!</p>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import packageJson from '../../../../../package.json'

const version = packageJson.version || '0.0.0'
const activeTab = ref('intro')

const tabs = [
  { key: 'intro', label: '项目简介' },
  { key: 'features', label: '功能特点' },
  { key: 'install', label: '安装指南' },
  { key: 'usage', label: '使用说明' },
  { key: 'scan-template', label: '自定义模板' },
  { key: 'external', label: '外部支持' },
  { key: 'notes', label: '注意事项' },
  { key: 'links', label: '发布信息' },
]

const features = [
  { icon: '📁', title: '媒体库管理', desc: '创建和管理多个媒体库，支持不同的文件夹结构。' },
  { icon: '🖼', title: '多格式支持', desc: '支持 ZIP、CBZ、CBR、7Z、RAR 和 PDF 等多种漫画格式。' },
  { icon: '🔖', title: '书签功能', desc: '添加书签记录阅读进度，随时返回上次阅读的位置。' },
  { icon: '📜', title: '阅读历史', desc: '记录您的阅读历史，方便追踪和回顾已阅读的内容。' },
  { icon: '📱', title: '多设备兼容', desc: '适配手机、平板和桌面设备，在各种屏幕尺寸上提供良好体验。' },
  { icon: '🔄', title: '多种阅读模式', desc: '支持条漫(瀑布流)、单页和双页阅读模式。' },
]

const scanTemplateFields = [
  { field: 'version', required: '是', desc: '当前只支持 1' },
  { field: 'strategy', required: '是', desc: 'single 或 mixed' },
  { field: 'rules', required: '是', desc: '规则数组，允许 1～20 条' },
  { field: 'rules[].id', required: '是', desc: '唯一标识；只能使用字母、数字、下划线和短横线，最多 64 字符' },
  { field: 'rules[].label', required: '否', desc: '显示名称，默认使用 id' },
  { field: 'rules[].priority', required: '否', desc: '冲突优先级，范围 0～10000' },
  { field: 'rules[].mangaIndex', required: '是', desc: '漫画层级，范围 0～8' },
  { field: 'rules[].chapterIndex', required: '连载结构', desc: '章节层级，必须大于 mangaIndex，最大为 9' },
  { field: 'rules[].singleChapter', required: '否', desc: 'true 表示漫画目录本身作为唯一章节；省略或 false 时使用独立章节层级' },
  { field: 'rules[].directoryInclude', required: '否', desc: '漫画完整路径必须匹配的 JavaScript 正则表达式' },
  { field: 'rules[].directoryExclude', required: '否', desc: '漫画完整路径匹配时排除的 JavaScript 正则表达式' },
]

const metadataConfigFields = [
  { field: 'version', desc: '当前只支持 1' },
  { field: 'sources', desc: '启用 smanga、series-json、comicinfo；空数组表示不读取元数据' },
  { field: 'precedence', desc: '来源优先顺序，只能包含 sources 中已经启用的来源' },
  { field: 'overwriteExisting', desc: 'true 允许覆盖已有元数据，false 保留已入库数据' },
  { field: 'maxFileBytes', desc: '单文件读取上限：1024～10485760 字节，默认 1048576（1 MB）' },
]

const versionHistory = [
  { ver: '3.7.0', desc: '产出exe文件，后端改用nodejs' },
  { ver: '3.6.0', desc: '封面图片缓存，添加骨架屏动画' },
  { ver: '3.5.0', desc: '菜单分类并修改图表' },
  { ver: '3.4.0', desc: '扫描时自动解压章节' },
  { ver: '3.3.0', desc: '使用laravel重构项目，并优化排序功能' },
  { ver: '3.0.0', desc: '新增数据库、多格式支持以及多项新功能' },
]
</script>

<style scoped>
.ta-manage-page { max-width: 90rem; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
.ta-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-version { font-size: 1.3rem; color: #2563eb; background: #eff6ff; padding: 0.4rem 1.2rem; border-radius: 1.2rem; font-weight: 500; }
.ta-tabs { display: flex; gap: 0.4rem; margin-bottom: 2.4rem; border-bottom: 0.2rem solid #eaeaea; overflow-x: auto; }
.ta-tab { padding: 0.8rem 1.4rem; border: none; background: none; cursor: pointer; font-size: 1.3rem; color: #6b7280; border-bottom: 0.2rem solid transparent; margin-bottom: -0.2rem; transition: .2s; white-space: nowrap; }
.ta-tab:hover { color: #2563eb; }
.ta-tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
.ta-content { background: #fff; border: 1px solid #eaeaea; border-radius: 1.2rem; padding: 2.4rem; }
.ta-section h2 { font-size: 1.8rem; font-weight: 700; margin: 0 0 1.6rem 0; color: #1f2937; }
.ta-section h3 { font-size: 1.4rem; font-weight: 600; margin: 2rem 0 1rem 0; color: #374151; }
.ta-section p { font-size: 1.3rem; line-height: 1.7; color: #4b5563; margin: 0.8rem 0; }
.ta-section ol, .ta-section ul { padding-left: 2rem; font-size: 1.3rem; color: #4b5563; line-height: 1.8; }
.ta-section li { margin-bottom: 0.4rem; }
.ta-section code { background: #f3f4f6; padding: 0.2rem 0.6rem; border-radius: 0.4rem; font-size: 1.2rem; }
.ta-code { background: #374151; color: #fff; padding: 1.6rem; border-radius: 0.8rem; overflow-x: auto; font-size: 1.2rem; line-height: 1.6; margin: 1.2rem 0; white-space: pre; }
.ta-code code { display: block; padding: 0; border-radius: 0; background: transparent; color: inherit; font: inherit; }
.ta-tip { padding: 1rem 1.2rem; background: #f0f9ff; border-left: 0.3rem solid #0ea5e9; border-radius: 0.4rem; }
.ta-table-wrap { width: 100%; overflow-x: auto; margin: 1.2rem 0; }
.ta-doc-table { width: 100%; min-width: 58rem; border-collapse: collapse; color: #4b5563; font-size: 1.2rem; line-height: 1.6; }
.ta-doc-table th, .ta-doc-table td { padding: 0.8rem 1rem; border: 1px solid #e5e7eb; text-align: left; vertical-align: top; }
.ta-doc-table th { background: #f9fafb; color: #374151; font-weight: 600; white-space: nowrap; }
.ta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.ta-feature-item { padding: 1.6rem; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 1rem; }
.ta-feature-item h3 { margin: 0 0 0.8rem 0; font-size: 1.4rem; }
.ta-feature-item p { margin: 0; font-size: 1.2rem; color: #6b7280; }
.ta-note { padding: 1.4rem 1.6rem; border-radius: 0.8rem; margin-bottom: 1.2rem; font-size: 1.3rem; }
.ta-note p { margin: 0.4rem 0 0 0; }
.ta-note-warning { background: #fffbeb; border-left: 0.3rem solid #f59e0b; }
.ta-note-info { background: #f0f9ff; border-left: 0.3rem solid #0ea5e9; }
.ta-links { display: flex; flex-wrap: wrap; gap: 1rem; }
.ta-link-item { display: inline-flex; align-items: center; padding: 0.8rem 1.4rem; background: #f3f4f6; color: #374151; border-radius: 0.8rem; text-decoration: none; font-size: 1.3rem; transition: .2s; }
.ta-link-item:hover { background: #e5e7eb; }
.ta-version-list { display: flex; flex-direction: column; gap: 0.8rem; }
.ta-version-item { display: flex; gap: 1.2rem; padding: 0.8rem 0; border-bottom: 1px solid #f3f4f6; font-size: 1.3rem; }
.ta-version-num { font-weight: 600; color: #2563eb; min-width: 5rem; }
.ta-version-desc { color: #6b7280; }
.ta-footer { text-align: center; padding: 2.4rem; color: #9ca3af; font-size: 1.3rem; margin-top: 2.4rem; }
@media (max-width: 64rem) { .ta-grid { grid-template-columns: 1fr; } }
</style>
