# 右侧栏功能调整文档

## 一、需求概述

对右侧栏的文件列表和标签列表进行调整，统一组件命名风格，优化用户交互体验。

### 需求要点

1. **文件列表调整**
   - 只显示全部已上传文件，移除"当前笔记上传文件/全部"切换功能
   - 刷新按钮移至 file-list-header，仅保留图标，使用 el-tooltip 提示
   - 添加 el-select 过滤组件，支持四个固定筛选选项

2. **标签列表调整**
   - 组件命名参考文件列表组件风格
   - 使用 el-tag 管理标签展示
   - 简化组件 props 和事件逻辑

## 二、修改文件清单

### 2.1 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `calcite-web/src/components/sidebar/FileList.vue` | 调整过滤选项值，优化头部布局 |
| `calcite-web/src/components/sidebar/TagList.vue` | 重构组件，参考 FileList 命名风格，简化 props |
| `calcite-web/src/components/sidebar/RightSidebar.vue` | 适配新的 TagList 组件，更新事件处理 |
| `calcite-web/src/views/Home.vue` | 移除 `isTagBound` prop，将 `tag-unbind` 事件改为 `tag-delete` |

## 三、详细修改说明

### 3.1 FileList.vue 修改

#### 修改前
- 使用 `current_note` 作为过滤选项值
- 过滤逻辑基于 `current_note` 字符串匹配

#### 修改后
- 使用 `current note` 作为过滤选项值
- 更新过滤逻辑以匹配新的选项值

```vue
<!-- 修改前 -->
<el-option label="当前笔记" value="current_note" />

<!-- 修改后 -->
<el-option label="当前笔记" value="current note" />
```

```javascript
// 过滤逻辑更新
if (statusFilter.value === 'current note') {
  return fileList.filter(f => f.note_id && f.note_id !== 0)
}
```

**过滤组件功能说明：**
1. 四个固定选项：processing（上传中）、done（已完成）、failed（失败）、current note（当前笔记）
2. 默认折叠收起，点击展开选项
3. 支持选中后一键清除所选内容（clearable 属性）
4. 监听值变化，通过 `@change` 事件处理数据筛选

### 3.2 TagList.vue 重构

#### 主要变更

1. **组件命名风格统一**
   - 参考 FileList.vue 的命名方式
   - 使用 `tag-list-container`、`tag-list-header`、`tag-list`、`tag-item` 等类名

2. **Props 简化**
   ```javascript
   // 修改前
   props: {
     tags: Array,
     title: String,
     emptyText: String,
     showActions: Boolean,
     isBound: Function,
     loading: Boolean
   }

   // 修改后
   props: {
     tags: Array,
     title: String,
     emptyText: String,
     closable: Boolean,  // 控制标签是否可关闭
     loading: Boolean
   }
   ```

3. **事件简化**
   ```javascript
   // 修改前
   emits: ['click', 'create', 'unbind', 'delete']

   // 修改后
   emits: ['click', 'create', 'delete']
   ```

4. **UI 交互优化**
   - 使用 el-tag 组件展示标签
   - 添加 "+ New Tag" 按钮，点击切换为输入框
   - 输入框支持 Enter 键确认和失焦确认
   - 可通过 `closable` 属性控制标签是否显示关闭按钮

5. **移除的功能**
   - 移除 `showActions` prop，改用 `closable` prop 控制关闭按钮
   - 移除 `isBound` prop，不再需要判断标签绑定状态
   - 简化空状态和加载状态的展示

### 3.3 RightSidebar.vue 修改

#### 主要变更

1. **移除不再需要的 props**
   ```vue
   <!-- 修改前 -->
   <TagList
     :show-actions="true"
     :is-bound="isTagBound"
     ...
   />

   <!-- 修改后 -->
   <TagList
     :closable="true"
     ...
   />
   ```

2. **更新事件绑定**
   ```vue
   <!-- 修改前 -->
   @unbind="handleTagUnbind"

   <!-- 修改后 -->
   @delete="handleTagDelete"
   ```

3. **标签列表使用**
   - 当前笔记标签：允许删除（closable: 默认 true）
   - 所有标签：不允许删除（closable: false）

### 3.4 Home.vue 修改

#### 主要变更

1. **移除 prop 传递**
   ```vue
   <!-- 修改前 -->
   <RightSidebar
     :is-tag-bound="isTagBound"
     ...
   />

   <!-- 修改后 -->
   <RightSidebar
     ...
   />
   ```

