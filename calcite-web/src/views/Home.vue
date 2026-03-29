<template>
  <div class="home-container" @wheel="handleWheel">
    <!-- 左侧栏 - 文件浏览器 -->
    <div class="sidebar left-sidebar" :class="{ collapsed: leftCollapsed }">
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="leftCollapsed = !leftCollapsed">
        <el-icon v-if="!leftCollapsed"><DArrowLeft /></el-icon>
        <el-icon v-else><DArrowRight /></el-icon>
      </div>

      <!-- 左侧内容 -->
      <div v-show="!leftCollapsed" class="sidebar-content">
        <!-- 顶部按钮区 -->
        <div class="sidebar-top">
          <el-button
            type="success"
            class="action-btn"
            @click="handleCreateNote(null)"
            :icon="DocumentAdd"
          >
            新建笔记
          </el-button>
          <el-button
            type="primary"
            class="action-btn"
            @click="handleCreateFolder(0)"
            :icon="FolderAdd"
          >
            新建文件夹
          </el-button>
        </div>

        <!-- 搜索框 -->
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索笔记..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
            size="small"
          />
        </div>

        <!-- 分隔线 -->
        <div class="divider"></div>

        <!-- 文件树 -->
        <div class="file-tree-container">
          <FileTree
            v-if="!searchKeyword"
            :all-folders="allFolders"
            :folders="rootFolders"
            :notes="allNotes"
            :selected-folder-id="selectedFolderId"
            :selected-note-id="editingNote?.id || selectedNoteId"
            :expanded-folders="expandedFolders"
            :is-root="true"
            @folder-click="handleFolderClick"
            @folder-expand="handleFolderExpand"
            @folder-collapse="handleFolderCollapse"
            @note-click="handleNoteClick"
            @folder-create="handleCreateFolder"
            @folder-rename="handleRenameFolder"
            @folder-delete="handleDeleteFolder"
            @note-create="handleCreateNote"
          />
          <!-- 搜索结果 -->
          <div v-else class="search-results">
            <div class="search-title">搜索结果</div>
            <div
              v-for="note in searchResults"
              :key="note.id"
              class="search-result-item"
              :class="{ active: editingNote?.id === note.id }"
              @click="handleNoteClick(note)"
            >
              <el-icon class="note-icon"><Document /></el-icon>
              <div class="note-info">
                <div class="note-title">{{ note.title || '无标题' }}</div>
                <div class="note-summary">{{ note.summary || '暂无摘要' }}</div>
              </div>
            </div>
            <div v-if="searchResults.length === 0 && !searching" class="empty-search">
              <el-empty description="未找到匹配的笔记" :image-size="50" />
            </div>
          </div>
        </div>

        <!-- 底部用户信息 -->
        <div class="sidebar-footer">
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <div class="user-avatar">
                <el-icon><User /></el-icon>
              </div>
              <div class="user-details">
                <div class="username">{{ userInfo?.username || '用户' }}</div>
                <div class="user-email">{{ userInfo?.email || '' }}</div>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="main-content">
      <!-- 笔记列表视图 -->
      <div v-if="!editingNote" class="notes-list-view">
        <div class="content-header">
          <h2>{{ contentTitle }}</h2>
          <span class="note-count">{{ displayNotes.length }} 篇笔记</span>
        </div>

        <div class="note-list">
          <el-card
            v-for="note in displayNotes"
            :key="note.id"
            class="note-card"
            :class="{ selected: selectedNoteId === note.id }"
            @click="handleNoteClick(note)"
          >
            <div class="note-header">
              <h3 class="note-title">{{ note.title || '无标题' }}</h3>
              <span class="note-time">{{ formatTime(note.updated_at || note.updatedAt) }}</span>
            </div>
            <div class="note-summary">{{ note.summary || '暂无摘要' }}</div>
          </el-card>

          <div v-if="displayNotes.length === 0 && !loading" class="empty-notes">
            <el-empty description="暂无笔记，点击左侧按钮创建新笔记" />
          </div>

          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
        </div>
      </div>

      <!-- 笔记编辑视图 -->
      <div v-else class="note-editor-view">
        <div class="editor-header">
          <el-button
            type="text"
            @click="closeEditor"
            :icon="ArrowLeft"
            class="back-btn"
          >
            返回列表
          </el-button>
          <div class="header-actions">
            <span class="save-status">{{ saveStatus }}</span>
            <el-button
              type="danger"
              :icon="Delete"
              @click="handleDeleteNote"
              size="small"
            >
              删除
            </el-button>
          </div>
        </div>

        <div class="editor-content">
          <el-input
            v-model="editingNote.title"
            placeholder="输入笔记标题..."
            class="title-input"
            @input="handleNoteChange"
          />
          <el-input
            v-model="editingNote.content"
            type="textarea"
            placeholder="开始输入笔记内容..."
            class="content-input"
            :rows="20"
            @input="handleNoteChange"
          />
          <div class="note-info">
            <span>最后更新: {{ formatFullTime(editingNote.updated_at || editingNote.updatedAt) }}</span>
            <span v-if="getFolderName(editingNote.folder_id)">
              所属文件夹: {{ getFolderName(editingNote.folder_id) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧栏 - 标签管理 -->
    <div class="sidebar right-sidebar" :class="{ collapsed: rightCollapsed }">
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="rightCollapsed = !rightCollapsed">
        <el-icon v-if="!rightCollapsed"><DArrowRight /></el-icon>
        <el-icon v-else><DArrowLeft /></el-icon>
      </div>

      <!-- 右侧内容 -->
      <div v-show="!rightCollapsed" class="sidebar-content">
        <div class="sidebar-header">
          <h3>标签</h3>
          <el-button
            type="primary"
            size="small"
            :icon="DocumentAdd"
            @click="handleCreateTag"
          >
            添加标签
          </el-button>
        </div>

        <div class="divider"></div>

        <!-- 当前笔记的标签 -->
        <div v-if="editingNote" class="tag-list">
          <div class="section-title">当前笔记标签</div>
          <div
            v-for="tag in noteTags"
            :key="tag.id"
            class="tag-item"
          >
            <span class="tag-name">{{ tag.name }}</span>
            <el-dropdown @command="(cmd) => handleTagAction(cmd, tag)" trigger="click">
              <el-icon class="tag-more"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="unbind">解除绑定</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除标签</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-if="noteTags.length === 0" class="empty-tags">
            暂无标签
          </div>
        </div>

        <!-- 所有标签 -->
        <div class="tag-list">
          <div class="section-title">所有标签</div>
          <div
            v-for="tag in allTags"
            :key="tag.id"
            class="tag-item"
            :class="{ bound: isTagBound(tag.id) }"
            @click="handleTagClick(tag)"
          >
            <span class="tag-name">{{ tag.name }}</span>
          </div>
          <div v-if="allTags.length === 0" class="empty-tags">
            暂无标签
          </div>
        </div>
      </div>
    </div>

    <!-- 文件夹对话框 -->
    <el-dialog
      v-model="folderDialogVisible"
      :title="editingFolder ? '编辑文件夹' : '新建文件夹'"
      width="400px"
    >
      <el-form :model="folderForm" label-width="100px">
        <el-form-item label="文件夹名">
          <el-input v-model="folderForm.name" placeholder="请输入文件夹名称" />
        </el-form-item>
        <el-form-item v-if="!editingFolder" label="父文件夹">
          <el-select v-model="folderForm.parentId" placeholder="选择父文件夹（默认根目录）" style="width: 100%">
            <el-option label="根目录" :value="0" />
            <el-option
              v-for="folder in allFolders"
              :key="folder.id"
              :label="getFolderPath(folder)"
              :value="folder.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="folderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveFolder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 笔记对话框 -->
    <el-dialog v-model="noteDialogVisible" title="新建笔记" width="500px">
      <el-form :model="noteForm" label-width="100px">
        <el-form-item label="笔记标题">
          <el-input v-model="noteForm.title" placeholder="请输入笔记标题" />
        </el-form-item>
        <el-form-item label="所属文件夹">
          <el-select v-model="noteForm.folderId" placeholder="选择文件夹" style="width: 100%">
            <el-option label="未分类" :value="null" />
            <el-option
              v-for="folder in allFolders"
              :key="folder.id"
              :label="getFolderPath(folder)"
              :value="folder.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveNote">确定</el-button>
      </template>
    </el-dialog>

    <!-- 标签对话框 -->
    <el-dialog
      v-model="tagDialogVisible"
      :title="editingTag ? '编辑标签' : '新建标签'"
      width="400px"
    >
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderAdd,
  DocumentAdd,
  Search,
  MoreFilled,
  User,
  Document,
  DArrowLeft,
  DArrowRight,
  Delete,
  ArrowLeft
} from '@element-plus/icons-vue'
import { getNoteList, createNote, updateNote, deleteNote, searchNotes, getNoteDetail } from '../api/note'
import { createFolder, getFolderList, updateFolder, deleteFolder as deleteFolderApi } from '../api/folder'
import { getUserProfile } from '../api/user'
import { logout } from '../api/auth'
import { getTagList, bindTag, createTag, updateTag, deleteTag as deleteTagApi } from '../api/tag'
import FileTree from '../components/FileTree.vue'

const router = useRouter()

// 状态管理
const loading = ref(false)
const searching = ref(false)
const allNotes = ref([])
const allFolders = ref([])
const selectedFolderId = ref(null)
const selectedNoteId = ref(null)
const searchKeyword = ref('')
const searchResults = ref([])
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)

