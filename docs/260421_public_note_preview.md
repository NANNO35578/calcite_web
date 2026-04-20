# 公开笔记预览与搜索结果重构

> 日期：2026-04-21
> 说明：实现其他人的公开笔记预览界面，重构搜索结果与右侧笔记信息面板以支持公开笔记场景。

---

## 1. 需求概述

1. **搜索结果界面**：区分"搜索自己笔记"与"搜索公开笔记"两种结果展示。
2. **右侧工具栏**：当查看其他人的公开笔记时，显示只读的"预览笔记信息面板"。
3. **公开笔记预览界面**：新建预览组件，支持 Markdown 只读渲染、点赞/收藏交互。

---

## 2. 文件变更清单

| 类型 | 文件路径 | 说明 |
|------|---------|------|
| 修改 | `calcite-web/src/api/note.js` | 新增 `viewNote`、`likeNote`、`collectNote`、`unlikeNote`、`uncollectNote` |
| 修改 | `calcite-web/src/views/Home.vue` | 集成预览状态、区分公开/个人笔记点击、条件渲染 |
| 修改 | `calcite-web/src/components/sidebar/SearchResults.vue` | 根据 `author_id` 区分搜索结果视图，支持 `public-note-click` 事件 |
| 修改 | `calcite-web/src/components/sidebar/RightSidebar.vue` | 新增 `isPreview` prop，实现预览笔记信息面板 |
| 新增 | `calcite-web/src/components/center/PublicNotePreview.vue` | 公开笔记预览界面组件 |

---

## 3. 核心实现细节

### 3.1 区分公开笔记搜索结果

在 `SearchResults.vue` 中，通过计算属性 `isPublicSearch` 判断：

```javascript
const isPublicSearch = computed(() => {
  if (!props.results || props.results.length === 0) return false
  const first = props.results[0]
  if (first.author_id === undefined) return false
  return first.author_id !== props.userId
})
```

- 返回结果数组中每个元素包含 `author_id` 字段。
- 若 `author_id` 与用户 `userId` 相同，则判定为个人笔记搜索；否则为公开笔记搜索。
- 公开搜索结果列表项会额外展示作者 ID，标题文本也相应变为"公开笔记搜索结果"。

### 3.2 笔记点击行为分流

在 `Home.vue` 的 `handleNoteClick` 中：

```javascript
const currentUserId = userInfo.value?.user_id
if (note.author_id !== undefined && note.author_id !== currentUserId) {
  // 其他人的公开笔记
  await handlePublicNoteClick(note)
  return
}
// 自己的笔记 → 原有 openNoteEditor 逻辑
```

`handlePublicNoteClick` 流程：
1. 调用 `POST /api/note/view` 记录浏览行为。
2. 调用 `GET /api/note/detail` 获取笔记完整详情。
3. 写入 `previewingNote` ref，触发 `PublicNotePreview` 组件渲染。

### 3.3 公开笔记预览界面（PublicNotePreview.vue）

参考 `NoteEditor.vue` 顶部栏布局，关键差异：

| 区域 | 编辑模式（NoteEditor） | 预览模式（PublicNotePreview） |
|------|----------------------|---------------------------|
| 标题 | `el-input` 可编辑 | `span.title-text` 只读展示 |
| 头部操作 | 保存状态 + 保存按钮 | 点赞按钮 + 收藏按钮（带计数） |
| Markdown | 可编辑，带工具栏 | `preview-only=true`，`toolbars=[]` |

点赞/收藏按钮内部直接调用 API：
- `POST /api/note/like`
- `POST /api/note/collect`
- `DELETE /api/notes/like`
- `DELETE /api/notes/collect`

操作成功后通过 `emit('update:note', updatedNote)` 同步更新父级状态，确保右侧信息面板计数实时刷新。

### 3.4 右侧预览笔记信息面板（RightSidebar.vue）

新增 `isPreview` prop（Boolean）。当为 `true` 时，渲染只读面板，展示：

- 笔记标题
- 点赞总数、收藏总数
- 摘要（纯文本，不可修改）
- 创建时间、修改时间
- 标签（只读列表，无 AI 生成按钮）
- 作者 ID

原有面板（自己的笔记）完全保留，包含公开开关、摘要输入框、文件夹选择、删除按钮等全部功能。

### 3.5 Home.vue 条件渲染调整

中间内容区渲染优先级：

1. `searchKeyword && !editingNote && !previewingNote` → `SearchResults`
2. `!editingNote && !previewingNote` → `NoteListView`
3. `previewingNote` → `PublicNotePreview`
4. `editingNote` → `NoteEditor`

右侧栏传参：

```vue
<RightSidebar
  :editing-note="previewingNote || editingNote"
  :is-preview="!!previewingNote"
  ...
/>
```

---

## 4. API 对接

### 新增前端 API 封装（`src/api/note.js`）

```javascript
export function viewNote(data) {
  return request({ url: '/note/view', method: 'post', data })
}

export function likeNote(data) {
  return request({ url: '/note/like', method: 'post', data })
}

export function collectNote(data) {
  return request({ url: '/note/collect', method: 'post', data })
}

export function unlikeNote(data) {
  return request({ url: '/notes/like', method: 'delete', data })
}

export function uncollectNote(data) {
  return request({ url: '/notes/collect', method: 'delete', data })
}
```

### 后端接口参考

| 接口 | 方法 | 用途 | 文档位置 |
|------|------|------|---------|
| `/api/note/view` | POST | 浏览笔记 | `docs/api.md` L:467-496 |
| `/api/note/like` | POST | 点赞笔记 | `docs/api.md` L:497-531 |
| `/api/note/collect` | POST | 收藏笔记 | `docs/api.md` L:532-566 |
| `/api/notes/like` | DELETE | 取消点赞 | `docs/api.md` L:567-596 |
| `/api/notes/collect` | DELETE | 取消收藏 | `docs/api.md` L:597-626 |

---

## 5. 数据字段约定

预览功能依赖 `/api/note/detail` 返回的以下字段：

- `author_id`：用于判断是否为其他人的笔记。
- `like_count` / `collect_count`：用于展示统计（可选，缺失时显示 0）。
- `is_liked` / `is_collected`：用于按钮高亮状态（可选，缺失时默认未点赞/未收藏）。

---

## 6. 构建验证

执行 `npm run build` 通过，无编译错误：

```bash
cd calcite-web && npm run build
# ✓ built in 7.58s
```

---

## 7. 后续可优化点

1. **点赞/收藏状态初始化**：当前依赖 `detail` 接口返回 `is_liked` / `is_collected`；若后端未返回，可在打开预览时额外请求用户行为状态接口。
2. **作者信息展示**：目前仅展示 `author_id`，后续可扩展为用户名/头像。
3. **返回搜索结果保留选中态**：关闭预览后 `selectedNoteId` 被清空，如需保留高亮可在 `closePreview` 中选择性保留。
