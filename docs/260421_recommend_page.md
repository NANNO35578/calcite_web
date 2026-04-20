# 推荐页面开发文档

## 日期
2026-04-21

## 需求概述
针对新开发的推荐API `/api/recommend/notes`，在首页实现推荐笔记的展示功能。

## API 信息
- **接口**: `GET /api/recommend/notes`
- **文档位置**: `./docs/api.md L:629~667`
- **请求参数**:
  - `page` (int, 可选): 页码，默认1
  - `page_size` (int, 可选): 每页数量，默认10，最大50
- **响应数据**: 笔记列表 `[{ id, title, summary, created_at, updated_at }]`

## 修改文件清单

### 1. `./calcite-web/src/api/note.js`
新增 `getRecommendNotes` 接口函数：
```javascript
export function getRecommendNotes(params) {
  return request({
    url: '/recommend/notes',
    method: 'get',
    params
  })
}
```

### 2. `./calcite-web/src/components/center/CenterToolbar.vue`
- 导入 `MagicStick` 图标
- 在 `toolbar-center` 区域搜索按钮旁边新增"获取推荐"按钮
- 新增 `recommend` emit 事件

### 3. `./calcite-web/src/views/Home.vue`
#### 状态新增
```javascript
const recommending = ref(false)       // 是否处于推荐模式
const recommendNotes = ref([])        // 推荐笔记列表
const recommendLoading = ref(false)   // 推荐加载状态
const recommendPage = ref(1)          // 推荐分页页码
const recommendPageSize = ref(10)     // 推荐分页大小
```

#### 计算属性调整
- `displayNotes`: 当 `recommending` 为 `true` 时，返回 `recommendNotes`
- `contentTitle`: 当 `recommending` 为 `true` 时，返回 `'推荐笔记'`

#### 方法新增
- `handleRecommend`: 获取推荐笔记
  - 清除搜索状态
  - 调用 `getRecommendNotes({ page, page_size })`
  - 将结果写入 `recommendNotes`
- `handleListNoteClick`: 列表笔记点击包装器
  - 推荐模式下调用 `handlePublicNoteClick`（直接进入预览）
  - 普通模式下调用 `handleNoteClick`

#### 现有方法调整
- `handleSearchWithScope`: 搜索时设置 `recommending = false`
- `handleFolderClick`: 点击文件夹时设置 `recommending = false`
- `handleCreateNote`: 创建笔记时设置 `recommending = false`

#### Template 调整
- `CenterToolbar`: 绑定 `@recommend="handleRecommend"`
- `NoteListView`: 
  - `:loading` 改为 `recommending ? recommendLoading : loading`
  - `@note-click` 改为 `handleListNoteClick`

## 页面交互逻辑

1. **进入推荐模式**: 用户点击顶部工具栏的"获取推荐"按钮
2. **显示推荐列表**: `main-content` 区域显示 `NoteListView`，标题为"推荐笔记"，数据为API返回的推荐笔记
3. **点击笔记卡片**: 进入 `PublicNotePreview` 预览页面（调用浏览API并获取详情）
4. **退出推荐模式**: 
   - 用户进行搜索
   - 用户点击左侧文件夹
   - 用户创建新笔记

## 技术要点

- 复用现有 `NoteListView` + `NoteList` + `NoteCard` 组件栈，保持UI一致性
- 推荐笔记点击直接进入预览（不走编辑器），因为推荐内容均为公开笔记
- 与搜索视图互斥：进入推荐时清空搜索关键词，搜索时退出推荐模式
- 默认请求第1页，每页10条，与API默认值保持一致

## 验证结果

执行 `npm run build` 编译通过，无报错。
