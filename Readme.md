# Calcite Web

智能笔记管理系统Web端

> 本项目为「智能笔记管理系统」的 Web 前端部分，采用 Vue 3 + Vite 技术栈构建，提供三栏式笔记编辑与管理界面，支持 Markdown 编辑、全文搜索、OCR 识别、公开笔记浏览与推荐等功能。

---

## 功能特性

| 模块 | 功能说明 |
|------|---------|
| **笔记管理** | Markdown 实时编辑、自动保存、文件夹树形组织、笔记创建/删除/移动 |
| **全文搜索** | 基于 Elasticsearch 的关键词高亮搜索，支持「与我相关」和「公开笔记」双范围筛选 |
| **公开笔记** | 浏览他人公开笔记、点赞、收藏、查看作者信息 |
| **智能推荐** | 基于后端算法的笔记推荐流 |
| **OCR 识别** | 上传图片/PDF 自动识别文字并生成笔记（异步轮询状态） |
| **文件管理** | 图片/文件上传至 MinIO，支持复制链接插入 Markdown |
| **AI 标签** | 调用后端 AI 服务自动为笔记生成标签 |
| **主题切换** | Everforest 深色/浅色双主题，全局 CSS 变量驱动，支持手动切换与系统跟随 |
| **响应式布局** | 桌面端三栏拖拽布局，移动端（<768px）自动折叠侧边栏 |
| **快捷键** | `Ctrl+S` 保存笔记、`Esc` 退出编辑/预览 |

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.24 | 前端框架，Composition API |
| Vue Router | 4.6.4 | 前端路由管理 |
| Pinia | 3.0.4 | 全局状态管理 |
| Element Plus | 2.13.7 | UI 组件库 |
| md-editor-v3 | 6.4.2 | Markdown 编辑器与预览 |
| Axios | 1.13.2 | HTTP 客户端 |
| Vite | 7.2.4 | 构建工具与开发服务器 |
| TypeScript | 6.0.3 | 核心模块类型定义（渐进式迁移） |
| Vitest | 4.1.4 | 单元测试框架 |
| Everforest | — | 配色主题系统 |

---

## 项目结构

```
calcite-web/
├── index.html                    # HTML 入口
├── package.json                  # 依赖与脚本
├── vite.config.js                # Vite 配置（含代理与代码分割）
├── vitest.config.js              # Vitest 测试配置
├── tsconfig.json                 # TypeScript 配置
├── public/                       # 静态资源
└── src/
    ├── main.js                   # 应用入口：注册 Pinia、Element Plus、初始化主题
    ├── App.vue                   # 根组件
    ├── style.css                 # 全局基础样式
    ├── api/                      # API 接口层（按业务模块划分）
    │   ├── auth.js               # 认证：注册、登录、退出
    │   ├── note.js               # 笔记：CRUD、搜索、标签、点赞/收藏/推荐
    │   ├── folder.js             # 文件夹：CRUD
    │   ├── file.js               # 文件：上传、列表、删除、状态轮询
    │   ├── ocr.js                # OCR：提交识别任务、状态轮询
    │   └── user.js               # 用户：获取个人信息
    ├── components/               # 组件（按功能区域分组）
    │   ├── FileTree.vue          # 递归文件树（懒加载）
    │   ├── center/               # 中间内容区组件
    │   │   ├── CenterToolbar.vue
    │   │   ├── NoteList.vue
    │   │   ├── NoteListView.vue
    │   │   ├── NoteCard.vue
    │   │   ├── NoteEditor.vue    # Markdown 编辑器
    │   │   └── PublicNotePreview.vue
    │   ├── dialogs/              # 对话框组件
    │   │   ├── FolderDialog.vue
    │   │   └── NoteDialog.vue
    │   └── sidebar/              # 侧边栏组件
    │       ├── LeftSidebar.vue
    │       ├── LeftToolbar.vue
    │       ├── RightSidebar.vue
    │       ├── RightToolbar.vue
    │       ├── FileList.vue
    │       ├── SearchBox.vue
    │       ├── SearchResults.vue
    │       └── UserProfile.vue
    ├── composables/              # 组合式函数
    │   └── useTheme.js           # 主题管理（深色/浅色切换）
    ├── router/
    │   └── index.js              # 路由配置与守卫（懒加载）
    ├── stores/                   # Pinia 状态管理
    │   ├── index.js              # Store 统一导出
    │   ├── user.js               # 用户状态
    │   ├── layout.js             # 布局状态（侧边栏折叠、移动端检测）
    │   ├── folder.js             # 文件夹状态
    │   ├── note.js               # 笔记状态（编辑、搜索、推荐）
    │   ├── file.js               # 文件状态
    │   └── dialog.js             # 对话框状态
    │   └── __tests__/            # 单元测试
    │       ├── layout.spec.js
    │       └── user.spec.js
    ├── styles/                   # 主题样式
    │   ├── theme.js              # 主题配置对象与 CSS 变量生成
    │   └── theme.css             # CSS 变量基础定义
    ├── types/                    # TypeScript 类型定义
    │   └── index.ts              # UserInfo、Note、Folder、FileItem 等核心接口
    └── utils/
        └── request.js            # Axios 封装（拦截器、统一错误处理）
```

---

## 快速开始

```bash
cd calcite-web

# 安装依赖
npm install

# 启动开发服务器（代理后端 localhost:8888）
npm run dev

# 生产构建
npm run build

# 运行单元测试
npm run test:run

# 预览生产构建
npm run preview
```

开发环境下，前端请求 `/api/xxx` 会通过 Vite 代理转发至 `http://localhost:8888/api/xxx`。

---

## 核心架构

### Pinia 状态管理

项目采用 **Pinia + Setup Store** 模式进行状态管理，按业务域拆分为 6 个 Store：

- `useUserStore` — 用户信息、登录态
- `useLayoutStore` — 侧边栏折叠、移动端检测
- `useFolderStore` — 文件夹树、选中状态、展开状态
- `useNoteStore` — 笔记列表、编辑器、搜索、推荐
- `useFileStore` — 文件列表、上传状态
- `useDialogStore` — 文件夹/笔记对话框状态

### 主题系统

采用 **Everforest** 配色，通过 CSS 变量（`--bg-primary`、`--text-primary` 等）实现深色/浅色切换。主题配置位于 `src/styles/theme.js`，切换逻辑位于 `src/composables/useTheme.js`。

### 代码分割

`vite.config.js` 中配置了 `manualChunks`，将第三方库拆分为独立 chunk：
- `vendor` — Vue、Vue Router、Pinia、Axios
- `element-plus` — UI 组件库
- `md-editor` — Markdown 编辑器

路由采用 `() => import()` 懒加载，首页业务代码仅 ~52KB（gzip 后 ~16KB）。

### 单元测试

使用 **Vitest + @vue/test-utils** 对核心 Store 进行单元测试，涵盖：
- 状态初始化与修改
- 异步 API 调用（Mock）
- 错误降级与 localStorage 回退
- 移动端布局检测

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [docs/api.md](./docs/api.md) | 后端 REST API 完整文档 |
| [docs/dev_guide.md](./docs/dev_guide.md) | 开发指南（组件说明、常见任务） |
| [docs/component_api.md](./docs/component_api.md) | 组件 API 文档 |
| [docs/quick_ref.md](./docs/quick_ref.md) | 快速参考 |

迭代记录见 `docs/260*.md`（按日期命名的历次开发/重构/热修记录）。

---

## 许可证

MIT
