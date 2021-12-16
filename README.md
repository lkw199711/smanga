# smanga

无需配置，docker直装的漫画流媒体阅读工具。

以emby plex为灵感，为解决条漫阅读需求而开发的漫画阅读器。

## 安装

docker（推荐）镜像仅38M

```dockerfile
docker run --name smanga -itd -p 8080:80 -v /your-route/config:/config smanga:laster
```

LNMP环境安装

安装宝塔面板或是其他web环境（支持php），然后将web项目放入站点目录即可。

### 使用

