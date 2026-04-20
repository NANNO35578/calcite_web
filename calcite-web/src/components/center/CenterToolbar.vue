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

    <!-- 中间：搜索按钮 -->
    <div class="toolbar-center">
      <el-button
        size="small"
        :icon="Search"
        @click="showSearchDialog = true"
      >
        搜索
      </el-button>
    </div>

    <!-- 右侧：右栏切换按钮 -->
    <div class="toolbar-section">
      <el-tooltip content="笔记信息" placement="bottom">
        <el-button
          type="default"
          size="small"
          :icon="InfoFilled"
          @click="$emit('toggle-right')"
          class="icon-btn"
          circle
        />
      </el-tooltip>
    </div>

    <!-- 悬浮搜索框 -->
    <el-dialog
      v-model="showSearchDialog"
      title="搜索笔记"
      width="500px"
      align-center
      :show-close="true"
      class="search-dialog"
    >
      <el-input
        v-model="dialogKeyword"
        placeholder="请输入搜索内容"
        class="input-with-select"
        @keyup.enter="handleSearchConfirm"
      >
        <template #prepend>
          <el-select
            v-model="searchScope"
            placeholder="搜索范围"
            style="width: 150px"
          >
            <el-option label="与我相关" value="related" />
            <el-option label="公开笔记" value="public" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="handleSearchConfirm" />
        </template>
      </el-input>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Menu, Search, InfoFilled } from '@element-plus/icons-vue'

const emit = defineEmits(['toggle-left', 'toggle-right', 'search'])

const showSearchDialog = ref(false)
const dialogKeyword = ref('')
const searchScope = ref('related')

const handleSearchConfirm = () => {
  const isPublic = searchScope.value === 'public' ? 1 : undefined
  emit('search', {
    keyword: dialogKeyword.value.trim(),
    isPublic
  })
  showSearchDialog.value = false
}
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

.icon-btn {
  font-size: 16px;
}

.icon-btn:hover {
  transform: scale(1.05);
}

.input-with-select {
  --el-input-inline-icon-margin-end: 8px;
}
</style>
