# 笔记历史页面 —— 前端实现计划文档

> 目标：在 Web 前端新增「笔记历史」弹窗页面，仅用于 UI 截图展示，不实现后端细节，全部使用 Mock 数据。

---

## 一、需求概述

在右侧栏「笔记信息」面板中增加「笔记历史」入口按钮。点击后弹出大尺寸的笔记历史弹窗，展示当前笔记的版本历史列表，并提供基本的版本管理操作。

### 交互流程

1. 用户在右侧栏笔记信息面板中点击「笔记历史」按钮；
2. 弹出 `NoteHistoryDialog` 弹窗，宽度 `700px`；
3. 弹窗顶部为工具栏，包含「保存当前版本为历史」和「清空历史」两个按钮；
4. 下方为历史列表，最顶端固定展示「当前编辑版本」（只读展示当前笔记的标题和更新时间）；
5. 历史列表中每一条历史显示：版本序号、最后更新时间、操作按钮「恢复此版本」；
6. 点击「恢复此版本」将对应历史版本的内容覆盖到当前编辑笔记中（前端 Mock 实现）。

---

## 二、涉及文件清单

| 类型 | 文件路径 | 说明 |
|------|----------|------|
| **新增** | `src/components/dialogs/NoteHistoryDialog.vue` | 笔记历史弹窗组件 |
| **修改** | `src/stores/dialog.js` | 增加笔记历史弹窗状态管理 |
| **修改** | `src/stores/note.js` | 增加历史版本 Mock 数据与操作方法 |
| **修改** | `src/components/sidebar/RightSidebar.vue` | 在笔记信息面板添加「笔记历史」按钮 |
| **修改** | `src/views/Home.vue` | 注册弹窗组件并处理恢复事件 |

> 不修改后端代码，不新增真实 API 调用。若需在 `src/api/note.js` 中预留空壳函数以保持代码结构完整，可在实现时自行判断，但函数内部直接返回 Mock 数据即可。

---

## 三、Mock 数据策略

在 `note.js` Store 中维护一个响应式对象 `noteHistories`，结构如下：

```js
const noteHistories = ref({
  // noteId: [historyItem, ...]
  // 示例：
  // 1: [
  //   { id: 'h_1_1', content: '历史版本内容1', updated_at: '2026-05-10T10:00:00', version: 1 },
  //   { id: 'h_1_2', content: '历史版本内容2', updated_at: '2026-05-12T14:30:00', version: 2 },
  // ]
})
```

- **保存当前版本**：将当前 `editingNote.content` 和 `editingNote.title` 打包为一个新的历史项，push 到对应 `noteId` 的数组中，`version` 自动递增。
- **清空历史**：将该 `noteId` 对应的历史数组清空。
- **恢复版本**：将选中历史项的 `content` 覆盖到 `editingNote.content` 中，并给出 `ElMessage.success('已恢复到历史版本')`。
- **初始数据**：为当前已有笔记预填充 2~3 条 Mock 历史数据，确保弹窗打开即有内容展示，方便截图。

---

## 四、UI 设计规范

弹窗内部布局：

```
┌─ 笔记历史 —— 《笔记标题》 ──────────────┐
│ [保存当前版本为历史]  [清空历史]        │  ← 工具栏
├────────────────────────────────────────┤
│ ▶ 当前编辑版本                         │  ← 列表第一项，特殊高亮
│   最后更新：2026-05-15 18:00:00        │
├────────────────────────────────────────┤
│ 版本 3                                 │  ← 历史项
│ 最后更新：2026-05-14 10:00:00    [恢复]│
├────────────────────────────────────────┤
│ 版本 2                                 │
│ 最后更新：2026-05-12 14:30:00    [恢复]│
├────────────────────────────────────────┤
│ 版本 1                                 │
│ 最后更新：2026-05-10 10:00:00    [恢复]│
└────────────────────────────────────────┘
```

样式要求：
- 弹窗使用 `el-dialog`，设置 `width="700px"`，`destroy-on-close`；
- 工具栏使用 flex 布局，`gap: 12px`，按钮尺寸 `size="small"`；
- 当前版本项使用特殊背景色（`--bg-active` 或 `--bg-tertiary`）与左边框高亮（`3px solid var(--accent-primary)`）；
- 历史项使用 `div.history-item` 自定义列表项，hover 时背景变为 `--bg-hover`；
- 时间显示使用 `new Date(dateString).toLocaleString('zh-CN')`；
- 所有颜色必须使用项目 CSS 变量，保持 Everforest 主题兼容。

