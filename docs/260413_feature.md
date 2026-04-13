# 文件上传与管理功能操作文档

## 一、功能概述

本文档描述了基于 `md-editor-v3` 的文件上传适配、右侧工具栏改造、文件管理面板开发的实现细节和使用说明。

## 二、修改文件清单

### 2.1 新增文件

| 文件路径 | 说明 |
|---------|------|
| `calcite-web/src/api/file.js` | 文件管理 API 模块，封装所有文件相关接口 |
| `calcite-web/src/components/sidebar/RightToolbar.vue` | 右侧工具栏组件，提供文件/标签切换按钮 |
| `calcite-web/src/components/sidebar/FileList.vue` | 文件列表面板组件，展示已上传文件 |

### 2.2 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `calcite-web/src/components/center/NoteEditor.vue` | 添加 `@onUploadImg` 事件处理，支持异步上传和轮询 |
| `calcite-web/src/components/sidebar/RightSidebar.vue` | 集成工具栏和文件列表，实现面板切换 |
| `calcite-web/src/views/Home.vue` | 添加文件管理相关状态和方法，对接后端 API |
| `calcite-web/src/utils/request.js` | 修复 GET 请求参数日志输出 |

## 三、实现逻辑详解

### 3.1 文件上传流程（核心）

#### 时序图

```
┌─────────┐     ┌─────────────┐     ┌─────────┐     ┌──────┐     ┌───────┐
│  用户   │     │ NoteEditor  │     │ file.js │     │ 后端 │     │ MinIO │
└────┬────┘     └──────┬──────┘     └────┬────┘     └──┬───┘     └───┬───┘
     │                 │                 │             │             │
     │ 粘贴/拖拽图片    │                 │             │             │
     │────────────────>│                 │             │             │
     │                 │                 │             │             │
     │                 │ onUploadImg     │             │             │
     │                 │────────────────>│             │             │
     │                 │                 │             │             │
     │                 │                 │ POST /upload│             │
     │                 │                 │────────────>│             │
     │                 │                 │             │             │
     │                 │                 │ 返回 file_id│             │
     │                 │                 │<────────────│             │
     │                 │                 │             │ 异步上传     │
     │                 │                 │             │────────────>│
     │                 │                 │             │             │
     │                 │ pollFileStatus  │             │             │
     │                 │────────────────>│             │             │
     │                 │                 │             │             │
     │                 │                 │ GET /status │             │
     │                 │                 │────────────>│             │
     │                 │                 │             │<────────────│
     │                 │                 │ 轮询直到 done│             │
     │                 │                 │<────────────│             │
     │                 │                 │             │             │
     │                 │ callback([url]) │             │             │
     │                 │─────────────────────────────────────>│      │
     │                 │                 │             │             │
     │  显示在编辑器中  │                 │             │             │
     │<─────────────────────────────────────────────────────────│      │
```

#### 核心代码逻辑

```javascript
// NoteEditor.vue
const onUploadImg = async (files, callback) => {
  // 1. 并行上传所有文件
  const uploadPromises = files.map(async (file) => {
    // 创建 FormData 并上传
    const formData = new FormData()
    formData.append('file', file)
    
    // 关联当前笔记ID
    if (props.note?.id) {
      formData.append('note_id', String(props.note.id))
    }
    
    const uploadRes = await uploadFile(formData)
    const fileId = uploadRes.file_id
    
    // 2. 轮询查询上传状态
    const statusRes = await pollFileStatus(fileId, {
      interval: 1000,   // 每秒查询一次
      maxAttempts: 60   // 最多轮询60秒
    })
    
    return statusRes.url
  })
  
  // 3. 等待所有上传完成
  const urls = await Promise.all(uploadPromises)
  
  // 4. 调用 callback 回传给编辑器
  callback(validUrls)
}
```

### 3.2 文件列表双模式查看

为了解决文件关联问题，文件列表支持两种查看模式：

1. **当前笔记文件**：只显示与当前编辑笔记关联的文件
2. **所有文件**：显示用户上传的所有文件

用户可以通过列表头部的切换按钮在两种模式间切换。

```
┌─────────────────────────────────────┐
│  当前笔记文件 (0)        [查看全部]  │  ← 点击切换
├─────────────────────────────────────┤
│                                     │
│  暂无上传文件                        │
│  在编辑器中粘贴或拖拽图片即可上传      │
│                                     │
│              [刷新列表]              │
└─────────────────────────────────────┘
```

### 3.3 文件 API 模块

```javascript
// file.js 提供的接口
- uploadFile(formData, noteId)     // 上传文件
- getFileList(params)              // 获取文件列表
- deleteFile(data)                 // 删除文件
- getFileStatus(params)            // 查询文件状态
- getFileInfo(params)              // 获取文件详情
- pollFileStatus(fileId, options)  // 轮询文件状态（辅助方法）
```

## 四、使用说明

### 4.1 上传文件

1. 打开任意笔记进入编辑模式
2. 在编辑器中执行以下操作之一：
   - 直接粘贴剪贴板中的图片（Ctrl+V）
   - 拖拽图片文件到编辑器区域
   - 点击编辑器工具栏的图片按钮选择文件
