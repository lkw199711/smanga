



# Smanga

[![Build Smanga Alpha Docker](https://github.com/lkw199711/smanga/actions/workflows/docker_alpha.yml/badge.svg)](https://github.com/lkw199711/smanga/actions/workflows/docker_alpha.yml) [![Build Smanga Base Docker](https://github.com/lkw199711/smanga/actions/workflows/docker_base.yml/badge.svg)](https://github.com/lkw199711/smanga/actions/workflows/docker_base.yml) [![Build Smanga Beta Docker](https://github.com/lkw199711/smanga/actions/workflows/docker_beta.yml/badge.svg)](https://github.com/lkw199711/smanga/actions/workflows/docker_beta.yml) [![Build Smanga Docker](https://github.com/lkw199711/smanga/actions/workflows/docker.yml/badge.svg)](https://github.com/lkw199711/smanga/actions/workflows/docker.yml)

无需配置，docker直装的漫画流媒体阅读工具。

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
    - [添加书签](#添加书签)
    - [切换浏览模式](#切换浏览模式)
    - [阅读界面的使用](#阅读界面的使用)
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


## 安装

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
      - 9798:80
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
      - 9798:80
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

### 添加书签

阅读时, 点击屏幕靠上30%的区域, 可以呼出顶栏, 最右侧为添加书签按钮. 之后再书签管理界面可以查看到.

### 切换浏览模式

顶栏有切换模式的选择框, 可切换单页双页与条漫模式.

### 阅读界面的使用

![](https://github.com/lkw199711/smanga/raw/master/src/assets/readme/smanga-operation.PNG)

为最大程度的使用屏幕, 我采用了这种所有的除图片元素外都可隐藏的交互界面.


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