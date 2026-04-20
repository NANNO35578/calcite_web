<template>
  <div class="sidebar-content">
    <!-- 顶部工具栏 -->
    <LeftToolbar 
      @create-note="$emit('create-note')" 
      @create-folder="$emit('create-folder')" 
      @ocr-upload="$emit('ocr-upload', $event)"
    />
    
    <!-- 文件树 -->
    <div class="file-tree-container">
      <FileTree
        ref="fileTreeRef"
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
        @folders-loaded="$emit('folders-loaded', $event)"
        @notes-loaded="$emit('notes-loaded', $event)"
      />
    </div>
    
    <!-- 底部用户信息 -->
    <UserProfile :user-info="userInfo" @command="$emit('user-command', $event)" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LeftToolbar from './LeftToolbar.vue'
import UserProfile from './UserProfile.vue'
import FileTree from '../FileTree.vue'

const props = defineProps({
  selectedFolderId: Number,
  selectedNoteId: Number,
  expandedFolders: Object,
  userInfo: Object
})

defineEmits([
  'create-note', 'create-folder', 'ocr-upload',
  'folder-click', 'folder-expand', 'folder-collapse', 'note-click',
  'folder-create', 'folder-rename', 'folder-delete',
  'folders-loaded', 'notes-loaded',
  'user-command'
])

const fileTreeRef = ref(null)

defineExpose({ fileTreeRef })
</script>

<style scoped>
.sidebar-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-tree-container {
  flex: 1;
  /* overflow-y: hidden; */
  padding: 8px;
  min-height: 0;
}
</style>
