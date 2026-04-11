<template>
  <div class="note-editor-view">
    <!-- 编辑器头部 -->
    <div class="editor-header">
      <el-button type="text" @click="$emit('back')" :icon="ArrowLeft" class="back-btn">
        返回列表
      </el-button>
      <div class="header-actions">
        <span class="save-status">{{ saveStatus }}</span>
        <el-button type="danger" :icon="Delete" @click="$emit('delete')" size="small">
          删除
        </el-button>
      </div>
    </div>

    <div class="editor-content">
      <el-input 
        :model-value="note.title" 
        @update:model-value="$emit('update:title', $event)"
        placeholder="输入笔记标题..." 
        class="title-input" 
        @input="$emit('input')" 
      />
      <el-input 
        :model-value="note.content" 
        @update:model-value="$emit('update:content', $event)"
        type="textarea" 
        placeholder="开始输入笔记内容..." 
        class="content-input"
        :rows="20" 
        @input="$emit('input')" 
      />
      <div class="note-info">
        <span>最后更新: {{ formatFullTime(note.updated_at || note.updatedAt) }}</span>
        <span v-if="folderName">
          所属文件夹: {{ folderName }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, ArrowLeft } from '@element-plus/icons-vue'

const props = defineProps({
  note: Object,
  saveStatus: String,
  folderName: String
})

defineEmits(['update:title', 'update:content', 'input', 'back', 'delete'])

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
  height: 48px;
  box-sizing: border-box;
}

.back-btn {
  color: var(--text-primary);
}

.back-btn:hover {
  color: var(--accent-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-status {
  color: var(--accent-secondary);
  font-size: 13px;
}

.editor-content {
  flex: 1;
  padding: 16px 24px 24px;
  overflow-y: auto;
}

.title-input {
  margin-bottom: 20px;
}

.title-input :deep(.el-input__wrapper) {
  background-color: var(--bg-secondary);
  box-shadow: none;
  border: none;
  padding: 0;
}

.title-input :deep(.el-input__inner) {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.content-input :deep(.el-textarea__inner) {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.8;
  resize: none;
}

.content-input :deep(.el-textarea__inner):focus {
  border-color: var(--accent-primary);
}

.note-info {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
