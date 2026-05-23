<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="笔记历史"
    width="700px"
    destroy-on-close
  >
    <div class="history-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button
          type="primary"
          size="small"
          :icon="Plus"
          @click="handleSaveVersion"
        >
          保存当前版本为历史
        </el-button>
        <el-button
          type="danger"
          size="small"
          :icon="Delete"
          plain
          @click="handleClearHistory"
        >
          清空历史
        </el-button>
      </div>

      <!-- 历史列表 -->
      <div class="history-list">
        <!-- 当前编辑版本（置顶高亮） -->
        <div class="current-version-item">
          <div class="version-header">
            <span class="version-label">▶ 当前编辑版本</span>
          </div>
          <div class="version-meta">
            <span class="note-title">{{ currentNoteTitle }}</span>
            <span class="update-time">最后更新：{{ formatTime(currentNoteTime) }}</span>
          </div>
        </div>

        <!-- 历史版本项 -->
        <template v-if="histories.length > 0">
          <div
            v-for="item in histories"
            :key="item.id"
            class="history-item"
          >
            <div class="version-header">
              <span class="version-label">版本 {{ item.version }}</span>
            </div>
            <div class="version-meta">
              <span class="update-time">最后更新：{{ formatTime(item.updated_at) }}</span>
              <el-button
                type="primary"
                link
                size="small"
                @click="handleRestore(item)"
              >
                恢复此版本
              </el-button>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          暂无历史版本
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useNoteStore } from '../../stores/note'

const props = defineProps({
  visible: Boolean,
  noteId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:visible', 'restore-version'])

const noteStore = useNoteStore()

// 当前笔记标题（截取前20字）
const currentNoteTitle = computed(() => {
  const title = noteStore.editingNote?.title || '无标题'
  return title.length > 20 ? title.slice(0, 20) + '...' : title
})

// 当前笔记更新时间
const currentNoteTime = computed(() => {
  return noteStore.editingNote?.updated_at || ''
})

// 历史列表（倒序展示，最新版本在前）
const histories = computed(() => {
  if (!props.noteId) return []
  const list = noteStore.noteHistories[props.noteId] || []
  return [...list].reverse()
})

// 保存当前版本为历史
const handleSaveVersion = () => {
  if (!props.noteId) return
  noteStore.saveCurrentVersion(props.noteId)
  ElMessage.success('保存成功')
}

// 清空历史
const handleClearHistory = () => {
  if (!props.noteId) return
  ElMessageBox.confirm(
    '确定要清空该笔记的所有历史版本吗？此操作不可恢复。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      noteStore.clearNoteHistory(props.noteId)
      ElMessage.success('历史已清空')
    })
    .catch(() => {})
}

// 恢复此版本
const handleRestore = (item) => {
  emit('restore-version', { content: item.content })
  emit('update:visible', false)
}

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.history-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  gap: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.current-version-item {
  background-color: var(--bg-active);
  border-left: 3px solid var(--accent-primary);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item {
  background-color: var(--bg-secondary);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: var(--bg-hover);
}

.version-header {
  display: flex;
  align-items: center;
}

.version-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.version-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.note-title {
  font-size: 13px;
  color: var(--text-secondary);
}

.update-time {
  font-size: 13px;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 24px;
  font-size: 14px;
  color: var(--text-muted);
}

/* 滚动条样式 */
.history-list::-webkit-scrollbar {
  width: 4px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background: var(--component-scroll-thumb);
  border-radius: 2px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
