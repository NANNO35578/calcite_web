# Calcite Web —— 智能笔记管理系统 Web 端

> 本文档面向 AI Coding Agent，旨在帮助 Agent 快速理解项目结构、技术栈与开发规范。项目主要使用中文进行注释与文档编写。

---

## 项目概述

Calcite Web 是一个基于 **Vue 3 + Vite** 构建的单页应用（SPA），作为智能笔记管理系统的 Web 前端。它提供三栏式笔记编辑与管理界面，支持 Markdown 编辑、文件夹树形管理、全文搜索、文件上传、OCR 识别、公开笔记浏览与推荐等功能。

项目采用 **Everforest** 配色主题，支持深色/浅色模式切换。所有 UI 文本与代码注释均以中文为主。

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.24 | 前端框架，使用 Composition API (`<script setup>`) |
| Vue Router | 4.6.4 | 前端路由管理 |
| Element Plus | 2.13.7 | UI 组件库 |
| md-editor-v3 | 6.4.2 | Markdown 编辑器 |
| Axios | 1.13.2 | HTTP 客户端 |
| Vite | 7.2.4 | 构建工具与开发服务器 |

> **注意**：项目未使用 Pinia / Vuex 进行状态管理，状态通过 Vue 3 的 `ref` / `reactive` 在组件间传递（主要是 `Home.vue` 作为中央容器）。项目目前也未配置任何测试框架或 ESLint/Prettier。

---

## 目录结构

```
calcite-web/                  # 前端项目根目录
├── index.html                # HTML 入口
├── package.json              # 依赖与脚本
├── vite.config.js            # Vite 配置（含代理）
├── public/                   # 静态资源
└── src/
    ├── main.js               # 应用入口：注册插件、初始化主题
    ├── App.vue               # 根组件（仅渲染 <router-view/>）
    ├── style.css             # 全局基础样式（Everforest 配色）
    ├── api/                  # API 接口层（按业务模块划分）
    │   ├── auth.js           # 认证：注册、登录、退出
    │   ├── note.js           # 笔记：CRUD、搜索、标签、点赞/收藏/推荐
    │   ├── folder.js         # 文件夹：CRUD
    │   ├── file.js           # 文件：上传、列表、删除、状态轮询
    │   ├── ocr.js            # OCR：提交识别任务、状态轮询
    │   └── user.js           # 用户：获取个人信息
    ├── components/           # 组件（按功能区域分组）
    │   ├── FileTree.vue      # 递归文件树（文件夹 + 笔记）
    │   ├── center/           # 中间内容区组件
    │   │   ├── CenterToolbar.vue    # 顶部工具栏（搜索、推荐、侧栏切换）
    │   │   ├── NoteList.vue         # 笔记列表
    │   │   ├── NoteListView.vue     # 笔记列表视图容器
    │   │   ├── NoteCard.vue         # 笔记卡片
    │   │   ├── NoteEditor.vue       # Markdown 编辑器（md-editor-v3）
    │   │   └── PublicNotePreview.vue # 公开笔记预览
    │   ├── dialogs/          # 对话框组件
    │   │   ├── FolderDialog.vue     # 文件夹创建/重命名
    │   │   └── NoteDialog.vue       # 笔记创建
    │   ├── layout/           # 布局组件（当前为空目录占位）
    │   └── sidebar/          # 侧边栏组件
    │       ├── LeftSidebar.vue      # 左侧边栏（文件树容器）
    │       ├── LeftToolbar.vue      # 左侧工具栏
    │       ├── RightSidebar.vue     # 右侧边栏（标签、文件、用户信息）
    │       ├── RightToolbar.vue     # 右侧工具栏
    │       ├── FileList.vue         # 文件列表
    │       ├── SearchBox.vue        # 搜索输入框
    │       ├── SearchResults.vue    # 搜索结果展示
    │       └── UserProfile.vue      # 用户信息面板
    ├── composables/          # 组合式函数
    │   └── useTheme.js       # 主题管理（深色/浅色切换）
    ├── router/
    │   └── index.js          # 路由配置与守卫
    ├── styles/               # 主题样式
    │   ├── theme.css         # 主题相关 CSS
    │   └── theme.js          # 主题配置对象与 CSS 变量生成
    ├── utils/
    │   └── request.js        # Axios 封装（拦截器、错误处理）
    └── views/                # 页面级视图
        ├── Login.vue         # 登录页
        ├── Register.vue      # 注册页
        └── Home.vue          # 主页（三栏布局容器，核心状态管理）

docs/                         # 项目文档
├── api.md                    # 后端 REST API 完整文档
├── dev_guide.md              # 开发指南（组件说明、常见任务）
├── component_api.md          # 组件 API 文档
└── 260*.md                   # 历次迭代/热修/重构记录（按日期命名）
```

