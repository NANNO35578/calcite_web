<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <!-- 左栏切换按钮 -->
      <el-button
        :type="leftCollapsed ? 'primary' : 'default'"
        size="small"
        :icon="Menu"
        @click="$emit('toggle-left')"
        class="toolbar-btn"
        :title="leftCollapsed ? '展开文件夹' : '收起文件夹'"
      >
        {{ leftCollapsed ? '文件夹' : '收起' }}
      </el-button>
      <el-divider direction="vertical" />
      <!-- 右栏切换按钮 -->
      <el-button
        :type="rightCollapsed ? 'primary' : 'default'"
        size="small"
        :icon="CollectionTag"
        @click="$emit('toggle-right')"
        class="toolbar-btn"
        :title="rightCollapsed ? '展开标签栏' : '收起标签栏'"
      >
        {{ rightCollapsed ? '标签' : '收起' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Menu, CollectionTag } from '@element-plus/icons-vue'

defineProps(['leftCollapsed', 'rightCollapsed'])
defineEmits(['toggle-left', 'toggle-right'])
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  font-size: 13px;
}

.toolbar-btn:hover {
  transform: translateY(-1px);
}

.toolbar :deep(.el-divider--vertical) {
  margin: 0 4px;
  background-color: var(--border-primary);
}
</style>
