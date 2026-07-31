# theme 皮肤 element 组件清退计划

> 目标: theme 主题（/t 路由）下不再出现 element-plus 的默认观感, 全部换成与
> `--theme-reader-topbar-*` / theme 变量体系一致的自绘组件。
> 本文档为后续施工计划; 阅读页部分已完成, 列出仅作基线记录。

## 一、已完成 (基线)

| 位置 | 原 element | 现状 |
| --- | --- | --- |
| control-panel 页码滑块 | el-slider | 自绘 range (`.lcp-range`) |
| 跳页/图宽弹窗 | el-dialog + el-slider + el-switch | `legacy-reader/reader-dialogs.vue` 自绘 |
| 阅读页底部条 (flow `.bottom`、single/double/half `.footer`) | el-slider + el-button | `legacy-reader/reader-footer.vue` 自绘, bridge 内 CSS 隐藏旧条 |
| 章节抽屉 | el-drawer | 容器保留, 已覆盖默认白底/内边距 |

## 二、待办总览 (按优先级)

| # | 范围 | element 残留 | 工作量 | 优先级 |
| --- | --- | --- | --- | --- |
| 1 | 主题级基础设施 | ElMessage / ElMessageBox 的替代品 | 中 | P0 (被 2/3 依赖) |
| 2 | theme-context-menu.vue | el-dialog(分享) + ElMessageBox.confirm + ElMessage | 中 | P1 |
| 3 | pages/tag-list.vue | ElMessage ×2 | 小 | P1 |
| 4 | legacy-manga-info/index.vue | el-carousel / el-image / el-tag / el-descriptions | 大 | P2 |

## 三、阶段一: 主题级 toast / confirm 基础设施 (P0)

新建两个可编程调用的单例组件, 放 `src/themes/components/`:

### 1. theme-toast

- 文件: `src/themes/components/theme-toast.vue` + `src/themes/composables/useThemeToast.ts`
- API: `toast.success(msg)` / `toast.error(msg)` / `toast.info(msg)`
- 实现: 模块级 reactive 队列 + `<teleport to="body">` 渲染, 无需 app.use;
  组件挂在 theme 布局根 (themes 布局入口) 一处即可
- 观感: 顶部居中小胶囊, 深色毛玻璃 (同 `.lcp-sheet`), 成功/失败左侧色点,
  1.8s 自动消失, 与 user-setting.vue 已有的 `setting-save-hint` 风格统一
- z-index: 3100 (高于抽屉/面板 3001)

### 2. theme-confirm

- 文件: `src/themes/components/theme-confirm.vue` + `useThemeConfirm.ts`
- API: `await confirm({ title, message, type? })` → resolve/reject, 对齐
  ElMessageBox.confirm 的调用习惯, 便于替换
- 观感: 复用 reader-dialogs 的 `.lrd-mask/.lrd-card/.lrd-btn` 样式基因,
  可抽公共 less (`src/themes/style/dialog.less`) 避免复制三份

验收: 两个组件在 A/B/D 三风格下配色正确; 移动端宽度自适应。

## 四、阶段二: theme-context-menu 迁移 (P1)

文件: `src/themes/components/theme-context-menu.vue`

1. `ElMessageBox.confirm(...)` (标记已读/未读确认, L129) → `useThemeConfirm`
2. `ElMessage.success/error` (L175/227/252) → `useThemeToast`
3. 分享弹窗 `el-dialog` (L32) → 自绘弹窗:
   - 套 `.lrd-mask/.lrd-card` 壳, 内容 (有效期选项/链接展示/复制按钮) 原样搬移
   - 内部若有 el-radio/el-input 等一并换成自绘 (radio → 芯片单选, input → 原生 input 套主题样式)
4. 回归点: 右键/长按菜单在 媒体库/漫画列表/章节列表 三处入口的 分享、删除、
   标记已读/未读 全流程

## 五、阶段三: tag-list 迁移 (P1, 顺手)

文件: `src/themes/pages/tag-list.vue`

- `ElMessage.success('标签新增成功')` / `ElMessage.error(...)` → `useThemeToast`
- 删除 `import { ElMessage } from 'element-plus'`
- 回归点: 新增标签成功/失败两条路径

## 六、阶段四: legacy-manga-info 迁移 (P2, 工作量大)

文件: `src/themes/legacy-manga-info/index.vue`

逐个替换, 可拆多次提交:

1. `el-descriptions` ×2 (发布信息/技术信息) → 自绘 `<dl>` 网格
   (label 淡色 + value 常色, grid 两列, 移动端一列), 最简单, 先做
2. `el-tag` (标签墙) → 自绘胶囊 span, 保留 `tagColor` 背景色逻辑
3. `el-image` ×2 (封面) → 原生 `<img>` + object-fit: contain + 加载失败占位
   (灰底 + iconfont), 注意懒加载属性 `loading="lazy"`
4. `el-carousel` (toptoon 横幅模式) → 二选一:
   - a. 自绘轮播 (transform 轮换 + 定时器 + 触摸滑动), 工作量最大
   - b. 评估 toptoon 横幅使用率, 若低可先降级为静态首图, 与产品确认后再定
   除 a/b 决策外不阻塞前三项

## 七、约束与验收

- 旧皮肤 (`src/views/**`) 一律不动; theme 组件全部走 store/composable 驱动
- 每阶段完成后: `GetProblems` 无错误 + 手动回归对应页面 (A/B/D 三风格 + 移动端宽度)
- element 清退检查命令:
  `rg "el-|ElMessage|ElMessageBox" src/themes --glob '*.vue'`
  预期最终仅剩 chapter-drawer 的 el-drawer 容器 (已豁免) 与注释文案
- i18n: 新组件文案一律走 `$t()`, 三语言文件同步补键 (zh-Cn / zh-Tw / en-US)

## 八、建议施工顺序

```
阶段一 (toast/confirm) → 阶段三 (tag-list, 5分钟验证基础设施)
→ 阶段二 (context-menu) → 阶段四 (manga-info, 按 1→2→3→4 子序)
```
