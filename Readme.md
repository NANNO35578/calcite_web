# calcite web

智能笔记管理系统Web端

Web 端目录大致结构设计

```text
src/
├── api/
│   ├── auth.js
│   └── note.js
├── views/
│   ├── Login.vue
│   ├── NoteList.vue
│   └── NoteEditor.vue
├── router/
│   └── index.js
├── utils/
│   └── request.js
├── App.vue
└── main.js
```


---

| 模块      | 技术                           |
| ------- | ---------------------------- |
| 框架      | Vue 3                        |
| 构建工具    | Vite                         |
| UI 组件   | Element Plus                 |
| HTTP 请求 | Axios                        |
| 路由      | Vue Router                   |
| 状态管理    | Pinia（可选）                    |
| 编辑器     | Markdown 编辑器（如 md-editor-v3） |


----

## 后端REST API接口

详见[API文档](./docs/api.md)
