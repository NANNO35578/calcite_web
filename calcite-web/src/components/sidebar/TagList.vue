<template>
  <div class="tag-list">
    <div class="section-title">{{ title }}</div>
    <div 
      v-for="tag in tags" 
      :key="tag.id" 
      class="tag-item" 
      :class="{ bound: isBound && isBound(tag.id) }"
      @click="$emit('click', tag)"
    >
      <span class="tag-name">{{ tag.name }}</span>
      <el-dropdown 
        v-if="showActions" 
        @command="(cmd) => $emit('action', cmd, tag)" 
        trigger="click"
        @click.stop
      >
        <el-icon class="tag-more">
          <MoreFilled />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit">编辑</el-dropdown-item>
            <el-dropdown-item command="unbind">解除绑定</el-dropdown-item>
            <el-dropdown-item command="delete" divided>删除标签</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div v-if="tags.length === 0" class="empty-tags">
      {{ emptyText }}
    </div>
  </div>
</template>

<script setup>
import { MoreFilled } from '@element-plus/icons-vue'

defineProps({
  tags: Array,
  title: String,
  emptyText: {
    type: String,
    default: '暂无标签'
  },
  showActions: Boolean,
  isBound: Function
})

defineEmits(['click', 'action'])
</script>

<style scoped>
.tag-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.section-title {
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 600;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
  background-color: var(--component-tag-bg);
  position: relative;
}

.tag-item:hover {
  background-color: var(--bg-hover);
}

.tag-item.bound {
  background-color: var(--component-tag-bg-bound);
}

.tag-item.bound .tag-name {
  color: var(--component-tag-text-bound);
}

.tag-name {
  flex: 1;
  color: var(--component-tag-text);
  font-size: 14px;
}

.tag-more {
  color: var(--text-muted);
  padding: 2px;
}

.tag-item:hover .tag-more {
  color: var(--text-primary);
}

.empty-tags {
  text-align: center;
  color: var(--text-muted);
  padding: 12px;
  font-size: 13px;
}
</style>
