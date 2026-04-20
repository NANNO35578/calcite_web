# 前端最小侵入式重构文档

> 日期：2026-04-20  
> 范围：`calcite-web/src`  
> 目标：移除废弃标签 API、适配笔记 API 变更、接入新增 API、重构右侧栏为笔记管理面板

---

## 一、变更 API 对照表

### 1.1 已废弃 API（彻底删除）

| 接口 | 方法 | 删除内容 |
|------|------|----------|
| `/api/tag/create` | POST | `api/tag.js` 及所有组件/状态引用 |
| `/api/tag/list` | GET | 同上 |
| `/api/tag/bind` | POST | 同上 |
| `/api/tag/update` | POST | 同上 |
| `/api/tag/delete` | POST | 同上 |

### 1.2 已修改 API（严格对齐 api.md）

| 接口 | 变更点 | 前端调整 |
|------|--------|----------|
| `/api/note/create` | 移除 `summary`、`content` 参数 | `Home.vue` 创建笔记时不再传 `content`，仅传 `title`、`folder_id` |
| `/api/note/update` | 新增 `is_public` | `saveCurrentNote` 与 `handleUpdateNote` 均补充 `is_public`；同时补充 `summary` |
| `/api/note/list` | 移除 `tag` 参数 | 当前代码未传 `tag`，无需调整 |
| `/api/note/detail` | 响应新增 `is_public` | `editingNote` 对象直接透传，自然包含新字段 |
| `/api/note/search` | 新增 `isPublic` | `api/note.js` 注释更新，预留参数能力 |

### 1.3 新增 API（已实现封装 + 调用）

| 接口 | 方法 | 封装位置 | 调用位置 |
|------|------|----------|----------|
| `/api/notes/{id}/tags` | GET | `api/note.js` → `getNoteTags(id)` | `RightSidebar.vue` 加载笔记时自动获取 |
| `/api/notes/{id}/tags/ai` | POST | `api/note.js` → `generateNoteTagsAI(id)` | `RightSidebar.vue` 点击"AI生成"按钮 |

---

## 二、删除内容说明

### 2.1 删除文件

- `src/api/tag.js` —— 包含全部 5 个废弃标签接口的封装
- `src/components/sidebar/TagList.vue` —— 原标签列表/增删改 UI 组件
- `src/components/dialogs/TagDialog.vue` —— 原标签新建/编辑弹窗

### 2.2 删除逻辑（Home.vue）

- **状态**：`allTags`、`noteTags`、`tagsLoading`、`tagDialogVisible`、`editingTag`、`tagForm`
- **方法**：`fetchAllTags`、`fetchNoteTags`、`handleSaveTag`、`handleCreateTagInline`、`handleTagDelete`、`handleTagEdit`、`handleTagDeleteAll`、`isTagBound`、`handleTagClick`
- **生命周期**：`onMounted` 中移除 `fetchAllTags()` 初始化调用
- **事件流**：`openNoteEditor` / `closeEditor` / `handleDeleteNote` / `handleSaveNote` 中移除所有 `noteTags.value = []` 及 `fetchNoteTags()` 调用
- **Import**：移除 `@element-plus/icons-vue` 的 `CollectionTag`、移除 `api/tag` 全部引入

### 2.3 删除逻辑（NoteEditor.vue）

- 移除编辑器头部工具栏中的**删除笔记按钮**（迁移至右侧笔记管理面板）
- 移除 `delete` emit

---

## 三、UI 重构说明

### 3.1 重构范围

- `RightToolbar.vue`
- `RightSidebar.vue`
- `CenterToolbar.vue`（右栏切换按钮 tooltip/icon 同步调整）

### 3.2 面板切换

| 原面板 | 新面板 | 说明 |
|--------|--------|------|
| `tags`（标签管理） | `note`（笔记信息） | `activePanel` 默认值同步改为 `note` |

### 3.3 RightSidebar.vue —— 笔记管理面板结构

```
笔记管理面板 (note)
├── note-info-header      —— 仅展示笔记标题
├── 笔记基础信息
│   ├── is_public 开关   —— change 立即触发 updateNote
│   └── summary 文本域   —— blur/输入即时触发 updateNote
├── 文件夹管理
│   └── el-tree-select   —— 基于 allFolders 树形化，修改 folder_id
├── 时间信息
│   ├── created_at
│   └── updated_at
├── 标签展示（只读）
│   ├── el-tag 列表
│   └── 刷新按钮 → /api/notes/{id}/tags/ai
└── 删除功能
    └── 删除笔记按钮（由 editor-header 迁移至此）
```

### 3.4 交互设计

- **is_public / summary / folder_id**：均通过 `update-note` emit 由 `Home.vue` 的 `handleUpdateNote` 统一调用 `/api/note/update`，成功后回写本地 `editingNote`
- **标签刷新**：点击"AI生成"调用 `generateNoteTagsAI`，成功后刷新本地标签列表，无需用户手动保存
- **删除笔记**：点击删除按钮触发 `delete-note` emit，由 `Home.vue` 原 `handleDeleteNote` 执行确认弹窗与删除逻辑

---

## 四、可能影响点（风险）

| 风险点 | 说明 | 缓解措施 |
|--------|------|----------|
| `el-tree-select` 兼容性 | 使用 Element Plus `el-tree-select`（2.2.0+ 支持），项目版本为 `2.13.7`，可用 | 已确认版本兼容 |
| `folder_id` 空值处理 | tree-select 清空时传 `null`，后端要求 `>=0` 表示更新 | `handleFolderChange` 中将空值转为 `0` 传递 |
| 旧用户本地缓存 | `localStorage` 中可能残留旧状态键，但不影响功能 | 无需处理，属正常残留 |
| 其他页面/组件引用 | 全局 grep 确认 `src` 下无废弃 tag API 调用 | 已执行构建通过 |
| 主题变量残留 | `styles/theme.css` 与 `theme.js` 中仍有 `--component-tag-*` 变量 | 仅为 CSS 主题 token，不影响运行时逻辑，未做删除（避免侵入主题系统） |
| 右侧栏默认展开 | 原默认展开标签面板，现默认展开笔记信息面板 | 行为变更符合产品预期 |

---

## 五、自检结论

- [x] 无 `/api/tag/*` 废弃接口残留引用
- [x] `createNote` 不再携带 `content`
- [x] `updateNote` 已支持 `is_public`、`summary`
- [x] 新增 `getNoteTags`、`generateNoteTagsAI` 已封装并接入 UI
- [x] `vite build` 编译通过，无报错
- [x] 删除按钮已从 `NoteEditor` 迁移至 `RightSidebar`
- [x] 代码风格与现有项目保持一致（Composition API、Element Plus）
