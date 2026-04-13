# Calcite Web 组件 API 文档

> 所有组件的 Props、Events、Slots 详细说明

---

## 目录

- [页面组件](#页面组件)
- [布局组件](#布局组件)
- [对话框组件](#对话框组件)
- [侧边栏组件](#侧边栏组件)
- [中心区组件](#中心区组件)

---

## 页面组件

### Login.vue

用户登录页面

**表单字段**：
- `username` (string) - 用户名
- `password` (string) - 密码

**方法**：
- `handleLogin()` - 执行登录
- `goToRegister()` - 跳转到注册页

---

### Register.vue

用户注册页面

**表单字段**：
- `username` (string) - 用户名
- `email` (string) - 邮箱（可选）
- `password` (string) - 密码
- `confirmPassword` (string) - 确认密码

**方法**：
- `handleRegister()` - 执行注册
- `goToLogin()` - 跳转到登录页

---

### Home.vue

主页面，三栏布局容器

**Props**：无

**Emits**：无

**主要方法**：

| 方法 | 说明 |
|------|------|
| `fetchAllFolders()` | 获取所有文件夹（递归） |
| `fetchAllNotes()` | 获取所有笔记 |
| `fetchAllTags()` | 获取所有标签 |
| `fetchAllUserFiles()` | 获取用户所有文件 |
| `fetchNoteFiles()` | 获取当前笔记的文件 |
| `fetchNoteTags()` | 获取当前笔记的标签 |
| `doSearch(resetPage)` | 执行搜索（带防抖） |
| `handleFolderClick(folder)` | 文件夹点击 |
| `handleNoteClick(note)` | 笔记点击 |
| `handleSaveNote()` | 保存笔记（对话框） |
| `handleDeleteNote()` | 删除笔记 |
| `handleSaveFolder()` | 保存文件夹 |
| `handleDeleteFolder(folder)` | 删除文件夹 |
| `handleSaveTag()` | 保存标签 |
| `handleTagAction(command, tag)` | 标签操作（编辑/解绑/删除） |
| `handleTagClick(tag)` | 标签点击（绑定/解绑） |
| `handleDeleteFile(file)` | 删除文件 |
| `handleLogout()` | 退出登录 |

---

## 布局组件

### FileTree.vue

递归文件树组件

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `allFolders` | `Array` | `[]` | 所有文件夹（子级用于筛选） |
| `folders` | `Array` | `[]` | 当前层级的文件夹 |
| `notes` | `Array` | `[]` | 所有笔记 |
| `parentFolderId` | `Number \| null` | `null` | 父文件夹ID |
| `selectedFolderId` | `Number \| null` | `null` | 当前选中的文件夹ID |
| `selectedNoteId` | `Number \| null` | `null` | 当前选中的笔记ID |
| `expandedFolders` | `Set` | `new Set()` | 展开的文件夹集合 |
| `isRoot` | `Boolean` | `true` | 是否为根节点 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `folder-click` | `(folder: Object)` | 文件夹点击 |
| `folder-expand` | `(folder: Object)` | 文件夹展开 |
| `folder-collapse` | `(folder: Object)` | 文件夹折叠 |
| `note-click` | `(note: Object)` | 笔记点击 |
| `folder-create` | `({ parent_id: Number })` | 创建子文件夹 |
| `folder-rename` | `(folder: Object)` | 重命名文件夹 |
| `folder-delete` | `(folder: Object)` | 删除文件夹 |
| `note-create` | `({ folder_id: Number })` | 创建笔记 |

**内部计算属性**：

| 属性 | 说明 |
|------|------|
| `displayFolders` | 当前节点显示的文件夹 |
| `currentLevelNotes` | 当前节点的笔记 |
| `isEmpty` | 是否为空 |
| `emptyMessage` | 空提示消息 |

---

## 对话框组件

### FolderDialog.vue

文件夹创建/编辑对话框

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `Boolean` | `false` | 对话框是否可见 |
| `isEditing` | `Boolean` | `false` | 是否为编辑模式 |
| `form` | `Object` | `{ name: '', parentId: 0 }` | 表单数据 |
| `allFolders` | `Array` | `[]` | 所有文件夹（用于选择父文件夹） |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:visible` | `(value: Boolean)` | 更新可见状态 |
| `confirm` | - | 确认按钮点击 |

---

### NoteDialog.vue

笔记创建对话框

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `Boolean` | `false` | 对话框是否可见 |
| `form` | `Object` | `{ title: '', folderId: null }` | 表单数据 |
| `allFolders` | `Array` | `[]` | 所有文件夹 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:visible` | `(value: Boolean)` | 更新可见状态 |
| `confirm` | - | 确认按钮点击 |

---

### TagDialog.vue

标签创建/编辑对话框

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `Boolean` | `false` | 对话框是否可见 |
| `isEditing` | `Boolean` | `false` | 是否为编辑模式 |
| `form` | `Object` | `{ name: '' }` | 表单数据 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:visible` | `(value: Boolean)` | 更新可见状态 |
| `confirm` | - | 确认按钮点击 |

---

## 侧边栏组件

### LeftSidebar.vue

左侧边栏（文件树）

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `allFolders` | `Array` | 所有文件夹 |
| `folders` | `Array` | 根级文件夹 |
| `allNotes` | `Array` | 所有笔记 |
| `selectedFolderId` | `Number \| null` | 当前选中的文件夹ID |
| `selectedNoteId` | `Number \| null` | 当前选中的笔记ID |
| `expandedFolders` | `Set` | 展开的文件夹集合 |
| `userInfo` | `Object` | 用户信息 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `create-note` | - | 创建笔记 |
| `create-folder` | - | 创建文件夹 |
| `folder-click` | `(folder: Object)` | 文件夹点击 |
| `folder-expand` | `(folder: Object)` | 文件夹展开 |
| `folder-collapse` | `(folder: Object)` | 文件夹折叠 |
| `note-click` | `(note: Object)` | 笔记点击 |
| `folder-create` | `({ parent_id: Number })` | 创建子文件夹 |
| `folder-rename` | `(folder: Object)` | 重命名文件夹 |
| `folder-delete` | `(folder: Object)` | 删除文件夹 |
| `user-command` | `(command: String)` | 用户操作命令 |

---

### RightSidebar.vue

右侧边栏（标签/文件管理）

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `allTags` | `Array` | 所有标签 |
| `noteTags` | `Array` | 当前笔记标签 |
| `editingNote` | `Object \| null` | 正在编辑的笔记 |
| `isTagBound` | `Function` | 判断标签是否已绑定 |
| `files` | `Array` | 当前笔记文件 |
| `allFiles` | `Array` | 用户所有文件 |
| `filesLoading` | `Boolean` | 文件列表加载状态 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `create-tag` | - | 创建标签 |
| `tag-action` | `({ command: String, tag: Object })` | 标签操作 |
| `tag-click` | `(tag: Object)` | 标签点击 |
| `file-delete` | `(file: Object)` | 删除文件 |
| `file-refresh` | `(viewMode: String)` | 刷新文件列表 |
| `view-mode-change` | `(mode: String)` | 切换查看模式 |

**内部状态**：

| 状态 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `activePanel` | `'tags' \| 'files'` | `'tags'` | 当前激活的面板 |

---

### LeftToolbar.vue

左侧边栏工具栏

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `create-note` | - | 创建笔记 |
| `create-folder` | - | 创建文件夹 |

---

### RightToolbar.vue

右侧边栏工具栏

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `activePanel` | `'tags' \| 'files'` | `'tags'` | 当前激活的面板 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:activePanel` | `(value: 'tags' \| 'files')` | 更新激活面板 |

---

### UserProfile.vue

用户信息组件

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `userInfo` | `Object` | 用户信息 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `command` | `(command: String)` | 用户操作命令 |

---

### SearchBox.vue

搜索框组件（集成在 CenterToolbar 中）

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `String` | `''` | 搜索关键词 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: String)` | 更新搜索关键词 |
| `input` | - | 输入事件（触发搜索） |

---

### FileList.vue

文件列表组件

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `files` | `Array` | 文件列表 |
| `allFiles` | `Array` | 所有文件 |
| `loading` | `Boolean` | 加载状态 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `delete` | `(file: Object)` | 删除文件 |
| `refresh` | `(viewMode: String)` | 刷新列表 |
| `view-mode-change` | `(mode: String)` | 切换查看模式 |

---

### TagList.vue

标签列表组件

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tags` | `Array` | `[]` | 标签列表 |
| `title` | `String` | `''` | 列表标题 |
| `emptyText` | `String` | `'暂无标签'` | 空状态提示 |
| `showActions` | `Boolean` | `false` | 是否显示操作按钮 |
| `isBound` | `Function` | 判断标签是否已绑定 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(tag: Object)` | 标签点击 |
| `action` | `({ command: String, tag: Object })` | 标签操作 |

---

### SearchResults.vue

搜索结果组件

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `results` | `Array` | 搜索结果 |
| `total` | `Number` | 总数 |
| `from` | `Number` | 起始位置 |
| `pageSize` | `Number` | 每页数量 |
| `loading` | `Boolean` | 加载状态 |
| `selectedNoteId` | `Number \| null` | 当前选中的笔记ID |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `note-click` | `(note: Object)` | 笔记点击 |
| `prev` | - | 上一页 |
| `next` | - | 下一页 |

---

## 中心区组件

### CenterToolbar.vue

中间区域工具栏

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `searchKeyword` | `String` | `''` | 搜索关键词 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:search-keyword` | `(value: String)` | 更新搜索关键词 |
| `search-input` | - | 搜索输入（触发搜索） |
| `toggle-left` | - | 切换左侧栏 |
| `toggle-right` | - | 切换右侧栏 |

---

### NoteEditor.vue

Markdown 编辑器组件

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `note` | `Object` | 笔记对象 |
| `saveStatus` | `String` | 保存状态 |
| `folderName` | `String` | 文件夹名称 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:title` | `(value: String)` | 更新标题 |
| `update:content` | `(value: String)` | 更新内容 |
| `input` | - | 输入事件（触发自动保存） |
| `back` | - | 返回列表 |
| `delete` | - | 删除笔记 |
| `file-uploaded` | `(fileData: Object)` | 文件上传完成 |

**工具栏配置**：

```javascript
const toolbars = [
  'bold', 'underline', 'italic', '-',
  'title', 'strikeThrough', 'sub', 'sup', 'quote',
  'unorderedList', 'orderedList', 'task', '-',
  'codeRow', 'code', 'link', 'image', 'table',
  'mermaid', 'katex', '=',
  'pageFullscreen', 'preview', 'previewOnly',
  'htmlPreview', 'catalog', 'fullscreen'
]
```

**文件上传处理**：

```javascript
onUploadImg(files: File[], callback: Function) → void
```

---

### NoteListView.vue

笔记列表视图

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | `String` | 列表标题 |
| `notes` | `Array` | 笔记列表 |
| `loading` | `Boolean` | 加载状态 |
| `selectedNoteId` | `Number \| null` | 当前选中的笔记ID |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `note-click` | `(note: Object)` | 笔记点击 |

---

### NoteCard.vue

笔记卡片组件

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `note` | `Object` | 笔记对象 |
| `isActive` | `Boolean` | 是否激活 |

**Emits**：

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | - | 点击事件 |

---

## Composable

### useTheme()

主题管理组合式函数

**返回值**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `currentTheme` | `Ref<String>` | 当前主题 |
| `isDark` | `Computed<Boolean>` | 是否深色模式 |
| `isLight` | `Computed<Boolean>` | 是否浅色模式 |
| `themeConfig` | `Computed<Object>` | 当前主题配置 |
| `availableThemes` | `Computed<Array>` | 可用主题列表 |
| `initialize` | `Function` | 初始化主题 |
| `toggleTheme` | `Function` | 切换主题 |
| `setTheme` | `Function` | 设置指定主题 |
| `applyTheme` | `Function` | 应用主题 |

**使用示例**：

```javascript
import { useTheme } from '@/composables/useTheme'

const { currentTheme, isDark, toggleTheme, setTheme } = useTheme()

// 切换主题
toggleTheme()

// 设置指定主题
setTheme('light')
```

---

## 类型定义参考

### 文件夹对象

```typescript
interface Folder {
  id: number
  name: string
  parent_id: number
  created_at: string
}
```

### 笔记对象

```typescript
interface Note {
  id: number
  title: string
  content: string
  summary?: string
  folder_id: number
  created_at: string
  updated_at: string
}
```

### 标签对象

```typescript
interface Tag {
  id: number
  name: string
  created_at: string
}
```

### 文件对象

```typescript
interface File {
  id: number
  user_id: number
  note_id: number
  file_name: string
  file_type: string
  file_size: number
  file_size_formatted: string
  object_key: string
  url: string
  status: 'processing' | 'done' | 'failed'
  created_at: string
  updated_at: string
}
```

### 用户对象

```typescript
interface User {
  user_id: number
  username: string
  email?: string
  created_at: string
}
```

---

## 相关文档

- [快速参考指南](./quick_ref.md)
- [详细开发文档](./dev_guide.md)
- [API 文档](./api.md)
