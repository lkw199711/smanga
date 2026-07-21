<template>
  <div class="wiki-container">
    <!-- 顶部导航 -->
    <header class="wiki-header">
      <div class="logo-container">
        <img :src="logoUrl" alt="Smanga Logo" class="logo">
        <h1 class="title">Smanga 漫画流媒体阅读工具</h1>
      </div>
      <div class="version-badge" :class="{ 'has-update': hasUpdate, 'update-error': errorCheckingUpdate }"
        @click="openVersionDialog">
        <span v-if="isCheckingUpdate" class="update-status"><i class="el-icon-loading"></i> 检查更新中...</span>
        <span v-else-if="hasUpdate" class="update-status"><i class="el-icon-warning-outline"></i> 有新版本: {{ latestVersion
        }}</span>
        <span v-else-if="errorCheckingUpdate" class="update-status"><i class="el-icon-error"></i> 检查失败</span>
        <span v-else class="update-status"><i class="el-icon-check"></i> 当前已是最新版本</span>
        <span class="version-text">{{ version }}</span>
      </div>
    </header>

    <!-- 版本信息弹窗 -->
    <el-dialog v-model="isVersionDialogOpen" title="版本信息" width="500px" :before-close="handleClose">
      <div class="version-dialog-content">
        <div class="current-version">
          <p>当前版本: <span class="version-number">{{ version }}</span></p>
        </div>

        <div v-if="isCheckingUpdate" class="update-checking">
          <span>正在检查更新...</span>
        </div>

        <div v-else-if="hasUpdate" class="update-available">
          <div class="update-icon"><i class="el-icon-success"></i></div>
          <div class="update-info">
            <p>发现新版本: <span class="version-number">{{ latestVersion }}</span></p>
            <p class="update-desc">建议立即更新到最新版本以获得更好的体验。</p>
          </div>
        </div>

        <div v-else-if="errorCheckingUpdate" class="update-error">
          <div class="error-icon"><i class="el-icon-error"></i></div>
          <p>检查更新失败，请稍后重试。</p>
        </div>

        <div v-else class="up-to-date">
          <div class="up-to-date-icon"><i class="el-icon-info"></i></div>
          <p>当前已是最新版本。</p>
        </div>

        <div class="version-history-section">
          <h3>最近更新</h3>
          <div v-if="isLoadingVersionData" class="loading-container">
            <span>加载版本数据中...</span>
          </div>
          <div v-else-if="versionDataError" class="error-container">
            <i class="el-icon-error"></i>
            <span>加载版本数据失败</span>
          </div>
          <div v-else class="version-history">
            <div v-for="item in versionDataRef" :key="item.version" class="version-item">
              <div class="version-title">
                <div class="version-number">{{ item.version }}</div>
                <div class="version-date">{{ item.date }}</div>
              </div>

              <div class="version-desc">
                <ol>
                  <li v-for="(content, index) in item.content" :key="index">{{ content }}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div class="download-links">
          <h3>下载链接</h3>
          <div class="links-container">
            <a href="https://github.com/lkw199711/smanga" target="_blank" class="link-item">
              <i class="el-icon-github"></i>
              <span>GitHub 仓库</span>
            </a>
            <a href="https://hub.docker.com/r/lkw199711/smanga" target="_blank" class="link-item">
              <i class="el-icon-docker"></i>
              <span>Docker 镜像</span>
            </a>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 优化导航菜单 -->
    <nav class="wiki-nav">
      <el-tabs v-model="activeTab" type="card" :stretch="true" @tab-click="handleTabChange">
        <el-tab-pane label="项目简介" name="intro"></el-tab-pane>
        <el-tab-pane label="功能特点" name="features"></el-tab-pane>
        <el-tab-pane label="安装指南" name="install"></el-tab-pane>
        <el-tab-pane label="使用说明" name="usage"></el-tab-pane>
        <el-tab-pane label="自定义模板" name="scan-template"></el-tab-pane>
        <el-tab-pane label="外部支持" name="external"></el-tab-pane>
        <el-tab-pane label="注意事项" name="notes"></el-tab-pane>
        <el-tab-pane label="发布信息" name="links"></el-tab-pane>
      </el-tabs>
    </nav>

    <!-- 主要内容区 -->
    <main class="wiki-main">
      <!-- 项目简介 -->
      <div v-if="activeTab === 'intro'" class="content-section">
        <h2 class="section-title">项目简介</h2>
        <div class="section-content">
          <p>Smanga 是一个简单易用、Docker直装的漫画流媒体阅读工具。以Emby、Plex为灵感，专为解决漫画阅读需求而开发。</p>
          <p>Smanga 帮助您管理海量漫画资源，支持多种格式，并提供舒适的阅读体验。</p>

          <div class="screenshot-container">
            <img src="https://github.com/lkw199711/smanga/raw/master/src/assets/readme/smanga-media-list.PNG"
              alt="Smanga 截图" class="screenshot">
          </div>
        </div>
      </div>

      <!-- 功能特点 -->
      <div v-if="activeTab === 'features'" class="content-section">
        <h2 class="section-title">功能特点</h2>
        <div class="section-content">
          <el-row :gutter="20">
            <el-col :span="12" class="feature-card">
              <div class="feature-icon"><i class="el-icon-folder-opened"></i></div>
              <h3 class="feature-title">媒体库管理</h3>
              <p class="feature-desc">创建和管理多个媒体库，支持不同的文件夹结构，轻松组织您的漫画资源。</p>
            </el-col>
            <el-col :span="12" class="feature-card">
              <div class="feature-icon"><i class="el-icon-file-image"></i></div>
              <h3 class="feature-title">多格式支持</h3>
              <p class="feature-desc">支持 ZIP、CBZ、CBR、7Z、RAR 和 PDF 等多种漫画格式，无需手动解压。</p>
            </el-col>
            <el-col :span="12" class="feature-card">
              <div class="feature-icon"><i class="el-icon-bookmark"></i></div>
              <h3 class="feature-title">书签功能</h3>
              <p class="feature-desc">添加书签记录阅读进度，随时返回上次阅读的位置。</p>
            </el-col>
            <el-col :span="12" class="feature-card">
              <div class="feature-icon"><i class="el-icon-history"></i></div>
              <h3 class="feature-title">阅读历史</h3>
              <p class="feature-desc">记录您的阅读历史，方便追踪和回顾已阅读的内容。</p>
            </el-col>
            <el-col :span="12" class="feature-card">
              <div class="feature-icon"><i class="el-icon-monitor"></i></div>
              <h3 class="feature-title">多设备兼容</h3>
              <p class="feature-desc">适配手机、平板和桌面设备，在各种屏幕尺寸上提供良好体验。</p>
            </el-col>
            <el-col :span="12" class="feature-card">
              <div class="feature-icon"><i class="el-icon-swap"></i></div>
              <h3 class="feature-title">多种阅读模式</h3>
              <p class="feature-desc">支持条漫(瀑布流)、单页和双页阅读模式，满足不同的阅读习惯。</p>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 安装指南 -->
      <div v-if="activeTab === 'install'" class="content-section">
        <h2 class="section-title">安装指南</h2>
        <div class="section-content">
          <h3 class="subsection-title">Docker 安装 (推荐)</h3>
          <div class="code-block">
            <pre><code>docker run -itd --name smanga \
