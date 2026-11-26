# Smanga 存储根功能完整计划

> 文档状态：方案讨论稿  
> 目标版本：新版本  
> 适用范围：新建媒体库  
> 主要场景：飞牛 fnOS 网盘挂载目录变化、跨硬盘移动、NAS 与远程挂载

## 1. 背景

Smanga 当前将媒体库路径、漫画路径、章节路径和部分元数据文件路径保存为绝对路径。漫画资源移动到另一块硬盘，或者飞牛 fnOS 重新挂载网盘后，外层目录可能发生变化，而漫画目录内部结构通常保持不变。

例如：

```text
原位置：/vol1/001media/manga/漫画A/第01话
新位置：/vol2/资源/manga/漫画A/第01话
```

真正变化的是：

```text
/vol1/001media
→
/vol2/资源
```

稳定不变的是：

```text
manga/漫画A/第01话
```

本功能将变化的外层目录定义为“存储根”，将漫画库内部路径保存为相对路径。用户以后只需要修改存储根的真实挂载目录，所有绑定该存储根的媒体库即可恢复访问。

## 2. 已确认的产品决策

1. 存储根功能只服务于新版本中新建的媒体库。
2. 不迁移旧媒体库数据。
3. 旧媒体库继续按照数据库中的绝对路径读取。
4. 新建独立的 `storageRoot` 表管理存储根。
5. `path` 表通过 `storageRootId` 外键绑定存储根。
6. 新媒体库的 `pathContent` 及其漫画资源路径保存为相对于存储根的路径。
7. 不将 `${root:xxx}` 一类文本占位符作为数据库权威格式。
8. 占位符可以用于界面展示，但数据库关系以外键为准。
9. 新建存储根时提供 115 网盘等预设，也允许完全自定义。
10. 预设只负责自动填充表单，不直接创建系统级数据库记录。

## 3. 目标

- 修改一条存储根记录即可切换其下所有新媒体库的实际访问位置。
- 支持一个 Smanga 实例配置多个存储根。
- 支持本地硬盘、飞牛网盘挂载、NAS、SMB、WebDAV 挂载目录及其他自定义目录。
- 支持 Windows、Linux 和 Docker 容器内路径。
- 存储根临时离线时保留漫画数据，不将离线误判为文件被删除。
- 修改存储根后不需要重新建立漫画、收藏、标签和阅读历史。
- 增量扫描不会因为真实挂载路径变化而创建重复漫画。
- 文件读取、元数据加载、扫描、压缩和删除使用同一套路径解析规则。

## 4. 非目标

第一版不处理以下内容：

- 不自动迁移旧媒体库的绝对路径。
- 不自动识别旧路径属于哪个存储根。
- 不直接连接 115、阿里云盘等网盘开放 API。
- 不负责执行网盘挂载；Smanga 只使用操作系统或容器中已经挂载好的目录。
- 不在数据库中保存网盘账号、Cookie、Token 或密码。
- 不在第一版支持用户上传任意图标文件或外部图标 URL。
- 不把 Smanga 自己的海报缓存、解压缓存、头像和日志目录纳入媒体存储根。

## 5. 核心术语

### 5.1 存储根

用户可管理的真实文件系统根目录，例如：

```text
/vol2/资源
/mnt/115
D:\Media
\\nas\manga
```

### 5.2 相对资源路径

相对于存储根保存的漫画资源路径，例如：

```text
manga
manga/漫画A
manga/漫画A/第01话
manga/漫画A/.smanga/banner.jpg
```

### 5.3 解析路径

把存储根和相对资源路径安全拼接后得到的实际访问路径：

```text
存储根：/vol2/资源
相对路径：manga/漫画A/第01话
解析结果：/vol2/资源/manga/漫画A/第01话
```

### 5.4 旧路径模式

当 `path.storageRootId` 为空时，路径属于旧媒体库，系统继续把原字段解释为绝对路径。

### 5.5 存储根模式

当 `path.storageRootId` 不为空时，路径属于新媒体库，系统把漫画资源路径解释为相对于该存储根的路径。