---

## 构建与运行

所有命令均在 `calcite-web/` 目录下执行：

```bash
# 安装依赖
npm install

# 启动开发服务器（默认监听 localhost，含代理配置）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

### 开发服务器代理

`vite.config.js` 中配置了开发代理，将 `/api` 转发到后端服务：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8888',
      changeOrigin: true,
      secure: false
    }
  }
}
```

开发环境下前端请求 `/api/xxx`，实际由 `http://localhost:8888/api/xxx` 处理；生产构建后直接请求 `http://localhost:8888`。

---

## 架构与状态管理

### 页面层级

```
App.vue
└── router-view
    ├── Login.vue
    ├── Register.vue
    └── Home.vue （主页面，唯一需要登录的页面）
        └── el-splitter （三栏拖拽布局）
            ├── LeftSidebar  （20%，文件树）
            ├── 中间内容区   （60%，自适应）
            │   ├── CenterToolbar
            │   ├── SearchResults / NoteListView / NoteEditor / PublicNotePreview
            │   └── 各类 Dialog
            └── RightSidebar （20%，标签/文件/用户）
```

### 状态管理策略

项目**未使用 Pinia/Vuex**。`Home.vue` 作为中央状态容器，通过 Props 向下传递状态、通过 Events 向上接收操作：

- `allNotes` / `allFolders`：所有笔记与文件夹
- `editingNote`：当前正在编辑的笔记对象
- `previewingNote`：当前预览的公开笔记
- `searchKeyword` / `searchResults`：搜索状态
- `leftCollapsed` / `rightCollapsed`：侧边栏折叠状态

子组件通过 `emit` 通知 `Home.vue` 进行数据变更，再由 `Home.vue` 调用 API 并刷新状态。

---

## API 规范

### 请求封装 (`src/utils/request.js`)

所有 API 通过统一封装的 Axios 实例发起请求：

- **开发环境 baseURL**：`/api`（走 Vite 代理）
- **生产环境 baseURL**：`http://localhost:8888`
- **请求拦截器**：自动从 `localStorage` 读取 `token` 并注入 `Authorization: Bearer {token}`
- **响应拦截器**：
  - 统一响应格式 `{ code, message, data }`，`code !== 0` 时自动 `ElMessage.error` 并 reject
  - 返回 `res.data`（脱壳后的实际数据）
  - `401` 时清除 token 与 userInfo，跳转 `/login`
  - 网络错误时给出明确提示（检查后端是否在 `localhost:8888` 运行、CORS 是否配置）

### API 模块列表

| 文件 | 功能 |
|------|------|
| `auth.js` | `register`, `login`, `logout` |
| `note.js` | `createNote`, `updateNote`, `deleteNote`, `getNoteList`, `getNoteDetail`, `searchNotes`, `getNoteTags`, `generateNoteTagsAI`, `viewNote`, `likeNote`, `collectNote`, `unlikeNote`, `uncollectNote`, `getRecommendNotes` |
| `folder.js` | `createFolder`, `getFolderList`, `updateFolder`, `deleteFolder` |
| `file.js` | `uploadFile`, `getFileList`, `deleteFile`, `getFileStatus`, `getFileInfo`, `pollFileStatus` |
| `ocr.js` | `recognizeOCR`, `getOCRStatus`, `pollOCRStatus` |
| `user.js` | `getUserProfile` |

### 文件上传与 OCR 的异步轮询

文件上传和 OCR 识别均采用**异步提交 + 轮询状态**模式：

1. 提交文件，立即返回 `file_id` 与 `status: 'processing'`
2. 使用 `pollFileStatus(fileId, { interval, maxAttempts })` 或 `pollOCRStatus(...)` 轮询
3. 状态变为 `'done'` 后获取最终 URL 或生成的 `note_id`

---

## 主题系统

项目使用 **Everforest** 配色，通过 CSS 变量实现深色/浅色切换。

### 关键文件

