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
          <el-loading-spinner size="small"></el-loading-spinner>
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
            <el-loading-spinner size="small"></el-loading-spinner>
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
      - 9798:80
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
import { ElTabs, ElTabPane, ElDialog } from 'element-plus';
import 'element-plus/es/components/tabs/style/css';
import 'element-plus/es/components/tab-pane/style/css';
import 'element-plus/es/components/icon/style/css';
import 'element-plus/es/components/dialog/style/css';
import 'element-plus/es/components/loading/style/css';
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
const version = import.meta.env.VITE_APP_VERSION || '4.1.4';
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
