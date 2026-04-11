<template>
  <div class="file-tree">
    <!-- 递归渲染文件夹 -->
    <div
      v-for="folder in displayFolders"
      :key="folder.id"
      class="tree-node"
    >
      <div
        class="tree-item folder-item"
        :class="{ active: selectedFolderId === folder.id }"
        @click.stop="handleFolderClick(folder)"
        @contextmenu.prevent="handleFolderContextMenu($event, folder)"
      >
        <el-icon class="expand-icon">
          <CaretRight v-if="!expandedFolders.has(folder.id)" />
          <CaretBottom v-else />
        </el-icon>
        <el-icon class="folder-icon"><Folder /></el-icon>
        <span class="folder-name">{{ folder.name }}</span>
        <span v-if="selectedFolderId === folder.id" class="selected-indicator">👈</span>
        <el-dropdown @command="(cmd) => handleFolderAction(cmd, folder)" trigger="click" @click.stop>
          <el-icon class="more-icon"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="create-note">新建笔记</el-dropdown-item>
              <el-dropdown-item command="create-folder">新建子文件夹</el-dropdown-item>
              <el-dropdown-item command="rename">重命名</el-dropdown-item>
              <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 子文件夹和笔记内容 -->
      <div
        v-if="expandedFolders.has(folder.id)"
        class="tree-children"
      >
        <!-- 递归渲染子文件夹 -->
        <FileTree
          :all-folders="allFolders"
          :notes="notes"
          :parent-folder-id="folder.id"
          :selected-folder-id="selectedFolderId"
          :selected-note-id="selectedNoteId"
          :expanded-folders="expandedFolders"
          :is-root="false"
          @folder-click="$emit('folder-click', $event)"
          @folder-expand="$emit('folder-expand', $event)"
          @folder-collapse="$emit('folder-collapse', $event)"
          @note-click="$emit('note-click', $event)"
          @folder-create="$emit('folder-create', $event)"
          @folder-rename="$emit('folder-rename', $event)"
          @folder-delete="$emit('folder-delete', $event)"
          @note-create="$emit('note-create', $event)"
        />
      </div>
    </div>

    <!-- 当前层级笔记 -->
    <div
      v-for="note in currentLevelNotes"
      :key="note.id"
      class="tree-node"
    >
      <div
        class="tree-item note-item"
        :class="{ active: selectedNoteId === note.id }"
        @click.stop="$emit('note-click', note)"
      >
        <div class="note-indent"></div>
        <el-icon class="note-icon"><Document /></el-icon>
        <span class="note-name">{{ note.title || '无标题' }}</span>
        <span v-if="selectedNoteId === note.id" class="selected-indicator">👈</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="isEmpty && isRoot" class="empty-tree">
      <span class="empty-text">{{ emptyMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Folder,
  Document,
  MoreFilled,
  CaretBottom,
  CaretRight
} from '@element-plus/icons-vue'

const props = defineProps({
  allFolders: {
    type: Array,
    default: () => []
  },
  folders: {
    type: Array,
    default: () => []
  },
  notes: {
    type: Array,
    default: () => []
  },
  parentFolderId: {
    type: Number,
    default: null
  },
  selectedFolderId: {
    type: Number,
    default: null
  },
  selectedNoteId: {
    type: Number,
    default: null
  },
  expandedFolders: {
    type: Set,
    default: () => new Set()
  },
  isRoot: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'folder-click',
  'folder-expand',
  'folder-collapse',
  'note-click',
  'folder-create',
  'folder-rename',
  'folder-delete',
  'note-create'
])

// 当前节点展示的文件夹（根级使用传入的folders，子级使用allFolders计算）
const displayFolders = computed(() => {
  if (props.isRoot) {
    return props.folders
  }
  // 子级从 allFolders 中根据 parentFolderId 筛选
  return props.allFolders.filter(f => f.parent_id === props.parentFolderId)
})

// 当前节点的笔记（只取属于当前父文件夹的笔记）
const currentLevelNotes = computed(() => {
  if (props.isRoot) {
    // 根级显示未分类的笔记（folder_id 为 null 或 0）
    return props.notes.filter(n => !n.folder_id || n.folder_id === 0)
  }
  // 子级只显示属于当前父文件夹的笔记
  return props.notes.filter(n => n.folder_id === props.parentFolderId)
})

// 是否为空
const isEmpty = computed(() => {
  return displayFolders.value.length === 0 && currentLevelNotes.value.length === 0
})

// 空提示消息
const emptyMessage = computed(() => {
  if (props.isRoot) {
    return '暂无文件和文件夹'
  }
  return '文件夹为空'
})

// 文件夹点击
const handleFolderClick = (folder) => {
  emit('folder-click', folder)
  // 自动展开/折叠
  if (props.expandedFolders.has(folder.id)) {
    emit('folder-collapse', folder)
  } else {
    emit('folder-expand', folder)
  }
}

// 文件夹操作
const handleFolderAction = (command, folder) => {
  if (command === 'create-note') {
    emit('note-create', { folder_id: folder.id })
  } else if (command === 'create-folder') {
    emit('folder-create', { parent_id: folder.id })
  } else if (command === 'rename') {
    emit('folder-rename', folder)
  } else if (command === 'delete') {
    emit('folder-delete', folder)
  }
}

// 右键菜单（可选功能）
const handleFolderContextMenu = (event, folder) => {
  event.stopPropagation()
  // 可以在这里实现右键菜单
}
</script>

<style scoped>
/* ===== 文件树容器 ===== */
.file-tree {
  user-select: none;
  min-height: 0; /* 关键：防止 flex 子项溢出 */
}

.tree-node {
  /* 树节点容器 */
}

/* ===== 子节点容器 ===== */
.tree-children {
  /* 子节点缩进 */
  min-height: 0; /* 关键：防止 flex 子项溢出 */
}

.file-tree .tree-children .file-tree {
  /* 嵌套的文件树需要缩进 */
}

.tree-children > .file-tree {
  padding-left: 24px;
}

/* ===== 树形条目 - 保持最小高度不挤压 ===== */
.tree-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
  margin-bottom: 2px;
  position: relative;
  min-height: 32px; /* 关键：设置最小高度，防止被挤压 */
  flex-shrink: 0; /* 关键：防止 flex 压缩 */
}