- `src/styles/theme.js`：主题配置对象（`darkTheme` / `lightTheme`）与 `themeToCSSVariables()` 转换函数
- `src/styles/theme.css`：CSS 变量基础定义
- `src/composables/useTheme.js`：组合式函数，提供 `currentTheme`, `isDark`, `toggleTheme()`, `setTheme()`
- `src/App.vue`：覆盖 Element Plus 的 `--el-*` 变量以匹配 Everforest

### 使用方式

组件中应优先使用 CSS 变量：

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

修改第三方组件样式时使用 `:deep()`：

```css
.markdown-editor :deep(.md-editor) {
  background-color: var(--bg-secondary) !important;
}
```

---

## 路由与权限

`src/router/index.js` 配置：

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 重定向到 `/login` | |
| `/login` | Login.vue | 已登录用户会重定向到 `/home` |
| `/register` | Register.vue | 已登录用户会重定向到 `/home` |
| `/home` | Home.vue | `meta.requiresAuth: true`，未登录跳 `/login` |

路由守卫通过 `localStorage.getItem('token')` 判断登录状态。

---

## 本地存储（localStorage）

| Key | 说明 |
|-----|------|
| `token` | JWT 认证令牌 |
| `userInfo` | 用户信息 JSON 字符串 |
| `calcite:leftCollapsed` | 左侧栏折叠状态 |
| `calcite:rightCollapsed` | 右侧栏折叠状态 |
| `calcite-theme` | 当前主题（`dark` / `light`） |

---

## 代码风格指南

1. **语言**：代码注释、变量命名（如 `editingNote`, `saveStatus`）、文档均以中文为主。
2. **组件风格**：使用 Vue 3 `<script setup>` 语法。
3. **样式**：
   - 组件内使用 `<style scoped>`
   - 优先使用项目自定义的 CSS 变量（`--bg-primary`, `--text-primary` 等）确保主题兼容
   - 覆盖 Element Plus 或 md-editor-v3 时使用 `:deep()`
4. **API 调用**：
   - 统一使用 `src/utils/request.js` 导出的实例
   - 参数和返回值参考 `docs/api.md`
   - 错误已由拦截器统一处理，业务代码通常只需 `try { ... } catch { }` 并在成功时提示
5. **新增组件**：
   - 按功能放入 `components/center/`、`components/sidebar/` 或 `components/dialogs/`
   - 对话框使用 `ElDialog` + `el-form` 结构，Props 定义 `visible`，Emits 定义 `update:visible` 与 `confirm`

---

## 测试说明

**当前项目未配置任何测试框架**（无 Jest/Vitest/Cypress）。

如需添加测试，建议安装 Vitest（与 Vite 生态一致）：

```bash
npm install -D vitest @vue/test-utils
```

---

## 安全注意事项

1. **Token 存储**：JWT 存储在 `localStorage` 中，存在 XSS 风险。确保不对用户输入执行 `v-html` 或 `innerHTML`。
2. **401 处理**：响应拦截器在收到 401 时会强制清除 token 并跳转登录页，防止残留无效凭证。
3. **CORS**：开发环境依赖 Vite 代理解决跨域，生产环境需确保后端正确配置 CORS。
4. **文件上传**：异步上传使用轮询查询状态，避免前端长时间挂起请求。

---

## 关键文件速查

| 文件路径 | 功能 |
|---------|------|
| `calcite-web/src/main.js` | 应用入口，注册 Element Plus、初始化主题 |
| `calcite-web/src/App.vue` | 根组件，定义全局 CSS 与 Element Plus 主题覆盖 |
| `calcite-web/src/views/Home.vue` | 主页面，三栏布局容器与核心状态管理 |
| `calcite-web/src/router/index.js` | 路由配置与路由守卫 |
| `calcite-web/src/utils/request.js` | Axios 封装，含拦截器与统一错误处理 |
| `calcite-web/src/api/note.js` | 笔记相关 API |
| `calcite-web/src/api/file.js` | 文件上传与轮询 API |
| `calcite-web/src/api/ocr.js` | OCR 识别与轮询 API |
| `calcite-web/src/styles/theme.js` | 主题配置与 CSS 变量生成 |
| `calcite-web/src/composables/useTheme.js` | 主题管理组合式函数 |
| `calcite-web/vite.config.js` | Vite 配置与开发代理 |
| `docs/api.md` | 后端 REST API 完整文档 |
| `docs/dev_guide.md` | 开发指南与组件详细说明 |