## 6. 存储根预设设计

### 6.1 预设的职责

新建存储根时，界面首先展示常用类型卡片：

- 115 网盘
- 阿里云盘
- 百度网盘
- SMB / NAS
- WebDAV 挂载
- 本地磁盘
- 自定义

第一版可以只内置已经确认需要的预设，例如“115 网盘”和“自定义”，其他选项以后通过前端升级增加。

用户选择“115 网盘”后自动填充：

```text
providerKey = 115
rootName = 115 网盘
iconKey = provider-115
```

真实挂载路径 `rootPath` 不应盲目写死。不同飞牛设备、用户和挂载任务的实际目录可能不同，界面应提供示例、目录选择或手工粘贴，并要求用户确认。

### 6.2 预设的存放位置

预设是产品提供的表单模板，建议放在前端或前后端共享的常量配置中，例如：

```ts
type StorageRootPreset = {
  providerKey: string
  name: string
  iconKey: string
  pathPlaceholder?: string
  description?: string
}
```

预设不写入 `storageRoot` 表。只有用户确认创建后，最终表单内容才写入数据库。

这样设计的原因：

- 后续版本可以直接增加新的网盘预设。
- 修改预设默认名称不会修改用户已有存储根。
- 用户可以在选中预设后继续修改名称和图标。
- 数据库只保存真实用户配置，不保存未使用的模板。

### 6.3 自定义模式

选择“自定义”时默认填写：

```text
providerKey = custom
iconKey = storage-folder
```

用户填写或选择：

- 存储根名称
- 当前挂载路径
- 图标
- 可选说明

## 7. `storageRoot` 表字段

### 7.1 最终建议字段

| 字段 | Prisma 类型 | 必填 | 默认值 | 用途 |
| --- | --- | --- | --- | --- |
| `storageRootId` | `Int` | 是 | 自增 | 主键，供 `path` 表建立外键关系 |
| `rootKey` | `String` | 是 | 创建时生成 | 稳定、不可变的机器标识，便于日志、导入导出和未来接口使用 |
| `rootName` | `String` | 是 | 无 | 用户看到的存储根名称，可以修改 |
| `providerKey` | `String` | 是 | `custom` | 来源类型，如 `115`、`smb`、`local`、`custom` |
| `iconKey` | `String` | 是 | `storage-folder` | 前端内置图标标识，不保存图片二进制 |
| `rootPath` | `String` | 是 | 无 | 当前真实挂载目录或物理根路径 |
| `enabled` | `Int` | 是 | `1` | 是否允许该存储根参与读取、扫描和任务执行 |
| `description` | `String?` | 否 | `null` | 用户备注，例如挂载来源或用途 |
| `lastCheckStatus` | `String` | 是 | `unknown` | 最近一次检测结果：`unknown`、`available`、`unavailable` |
| `lastCheckTime` | `DateTime?` | 否 | `null` | 最近一次主动检测时间 |
| `lastCheckMessage` | `String?` | 否 | `null` | 最近一次检测失败原因或简短诊断信息 |
| `deleteFlag` | `Int` | 是 | `0` | 软删除标记，与项目现有数据风格保持一致 |
| `createTime` | `DateTime` | 是 | `now()` | 创建时间 |
| `updateTime` | `DateTime` | 是 | `now()` / `@updatedAt` | 修改时间 |

### 7.2 字段约束

#### `rootKey`

- 全局唯一。
- 创建后不可修改。
- 建议由后端根据名称生成，并在冲突时追加短随机串。
- 只允许小写字母、数字、短横线和下划线。
- 建议长度 2～64。
- 示例：`115-main`、`local-media`、`nas-manga-a`。

`rootKey` 不参与文件路径拼接，也不替代 `storageRootId` 外键。它主要用于可读日志、备份导出和未来跨实例配置映射。

#### `rootName`

- 必填，去除首尾空格。
- 建议长度 1～100。
- 允许用户自由修改。
- 不要求全局唯一；界面可以同时显示名称和 `rootKey` 避免混淆。