---

## 五、前端 Agent 执行 Prompts

以下 Prompt 可直接分发给前端 Agent 按顺序或并行执行。每个 Prompt 均包含：文件路径、现有代码上下文、具体修改要求、风格约束。

---

### Prompt 1：新增笔记历史弹窗组件

**目标文件**：`calcite_web/calcite-web/src/components/dialogs/NoteHistoryDialog.vue`

**背景**：本项目使用 Vue 3 + `<script setup>` + Element Plus，弹窗组件统一使用 `v-model:visible` + `confirm/close` 事件模式。项目中现有 `FolderDialog.vue` 和 `NoteDialog.vue` 可作为参考。所有样式使用 CSS 变量（如 `--bg-primary`, `--text-primary`, `--accent-primary` 等）。

**需求**：
1. 新建 `NoteHistoryDialog.vue` 组件；
2. Props：
   - `visible: Boolean`
   - `noteId: Number | String | null`
3. Emits：
   - `update:visible`
   - `restore-version`（参数：`{ content: string }`）
4. 在 `<script setup>` 中引入 `useNoteStore`，根据 `noteId` 从 `noteStore.noteHistories` 读取历史列表；
5. 模板结构：
   - `el-dialog`：`:model-value="visible"`，`@update:model-value="$emit('update:visible', $event)"`，`title="笔记历史"`，`width="700px"`，`destroy-on-close`；
   - 弹窗 body 分为两部分：
     - **工具栏**：flex 布局，两个按钮：
       - `保存当前版本为历史`（`type="primary"`，`size="small"`，`:icon="Plus"`）：点击调用 `noteStore.saveCurrentVersion(noteId)`，成功后 `ElMessage.success('保存成功')`；
       - `清空历史`（`type="danger"`，`size="small"`，`:icon="Delete"`，`plain`）：点击前使用 `ElMessageBox.confirm` 确认，确认后调用 `noteStore.clearNoteHistory(noteId)`，成功后 `ElMessage.success('历史已清空')`；
     - **历史列表**：使用自定义 div 列表（不需要 `el-table`，保持与项目轻量风格一致）：
       - **当前版本项**（始终置顶）：显示「当前编辑版本」、当前笔记标题（或截取前 20 字）、最后更新时间 `noteStore.editingNote?.updated_at`；样式高亮（背景 `--bg-active`，左边框 `3px solid var(--accent-primary)`，圆角 `6px`，padding `12px 16px`）；
       - **历史项**（`v-for="(item, index) in histories" :key="item.id"`）：从数组末尾到开头倒序展示，序号显示为「版本 {{ item.version }}」；显示最后更新时间；右侧放置 `el-button type="primary" link size="small"`「恢复此版本」按钮；点击后 emit `restore-version` 事件并携带 `{ content: item.content }`，同时关闭弹窗；
   - 当历史列表为空时（除当前版本外），显示空状态文字「暂无历史版本」；
6. 样式：`<style scoped>`，所有颜色使用 CSS 变量，列表项间距 `gap: 8px`，工具栏与列表间距 `16px`。

**约束**：
- 使用中文变量命名与注释；
- 图标从 `@element-plus/icons-vue` 引入；
- 不要在此组件内直接调用后端 API，全部通过 `noteStore` 操作。

---

### Prompt 2：扩展 dialog store

**目标文件**：`calcite_web/calcite-web/src/stores/dialog.js`

**背景**：该文件目前管理 `folderDialogVisible` 和 `noteDialogVisible` 两个弹窗状态，使用 Pinia Setup Store 模式。需要新增笔记历史弹窗的状态。

**现有代码**（关键部分）：
```js
export const useDialogStore = defineStore('dialog', () => {
  const folderDialogVisible = ref(false)
  const editingFolder = ref(null)
  const folderForm = ref({ name: '', parentId: 0 })

  const noteDialogVisible = ref(false)
  const noteForm = ref({ title: '', folderId: null })
  // ... open/close 方法
})
```

**需求**：
1. 新增状态：
   - `const noteHistoryDialogVisible = ref(false)`
   - `const noteHistoryNoteId = ref(null)`
