# Calcite Web 重构文档 - 工具栏优化

**日期**: 2026-04-12  
**版本**: Reactor v1.0

---

## 一、Bug 修复

### 问题：左右侧栏按钮无法关闭/打开

**根因**: `el-splitter-panel` 没有使用 `v-show` 控制显示/隐藏。

**修复**:
```vue
<!-- Home.vue -->
<el-splitter-panel v-show="!leftCollapsed" size="25%">
<el-splitter-panel size="auto">
<el-splitter-panel v-show="!rightCollapsed" size="25%">
```

中间栏使用 `size="auto"` 自动适应剩余空间。

---

## 二、功能重构

### 1. 搜索框移动到中间工具栏中央

**修改前** (LeftSidebar.vue):
```vue
<SearchBox v-model="searchKeyword" />
<FileTree v-if="!searchKeyword" />
<SearchResults v-else />
```

**修改后** (CenterToolbar.vue):
```vue
<div class="toolbar-center">
  <el-input
    :model-value="searchKeyword"
    placeholder="搜索笔记..."
    ...
  />
</div>
```

**中间内容区** (Home.vue):
```vue
<SearchResults v-if="searchKeyword && !editingNote" />
<NoteListView v-else-if="!editingNote" />
<NoteEditor v-else />
```

---

### 2. 左侧栏工具栏改为横向图标排列

**修改前** (LeftToolbar.vue):
```vue
<div class="sidebar-top">
  <el-button type="success" :icon="DocumentAdd">新建笔记</el-button>
  <el-button type="primary" :icon="FolderAdd">新建文件夹</el-button>
</div>
```

**修改后**:
```vue
<div class="sidebar-toolbar">
  <el-tooltip content="新建笔记" placement="bottom">
    <el-button type="success" :icon="DocumentAdd" circle />
  </el-tooltip>
  <el-tooltip content="新建文件夹" placement="bottom">
    <el-button type="primary" :icon="FolderAdd" circle />
  </el-tooltip>
</div>
```

---

### 3. 统一工具栏高度和样式

| 工具栏 | 高度 | 样式 |
|--------|------|------|
| CenterToolbar | 48px | 搜索框居中 + 两侧图标按钮 |
| LeftToolbar | 48px | 横向图标按钮，tooltip 提示 |
| RightSidebar Toolbar | 48px | 标题 + 图标按钮，tooltip 提示 |

**统一样式**:
```css
.toolbar, .sidebar-toolbar {
  height: 48px;
  padding: 8px 16px;
  box-sizing: border-box;
}

.icon-btn {
  font-size: 16px;
}

.icon-btn:hover {
  transform: scale(1.05);
}
```

---

## 三、文件修改清单

### Home.vue
- 添加 `v-show="!leftCollapsed"` 和 `v-show="!rightCollapsed"` 控制侧栏显示
- 中间栏改为 `size="auto"` 自适应
- 搜索逻辑移到中间栏，使用 `v-if="searchKeyword"` 显示搜索结果

### CenterToolbar.vue
- 添加搜索框到中央
- 改为图标按钮 + tooltip
- 添加 `searchKeyword` v-model

### LeftToolbar.vue
- 改为横向排列
- 只保留图标
- 添加 tooltip

### RightSidebar.vue
- 添加顶部工具栏
- 添加图标按钮 + tooltip
- 移除旧标题样式

### LeftSidebar.vue
- 移除搜索框和搜索结果
- 只保留文件树

### NoteListView.vue & NoteEditor.vue
- 调整 padding 适应新布局

---

## 四、组件结构

```
Home.vue
├── el-splitter
│   ├── el-splitter-panel (左栏, v-show="!leftCollapsed")
│   │   └── LeftSidebar
│   │       ├── LeftToolbar (图标按钮)
│   │       ├── FileTree
│   │       └── UserProfile
│   ├── el-splitter-panel (中栏, size="auto")
│   │   └── main-content
│   │       ├── CenterToolbar (搜索框居中 + 图标按钮)
│   │       ├── SearchResults (搜索时显示)
│   │       ├── NoteListView (默认显示)
│   │       └── NoteEditor (编辑时显示)
│   └── el-splitter-panel (右栏, v-show="!rightCollapsed")
│       └── RightSidebar
│           ├── Toolbar (图标按钮)
│           └── TagList
```

---

## 五、交互说明

| 操作 | 效果 |
|------|------|
| 点击中间栏"文件夹"图标 | 左栏收起/展开 |
| 点击中间栏"标签"图标 | 右栏收起/展开 |
| 中间栏搜索框输入 | 显示搜索结果在中央区域 |
| 左侧栏"+"图标 | 新建笔记 |
| 左侧栏"文件夹+"图标 | 新建文件夹 |
| 右侧栏"+"图标 | 新建标签 |

---

## 六、构建验证

```bash
$ npm run build

vite v7.3.2 building client environment for production...
transforming...
✓ 1695 modules transformed.
✓ built in 4.85s
```

**构建结果**: ✅ 成功
