# 2026-04-12 编辑器配色修复

## 问题描述
编辑区字体呈现灰色，与背景色 `--bg-md` 相似，导致文字难以辨认。

## 问题原因
1. `md-editor-v3` 的 CSS 变量 `--md-color` 没有正确覆盖
2. 编辑区 `.md-editor-input` 元素的颜色继承存在问题
3. 样式选择器优先级不够，部分规则未生效

## 修复方案

### 1. 强化 CSS 变量覆盖
在 `.markdown-editor :deep(.md-editor)` 中强制覆盖所有核心颜色变量：

```css
.markdown-editor :deep(.md-editor) {
  /* 核心背景色 */
  --md-bk-color: var(--bg-md) !important;
  --md-bk-color-outstand: var(--bg-tertiary) !important;
  --md-bk-hover-color: var(--bg-hover) !important;
  
  /* 文字颜色 */
  --md-color: var(--text-primary) !important;
  --md-hover-color: var(--accent-primary) !important;
  
  /* 边框颜色 */
  --md-border-color: var(--border-secondary) !important;
  --md-border-hover-color: var(--border-primary) !important;
  --md-border-active-color: var(--accent-primary) !important;
  
  /* 滚动条颜色 */
  --md-scrollbar-bg-color: var(--bg-md) !important;
  --md-scrollbar-thumb-color: var(--component-scroll-thumb) !important;
  --md-scrollbar-thumb-hover-color: var(--text-muted) !important;
  --md-scrollbar-thumb-active-color: var(--text-secondary) !important;
  
  /* 主题颜色 */
  --md-theme-color: var(--text-primary) !important;
  --md-theme-heading-color: var(--text-primary) !important;
  --md-theme-code-color: var(--accent-primary) !important;
  --md-theme-link-color: var(--accent-primary) !important;
  --md-theme-link-hover-color: var(--accent-secondary) !important;
}
```

### 2. 修复编辑区输入框样式
强制设置输入框背景和文字颜色：

```css
.markdown-editor :deep(.md-editor-input-wrapper) {
  background-color: var(--bg-md) !important;
}

.markdown-editor :deep(.md-editor-input) {
  background-color: var(--bg-md) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-secondary) !important;
}

.markdown-editor :deep(.md-editor-input:hover) {
  border-color: var(--border-primary) !important;
}

.markdown-editor :deep(.md-editor-input:focus) {
  border-color: var(--accent-primary) !important;
}

.markdown-editor :deep(.md-editor-input::placeholder) {
  color: var(--text-muted) !important;
}
```

### 3. 修复预览区样式
确保预览区文字颜色正确：

```css
.markdown-editor :deep(.md-editor-preview) {
  background-color: var(--bg-md) !important;
  color: var(--text-primary) !important;
}

.markdown-editor :deep(.md-editor-preview-wrapper) {
  background-color: var(--bg-md) !important;
}

/* 预览区各类文字元素 */
.markdown-editor :deep(.md-editor-preview h1),
.markdown-editor :deep(.md-editor-preview h2),
.markdown-editor :deep(.md-editor-preview h3),
.markdown-editor :deep(.md-editor-preview h4),
.markdown-editor :deep(.md-editor-preview h5),
.markdown-editor :deep(.md-editor-preview h6) {
  color: var(--text-primary) !important;
}

.markdown-editor :deep(.md-editor-preview p) {
  color: var(--text-primary) !important;
}

.markdown-editor :deep(.md-editor-preview ul),
.markdown-editor :deep(.md-editor-preview ol) {
  color: var(--text-primary) !important;
}
```

## 关键变更

### 文件：`calcite-web/src/components/center/NoteEditor.vue`

1. **统一使用 `--bg-md` 作为编辑器背景色**（#2d353b）
2. **强制使用 `!important`** 确保样式优先级
3. **添加主题变量覆盖**：`--md-theme-*` 系列变量
4. **修复输入框交互状态**：hover、focus 状态的边框颜色
5. **移除重复样式**：删除重复的标题样式定义

## 颜色映射

| 编辑器元素 | 背景色 | 文字色 | 边框色 |
|-----------|--------|--------|--------|
| 编辑器根元素 | `--bg-md` (#2d353b) | `--text-primary` (#d3c6aa) | `--border-secondary` |
| 工具栏 | `--bg-tertiary` (#414b50) | `--text-secondary` | `--border-secondary` |
| 编辑区输入框 | `--bg-md` | `--text-primary` | `--border-secondary` |
| 预览区 | `--bg-md` | `--text-primary` | - |
| 代码块 | `--bg-tertiary` | `--accent-primary` (#7fbbb3) | `--border-primary` |
| 引用块 | `--bg-tertiary` | `--text-secondary` | `--accent-secondary` (左边框) |

## 效果
- 编辑区文字现在呈现为 `--text-primary` (#d3c6aa) 米白色
- 与 `--bg-md` (#2d353b) 深灰绿背景形成良好对比
- 整体配色与 Everforest 主题一致
