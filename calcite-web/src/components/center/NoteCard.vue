<template>
  <el-card 
    class="note-card"
    :class="{ selected: selected }" 
    @click="$emit('click')"
  >
    <div class="note-header">
      <h3 class="note-title">{{ note.title || '无标题' }}</h3>
      <span class="note-time">{{ formatTime(note.updated_at || note.updatedAt) }}</span>
    </div>
    <div class="note-summary">{{ note.summary || '暂无摘要' }}</div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  note: Object,
  selected: Boolean
})

defineEmits(['click'])

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < week) return `${Math.floor(diff / day)}天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.note-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.note-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.note-card.selected {
  border-color: var(--accent-primary);
  background-color: var(--bg-active);
}

.note-card :deep(.el-card__body) {
  padding: 16px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.note-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.note-time {
  color: var(--text-secondary);
  font-size: 12px;
}

.note-summary {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