#### `providerKey`

- 必填，使用字符串而不是数据库枚举，方便后续增加新预设并兼容 SQLite、MySQL 和 PostgreSQL。
- 初始可识别值：`115`、`aliyun-drive`、`baidu-netdisk`、`smb`、`webdav`、`local`、`custom`。
- 未识别的值按 `custom` 能力处理，不能阻断旧版本升级。
- `providerKey` 仅描述来源，不包含账号或认证信息。

#### `iconKey`

- 保存前端内置图标资源的键，例如 `provider-115`、`storage-nas`、`storage-folder`。
- 选择预设时自动填充，用户可以从允许的图标列表中修改。
- 后端只校验长度和基础字符，不应与某个前端版本的图标集合强耦合。
- 前端遇到未知图标时回退到 `storage-folder`。

#### `rootPath`

- 保存当前真实的绝对目录。
- 去除无意义的尾部分隔符，但保留文件系统根路径所需的分隔符。
- 禁止保存 `${root:xxx}` 等占位符。
- 禁止保存相对路径。
- Windows 允许盘符路径和 UNC 路径。
- Linux/Docker 要求以 `/` 开头。
- 数据库字段不建立索引，MySQL 建议使用 `Text`，避免 191 字符索引限制。
- 创建和修改时提供“测试路径”操作。
- 为适应远程挂载暂时离线，允许用户在确认警告后保存当前不可访问的目录。

#### 健康检查字段

`lastCheckStatus`、`lastCheckTime`、`lastCheckMessage` 只是最近一次检测快照，不是实时真相，也不能代替执行文件操作前的实际检查。

### 7.3 不存入表中的信息

以下信息不进入 `storageRoot` 表：

- 115 或其他网盘账号。
- Cookie、Token、密码、刷新令牌。
- 网盘挂载进程配置。
- 预设的介绍文本和推荐路径示例。
- 实时剩余容量；需要时动态读取。
- 实时在线状态；列表展示可以按需检测或使用最近检测快照。

### 7.4 Prisma 结构草案

SQLite/PostgreSQL 的概念结构：

```prisma
model storageRoot {
  storageRootId   Int       @id @default(autoincrement())
  rootKey         String    @unique(map: "uniqueStorageRootKey")
  rootName        String
  providerKey     String    @default("custom")
  iconKey         String    @default("storage-folder")
  rootPath        String
  enabled         Int       @default(1)
  description     String?
  lastCheckStatus String    @default("unknown")
  lastCheckTime   DateTime?
  lastCheckMessage String?
  deleteFlag      Int       @default(0)
  createTime      DateTime  @default(now())
  updateTime      DateTime  @default(now()) @updatedAt
  paths           path[]
}
```

MySQL 中长文本字段建议映射：

```prisma
rootPath         String  @db.Text
description      String? @db.Text
lastCheckMessage String? @db.Text
```

实际迁移时需要分别修改项目现有的 SQLite、MySQL 和 PostgreSQL Prisma schema 与 migration。

## 8. `path` 表调整

### 8.1 新增字段和关系

```prisma
model path {
  pathId        Int          @id @default(autoincrement())
  mediaId       Int
  storageRootId Int?
  pathContent   String

  media         media        @relation(fields: [mediaId], references: [mediaId])
  storageRoot   storageRoot? @relation(fields: [storageRootId], references: [storageRootId])
}
```

### 8.2 字段语义

```text
storageRootId 为空：
pathContent 是旧媒体库绝对路径。

storageRootId 不为空：
pathContent 是相对于 storageRoot.rootPath 的资源路径。
```

示例：

```text
storageRoot.rootPath = /vol2/资源
path.storageRootId = 12
path.pathContent = manga

实际扫描路径 = /vol2/资源/manga
```

### 8.3 新建媒体库约束

- 新版本中新建媒体库时，至少一个路径必须绑定存储根。
- 新建路径接口必须提交 `storageRootId`。
- `pathContent` 必须是相对路径。
- 旧媒体库的路径记录保持 `storageRootId = null`。
- 旧媒体库编辑不会被强制转换为存储根模式。
- 不允许通过普通更新接口在“绝对路径模式”和“存储根模式”之间切换，以免产生半迁移数据。

