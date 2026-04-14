# OCR 识别生成笔记前端实现文档

## 1. 需求概述

在后端 API 文档 4.6 节提供了两个 OCR 相关接口：

- `POST /api/ocr/recognize` —— 上传文件进行 OCR 识别
- `GET /api/ocr/status` —— 查询 OCR 处理状态

本次实现的目标是在前端左侧工具栏增加一个按钮，允许用户上传图片或 PDF，后端完成 OCR 识别后自动生成笔记，前端在识别完成后自动打开生成的笔记。

## 2. 涉及文件

| 文件路径 | 操作 | 说明 |
|---------|------|------|
| `calcite-web/src/api/ocr.js` | 新增 | OCR 接口封装与轮询逻辑 |
| `calcite-web/src/components/sidebar/LeftToolbar.vue` | 修改 | 增加 OCR 上传按钮与隐藏的文件选择器 |
| `calcite-web/src/components/sidebar/LeftSidebar.vue` | 修改 | 透传 `ocr-upload` 事件到 Home.vue |
| `calcite-web/src/views/Home.vue` | 修改 | 处理上传、轮询状态、完成后打开笔记 |

## 3. API 对接说明

### 3.1 提交 OCR 任务

```javascript
// src/api/ocr.js
export function recognizeOCR(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/ocr/recognize',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': null  // 让浏览器自动设置 multipart/form-data boundary
    }
  })
}
```

- 请求通过已有的 `request` axios 实例发送，自动携带 `Authorization: Bearer {token}`。
- 支持文件类型：`jpg`, `jpeg`, `png`, `bmp`, `webp`, `pdf`。
- 后端返回异步任务结果，示例：
  ```json
  { "file_id": 1001, "status": "processing" }
  ```

### 3.2 查询 OCR 状态

```javascript
// src/api/ocr.js
export function getOCRStatus(fileId) {
  return request({
    url: '/ocr/status',
    method: 'get',
    params: { file_id: fileId }
  })
}
```

### 3.3 轮询封装

```javascript
// src/api/ocr.js
export async function pollOCRStatus(fileId, options = {}) {
  const { interval = 1500, maxAttempts = 120 } = options
  // 每 1.5 秒查询一次，最多 120 次（约 3 分钟）
  // status = 'done'  -> resolve，返回包含 note_id 的数据
  // status = 'failed' -> reject，提示用户处理失败
  // 超过最大次数     -> reject，提示用户超时
}
```

## 4. 页面交互流程

1. **用户点击左侧工具栏的 OCR 按钮**（黄色圆形 `Picture` 图标）。
2. **弹出系统文件选择框**，仅允许选择图片和 PDF（`accept=".jpg,.jpeg,.png,.bmp,.webp,.pdf"`）。
3. **前端调用 `recognizeOCR`** 上传文件，显示 "正在上传文件进行OCR识别..."。
4. **上传成功后立即返回**，提示 "OCR任务已提交，正在后台识别..."。
5. **后台开启轮询** `pollOCRStatus(file_id)`，不阻塞用户其他操作。
6. **轮询结果处理**：
   - **`done`**：提示 "OCR识别完成，笔记已生成"，刷新笔记列表和文件夹列表，并自动打开生成的笔记（若列表尚未刷新，则直接调用 `getNoteDetail` 获取详情并打开）。
   - **`failed`**：提示 "OCR识别失败"。
   - **超时**：提示 "OCR处理超时，请稍后到笔记列表中查看"。

## 5. 各文件改动详情

### 5.1 `calcite-web/src/api/ocr.js`（新增）

完整封装了 OCR 相关的两个接口以及一个轮询辅助函数：

- `recognizeOCR(file)` —— 提交识别任务
- `getOCRStatus(fileId)` —— 查询状态
- `pollOCRStatus(fileId, options)` —— 轮询直到完成/失败/超时

### 5.2 `calcite-web/src/components/sidebar/LeftToolbar.vue`

- 引入 `@element-plus/icons-vue` 的 `Picture` 图标。
- 新增一个 `type="warning"` 的圆形按钮，tooltip 为 "OCR识别生成笔记"。
- 增加隐藏的 `<input type="file">`，点击按钮时触发 `click()`。
- 文件选中后通过 `$emit('ocr-upload', file)` 将文件对象抛出。
- 每次选择后重置 `input.value`，允许重复选择同一文件。

### 5.3 `calcite-web/src/components/sidebar/LeftSidebar.vue`

- 在 `LeftToolbar` 组件上监听 `@ocr-upload` 并透传至父组件：
  ```vue
  <LeftToolbar 
    @create-note="$emit('create-note')" 
    @create-folder="$emit('create-folder')" 
    @ocr-upload="$emit('ocr-upload', $event)"
  />
  ```
- 在 `defineEmits` 中增加 `'ocr-upload'`。

### 5.4 `calcite-web/src/views/Home.vue`

- **导入 API**：
  ```javascript
  import { recognizeOCR, pollOCRStatus } from '../api/ocr'
  ```
- **事件绑定**：在 `<LeftSidebar>` 上添加 `@ocr-upload="handleOCRUpload"`。
- **新增方法 `handleOCRUpload`**：
  - 设置 `loading.value = true` 并显示上传提示。
  - 调用 `recognizeOCR(file)` 获取 `file_id`。
  - 启动 `pollOCRStatus` 轮询。
  - 轮询成功（`done`）后：
    - `fetchAllNotes()` 和 `fetchAllFolders()` 刷新列表。
    - 若返回 `note_id`，尝试从 `allNotes` 中找到该笔记并 `openNoteEditor(note)`；若找不到则调用 `getNoteDetail` 直接打开。
  - 轮询失败或超时：通过 `ElMessage.error` 提示用户。
  - 无论成功与否最终关闭 loading。

## 6. 验证结果

执行 `npm run build` 通过，无编译错误：

```bash
cd calcite-web && npm run build
# ...
✓ built in 7.38s
```

## 7. 注意事项

- OCR 识别为异步流程，上传接口立即返回，实际识别结果通过轮询获取。
- 轮询过程在后台运行，不影响用户在页面上进行其他操作（新建笔记、编辑、搜索等）。
- 若用户在轮询期间离开页面或刷新浏览器，OCR 任务仍会在后端继续执行，用户可稍后在笔记列表中查看生成的笔记。
