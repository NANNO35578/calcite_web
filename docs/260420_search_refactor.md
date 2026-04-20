# 搜索框重构文档

> 日期：2026-04-20  
> 范围：`CenterToolbar.vue`、`Home.vue`

---

## 一、需求概述

将 `CenterToolbar.vue` 中间的常驻搜索输入框改为**搜索按钮**，点击后弹出**悬浮搜索框（Dialog）**，支持选择搜索范围：
- **与我相关**：常规搜索，不附加额外参数
- **公开笔记**：搜索时附加 `is_public=1`

搜索结果展示界面保持不变。

---

## 二、UI 变更

### 2.1 CenterToolbar.vue

| 区域 | 变更前 | 变更后 |
|------|--------|--------|
| 中间区域 | `el-input` 常驻搜索框（带 clearable、prefix-icon） | `el-button` 搜索按钮，点击弹出 `el-dialog` |
| 悬浮框内容 | 无 | `el-input` + `el-select`（prepend）+ 搜索按钮（append） |
| 交互方式 | 输入即触发防抖搜索 | 点击搜索按钮或按 Enter 后一次性触发搜索 |

### 2.2 悬浮搜索框结构

```
el-dialog (title="搜索笔记")
└── el-input
    ├── prepend: el-select (与我相关 / 公开笔记)
    └── append: el-button (Search 图标)
```

---

## 三、API 适配

### 3.1 接口行为

- 接口地址不变：`GET /api/note/search`
- 基础参数不变：`keyword`、`from`、`size`
- **仅在选中"公开笔记"时**，额外附加参数：`isPublic=1`

### 3.2 参数组装（Home.vue）

```javascript
const params = {
  keyword: searchKeyword.value.trim(),
  from: searchFrom.value,
  size: searchPageSize.value
}
if (searchIsPublic.value) {
  params.isPublic = 1
}
```

---

## 四、代码修改清单

### 4.1 `src/components/center/CenterToolbar.vue`

- **移除**
  - `searchKeyword` prop
  - `update:search-keyword` emit
  - `search-input` emit
- **新增**
  - `search` emit（携带 `{ keyword, isPublic }`）
  - `showSearchDialog` ref：控制悬浮框显隐
  - `dialogKeyword` ref：悬浮框内输入框绑定值
  - `searchScope` ref：搜索范围选择（`related` / `public`）
  - `handleSearchConfirm`：组装参数并 emit `search`，关闭 dialog
- **UI 调整**
  - 中间区域替换为搜索按钮
  - 新增 `el-dialog` 作为悬浮搜索框
  - Dialog 内使用 `input-with-select` 样式（参考项目提供的示例代码）

### 4.2 `src/views/Home.vue`

- **移除**
  - CenterToolbar 的 `v-model:search-keyword` 绑定
  - `@search-input="handleSearch"` 事件绑定
- **新增**
  - `searchIsPublic` ref（布尔）：记录当前搜索是否为公开笔记模式
  - `@search="handleSearchWithScope"` 事件绑定
  - `handleSearchWithScope({ keyword, isPublic })`：
    - 设置 `searchKeyword` 与 `searchIsPublic`
    - 调用 `doSearch(true)`（保留 300ms 防抖）
- **修改**
  - `doSearch` 中组装参数时，若 `searchIsPublic === true` 则追加 `isPublic: 1`

---

## 五、交互说明

1. **打开搜索**：点击顶部工具栏"搜索"按钮 → 弹出悬浮搜索框
2. **选择范围**：在输入框左侧下拉框选择"与我相关"或"公开笔记"
3. **执行搜索**：输入关键词后点击右侧搜索图标，或按 Enter 键
4. **关闭弹窗**：搜索成功后自动关闭；也可点击遮罩层或右上角关闭
5. **清空搜索**：在悬浮框中清空输入框内容并点击搜索，即可退出搜索视图
6. **分页逻辑**：搜索结果的分页（上一页/下一页）保持原有逻辑不变

---

## 六、自检结论

- [x] `vite build` 编译通过，无报错
- [x] 常驻搜索输入框已替换为搜索按钮
- [x] 悬浮搜索框支持范围选择（与我相关 / 公开笔记）
- [x] 选中"公开笔记"时，`/api/note/search` 正确附加 `isPublic=1`
- [x] 搜索结果展示界面未做修改，保持兼容
- [x] 搜索防抖逻辑保留（300ms）