### 8.4 路径唯一性

当前唯一约束是：

```text
(mediaId, pathContent)
```

存储根模式下应调整为：

```text
(mediaId, storageRootId, pathContent)
```

因为两个存储根都可能存在相同的相对路径 `manga`。

`storageRootId = null` 在 SQLite、MySQL、PostgreSQL 的组合唯一约束中存在不同细节。计划采用以下策略：

1. 数据库为存储根模式建立组合唯一约束。
2. 控制器继续对旧绝对路径执行应用层重复校验。
3. 编写三种数据库的迁移测试，确认旧数据不会因约束变化而失败。
4. 如果跨数据库行为不能保持一致，再为旧路径使用数据库专属的部分索引或生成列方案。

## 9. 新媒体库资源路径规则

仅仅让 `pathContent` 变成相对路径还不够。新媒体库扫描产生的其他资源路径也必须保持相对，否则修改存储根后漫画和章节仍会指向旧绝对位置。

建议新媒体库保存：

```text
path.pathContent
manga

manga.mangaPath
manga/漫画A

manga.parentPath
manga

chapter.chapterPath
manga/漫画A/第01话

meta.metaFile
manga/漫画A/.smanga/banner.jpg

漫画源封面
manga/漫画A/cover.jpg
```

以下路径不属于存储根：

- `data/poster` 下复制或压缩后的海报。
- `data/compress` 下的临时解压目录。
- 头像、日志、配置和应用缓存。
- APK 等应用文件。

`mangaCover`、`chapterCover` 当前可能同时表示漫画源文件或 Smanga 内部海报文件。实施前需要给路径解析函数传入明确的路径类别，或在数据返回层区分“媒体资源路径”和“应用内部路径”，不能无条件添加存储根。

## 10. 统一路径解析服务

新增后端服务，例如：

```text
app/services/storage_root_service.ts
app/services/library_path_service.ts
```

核心接口建议：

```ts
resolvePathRecord(pathRecord): string
resolveLibraryPath(relativePath, storageRoot): string
toRelativeLibraryPath(absolutePath, storageRoot): string
assertInsideStorageRoot(absolutePath, storageRoot): void
checkStorageRoot(storageRootId): StorageRootCheckResult
```

### 10.1 读取规则

```ts
if (pathRecord.storageRootId === null) {
  return storedPath // 旧媒体库绝对路径
}

return safeJoin(pathRecord.storageRoot.rootPath, storedPath)
```

### 10.2 扫描写入规则

1. 读取 `storageRoot.rootPath`。
2. 与 `path.pathContent` 拼接得到真实扫描目录。
3. 扫描器在真实目录中发现漫画和章节。
4. 写数据库前，统一转换成相对于存储根的路径。
5. 禁止把扫描得到的真实绝对路径直接写入新媒体库记录。

这样修改存储根后再次增量扫描，数据库仍使用同一组相对路径，不会创建重复漫画。

### 10.3 缓存

- 可以按 `storageRootId` 缓存启用状态和 `rootPath`。
- 更新或删除存储根后必须主动清除对应缓存。
- 缓存只用于减少查询，不能绕过路径安全校验。

## 11. 后端接口计划

建议新增管理员接口：

```text
GET    /storage-root
GET    /storage-root/:storageRootId
POST   /storage-root
PUT    /storage-root/:storageRootId
DELETE /storage-root/:storageRootId
POST   /storage-root/check
POST   /storage-root/:storageRootId/check
GET    /storage-root/:storageRootId/paths
```

### 11.1 列表接口

返回：

- 存储根基本字段。
- 绑定路径数量。
- 绑定媒体库数量。
- 最近检测状态。
- 当前请求时是否需要重新检测，由查询参数控制。

默认不对每一行执行阻塞式文件系统检测，避免远程挂载离线时拖慢整个管理页。