// 编辑器状态
const editingNote = ref(null)
const saveStatus = ref('已保存')
const saveTimer = ref(null)
const hasUnsavedChanges = ref(false)

// 展开的文件夹集合
const expandedFolders = ref(new Set())

// 标签相关
const allTags = ref([])
const noteTags = ref([])
const tagDialogVisible = ref(false)
const editingTag = ref(null)
const tagForm = ref({
  name: ''
})

// 用户信息
const userInfo = ref(null)

// 文件夹对话框
const folderDialogVisible = ref(false)
const editingFolder = ref(null)
const folderForm = ref({
  name: ''
})

// 笔记对话框
const noteDialogVisible = ref(false)
const noteForm = ref({
  title: '',
  folderId: null
})

// 滚轮控制
const isCtrlPressed = ref(false)
const handleWheel = (e) => {
  if (isCtrlPressed.value) {
    e.preventDefault()
  }
}

const handleKeyDown = (e) => {
  if (e.ctrlKey) {
    isCtrlPressed.value = true
  }
}

const handleKeyUp = (e) => {
  if (!e.ctrlKey) {
    isCtrlPressed.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }
})

// 计算属性 - 根级文件夹
const rootFolders = computed(() => {
  return allFolders.value.filter(f => !f.parent_id || f.parent_id === 0)
})

