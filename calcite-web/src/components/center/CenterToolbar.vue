<template>
  <div class="toolbar">
    <!-- 左侧：左栏切换按钮 -->
    <div class="toolbar-section">
      <el-tooltip content="文件夹" placement="bottom">
        <el-button
          type="default"
          size="small"
          :icon="Menu"
          @click="$emit('toggle-left')"
          class="icon-btn"
          circle
        />
      </el-tooltip>
    </div>

    <!-- 中间：搜索框 -->
    <div class="toolbar-center">
      <el-input
        :model-value="searchKeyword"
        @update:model-value="$emit('update:search-keyword', $event)"
        placeholder="搜索笔记..."
        :prefix-icon="Search"
        clearable
        @input="$emit('search-input')"
        size="small"
        class="search-input"
      />
    </div>

    <!-- 右侧：右栏切换按钮 -->
    <div class="toolbar-section">
      <el-tooltip content="标签" placement="bottom">
        <el-button
          type="default"
          size="small"
          :icon="CollectionTag"
          @click="$emit('toggle-right')"
          class="icon-btn"
          circle
        />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { Menu, CollectionTag, Search } from '@element-plus/icons-vue'

defineProps(['searchKeyword'])
defineEmits(['update:search-keyword', 'search-input', 'toggle-left', 'toggle-right'])
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  height: 40px;
  box-sizing: border-box;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  background-color: var(--bg-tertiary);
  border-color: var(--border-primary);
  box-shadow: none;
}

.search-input :deep(.el-input__inner) {
  color: var(--text-primary);
}

.icon-btn {
  font-size: 16px;
}

.icon-btn:hover {
  transform: scale(1.05);
}
</style>