### 11.2 创建接口

校验：

- 管理员权限。
- `rootKey` 唯一或由后端生成。
- `rootName`、`providerKey`、`iconKey` 合法。
- `rootPath` 是绝对路径。
- 路径规范化后不能与未删除存储根重复。
- 可选择立即执行可访问性检测。

路径不可访问时返回检测结果和警告。用户明确确认后可以保存，便于先配置、后挂载。

### 11.3 更新接口

允许修改：

- `rootName`
- `providerKey`
- `iconKey`
- `rootPath`
- `enabled`
- `description`

禁止修改：

- `storageRootId`
- `rootKey`
- 创建时间
- 客户端直接伪造健康检查字段

修改 `rootPath` 后：

1. 清除路径解析缓存。
2. 执行可选健康检查。
3. 不批量更新漫画、章节和元数据路径。
4. 不自动触发重扫。

### 11.4 删除接口

- 使用软删除。
- 存在未删除的 `path` 绑定时默认禁止删除。
- 管理界面提示绑定的媒体库和路径。
- 禁止通过删除存储根级联删除漫画实体文件。
- 如需强制解绑或迁移，未来提供单独操作，不复用普通删除接口。

### 11.5 检测接口

检测内容：

- 目录是否存在。
- 是否为目录。
- 是否可读取。
- 可选：是否可写；只做安全的临时文件测试，并由用户主动触发。
- 返回规范化后的路径和错误类型。

建议状态码：

```text
AVAILABLE
NOT_FOUND
NOT_DIRECTORY
PERMISSION_DENIED
MOUNT_UNAVAILABLE
INVALID_PATH
TIMEOUT
UNKNOWN_ERROR
```

## 12. 前端界面计划

### 12.1 存储根管理页

增加管理入口“存储位置”或“存储根”。

列表展示：

- 图标。
- 名称。
- 类型。
- 当前真实路径。
- 启用状态。
- 最近检测状态和时间。
- 绑定媒体库/路径数量。
- 编辑、检测、删除操作。

### 12.2 新建存储根

第一步选择预设：

```text
[115 网盘] [阿里云盘] [SMB / NAS] [本地磁盘] [自定义]
```

第二步编辑统一表单：

```text
类型：115 网盘
名称：115 网盘
图标：115
当前挂载路径：[________________]
标识：115-main（高级设置，可自动生成）
说明：[________________]
启用：[是]
```

操作按钮：

- 测试路径。
- 保存。
- 取消。

选择预设后用户仍可修改名称和图标。

### 12.3 自定义表单

自定义模式不要求用户理解提供商枚举，只展示：

- 名称。
- 图标选择。
- 当前路径。
- 可选说明。

系统内部自动使用 `providerKey = custom`。

### 12.4 新建媒体库

新建媒体库时：

1. 选择已有存储根，或在弹窗内新建存储根。
2. 填写存储根下的相对媒体路径。
3. 实时显示解析预览。
4. 测试最终目录。
5. 创建媒体库并开始扫描。

示例：

```text
存储根：115 网盘 (/vol2/资源)
相对路径：manga
实际路径预览：/vol2/资源/manga
```

表单禁止把绝对路径写入新媒体库的相对路径字段。

### 12.5 路径展示

普通界面优先显示逻辑形式：

```text
115 网盘 › manga › 漫画A
```

管理员详情中同时显示：

```text
相对路径：manga/漫画A
实际路径：/vol2/资源/manga/漫画A
```

不要把 `{root:12}` 形式写回数据库；如需要，可以只作为界面格式化结果。

## 13. 现有模块改造范围

### 13.1 必须接入路径解析的后端模块

- 路径创建、预览、扫描和重新扫描。
- 漫画扫描与章节发现。
- 漫画元数据和章节元数据加载。
- 图片章节读取。
- ZIP、CBZ、CBR、RAR、7Z、PDF、EPUB 读取。
- 漫画封面、章节封面和侧挂图片读取。
- 文件下载接口及允许路径校验。
- 漫画、章节和路径的实体文件删除。
- 压缩、解压和缓存任务。
- 媒体库海报生成。
- P2P 清单生成、分享和接收。
- 定时扫描和任务队列参数。
- 扫描报告中的显示路径。

