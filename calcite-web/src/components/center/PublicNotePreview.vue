<template>
  <div class="note-editor-view">
    <!-- 预览头部 - 包含返回按钮、标题文本、点赞/收藏按钮 -->
    <div class="editor-header">
      <div class="header-left">
        <el-tooltip content="返回" placement="bottom">
          <el-button type="text" @click="$emit('back')" :icon="ArrowLeft" class="back-btn">
          </el-button>
        </el-tooltip>
        <span class="title-text">{{ note.title || '无标题' }}</span>
      </div>
      <div class="header-actions">
        <el-button
          :type="note.is_liked ? 'primary' : 'default'"
          :icon="Pointer"
          @click="handleLike"
          size="small"
        >
          {{ note.like_count || 0 }}
        </el-button>
        <el-button
          :type="note.is_collected ? 'warning' : 'default'"
          :icon="note.is_collected ? StarFilled : Star"
          @click="handleCollect"
          size="small"
        >
          {{ note.collect_count || 0 }}
        </el-button>
      </div>
    </div>

    <div class="editor-content">
      <!-- Markdown 预览 -->
      <div class="markdown-editor-wrapper">
        <md-editor 
          ref="editorRef"
          theme="dark"
          :model-value="note.content"
          :toolbars="[]"
          :preview = "preview"
          :show-code-row-number=true
          :preview-theme="'cyanosis'"
          :language="'zh-CN'"
          class="markdown-editor"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ArrowLeft, Pointer, Star, StarFilled } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { likeNote, collectNote, unlikeNote, uncollectNote } from '../../api/note'

const props = defineProps({
  note: Object
})

// script 中
const editorRef = ref(null);
onMounted(() => {
  editorRef.value?.togglePreviewOnly(true);
});

const emit = defineEmits(['back', 'update:note'])

const handleLike = async () => {
  const note = props.note
  if (!note || !note.id) return
  try {
    if (note.is_liked) {
      await unlikeNote({ note_id: note.id })
      emit('update:note', {
        ...note,
        is_liked: false,
        like_count: Math.max(0, (note.like_count || 1) - 1)
      })
    } else {
      await likeNote({ note_id: note.id })
      emit('update:note', {
        ...note,
        is_liked: true,
        like_count: (note.like_count || 0) + 1
      })
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

const handleCollect = async () => {
  const note = props.note
  if (!note || !note.id) return
  try {
    if (note.is_collected) {
      await uncollectNote({ note_id: note.id })
      emit('update:note', {
        ...note,
        is_collected: false,
        collect_count: Math.max(0, (note.collect_count || 1) - 1)
      })
    } else {
      await collectNote({ note_id: note.id })
      emit('update:note', {
        ...note,
        is_collected: true,
        collect_count: (note.collect_count || 0) + 1
      })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
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

.title-text {
  flex: 1;
  min-width: 0;
  max-width: 600px;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.editor-content {
  flex: 1;
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
  --md-bk-color-outstand: var(--bg-tertiary) !important;
  --md-bk-hover-color: var(--bg-hover) !important;
  --md-hover-color: var(--accent-primary) !important;
  --md-border-color: var(--border-secondary) !important;
  --md-border-hover-color: var(--border-primary) !important;
  --md-border-active-color: var(--accent-primary) !important;
  --md-scrollbar-bg-color: var(--bg-md) !important;
  --md-scrollbar-thumb-color: var(--component-scroll-thumb) !important;
  --md-scrollbar-thumb-hover-color: var(--text-muted) !important;
  --md-scrollbar-thumb-active-color: var(--text-secondary) !important;
  --md-modal-mask: rgba(0, 0, 0, 0.6) !important;
  --md-modal-shadow: 0px 6px 24px 2px rgba(0, 0, 0, 0.3) !important;
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
