# 前端重构 BugFix 文档

> 日期：2026-04-20  
> 前置文档：`260420_frontend_refactor.md`

---

## 一、问题清单与修复对照

### Bug 1：标签 API 路径与参数格式错误

**现象**  
浏览器 Console 输出：
```
请求: GET /notes/103/tags undefined
响应: /notes/103/tags 请求参数: undefined 响应数据: {code: 1, message: '笔记ID不能为空'}
```

**根因**  
`api/note.js` 中将 `note_id` 作为**路径参数**拼接为 `/notes/${id}/tags` 与 `/notes/${id}/tags/ai`，与实际后端接口约定不符。

**修复**  
改为标准 query/body 传参：

| 函数 | 方法 | 修正前 URL | 修正后 URL | 传参方式 |
|------|------|------------|------------|----------|
| `getNoteTags` | GET | `/notes/${id}/tags` | `/notes/tags` | `params: { note_id }` |
| `generateNoteTagsAI` | POST | `/notes/${id}/tags/ai` | `/notes/tags/ai` | `data: { note_id }` |

**涉及文件**：`src/api/note.js`

---

### Bug 2：`is_public` 开关与响应数据不同步

**现象**  
打开任意笔记，`is_public` 开关始终显示为关闭（`false`），即使后端返回公开状态。

**根因**  
后端 `/api/note/detail` 返回的 `is_public` 字段为**整数** `0` 或 `1`，而 `el-switch` 组件绑定值为 **boolean**。`0` 在 JS 中虽为 falsy，但 `el-switch` 对非严格 boolean 的解析存在歧义，导致 UI 未正确同步。

**修复**  
在 `Home.vue` 的 `openNoteEditor` 中，将后端返回的 `is_public` 显式转换为 boolean：

```javascript
editingNote.value = {
  ...data,
  id: data.id || data.note_id,
  folder_id: data.folder_id || data.folderId,
  is_public: !!data.is_public   // 0/1 → false/true
}
```

**涉及文件**：`src/views/Home.vue`

---

### Bug 3：右侧栏字段变更即时提交（引发多余请求）

**现象**  
用户在右侧笔记管理面板中每修改一次 `is_public`、`summary` 或 `folder_id`，都会立即触发一次 `/note/update` 请求。

**根因**  
`RightSidebar.vue` 中三个字段的变更处理器直接 `emit('update-note', payload)`，由 `Home.vue` 的 `handleUpdateNote` 即时调用 API。

**修复**  
1. `RightSidebar.vue` 中事件名由 `update-note` 改为 `note-field-change`，处理器仅透传字段值，不再涉及网络请求。
2. `Home.vue` 中新增 `handleNoteFieldChange(payload)`：
   - 仅执行 `Object.assign(editingNote.value, payload)` 更新本地状态
   - 设置 `hasUnsavedChanges.value = true` 与 `saveStatus.value = '有未保存的更改...'`
   - **不调用 API**

**涉及文件**：
- `src/components/sidebar/RightSidebar.vue`
- `src/views/Home.vue`

---

## 二、新增功能：手动保存按钮

### 需求
在编辑器头部增加"保存"按钮，右侧栏的元数据（`is_public`、`summary`、`folder_id`）仅在用户点击保存时统一提交。

### 实现

1. **NoteEditor.vue**
   - Header Actions 区域新增 `el-button`（type="primary"，icon="Check"）
   - 点击 emit `save` 事件

2. **Home.vue**
   - `NoteEditor` 监听 `@save="handleSaveNoteManual"`
   - 新增 `handleSaveNoteManual`：
     ```javascript
     const handleSaveNoteManual = async () => {
       if (!editingNote.value) return
       hasUnsavedChanges.value = true
       await saveCurrentNote()
     }
     ```
   - `saveCurrentNote` 逻辑保持不变：自动读取 `editingNote` 上的全部字段（`title`、`content`、`summary`、`folder_id`、`is_public`）统一提交。

### 交互说明
- **正文编辑**：仍保留 2 秒防抖自动保存（`handleNoteChange` → `saveCurrentNote`）
- **元数据修改**：仅修改本地状态，不触发网络请求
- **点击保存**：强制触发 `saveCurrentNote`，一次性提交所有变更（包括正文与元数据）
- **切换笔记/返回列表**：若 `hasUnsavedChanges === true`，仍然弹出"是否保存"确认框，逻辑不变

**涉及文件**：
- `src/components/center/NoteEditor.vue`
- `src/views/Home.vue`

---

## 三、自检结论

- [x] `vite build` 编译通过，无报错
- [x] `/notes/tags` 与 `/notes/tags/ai` 参数格式修正为 `{ note_id }`
- [x] `is_public` 在打开笔记时正确同步为 boolean
- [x] 右侧栏字段变更不再即时发请求
- [x] 编辑器头部新增"保存"按钮，可手动触发统一保存
- [x] 原有自动保存机制未被破坏