-p 3333:3306 \
-p 9797:9797 \
-v /mnt:/mnt \
-v /route/smanga:/data \
lkw199711/smanga-nodejs;</code></pre>
          </div>

          <h3 class="subsection-title">国内镜像加速 (阿里云镜像仓库)</h3>
          <p>国内用户可使用阿里云镜像仓库地址进行拉取, 与 Docker Hub 镜像同步上传, 所有 tag 保持一致:</p>
          <p><code>registry.cn-hangzhou.aliyuncs.com/lkw199711/smanga-nodejs:latest</code></p>
          <div class="code-block">
            <pre><code>docker run -itd --name smanga \
-p 9797:9797 \
-v /mnt:/mnt \
-v /route/smanga:/data \
registry.cn-hangzhou.aliyuncs.com/lkw199711/smanga-nodejs:latest;</code></pre>
          </div>
          <p class="note-text">docker-compose 部署时, 将 image 字段替换为上述阿里云地址即可。</p>

          <h3 class="subsection-title">Docker Compose 部署</h3>
          <div class="code-block">
            <pre><code>version: "3"
services:
  smanga:
    image: lkw199711/smanga:alpha
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 1G
        reservations:
          memory: 16M
    ports:
      - 9797:80
    volumes:
      - /route/smanga:/data
      - /route/compress:/compress
      - /mnt:/mnt
    environment:
      PUID: 1000
      PGID: 1000
      UMASK: 022
      TZ: Asia/Shanghai
    restart: unless-stopped
    hostname: smanga-alpha
    container_name: smanga-alpha</code></pre>
          </div>

          <h3 class="subsection-title">Windows 版本</h3>
          <p>如果您没有 Linux 服务器，可以下载 Windows 版本：</p>
          <a href="https://github.com/lkw199711/smanga/releases" target="_blank" class="link-button">下载 Windows 版本</a>
          <p class="note-text">解压即可使用，更新时请将原目录下的 data 目录复制到新版本目录。</p>
        </div>
      </div>

      <!-- 使用说明 -->
      <div v-if="activeTab === 'usage'" class="content-section">
        <h2 class="section-title">使用说明</h2>
        <div class="section-content">
          <h3 class="subsection-title">默认用户名</h3>
          <p>用户名: <code>smanga</code> | 密码: <code>smanga</code></p>

          <h3 class="subsection-title">新增媒体库</h3>
          <ol class="steps-list">
            <li>进入媒体库管理页面，点击"新增媒体库"</li>
            <li>选择媒体类型（普通或单本）</li>
            <li>添加媒体路径，单个媒体库可以添加多条路径</li>
            <li>等待扫描完成，点击logo即可前往媒体库列表</li>
          </ol>

          <h3 class="subsection-title">添加书签</h3>
          <p>阅读时，点击屏幕靠上30%的区域呼出顶栏，最右侧为添加书签按钮。</p>

          <h3 class="subsection-title">切换浏览模式</h3>
          <p>顶栏有切换模式的选择框，可切换单页、双页与条漫模式。</p>

          <div class="screenshot-container">
            <img src="https://github.com/lkw199711/smanga/raw/master/src/assets/readme/smanga-operation.PNG"
              alt="阅读界面操作" class="screenshot">
            <p class="screenshot-caption">阅读界面操作示意图</p>
          </div>
        </div>
      </div>

      <!-- 自定义扫描模板 -->
      <div v-if="activeTab === 'scan-template'" class="content-section">
        <h2 class="section-title">自定义扫描模板</h2>
        <div class="section-content">
          <p>自定义模板用于处理内置模板无法覆盖的目录，特别适合同一路径中同时包含连载、单行本或多种分类层级的情况。配置按媒体路径保存，不会影响其他路径。</p>

          <h3 class="subsection-title">使用流程</h3>
          <ol class="steps-list">
            <li>进入“媒体库管理”，打开目标媒体库的“路径”设置。</li>
            <li>将“扫描模板”选择为“自定义模板规则”。</li>
            <li>填写下面介绍的 <code>version=1</code> JSON。</li>
            <li>点击“试扫描”，核对漫画、章节、跳过项和警告。</li>
            <li>确认结果后保存配置，再执行扫描更新。已有路径必须先保存配置。</li>
          </ol>
          <p class="tip-text">扫描更新是增量同步；重新扫描会先删除此路径下已入库的漫画。请先试扫描，再决定是否重新扫描。</p>

          <h3 class="subsection-title">如何计算目录层级</h3>
          <p><code>mangaIndex</code> 和 <code>chapterIndex</code> 从扫描路径的下一层开始按 <code>0</code> 计数：</p>
          <div class="code-block">
            <pre><code>扫描路径/漫画/章节/图片       mangaIndex=0, chapterIndex=1