.tree-item:hover {
  background-color: rgba(127, 187, 179, 0.15);
}

.tree-item.active {
  background-color: rgba(127, 187, 179, 0.25);
}

/* 选中指示器 */
.selected-indicator {
  position: absolute;
  right: 8px;
  font-size: 12px;
}

/* 文件夹样式 */
.folder-item {
  width: 100%;
}

.folder-icon {
  margin-right: 8px;
  font-size: 16px;
  color: var(--component-folder);
  flex-shrink: 0;
}

.folder-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-size: 13px;
  margin-right: 24px;
}

.folder-item.active .folder-name {
  color: var(--accent-primary);
}

.expand-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.more-icon {
  opacity: 0;
  color: var(--text-muted);
  padding: 2px;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.tree-item:hover .more-icon {
  opacity: 1;
}

/* 笔记样式 */
.note-item {
  width: 100%;
}

.note-indent {
  width: 20px;
  flex-shrink: 0;
}

.note-icon {
  margin-right: 8px;
  font-size: 14px;
  color: var(--component-note);
  flex-shrink: 0;
}

.note-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-size: 13px;
  margin-right: 24px;
}

.note-item.active .note-name {
  color: var(--accent-primary);
}

/* 空状态 */
.empty-tree {
  padding: 20px 0;
  text-align: center;
}

.empty-text {
  color: var(--text-muted);
  font-size: 13px;
}

/* 浅色模式由 theme.css 统一控制 */
</style>