2. 新增方法：
   - `openNoteHistoryDialog(noteId)`：设置 `noteHistoryNoteId.value = noteId`，然后 `noteHistoryDialogVisible.value = true`；
   - `closeNoteHistoryDialog()`：设置 `noteHistoryDialogVisible.value = false`，并将 `noteHistoryNoteId.value = null`；
3. 在 `return` 对象中导出新增的状态和方法。

**约束**：
- 保持与现有代码风格完全一致；
- 使用中文注释说明新增状态用途。

---

### Prompt 3：扩展 note store（Mock 历史数据）

**目标文件**：`calcite_web/calcite-web/src/stores/note.js`

**背景**：该文件是笔记核心 Store，使用 Pinia Setup Store。目前已有 `allNotes`、`editingNote`、`saveStatus` 等状态。需要新增历史版本管理功能，全部使用 Mock 数据，不调用后端 API。

**需求**：
1. 在 `// ===== 基础状态 =====` 区域下方新增：
   ```js
   // ===== 历史版本状态（Mock） =====
   const noteHistories = ref({})
   ```
2. 在 Store 初始化时（`defineStore` 内部），为预填充 Mock 数据，可以在 `return` 之前写一段初始化逻辑：遍历 `allNotes.value` 的前 3 条笔记（如果存在），为每条笔记生成 2~3 条 Mock 历史数据，存入 `noteHistories`。每条 Mock 历史数据结构：
   ```js
   {
     id: `h_${noteId}_${version}`,
     content: `这是笔记《${note.title}》的历史版本 ${version} 的 Mock 内容。`,
     updated_at: new Date(Date.now() - version * 86400000).toISOString(), // 每天一条
     version: version
   }
   ```
   或者更简单：在 `fetchRootNotes` 等方法成功获取笔记后，触发一次 Mock 数据初始化。
3. 新增方法（放在方法区域末尾）：
   - `saveCurrentVersion(noteId)`：
     - 如果当前没有 `editingNote` 或 `editingNote.id !== noteId`，直接返回；
     - 获取该笔记已有历史数组 `const list = noteHistories.value[noteId] || []`；
     - 计算新版本号 `const nextVersion = list.length > 0 ? Math.max(...list.map(h => h.version)) + 1 : 1`；
     - push 新对象：`{ id: 'h_${noteId}_${nextVersion}', content: editingNote.value.content, updated_at: new Date().toISOString(), version: nextVersion }`；
   - `clearNoteHistory(noteId)`：
     - 设置 `noteHistories.value[noteId] = []`；
   - `restoreNoteVersion(noteId, historyId)`：
     - 从 `noteHistories.value[noteId]` 中找到对应 `historyId` 的项；
     - 如果找到且当前 `editingNote.id === noteId`，将 `editingNote.value.content` 替换为历史项的 `content`；
     - 同时更新 `editingNote.value.updated_at` 为当前时间；
     - 调用 `ElMessage.success('已恢复到历史版本')`；
4. 在 `return` 对象中导出 `noteHistories`、`saveCurrentVersion`、`clearNoteHistory`、`restoreNoteVersion`。

**约束**：
- 不要引入新的 API 调用；
- 保持与现有 Store 代码风格一致（中文注释、使用 `ref`/`computed`、方法命名用驼峰）；
- 若 `editingNote` 为空时调用相关方法，需做防御处理。

---

### Prompt 4：在右侧栏笔记信息面板添加入口按钮

**目标文件**：`calcite_web/calcite-web/src/components/sidebar/RightSidebar.vue`

**背景**：该文件是右栏主容器，包含「文件列表面板」和「笔记信息面板」。在「笔记信息面板」（自己笔记的 `v-else` 分支）中，已有「标签展示」和「删除功能」两个 `info-section`。需要在「删除功能」上方新增一个「笔记历史」操作区域。

**现有相关代码片段**（删除功能区域，约第 179~189 行）：
```vue
<!-- 删除功能 -->
<div class="info-section danger-section">
  <el-button
    type="danger"
    :icon="Delete"
    size="small"
    @click="$emit('delete-note')"
  >
    删除笔记
  </el-button>
</div>
```

**需求**：
1. 在「删除功能」`info-section` 的上方，新增一个 `info-section`：
   ```vue
   <div class="info-section">
     <div class="section-title">
       <span>操作</span>
     </div>
     <el-button
       type="primary"
       :icon="History"
       size="small"
       @click="handleOpenHistory"
     >
       笔记历史
     </el-button>
   </div>
   ```
