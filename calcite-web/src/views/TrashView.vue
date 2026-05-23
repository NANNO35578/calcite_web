<template>
  <div class="trash-container">
    <!-- 顶部标题栏 -->
    <div class="trash-header">
      <h1 class="trash-title">回收站</h1>
      <el-button size="small" :icon="ArrowLeft" @click="router.push('/home')">
        返回首页
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="trash-stats">
      <el-card class="stat-card" :body-style="{ padding: '20px' }">
        <div class="stat-label">已删除笔记</div>
        <div class="stat-number">{{ trashNotes.length }}</div>
      </el-card>
      <el-card class="stat-card" :body-style="{ padding: '20px' }">
        <div class="stat-label">即将自动清理</div>
        <div class="stat-number">{{ autoClearCount }}</div>
      </el-card>
    </div>

    <!-- 操作栏 -->
    <div class="trash-toolbar">
      <el-button
        type="primary"
        size="small"
        :icon="RefreshLeft"
        :disabled="trashNotes.length === 0"
        @click="handleRestoreAll"
      >
        全部恢复
      </el-button>
      <el-button
        type="danger"
        size="small"
        :icon="Delete"
        plain
        :disabled="trashNotes.length === 0"
        @click="handleClearAll"
      >
        清空回收站
      </el-button>
    </div>

    <!-- 已删除笔记列表 -->
    <div class="trash-list">
      <div
        v-for="note in trashNotes"
        :key="note.id"
        class="trash-item"
      >
        <div class="item-main">
          <div class="item-title">{{ note.title || '无标题' }}</div>
          <div class="item-meta">
            <span class="meta-folder">{{ note.folder_name || '未分类' }}</span>
            <span class="meta-time">删除于 {{ formatTime(note.deleted_at) }}</span>
          </div>
        </div>
        <div class="item-actions">
          <el-button
            type="primary"
            link
            size="small"
            :icon="RefreshLeft"
            @click="restoreNote(note)"
          >
            恢复
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            :icon="Delete"
            @click="permanentDelete(note)"
          >
            彻底删除
          </el-button>
        </div>
      </div>

      <div v-if="trashNotes.length === 0" class="empty-state">
        <el-icon class="empty-icon"><Delete /></el-icon>
        <div class="empty-text">回收站为空</div>
        <div class="empty-hint">删除的笔记将在这里显示，30 天后自动清理</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, RefreshLeft, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useNoteStore, useFolderStore } from '../stores'

const router = useRouter()
const noteStore = useNoteStore()
const folderStore = useFolderStore()

// ===== Mock 回收站数据 =====
const trashNotes = ref([])

const initTrashData = () => {
  const sourceNotes = noteStore.allNotes.length > 0
    ? noteStore.allNotes.slice(0, Math.min(5, noteStore.allNotes.length))
    : []

  if (sourceNotes.length > 0) {
    trashNotes.value = sourceNotes.map((note, index) => ({
      id: note.id,
      title: note.title,
      folder_name: folderStore.allFolders.find(f => f.id === note.folder_id)?.name || '未分类',
      deleted_at: new Date(Date.now() - (index + 1) * 86400000).toISOString()
    }))
  } else {
    // 纯 Mock 数据，确保页面有内容展示
    trashNotes.value = [
      { id: 101, title: '项目需求文档', folder_name: '工作', deleted_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 102, title: '读书笔记 —— 深度工作', folder_name: '学习', deleted_at: new Date(Date.now() - 172800000).toISOString() },
      { id: 103, title: '旅行计划 2026', folder_name: '生活', deleted_at: new Date(Date.now() - 259200000).toISOString() },
      { id: 104, title: '周报 2026-05-12', folder_name: '工作', deleted_at: new Date(Date.now() - 345600000).toISOString() }
    ]
  }
}

initTrashData()

const autoClearCount = computed(() => {
  const threshold = Date.now() - 25 * 86400000
  return trashNotes.value.filter(n => new Date(n.deleted_at).getTime() < threshold).length
})

const restoreNote = (note) => {
  const index = trashNotes.value.findIndex(n => n.id === note.id)
  if (index > -1) {
    trashNotes.value.splice(index, 1)
    ElMessage.success(`已恢复「${note.title || '无标题'}」`)
  }
}

const permanentDelete = (note) => {
  ElMessageBox.confirm(
    `确定要彻底删除「${note.title || '无标题'}」吗？此操作不可恢复。`,
    '彻底删除',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    const index = trashNotes.value.findIndex(n => n.id === note.id)
    if (index > -1) {
      trashNotes.value.splice(index, 1)
      ElMessage.success('已彻底删除')
    }
  }).catch(() => {})
}

const handleRestoreAll = () => {
  ElMessageBox.confirm('确定要恢复所有笔记吗？', '批量恢复', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'info'
  }).then(() => {
    trashNotes.value = []
    ElMessage.success('已全部恢复')
  }).catch(() => {})
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空回收站吗？所有笔记将被彻底删除且不可恢复。', '清空回收站', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    trashNotes.value = []
    ElMessage.success('回收站已清空')
  }).catch(() => {})
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return '今天'
  if (diff < 2 * day) return '昨天'
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.trash-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 24px;
  box-sizing: border-box;
}

.trash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.trash-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 统计卡片 */
.trash-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}

.stat-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent-primary);
}

/* 工具栏 */
.trash-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

/* 列表 */
.trash-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trash-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  transition: all 0.2s;
}

.trash-item:hover {
  border-color: var(--accent-primary);
  background-color: var(--bg-hover);
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.meta-folder {
  color: var(--text-secondary);
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  color: var(--text-muted);
}

.empty-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 13px;
  color: var(--text-muted);
}

/* 响应式 */
@media (max-width: 900px) {
  .trash-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .trash-stats {
    grid-template-columns: 1fr;
  }
  .trash-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