2. **重命名事件处理函数**
   ```javascript
   // 修改前
   const handleTagUnbind = async (tag) => { ... }

   // 修改后
   const handleTagDelete = async (tag) => { ... }
   ```

3. **更新事件绑定**
   ```vue
   <!-- 修改前 -->
   @tag-unbind="handleTagUnbind"

   <!-- 修改后 -->
   @tag-delete="handleTagDelete"
   ```

## 四、组件关系图

```
Home.vue
├── LeftSidebar.vue
├── RightSidebar.vue         # 右侧面板容器
│   ├── RightToolbar.vue     # 工具栏切换（files / tags）
│   ├── FileList.vue         # 文件列表面板
│   │   ├── file-list-header
│   │   │   ├── 状态过滤器（el-select）
│   │   │   └── 刷新按钮（图标 + tooltip）
│   │   └── file-list
│   │       └── file-item
│   └── TagList.vue          # 标签列表面板
│       ├── tag-list-header
│       └── tag-list
│           ├── tag-item（el-tag）
│           ├── tag-input（添加标签输入框）
│           └── button-new-tag（+ New Tag 按钮）
└── file.js                  # 文件 API 模块
```

## 五、功能说明

### 5.1 文件列表功能

#### 过滤器
- **上传中**：只显示状态为 `processing` 的文件
- **已完成**：只显示状态为 `done` 的文件
- **失败**：只显示状态为 `failed` 的文件
- **当前笔记**：只显示与当前笔记关联的文件（note_id 不为 0）

#### 刷新按钮
- 位于 file-list-header 右侧
- 仅显示刷新图标
- 悬停显示"刷新列表"提示
- 点击后触发 `@refresh` 事件

#### 文件操作
- **复制链接**：仅对已完成状态的文件显示，点击复制文件 URL
- **删除文件**：点击后弹出确认对话框，确认后删除

### 5.2 标签列表功能

#### 标签展示
- 使用 el-tag 组件展示所有标签
- 标签可点击（触发 `@click` 事件）
- 标签可关闭（当 `closable: true` 时）

#### 添加标签
1. 点击 "+ New Tag" 按钮显示输入框
2. 输入标签名称
3. 按 Enter 键或点击外部区域确认
4. 触发 `@create` 事件传递新标签名称

#### 标签删除
- 点击标签的关闭图标
- 触发 `@delete` 事件传递被删除的标签对象

## 六、接口对接

### 6.1 涉及的 API

| API | 方法 | 用途 |
|-----|------|------|
| `/api/file/list` | GET | 获取文件列表 |
| `/api/file/delete` | POST | 删除文件 |
| `/api/tag/list` | GET | 获取标签列表 |
| `/api/tag/bind` | POST | 绑定/解绑标签 |

### 6.2 事件流向

```
TagList
  @click → Home.handleTagClick → 绑定/解绑标签
  @create → Home.handleCreateTagInline → 创建新标签
  @delete → Home.handleTagDelete → 解绑标签（当前笔记）

FileList
  @delete → Home.handleDeleteFile → 删除文件
  @refresh → Home.handleFileRefresh → 刷新文件列表
```

## 七、注意事项

1. **过滤选项值变更**
   - 后端如需配合过滤功能，确保 `current note` 字符串匹配正确
   - 注意空格差异，代码中使用的是 `"current note"`

2. **TagList 组件复用**
   - 当前笔记标签：`closable` 默认为 `true`，允许删除
   - 所有标签：`closable` 设置为 `false`，不允许删除

3. **事件命名统一**
   - 所有删除相关事件统一使用 `@delete`
   - 所有点击事件统一使用 `@click`
   - 所有创建事件统一使用 `@create`

4. **样式统一**
   - 滚动条样式保持一致
   - 加载状态图标使用相同动画
   - 空状态提示保持统一风格

## 八、测试建议

1. **文件列表测试**
   - 测试四个过滤选项是否能正确筛选文件
   - 测试刷新按钮是否正常工作
   - 测试复制链接和删除功能

2. **标签列表测试**
   - 测试当前笔记标签能否正常删除
   - 测试所有标签是否无法删除
   - 测试添加新标签功能
   - 测试标签点击功能

3. **切换面板测试**
   - 测试文件/标签面板切换是否正常
   - 测试面板切换后状态是否保持

## 九、扩展建议

1. **标签搜索**：标签较多时可添加搜索过滤功能
2. **文件排序**：文件列表可添加排序功能（按时间、大小、状态）
3. **批量操作**：支持批量删除文件或批量添加标签
4. **快捷键**：添加快捷键支持（如按 T 切换到标签面板）