2. 在 `<script setup>` 中：
   - 从 `@element-plus/icons-vue` 引入 `History` 图标；
   - 引入 `useDialogStore`；
   - 定义 `const dialogStore = useDialogStore()`；
   - 定义方法 `const handleOpenHistory = () => { if (currentNote.value?.id) dialogStore.openNoteHistoryDialog(currentNote.value.id) }`；
3. 注意：该按钮只在「自己的笔记」编辑模式下显示（即放在 `v-else` 分支的 `note-info-panel` 内，不要放在预览模式 `isPreview` 分支中）。

**约束**：
- 保持与现有按钮风格一致（`size="small"`，图标 + 文字）；
- 使用中文；
- 不修改其他区域的结构和样式。

---

### Prompt 5：在 Home.vue 注册弹窗并处理恢复事件

**目标文件**：`calcite_web/calcite-web/src/views/Home.vue`

**背景**：`Home.vue` 是根页面组件，已在模板底部注册了 `FolderDialog` 和 `NoteDialog`。需要在相同位置注册新的 `NoteHistoryDialog`，并处理「恢复版本」事件。

**现有相关代码片段**（模板底部弹窗注册，约第 71~86 行）：
```vue
<!-- 文件夹对话框 -->
<FolderDialog
  v-model:visible="dialogStore.folderDialogVisible"
  :is-editing="!!dialogStore.editingFolder"
  :form="dialogStore.folderForm"
  :all-folders="folderStore.allFolders"
  @confirm="handleSaveFolder"
/>

<!-- 笔记对话框 -->
<NoteDialog
  v-model:visible="dialogStore.noteDialogVisible"
  :form="dialogStore.noteForm"
  :all-folders="folderStore.allFolders"
  @confirm="handleSaveNote"
/>
```

**现有 script 顶部 import 区域**（约第 90~114 行）：
```js
import FolderDialog from '../components/dialogs/FolderDialog.vue'
import NoteDialog from '../components/dialogs/NoteDialog.vue'
```

**需求**：
1. 在 `import NoteDialog` 下方新增：
   ```js
   import NoteHistoryDialog from '../components/dialogs/NoteHistoryDialog.vue'
   ```
2. 在模板中 `NoteDialog` 下方新增：
   ```vue
   <!-- 笔记历史对话框 -->
   <NoteHistoryDialog
     v-model:visible="dialogStore.noteHistoryDialogVisible"
     :note-id="dialogStore.noteHistoryNoteId"
     @restore-version="handleRestoreVersion"
   />
   ```
3. 在 `<script setup>` 方法区域中新增 `handleRestoreVersion` 方法：
   ```js
   const handleRestoreVersion = ({ content }) => {
     if (noteStore.editingNote) {
       noteStore.editingNote.content = content
       noteStore.hasUnsavedChanges = true
       noteStore.saveStatus = '未保存'
       ElMessage.success('已恢复到历史版本')
     }
   }
   ```
   如果 `noteStore` 中已有 `restoreNoteVersion` 方法封装了内容替换逻辑，也可以直接调用 `noteStore.restoreNoteVersion(dialogStore.noteHistoryNoteId, ...)`，但请确保最终效果是编辑器内容被替换且保存状态变为未保存。

**约束**：
- 保持与现有弹窗注册代码风格完全一致；
- 使用中文注释；
- 不要删除或修改已有的 `FolderDialog` 和 `NoteDialog` 代码。

---

## 六、验证清单（截图前自查）

- [ ] 右侧栏「笔记信息」面板中出现「笔记历史」按钮；
- [ ] 点击按钮后弹出宽度 `700px` 的弹窗，标题为「笔记历史」；
- [ ] 弹窗顶部有「保存当前版本为历史」和「清空历史」两个按钮；
- [ ] 列表第一项为「当前编辑版本」，带有高亮样式；
- [ ] 下方至少展示 2~3 条 Mock 历史数据，每条显示版本号和最后更新时间；
- [ ] 每条历史右侧有「恢复此版本」链接按钮；
- [ ] 点击「恢复此版本」后弹窗关闭，编辑器内容更新，并提示「已恢复到历史版本」；
- [ ] 所有颜色与主题风格保持一致，无硬编码色值。