3. 编辑器会自动上传文件并显示上传进度
4. 上传完成后，图片会自动插入到光标位置

### 4.2 管理文件

1. 点击右侧工具栏的 📄 "已上传文件" 图标
2. 文件列表面板会显示当前笔记的文件或所有文件
3. 使用列表头部的 **"查看全部" / "只看当前笔记"** 按钮切换查看模式
4. 操作选项：
   - **复制链接**：点击复制按钮，将文件URL复制到剪贴板
   - **删除文件**：点击删除按钮，确认后删除文件
5. 点击刷新按钮可手动更新文件列表

### 4.3 切换面板

- 点击 📄 图标 → 显示文件管理面板
- 点击 🏷️ 图标 → 显示标签管理面板

## 五、接口对接说明

### 5.1 后端接口清单

| 接口 | 方法 | 用途 |
|-----|------|------|
| `/api/file/upload` | POST | 上传文件（multipart/form-data） |
| `/api/file/list` | GET | 获取文件列表（支持 note_id 过滤） |
| `/api/file/delete` | POST | 删除文件 |
| `/api/file/status` | GET | 查询上传状态 |
| `/api/file/info` | GET | 获取文件详情 |

### 5.2 异步上传说明

由于后端采用异步上传模式：

1. **上传阶段**：前端 POST 文件后立即返回 `file_id` 和 `status: processing`
2. **轮询阶段**：前端使用 `pollFileStatus()` 每秒查询一次状态
3. **完成阶段**：当 `status` 变为 `done` 时，获取 `url` 并插入编辑器
4. **超时处理**：最多轮询 60 秒，超时后提示用户刷新查看

### 5.3 错误处理

| 场景 | 处理方式 |
|-----|---------|
| 上传请求失败 | ElMessage.error 提示用户 |
| 轮询超时 | 提示"上传超时，请稍后刷新查看" |
| 上传失败（status=failed） | 提示具体文件名和失败信息 |
| 删除失败 | 提示"删除文件失败" |

## 六、组件关系图

```
Home.vue
├── LeftSidebar.vue          # 左侧文件夹树
├── CenterToolbar.vue        # 顶部工具栏
├── NoteListView.vue         # 笔记列表
├── NoteEditor.vue           # 笔记编辑器
│   └── @onUploadImg ───────────────┐
│       └── 调用 file.js 上传和轮询  │
├── RightSidebar.vue         # 右侧面板容器
│   ├── RightToolbar.vue     # 工具栏切换
│   ├── FileList.vue         # 文件列表面板
│   │   ├── 当前笔记文件模式         │
│   │   └── 所有文件模式             │
│   └── TagList.vue          # 标签列表面板
└── file.js                  # 文件 API 模块
    ├── uploadFile()
    ├── pollFileStatus()
    ├── getFileList()
    └── deleteFile()
```

## 七、注意事项

1. **Token 鉴权**：所有文件接口均通过请求拦截器自动添加 Authorization Header
2. **文件关联**：上传时自动关联当前笔记 ID，通过 `note_id` 参数传递
3. **并发上传**：支持多文件同时上传，各自独立轮询状态
4. **编辑器回调**：必须通过 callback 回传 URL，否则编辑器弹窗不会关闭
5. **刷新机制**：打开笔记时自动加载关联文件列表，上传完成后自动刷新

## 八、问题排查记录

### 8.1 文件列表不显示问题

**现象**：
- 点击笔记后，文件列表为空
- 不传 `note_id` 时能返回所有文件
- 传 `note_id` 时返回空数组

**原因分析**：
1. 后端返回 `data: Array(0)` 表示该 `note_id` 下没有关联的文件
2. 可能原因：
   - 文件上传时 `note_id` 没有正确传递
   - 后端没有正确保存 `note_id`
   - 文件是以未关联状态上传的

**解决方案**：
1. 添加调试日志追踪 `note_id` 传递
2. 实现双模式文件列表：
   - 默认显示"当前笔记文件"
   - 提供"查看全部"按钮查看所有文件
3. 在 `FileList.vue` 中添加 `showAllFiles` 状态和切换逻辑

**代码修改**：
```javascript
// FileList.vue - 添加双模式支持
const showAllFiles = ref(false)
const displayFiles = computed(() => {
  return showAllFiles.value ? props.allFiles : props.files
})
```

### 8.2 请求参数日志不显示

**现象**：
- Console 输出 `GET /file/list undefined`

**原因**：
- `request.js` 中打印的是 `config.data`，但 GET 请求的参数在 `config.params`

**修复**：
```javascript
// request.js
const logData = config.method?.toLowerCase() === 'get' 
  ? config.params 
  : config.data
console.log('请求:', config.method?.toUpperCase(), config.url, logData)
```

## 九、扩展建议

1. **进度显示**：可扩展 `pollFileStatus` 支持进度回调，显示上传进度条
2. **缩略图预览**：图片文件可添加缩略图预览功能
3. **拖拽上传**：文件列表面板可支持拖拽上传新文件
4. **批量删除**：支持选择多个文件批量删除
5. **文件搜索**：文件较多时添加搜索过滤功能
