<template>
  <div class="file-list-container">
    <!-- 列表头部 -->
    <div class="file-list-header">
      <div class="header-left">
        <span class="header-title">所有文件</span>
        <span class="file-count" v-if="displayFiles.length > 0">({{ displayFiles.length }})</span>
      </div>
      <div class="header-right">
        <!-- 状态过滤器 -->
        <el-select
          v-model="statusFilter"
          placeholder="筛选状态"
          clearable
          size="small"
          class="filter-select"
          @change="handleFilterChange"
        >
          <el-option label="上传中" value="processing" />
          <el-option label="已完成" value="done" />
          <el-option label="失败" value="failed" />
          <!-- <el-option label="当前笔记" value="current note" /> -->
        </el-select>

        <!-- 刷新按钮 -->
        <el-tooltip content="刷新列表" placement="top">
          <el-button
            type="primary"
            link
            size="small"
            :icon="Refresh"
            @click="handleRefresh"
            :loading="loading"
            class="refresh-btn"
          />
        </el-tooltip>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="displayFiles.length === 0" class="empty-state">
      <el-icon :size="32" class="empty-icon"><Document /></el-icon>
      <span class="empty-text">暂无上传文件</span>
      <span class="empty-hint">在编辑器中粘贴或拖拽图片即可上传</span>
    </div>

    <!-- 文件列表 -->
    <div v-else class="file-list">
      <div
        v-for="file in displayFiles"
        :key="file.id"
        class="file-item"
        :class="{ 'is-processing': file.status === 'processing', 'is-failed': file.status === 'failed' }"
      >
        <!-- 文件图标 -->
        <div class="file-icon">
          <el-icon v-if="isImage(file.file_type)" :size="20"><Picture /></el-icon>
          <el-icon v-else :size="20"><Document /></el-icon>
        </div>

        <!-- 文件信息 -->
        <div class="file-info">
          <div class="file-name" :title="file.file_name">{{ file.file_name }}</div>
          <div class="file-meta">
            <span class="file-size">{{ file.file_size_formatted || formatFileSize(file.file_size) }}</span>
            <span class="file-status" :class="`status-${file.status}`">
              {{ getStatusText(file.status) }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="file-actions">
          <!-- 复制链接按钮（仅上传完成） -->
          <el-tooltip v-if="file.status === 'done' && file.url" content="复制链接" placement="top">
            <el-button
              type="primary"
              link
              size="small"
              :icon="CopyDocument"
              @click="copyUrl(file.url)"
              class="action-btn"
            />
          </el-tooltip>

          <!-- 删除按钮 -->
          <el-tooltip content="删除文件" placement="top">
            <el-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleDelete(file)"
              class="action-btn"
            />
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document, Picture, Delete, CopyDocument, Refresh, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  allFiles: {
    type: Array,
    default: () => []
  },
  noteId: {
    type: Number,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete', 'refresh'])

// 状态过滤器
const statusFilter = ref('')

// 根据过滤条件显示对应的文件列表
const displayFiles = computed(() => {
  const fileList = props.allFiles

  if (!statusFilter.value) {
    return fileList
  }

  // if (statusFilter.value === 'current note') {
  //   return fileList.filter(f => f.note_id === props.noteId)
  // }

  return fileList.filter(f => f.status === statusFilter.value)
})

// 处理过滤变化
const handleFilterChange = (value) => {
  // 过滤逻辑已在 computed 中处理
  console.log('过滤条件:', value)
}

// 刷新列表
const handleRefresh = () => {
  emit('refresh', 'all')
}

// 判断是否为图片类型
const isImage = (fileType) => {
  if (!fileType) return false
  return fileType.startsWith('image/')
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'processing': '上传中',
    'done': '已完成',
    'failed': '失败'
  }
  return statusMap[status] || status
}

// 复制URL到剪贴板
const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('链接已复制到剪贴板')
  }
}

// 删除文件
const handleDelete = (file) => {
  ElMessageBox.confirm(
    `确定要删除文件 "${file.file_name}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('delete', file)
  }).catch(() => {
    // 用户取消
  })
}
</script>

<style scoped>
.file-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

.file-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.file-count {
  font-size: 12px;
  color: var(--text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.filter-select {
  width: 130px;
}

.filter-select :deep(.el-input__wrapper) {
  background-color: var(--bg-tertiary);
  border-color: var(--border-secondary);
  box-shadow: none;
}

.filter-select :deep(.el-input__inner) {
  color: var(--text-primary);
}

.refresh-btn {
  padding: 4px !important;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--text-muted);
}

.empty-icon {
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: var(--bg-tertiary);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: var(--border-primary);
  background-color: var(--bg-hover);
}

.file-item.is-processing {
  opacity: 0.8;
  border-left: 3px solid var(--accent-primary);
}

.file-item.is-failed {
  border-left: 3px solid #f56c6c;
  background-color: rgba(245, 108, 108, 0.1);
}

.file-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border-radius: 6px;
  color: var(--accent-primary);
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-size {
  font-size: 11px;
  color: var(--text-muted);
}

.file-status {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.status-processing {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
}

.status-done {
  background-color: #67c23a;
  color: white;
}

.status-failed {
  background-color: #f56c6c;
  color: white;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 6px !important;
  height: auto !important;
}

/* 滚动条样式 */
.file-list::-webkit-scrollbar {
  width: 6px;
}

.file-list::-webkit-scrollbar-track {
  background: transparent;
}

.file-list::-webkit-scrollbar-thumb {
  background: var(--component-scroll-thumb);
  border-radius: 3px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
