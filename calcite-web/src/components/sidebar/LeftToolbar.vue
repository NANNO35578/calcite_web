<template>
  <!-- 顶部按钮区：新建笔记、新建文件夹 -->
  <div class="sidebar-top">
    <el-button
      type="success"
      class="action-btn"
      @click="$emit('create-note')"
      :icon="DocumentAdd"
    >
      新建笔记
    </el-button>
    <el-button
      type="primary"
      class="action-btn"
      @click="$emit('create-folder')"
      :icon="FolderAdd"
    >
      新建文件夹
    </el-button>
  </div>
</template>

<script setup>
import { DocumentAdd, FolderAdd } from '@element-plus/icons-vue'

defineEmits(['create-note', 'create-folder'])
</script>

<style scoped>
.sidebar-top {
  padding: 12px;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  width: 100%;
}
</style>
