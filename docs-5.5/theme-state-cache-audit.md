# Theme 前端缓存与状态管理审计

审计范围：`src/themes/**` 及其直接依赖的 `src/store`、`src/api`、`src/utils`、`src/router`、`src/App.vue`。  
约束：没有修改 `src/views/**` 旧主题页面。

## 结论

原实现把四类用途不同的数据混在 cookie、localStorage、模块级 `reactive`、Pinia 和
`window.CustomEvent` 中：

1. 鉴权数据和纯 UI 偏好都写 cookie；
2. 同一个分页容量，新主题写 cookie，`browse` store 却从 localStorage 读；
3. 阅读跳页这种一次性消息长期留在 localStorage，可能污染下一次阅读；
4. A/B/D 新主题登录和退出没有统一维护现有的“按 serverKey 隔离”的 token；
5. 配色状态既读 cookie，又通过 window 事件广播，布局还各自再维护一份 `isDark`；
6. `global_set_json` 会把用户配置、分页配置甚至书签列表写入 cookie，容易超过单条
   cookie 容量，并随每个请求发送；
7. 图片 store 实际是空对象，缓存通过动态属性挂载，没有明确 state、LRU 或
   `URL.revokeObjectURL`。

本次已经按数据生命周期重新分层，并保留旧主题兼容入口。

## 当前缓存职责

| 数据 | 当前唯一状态入口 | 持久化 | 生命周期 / 说明 |
| --- | --- | --- | --- |
| 当前服务、token、role | `session` store + `Cookies` 兼容层 | cookie | token/role 继续按 `serverKey` 隔离，供 Axios 请求头使用 |
| 用户名、ID、头像路径 | `session` store | 按 serverKey 分区的 localStorage；同时写兼容 cookie | 非敏感展示资料；旧主题仍可按原 key 读取 |
| A/B/D/Legacy 外观主题 | `preferences` store | localStorage | 从历史 `smanga-theme` cookie 自动迁移 |
| light/dark/彩色配色 | `preferences` store | localStorage | 不再依赖 cookie 和 window 事件 |
| D 主题颜色 | `preferences` store | localStorage | 桌面与移动端共用同一响应式值 |
| 语言、漫画/章节分页容量 | `preferences` store | localStorage | 新主题读写一致；路由完成后兼容同步旧主题的直接写入 |
| 柔和背景开关、版本提示 | `preferences`/持久化适配层 | localStorage | 历史 cookie 可迁移 |
| 阅读器图片宽度 | `browse` store | localStorage | `flow/single/double...ViewWidthValue`，设备级阅读偏好 |
| 阅读器目标页 | `navigation` store | sessionStorage 后备 | 消费后立即删除；兼容读取旧 `pageJump` localStorage |
| 新主题列表页码、每页数量 | `theme-list-state` Pinia store | 内存 | 按 `mediaId`、`mangaId` 或路由分别缓存，切换路由保留，刷新后重置 |
| 旧主题列表与旧阅读器状态 | `browse` Pinia store | 仅必要偏好落 localStorage | `src/views/**` 兼容层；新主题列表禁止再写入，theme 阅读器仅因复用旧阅读组件而桥接 |
| 主题右键菜单与内容失效通知 | `theme-ui` store | 无 | 替代两个 `window.CustomEvent` 通道 |
| 用户配置、分页配置、书签快照 | `globalData` 兼容层 | localStorage | `global_set_json` 不再写 cookie，并安全解析旧数据 |
| 图片 Object URL | `image-cache` Pinia store | 内存 | LRU；遵守 `imageCacheLimit`；淘汰时释放 Object URL |
| 媒体库统计 | `media-stats` API 模块 | 内存 5 分钟 | 媒体/漫画变更后由 `utils/cache.ts` 主动失效 |
| 标签全集 | `use-tag-picker` 共享 `shallowRef` | 内存 | 标签增删改后主动失效或同步 patch |
| 页面封面映射 | 各新主题页面局部 `ref` | 内存 | 只服务当前页面渲染，不建议迁入全局 store |
| 旧登录页背景、服务地址列表 | 旧 `views` 局部 state | localStorage | `activeBack`、`smanga-services`；按约束未修改 |
| 旧搜索/收藏页共享条件 | `search` / `collect` Pinia store | 无 | 只在旧主题路由间传递，本次保留 |

## Cookie 保留策略

cookie 现在只承担鉴权兼容和旧主题过渡：

- `smanga-server-key`
- `${serverKey}-smanga-token`
- `${serverKey}-smanga-role`
- `userId`、`userName`、`header`、`avatarPath`（旧主题兼容）
- `editUser`、`editMedia`（旧权限模型兼容）
- `useNewTheme`（旧首页入口兼容）

底层统一经过 `utils/persistence.ts`，自动编码值，并设置 `SameSite=Lax`；HTTPS 下追加
`Secure`。由于后端目前要求前端读取 token 后放入请求头，token 暂时不能改成
`HttpOnly`。若后端以后改为服务端 session cookie，应再把 token 切为
`HttpOnly + Secure + SameSite`，这是更彻底的安全方案。

## 哪些数据应该进 store

已经迁入：

- 登录会话、角色和展示资料；
- 外观主题、配色、语言、分页容量；
- 跨页面的一次性阅读目标页；
- 主题右键菜单状态、内容变更 revision、章节已读 revision；
- 图片缓存及其释放策略。

不建议迁入：

- 路由中的 `mediaId`、`mangaId`、`chapterId`、搜索词：它们决定页面地址，应继续放在
  params/query，才能刷新、分享、前进后退；
- 对话框表单、loading、当前页临时筛选：只被单页或单组件消费，应保持局部 state；
- 纯展示用的封面 URL 映射：底层二进制 URL 已有全局图片缓存，页面映射只是视图索引。

## 仍保留的兼容债务

1. `src/store/index.ts` 中的 `globalData/config/userConfig/userInfo` 仍是模块级
   `reactive`，因为大量旧主题页面直接引用。直接替换成 Pinia 会扩大回归面；建议等旧主题
   下线时分模块迁移。
2. `src/views/**` 仍有直接 cookie/localStorage 读写。本次按要求没有修改，但新的
   persistence/store 会在路由切换和读取时兼容这些旧 key。
3. `media-stats` 的 5 分钟缓存目前是 API 模块变量。它已有 TTL 和明确失效点，收益低于
   会话/偏好迁移；如果后续需要 DevTools 可观测或并发请求去重，可再独立迁入 Pinia。
4. 用户设置同时存在“服务端配置”和“浏览器覆盖值”。建议后续明确优先级：
   服务端保存跨设备偏好，localStorage 只保留设备相关值（分页容量、布局宽度等）。

## 验证

- `vite build`：通过。
- `vue-tsc --noEmit`：通过，项目类型错误已清零。