### 13.2 前端影响模块

- 媒体库创建和编辑。
- 路径管理。
- 漫画与章节详情。
- 阅读器文件请求。
- 封面选择。
- 扫描预览和扫描报告。
- P2P 接收路径选择。
- TypeScript API 类型。

### 13.3 API 路径数据

不建议前端长期依赖数据库中的原始路径字段。后端响应可逐步区分：

```text
relativePath：数据库保存的相对路径
resolvedPath：管理员可见的当前实际路径
displayPath：面向普通界面的逻辑展示路径
fileRef：供文件接口使用的不透明引用（后续可选）
```

第一版若继续让前端传递路径给 `/file`，后端也必须根据媒体库上下文解析和校验，不能相信客户端提交的绝对路径。

### 13.4 封面与元数据图片响应

- 绑定存储根的漫画和章节将普通源封面及库内元数据图片保存为相对路径。压缩包提取的封面、超出大小限制的封面和原有云盘缓存规则继续使用应用海报目录。绑定存储根本身不触发复制。
- 漫画和章节的详情、列表、搜索、收藏、历史等接口在返回前，将 `mangaCover`、`chapterCover`、`metaFile` 解析为当前可供文件接口使用的绝对路径。前端把响应中的值原样传给图片接口。后台服务读取数据库记录时，继续通过统一路径服务解析。
- 每次响应批量读取涉及的 `pathId` 和存储根，同一存储根在本次响应内复用。已有绝对路径直接返回。存储根缺失、停用或相对路径无效时，对应文件字段返回空值，其余记录照常显示。
- 编辑表单使用数据库中的相对漫画路径和章节路径。前端选择元数据图片作为封面时，后端将回传的根内绝对路径转换为相对路径再写入。已保存的海报缓存仍可读取，后续按原有封面重载流程更新，无需批量迁移或删除缓存。

### 13.5 资源可用性与故障提示

- 存储根绑定仍由 `path.storageRootId` 表示。媒体库列表和详情在原响应中附加 `availability`，按当前媒体库的未删除扫描路径汇总。部分路径异常时标记「部分资源不可用」，所有路径都确认异常时标记「存储不可用」。未绑定的旧路径照常显示，未确认的状态不会计为故障。
- 漫画详情根据漫画的 `pathId` 检查存储根、扫描目录和漫画实体。保留详情及章节列表，显示缺失或停用的存储根、无法访问的扫描目录或缺失的漫画源文件，并提供「重新检测」。单独的封面文件缺失使用占位图。
- 漫画资源不可读取时，漫画详情和该漫画的章节列表保留文字数据，暂不下发漫画封面、章节封面和元数据图片的文件地址。页面使用占位图，取消已排队或正在加载的图片。重新检测通过后重新读取图片地址。
- 同一批请求复用短时存储根和扫描目录检测结果，检测超时返回可重试状态。漫画详情及章节读取会检查实际目标，以便发现挂载点仍然存在但内容已经不可读的情况。修改根目录后新地址立即参与检测。
- 章节读取使用明确的错误代码。存储根或扫描目录不可访问时返回 503，根与扫描目录可访问但章节文件缺失时返回 404。阅读器直接显示原因并允许重试。面向普通用户的状态消息不包含服务器绝对路径。

## 14. 旧媒体库兼容规则

### 14.1 判断方式

唯一判断条件：

```text
path.storageRootId == null
```

不要根据路径是否以 `/`、盘符或占位符开头来猜测数据类型。

### 14.2 行为

- 旧路径仍按绝对路径读取。
- 旧扫描结果仍保存绝对路径。
- 旧媒体库界面保持当前编辑方式。
- 不要求旧用户创建存储根。
- 不自动改变旧媒体库的唯一约束语义。
- 新旧媒体库可以同时存在并正常运行。

### 14.3 防止混合数据

