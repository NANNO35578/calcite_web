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
    <el-tooltip content="标签管理" placement="bottom">
      <el-button
        :type="activePanel === 'tags' ? 'primary' : 'default'"
        size="small"
        :icon="CollectionTag"
        @click="togglePanel('tags')"
        class="icon-btn"
        circle
      />
    </el-tooltip>
  </div>
</template>

<script setup>
import { Document, CollectionTag } from '@element-plus/icons-vue'

defineProps({
  activePanel: {
    type: String,
    default: 'tags' // 'files' 或 'tags'
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
