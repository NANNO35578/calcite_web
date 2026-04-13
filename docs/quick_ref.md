# Calcite Web 快速参考指南

> Agent 专用：快速定位代码位置

---

## 功能定位表

| 功能 | 文件位置 | 关键方法/变量 |
|------|---------|--------------|
| **用户认证** | | |
| 登录 | `views/Login.vue` | `handleLogin()` |
| 注册 | `views/Register.vue` | `handleRegister()` |
| 退出 | `views/Home.vue` | `handleLogout()` |
| Token 管理 | `utils/request.js` | 请求拦截器 |
| **笔记管理** | | |
| 创建笔记 | `views/Home.vue` | `handleSaveNote()` |
| 编辑笔记 | `components/center/NoteEditor.vue` | `handleContentChange()` |
| 保存笔记 | `views/Home.vue` | `saveCurrentNote()` |
| 删除笔记 | `views/Home.vue` | `handleDeleteNote()` |
| 笔记列表 | `components/center/NoteListView.vue` | - |
| **文件管理** | | |
| 文件上传 | `components/center/NoteEditor.vue` | `onUploadImg()` |
| 上传轮询 | `api/file.js` | `pollFileStatus()` |
| 文件列表 | `components/sidebar/FileList.vue` | - |
| 删除文件 | `views/Home.vue` | `handleDeleteFile()` |
| **文件夹管理** | | |
| 创建文件夹 | `views/Home.vue` | `handleSaveFolder()` |
| 重命名文件夹 | `components/dialogs/FolderDialog.vue` | - |
| 删除文件夹 | `views/Home.vue` | `handleDeleteFolder()` |
| 文件夹树 | `components/FileTree.vue` | 递归组件 |
| **标签管理** | | |
| 创建标签 | `views/Home.vue` | `handleSaveTag()` |
| 绑定标签 | `views/Home.vue` | `handleTagClick()` |
| 解绑标签 | `views/Home.vue` | `handleTagAction('unbind')` |
| 删除标签 | `views/Home.vue` | `handleTagAction('delete')` |
| **搜索** | | |
| 搜索输入 | `components/center/CenterToolbar.vue` | - |
| 执行搜索 | `views/Home.vue` | `doSearch()` |
| 搜索结果 | `components/sidebar/SearchResults.vue` | - |
| **主题** | | |
| 主题配置 | `styles/theme.js` | `darkTheme`, `lightTheme` |
| 切换主题 | `composables/useTheme.js` | `toggleTheme()` |
| **布局** | | |
| 三栏布局 | `views/Home.vue` | `ElSplitter` |
| 左侧栏 | `components/sidebar/LeftSidebar.vue` | - |
| 右侧栏 | `components/sidebar/RightSidebar.vue` | - |
| 工具栏 | `components/center/CenterToolbar.vue` | - |

---

## API 接口文件

| 模块 | 文件 | 主要接口 |
|------|------|----------|
| 认证 | `api/auth.js` | `register`, `login`, `logout` |
| 笔记 | `api/note.js` | `createNote`, `updateNote`, `deleteNote`, `getNoteList`, `getNoteDetail`, `searchNotes` |
| 文件夹 | `api/folder.js` | `createFolder`, `getFolderList`, `updateFolder`, `deleteFolder` |
| 标签 | `api/tag.js` | `createTag`, `getTagList`, `bindTag`, `updateTag`, `deleteTag` |
| 文件 | `api/file.js` | `uploadFile`, `getFileList`, `deleteFile`, `getFileStatus`, `getFileInfo`, `pollFileStatus` |
| 用户 | `api/user.js` | `getUserProfile` |

---

## 组件层级关系

```
App.vue
└── router-view
    ├── Login.vue
    ├── Register.vue
    └── Home.vue
        ├── ElSplitter
        │   ├── LeftSidebar
        │   │   ├── LeftToolbar
        │   │   ├── FileTree (递归)
        │   │   └── UserProfile
        │   ├── 中间区
        │   │   ├── CenterToolbar
        │   │   ├── SearchResults
        │   │   ├── NoteListView
        │   │   │   └── NoteCard
        │   │   └── NoteEditor (md-editor-v3)
        │   └── RightSidebar
        │       ├── RightToolbar
        │       ├── FileList
        │       └── TagList
        └── Dialogs
            ├── FolderDialog
            ├── NoteDialog
            └── TagDialog
```

---

## 状态管理（Home.vue）

