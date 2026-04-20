# 笔记文件树懒加载重构修复文档

## 一、问题定位

### 1.1 异常现象
登录后控制台出现大量重复请求，核心问题集中在：
- `/folder/list` 被**递归全量拉取**，导致**同一接口重复请求多次**
- `/note/list` 请求参数打印为 `undefined`，**`folder_id` 未正确传递**
- `/tag/list` 同样存在参数 `undefined` 的日志问题

### 1.2 问题文件
| 文件 | 问题描述 |
|------|----------|
| `src/components/FileTree.vue` | 使用递归自定义组件渲染树，**未使用 el-tree 懒加载**，数据依赖父组件一次性全量注入 |
| `src/views/Home.vue` | `fetchAllFolders()` 实现为**递归 BFS 全量加载所有层级文件夹**；`fetchAllNotes()` 调用 `getNoteList()` **未传 `folder_id` 参数** |
| `src/components/sidebar/LeftSidebar.vue` | 作为中间层透传大量数据 props，与新的懒加载架构不匹配 |

---

## 二、根因分析

### 2.1 递归全量加载导致重复请求
`Home.vue` 中的 `fetchAllFolders()` 采用 while 循环 + BFS：
1. 先请求 `folder_id=0` 的根文件夹
2. 对每个根文件夹请求其子文件夹
3. 对子文件夹继续递归请求

这导致登录时产生 **N+1 次** `folder/list` 请求（N 为文件夹总数），形成日志中的"重复频繁请求"。

### 2.2 参数传递错误
`Home.vue` 中：
```js
const fetchAllNotes = async () => {
  const data = await getNoteList()  // ❌ 未传 folder_id
}
```
以及 `fetchAllTags` 中：
```js
const data = await getTagList()     // ❌ 未传 params
```
`request.js` 拦截器打印 `config.params` 为 `undefined`，因此日志出现 `undefined`。

### 2.3 组件架构不适合懒加载
旧的 `FileTree.vue` 是**递归自定义组件**（组件内部递归调用自身），依赖父组件预先加载完整 `allFolders` 和 `notes` 数组。这种设计与"按需懒加载"的需求天然冲突。

---

## 三、解决思路

### 3.1 架构调整：el-tree 原生懒加载
- **废弃** `FileTree.vue` 的递归自定义实现
- **替换为** `el-tree` 的 `lazy` + `:load` 原生懒加载机制
- 文件夹节点设置 `isLeaf: false`，笔记节点设置 `isLeaf: true`

### 3.2 请求策略调整
| 时机 | 请求行为 |
|------|----------|
| 登录初始化 | 仅 `FileTree.vue` 自动请求根节点：`GET /folder/list?folder_id=0` + `GET /note/list?folder_id=0` |
| 点击展开文件夹 | `loadNode` 回调触发，请求该文件夹下子数据：`GET /folder/list?folder_id={id}` + `GET /note/list?folder_id={id}` |
| CRUD 操作后 | 刷新根数据 + 若操作发生在子文件夹中，**定向刷新该文件夹节点** |

### 3.3 数据同步机制
- `FileTree.vue` 通过 `folders-loaded` / `notes-loaded` 事件将懒加载获得的数据回写给 `Home.vue`
- `Home.vue` 维护 `allFolders` / `allNotes` 缓存（去重追加），供中间列表、搜索、编辑器等模块使用
- `FileTree.vue` 通过 `defineExpose({ refreshNode })` 暴露节点刷新能力，`Home.vue` 在 CRUD 后通过 `ref` 链调用，触发对应节点的重新懒加载

---

## 四、代码变更详情

### 4.1 `src/components/FileTree.vue`（核心重构）
**变更前：** 递归自定义组件，依赖 `allFolders`、`folders`、`notes` props。  
**变更后：**
- 使用 `<el-tree lazy :load="loadNode">` 实现原生懒加载
- `loadNode` 逻辑：
  - `level === 0` 时请求 `folder_id=0`
  - `node.data.type === 'folder'` 时请求对应 `folder_id`
  - 笔记节点直接 `resolve([])`
- 节点数据结构：
  - 文件夹：`{ key: 'folder-{id}', label: name, type: 'folder', isLeaf: false, ...原始字段 }`
  - 笔记：`{ key: 'note-{id}', label: title, type: 'note', isLeaf: true, ...原始字段 }`
- 暴露 `refreshNode(folderId)` 方法用于外部触发重载
- 监听 `expandedFolders` prop，同步 `el-tree` 展开/折叠状态

