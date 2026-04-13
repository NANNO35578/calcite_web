<template>
  <div class="sidebar-content">
    <!-- 顶部工具栏 - 切换面板 -->
    <RightToolbar v-model:active-panel="activePanel" />

    <!-- 文件列表面板 -->
    <div v-show="activePanel === 'files'" class="panel-container">
      <FileList
        :files="files"
        :all-files="allFiles"
        :loading="filesLoading"
        @delete="$emit('file-delete', $event)"
        @refresh="$emit('file-refresh', $event)"
        @view-mode-change="$emit('view-mode-change', $event)"
      />
    </div>

    <!-- 标签管理面板 -->
    <div v-show="activePanel === 'tags'" class="panel-container">
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
        @action="handleTagAction"
      />

      <!-- 所有标签 -->
      <TagList
        :tags="allTags"
        title="所有标签"
        empty-text="暂无标签"
        :is-bound="isTagBound"
        @click="handleTagClick"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DocumentAdd } from '@element-plus/icons-vue'
import TagList from './TagList.vue'
import RightToolbar from './RightToolbar.vue'
import FileList from './FileList.vue'

const props = defineProps({
  allTags: Array,
  noteTags: Array,
  editingNote: Object,
  isTagBound: Function,
  files: {
    type: Array,
    default: () => []
  },
  allFiles: {
    type: Array,
    default: () => []
  },
  filesLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'create-tag',
  'tag-action',
  'tag-click',
  'file-delete',
  'file-refresh',
  'view-mode-change'
])

// 当前激活的面板: 'files' 或 'tags'
const activePanel = ref('tags')

// 处理标签操作，添加 editingNote 信息
const handleTagAction = (event) => {
  emit('tag-action', event)
}

// 处理标签点击，添加 editingNote 信息
const handleTagClick = (tag) => {
  emit('tag-click', tag)
}
</script>

<style scoped>
.sidebar-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  height: 40px;
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
