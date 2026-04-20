<template>
  <div class="file-tree">
    <el-tree
      ref="treeRef"
      :load="loadNode"
      lazy
      node-key="key"
      :highlight-current="true"
      :current-node-key="currentNodeKey"
      :expand-on-click-node="true"
      :props="defaultProps"
      @node-click="handleNodeClick"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
    >
      <template #default="{ node, data }">
        <div
          class="tree-item"
          :class="[
            data.type === 'folder' ? 'folder-item' : 'note-item',
            { active: data.type === 'folder' ? selectedFolderId === data.id : selectedNoteId === data.id }
          ]"
        >
          <template v-if="data.type === 'folder'">
            <el-dropdown
              @command="(cmd) => handleFolderAction(cmd, data)"
              trigger="click"
              @click.stop
            >
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
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span class="folder-name">{{ data.label }}</span>
          </template>
          <template v-else>
            <div class="note-indent"></div>
            <el-icon class="note-icon"><Document /></el-icon>
            <span class="note-name">{{ data.label }}</span>
          </template>
        </div>
      </template>
    </el-tree>

    <div v-if="isEmpty && isRoot" class="empty-tree">
      <span class="empty-text">{{ emptyMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Folder,
  Document,
  MoreFilled
} from '@element-plus/icons-vue'
import { getFolderList } from '../api/folder'
import { getNoteList } from '../api/note'

const props = defineProps({
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
  'note-create',
  'folders-loaded',
  'notes-loaded'
])

const treeRef = ref(null)
const hasLoadedRoot = ref(false)
const isLoading = ref(false)

const defaultProps = {
  label: 'label',
  children: 'children',
  isLeaf: 'isLeaf'
}

const currentNodeKey = computed(() => {
  if (props.selectedFolderId) return `folder-${props.selectedFolderId}`
  if (props.selectedNoteId) return `note-${props.selectedNoteId}`
  return null
})

const isEmpty = computed(() => {
  if (isLoading.value) return false
  if (!hasLoadedRoot.value) return false
  const rootNode = treeRef.value?.root
  if (!rootNode) return false
  return rootNode.childNodes.length === 0
})

const emptyMessage = computed(() => {
  return '暂无文件和文件夹'
})

/**
 * 监听 expandedFolders 变化，同步 el-tree 展开状态
 */
watch(() => [...props.expandedFolders], (newKeys, oldKeys) => {
  if (!treeRef.value) return
  newKeys.forEach(folderId => {
    if (!oldKeys.includes(folderId)) {
      const node = treeRef.value.getNode(`folder-${folderId}`)
      if (node && !node.expanded) {
        node.expand()
      }
    }
  })
  oldKeys.forEach(folderId => {
    if (!newKeys.includes(folderId)) {
      const node = treeRef.value.getNode(`folder-${folderId}`)
      if (node && node.expanded) {
        node.collapse()
      }
    }
  })
}, { deep: true })

/**
 * el-tree 懒加载函数
 * @param {Object} node - 当前节点
 * @param {Function} resolve - 解析子节点的回调
 */
const loadNode = async (node, resolve) => {
  if (node.level === 0) {
    isLoading.value = true
    try {
      const [folders, notes] = await Promise.all([
        getFolderList({ folder_id: 0 }),
        getNoteList({ folder_id: 0 })
      ])
      const folderList = Array.isArray(folders) ? folders : []
      const noteList = Array.isArray(notes) ? notes : []

      emit('folders-loaded', { folders: folderList, parentId: 0 })
      emit('notes-loaded', { notes: noteList })

      hasLoadedRoot.value = true
      resolve(buildTreeNodes(folderList, noteList))
    } catch (error) {
      console.error('加载根节点失败:', error)
      resolve([])
    } finally {
      isLoading.value = false
    }
    return
  }

  if (node.data.type === 'folder') {
    try {
      const folderId = node.data.id
      const [folders, notes] = await Promise.all([
        getFolderList({ folder_id: folderId }),
        getNoteList({ folder_id: folderId })
      ])
      const folderList = Array.isArray(folders) ? folders : []
      const noteList = Array.isArray(notes) ? notes : []

      emit('folders-loaded', { folders: folderList, parentId: folderId })
      emit('notes-loaded', { notes: noteList })

      resolve(buildTreeNodes(folderList, noteList))
    } catch (error) {
      console.error(`加载文件夹 ${node.data.id} 失败:`, error)
      resolve([])
    }
    return
  }

  resolve([])
}

/**
 * 构建树节点数据
 */
const buildTreeNodes = (folders, notes) => {
  const folderNodes = folders.map(f => ({
    ...f,
    key: `folder-${f.id}`,
    label: f.name,
    type: 'folder',
    isLeaf: false
  }))

  const noteNodes = notes.map(n => ({
    ...n,
    key: `note-${n.id}`,
    label: n.title || '无标题',
    type: 'note',
    isLeaf: true
  }))

  return [...folderNodes, ...noteNodes]
}

/**
 * 节点点击事件
 */
const handleNodeClick = (data) => {
  if (data.type === 'folder') {
    emit('folder-click', data)
  } else {
    emit('note-click', data)
  }
}

/**
 * 节点展开事件
 */
const handleNodeExpand = (data) => {
  if (data.type === 'folder') {
    emit('folder-expand', data)
  }
}

/**
 * 节点折叠事件
 */
const handleNodeCollapse = (data) => {
  if (data.type === 'folder') {
    emit('folder-collapse', data)
  }
}

/**
 * 文件夹右键/下拉菜单操作
 */
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

/**
 * 刷新指定文件夹节点（重新触发懒加载）
 * @param {number} folderId - 文件夹ID，0 表示根节点
 */
const refreshNode = (folderId = 0) => {
  if (!treeRef.value) return
  if (folderId === 0) {
    const root = treeRef.value.root
    if (root) {
      root.loaded = false
      root.expand()
    }
    return
  }
  const node = treeRef.value.getNode(`folder-${folderId}`)
  if (node) {
    node.loaded = false
    node.expand()
  }
}

defineExpose({ refreshNode })
</script>

<style scoped>
/* ===== 文件树容器 ===== */
.file-tree {
  user-select: none;
  min-height: 0;
}


/* 强制覆盖 el-tree 节点内容背景色 */
.file-tree :deep(.el-tree-node__content) {
  height: auto;
  min-height: 32px;
  background: transparent !important; /* 去掉自带背景 */
  border: none !important;
}

/* 选中节点时的背景（你想要的颜色） */
.file-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: transparent !important;
}

/* 鼠标 hover 节点背景 */
.file-tree :deep(.el-tree-node__content:hover) {
  background-color: auto !important;
}

:global(.el-dropdown-menu) {
  /* min-width: 120px !important; */
  background-color: var(--bg-secondary) !important;
  border-color: var(--border-primary) !important;
  border-radius: 0 !important;
}

/* ===== 树形条目 ===== */
.tree-item {
  display: flex;
  align-items: center;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  padding: 4px 0;
}

.tree-item:hover {
  background-color: rgba(127, 187, 179, 0.15);
}

.tree-item.active {
  background-color: rgba(127, 187, 179, 0.25);
}

.tree-node__content {
  background-color: rgba(127, 187, 179, 0.25);
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
}

.folder-item.active{
  color: var(--component-primary);
}
.folder-name {
  color: var(--accent-primary);
}

.more-icon {
  opacity: 0;
  color: var(--text-muted);
  transition: opacity 0.15s;
  flex-shrink: 0;
  margin-right: 8px;
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
</style>