// 显示的笔记
const displayNotes = computed(() => {
  if (searchKeyword.value) {
    return searchResults.value
  }
  // 选中文件夹时显示该文件夹的笔记，否则显示所有笔记
  if (selectedFolderId.value) {
    return allNotes.value.filter(n => n.folder_id === selectedFolderId.value)
  }
  return allNotes.value
})

// 内容标题
const contentTitle = computed(() => {
  if (searchKeyword.value) return '搜索结果'
  if (selectedFolderId.value) {
    const folder = allFolders.value.find(f => f.id === selectedFolderId.value)
    return folder?.name || '文件夹'
  }
  return '全部笔记'
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const data = await getUserProfile()
    userInfo.value = data
    localStorage.setItem('userInfo', JSON.stringify(data))
  } catch (error) {
    console.error('获取用户信息失败:', error)
    const localUserInfo = localStorage.getItem('userInfo')
    if (localUserInfo) {
      try {
        userInfo.value = JSON.parse(localUserInfo)
      } catch (e) {
        console.error('解析本地用户信息失败:', e)
      }
    }
  }
}

// 获取所有文件夹（非递归方式，避免重复API调用）
const fetchAllFolders = async () => {
  try {
    // 先获取根级文件夹
    const rootData = await getFolderList({ folder_id: 0 })
    const rootList = rootData || []

    // 收集所有文件夹ID
    const allFoldersList = [...rootList]

    // 递归获取子文件夹
    const fetchChildFolders = async (folderList) => {
      const newFolders = []
      for (const folder of folderList) {
        try {
          const childData = await getFolderList({ folder_id: folder.id })
          if (childData && childData.length > 0) {
            newFolders.push(...childData)
            allFoldersList.push(...childData)
          }
        } catch (e) {
          console.error(`获取文件夹 ${folder.id} 的子文件夹失败:`, e)
        }
      }
      return newFolders
    }

    // 按层级递归获取
    let currentLevel = rootList
    while (currentLevel.length > 0) {
      const nextLevel = await fetchChildFolders(currentLevel)
      if (nextLevel.length === 0) break
      currentLevel = nextLevel
    }

    allFolders.value = allFoldersList
  } catch (error) {
    console.error('获取文件夹列表失败:', error)
    allFolders.value = []
  }
}

