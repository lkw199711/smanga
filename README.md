



# Smanga

[![Build Smanga Alpha Docker](https://github.com/lkw199711/smanga/actions/workflows/docker_alpha.yml/badge.svg)](https://github.com/lkw199711/smanga/actions/workflows/docker_alpha.yml) [![Build Smanga Base Docker](https://github.com/lkw199711/smanga/actions/workflows/docker_base.yml/badge.svg)](https://github.com/lkw199711/smanga/actions/workflows/docker_base.yml) [![Build Smanga Beta Docker](https://github.com/lkw199711/smanga/actions/workflows/docker_beta.yml/badge.svg)](https://github.com/lkw199711/smanga/actions/workflows/docker_beta.yml) [![Build Smanga Docker](https://github.com/lkw199711/smanga/actions/workflows/docker.yml/badge.svg)](https://github.com/lkw199711/smanga/actions/workflows/docker.yml)

简单易用，docker直装的漫画流媒体阅读工具。

以emby plex为灵感，为解决漫画阅读需求而开发的漫画阅读器。

- [Smanga](#smanga)
  - [简介](#简介)
  - [安装](#安装)
    - [1. 使用docker安装](#1-使用docker安装)
      - [整合映射](#整合映射)
      - [推荐映射](#推荐映射)
      - [全目录映射](#全目录映射)
    - [2.使用docker-compose进行部署](#2使用docker-compose进行部署)
      - [以下给出一个compose文件示例](#以下给出一个compose文件示例)
      - [macvlan部署示例](#macvlan部署示例)
    - [3. ~~LNMP环境安装~~](#3-lnmp环境安装)
  - [使用](#使用)
    - [默认用户名](#默认用户名)
    - [新增媒体库](#新增媒体库)
      - [媒体库管理-\>新增媒体库](#媒体库管理-新增媒体库)
      - [添加路径](#添加路径)
    - [自定义扫描模板](#自定义扫描模板)
    - [添加书签](#添加书签)
    - [切换浏览模式](#切换浏览模式)
    - [阅读界面的使用](#阅读界面的使用)
  - [外部支持](#外部支持)
    - [功能概览](#功能概览)
    - [开启方式](#开启方式)
    - [订阅地址](#订阅地址)
    - [可用接口一览](#可用接口一览)
    - [常见问题](#常见问题)
  - [初衷](#初衷)
  - [产品局限性](#产品局限性)
    - [虽然为条漫开发, 但是并不支持长图条漫(需裁切)](#虽然为条漫开发-但是并不支持长图条漫需裁切)
  - [最后](#最后)
  - [版本更新记录](#版本更新记录)
  - [开发注意事项](#开发注意事项)

![](https://github.com/lkw199711/smanga/raw/master/src/assets/readme/smanga-media-list.PNG)

## 简介

github: https://github.com/lkw199711/smanga

docker: https://hub.docker.com/r/lkw199711/smanga

后端项目已转移: https://github.com/lkw199711/smanga-php


> **在浏览漫画时,你是否有这样那样的烦恼？**

- 图片 压缩包 pdf等格式繁杂, 解压的文件到处都是, 经常找不到想看的漫画且占用空间大
- 阅读器无法很好的适应条漫, 图片之间有割裂
- 合订单行本一本几百页, 经常忘记自己看到哪了
- 想像emby一样拥有漂亮的流媒体电影墙, 这种方式去管理海量漫画资源
- pt刷友为了保种, 下载的漫画不好手动解压, 需要一款流媒体管理软件
- calibre-web等管理软件安装步骤繁杂, 到现在还没有成功使用上

> **您可以尝试一下smanga, 最新版3.0.0的升级, 带来了如下功能及支持**

1. 引入mysql数据库支持, 扫描以及检索漫画效率更高, 资源占用更少
2. 新增解压缩转换功能, 支持(zip|cbz|cbr|7z|rar|pdf)
3. 新增书签功能, 记录自己的阅读进度
4. 新增历史功能, 可查看自己的浏览记录
5. 对各尺寸设备的兼容, 现在您在手机、平板、pc等各种设备上使用smanga都可以获得良好的体验.
6. 新增多种阅读模式, 条漫(瀑布流) , 翻页 以及双页, 选择适合的浏览模式可提升阅读体验. 

## windows版本

smanga作为一块服务端专用软件,推荐您使用docker进行部署,如果您没有linux服务器. 可以下载windows版本.

https://github.com/lkw199711/smanga/releases

解压即可使用

### exe如何更新

请下载最新的安装包,并将原目录下的data目录,复制并覆盖到新的smanga路径下即可

### data目录说明

data目录为smanga使用的缓存目录

```
bookmark	书签封面存储目录
cache		封面压缩缓存目录
compress	压缩包解压目录
config		配置文件目录
db			数据库目录(sqlite)
file		apk等文件存放目录
logs		nginx等服务日志目录
poster		媒体库,漫画,章节 封面存放目录
```



## 新版本安装

##### 首先讲一下新版,nodejs版本. 旧版本将不再更新.

```
docker run -itd --name smanga \
-p 9797:9797 \
-v /mnt:/mnt \
-v /route/smanga:/data \
lkw199711/smanga-nodejs;
```

##### 国内镜像加速 (阿里云镜像仓库)

由于部分地区拉取 Docker Hub 速度较慢, 本项目同步推送了阿里云镜像仓库, 与 Docker Hub 镜像保持同步上传, 国内用户可选择使用:

- 镜像地址: `registry.cn-hangzhou.aliyuncs.com/lkw199711/smanga-nodejs:latest`
- 所有 tag (版本号 / latest) 与 Docker Hub 保持一致

使用示例, 只需将镜像名替换为阿里云地址即可:

```
docker run -itd --name smanga \
-p 9797:9797 \
-v /mnt:/mnt \
-v /route/smanga:/data \
registry.cn-hangzhou.aliyuncs.com/lkw199711/smanga-nodejs:latest;
```

docker-compose 同理, 将 `image:` 字段替换为阿里云镜像地址即可, 例如:

```yaml
services:
  smanga-nodejs:
    image: registry.cn-hangzhou.aliyuncs.com/lkw199711/smanga-nodejs:latest
```

1. 新版进需要映射/data 一个目录,细分目录映射不再支持
2. 新旧目录不想兼容,请另外准备空目录映射data目录
3. 新版本网页端口改为9797.部署时请注意
4. 新老版本不想兼容,请大家另外部署
5. 新版本如果在访问过旧版本的浏览器登录,请先清除旧版本cookie再登录.
6. 新版本暂未支持pdf

##### 这里提供一个飞牛的compose示例,群辉等成品nas可用,注意自己调整目录等参数

```dockerfile
services:
  postgres:
    image: postgres:18
    container_name: smanga-postgres
    environment:
      POSTGRES_DB: smanga
      POSTGRES_USER: smanga
      POSTGRES_PASSWORD: smanga
    ports:
      - "9799:5432"
    volumes:
      - ./postgres_lib:/var/lib/postgresql
      - ./postgres_log:/var/log/postgresql
    restart: unless-stopped
    networks:
      - smanga-network

  smanga-nodejs:
    image: lkw199711/smanga-nodejs:latest
    container_name: smanga
    ports:
      - "9797:9797"
    environment:
      DB_TYPE: pgsql
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: smanga
      DB_PASSWORD: smanga
      DB_DATABASE: smanga
      WEB_PORT: 9797
      PUID: 0
      PGID: 0
      TZ: Asia/Shanghai
    restart: unless-stopped
    depends_on:
      - postgres
    networks:
      - smanga-network
    volumes:
      - ./data:/data
      - /vol1:/vol1	#自己有几个硬盘,或者说存储池,就要映射多少目录,保持docker内外路径一致.
      - /vol2:/vol2 #我这里是接了三个硬盘
      - /vol3:/vol3

networks:
  smanga-network:
    driver: bridge
```

##### 如果不需要独立数据库，可以使用默认的sqlite

```
services:
  speedtest:
    image: lkw199711/smanga-nodejs:4.2.80
    container_name: smanga
    ports:
      - "9797:9797"
    restart: unless-stopped
    networks:
      - smanga-network
    volumes:
      - ./data:/data
      - /vol1:/vol1	#自己有几个硬盘,或者说存储池,就要映射多少目录,保持docker内外路径一致.
      - /vol2:/vol2 #我这里是接了三个硬盘
      - /vol3:/vol3
    environment:
      PUID: 0    # 想切换为哪个用户来运行程序，不希望用root,可以根据自己的机器权限调整
      PGID: 0	 
      TZ: Asia/Shanghai

networks:
  smanga-network:
    driver: bridge
```



##### 新版本目前实现条漫跳页,媒体库封面生成 等功能.

![media poster](https://github.com/lkw199711/smanga/raw/electron/src/assets/readme/media-poster.PNG)

### 部署帮助

请参考正常状态下的docker logs

![normal log](https://github.com/lkw199711/smanga/raw/electron/src/assets/readme/normal-log.JPG)

汇报出

```
'/app/adonis/smanga.db': No such file or directory
```

时请不要慌张,初次部署没有db文件以及几个缓存目录是正常的,程序会自动生成.

刚刚部署需要走完初始化流程,然后才能启动服务,所以请不要立即访问页面

```
Server is running on port 9797
[16:35:57.537] INFO (188): started HTTP server on 0.0.0.0:9797
```

当你看到这两行的时候,说明服务启动成功,前端页面与后端 API 都由 9797 提供

就可以访问页面了.

## 旧版本安装

### 1. 使用docker安装

#### 整合映射

```dockerfile
docker run -itd --name smanga \
-p 3333:3306 \
-p 9797:80 \
-v /mnt:/mnt \
-v /route/smanga:/data \
lkw199711/smanga;
```

smanga的部署，仅映射一个data目录即可。

#### 推荐映射

```dockerfile
docker run -itd --name smanga \
-p 3333:3306 \
-p 9797:80 \
-v /mnt:/mnt \
-v /route/smanga:/data \
-v /route/compress:/compress \
lkw199711/smanga;
```

通常我们在使用系统时，应用池与存储池是分开的，就好比我们不会在C盘储存大量的媒体资源。compress目录是解压缩文件的缓存目录，smanga将所有的压缩文件解压为图片放置在compress目录中。这些文件并非关键文件，丢失不会影响系统正常运行，但是会占用大量空间，因此建议您将此目录单独映射，而其余的目录保持默认即可。

#### 全目录映射

```dockerfile
docker run -itd --name smanga \
-p 3333:3306 \
-p 9797:80 \
-v /mnt:/mnt \
-v /route/compress:/compress \
-v /route/poster:/poster \
-v /route/mysql:/var/lib/mysql \
-v /route/config:/config \
lkw199711/smanga;
```

|         参数         | 含义                                                         |
| :------------------: | :----------------------------------------------------------- |
|       `--name`       | 容器命名                                                     |
|        `-itd`        | 交互模式 后台启动 避免容器停止                               |
|       `-p 80`        | Web管理界面端口                                              |
|      `-p 3306`       | mysq数据库端口, 推荐映射, 方便管理数据                       |
|      `-v /data`      | 整合目录，包含（compress,config,poster,mysql）与单独映射方式二选一 |
|   `-v /compress `    | 压缩转换目录（将zip cbz等压缩文件解压后存放在此目录读取，请挂在到对容量有信心的硬盘上。） |
|    `-v /poster `     | 封面存储目录（解压缩后, smanga将提取一张图片作为封面，存放在次目录中。） |
|     `-v /config`     | 配置文件存储目录                                             |
| `-v /var/lib/mysql ` | mysql数据目录（此目录必须映射, 否则升级smanga容器后, 将丢失所有数据。nosql版本的镜像无需映射。） |
|      `-v /mnt`       | mnt为linux系统（centos，debian，centos）通用挂载目录，您所有的外置硬盘一般都会挂载在此目录，映射此目录可使您镜像内外访问资源具有一致性。 |

### 2.使用docker-compose进行部署

#### 以下给出一个compose文件示例

```
version: "3"
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
      PUID: 1000    # 想切换为哪个用户来运行程序，该用户的uid
      PGID: 1000    # 想切换为哪个用户来运行程序，该用户的gid
      UMASK: 022
      TZ: Asia/Shanghai
    restart: unless-stopped
    hostname: smanga-alpha
    container_name: smanga-alpha
```

#### macvlan部署示例

```
version: "3"
services:
  smanga:
    image: lkw199711/smanga
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 1G
        reservations:
          memory: 16M
    networks:
      macvlan_1:
        ipv4_address: 192.168.2.21
    ports:
      - 9797:80
    volumes:
      - /route/smanga:/data
      - /route/compress:/compress
      - /mnt:/mnt
    environment:
      PUID: 1000    # 想切换为哪个用户来运行程序，该用户的uid
      PGID: 1000    # 想切换为哪个用户来运行程序，该用户的gid
      UMASK: 022
      TZ: Asia/Shanghai
    restart: unless-stopped
    hostname: smanga-alpha
    container_name: smanga-alpha

networks:
  macvlan_1:
    external: true
    driver: macvlan
```

### 3. ~~LNMP环境安装~~

~~安装宝塔面板或是其他web环境（支持php），然后将web项目放入站点目录即可。~~

Smanga3版本以上, 新增了数据库以及压缩文件支持, 为此引入了许多库支持, 无法直接使用web项目安装, 请使用docker安装.


## 使用

### 默认用户名

默认用户名密码 smanga smanga

### 新增媒体库

#### 媒体库管理->新增媒体库

媒体类型分普通和单本, 扫描时的目录结构有所区别

​		普通 (漫画目录=>章节目录=>图片)

​		单本 (漫画目录=>图片)

单本结构没有章节, 少一层.

通过选择"文件夹结构", 可以是结构新增一层二级目录, 比如你想用年份分区

(/二级目录/漫画/章节/图片)

#### 添加路径

为媒体库添加媒体路径, 单个媒体库可以有多条路径 (添加时请注意目录的格式以及确认目录确实存在)

添加路径之后,smanga将开始扫描, 骚后点击logo可前往媒体库列表界面 就可以观看漫画了

### 自定义扫描模板

当同一个扫描路径中的目录结构不属于内置模板，或者同时混合了“连载漫画”和“单行本”等不同结构时，可以为该路径配置自定义扫描模板。模板按路径保存，不会影响其他媒体路径。

#### 使用步骤

1. 进入 **媒体库管理**，打开目标媒体库的 **路径** 设置。
2. 新增路径时，在“扫描模板”中选择 **自定义模板规则**；已有路径可直接修改其扫描模板。
3. 在“模板规则 JSON”中填写 `version=1` 的规则。
4. 点击 **试扫描**，检查识别出的漫画、章节、跳过项和警告。
5. 结果符合预期后保存配置，再执行扫描更新。修改已有路径时，必须先点击 **保存配置**。

> “扫描更新”用于增量同步；“重新扫描”会先删除该路径下已经入库的漫画，再按新规则建立数据。正式使用新规则前建议先试扫描。

#### 目录层级编号

`mangaIndex` 和 `chapterIndex` 从扫描路径的下一层开始按 `0` 计数：

```text
扫描路径/漫画/章节/图片       mangaIndex=0, chapterIndex=1
扫描路径/分类/漫画/章节/图片  mangaIndex=1, chapterIndex=2
扫描路径/漫画/图片            mangaIndex=0, singleChapter=true
```

章节可以是包含图片的目录，也可以是 Smanga 支持的压缩包或文档格式。`singleChapter=true` 表示漫画目录本身就是唯一章节，此时可省略 `chapterIndex`（保存后会规范为 `null`）。

#### 单一结构示例

以下规则适用于 `扫描路径/分类/漫画/章节/图片`：

```json
{
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
}
```

`strategy=single` 只使用 `rules` 中的第一条规则。

#### 混合目录示例

假设一个路径中同时存在以下两种结构：

```text
扫描路径/连载/漫画名/章节名/图片
扫描路径/单行本/漫画名/图片
```

可以使用：

```json
{
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
}
```

`strategy=mixed` 会同时应用所有规则。多条规则识别到相同或互相包含的漫画路径时，系统优先选择结构匹配度更高的结果；匹配度相同时使用 `priority` 较高的规则。

#### 模板字段

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| `version` | 是 | 当前只支持 `1` |
| `strategy` | 是 | `single` 或 `mixed` |
| `rules` | 是 | 1～20 条规则 |
| `rules[].id` | 是 | 规则唯一标识，只能使用字母、数字、`_`、`-`，最多 64 字符 |
| `rules[].label` | 否 | 页面和扫描报告中显示的名称，默认使用 `id` |
| `rules[].priority` | 否 | 冲突时的优先级，范围 0～10000 |
| `rules[].mangaIndex` | 是 | 漫画所在层级，范围 0～8 |
| `rules[].chapterIndex` | 连载结构必填 | 章节层级，必须大于 `mangaIndex`，最大为 9 |
| `rules[].singleChapter` | 否 | `true` 表示漫画目录本身作为唯一章节；省略或为 `false` 时使用独立章节层级 |
| `rules[].directoryInclude` | 否 | 对漫画完整路径执行的 JavaScript 正则表达式；匹配后才采用此规则 |
| `rules[].directoryExclude` | 否 | 对漫画完整路径执行的 JavaScript 正则表达式；匹配时排除此规则 |

模板 JSON 最大 64 KB。非法 JSON、重复规则 ID、无效正则、越界层级或不支持的字段值会在保存或试扫描时给出明确错误。

#### 元数据高级配置

路径还可以选择元数据识别方式，并在“元数据高级配置”中指定来源、优先级和覆盖策略：

```json
{
  "version": 1,
  "sources": ["smanga", "series-json", "comicinfo"],
  "precedence": ["smanga", "series-json", "comicinfo"],
  "overwriteExisting": false,
  "maxFileBytes": 1048576
}
```

| 字段 | 说明 |
| --- | --- |
| `sources` | 启用的来源：`smanga`、`series-json`、`comicinfo`；空数组表示不读取元数据 |
| `precedence` | 来源优先顺序，只能包含 `sources` 中已启用的值；漫画级 `.smanga` 与 `series.json` 冲突时按此顺序选择 |
| `overwriteExisting` | `true` 允许扫描时覆盖已有元数据；`false` 保留已入库数据 |
| `maxFileBytes` | 单个元数据文件的读取上限，范围 1024～10485760 字节，默认 1048576（1 MB） |

`ComicInfo.xml` 属于章节级元数据；`.smanga` 和 `series.json` 属于漫画级元数据。高级配置留空时，系统根据所选元数据识别方式生成默认配置。

#### 管理与回退

- 自定义模板和元数据高级配置都保存在具体媒体路径上；当前没有全局模板库，需要复用时可复制 JSON 到其他路径。
- 修改规则后应重新执行试扫描。只有保存后的配置才会用于正式扫描。
- 在 **服务器设置** 中可将扫描引擎切换为 `template-v2`（推荐）、`template-v1` 或 `legacy`。
- `template-v2` 支持自动混合目录识别；`template-v1` 的自动模式只为整条路径选择一个内置模板；`legacy` 完全使用旧扫描器，不应用自定义模板，可用于紧急回退。

### 添加书签

阅读时, 点击屏幕靠上30%的区域, 可以呼出顶栏, 最右侧为添加书签按钮. 之后再书签管理界面可以查看到.

### 切换浏览模式

顶栏有切换模式的选择框, 可切换单页双页与条漫模式.

### 阅读界面的使用

![](https://github.com/lkw199711/smanga/raw/master/src/assets/readme/smanga-operation.PNG)

为最大程度的使用屏幕, 我采用了这种所有的除图片元素外都可隐藏的交互界面.


## 外部支持

Smanga 内置了 **OPDS (Open Publication Distribution System) 1.2** 协议支持, 您可以使用任意兼容 OPDS 的第三方漫画/电子书阅读器 (例如 **可达漫画 / Chunky Comic Reader / Panels / KyBook / Thorium / Foliate**) 直接订阅您的漫画库并在线阅读, 无需再手动下载整本漫画.

### 功能概览

- 完整目录浏览: 媒体库 → 漫画 → 章节, 全部支持分页
- 搜索 (OpenSearch) / 最新更新 / 我的收藏 三个专用入口
- 章节下载: 压缩包直接下载; 图片目录型章节自动打包为 CBZ
- **OPDS-PSE 流式翻页**: 支持按页请求, 边下边看, 可通过 `width` 参数动态缩图以节省流量
- HTTP Basic Auth 鉴权, 沿用现有 smanga 账号
- 媒体库权限过滤: 第三方客户端看到的内容与该用户在 Web 端一致

### 开启方式

OPDS 默认已开启, 相关配置位于 `/data/config/smanga.json` (Windows 为项目目录下的 `data/config/smanga.json`) 的 `opds` 节, 修改后无需重启服务即可生效:

```json
{
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
}
```

> 老版本通过 `.env` 里 `OPDS_ENABLED / OPDS_PAGE_SIZE / OPDS_BASE_URL` 配置的方式已废弃, 升级后这些变量会被忽略, 请将配置迁移到 `smanga.json` 的 `opds` 节.

### 订阅地址

在第三方阅读器中选择 "添加 OPDS 目录 / Add OPDS Catalog", 填写以下信息:

- **URL**: `http(s)://<你的smanga地址>/opds`
- **用户名 / 密码**: 您的 smanga 登录账号

示例:

- `http://192.168.1.10:9797/opds`
- `https://manga.example.com/opds`

### 可用接口一览

| 路径 | 说明 |
| --- | --- |
| `/opds` | 根目录 (Catalog 入口, 客户端填这个即可) |
| `/opds/libraries` | 媒体库列表 |
| `/opds/libraries/:mediaId` | 某媒体库下的漫画列表 (分页) |
| `/opds/manga/:mangaId` | 某漫画下的章节列表 (分页) |
| `/opds/chapter/:chapterId` | 章节详情 entry |
| `/opds/chapter/:chapterId/download` | 下载章节 (zip/cbz/pdf 直接流式; 图片目录打包为 CBZ) |
| `/opds/chapter/:chapterId/page/:page` | PSE 流式翻页, 支持 `?width=1080` 按需缩图 |
| `/opds/chapter/:chapterId/cover` | 章节封面 |
| `/opds/manga/:mangaId/cover` | 漫画封面 |
| `/opds/search?q=关键词` | 全库搜索 |
| `/opds/opensearch.xml` | OpenSearch 描述文档 (客户端自动发现) |
| `/opds/latest` | 最新更新 Feed |
| `/opds/collects` | 我的收藏 Feed |

### 常见问题

- **客户端提示 401 / 无法登录?** 请确认账号密码正确, 并且 `smanga.json` 中 `opds.enabled` 未被设为 `0`. 使用反向代理时需保留 `Authorization` 请求头.
- **下载目录型章节为何是 CBZ 文件?** 对于图片目录章节 (非压缩包), Smanga 会即时将其中图片按顺序打包为 CBZ 返回, 绝大多数漫画阅读器均可直接识别.
- **压缩包章节第一次打开较慢?** PSE 翻页在首次访问压缩包章节时会触发一次同步解压并写入缓存, 后续访问直接命中缓存. PDF 章节不支持流式翻页, 请使用下载方式阅读.
- **想节省流量 / 加速移动网络阅读?** 支持 PSE 的客户端会自动在请求 URL 中带上 `width` 参数; 也可手动访问 `/opds/chapter/<id>/page/1?width=1080` 测试效果.


### Homepage 仪表盘集成

Smanga 同时提供了对 [Homepage (gethomepage.dev)](https://gethomepage.dev/) 的原生适配, 通过其 [`customapi`](https://gethomepage.dev/widgets/services/customapi/) 组件即可把漫画库的统计数据 (媒体库 / 漫画 / 章节 / 标签 / 用户 / 今日阅读量 等) 直接展示到您的 Homepage 首页.

#### 开启方式

在服务端 `.env` 中配置一个自定义 apikey (可选, 留空则不校验; 建议仅在本地调试时留空):

```env
# Homepage customapi 鉴权密钥 (推荐设置)
HOMEPAGE_API_KEY=your-random-key-here
```

接口地址: `GET http(s)://<你的smanga地址>/homepage/statistic`, 支持以下三种鉴权方式之一:

- Query 参数: `?apikey=your-random-key-here`
- 请求头: `X-API-Key: your-random-key-here`
- 请求头: `Authorization: Bearer your-random-key-here`

#### Homepage 配置示例 (services.yaml)

将下面片段粘贴到 Homepage 配置目录的 `services.yaml` 中, 替换域名与 apikey 后即可生效:

```yaml
- 漫画:
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
              label: 最新入库
```

> `mappings.field.data` 支持任意在响应 `data` 对象下的字段; `format` 可选 `number / float / percent / bytes / date / relativeDate / text`, 更多用法请参考 [Homepage customapi 官方文档](https://gethomepage.dev/widgets/services/customapi/).

#### 响应字段一览

接口返回体结构为 `{ code, data: { ... }, message }`, 下表列出 `data` 中可用的字段 (均为扁平结构, 可直接用于 mappings):

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `media_count` | number | 媒体库数量 (未删除) |
| `manga_count` | number | 漫画数量 (未删除) |
| `chapter_count` | number | 章节数量 (未删除) |
| `tag_count` | number | 标签数量 |
| `user_count` | number | 用户数量 |
| `collect_count` | number | 收藏数量 |
| `bookmark_count` | number | 书签数量 |
| `history_count` | number | 阅读历史总数 |
| `today_views` | number | 今日阅读次数 (按 history 记录) |
| `week_views` | number | 近 7 天阅读次数 |
| `latest_manga` | string | 最新入库漫画名称 |
| `latest_manga_time` | datetime \| null | 最新入库漫画的创建时间 (ISO) |
| `latest_chapter` | string | 最新入库章节名称 |
| `latest_chapter_time` | datetime \| null | 最新入库章节的创建时间 (ISO) |
| `server_time` | string | 服务器当前时间 (ISO 8601) |

> 提示: 为方便 Homepage 调用, 该接口走独立的 `apikey` 校验, 不经过前端登录态; 请务必设置 `HOMEPAGE_API_KEY` 并仅在内网或反向代理后暴露.


## 初衷

> **励志做最好的流媒体漫画阅读平台!**


貌似并没有这么多人有流媒体漫画需求, 我开发这东西的本意就是填补一个流媒体功能的空白.

如果你有大量的漫画资源, 却不能够随意预览观看, 那一定不是一件很舒服的事情. 

于是乎, 当时我面临这种情况, 简单的开发了一款能够阅读条漫的浏览器.

后续熟练使用emby plex后, 对于这种流媒体服务已经形成依赖, 然而让我很不解的是, 这些优秀的流媒体产品并没有阅读漫画的功能. 我就将阅读器简单更改了一下, 添加了配置路径的功能, 形成了这款smanga.


## 产品局限性

由于开发时间仓促，本产品有着很多缺点，请在使用时注意。

测试工作未能完善，如有bug请提交issues或加群反馈。谢谢！

### 虽然为条漫开发, 但是并不支持长图条漫(需裁切)

我们使用的是web浏览器，每一条http请求受限于网络原因，是有容量限制的，大家在网上拿资源，经常会拿到长图条漫，也就是整图。1w px的长度，这样的图片容量5m起步，浏览器是不能够正常加载的。

**我当时测试的情况是，内网可以用，外网看不了。**

[^那如何处理长图问题呢.]: 将长图裁切为短图, 可以使用本人的裁切工具, 这个待我整理后发布. 后续考虑加入长图支持, 我有思路去处理这个问题, 但是那种方案太耗费cpu性能了......


## 最后

**如果产品有帮助到您, 请给一颗star以示鼓励.**

**如果您有意见或建议, 请提交issues或pr, 亦或是加入群聊联系我.**

或许有漫画流媒体需求的人不多, 但是一旦您有观看的需要, 就很难被满足, 因为这个东西并不像emby一样形成了生态. 资源也不太好找. 

我的愿景是聚集相同爱好的人们, 形成俱乐部.

> **您可以加入smanga交流群**: 

QQ 交流群：[534086782](https://jq.qq.com/?_wv=1027&k=CaeWd6im)

Telegram 交流群：https://t.me/+FFgQ7AMIdrg2M2Y1

版本发布频道(tg)：https://t.me/smangachannel


## 版本更新记录

- 1.0 基础版。
  - 1.1 列表页面手机端样式支持修正。
  - 1.2 分页功能添加。
  - 1.4 搜索功能添加。
- 2.0 支持pdf阅读。
- 3.0 新增数据库 多格式支持 以及多项新功能。
  - 3.1.0 提供app sql下载。
    - 3.1.4 添加7z,修复shell参数。
    - 3.1.5 条漫模式新增书签支持。
    - 3.1.6 新增用户权限管理。
    - 3.1.7 外置sql设置错误问题。
    - 3.1.8 新增视图切换功能, 解决文字展示不全的问题。
    - 3.1.9 新增排序方式切换功能。
  - 3.2.0 新增搜索功能；处理扫描错误。
    - 3.2.1 新增用户设置模块。
    - 3.2.2 修复缓存与排序的bug。
    - 3.2.3 新增收藏模块。
    - 3.2.4 修改数据库以适配表情文字。
    - 3.2.5 修改初始化流程
    - 3.2.6 新增对半裁切模式
    - 3.2.8 新增图片下载功能
    - 3.2.9 分页浏览模式新增图片缓存
  - 3.3.0 使用laravel重构项目,并优化排序功能
    - 3.3.1 新增websocket功能,进行解压成功通知
    - 3.3.2 新增日志模块
    - 3.3.3 扫描系统做节流处理
    - 3.3.4 新增自动扫描时间设置
    - 3.3.5 修复扫描压缩文件错误
    - 3.3.6 紧急修复403错误
    - 3.3.7 新增标签功能
    - 3.3.8 新增漫画信息展示页面, 元数据扫描
    - 3.3.9 漫画管理新增搜索框
  - 3.4.0 扫描时自动解压章节
    - 3.4.1 临时增加登出按钮
    - 3.4.2 移动端滑动翻页功能
    - 3.4.3 章节管理新增搜索框
    - 3.4.4 修复解压路径获取错误的问题
    - 3.4.5 漫画详情页面新增收藏按钮
    - 3.4.6 pageSize逻辑调整
    - 3.4.7 切换章节错误bug修复
    - 3.4.8 新增"继续阅读模块",准确定位"继续阅读"功能.
    - 3.4.9 修复在列表模式下无法上下滚动的bug.
  - 3.5.0 菜单分类并修改图表.
    - 3.5.1 扫描时自动提取封面.
    - 3.5.2 目录扫描方法替换.
    - 3.5.3 散图漫画封面删除bug修复.
    - 3.5.4 新增漫画排序逻辑.
    - 3.5.5 散图获取封面bug修复.
    - 3.5.7 完善图片错误处理.
    - 3.5.8 主页增加图表.
    - 3.5.9 修复任务队列 压缩拼写.
  - 3.6.0 封面图片缓存,添加骨架屏动画.
    - 3.6.1 新增任务展示列表.
    - 3.6.2 支持ssl证书设置.
    - 3.6.3 存储封面时将进行压缩.
    - 3.6.4 修复ssl证书路径回显以及封面压缩大小设置.
    - 3.6.5 新增文件保存时长设置.
    - 3.6.6 页码文字增加阴影.
    - 3.6.7 二级目录展示,繁简体搜索兼容.
    - 3.6.8 登录封面修改,给出了几个svg图以供选择.
    - 3.6.9 修复书签bug.
  - 3.7.0 产出exe文件,后端改用nodejs

## 开发注意事项

此项目使用nodejs16运行,请注意版本
