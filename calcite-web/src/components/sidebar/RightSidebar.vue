<template>
  <div class="sidebar-content">
    <!-- 顶部工具栏 -->
    <div class="sidebar-toolbar">
      <span class="sidebar-title">标签</span>
      <el-tooltip content="添加标签" placement="bottom">
        <el-button
          type="primary"
          size="small"
          :icon="DocumentAdd"
          @click="$emit('create-tag')"
          class="icon-btn"
          circle
        />
      </el-tooltip>
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  height: 48px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.sidebar-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.icon-btn {
  font-size: 16px;
}

.icon-btn:hover {
  transform: scale(1.05);
}

.divider {
  height: 1px;
  background-color: var(--border-primary);
  margin: 0 12px;
}
</style>