// 获取所有笔记
const fetchAllNotes = async () => {
  loading.value = true
  try {
    const data = await getNoteList()
    allNotes.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取笔记列表失败:', error)
    allNotes.value = []
  } finally {
    loading.value = false
  }
}

// 获取所有标签
const fetchAllTags = async () => {
  try {
    const data = await getTagList()
    allTags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取标签列表失败:', error)
    allTags.value = []
  }
}

// 获取当前笔记的标签
const fetchNoteTags = async () => {
  if (!editingNote.value) return

  try {
    const data = await getTagList({ note_id: editingNote.value.id })
    noteTags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取笔记标签失败:', error)
    noteTags.value = []
  }
}

// 搜索笔记
let searchDebounceTimer = null
const handleSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  searchDebounceTimer = setTimeout(async () => {
    searching.value = true
    try {
      const data = await searchNotes({ keyword: searchKeyword.value })
      searchResults.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('搜索笔记失败:', error)
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

// 文件夹点击
const handleFolderClick = (folder) => {
  selectedFolderId.value = folder.id
  editingNote.value = null
  selectedNoteId.value = null
}

// 展开文件夹
const handleFolderExpand = (folder) => {
  expandedFolders.value.add(folder.id)
}

// 折叠文件夹
const handleFolderCollapse = (folder) => {
  expandedFolders.value.delete(folder.id)
}

// 笔记点击
const handleNoteClick = async (note) => {
  selectedNoteId.value = note.id
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm('当前笔记有未保存的更改，是否保存？', '提示', {
      confirmButtonText: '保存',
      cancelButtonText: '放弃',
      type: 'warning'
    }).then(() => {
      saveCurrentNote().then(() => {
        openNoteEditor(note)
      })
    }).catch(() => {
      hasUnsavedChanges.value = false
      openNoteEditor(note)
    })
  } else {
    openNoteEditor(note)
  }
}

// 打开笔记编辑器
const openNoteEditor = async (note) => {
  loading.value = true
  try {
    const data = await getNoteDetail({ note_id: note.id })
    editingNote.value = {
      ...data,
      folder_id: data.folder_id || data.folderId
    }
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'

    // 获取当前笔记的标签
    await fetchNoteTags()

    // 自动展开所在文件夹
    if (editingNote.value.folder_id) {
      const folder = allFolders.value.find(f => f.id === editingNote.value.folder_id)
      if (folder) {
        expandParentFolders(folder.parent_id)
      }
    }
  } catch (error) {
    console.error('获取笔记详情失败:', error)
    ElMessage.error('获取笔记详情失败')
  } finally {
    loading.value = false
  }
}

// 递归展开父文件夹
const expandParentFolders = (parentId) => {
  if (!parentId || parentId === 0) return
  expandedFolders.value.add(parentId)
  const parent = allFolders.value.find(f => f.id === parentId)
  if (parent && parent.parent_id) {
    expandParentFolders(parent.parent_id)
  }
}

// 关闭编辑器
const closeEditor = () => {
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm('当前笔记有未保存的更改，是否保存？', '提示', {
      confirmButtonText: '保存',
      cancelButtonText: '放弃',
      type: 'warning'
    }).then(() => {
      saveCurrentNote().then(() => {
        editingNote.value = null
        selectedNoteId.value = null
        noteTags.value = []
      })
    }).catch(() => {
      hasUnsavedChanges.value = false
      editingNote.value = null
      selectedNoteId.value = null
      noteTags.value = []
    })
  } else {
    editingNote.value = null
    selectedNoteId.value = null
    noteTags.value = []
  }
}

// 笔记内容变化
const handleNoteChange = () => {
  hasUnsavedChanges.value = true
  saveStatus.value = '有未保存的更改...'

  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }

  saveTimer.value = setTimeout(() => {
    saveCurrentNote()
  }, 2000)
}

// 保存当前笔记
const saveCurrentNote = async () => {
  if (!editingNote.value || !hasUnsavedChanges.value) {
    return
  }

  saveStatus.value = '保存中...'

  try {
    await updateNote({
      note_id: editingNote.value.id,
      title: editingNote.value.title,
      content: editingNote.value.content,
      folder_id: editingNote.value.folder_id
    })
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'

    // 刷新笔记列表
    await fetchAllNotes()
    await fetchAllFolders()
  } catch (error) {
    console.error('保存笔记失败:', error)
    saveStatus.value = '保存失败'
    ElMessage.error('保存笔记失败')
  }
}