扫描路径/分类/漫画/章节/图片  mangaIndex=1, chapterIndex=2
扫描路径/漫画/图片            mangaIndex=0, singleChapter=true</code></pre>
          </div>
          <p><code>singleChapter=true</code> 表示漫画目录本身作为唯一章节，此时不需要填写 <code>chapterIndex</code>。</p>

          <h3 class="subsection-title">单一结构示例</h3>
          <p>适用于 <code>扫描路径/分类/漫画/章节/图片</code>：</p>
          <div class="code-block">
            <pre><code>{
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
          </div>
          <p><code>strategy=single</code> 只使用规则数组中的第一条规则。</p>

          <h3 class="subsection-title">混合目录示例</h3>
          <div class="code-block">
            <pre><code>扫描路径/连载/漫画名/章节名/图片
扫描路径/单行本/漫画名/图片</code></pre>
          </div>
          <div class="code-block">
            <pre><code>{
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
          </div>
          <p><code>mixed</code> 会同时执行所有规则。识别结果发生重叠时，优先采用匹配度较高的规则；匹配度相同时采用 <code>priority</code> 较高的规则。</p>

          <h3 class="subsection-title">模板字段说明</h3>
          <el-table :data="scanTemplateFields" border size="small" style="width: 100%">
            <el-table-column prop="field" label="字段" width="210" />
            <el-table-column prop="required" label="必填" width="100" />
            <el-table-column prop="desc" label="说明" />
          </el-table>

          <h3 class="subsection-title">元数据高级配置</h3>
          <p>元数据配置同样按路径保存。高级配置留空时，系统会根据所选的元数据识别方式生成默认值。</p>
          <div class="code-block">
            <pre><code>{
  "version": 1,
  "sources": ["smanga", "series-json", "comicinfo"],
  "precedence": ["smanga", "series-json", "comicinfo"],
  "overwriteExisting": false,
  "maxFileBytes": 1048576
}</code></pre>
          </div>
          <el-table :data="metadataConfigFields" border size="small" style="width: 100%">
            <el-table-column prop="field" label="字段" width="190" />
            <el-table-column prop="desc" label="说明" />
          </el-table>
          <p class="tip-text"><code>.smanga</code> 和 <code>series.json</code> 是漫画级元数据，冲突时按 <code>precedence</code> 选择；压缩章节中的 <code>ComicInfo.xml</code> 是章节级元数据。</p>

          <h3 class="subsection-title">管理、限制与回退</h3>
          <ul class="steps-list">
            <li>模板 JSON 最大 64 KB，每份模板允许 1～20 条规则。</li>
            <li>非法 JSON、重复 ID、无效正则和越界层级会在保存或试扫描时直接提示。</li>
            <li>当前没有全局模板库；需要复用时，可复制 JSON 到其他媒体路径。</li>
            <li>服务器设置中的 <code>template-v2</code> 支持自动混合目录识别，推荐使用。</li>
            <li><code>template-v1</code> 的自动模式只为整条路径选择一个内置模板；<code>legacy</code> 不应用自定义模板，可用于紧急回退。</li>
          </ul>
        </div>
      </div>

      <!-- 外部支持 -->
      <div v-if="activeTab === 'external'" class="content-section">
        <h2 class="section-title">外部支持</h2>
        <div class="section-content">
          <p>
            Smanga 内置了 <strong>OPDS (Open Publication Distribution System) 1.2</strong> 协议支持,
            您可以使用任意兼容 OPDS 的第三方阅读器 (例如 <em>可达漫画 / Chunky Comic Reader / Panels / KyBook / Thorium / Foliate</em>) 直接订阅您的漫画库并在线阅读, 无需再手动下载.
          </p>

          <h3 class="subsection-title">功能概览</h3>
          <ul class="steps-list">
            <li>完整目录浏览: 媒体库 → 漫画 → 章节</li>
            <li>搜索 (OpenSearch) / 最新更新 / 我的收藏 三个专用入口</li>
            <li>章节下载: 压缩包直接下载, 图片目录型章节自动打包为 CBZ</li>
            <li>OPDS-PSE 流式翻页: 支持按页请求, 边下边看, 可动态缩放图片尺寸节省流量</li>
            <li>HTTP Basic Auth 鉴权, 沿用现有 smanga 账号</li>
            <li>媒体库权限过滤: 第三方客户端看到的内容与该用户在 Web 端一致</li>
          </ul>

          <h3 class="subsection-title">开启方式</h3>
          <p>OPDS 默认已开启, 相关配置位于 <code>/data/config/smanga.json</code> (Windows 为项目目录下的 <code>data/config/smanga.json</code>) 的 <code>opds</code> 节, 修改后无需重启服务即可生效:</p>
          <div class="code-block">
            <pre><code>{
  "opds": {
    // 是否启用 OPDS 接口, 1 开启 / 0 关闭 (默认 1)
    "enabled": 1,

    // 每页条目数 (默认 30)
    "pageSize": 30,

    // 对外暴露的根地址, 留空时自动根据请求推断
    // 若使用反向代理且域名/端口不同, 建议显式指定, 例如:
    // "baseUrl": "https://manga.example.com"
    "baseUrl": ""
  }
}</code></pre>
          </div>
          <p class="tip-text">
            老版本通过 <code>.env</code> 里 <code>OPDS_ENABLED / OPDS_PAGE_SIZE / OPDS_BASE_URL</code> 配置的方式已废弃,
            升级后这些变量会被忽略, 请将配置迁移到 <code>smanga.json</code> 的 <code>opds</code> 节.
          </p>

          <h3 class="subsection-title">订阅地址</h3>
          <p>在第三方阅读器中 "添加 OPDS 目录 / Catalog" 时, 填写以下信息:</p>
          <ul class="steps-list">
            <li><strong>URL</strong>: <code>http(s)://&lt;你的smanga地址&gt;/opds</code></li>
            <li><strong>用户名 / 密码</strong>: 您的 smanga 登录账号</li>
          </ul>
          <p>示例: <code>http://192.168.1.10:3000/opds</code> 或 <code>https://manga.example.com/opds</code></p>

          <h3 class="subsection-title">可用接口一览</h3>
          <el-table :data="opdsEndpoints" border size="small" style="width: 100%">
            <el-table-column prop="path" label="路径" width="320" />
            <el-table-column prop="desc" label="说明" />
          </el-table>

          <h3 class="subsection-title">常见问题</h3>
          <div class="note-card">
            <div class="note-icon"><i class="el-icon-question"></i></div>
            <div class="note-content">
              <h3 class="note-title">客户端提示 401 / 无法登录?</h3>
              <p>请确认账号密码正确, 并且 <code>smanga.json</code> 中 <code>opds.enabled</code> 未被设为 <code>0</code>. 若通过反向代理访问, 需保留 <code>Authorization</code> 请求头.</p>
            </div>
          </div>
          <div class="note-card">
            <div class="note-icon"><i class="el-icon-question"></i></div>
            <div class="note-content">
              <h3 class="note-title">下载的目录型章节是 CBZ 文件</h3>
              <p>对于图片目录章节 (非压缩包), Smanga 会即时将其中的图片按顺序打包为 CBZ 返回, 绝大多数漫画阅读器均可直接识别.</p>
            </div>
          </div>
          <div class="note-card">
            <div class="note-icon"><i class="el-icon-question"></i></div>
            <div class="note-content">
              <h3 class="note-title">压缩包章节第一次打开较慢?</h3>
              <p>PSE 流式翻页在首次访问压缩包章节时会触发一次同步解压并写入缓存, 后续访问将直接命中缓存速度很快. PDF 章节不支持流式翻页, 请使用下载方式阅读.</p>
            </div>
          </div>
          <div class="note-card">
            <div class="note-icon"><i class="el-icon-question"></i></div>
            <div class="note-content">
              <h3 class="note-title">想节省流量 / 加速移动网络阅读</h3>
              <p>支持 PSE 的客户端会自动在请求 URL 中带上 <code>width</code> 参数, 服务端会使用 sharp 按需等比缩图为 JPEG 返回; 也可手动访问 <code>/opds/chapter/&lt;id&gt;/page/1?width=1080</code> 测试.</p>
            </div>
          </div>

          <!-- Homepage (gethomepage.dev) 集成 -->
          <h3 class="subsection-title">Homepage 仪表盘集成</h3>
          <p>
            Smanga 提供了对 <a href="https://gethomepage.dev/" target="_blank"><strong>Homepage</strong></a>
            的原生适配, 通过其
            <a href="https://gethomepage.dev/widgets/services/customapi/" target="_blank"><code>customapi</code></a>
            组件即可把漫画库的统计数据 (媒体库 / 漫画 / 章节 / 标签 / 用户 / 今日阅读量 等) 直接展示到您的 Homepage 首页.
          </p>

          <h3 class="subsection-title">开启方式</h3>
          <p>在服务端 <code>.env</code> 中配置一个自定义 apikey (可选, 留空则不校验, 仅建议本地调试时使用):</p>
          <div class="code-block">
            <pre><code># Homepage customapi 鉴权密钥 (推荐设置)
HOMEPAGE_API_KEY=your-random-key-here</code></pre>
          </div>
          <p>接口地址: <code>GET http(s)://&lt;你的smanga地址&gt;/homepage/statistic</code>, 支持以下三种鉴权方式之一:</p>
          <ul class="steps-list">
            <li>Query 参数: <code>?apikey=your-random-key-here</code></li>
            <li>请求头: <code>X-API-Key: your-random-key-here</code></li>
            <li>请求头: <code>Authorization: Bearer your-random-key-here</code></li>
          </ul>

          <h3 class="subsection-title">Homepage 配置示例 (services.yaml)</h3>
          <p>将下面片段粘贴到 Homepage 配置目录的 <code>services.yaml</code> 中, 替换域名与 apikey 后即可生效:</p>
          <div class="code-block">
            <pre><code>- 漫画:
    - Smanga:
        icon: mdi-book-open-page-variant
        href: https://manga.example.com
        description: 漫画流媒体阅读
        widget:
          type: customapi
          url: https://manga.example.com/homepage/statistic
          refreshInterval: 30000
          method: GET
          headers:
            X-API-Key: your-random-key-here
          display: list
          mappings:
            - field:
                data: manga_count
              label: 漫画
              format: number
            - field:
                data: chapter_count
              label: 章节
              format: number
            - field:
                data: today_views
              label: 今日阅读
              format: number
            - field:
                data: latest_manga
              label: 最新入库</code></pre>
          </div>
          <p>
            说明: <code>mappings.field.data</code> 支持任意在响应 <code>data</code> 对象下的字段;
            <code>format</code> 可选 <code>number / float / percent / bytes / date / relativeDate / text</code>,
            更多用法请参考
            <a href="https://gethomepage.dev/widgets/services/customapi/" target="_blank">Homepage customapi 官方文档</a>.
          </p>

          <h3 class="subsection-title">响应字段一览</h3>
          <p>接口返回体结构为 <code>{ code, data: { ... }, message }</code>, 下表列出 <code>data</code> 中可用的字段 (均为扁平结构, 可直接用于 mappings):</p>
          <el-table :data="homepageFields" border size="small" style="width: 100%">
            <el-table-column prop="field" label="字段" width="220" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="desc" label="说明" />
          </el-table>

          <div class="note-card">
            <div class="note-icon"><i class="el-icon-info"></i></div>
            <div class="note-content">
              <h3 class="note-title">无需登录 token</h3>
              <p>为方便 Homepage 调用, 该接口走独立的 <code>apikey</code> 校验, 不经过前端登录态; 请务必设置 <code>HOMEPAGE_API_KEY</code> 并仅在内网或反向代理后暴露.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 注意事项 -->
      <div v-if="activeTab === 'notes'" class="content-section">
        <h2 class="section-title">注意事项</h2>
        <div class="section-content">
          <div class="note-card warning">
            <div class="note-icon"><i class="el-icon-warning"></i></div>
            <div class="note-content">
              <h3 class="note-title">不支持长图条漫</h3>
              <p>由于网络请求限制，不支持长图条漫（需裁切）。内网环境可能可以加载，但外网环境下会出现问题。</p>
            </div>
          </div>

          <div class="note-card info">
            <div class="note-icon"><i class="el-icon-info"></i></div>
            <div class="note-content">
              <h3 class="note-title">版本兼容性</h3>
              <p>新版本与旧版本不兼容，请分开部署。新版本网页端口为9797，部署时请注意。</p>
            </div>
          </div>

          <div class="note-card info">
            <div class="note-icon"><i class="el-icon-info"></i></div>
            <div class="note-content">
              <h3 class="note-title">初始化流程</h3>
              <p>初次部署需要走完初始化流程才能访问页面。当看到日志中出现"Server is running on port 9797"时，表示服务启动成功。</p>
            </div>
          </div>

          <div class="note-card info">
            <div class="note-icon"><i class="el-icon-info"></i></div>
            <div class="note-content">
              <h3 class="note-title">开发注意事项</h3>
              <p>此项目使用Node.js 16运行，请确保开发环境满足版本要求。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 发布信息 -->
      <div v-if="activeTab === 'links'" class="content-section">
        <h2 class="section-title">发布信息</h2>
        <div class="section-content">
          <div class="links-container">
            <a href="https://github.com/lkw199711/smanga" target="_blank" class="link-item">
              <i class="el-icon-github"></i>
              <span>GitHub 仓库</span>
            </a>
            <a href="https://hub.docker.com/r/lkw199711/smanga" target="_blank" class="link-item">
              <i class="el-icon-docker"></i>
              <span>Docker 镜像</span>
            </a>
            <a href="https://jq.qq.com/?_wv=1027&k=CaeWd6im" target="_blank" class="link-item">
              <i class="el-icon-chat-line-square"></i>
              <span>QQ 交流群: 534086782</span>
            </a>
            <a href="https://t.me/+FFgQ7AMIdrg2M2Y1" target="_blank" class="link-item">
              <i class="el-icon-message"></i>
              <span>Telegram 交流群</span>
            </a>
            <a href="https://t.me/smangachannel" target="_blank" class="link-item">
              <i class="el-icon-bell"></i>
              <span>Telegram 版本发布频道</span>
            </a>
          </div>

          <h3 class="subsection-title">版本更新记录</h3>
          <div class="version-history">
            <div class="version-item">
              <div class="version-number">3.7.0</div>
              <div class="version-desc">产出exe文件，后端改用nodejs</div>
            </div>
            <div class="version-item">
              <div class="version-number">3.6.0</div>
              <div class="version-desc">封面图片缓存，添加骨架屏动画</div>
            </div>
            <div class="version-item">
              <div class="version-number">3.5.0</div>
              <div class="version-desc">菜单分类并修改图表</div>
            </div>
            <div class="version-item">
              <div class="version-number">3.4.0</div>
              <div class="version-desc">扫描时自动解压章节</div>
            </div>
            <div class="version-item">
              <div class="version-number">3.3.0</div>
              <div class="version-desc">使用laravel重构项目，并优化排序功能</div>
            </div>
            <div class="version-item">
              <div class="version-number">3.0.0</div>
              <div class="version-desc">新增数据库、多格式支持以及多项新功能</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="wiki-footer">
      <p>© {{ currentYear }} Smanga. 励志做最好的流媒体漫画阅读平台!</p>
      <p>如果产品有帮助到您，请给一颗star以示鼓励。</p>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 恢复logo引入
import logoUrl from '@/assets/logo.png';
type versionDataType = {
  version: string;
  date: string;
  content: string[];
}
// 状态管理
const activeTab = ref('intro');
const versionDataRef = ref<versionDataType[]>([]);

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
];

const metadataConfigFields = [
  { field: 'version', desc: '当前只支持 1' },
  { field: 'sources', desc: '启用 smanga、series-json、comicinfo；空数组表示不读取元数据' },
  { field: 'precedence', desc: '来源优先顺序，只能包含 sources 中已经启用的来源' },
  { field: 'overwriteExisting', desc: 'true 允许覆盖已有元数据，false 保留已入库数据' },
  { field: 'maxFileBytes', desc: '单文件读取上限：1024～10485760 字节，默认 1048576（1 MB）' },
];

// OPDS 外部支持 - 接口一览
const opdsEndpoints = [
  { path: '/opds', desc: '根目录 (Catalog 入口, 填这个即可)' },
  { path: '/opds/libraries', desc: '媒体库列表' },
  { path: '/opds/libraries/:mediaId', desc: '某媒体库下的漫画列表 (分页)' },
  { path: '/opds/manga/:mangaId', desc: '某漫画下的章节列表 (分页)' },
  { path: '/opds/chapter/:chapterId', desc: '章节详情 entry' },
  { path: '/opds/chapter/:chapterId/download', desc: '下载章节 (zip/cbz/pdf 直接流式; 图片目录打包为 CBZ)' },
  { path: '/opds/chapter/:chapterId/page/:page', desc: 'PSE 流式翻页, 支持 ?width=1080 按需缩图' },
  { path: '/opds/chapter/:chapterId/cover', desc: '章节封面' },
  { path: '/opds/manga/:mangaId/cover', desc: '漫画封面' },
  { path: '/opds/search?q=关键词', desc: '全库搜索' },
  { path: '/opds/opensearch.xml', desc: 'OpenSearch 描述文档 (客户端自动发现)' },
  { path: '/opds/latest', desc: '最新更新 Feed' },
  { path: '/opds/collects', desc: '我的收藏 Feed' },
];

// Homepage customapi - 响应字段一览 (GET /homepage/statistic)
const homepageFields = [
  { field: 'media_count', type: 'number', desc: '媒体库数量 (未删除)' },
  { field: 'manga_count', type: 'number', desc: '漫画数量 (未删除)' },
  { field: 'chapter_count', type: 'number', desc: '章节数量 (未删除)' },
  { field: 'tag_count', type: 'number', desc: '标签数量' },
  { field: 'user_count', type: 'number', desc: '用户数量' },
  { field: 'collect_count', type: 'number', desc: '收藏数量' },
  { field: 'bookmark_count', type: 'number', desc: '书签数量' },
  { field: 'history_count', type: 'number', desc: '阅读历史总数' },
  { field: 'today_views', type: 'number', desc: '今日阅读次数 (按 history 记录)' },
  { field: 'week_views', type: 'number', desc: '近 7 天阅读次数' },
  { field: 'latest_manga', type: 'string', desc: '最新入库漫画名称' },
  { field: 'latest_manga_time', type: 'datetime|null', desc: '最新入库漫画的创建时间 (ISO)' },
  { field: 'latest_chapter', type: 'string', desc: '最新入库章节名称' },
  { field: 'latest_chapter_time', type: 'datetime|null', desc: '最新入库章节的创建时间 (ISO)' },
  { field: 'server_time', type: 'string', desc: '服务器当前时间 (ISO 8601)' },
];
// 直接从package.json导入版本号
import packageJson from '../../../package.json';
const version = packageJson.version || '0.0.0';
const currentYear = new Date().getFullYear();

// 版本更新状态
const isVersionDialogOpen = ref(false);
const isCheckingUpdate = ref(false);
const hasUpdate = ref(false);
const latestVersion = ref('');
const errorCheckingUpdate = ref(false);
const isLoadingVersionData = ref(true);
const versionDataError = ref(false);

// 处理标签切换
const handleTabChange = (tab: any) => {
  activeTab.value = tab.props.name;
};

// 打开版本弹窗
const openVersionDialog = () => {
  isVersionDialogOpen.value = true;
};

// 关闭版本弹窗
const handleClose = () => {
  isVersionDialogOpen.value = false;
};

// 获取版本数据
const fetchVersionData = () => {
  isLoadingVersionData.value = true;
  versionDataError.value = false;

  // 从GitHub获取版本数据
  axios.get('https://raw.githubusercontent.com/lkw199711/smanga/electron/version.json')
    .then(response => {
      isLoadingVersionData.value = false;
      versionDataRef.value = response.data;
      versionDataRef.value.reverse();
    })
    .catch(error => {
      isLoadingVersionData.value = false;
      versionDataError.value = true;
      console.error('获取版本数据失败:', error);
    });
};

// 检查更新
const checkForUpdates = () => {
  isCheckingUpdate.value = true;
  hasUpdate.value = false;
  errorCheckingUpdate.value = false;
  latestVersion.value = '';

  // 从GitHub获取最新版本信息
  axios.get('https://raw.githubusercontent.com/lkw199711/smanga/electron/package.json')
    .then(response => {
      isCheckingUpdate.value = false;
      const githubVersion = response.data.version;
      latestVersion.value = githubVersion;

      // 比较版本号
      if (compareVersions(githubVersion, version) > 0) {
        hasUpdate.value = true;
      } else {
        hasUpdate.value = false;
      }
    })
    .catch(error => {
      isCheckingUpdate.value = false;
      errorCheckingUpdate.value = true;
      console.error('检查更新失败:', error);
    });
};

// 版本号比较函数
const compareVersions = (version1: string, version2: string) => {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = i < v1.length ? v1[i] : 0;
    const num2 = i < v2.length ? v2[i] : 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
};

// 页面加载时检查更新和获取版本数据
onMounted(() => {
  checkForUpdates();
  fetchVersionData();
});
</script>

<style scoped lang="less">
.wiki-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

// 优化后的顶栏样式
.wiki-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background-color: #fff;
  color: #333;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #eee;

  .logo-container {
    display: flex;
    align-items: center;

    .logo {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-left: 0.5rem;
    }
  }

  .version-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    background-color: #f0f7ff;
    color: #1890ff;

    &:hover {
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    &.has-update {
      background-color: #fff7e6;
      color: #fa8c16;
    }

    &.update-error {
      background-color: #fff1f0;
      color: #f5222d;
    }

    .update-status {
      margin-right: 0.5rem;
      display: flex;
      align-items: center;
    }

    .version-text {
      font-weight: bold;
      padding-left: 0.3rem;
      border-left: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
}

// 版本弹窗样式
.version-dialog-content {
  padding: 20px;

  .current-version {
    margin-bottom: 15px;
    padding: 10px 0;
    border-bottom: 1px solid #eee;

    .version-number {
      font-weight: bold;
      color: #1890ff;
    }
  }

  .loading-container,
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    color: #666;

    .el-icon-error {
      color: #f5222d;
      margin-right: 8px;
      font-size: 18px;
    }
  }



  .update-checking,
  .update-available,
  .update-error,
  .up-to-date {
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
  }

  .update-checking {
    color: #666;

    .el-loading-spinner {
      margin-right: 10px;
    }
  }

  .update-available {
    color: #52c41a;

    .update-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .update-info {
      text-align: center;
    }

    .version-number {
      font-weight: bold;
    }

    .update-desc {
      color: #666;
      margin-top: 5px;
    }
  }

  .update-error {
    color: #ff4d4f;

    .error-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }
  }

  .up-to-date {
    color: #1890ff;

    .up-to-date-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }
  }

  .version-history-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;

    h3 {
      font-size: 1.1rem;
      margin-bottom: 15px;
      color: #333;
    }

    .version-history {
      max-height: 150px;
      overflow-y: auto;

      .version-item {
        padding: 10px 0;
        border-bottom: 1px dashed #eee;

        .version-title {
          display: flex;
          justify-content: space-between;

          .version-date {
            font-size: 0.9rem;
            color: #666;
          }
        }

        &:last-child {
          border-bottom: none;
        }

        .version-number {
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 5px;
        }

        .version-desc {
          color: #333;
          font-size: 1.2rem;
          padding-left: 20px;

          ul,
          ol {
            list-style: auto;
            list-style-type: disc;
          }
        }
      }
    }
  }

  .download-links {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;

    h3 {
      font-size: 1.1rem;
      margin-bottom: 15px;
      color: #333;
    }

    .links-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .link-item {
        display: flex;
        align-items: center;
        padding: 8px 15px;
        background-color: #f0f7ff;
        color: #1890ff;
        border-radius: 5px;
        text-decoration: none;
        transition: all 0.3s;

        &:hover {
          background-color: #e6f4ff;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        i {
          margin-right: 8px;
        }
      }
    }
  }
}

