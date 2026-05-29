# 2025-05-24 修复 Home.vue 中创建文件夹按钮无响应问题

## 问题描述

在 `calcite-web/src/views/Home.vue` 第 13 行，左侧工具栏的 `create-folder` 事件绑定了 `handleCreateFolder` 处理器：

```vue
<LeftSidebar
  ...
  @create-folder="handleCreateFolder"
  ...
/>
```

但 `<script setup>` 中并未定义该函数，导致点击顶部工具栏的"新建文件夹"按钮时没有任何反应。

## 根因分析

- `handleFolderCreate`（用于右键菜单"新建子文件夹"）已实现。
- `handleCreateFolder`（用于顶部工具栏按钮）缺失。
- 两者调用链路不同：
  - `LeftToolbar.vue` 按钮 → `@create-folder` → `Home.vue::handleCreateFolder`
  - `FileTree.vue` 右键菜单 → `@folder-create` → `Home.vue::handleFolderCreate`

## 修改内容

**文件**: `calcite-web/src/views/Home.vue`

在 `// ===== 文件夹操作 =====` 区域新增 `handleCreateFolder` 实现：

```javascript
const handleCreateFolder = () => {
  dialogStore.openFolderDialog(null, folderStore.selectedFolderId ?? 0)
}
```

该函数以当前选中的文件夹作为父目录（未选中则默认根目录 `0`），打开文件夹创建对话框，复用已有的 `handleSaveFolder` 逻辑完成后续保存与刷新。

## 验证

- 启动开发服务器后，点击左侧顶部工具栏的"新建文件夹"按钮，可正常弹出创建对话框。
- 填写名称并确认后，文件夹成功创建并自动刷新文件树。

已完成修复。

### 修改内容

在 `calcite-web/src/views/Home.vue` 的文件夹操作区段新增了缺失的 `handleCreateFolder` 函数：

```javascript
const handleCreateFolder = () => {
  dialogStore.openFolderDialog(null, folderStore.selectedFolderId ?? 0)
}
```

- 点击左侧顶部工具栏的 **"新建文件夹"** 按钮时，会以当前选中的文件夹作为父目录打开创建对话框。
- 未选中任何文件夹时，默认在根目录（`parentId = 0`）下创建。
- 对话框确认后，复用已有的 `handleSaveFolder` 完成保存与文件树刷新。

### 文档记录

已在 `docs/260524_home_handleCreateFolder.md` 中记录问题描述、根因分析与修改详情。