// 创建文件夹
const handleCreateFolder = (parentId) => {
  editingFolder.value = null
  // 使用当前选中的文件夹作为默认父文件夹，或使用明确传入的 parentId
  const effectiveParentId = (parentId !== undefined && parentId !== null)
    ? Number(parentId)
    : (selectedFolderId.value ?? 0)
  folderForm.value = { name: '', parentId: effectiveParentId }
  folderDialogVisible.value = true
}

// 保存文件夹
const handleSaveFolder = async () => {
  if (!folderForm.value.name.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }

  try {
    if (editingFolder.value) {
      await updateFolder({
        folder_id: editingFolder.value.id,
        name: folderForm.value.name
      })
      ElMessage.success('文件夹修改成功')
    } else {
      await createFolder({
        name: folderForm.value.name,
        parent_id: Number(folderForm.value.parentId) || 0
      })
      ElMessage.success('文件夹创建成功')
    }
    folderDialogVisible.value = false
    await fetchAllFolders()
  } catch (error) {
    console.error('保存文件夹失败:', error)
  }
}

// 重命名文件夹
const handleRenameFolder = (folder) => {
  editingFolder.value = folder
  folderForm.value = { name: folder.name, parentId: folder.parent_id }
  folderDialogVisible.value = true
}

// 删除文件夹
const handleDeleteFolder = (folder) => {
  ElMessageBox.confirm('确定要删除该文件夹吗？文件夹中的笔记将一起被删除。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteFolderApi({ folder_id: folder.id })
      ElMessage.success('文件夹删除成功')
      if (selectedFolderId.value === folder.id) {
        selectedFolderId.value = null
      }
      await fetchAllFolders()
      await fetchAllNotes()
    } catch (error) {
      console.error('删除文件夹失败:', error)
    }
  }).catch(() => {})
}

// 创建笔记
const handleCreateNote = (params) => {
  // 优先使用明确传入的 folder_id（从子文件夹触发），其次使用当前选中文件夹
  const effectiveFolderId = params?.folder_id !== undefined
    ? params.folder_id
    : (selectedFolderId.value ?? null)
  noteForm.value = {
    title: '',
    folderId: effectiveFolderId
  }
  noteDialogVisible.value = true
}

// 保存笔记
const handleSaveNote = async () => {
  if (!noteForm.value.title.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }

  try {
    const result = await createNote({
      title: noteForm.value.title,
      content: '',
      folder_id: noteForm.value.folderId
    })
    noteDialogVisible.value = false
    ElMessage.success('笔记创建成功')

    // 获取新创建的笔记并打开编辑器
    const newNote = await getNoteDetail({ note_id: result.note_id || result.id })
    if (newNote) {
      await fetchAllNotes()
      await fetchAllFolders()
      editingNote.value = {
        ...newNote,
        folder_id: newNote.folder_id || newNote.folderId
      }
      selectedNoteId.value = editingNote.value.id
      await fetchNoteTags()
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

// 删除笔记
const handleDeleteNote = async () => {
  if (!editingNote.value) return

  try {
    await ElMessageBox.confirm('确定要删除该笔记吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteNote({ note_id: editingNote.value.id })
    ElMessage.success('笔记删除成功')
    hasUnsavedChanges.value = false
    editingNote.value = null
    selectedNoteId.value = null
    noteTags.value = []
    await fetchAllNotes()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除笔记失败:', error)
    }
  }
}

// 创建标签
const handleCreateTag = () => {
  editingTag.value = null
  tagForm.value = { name: '' }
  tagDialogVisible.value = true
}

// 保存标签
const handleSaveTag = async () => {
  if (!tagForm.value.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  try {
    if (editingTag.value) {
      await updateTag({
        tag_id: editingTag.value.id,
        name: tagForm.value.name
      })
      ElMessage.success('标签修改成功')
    } else {
      await createTag({ name: tagForm.value.name })
      ElMessage.success('标签创建成功')
    }
    tagDialogVisible.value = false
    fetchAllTags()
    if (editingNote.value) {
      await fetchNoteTags()
    }
  } catch (error) {
    console.error('保存标签失败:', error)
  }
}

// 标签操作
const handleTagAction = (command, tag) => {
  if (command === 'edit') {
    editingTag.value = tag
    tagForm.value = { name: tag.name }
    tagDialogVisible.value = true
  } else if (command === 'unbind') {
    ElMessageBox.confirm('确定要解除该标签与当前笔记的绑定吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        // 解除绑定：只保留未点击的标签
        const boundTagIds = noteTags.value
          .filter(t => t.id !== tag.id)
          .map(t => t.id)
        await bindTag({
          note_id: editingNote.value.id,
          tag_ids: boundTagIds
        })
        ElMessage.success('标签已解除绑定')
        await fetchNoteTags()
      } catch (error) {
        console.error('解除标签绑定失败:', error)
      }
    }).catch(() => {})
  } else if (command === 'delete') {
    ElMessageBox.confirm('确定要删除该标签吗？删除后所有关联的笔记将失去该标签。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await deleteTagApi({ tag_id: tag.id })
        ElMessage.success('标签删除成功')
        fetchAllTags()
        if (editingNote.value) {
          await fetchNoteTags()
        }
      } catch (error) {
        console.error('删除标签失败:', error)
      }
    }).catch(() => {})
  }
}

