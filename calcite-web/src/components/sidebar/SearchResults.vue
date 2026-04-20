<template>
  <div class="search-results">
    <div class="search-header">
      <div class="search-title">
        {{ isPublicSearch ? '公开笔记搜索结果' : '搜索结果' }}
        <span v-if="total > 0" class="search-count">({{ total }})</span>
      </div>
      <!-- 搜索分页控件 -->
      <div v-if="total > pageSize" class="search-pagination-mini">
        <el-button 
          :disabled="from <= 0" 
          @click.stop="$emit('prev')"
          size="small"
          :icon="ArrowLeft"
          circle
        />
        <span class="page-info">{{ Math.floor(from / pageSize) + 1 }}/{{ Math.ceil(total / pageSize) }}</span>
        <el-button 
          :disabled="from + pageSize >= total" 
          @click.stop="$emit('next')"
          size="small"
          :icon="ArrowRight"
          circle
        />
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="search-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 搜索结果列表 -->
    <template v-else>
      <div v-for="note in results" :key="note.id" class="search-result-item"
        :class="{ active: selectedNoteId === note.id }" @click="handleNoteClick(note)">
        <div class="note-content-right">
          <div class="note-title" v-html="note.highlight_title || note.title || '无标题'"></div>
          <div class="note-highlight" v-html="note.highlight_content || note.summary || '暂无摘要'"></div>
          <div class="note-meta-bottom">
            <span class="note-time" :title="formatFullTime(note.updated_at)">
              <el-icon><Clock /></el-icon>
              {{ formatTime(note.updated_at) }}
            </span>
            <span v-if="isPublicSearch && note.author_id !== undefined" class="note-author" title="作者">
              <el-icon><User /></el-icon>
              {{ note.author_id }}
            </span>
            <span v-if="note.score !== undefined" class="note-score" title="相关度">
              <el-icon><Star /></el-icon>
              {{ note.score.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 无数据提示 -->
      <div v-if="results.length === 0" class="empty-search">
        <el-empty description="未找到匹配的笔记" :image-size="50">
          <template #description>
            <div class="empty-desc">
              <p>未找到匹配的笔记</p>
              <p class="empty-tip">试试其他关键词</p>
            </div>
          </template>
        </el-empty>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, Clock, Star, User } from '@element-plus/icons-vue'

const props = defineProps({
  results: Array,
  total: Number,
  from: Number,
  pageSize: Number,
  loading: Boolean,
  selectedNoteId: Number,
  userId: Number
})

const emit = defineEmits(['note-click', 'public-note-click', 'prev', 'next'])

// 通过结果中第一个元素的 author_id 是否不等于当前用户来判断是否为公开笔记搜索
const isPublicSearch = computed(() => {
  if (!props.results || props.results.length === 0) return false
  const first = props.results[0]
  if (first.author_id === undefined) return false
  return first.author_id !== props.userId
})

const handleNoteClick = (note) => {
  if (isPublicSearch.value) {
    emit('public-note-click', note)
  } else {
    emit('note-click', note)
  }
}

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

const formatFullTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
/* 从原 Home.vue 复制搜索结果相关样式 */
.search-results {
  padding: 8px;
  height: 100%;
  overflow-y: auto;
  min-height: 0;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px 12px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 12px;
}

.search-title {
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.search-count {
  color: var(--accent-primary);
  margin-left: 4px;
}

.search-pagination-mini {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-pagination-mini .page-info {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: center;
}

.search-loading {
  padding: 20px 8px;
}

.search-result-item :deep(mark) {
  background-color: var(--accent-primary);
  color: var(--text-inverse);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 500;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.search-result-item:hover {
  background-color: var(--bg-tertiary);
}

.search-result-item.active {
  background-color: var(--bg-active);
  border-left: 3px solid var(--accent-primary);
}

.search-result-item .note-icon {
  margin-right: 10px;
  color: var(--accent-primary);
  font-size: 16px;
  flex-shrink: 0;
}

.search-result-item .note-title {
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-item .note-highlight {
  color: var(--text-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-top: 4px;
  line-height: 1.5;
}

.note-meta-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.note-time, .note-score, .note-author {
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-author {
  color: var(--accent-secondary);
}

.empty-search {
  padding: 30px 0;
  text-align: center;
}

.empty-search .empty-desc {
  color: var(--text-secondary);
}

.empty-search .empty-desc p {
  margin: 0;
}

.empty-search .empty-tip {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

.empty-search :deep(.el-empty) {
  --el-empty-description-color: var(--text-secondary);
}
</style>
