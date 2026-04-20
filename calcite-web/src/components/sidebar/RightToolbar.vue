<template>
  <div class="right-toolbar">
    <el-tooltip content="已上传文件" placement="bottom">
      <el-button
        :type="activePanel === 'files' ? 'primary' : 'default'"
        size="small"
        :icon="Document"
        @click="togglePanel('files')"
        class="icon-btn"
        circle
      />
    </el-tooltip>
    <el-tooltip content="笔记信息" placement="bottom">
      <el-button
        :type="activePanel === 'note' ? 'primary' : 'default'"
        size="small"
        :icon="InfoFilled"
        @click="togglePanel('note')"
        class="icon-btn"
        circle
      />
    </el-tooltip>
  </div>
</template>

<script setup>
import { Document, InfoFilled } from '@element-plus/icons-vue'

defineProps({
  activePanel: {
    type: String,
    default: 'note' // 'files' 或 'note'
  }
})

const emit = defineEmits(['update:active-panel'])

const togglePanel = (panel) => {
  emit('update:active-panel', panel)
}
</script>

<style scoped>
.right-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 12px;
  height: 40px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  background-color: var(--bg-secondary);
}

.icon-btn {
  font-size: 16px;
}

.icon-btn:hover {
  transform: scale(1.05);
}
</style>