// 判断标签是否已绑定
const isTagBound = (tagId) => {
  return noteTags.value.some(t => t.id === tagId)
}

// 点击标签进行绑定/解绑
const handleTagClick = async (tag) => {
  if (!editingNote.value) return

  try {
    if (isTagBound(tag.id)) {
      // 解绑
      const boundTagIds = noteTags.value
        .filter(t => t.id !== tag.id)
        .map(t => t.id)
      await bindTag({
        note_id: editingNote.value.id,
        tag_ids: boundTagIds
      })
    } else {
      // 绑定
      const boundTagIds = [...noteTags.value.map(t => t.id), tag.id]
      await bindTag({
        note_id: editingNote.value.id,
        tag_ids: boundTagIds
      })
    }
    await fetchNoteTags()
  } catch (error) {
    console.error('标签绑定操作失败:', error)
  }
}

// 用户命令
const handleUserCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    try {
      await logout()
    } catch (error) {
      console.error('退出登录请求失败:', error)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')

    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}

// 获取文件夹名称
const getFolderName = (folderId) => {
  if (!folderId) return ''
  const folder = allFolders.value.find(f => f.id === folderId)
  return folder?.name || ''
}

// 获取文件夹路径（用于下拉选择）
const getFolderPath = (folder) => {
  const parts = [folder.name]
  let current = folder
  while (current.parent_id && current.parent_id !== 0) {
    const parent = allFolders.value.find(f => f.id === current.parent_id)
    if (parent) {
      parts.unshift(parent.name)
      current = parent
    } else {
      break
    }
  }
  return parts.join(' / ')
}

// 格式化时间（简短）
const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < week) return `${Math.floor(diff / day)}天前`
  return date.toLocaleDateString('zh-CN')
}

// 格式化时间（完整）
const formatFullTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchUserInfo()
  fetchAllFolders()
  fetchAllNotes()
  fetchAllTags()
})
</script>

<style scoped>
.home-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background-color: #272e33;
}

/* 左侧栏和右侧栏基础样式 */
.sidebar {
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #2d353b;
  border-right: 1px solid #7a8478;
  transition: width 0.3s ease;
  z-index: 10;
}

.left-sidebar {
  width: 280px;
}

.left-sidebar.collapsed {
  width: 40px;
}

.right-sidebar {
  border-right: none;
  border-left: 1px solid #7a8478;
  width: 280px;
}

.right-sidebar.collapsed {
  width: 40px;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 折叠按钮 */
.collapse-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 40px;
  background-color: #414b50;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 20;
  color: #d3c6aa;
}

.left-sidebar .collapse-btn {
  right: -10px;
}

.right-sidebar .collapse-btn {
  left: -10px;
}

.collapse-btn:hover {
  background-color: #7fbbb3;
  color: #272e33;
}

/* 顶部按钮区 */
.sidebar-top {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  width: 100%;
}

/* 搜索框 */
.search-container {
  padding: 0 12px 12px;
}

.search-container :deep(.el-input__wrapper) {
  background-color: #414b50;
  border-color: #7a8478;
  box-shadow: none;
}

.search-container :deep(.el-input__inner) {
  color: #d3c6aa;
}

/* 分隔线 */
.divider {
  height: 1px;
  background-color: #7a8478;
  margin: 0 12px;
}

/* 文件树容器 */
.file-tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.file-tree-container::-webkit-scrollbar {
  width: 6px;
}

.file-tree-container::-webkit-scrollbar-thumb {
  background-color: #4a5658;
  border-radius: 3px;
}

/* 搜索结果 */
.search-results {
  padding: 8px;
}