// 其他样式保持不变
.wiki-nav {
  background-color: white;
  padding: 0 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.wiki-main {
  flex: 1;
  padding: 0 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.content-section {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;

  .section-title {
    font-size: 1.8rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #3498db;
  }

  .section-content {
    color: #333;
    line-height: 1.6;

    .subsection-title {
      font-size: 1.3rem;
      color: #2c3e50;
      margin: 1.5rem 0 1rem;
    }

    .code-block {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;

      pre {
        margin: 0;
      }

      code {
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
      }
    }

    .link-button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      text-decoration: none;
      margin: 1rem 0;
      transition: background-color 0.3s;

      &:hover {
        background-color: #2980b9;
      }
    }

    .steps-list {
      padding-left: 1.5rem;
      margin: 1rem 0;

      li {
        margin-bottom: 0.5rem;
      }
    }

    .note-text {
      color: #7f8c8d;
      font-style: italic;
    }

    .screenshot-container {
      margin: 1.5rem 0;
      text-align: center;

      .screenshot {
        max-width: 100%;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .screenshot-caption {
        margin-top: 0.5rem;
        color: #7f8c8d;
        font-style: italic;
      }
    }

    .feature-card {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      transition: transform 0.3s, box-shadow 0.3s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .feature-icon {
        font-size: 2rem;
        color: #3498db;
        margin-bottom: 1rem;
      }

      .feature-title {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        color: #2c3e50;
      }

      .feature-desc {
        color: #7f8c8d;
      }
    }

    .note-card {
      display: flex;
      padding: 1rem;
      border-radius: 5px;
      margin-bottom: 1rem;

      &.warning {
        background-color: #fff5f5;
        border-left: 4px solid #ff4d4f;
      }

      &.info {
        background-color: #f0f7ff;
        border-left: 4px solid #1890ff;
      }

      .note-icon {
        font-size: 1.5rem;
        margin-right: 1rem;
        align-self: flex-start;

        &.el-icon-warning {
          color: #ff4d4f;
        }

        &.el-icon-info {
          color: #1890ff;
        }
      }

      .note-content {
        flex: 1;

        .note-title {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
      }
    }

    .links-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 1.5rem 0;

      .link-item {
        display: flex;
        align-items: center;
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 5px;
        text-decoration: none;
        color: #333;
        transition: background-color 0.3s;

        &:hover {
          background-color: #e9ecef;
        }

        i {
          font-size: 1.5rem;
          margin-right: 0.8rem;
          color: #3498db;
        }
      }
    }

    .version-history {
      margin: 1.5rem 0;

      .version-item {
        padding: 0.8rem 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .version-number {
          font-weight: bold;
          color: #3498db;
          margin-bottom: 0.3rem;
        }

        .version-desc {
          color: #7f8c8d;
        }
      }
    }
  }
}

.wiki-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1.5rem;

  p {
    margin: 0.5rem 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wiki-header {
    flex-direction: column;
    padding: 1rem;

    .logo-container {
      margin-bottom: 1rem;
    }
  }

  .wiki-main {
    padding: 1rem;
  }

  .content-section {
    padding: 1.5rem;
  }

  .feature-card {
    width: 100% !important;
  }
}

// 优化标签页样式
::v-deep(.el-tabs__nav-wrap) {
  padding: 0.5rem 0;
}

::v-deep(.el-tabs__tab) {
  font-size: 1rem;
  padding: 0.7rem 1.5rem;
  transition: all 0.3s;
}

::v-deep(.el-tabs__tab.is-active) {
  color: #3498db;
  font-weight: bold;
}

::v-deep(.el-tabs__tab-bar) {
  border-bottom: 1px solid #e0e0e0;
}

::v-deep(.el-tabs__active-bar) {
  background-color: #3498db;
  height: 3px;
}
</style>
