<template>
  <div class="sidebar-content">
    <div class="sidebar-header">
      <h3>标签</h3>
      <el-button type="primary" size="small" :icon="DocumentAdd" @click="$emit('create-tag')">
        添加标签
      </el-button>
    </div>

    <div class="divider"></div>

    <!-- 当前笔记的标签 -->
    <TagList
      v-if="editingNote"
      :tags="noteTags"
      title="当前笔记标签"
      empty-text="暂无标签"
      :show-actions="true"
      @action="$emit('tag-action', $event)"
    />

    <!-- 所有标签 -->
    <TagList
      :tags="allTags"
      title="所有标签"
      empty-text="暂无标签"
      :is-bound="isTagBound"
      @click="$emit('tag-click', $event)"
    />
  </div>
</template>

<script setup>
import { DocumentAdd } from '@element-plus/icons-vue'
import TagList from './TagList.vue'

defineProps({
  allTags: Array,
  noteTags: Array,
  editingNote: Object,
  isTagBound: Function
})

defineEmits(['create-tag', 'tag-action', 'tag-click'])
</script>

<style scoped>
.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-primary);
}

.sidebar-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.divider {
  height: 1px;
  background-color: var(--border-primary);
  margin: 0 12px;
}
</style>
