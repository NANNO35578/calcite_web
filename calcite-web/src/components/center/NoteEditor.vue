<template>
  <div class="note-editor-view">
    <!-- 编辑器头部 - 包含返回按钮、标题输入、保存状态和删除按钮 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button type="text" @click="$emit('back')" :icon="ArrowLeft" class="back-btn">
          返回列表
        </el-button>
        <el-input 
          :model-value="note.title" 
          @update:model-value="$emit('update:title', $event)"
          placeholder="输入笔记标题..." 
          class="title-input" 
          @input="$emit('input')" 
        />
      </div>
      <div class="header-actions">
        <span class="save-status">{{ saveStatus }}</span>
        <el-button type="danger" :icon="Delete" @click="$emit('delete')" size="small">
          删除
        </el-button>
      </div>
    </div>

    <div class="editor-content">
      <!-- Markdown 编辑器 -->
      <div class="markdown-editor-wrapper">
        <md-editor theme="dark"
          :model-value="note.content"
          @update:model-value="handleContentChange"
          :toolbars="toolbars"
          :preview="true"
          :preview-only="false"
          :preview-theme="'cyanosis'"
          :language="'zh-CN'"
          :placeholder="'开始输入笔记内容...'"
          class="markdown-editor"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, ArrowLeft } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps({
  note: Object,
  saveStatus: String,
  folderName: String
})

const emit = defineEmits(['update:title', 'update:content', 'input', 'back', 'delete'])

// 工具栏配置
const toolbars = [
  'bold',
  'underline',
  'italic',
  '-',
  'title',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  // '-',
  // 'revoke',
  // 'next',
  // 'save',
  '=',
  'pageFullscreen',
  // 'fullscreen',
  'preview',
  'previewOnly',
  'htmlPreview',
  'catalog',
  // 'github',
  'fullscreen'
]

// 处理内容变化
const handleContentChange = (value) => {
  emit('update:content', value)
  emit('input')
}

const formatFullTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.note-editor-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  height: 44px;
  box-sizing: border-box;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.back-btn {
  color: var(--text-primary);
  flex-shrink: 0;
}

.back-btn:hover {
  color: var(--accent-primary);
}

.title-input {
  flex: 1;
  min-width: 0;
  max-width: 600px;
}

.title-input :deep(.el-input__wrapper) {
  background-color: var(--bg-tertiary);
  box-shadow: none;
  border: 2px solid var(--border-primary);
  border-radius: 16px;
  padding: 0 8px;
}

.title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  height: 30px;
}

.title-input :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.save-status {
  color: var(--accent-secondary);
  font-size: 13px;
}

