<template>
  <div class="notes-list-view">
    <!-- 内容头部：标题 + 笔记计数 -->
    <div class="content-header">
      <h2>{{ title }}</h2>
      <span class="note-count">{{ notes.length }} 篇笔记</span>
    </div>

    <NoteList 
      :notes="notes" 
      :loading="loading"
      :selected-note-id="selectedNoteId"
      @note-click="$emit('note-click', $event)"
    />
  </div>
</template>

<script setup>
import NoteList from './NoteList.vue'

defineProps(['title', 'notes', 'loading', 'selectedNoteId'])
defineEmits(['note-click'])
</script>

<style scoped>
.notes-list-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 24px 24px;
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 16px;
  flex-shrink: 0;
}

.content-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
}

.note-count {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
