# 存储提供商图标

此目录用于保存“存储根”预设所使用的本地图标资源。图标会随前端构建产物一起打包，后端数据库只保存对应的 `iconKey`。

## 建议文件名

```text
115生活.png
123云盘.png
阿里云盘.png
百度网盘.png
夸克网盘.png
Microsoft OneDrive.png
```

当前界面已经适配以上文件名。新增或改名后，需要同步更新 `src/constants/storage-root.ts` 中的导入与 `iconKey` 映射。

## 建议规格

- 优先使用 SVG。
- PNG 建议使用透明背景。
- 建议画布为正方形，例如 128×128 或 256×256。
- 文件名使用小写英文字母、数字和短横线。
- 不要直接引用远程图片 URL。
- 请确认图标素材的使用许可。

图标文件放入后，还需要在 `src/constants/storage-root.ts` 中建立 `iconKey` 到资源文件的映射。
