<template>
  <div class="sidebar-content">
    <!-- 顶部工具栏 -->
    <LeftToolbar 
      @create-note="$emit('create-note')" 
      @create-folder="$emit('create-folder', 0)" 
    />
    
    <!-- 搜索框 -->
    <SearchBox :model-value="searchKeyword" @update:model-value="$emit('update:search-keyword', $event)" @input="$emit('search-input')" />
    
    <!-- 分隔线 -->
    <div class="divider"></div>
    
    <!-- 文件树/搜索结果 -->
    <div class="file-tree-container">
      <FileTree
        v-if="!searchKeyword"
        :all-folders="allFolders"
        :folders="folders"
        :notes="allNotes"
        :selected-folder-id="selectedFolderId"
        :selected-note-id="selectedNoteId"
        :expanded-folders="expandedFolders"
        :is-root="true"
        @folder-click="$emit('folder-click', $event)"
        @folder-expand="$emit('folder-expand', $event)"
        @folder-collapse="$emit('folder-collapse', $event)"
        @note-click="$emit('note-click', $event)"
        @folder-create="$emit('folder-create', $event)"
        @folder-rename="$emit('folder-rename', $event)"
        @folder-delete="$emit('folder-delete', $event)"
        @note-create="$emit('note-create', $event)"
      />
      <SearchResults
        v-else
        :results="searchResults"
        :total="searchTotal"
        :from="searchFrom"
        :page-size="searchPageSize"
        :loading="searching"
        :selected-note-id="selectedNoteId"
        @note-click="$emit('note-click', $event)"
        @prev="$emit('search-prev')"
        @next="$emit('search-next')"
      />
    </div>
    
    <!-- 底部用户信息 -->
    <UserProfile :user-info="userInfo" @command="$emit('user-command', $event)" />
  </div>
</template>

<script setup>
import LeftToolbar from './LeftToolbar.vue'
import SearchBox from './SearchBox.vue'
import SearchResults from './SearchResults.vue'
import UserProfile from './UserProfile.vue'
import FileTree from '../FileTree.vue'

const props = defineProps({
  allFolders: Array,
  folders: Array,
  allNotes: Array,
  selectedFolderId: Number,
  selectedNoteId: Number,
  expandedFolders: Object,
  searchKeyword: String,
  searchResults: Array,
  searchTotal: Number,
  searchFrom: Number,
  searchPageSize: Number,
  searching: Boolean,
  userInfo: Object
})

defineEmits([
  'create-note', 'create-folder', 'search-input', 'update:search-keyword',
  'folder-click', 'folder-expand', 'folder-collapse', 'note-click',
  'folder-create', 'folder-rename', 'folder-delete',
  'search-prev', 'search-next', 'user-command'
])
</script>

<style scoped>
.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.divider {
  height: 1px;
  background-color: var(--border-primary);
  margin: 0 12px;
}

.file-tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 0;
}
</style>
