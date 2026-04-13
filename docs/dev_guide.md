# Calcite Web 开发文档

> 本文档供 Agent 快速定位并修改代码，详细的 API 接口请参考 [api.md](./api.md)

---

## 目录

- [项目概述](#项目概述)
- [目录结构](#目录结构)
- [技术栈](#技术栈)
- [核心模块说明](#核心模块说明)
- [API 调用规范](#api-调用规范)
- [组件架构](#组件架构)
- [状态管理](#状态管理)
- [主题系统](#主题系统)
- [路由配置](#路由配置)
- [常见开发任务](#常见开发任务)

---

## 项目概述

Calcite Web 是一个基于 Vue 3 的笔记管理系统，采用 Everforest 主题配色，支持 Markdown 编辑、文件管理、标签分类等功能。

### 主要特性

- **三栏布局**：左侧文件树、中间编辑区、右侧标签/文件管理
- **Markdown 编辑**：使用 md-editor-v3 实现实时预览
- **文件上传**：支持图片/文件上传，异步轮询查询上传状态
- **标签系统**：支持标签创建、绑定、解绑
- **文件夹管理**：树形结构的文件夹组织
- **全文搜索**：基于 Elasticsearch 的全文检索
- **深浅主题**：支持 Everforest 深色/浅色主题切换

---

## 目录结构

```
calcite-web/src/
├── api/                    # API 接口层
│   ├── auth.js            # 用户认证（登录/注册/退出）
│   ├── note.js            # 笔记 CRUD
│   ├── folder.js          # 文件夹管理
│   ├── tag.js             # 标签管理
│   ├── file.js            # 文件上传/管理
│   └── user.js            # 用户信息
├── components/            # 通用组件
│   ├── FileTree.vue       # 文件树组件（递归）
│   ├── dialogs/           # 对话框组件
│   │   ├── FolderDialog.vue    # 文件夹对话框
│   │   ├── NoteDialog.vue      # 笔记对话框
│   │   └── TagDialog.vue       # 标签对话框
│   ├── center/           # 中间内容区组件
│   │   ├── CenterToolbar.vue   # 顶部工具栏
│   │   ├── NoteEditor.vue      # Markdown 编辑器
│   │   ├── NoteListView.vue   # 笔记列表视图
│   │   └── NoteCard.vue       # 笔记卡片
│   ├── sidebar/          # 侧边栏组件
│   │   ├── LeftSidebar.vue    # 左侧边栏（文件树）
│   │   ├── RightSidebar.vue   # 右侧边栏（标签/文件）
│   │   ├── LeftToolbar.vue    # 左侧工具栏
│   │   ├── RightToolbar.vue   # 右侧工具栏
│   │   ├── FileList.vue       # 文件列表
│   │   ├── TagList.vue        # 标签列表
│   │   ├── UserProfile.vue    # 用户信息
│   │   └── SearchResults.vue  # 搜索结果
├── composables/          # 组合式函数
│   └── useTheme.js       # 主题管理
├── router/               # 路由配置
│   └── index.js
├── styles/               # 样式文件
│   ├── theme.js          # 主题配置
│   └── theme.css         # 主题 CSS 变量
├── utils/                # 工具函数
│   └── request.js        # Axios 封装
├── views/                # 页面视图
│   ├── Login.vue         # 登录页
│   ├── Register.vue      # 注册页
│   └── Home.vue          # 主页（三栏布局）
├── App.vue               # 根组件
├── main.js               # 入口文件
└── style.css             # 全局样式
```

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.24 | 前端框架 |
| Vue Router | 4.6.4 | 路由管理 |
| Element Plus | 2.13.7 | UI 组件库 |
| md-editor-v3 | 6.4.2 | Markdown 编辑器 |
| Axios | 1.13.2 | HTTP 客户端 |
| Vite | 7.2.4 | 构建工具 |

---

## 核心模块说明

### 1. API 层 (`/src/api/`)

所有 API 调用通过 `request.js` 封装的 axios 实例发起，自动添加 token 和处理错误。

#### 基础配置

```javascript
// 开发环境使用代理: /api
// 生产环境使用: http://localhost:8888
const baseURL = import.meta.env.DEV ? '/api' : 'http://localhost:8888'
```

#### API 模块

| 文件 | 主要接口 |
|------|----------|
| `auth.js` | register, login, logout |
| `note.js` | createNote, updateNote, deleteNote, getNoteList, getNoteDetail, searchNotes |
| `folder.js` | createFolder, getFolderList, updateFolder, deleteFolder |
| `tag.js` | createTag, getTagList, bindTag, updateTag, deleteTag |
| `file.js` | uploadFile, getFileList, deleteFile, getFileStatus, getFileInfo, pollFileStatus |
| `user.js` | getUserProfile |

---

### 2. 请求拦截器 (`/src/utils/request.js`)

**请求拦截器** 自动添加 token：

```javascript
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**响应拦截器** 处理统一响应格式：

```javascript
// 统一响应格式
{
  "code": 0,        // 0 成功，非0 失败
  "message": "success",
  "data": {}
}

// 401 自动跳转登录
if (status === 401) {
  localStorage.removeItem('token')
  window.location.href = '/login'
}
```

---

## 组件架构

### 页面层级

```
App.vue
└── router-view
    ├── Login.vue
    ├── Register.vue
    └── Home.vue (主页面)
        ├── ElSplitter (三栏布局)
        │   ├── LeftSidebar (左侧边栏)
        │   ├── 中间内容区
        │   │   ├── CenterToolbar
        │   │   ├── SearchResults (搜索时显示)
        │   │   ├── NoteListView (笔记列表)
        │   │   └── NoteEditor (编辑器)
        │   └── RightSidebar (右侧边栏)
        └── 对话框 (FolderDialog, NoteDialog, TagDialog)
```

### 核心组件说明

#### Home.vue

主页面容器，负责：
- 三栏布局（使用 `ElSplitter`）
- 全局状态管理（笔记、文件夹、标签、文件）
- 数据获取和刷新
- 侧边栏折叠状态管理

**关键状态**：

```javascript
// 文件夹/笔记
const allNotes = ref([])           // 所有笔记
const allFolders = ref([])         // 所有文件夹（扁平）
const selectedFolderId = ref(null)  // 当前选中的文件夹
const selectedNoteId = ref(null)    // 当前选中的笔记

// 编辑器
const editingNote = ref(null)       // 正在编辑的笔记
const saveStatus = ref('已保存')   // 保存状态
const hasUnsavedChanges = ref(false) // 是否有未保存的更改

// 搜索
const searchKeyword = ref('')       // 搜索关键词
const searchResults = ref([])       // 搜索结果

// 侧边栏折叠
const leftCollapsed = ref(false)    // 左侧栏是否折叠
const rightCollapsed = ref(false)   // 右侧栏是否折叠
```

**主要方法**：

```javascript
fetchAllFolders()    // 获取所有文件夹（递归）
fetchAllNotes()      // 获取所有笔记
fetchAllTags()       // 获取所有标签
fetchAllUserFiles()  // 获取用户所有文件
fetchNoteFiles()     // 获取当前笔记的文件
fetchNoteTags()      // 获取当前笔记的标签

doSearch()           // 执行搜索（带防抖）
openNoteEditor()     // 打开笔记编辑器
saveCurrentNote()    // 保存当前笔记
```

#### FileTree.vue

递归文件树组件，用于显示文件夹和笔记。

**Props**：

```javascript
{
  allFolders: Array,      // 所有文件夹（用于子级筛选）
  folders: Array,         // 当前层级的文件夹
  notes: Array,           // 所有笔记
  parentFolderId: Number, // 父文件夹ID（子级使用）
  selectedFolderId: Number,
  selectedNoteId: Number,
  expandedFolders: Set,   // 展开的文件夹ID集合
  isRoot: Boolean        // 是否为根节点
}
```

**Events**：

```javascript
@folder-click    // 文件夹点击
@folder-expand   // 文件夹展开
@folder-collapse // 文件夹折叠
@note-click      // 笔记点击
@folder-create   // 创建子文件夹
@folder-rename   // 重命名文件夹
@folder-delete   // 删除文件夹
```

#### NoteEditor.vue

Markdown 编辑器组件，使用 `md-editor-v3`。

**主要功能**：
- Markdown 编辑和预览
- 图片/文件上传（调用 `uploadFile` + `pollFileStatus`）
- 自动保存（2秒防抖）

**文件上传流程**：

```javascript
const onUploadImg = async (files, callback) => {
  // 1. 上传文件，获取 file_id
  const uploadRes = await uploadFile(formData, noteId)
  const fileId = uploadRes.file_id

  // 2. 轮询查询上传状态
  const statusRes = await pollFileStatus(fileId, {
    interval: 1000,   // 每秒查询一次
    maxAttempts: 60   // 最多轮询60秒
  })

  // 3. 返回 URL
  callback([statusRes.url])
}
```

---

## 状态管理

项目使用 Vue 3 Composition API 和 ref/reactive 进行状态管理，不使用 Vuex/Pinia。

### 本地存储

| Key | 说明 |
|-----|------|
| `token` | JWT 认证令牌 |
| `userInfo` | 用户信息（JSON 字符串） |
| `calcite:leftCollapsed` | 左侧栏折叠状态 |
| `calcite:rightCollapsed` | 右侧栏折叠状态 |
| `calcite-theme` | 主题设置 |

---

## 主题系统

主题采用 CSS 变量实现，支持深色和浅色模式。

### 主题配置

文件位置：`/src/styles/theme.js`

```javascript
// 深色主题（默认）
darkTheme = {
  bg: {
    primary: '#272e33',      // 主背景
    secondary: '#2d353b',    // 次背景
    tertiary: '#414b50',     // 三级背景
    // ...
  },
  text: {
    primary: '#d3c6aa',      // 主文字
    // ...
  },
  accent: {
    primary: '#7fbbb3',      // 青绿色
    secondary: '#a7c080',    // 绿色
    // ...
  }
}
```

### 使用 CSS 变量

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

### 切换主题

```javascript
import { useTheme } from './composables/useTheme'

const { currentTheme, toggleTheme, setTheme } = useTheme()

// 切换主题
toggleTheme()

// 设置指定主题
setTheme('light')
```

---

## 路由配置

文件位置：`/src/router/index.js`

```javascript
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { 
    path: '/home', 
    component: Home,
    meta: { requiresAuth: true }
  }
]
```

### 路由守卫

```javascript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/home')
  } else {
    next()
  }
})
```

---

## API 调用规范

### 1. 调用 API

```javascript
import { getNoteList, createNote } from '@/api/note'

// 获取笔记列表
const data = await getNoteList()

// 创建笔记
const result = await createNote({
  title: '新笔记',
  content: '',
  folder_id: 1
})
```

### 2. 处理错误

```javascript
try {
  await deleteNote({ note_id: 1 })
  ElMessage.success('删除成功')
} catch (error) {
  // 错误已被 request.js 拦截器处理并显示
  console.error('删除失败:', error)
}
```

### 3. 文件上传

```javascript
import { uploadFile, pollFileStatus } from '@/api/file'

const formData = new FormData()
formData.append('file', file)
formData.append('note_id', noteId) // 可选

// 1. 上传文件
const uploadRes = await uploadFile(formData, noteId)
const fileId = uploadRes.file_id

// 2. 轮询查询状态
const statusRes = await pollFileStatus(fileId, {
  interval: 1000,
  maxAttempts: 60
})

// 3. 使用 URL
console.log(statusRes.url)
```

---

## 常见开发任务

### 添加新的 API 接口

1. 在 `/src/api/` 对应文件中添加接口函数
2. 确保使用 `request` 实例发起请求
3. 参数和返回值参考 [api.md](./api.md)

示例：

```javascript
// src/api/note.js
export function archiveNote(data) {
  return request({
    url: '/note/archive',
    method: 'post',
    data
  })
}
```

### 修改组件样式

1. 优先使用 CSS 变量，确保主题兼容
2. 样式文件放在组件的 `<style scoped>` 中
3. 使用深度选择器 `:deep()` 修改第三方组件样式

示例：

```vue
<style scoped>
.my-component {
  background-color: var(--bg-primary);
}

/* 修改 md-editor-v3 样式 */
.markdown-editor :deep(.md-editor) {
  background-color: var(--bg-secondary) !important;
}
</style>
```

### 添加新的对话框

1. 在 `/src/components/dialogs/` 创建新组件
2. 使用 `ElDialog` + `el-form` 结构
3. 定义 Props 和 Emits
4. 在 Home.vue 中导入并使用

示例：

```vue
<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    title="新建 X"
  >
    <el-form :model="form">
      <!-- 表单项 -->
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="$emit('confirm')">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  form: Object
})

defineEmits(['update:visible', 'confirm'])
</script>
```

### 处理笔记编辑的自动保存

在 `NoteEditor.vue` 中：

```javascript
const handleContentChange = (value) => {
  emit('update:content', value)
  emit('input') // 触发 Home.vue 的 handleNoteChange
}
```

在 `Home.vue` 中：

```javascript
const handleNoteChange = () => {
  hasUnsavedChanges.value = true
  saveStatus.value = '有未保存的更改...'

  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }

  saveTimer.value = setTimeout(() => {
    saveCurrentNote() // 2秒后自动保存
  }, 2000)
}
```

### 修改主题颜色

编辑 `/src/styles/theme.js` 中的主题配置：

```javascript
export const darkTheme = {
  accent: {
    primary: '#7fbbb3',      // 修改主强调色
    // ...
  }
}
```

### 添加新的 CSS 变量

1. 在 `theme.js` 中添加变量定义
2. 在 `themeToCSSVariables` 函数中添加转换
3. 在组件中使用 `var(--your-variable)`

---

## 开发环境配置

### 代理配置

在 `vite.config.js` 中配置代理（如果需要）：

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true
      }
    }
  }
})
```

### 启动项目

```bash
cd calcite-web
npm install
npm run dev
```

---

## 注意事项

1. **Token 管理**：所有需要认证的接口会自动在 header 中添加 token
2. **错误处理**：请求拦截器已统一处理 401，会自动跳转登录页
3. **文件上传**：异步上传需要轮询查询状态，使用 `pollFileStatus` 工具函数
4. **主题兼容**：使用 CSS 变量确保深浅主题都正常显示
5. **路由守卫**：未登录用户访问 `/home` 会重定向到 `/login`
6. **本地存储**：用户信息、折叠状态、主题设置都保存在 localStorage 中

---

## 附录：关键文件速查

| 文件路径 | 功能 |
|---------|------|
| `/src/main.js` | 应用入口，注册插件、初始化主题 |
| `/src/App.vue` | 根组件，定义全局样式和主题 |
| `/src/views/Home.vue` | 主页面，三栏布局容器 |
| `/src/router/index.js` | 路由配置和守卫 |
| `/src/utils/request.js` | Axios 封装，拦截器 |
| `/src/api/note.js` | 笔记 API |
| `/src/api/file.js` | 文件 API（含轮询） |
| `/src/styles/theme.js` | 主题配置 |
| `/src/components/FileTree.vue` | 文件树组件 |
| `/src/components/center/NoteEditor.vue` | Markdown 编辑器 |
| `/docs/api.md` | 后端 API 文档 |
