<template>
  <div class="note-list">
    <NoteCard 
      v-for="note in notes" 
      :key="note.id" 
      :note="note"
      :selected="selectedNoteId === note.id"
      @click="$emit('note-click', note)"
    />

    <div v-if="notes.length === 0 && !loading" class="empty-notes">
      <el-empty description="暂无笔记，点击左侧按钮创建新笔记" />
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup>
import NoteCard from './NoteCard.vue'

defineProps(['notes', 'loading', 'selectedNoteId'])
defineEmits(['note-click'])
</script>

<style scoped>
.note-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.note-list::-webkit-scrollbar {
  width: 0px;
}

.note-list::-webkit-scrollbar-thumb {
  background-color: #4a5658;
  border-radius: 4px;
}

.empty-notes {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.loading-container {
  padding: 20px;
}
</style>