- 新媒体库创建后不能直接清空 `storageRootId`。
- 旧媒体库不能仅通过填写 `storageRootId` 转换为新模式。
- 如未来提供迁移功能，必须使用独立迁移向导，批量转换所有相关路径并生成报告。

## 15. 路径安全

### 15.1 安全拼接

禁止使用普通字符串拼接：

```ts
rootPath + '/' + relativePath
```

必须使用平台路径工具规范化，并确认最终路径仍位于存储根中。

### 15.2 防止路径穿越

以下相对路径必须拒绝：

```text
../other
manga/../../etc
绝对盘符路径
UNC 路径（作为相对路径时）
```

### 15.3 目录包含判断

不能只使用：

```ts
resolvedFile.startsWith(resolvedRoot)
```

否则 `/mnt/manga2` 可能被错误认为位于 `/mnt/manga` 中。应使用 `path.relative()`、分隔符边界和必要的 `realpath` 检查。

### 15.4 符号链接

- 读取场景可根据产品策略允许根目录内部的符号链接。
- 删除场景必须验证最终真实路径仍位于允许的存储根中。
- 发现路径逃逸时停止操作并记录安全日志。

### 15.5 离线保护

当存储根不可访问时：

- 不把漫画标记为已删除。
- 不执行清理缺失漫画的逻辑。
- 不执行物理删除。
- 扫描任务以“存储根不可用”失败，而不是返回空扫描结果。
- 保留原数据库记录和阅读数据。

## 16. 数据库迁移计划

分别为 SQLite、MySQL、PostgreSQL 增加迁移：

1. 创建 `storageRoot` 表。
2. 为 `path` 增加可空 `storageRootId`。
3. 建立 `path.storageRootId → storageRoot.storageRootId` 外键。
4. 建立 `rootKey` 唯一索引。
5. 调整路径唯一约束。
6. 不更新任何现有 `path` 记录。
7. 所有现有记录自然保持 `storageRootId = null`。

迁移前后验证：

- 旧媒体库数量一致。
- 旧漫画、章节和元数据数量一致。
- 旧媒体库仍能扫描和阅读。
- 三种数据库都可以创建、更新和删除未绑定的存储根。
- 有绑定路径的存储根无法普通删除。

## 17. 实施阶段

### 阶段一：数据层与管理接口

- 增加三套 Prisma schema 和 migration。
- 新增存储根 validator、controller、service 和 routes。
- 新增路径检测接口。
- 给 `path` 增加 `storageRootId`。
- 完成管理员权限和软删除规则。

### 阶段二：统一路径解析

- 建立 `library_path_service`。
- 实现旧绝对路径和新相对路径双模式。
- 完成安全拼接、反向相对化和根目录校验。
- 给解析服务编写独立单元测试。

### 阶段三：扫描与元数据

- 路径预览和扫描使用解析后的真实目录。
- 新媒体库扫描结果在写库前转换为相对路径。
- 元数据文件、侧挂目录和源封面使用相对路径。
- 验证修改根目录后增量扫描不会重复创建数据。

### 阶段四：阅读与文件访问

- 图片、压缩包、PDF 和 EPUB 接入解析服务。
- 封面与元数据图片接入解析服务。
- 修正文件接口允许目录判断。
- 区分媒体资源路径和 Smanga 内部缓存路径。

### 阶段五：任务与边缘模块

- 删除、解压、压缩和海报任务。
- 定时扫描和任务队列。
- P2P 清单、分享和接收。
- 扫描报告和日志展示。

### 阶段六：前端

- 新增存储根管理页。
- 新增预设选择与自定义表单。
- 新媒体库创建流程绑定存储根。
- 增加逻辑路径、相对路径和真实路径预览。
- 增加离线状态和路径检测结果展示。

### 阶段七：回归与发布

- 覆盖三种数据库。
- 覆盖 Windows、Linux 和 Docker。
- 使用飞牛 115 网盘挂载进行真实测试。
- 验证旧媒体库完全不受影响。
- 更新用户文档和升级说明。

## 18. 测试计划

