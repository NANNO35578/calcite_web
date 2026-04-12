# 2026-04-12 编辑器布局与主题修复

## 修改概述
1. 将笔记标题输入框移动到编辑器头部区域
2. 修复 Markdown 编辑器背景色为白色的问题

## 详细修改

### 1. 文件：`calcite-web/src/components/center/NoteEditor.vue`

#### 布局调整 - 标题移至头部

**模板结构变更：**
- 将 `title-input` 从 `editor-content` 中移动到 `editor-header` 中
- 新增 `header-left` 容器包裹返回按钮和标题输入框
- 头部高度从 `48px` 调整为 `64px` 以容纳标题输入
- 调整标题输入框样式：背景色 `--bg-tertiary`，带边框，字号改为 18px

**结构变化：**
```
修改前：
.editor-header
  ├── 返回按钮
  └── header-actions (保存状态 + 删除按钮)
.editor-content
  ├── title-input (标题输入)
  └── markdown-editor-wrapper

修改后：
.editor-header
  ├── header-left
  │   ├── 返回按钮
  │   └── title-input (标题输入)
  └── header-actions (保存状态 + 删除按钮)
.editor-content
  └── markdown-editor-wrapper
```

#### 主题修复 - 覆盖 CSS 变量

**问题原因：**
`md-editor-v3` 使用 CSS 变量定义颜色，默认 `--md-bk-color: #fff`（白色），需要覆盖这些变量以适配 Everforest 主题。

**修复方案：**
在 `.markdown-editor :deep(.md-editor)` 中定义 CSS 变量覆盖：

| 变量名 | 覆盖值 | 说明 |
|-------|--------|------|
| `--md-bk-color` | `--bg-secondary` | 编辑器主背景色 |
| `--md-bk-color-outstand` | `--bg-tertiary` | 突出背景色（工具栏等） |
| `--md-bk-hover-color` | `--bg-hover` | 悬停背景色 |
| `--md-color` | `--text-primary` | 主文字颜色 |
| `--md-hover-color` | `--accent-primary` | 悬停文字颜色 |
| `--md-border-color` | `--border-primary` | 边框颜色 |
| `--md-border-hover-color` | `--border-secondary` | 边框悬停色 |
| `--md-border-active-color` | `--accent-primary` | 边框激活色 |
| `--md-scrollbar-bg-color` | `--bg-tertiary` | 滚动条背景 |
| `--md-scrollbar-thumb-color` | `--component-scroll-thumb` | 滚动条滑块 |
| `--md-scrollbar-thumb-hover-color` | `--text-muted` | 滑块悬停色 |
| `--md-modal-mask` | `rgba(0,0,0,0.6)` | 模态框遮罩 |

**新增样式：**
- 模态框/弹窗样式适配
- 标题输入框边框和背景样式优化

## 样式映射关系

### md-editor-v3 变量 → Everforest 主题变量

```
--md-bk-color              → --bg-secondary      (#2d353b)
--md-bk-color-outstand     → --bg-tertiary       (#414b50)
--md-bk-hover-color        → --bg-hover          (#3d484d)
--md-color                 → --text-primary      (#d3c6aa)
--md-hover-color           → --accent-primary    (#7fbbb3)
--md-border-color          → --border-primary    (#7a8478)
--md-border-hover-color    → --border-secondary  (#4a5658)
--md-border-active-color   → --accent-primary    (#7fbbb3)
--md-scrollbar-bg-color    → --bg-tertiary       (#414b50)
--md-scrollbar-thumb-color → --component-scroll-thumb (#4a5658)
```

## 界面效果

### 布局效果
- 标题输入框现在位于顶部工具栏，与返回按钮同行
- 编辑区域占据更多垂直空间
- 标题输入框带边框，更易识别

### 主题效果
- 编辑器背景色现在与 Everforest 深色主题一致
- 工具栏、编辑区、预览区颜色统一
- 滚动条、模态框等元素也适配主题色

## 注意事项
1. 使用 `!important` 确保 CSS 变量优先级高于组件默认值
2. 变量覆盖在 `:deep(.md-editor)` 选择器内，确保作用于组件内部
3. 头部高度增加以容纳标题输入框，避免拥挤