.search-title {
  color: #9da9a0;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 12px;
  font-weight: 600;
  padding: 0 8px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.search-result-item:hover {
  background-color: #414b50;
}

.search-result-item.active {
  background-color: #3d484d;
  border-left: 3px solid #7fbbb3;
}

.search-result-item .note-icon {
  margin-right: 10px;
  color: #7fbbb3;
  font-size: 16px;
  flex-shrink: 0;
}

.search-result-item .note-info {
  flex: 1;
  min-width: 0;
}

.search-result-item .note-title {
  color: #d3c6aa;
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-item .note-summary {
  color: #9da9a0;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-search {
  padding: 20px 0;
  text-align: center;
}

.empty-search :deep(.el-empty) {
  --el-empty-description-color: #7a8478;
}

/* 底部用户信息 */
.sidebar-footer {
  border-top: 1px solid #7a8478;
  padding: 12px;
  background-color: #2d353b;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #414b50;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #7fbbb3;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.user-avatar .el-icon {
  font-size: 18px;
  color: #272e33;
}

.user-details {
  flex: 1;
}

.username {
  color: #d3c6aa;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.user-email {
  color: #9da9a0;
  font-size: 12px;
}

/* 右侧栏头部 */
.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #7a8478;
}

.sidebar-header h3 {
  margin: 0;
  color: #d3c6aa;
  font-size: 16px;
  font-weight: 600;
}

/* 标签列表 */
.tag-list {
  padding: 12px 16px;
  margin-bottom: 16px;
}

.section-title {
  color: #9da9a0;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 600;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
  background-color: #414b50;
  position: relative;
}

.tag-item:hover {
  background-color: #3d484d;
}

.tag-item.bound {
  background-color: #7fbbb3;
}

.tag-item.bound .tag-name {
  color: #272e33;
}

.tag-name {
  flex: 1;
  color: #d3c6aa;
  font-size: 14px;
}

.tag-more {
  color: #7a8478;
  padding: 2px;
}

.tag-item:hover .tag-more {
  color: #d3c6aa;
}

.empty-tags {
  text-align: center;
  color: #7a8478;
  padding: 12px;
  font-size: 13px;
}

/* 中间内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #272e33;
  overflow: hidden;
}

/* 笔记列表视图 */
.notes-list-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #7a8478;
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 0;
  color: #d3c6aa;
  font-size: 24px;
  font-weight: 600;
}

.note-count {
  color: #9da9a0;
  font-size: 14px;
}

.note-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-list::-webkit-scrollbar {
  width: 8px;
}

.note-list::-webkit-scrollbar-thumb {
  background-color: #4a5658;
  border-radius: 4px;
}

.note-card {
  background-color: #2d353b;
  border: 1px solid #7a8478;
  cursor: pointer;
  transition: all 0.2s;
}

.note-card:hover {
  border-color: #7fbbb3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.note-card.selected {
  border-color: #7fbbb3;
  background-color: #3d484d;
}

