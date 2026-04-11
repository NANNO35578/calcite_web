<template>
  <div class="search-container">
    <el-input
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      placeholder="搜索笔记..."
      :prefix-icon="Search"
      clearable
      @input="$emit('input')"
      size="small"
    />
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps(['modelValue'])
defineEmits(['update:modelValue', 'input'])
</script>

<style scoped>
.search-container {
  padding: 0 12px 12px;
}

.search-container :deep(.el-input__wrapper) {
  background-color: var(--bg-tertiary);
  border-color: var(--border-primary);
  box-shadow: none;
}

.search-container :deep(.el-input__inner) {
  color: var(--text-primary);
}
</style>