### 4.2 `src/views/Home.vue`（数据层修复）
**废弃递归全量加载：**
```js
// 变更前：BFS 递归加载所有层级（已删除）
// 变更后：仅保留根级刷新，作为兼容函数
const fetchAllFolders = async () => { await fetchRootFolders() }
const fetchAllNotes = async () => { await fetchRootNotes() }
```

**新增懒加载数据回写：**
```js
const handleFoldersLoaded = ({ folders, parentId }) => {
  const newFolders = folders.filter(f => !existingIds.has(f.id))
  allFolders.value.push(...newFolders)
}

const handleNotesLoaded = ({ notes }) => {
  const newNotes = notes.filter(n => !existingIds.has(n.id))
  allNotes.value.push(...newNotes)
}
```

**新增定向刷新能力：**
```js
const refreshFolderData = async (folderId) => {
  const [folders, notes] = await Promise.all([
    getFolderList({ folder_id: folderId }),
    getNoteList({ folder_id: folderId })
  ])
  handleFoldersLoaded({ folders, parentId: folderId })
  handleNotesLoaded({ notes })
}

const refreshTreeNode = (folderId = 0) => {
  leftSidebarRef.value?.fileTreeRef?.refreshNode?.(folderId)
}
```

**CRUD 后同步刷新：**
- `saveCurrentNote` → 刷新笔记所在 `folder_id` 的数据 + 树节点
- `handleDeleteNote` → 刷新被删笔记所在 `folder_id` 的数据 + 树节点
- `handleSaveFolder` → 刷新父文件夹的数据 + 树节点
- `handleDeleteFolder` → 刷新被删文件夹的父文件夹的数据 + 树节点
- `handleSaveNote` / `handleOCRUpload` → 刷新新笔记所在文件夹的数据 + 树节点

**初始化调整：**
```js
onMounted(() => {
  fetchUserInfo()
  // 不再主动请求根 folder/note，由 FileTree.vue 懒加载时自行请求
  fetchAllTags()
  fetchAllUserFiles()
})
```

**参数传递修复：**
```js
// fetchRootNotes
const data = await getNoteList({ folder_id: 0 })

// fetchAllTags
const data = await getTagList({})  // 避免 params 为 undefined 的日志问题
```

### 4.3 `src/components/sidebar/LeftSidebar.vue`（中间层适配）
- **移除**向 `FileTree` 传递的 `all-folders`、`folders`、`all-notes` props
- **新增** `folders-loaded`、`notes-loaded` 事件透传
- **暴露** `fileTreeRef`，供 `Home.vue` 调用树组件的 `refreshNode` 方法

---

## 五、请求行为验证

### 5.1 登录后预期请求序列
```
GET /user/profile
GET /file/list {}
GET /tag/list {}
GET /folder/list?folder_id=0   ← FileTree 根节点懒加载
GET /note/list?folder_id=0     ← FileTree 根节点懒加载
```

### 5.2 展开文件夹（例如 id=34）后预期请求序列
```
GET /folder/list?folder_id=34  ← 仅点击该文件夹时触发
GET /note/list?folder_id=34    ← 仅点击该文件夹时触发
```

### 5.3 不再出现的问题
- ❌ `/folder/list` 不再在登录时递归全量请求
- ❌ `/note/list` 不再出现 `undefined` 参数
- ❌ 不会产生接口重复请求

---

## 六、Build 验证

执行构建命令：
```bash
cd calcite-web && npm run build
```

**结果：** ✅ 构建成功，无编译错误。

```
vite v7.3.2 building client environment for production...
transforming...
✓ 3584 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                           0.46 kB │ gzip:   0.29 kB
...
```

---

## 七、后续建议

1. **服务端分页**：若根文件夹或单文件夹下数据量极大，建议后端对 `folder/list` 和 `note/list` 增加分页参数，前端在 `loadNode` 中传递。
2. **缓存策略**：当前 `el-tree` lazy 节点一旦 `loaded=true` 不会自动重载（除非调用 `refreshNode`）。若需要更实时的同步，可考虑 WebSocket 推送或全局事件总线触发树刷新。
3. **错误边界**：`loadNode` 中已有 try/catch，建议后续在 UI 上增加"加载失败"的轻提示（如 `ElMessage.error`）。

---

**文档生成日期：** 2026-04-16  
**修复范围：** `FileTree.vue`、`Home.vue`、`LeftSidebar.vue`、`request.js` 日志规范  
**技术栈：** Vue 3 + Element Plus + Vite
