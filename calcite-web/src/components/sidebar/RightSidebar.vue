<template>
  <div class="sidebar-content">
    <!-- 顶部工具栏 - 切换面板 -->
    <RightToolbar v-model:active-panel="activePanel" />

    <!-- 文件列表面板 -->
    <div v-show="activePanel === 'files'" class="panel-container">
      <FileList
        :all-files="allFiles"
        :note-id="editingNote?.id"
        :loading="filesLoading"
        @delete="$emit('file-delete', $event)"
        @refresh="$emit('file-refresh')"
      />
    </div>

    <!-- 标签管理面板 -->
    <div v-show="activePanel === 'tags'" class="panel-container">
      <!-- 当前笔记的标签 -->
      <TagList
        v-if="editingNote"
        :tags="noteTags"
        title="当前笔记标签"
        empty-text="暂无标签"
        :loading="tagsLoading"
        @click="handleTagClick"
        @create="handleCreateTagInline"
        @delete="handleTagDelete"
      />

      <!-- 所有标签 -->
      <TagList
        :tags="allTags"
        title="所有标签"
        empty-text="暂无标签"
        :loading="tagsLoading"
        :closable="false"
        :editable="true"
        @click="handleTagClick"
        @create="handleCreateTagInline"
        @delete="handleTagDeleteAll"
        @edit="handleTagEdit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TagList from './TagList.vue'
import RightToolbar from './RightToolbar.vue'
import FileList from './FileList.vue'

const props = defineProps({
  allTags: Array,
  noteTags: Array,
  editingNote: Object,
  allFiles: {
    type: Array,
    default: () => []
  },
  filesLoading: {
    type: Boolean,
    default: false
  },
  tagsLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'create-tag',
  'tag-click',
  'tag-delete',
  'tag-edit',
  'tag-delete-all',
  'file-delete',
  'file-refresh'
])

// 当前激活的面板: 'files' 或 'tags'
const activePanel = ref('tags')

// 处理标签点击
const handleTagClick = (tag) => {
  emit('tag-click', tag)
}

// 处理行内创建标签
const handleCreateTagInline = (name) => {
  emit('create-tag', name)
}

// 处理当前笔记标签删除（解绑）
const handleTagDelete = (tag) => {
  emit('tag-delete', tag)
}

// 处理所有标签中的编辑
const handleTagEdit = (payload) => {
  emit('tag-edit', payload)
}

// 处理所有标签中的删除（真正删除标签）
const handleTagDeleteAll = (tag) => {
  emit('tag-delete-all', tag)
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
</style>