.editor-content {
  flex: 1;
  /* padding: 2px 4px; */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Markdown 编辑器容器 */
.markdown-editor-wrapper {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
}

.markdown-editor {
  height: 100%;
}

/* ==================== 覆盖 md-editor-v3 CSS 变量以适配 Everforest 主题 ==================== */

.md-editor {
  --md-bk-color: var(--bg-secondary);
  --md-color: var(--text-primary);
}

/* 强制覆盖编辑器根元素 CSS 变量 */
.markdown-editor :deep(.md-editor) {
  /* 核心背景色 */
  /* --md-bk-color: var(--text-primary) !important; */
  --md-bk-color-outstand: var(--bg-tertiary) !important;
  --md-bk-hover-color: var(--bg-hover) !important;
  
  /* 文字颜色 - 使用主题主文字色 */
  /* --md-color: var(--bg-primary) !important; */
  --md-hover-color: var(--accent-primary) !important;
  
  /* 边框颜色 */
  --md-border-color: var(--border-secondary) !important;
  --md-border-hover-color: var(--border-primary) !important;
  --md-border-active-color: var(--accent-primary) !important;
  
  /* 滚动条颜色 */
  --md-scrollbar-bg-color: var(--bg-md) !important;
  --md-scrollbar-thumb-color: var(--component-scroll-thumb) !important;
  --md-scrollbar-thumb-hover-color: var(--text-muted) !important;
  --md-scrollbar-thumb-active-color: var(--text-secondary) !important;
  
  /* 模态框 */
  --md-modal-mask: rgba(0, 0, 0, 0.6) !important;
  --md-modal-shadow: 0px 6px 24px 2px rgba(0, 0, 0, 0.3) !important;
  
  /* 主题颜色 */
  --md-theme-color: var(--text-primary) !important;
  --md-theme-heading-color: var(--text-primary) !important;
  --md-theme-code-color: var(--accent-primary) !important;
  --md-theme-link-color: var(--accent-primary) !important;
  --md-theme-link-hover-color: var(--accent-secondary) !important;
  
  background-color: var(--md-bk-color) !important;
  border: 1px solid var(--md-border-color) !important;
  border-radius: 8px;
}

/* 编辑器工具栏 */
.markdown-editor :deep(.md-editor-toolbar) {
  background-color: var(--bg-tertiary) !important;
  border-bottom: 1px solid var(--border-secondary) !important;
}

.markdown-editor :deep(.md-editor-toolbar-item) {
  color: var(--text-secondary) !important;
}

.markdown-editor :deep(.md-editor-toolbar-item:hover) {
  background-color: var(--bg-hover) !important;
  color: var(--accent-primary) !important;
}

/* 编辑器输入区域 - 强制使用主题色 */
.markdown-editor :deep(.md-editor-input-wrapper) {
  background-color: var(--bg-md) !important;
}

.markdown-editor :deep(.md-editor-input) {
  background-color: var(--bg-md) !important;
  color: var(--text-primary) !important;
  font-size: 15px;
  line-height: 1.8;
  border-color: var(--border-secondary) !important;
}

.markdown-editor :deep(.md-editor-input:hover) {
  border-color: var(--border-primary) !important;
}

.markdown-editor :deep(.md-editor-input:focus) {
  border-color: var(--accent-primary) !important;
}

.markdown-editor :deep(.md-editor-input::placeholder) {
  color: var(--text-muted) !important;
}

/* 预览区域 */
.markdown-editor :deep(.md-editor-preview) {
  background-color: var(--bg-md) !important;
  color: var(--text-primary) !important;
}

/* Markdown 内容样式适配 */
.markdown-editor :deep(.md-editor-preview-wrapper) {
  background-color: var(--bg-md) !important;
}

/* 预览区标题 */
.markdown-editor :deep(.md-editor-preview h1),
.markdown-editor :deep(.md-editor-preview h2),
.markdown-editor :deep(.md-editor-preview h3),
.markdown-editor :deep(.md-editor-preview h4),
.markdown-editor :deep(.md-editor-preview h5),
.markdown-editor :deep(.md-editor-preview h6) {
  color: var(--text-primary) !important;
  border-bottom-color: var(--border-secondary) !important;
}

/* 预览区段落 */
.markdown-editor :deep(.md-editor-preview p) {
  color: var(--text-primary) !important;
}

/* 预览区列表 */
.markdown-editor :deep(.md-editor-preview ul),
.markdown-editor :deep(.md-editor-preview ol) {
  color: var(--text-primary) !important;
}

/* 代码块样式 */
.markdown-editor :deep(.md-editor-preview pre) {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
}

.markdown-editor :deep(.md-editor-preview code) {
  background-color: var(--bg-tertiary);
  color: var(--accent-primary);
  padding: 2px 6px;
  border-radius: 4px;
}

.markdown-editor :deep(.md-editor-preview pre code) {
  background-color: transparent;
  color: var(--text-primary);
  padding: 0;
}

/* 引用块样式 */
.markdown-editor :deep(.md-editor-preview blockquote) {
  border-left: 4px solid var(--accent-secondary);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

/* 表格样式 */
.markdown-editor :deep(.md-editor-preview table) {
  border-color: var(--border-primary);
}

.markdown-editor :deep(.md-editor-preview th),
.markdown-editor :deep(.md-editor-preview td) {
  border-color: var(--border-primary);
  background-color: var(--bg-tertiary);
}

.markdown-editor :deep(.md-editor-preview th) {
  background-color: var(--bg-hover);
  color: var(--accent-primary);
}

/* 链接样式 */
.markdown-editor :deep(.md-editor-preview a) {
  color: var(--accent-primary);
}

.markdown-editor :deep(.md-editor-preview a:hover) {
  color: var(--accent-secondary);
}

/* 分割线 */
.markdown-editor :deep(.md-editor-preview hr) {
  border-color: var(--border-primary);
}

/* 列表标记 */
.markdown-editor :deep(.md-editor-preview ul li::marker) {
  color: var(--accent-secondary);
}

.markdown-editor :deep(.md-editor-preview ol li::marker) {
  color: var(--accent-secondary);
}

/* 滚动条样式适配 */
.markdown-editor :deep(.md-editor-input::-webkit-scrollbar),
.markdown-editor :deep(.md-editor-preview-wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

.markdown-editor :deep(.md-editor-input::-webkit-scrollbar-track),
.markdown-editor :deep(.md-editor-preview-wrapper::-webkit-scrollbar-track) {
  background: var(--bg-secondary);
}

.markdown-editor :deep(.md-editor-input::-webkit-scrollbar-thumb),
.markdown-editor :deep(.md-editor-preview-wrapper::-webkit-scrollbar-thumb) {
  background: var(--component-scroll-thumb);
  border-radius: 4px;
}

.markdown-editor :deep(.md-editor-input::-webkit-scrollbar-thumb:hover),
.markdown-editor :deep(.md-editor-preview-wrapper::-webkit-scrollbar-thumb:hover) {
  background: var(--text-muted);
}

/* 下拉菜单样式 */
.markdown-editor :deep(.md-editor-dropdown-menu) {
  background-color: var(--bg-secondary);
  border-color: var(--border-primary);
}

.markdown-editor :deep(.md-editor-dropdown-item) {
  color: var(--text-primary);
}

.markdown-editor :deep(.md-editor-dropdown-item:hover) {
  background-color: var(--bg-hover);
  color: var(--accent-primary);
}

/* 弹窗/模态框样式 */
.markdown-editor :deep(.md-editor-modal) {
  background-color: var(--bg-secondary);
  border-color: var(--border-primary);
}

.markdown-editor :deep(.md-editor-modal-header) {
  border-bottom-color: var(--border-primary);
}

.markdown-editor :deep(.md-editor-modal-title) {
  color: var(--text-primary);
}
</style>
