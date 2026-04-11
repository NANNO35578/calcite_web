<template>
  <div class="sidebar-toolbar">
    <el-tooltip content="新建笔记" placement="bottom">
      <el-button
        type="success"
        size="small"
        :icon="DocumentAdd"
        @click="$emit('create-note')"
        class="icon-btn"
        circle
      />
    </el-tooltip>
    <el-tooltip content="新建文件夹" placement="bottom">
      <el-button
        type="primary"
        size="small"
        :icon="FolderAdd"
        @click="$emit('create-folder')"
        class="icon-btn"
        circle
      />
    </el-tooltip>
  </div>
</template>

<script setup>
import { DocumentAdd, FolderAdd } from '@element-plus/icons-vue'

defineEmits(['create-note', 'create-folder'])
</script>

<style scoped>
.sidebar-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 12px;
  height: 48px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.icon-btn {
  font-size: 16px;
}

.icon-btn:hover {
  transform: scale(1.05);
}
</style>