### 18.1 存储根管理

- 使用 115 预设创建存储根，名称和图标自动填充。
- 修改预设填充的名称和图标后正常保存。
- 使用自定义模式创建本地或 NAS 存储根。
- 拒绝相对 `rootPath`。
- 允许用户确认后保存暂时离线的远程目录。
- `rootKey` 冲突时给出明确错误或自动生成新键。
- 修改 `rootPath` 后解析缓存立即失效。
- 有绑定路径时禁止删除。

### 18.2 新媒体库

- 新媒体库必须选择存储根。
- 相对路径不能包含 `..` 或绝对盘符。
- 解析预览与实际扫描目录一致。
- 两个存储根可分别使用相同的相对路径 `manga`。

### 18.3 移动场景

测试步骤：

1. 存储根为 `/vol1/001media`。
2. 新建媒体路径 `manga` 并扫描。
3. 阅读漫画、加载封面与元数据。
4. 将整个目录移动到 `/vol2/资源`。
5. 只把 `storageRoot.rootPath` 改为 `/vol2/资源`。
6. 不重扫直接阅读已有漫画。
7. 执行增量扫描。

预期结果：

- 漫画、章节、收藏、标签和历史 ID 不变。
- 图片、压缩章节、PDF、封面和元数据继续可用。
- 不创建重复漫画和章节。
- 扫描报告显示新的解析路径或逻辑路径。

### 18.4 离线场景

- 飞牛网盘挂载消失时检测为不可用。
- 定时扫描失败但不删除漫画。
- 文件读取返回明确的“存储根不可用”。
- 重新挂载或修改 `rootPath` 后无需修复数据库。

### 18.5 旧媒体库回归

- 所有旧 `storageRootId = null` 记录按绝对路径工作。
- 旧媒体库新增扫描结果仍保持原有格式。
- 旧媒体库路径编辑行为不变。
- 旧媒体库和新媒体库可以同时阅读和扫描。

### 18.6 安全测试

- 拒绝 `../` 路径穿越。
- 拒绝访问相似前缀目录，例如根为 `/mnt/manga` 时访问 `/mnt/manga2`。
- 删除任务不能越过存储根。
- 符号链接逃逸时停止危险操作。
- 普通用户不能管理或检测服务器文件系统路径。

## 19. 验收标准

功能完成需要同时满足：

1. 可以通过 115 预设和自定义表单创建存储根。
2. 新建媒体库可以绑定存储根并只填写相对路径。
3. 修改 `rootPath` 后无需修改漫画、章节和元数据记录。
4. 修改存储根后无需重新扫描即可阅读已有内容。
5. 再次增量扫描不会生成重复漫画或章节。
6. 存储根离线不会导致数据库内容被清理。
7. 旧媒体库继续按绝对路径工作，行为不变。
8. SQLite、MySQL、PostgreSQL 均能完成升级和新建流程。
9. Windows、Linux、Docker 和飞牛真实挂载场景通过测试。
10. 文件读取和物理删除都通过统一路径安全校验。

## 20. 后续可扩展项

第一版稳定后可以考虑：

- 旧媒体库迁移到存储根的专用向导。
- 多个 Smanga 节点为同一逻辑存储根配置不同本机路径。
- 飞牛环境下的目录选择器。
- 存储容量和挂载状态监控。
- 自定义上传图标。
- 存储根配置导入导出。
- 主路径不可用时切换备用挂载路径。
- 使用不透明 `fileRef` 替代前端传递服务器路径。

## 21. 最终数据关系

```text
storageRoot
  └── path
        └── manga
              ├── chapter
              └── meta
```

路径解析关系：

```text
旧媒体库：
path.storageRootId = null
数据库路径 = 实际路径

新媒体库：
path.storageRootId = storageRoot.storageRootId
实际路径 = storageRoot.rootPath + 数据库相对路径
```

存储根是新媒体库的路径边界和物理位置来源；`path` 仍然是媒体库的扫描入口；漫画、章节和元数据通过 `path` 继承同一个存储根。
