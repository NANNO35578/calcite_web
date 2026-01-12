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


### 1. API 设计原则

* RESTful 风格
* JSON 数据格式
* Token 鉴权
* 统一返回格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```


### 2. 用户模块 API

| 接口                 | 方法   | 说明     |
| ------------------ | ---- | ------ |
| /api/auth/register | POST | 用户注册   |
| /api/auth/login    | POST | 用户登录   |
| /api/auth/logout   | POST | 退出登录   |
| /api/user/profile  | GET  | 获取用户信息 |

参数示例：

#### 注册接口
```json
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",  // 可选
  "password": "password123"
}
```

#### 登录接口
```json
POST /api/auth/login
{
  "username": "testuser",
  "password": "password123"
}
```

#### 退出登录接口
```json
POST /api/auth/logout
{
  "token": "your_jwt_token"
}
```
或者通过 Header: `Authorization: Bearer your_jwt_token`

#### 获取用户信息接口
```
GET /api/user/profile
Header: Authorization: Bearer your_jwt_token
```

所有接口返回统一格式：
```json
{
  "code": 0,        // 0 表示成功，非0表示失败
  "message": "success",
  "data": {}
}
```


### 3. 笔记管理 API（核心）

| 接口               | 方法   | 说明     |
| ---------------- | ---- | ------ |
| /api/note/create | POST | 新建笔记   |
| /api/note/update | POST | 更新笔记   |
| /api/note/delete | POST | 删除笔记   |
| /api/note/list   | GET  | 获取笔记列表 |
| /api/note/detail | GET  | 获取笔记详情 |
| /api/note/search | GET  | 全文搜索   |


### 4. 标签与分类 API

| 接口                 | 方法   |
| ------------------ | ---- |
| /api/tag/create    | POST |
| /api/tag/list      | GET  |
| /api/note/tag/bind | POST |
| /api/folder/create | POST |
| /api/folder/list   | GET  |


### 5. 文件与 OCR API

| 接口                 | 方法   | 说明    |
| ------------------ | ---- | ----- |
| /api/file/upload   | POST | 上传附件  |
| /api/file/list     | GET  | 获取附件  |
| /api/ocr/recognize | POST | 图片转文本 |


### 6. 同步 API（双端重点）

| 接口             | 方法   | 说明     |
| -------------- | ---- | ------ |
| /api/sync/pull | GET  | 拉取最新数据 |
| /api/sync/push | POST | 上传变更   |


---