.note-card :deep(.el-card__body) {
  padding: 16px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.note-title {
  margin: 0;
  color: #d3c6aa;
  font-size: 16px;
  font-weight: 500;
}

.note-time {
  color: #9da9a0;
  font-size: 12px;
}

.note-summary {
  color: #9da9a0;
  font-size: 13px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-notes {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.loading-container {
  padding: 20px;
}

/* 笔记编辑视图 */
.note-editor-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: #2d353b;
  border-bottom: 1px solid #7a8478;
}

.back-btn {
  color: #d3c6aa;
}

.back-btn:hover {
  color: #7fbbb3;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.save-status {
  color: #a7c080;
  font-size: 13px;
}

.editor-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.editor-content::-webkit-scrollbar {
  width: 8px;
}

.editor-content::-webkit-scrollbar-thumb {
  background-color: #4a5658;
  border-radius: 4px;
}

.title-input {
  margin-bottom: 20px;
}

.title-input :deep(.el-input__wrapper) {
  background-color: #2d353b;
  box-shadow: none;
  border: none;
  padding: 0;
}

.title-input :deep(.el-input__inner) {
  font-size: 24px;
  font-weight: 600;
  color: #d3c6aa;
}

.content-input :deep(.el-textarea__inner) {
  background-color: #2d353b;
  border: 1px solid #7a8478;
  color: #d3c6aa;
  font-size: 15px;
  line-height: 1.8;
  resize: none;
}

.content-input :deep(.el-textarea__inner):focus {
  border-color: #7fbbb3;
}

.note-info {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  color: #7a8478;
  font-size: 13px;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background-color: #2d353b;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #7a8478;
}

:deep(.el-dialog__title) {
  color: #d3c6aa;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form-item__label) {
  color: #a7c080;
}

:deep(.el-input__inner) {
  color: #d3c6aa;
}

:deep(.el-textarea__inner) {
  color: #d3c6aa;
}

:deep(.el-select__wrapper) {
  background-color: #414b50;
}

/* 浅色模式 */
@media (prefers-color-scheme: light) {
  .home-container {
    background-color: #fdf6e3;
  }

  .sidebar {
    background-color: #f3e7c8;
    border-right-color: #a7c080;
  }

  .right-sidebar {
    border-left-color: #a7c080;
  }

  .collapse-btn {
    background-color: #e6dcc4;
    color: #5c6a72;
  }

  .collapse-btn:hover {
    background-color: #7fbbb3;
    color: #fdf6e3;
  }

  .search-container :deep(.el-input__wrapper) {
    background-color: #e6dcc4;
    border-color: #a7c080;
  }

  .search-container :deep(.el-input__inner) {
    color: #5c6a72;
  }

  .divider {
    background-color: #a7c080;
  }

  .search-title {
    color: #9da9a0;
  }

  .search-result-item:hover {
    background-color: #e6dcc4;
  }

  .search-result-item.active {
    background-color: #d9d3bc;
  }

  .search-result-item .note-info .note-title {
    color: #5c6a72;
  }

  .search-result-item .note-info .note-summary {
    color: #9da9a0;
  }

  .empty-search :deep(.el-empty) {
    --el-empty-description-color: #9da9a0;
  }

  .sidebar-footer {
    background-color: #f3e7c8;
    border-top-color: #a7c080;
  }

  .user-info:hover {
    background-color: #e6dcc4;
  }

  .user-avatar .el-icon {
    color: #fdf6e3;
  }

  .username {
    color: #5c6a72;
  }

  .user-email {
    color: #9da9a0;
  }

  .sidebar-header {
    border-bottom-color: #a7c080;
  }

  .sidebar-header h3 {
    color: #5c6a72;
  }

  .tag-item {
    background-color: #e6dcc4;
  }

  .tag-item:hover {
    background-color: #d9d3bc;
  }

  .tag-item.bound {
    background-color: #7fbbb3;
  }

  .tag-item.bound .tag-name {
    color: #fdf6e3;
  }

  .tag-name {
    color: #5c6a72;
  }

  .tag-more {
    color: #9da9a0;
  }

  .tag-item:hover .tag-more {
    color: #5c6a72;
  }

  .empty-tags {
    color: #9da9a0;
  }

  .main-content {
    background-color: #fdf6e3;
  }

  .content-header {
    border-bottom-color: #a7c080;
  }

  .content-header h2 {
    color: #5c6a72;
  }

  .note-count {
    color: #9da9a0;
  }

  .note-card {
    background-color: #f3e7c8;
    border-color: #a7c080;
  }

  .note-card.selected {
    background-color: #e6dcc4;
  }

  .note-title {
    color: #5c6a72;
  }

  .note-summary {
    color: #9da9a0;
  }

  .editor-header {
    background-color: #f3e7c8;
    border-bottom-color: #a7c080;
  }

  .back-btn {
    color: #5c6a72;
  }

  .back-btn:hover {
    color: #7fbbb3;
  }

  .title-input :deep(.el-input__wrapper) {
    background-color: #fdf6e3;
  }

  .title-input :deep(.el-input__inner) {
    color: #5c6a72;
  }

  .content-input :deep(.el-textarea__inner) {
    background-color: #fdf6e3;
    border-color: #a7c080;
    color: #5c6a72;
  }

  .content-input :deep(.el-textarea__inner):focus {
    border-color: #7fbbb3;
  }

  .note-info {
    color: #9da9a0;
  }

  :deep(.el-dialog) {
    background-color: #f3e7c8;
  }

  :deep(.el-dialog__header) {
    border-bottom-color: #a7c080;
  }

  :deep(.el-dialog__title) {
    color: #5c6a72;
  }

  :deep(.el-form-item__label) {
    color: #7fbbb3;
  }

  :deep(.el-input__inner) {
    color: #5c6a72;
  }

  :deep(.el-textarea__inner) {
    color: #5c6a72;
  }

  :deep(.el-select__wrapper) {
    background-color: #e6dcc4;
  }
}
</style>