| 状态 | 类型 | 说明 |
|------|------|------|
| `allNotes` | `Ref<Array>` | 所有笔记 |
| `allFolders` | `Ref<Array>` | 所有文件夹 |
| `selectedFolderId` | `Ref<Number \| null>` | 选中的文件夹ID |
| `selectedNoteId` | `Ref<Number \| null>` | 选中的笔记ID |
| `editingNote` | `Ref<Object \| null>` | 正在编辑的笔记 |
| `saveStatus` | `Ref<String>` | 保存状态 |
| `hasUnsavedChanges` | `Ref<Boolean>` | 是否有未保存更改 |
| `searchKeyword` | `Ref<String>` | 搜索关键词 |
| `searchResults` | `Ref<Array>` | 搜索结果 |
| `allTags` | `Ref<Array>` | 所有标签 |
| `noteTags` | `Ref<Array>` | 当前笔记标签 |
| `noteFiles` | `Ref<Array>` | 当前笔记文件 |
| `allFiles` | `Ref<Array>` | 用户所有文件 |
| `leftCollapsed` | `Ref<Boolean>` | 左侧栏折叠 |
| `rightCollapsed` | `Ref<Boolean>` | 右侧栏折叠 |
| `expandedFolders` | `Ref<Set>` | 展开的文件夹 |

---

## LocalStorage 键名

| 键名 | 类型 | 说明 |
|------|------|------|
| `token` | String | JWT token |
| `userInfo` | JSON String | 用户信息 |
| `calcite-theme` | String | 主题设置 (`dark`/`light`) |
| `calcite:leftCollapsed` | String | 左侧栏折叠 (`"true"`/`"false"`) |
| `calcite:rightCollapsed` | String | 右侧栏折叠 (`"true"`/`"false"`) |

---

## CSS 变量速查

### 背景色
| 变量 | 用途 |
|------|------|
| `--bg-primary` | 主背景 |
| `--bg-secondary` | 次背景（侧边栏） |
| `--bg-tertiary` | 三级背景（输入框、按钮） |
| `--bg-hover` | 悬停背景 |
| `--bg-active` | 激活背景 |

### 文字色
| 变量 | 用途 |
|------|------|
| `--text-primary` | 主文字 |
| `--text-secondary` | 次文字 |
| `--text-muted` | 弱化文字 |
| `--text-inverse` | 反色文字 |

### 强调色
| 变量 | 用途 |
|------|------|
| `--accent-primary` | 主强调色（青绿 #7fbbb3） |
| `--accent-secondary` | 次强调色（绿色 #a7c080） |
| `--accent-warning` | 警告色（橙色） |
| `--accent-error` | 错误色（红色） |

### 边框色
| 变量 | 用途 |
|------|------|
| `--border-primary` | 主边框 |
| `--border-secondary` | 次边框 |
| `--border-accent` | 强调边框 |

---

## 常用 API 调用示例

### 笔记操作
```javascript
import { getNoteList, createNote, updateNote, deleteNote } from '@/api/note'

// 获取笔记列表
const notes = await getNoteList({ folder_id: 1 })

// 创建笔记
const result = await createNote({ title: '新笔记', content: '', folder_id: 1 })

// 更新笔记
await updateNote({ note_id: 1, title: '更新标题', content: '更新内容' })

// 删除笔记
await deleteNote({ note_id: 1 })
```

### 文件上传
```javascript
import { uploadFile, pollFileStatus } from '@/api/file'

const formData = new FormData()
formData.append('file', file)
formData.append('note_id', 1)

const res = await uploadFile(formData, 1)
const fileId = res.file_id

const status = await pollFileStatus(fileId, { interval: 1000, maxAttempts: 60 })
console.log(status.url)
```

### 搜索
```javascript
import { searchNotes } from '@/api/note'

const results = await searchNotes({ keyword: '搜索词', from: 0, size: 20 })
```

---

## 文件上传流程

```
1. 用户选择文件
   ↓
2. NoteEditor.onUploadImg(files, callback)
   ↓
3. uploadFile(formData, noteId) → 返回 file_id
   ↓
4. pollFileStatus(fileId) → 轮询查询状态
   ↓ (最多60秒)
5. status = 'done' → 返回 url
   ↓
6. callback([url]) → 编辑器插入图片
```

---

## 修改主题步骤

1. 打开 `/src/styles/theme.js`
2. 修改 `darkTheme` 或 `lightTheme` 对象中的颜色值
3. 保存后刷新页面即可看到效果

```javascript
export const darkTheme = {
  accent: {
    primary: '#7fbbb3',  // 修改这里改变主强调色
  }
}
```

---

## 调试技巧

### 查看请求
开发环境下控制台会打印请求和响应：

```
请求: GET /api/note/list {folder_id: 1}
响应: /api/note/list 请求参数: {folder_id: 1} 响应数据: {code: 0, data: [...]}
```

### 查看本地存储
```javascript
console.log(localStorage.getItem('token'))
console.log(JSON.parse(localStorage.getItem('userInfo')))
```

### 查看当前主题
```javascript
document.documentElement.getAttribute('data-theme')
```

---

## 常见错误处理

### 401 未授权
- 自动跳转到登录页
- token 已过期，需要重新登录

### 网络错误
- 检查后端服务是否运行在 `http://localhost:8888`
- 检查代理配置是否正确

### 文件上传失败
- 检查文件大小限制
- 检查 MinIO 服务是否正常
- 使用 `pollFileStatus` 轮询查询状态

---

## 相关文档

- [详细开发文档](./dev_guide.md)
- [API 文档](./api.md)
