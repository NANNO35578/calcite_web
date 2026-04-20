<template>
  <div class="home-container" @wheel="handleWheel">
    <!-- 使用 ElSplitter 实现三栏拖拽布局，默认比例 1:2:1 (25% : 50% : 25%) -->
    <el-splitter class="main-splitter">
      <!-- 左侧栏 - 文件浏览器 -->
      <el-splitter-panel :size="leftCollapsed ? '0px' : '20%'" :min="0" :resizable="!leftCollapsed">
        <LeftSidebar
          ref="leftSidebarRef"
          :selected-folder-id="selectedFolderId"
          :selected-note-id="editingNote?.id || selectedNoteId"
          :expanded-folders="expandedFolders"
          :user-info="userInfo"
          @create-note="handleCreateNote"
          @create-folder="handleCreateFolder"
          @folder-click="handleFolderClick"
          @folder-expand="handleFolderExpand"
          @folder-collapse="handleFolderCollapse"
          @note-click="handleNoteClick"
          @folder-create="handleCreateFolder"
          @folder-rename="handleRenameFolder"
          @folder-delete="handleDeleteFolder"
          @user-command="handleUserCommand"
          @ocr-upload="handleOCRUpload"
          @folders-loaded="handleFoldersLoaded"
          @notes-loaded="handleNotesLoaded"
        />
      </el-splitter-panel>

      <!-- 中间内容区 (自适应剩余宽度) -->
      <el-splitter-panel size="60%" :min="300">
        <div class="main-content">
          <!-- 顶部工具栏：控制左右侧栏、搜索 -->
          <CenterToolbar
            @toggle-left="leftCollapsed = !leftCollapsed"
            @toggle-right="rightCollapsed = !rightCollapsed"
            @search="handleSearchWithScope"
            @recommend="handleRecommend"
          />

          <!-- 搜索结果视图 -->
          <SearchResults
            v-if="searchKeyword && !editingNote && !previewingNote"
            :results="searchResults"
            :total="searchTotal"
            :from="searchFrom"
            :page-size="searchPageSize"
            :loading="searching"
            :selected-note-id="selectedNoteId"
            :user-id="userInfo?.user_id"
            @note-click="handleNoteClick"
            @public-note-click="handlePublicNoteClick"
            @prev="handleSearchPrev"
            @next="handleSearchNext"
          />

          <!-- 笔记列表视图 -->
          <NoteListView
            v-else-if="!editingNote && !previewingNote"
            :title="contentTitle"
            :notes="displayNotes"
            :loading="recommending ? recommendLoading : loading"
            :selected-note-id="selectedNoteId"
            @note-click="handleListNoteClick"
          />

          <!-- 公开笔记预览视图 -->
          <PublicNotePreview
            v-else-if="previewingNote"
            :note="previewingNote"
            @update:note="previewingNote = $event"
            @back="closePreview"
          />

          <!-- 笔记编辑视图 -->
          <NoteEditor
            v-else
            :note="editingNote"
            :save-status="saveStatus"
            :folder-name="getFolderName(editingNote.folder_id)"
            @update:title="editingNote.title = $event"
            @update:content="editingNote.content = $event"
            @input="handleNoteChange"
            @back="closeEditor"
            @save="handleSaveNoteManual"
            @file-uploaded="handleFileUploaded"
          />
        </div>
      </el-splitter-panel>

      <!-- 右侧栏 - 标签和文件管理 -->
      <el-splitter-panel :size="rightCollapsed ? '0px' : '20%'" :min="0" :resizable="!rightCollapsed">
        <RightSidebar
          :editing-note="previewingNote || editingNote"
          :is-preview="!!previewingNote"
          :all-files="allFiles"
          :files-loading="filesLoading"
          :all-folders="allFolders"
          @note-field-change="handleNoteFieldChange"
          @delete-note="handleDeleteNote"
          @file-delete="handleDeleteFile"
          @file-refresh="handleFileRefresh"
        />
      </el-splitter-panel>
    </el-splitter>

    <!-- 文件夹对话框 -->
    <FolderDialog
      v-model:visible="folderDialogVisible"
      :is-editing="!!editingFolder"
      :form="folderForm"
      :all-folders="allFolders"
      @confirm="handleSaveFolder"
    />

    <!-- 笔记对话框 -->
    <NoteDialog
      v-model:visible="noteDialogVisible"
      :form="noteForm"
      :all-folders="allFolders"
      @confirm="handleSaveNote"
    />


  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderAdd,
  DocumentAdd,
  Search,
  MoreFilled,
  User,
  Document,
  Delete,
  ArrowLeft,
  ArrowRight,
  Clock,
  Star,
  Menu
} from '@element-plus/icons-vue'
import { getNoteList, createNote, updateNote, deleteNote, searchNotes, getNoteDetail, viewNote, getRecommendNotes } from '../api/note'
import { createFolder, getFolderList, updateFolder, deleteFolder as deleteFolderApi } from '../api/folder'
import { getUserProfile } from '../api/user'
import { logout } from '../api/auth'
import { getFileList, deleteFile } from '../api/file'
import { recognizeOCR, pollOCRStatus } from '../api/ocr'

// 导入拆分后的组件
import LeftSidebar from '../components/sidebar/LeftSidebar.vue'
import RightSidebar from '../components/sidebar/RightSidebar.vue'
import SearchResults from '../components/sidebar/SearchResults.vue'
import CenterToolbar from '../components/center/CenterToolbar.vue'
import NoteListView from '../components/center/NoteListView.vue'
import NoteEditor from '../components/center/NoteEditor.vue'
import PublicNotePreview from '../components/center/PublicNotePreview.vue'
import FolderDialog from '../components/dialogs/FolderDialog.vue'
import NoteDialog from '../components/dialogs/NoteDialog.vue'

const router = useRouter()

// ===== 状态管理 =====
const loading = ref(false)
const searching = ref(false)
const allNotes = ref([])
const allFolders = ref([])
const selectedFolderId = ref(null)
const selectedNoteId = ref(null)
const searchKeyword = ref('')
const searchIsPublic = ref(false)
const searchResults = ref([])
const searchTotal = ref(0)
const searchFrom = ref(0)
const searchPageSize = ref(20)

// ===== 推荐笔记状态 =====
const recommending = ref(false)
const recommendNotes = ref([])
const recommendLoading = ref(false)
const recommendPage = ref(1)
const recommendPageSize = ref(10)

// ===== 公开笔记预览状态 =====
const previewingNote = ref(null)

// ===== 侧边栏折叠状态 =====
const leftCollapsed = ref(localStorage.getItem('calcite:leftCollapsed') === 'true')
const rightCollapsed = ref(localStorage.getItem('calcite:rightCollapsed') === 'true')

// 监听折叠状态变化，保存到 localStorage
watch(leftCollapsed, (val) => {
  localStorage.setItem('calcite:leftCollapsed', String(val))
})
watch(rightCollapsed, (val) => {
  localStorage.setItem('calcite:rightCollapsed', String(val))
})



// ===== 编辑器状态 =====
const editingNote = ref(null)
const saveStatus = ref('已保存')
const saveTimer = ref(null)
const hasUnsavedChanges = ref(false)

// ===== 展开的文件夹集合 =====
const expandedFolders = ref(new Set())

// ===== 文件管理相关 =====
const allFiles = ref([])
const filesLoading = ref(false)

// ===== 用户信息 =====
const userInfo = ref(null)

// ===== 文件夹对话框 =====
const folderDialogVisible = ref(false)
const editingFolder = ref(null)
const folderForm = ref({ name: '', parentId: 0 })

// ===== 笔记对话框 =====
const noteDialogVisible = ref(false)
const noteForm = ref({ title: '', folderId: null })

// ===== 滚轮控制 =====
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
  fetchUserInfo()
  // 文件树由 FileTree.vue 组件自行懒加载根节点数据
  // 不再在初始化时全量请求文件夹和笔记
  fetchAllUserFiles()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }
})

// ===== 计算属性 - 根级文件夹 =====
const rootFolders = computed(() => {
  return allFolders.value.filter(f => !f.parent_id || f.parent_id === 0)
})

// ===== 显示的笔记 =====
const displayNotes = computed(() => {
  if (recommending.value) {
    return recommendNotes.value
  }
  if (searchKeyword.value) {
    return searchResults.value
  }
  if (selectedFolderId.value) {
    return allNotes.value.filter(n => n.folder_id === selectedFolderId.value)
  }
  return allNotes.value
})

// ===== 内容标题 =====
const contentTitle = computed(() => {
  if (recommending.value) return '推荐笔记'
  if (searchKeyword.value) return '搜索结果'
  if (selectedFolderId.value) {
    const folder = allFolders.value.find(f => f.id === selectedFolderId.value)
    return folder?.name || '文件夹'
  }
  return '全部笔记'
})

// ===== 获取用户信息 =====
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

// ===== 获取根文件夹 =====
const fetchRootFolders = async () => {
  try {
    const data = await getFolderList({ folder_id: 0 })
    const rootList = Array.isArray(data) ? data : []
    // 只保留根级文件夹，子文件夹由懒加载逐步填充
    allFolders.value = allFolders.value.filter(f => f.parent_id !== 0 && f.parent_id != null)
    const existingIds = new Set(allFolders.value.map(f => f.id))
    const newFolders = rootList.filter(f => !existingIds.has(f.id))
    allFolders.value.push(...newFolders)
  } catch (error) {
    console.error('获取根文件夹列表失败:', error)
  }
}

// ===== 获取根笔记 =====
const fetchRootNotes = async () => {
  loading.value = true
  try {
    const data = await getNoteList({ folder_id: 0 })
    const rootNotes = Array.isArray(data) ? data : []
    // 只保留根级笔记（folder_id 为 null 或 0），子文件夹笔记由懒加载填充
    allNotes.value = allNotes.value.filter(n => n.folder_id !== 0 && n.folder_id != null)
    const existingIds = new Set(allNotes.value.map(n => n.id))
    const newNotes = rootNotes.filter(n => !existingIds.has(n.id))
    allNotes.value.push(...newNotes)
  } catch (error) {
    console.error('获取根笔记列表失败:', error)
  } finally {
    loading.value = false
  }
}

// ===== 懒加载数据回写 =====
const handleFoldersLoaded = ({ folders, parentId }) => {
  const existingIds = new Set(allFolders.value.map(f => f.id))
  const newFolders = folders.filter(f => !existingIds.has(f.id))
  allFolders.value.push(...newFolders)
}

const handleNotesLoaded = ({ notes }) => {
  const existingIds = new Set(allNotes.value.map(n => n.id))
  const newNotes = notes.filter(n => !existingIds.has(n.id))
  allNotes.value.push(...newNotes)
}

// ===== 刷新指定文件夹数据 =====
const refreshFolderData = async (folderId) => {
  try {
    const [folders, notes] = await Promise.all([
      getFolderList({ folder_id: folderId }),
      getNoteList({ folder_id: folderId })
    ])
    handleFoldersLoaded({ folders: Array.isArray(folders) ? folders : [], parentId: folderId })
    handleNotesLoaded({ notes: Array.isArray(notes) ? notes : [] })
  } catch (e) {
    console.error(`刷新文件夹 ${folderId} 数据失败:`, e)
  }
}

// ===== 刷新文件树节点 =====
const leftSidebarRef = ref(null)
const refreshTreeNode = (folderId = 0) => {
  leftSidebarRef.value?.fileTreeRef?.refreshNode?.(folderId)
}

// ===== 获取所有文件夹（废弃递归全量加载，保留函数名兼容） =====
const fetchAllFolders = async () => {
  await fetchRootFolders()
}

// ===== 获取所有笔记（废弃全量加载，保留函数名兼容） =====
const fetchAllNotes = async () => {
  await fetchRootNotes()
}

// ===== 获取用户所有文件 =====
const fetchAllUserFiles = async () => {
  filesLoading.value = true
  try {
    const data = await getFileList({})
    allFiles.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取所有文件列表失败:', error)
    allFiles.value = []
  } finally {
    filesLoading.value = false
  }
}

// ===== 刷新文件列表 =====
const handleFileRefresh = () => {
  fetchAllUserFiles()
}

// ===== 搜索笔记 =====
let searchDebounceTimer = null

const doSearch = async (resetPage = true) => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    searchTotal.value = 0
    searchFrom.value = 0
    return
  }

  if (resetPage) {
    searchFrom.value = 0
  }

  searching.value = true
  try {
    const params = {
      keyword: searchKeyword.value.trim(),
      from: searchFrom.value,
      size: searchPageSize.value
    }
    if (searchIsPublic.value) {
      params.is_public = 1
    }
    const data = await searchNotes(params)
    if (Array.isArray(data)) {
      searchResults.value = data
      searchTotal.value = data.length < searchPageSize.value
        ? searchFrom.value + data.length
        : searchFrom.value + data.length + 1
    } else if (data && typeof data === 'object') {
      searchResults.value = data.list || data.items || data.data || []
      searchTotal.value = data.total || searchResults.value.length
    } else {
      searchResults.value = []
      searchTotal.value = 0
    }
  } catch (error) {
    console.error('搜索笔记失败:', error)
    searchResults.value = []
    searchTotal.value = 0
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    searching.value = false
  }
}

const handleSearchWithScope = ({ keyword, isPublic }) => {
  recommending.value = false
  searchKeyword.value = keyword
  searchIsPublic.value = !!isPublic
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    doSearch(true)
  }, 300)
}

const handleSearchPrev = () => {
  if (searchFrom.value <= 0) return
  searchFrom.value = Math.max(0, searchFrom.value - searchPageSize.value)
  doSearch(false)
}

const handleSearchNext = () => {
  if (searchFrom.value + searchPageSize.value >= searchTotal.value) return
  searchFrom.value += searchPageSize.value
  doSearch(false)
}

// ===== 获取推荐笔记 =====
const handleRecommend = async () => {
  // 清除搜索状态，进入推荐模式
  searchKeyword.value = ''
  searchResults.value = []
  searchTotal.value = 0
  recommending.value = true
  recommendLoading.value = true
  recommendPage.value = 1
  try {
    const data = await getRecommendNotes({
      page: recommendPage.value,
      page_size: recommendPageSize.value
    })
    if (Array.isArray(data)) {
      recommendNotes.value = data
    } else if (data && typeof data === 'object') {
      recommendNotes.value = data.list || data.items || data.data || []
    } else {
      recommendNotes.value = []
    }
  } catch (error) {
    console.error('获取推荐笔记失败:', error)
    ElMessage.error('获取推荐笔记失败')
    recommendNotes.value = []
  } finally {
    recommendLoading.value = false
  }
}

// ===== 列表笔记点击（根据当前模式决定行为） =====
const handleListNoteClick = (note) => {
  if (recommending.value) {
    handlePublicNoteClick(note)
  } else {
    handleNoteClick(note)
  }
}

// ===== 文件夹操作 =====
const handleFolderClick = (folder) => {
  recommending.value = false
  selectedFolderId.value = folder.id
  editingNote.value = null
  selectedNoteId.value = null
}

const handleFolderExpand = (folder) => {
  expandedFolders.value.add(folder.id)
}

const handleFolderCollapse = (folder) => {
  expandedFolders.value.delete(folder.id)
}

// ===== 笔记操作 =====
const handleNoteClick = async (note) => {
  selectedNoteId.value = note.id

  // 判断是否为其他人的公开笔记
  const currentUserId = userInfo.value?.user_id
  if (note.author_id !== undefined && note.author_id !== currentUserId) {
    if (hasUnsavedChanges.value) {
      ElMessageBox.confirm('当前笔记有未保存的更改，是否保存？', '提示', {
        confirmButtonText: '保存',
        cancelButtonText: '放弃',
        type: 'warning'
      }).then(() => {
        saveCurrentNote().then(() => {
          handlePublicNoteClick(note)
        })
      }).catch(() => {
        hasUnsavedChanges.value = false
        handlePublicNoteClick(note)
      })
    } else {
      await handlePublicNoteClick(note)
    }
    return
  }

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

const handlePublicNoteClick = async (note) => {
  loading.value = true
  try {
    // 调用浏览 API
    await viewNote({ note_id: note.id })

    // 获取笔记详情
    const data = await getNoteDetail({ note_id: note.id })
    previewingNote.value = {
      ...data,
      id: data.id || data.note_id,
      folder_id: data.folder_id || data.folderId,
      is_public: !!data.is_public
    }
  } catch (error) {
    console.error('打开公开笔记预览失败:', error)
    ElMessage.error('获取笔记详情失败')
  } finally {
    loading.value = false
  }
}

const closePreview = () => {
  previewingNote.value = null
  selectedNoteId.value = null
}

const openNoteEditor = async (note) => {
  loading.value = true
  try {
    const data = await getNoteDetail({ note_id: note.id })
    editingNote.value = {
      ...data,
      id: data.id || data.note_id,  // 确保 id 字段存在
      folder_id: data.folder_id || data.folderId,
      is_public: !!data.is_public   // 后端返回 0/1，转为 boolean
    }
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'

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

const expandParentFolders = (parentId) => {
  if (!parentId || parentId === 0) return
  expandedFolders.value.add(parentId)
  const parent = allFolders.value.find(f => f.id === parentId)
  if (parent && parent.parent_id) {
    expandParentFolders(parent.parent_id)
  }
}

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
      })
    }).catch(() => {
      hasUnsavedChanges.value = false
      editingNote.value = null
      selectedNoteId.value = null
    })
  } else {
    editingNote.value = null
    selectedNoteId.value = null
  }
}

// 关闭预览时也同步清理 selectedNoteId
watch(previewingNote, (val) => {
  if (!val && !editingNote.value) {
    selectedNoteId.value = null
  }
})

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
      summary: editingNote.value.summary,
      folder_id: editingNote.value.folder_id,
      is_public: editingNote.value.is_public
    })
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'
    await fetchAllNotes()
    await fetchAllFolders()
    const folderId = editingNote.value?.folder_id
    if (folderId !== undefined && folderId !== null) {
      await refreshFolderData(folderId)
      refreshTreeNode(folderId)
    }
  } catch (error) {
    console.error('保存笔记失败:', error)
    saveStatus.value = '保存失败'
    ElMessage.error('保存笔记失败')
  }
}

const handleDeleteNote = async () => {
  if (!editingNote.value) return

  try {
    await ElMessageBox.confirm('确定要删除该笔记吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const folderId = editingNote.value?.folder_id
    await deleteNote({ note_id: editingNote.value.id })
    ElMessage.success('笔记删除成功')
    hasUnsavedChanges.value = false
    editingNote.value = null
    selectedNoteId.value = null
    await fetchAllNotes()
    if (folderId !== undefined && folderId !== null) {
      await refreshFolderData(folderId)
      refreshTreeNode(folderId)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除笔记失败:', error)
    }
  }
}

// ===== 文件夹对话框操作 =====
const handleCreateFolder = (parentId) => {
  editingFolder.value = null
  const effectiveParentId = (parentId !== undefined && parentId !== null)
    ? Number(parentId)
    : (selectedFolderId.value ?? 0)
  folderForm.value = { name: '', parentId: effectiveParentId }
  folderDialogVisible.value = true
}

const handleRenameFolder = (folder) => {
  editingFolder.value = folder
  folderForm.value = { name: folder.name, parentId: folder.parent_id }
  folderDialogVisible.value = true
}

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
      const parentId = folder.parent_id ?? 0
      await refreshFolderData(parentId)
      refreshTreeNode(parentId)
    } catch (error) {
      console.error('删除文件夹失败:', error)
    }
  }).catch(() => { })
}

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
    const parentId = editingFolder.value ? editingFolder.value.parent_id : (Number(folderForm.value.parentId) || 0)
    await refreshFolderData(parentId)
    refreshTreeNode(parentId)
  } catch (error) {
    console.error('保存文件夹失败:', error)
  }
}

// ===== 笔记对话框操作 =====
const handleCreateNote = (params) => {
  recommending.value = false
  const effectiveFolderId = params?.folder_id !== undefined
    ? params.folder_id
    : (selectedFolderId.value ?? null)
  noteForm.value = { title: '', folderId: effectiveFolderId }
  noteDialogVisible.value = true
}

const handleSaveNote = async () => {
  if (!noteForm.value.title.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }

  try {
    const result = await createNote({
      title: noteForm.value.title,
      folder_id: noteForm.value.folderId
    })
    noteDialogVisible.value = false
    ElMessage.success('笔记创建成功')

    const newNote = await getNoteDetail({ note_id: result.note_id || result.id })
    if (newNote) {
      await fetchAllNotes()
      await fetchAllFolders()
      const folderId = newNote.folder_id || newNote.folderId
      if (folderId !== undefined && folderId !== null) {
        await refreshFolderData(folderId)
        refreshTreeNode(folderId)
      }
      editingNote.value = {
        ...newNote,
        folder_id: folderId
      }
      selectedNoteId.value = editingNote.value.id
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

// ===== 笔记信息面板字段变更（仅更新本地状态，不立即提交） =====
const handleNoteFieldChange = (payload) => {
  if (!editingNote.value) return
  Object.assign(editingNote.value, payload)
  hasUnsavedChanges.value = true
  saveStatus.value = '有未保存的更改...'
}

// ===== 手动保存笔记（由 editor-header 保存按钮触发） =====
const handleSaveNoteManual = async () => {
  if (!editingNote.value) return
  hasUnsavedChanges.value = true
  await saveCurrentNote()
}

// ===== 文件操作 =====
const handleDeleteFile = async (file) => {
  try {
    await deleteFile({ file_id: file.id })
    ElMessage.success('文件删除成功')
    await fetchAllUserFiles()
  } catch (error) {
    console.error('删除文件失败:', error)
    ElMessage.error('删除文件失败')
  }
}

const handleFileUploaded = async () => {
  // 文件上传完成后刷新文件列表
  await fetchAllUserFiles()
}

// ===== OCR 识别上传 =====
const handleOCRUpload = async (file) => {
  try {
    loading.value = true
    ElMessage.info('正在上传文件进行OCR识别...')
    const result = await recognizeOCR(file)
    ElMessage.success('OCR任务已提交，正在后台识别...')

    // 开始轮询状态
    pollOCRStatus(result.file_id, { interval: 1500, maxAttempts: 120 })
      .then(async (statusData) => {
        ElMessage.success(`OCR识别完成，笔记已生成`)
        await fetchAllNotes()
        await fetchAllFolders()
        if (statusData.folder_id !== undefined && statusData.folder_id !== null) {
          await refreshFolderData(statusData.folder_id)
          refreshTreeNode(statusData.folder_id)
        }
        if (statusData.note_id) {
          // 自动打开生成的笔记
          const note = allNotes.value.find(n => n.id === statusData.note_id)
          if (note) {
            openNoteEditor(note)
          } else {
            // 如果本地列表还未刷新到该笔记，直接获取详情
            try {
              const detail = await getNoteDetail({ note_id: statusData.note_id })
              if (detail) {
                openNoteEditor({ ...detail, id: detail.id || detail.note_id, folder_id: detail.folder_id || detail.folderId })
                await fetchAllNotes()
                await fetchAllFolders()
                const fid = detail.folder_id || detail.folderId
                if (fid !== undefined && fid !== null) {
                  await refreshFolderData(fid)
                  refreshTreeNode(fid)
                }
              }
            } catch (e) {
              console.error('获取生成笔记详情失败:', e)
            }
          }
        }
      })
      .catch((error) => {
        console.error('OCR处理失败:', error)
        ElMessage.error(error.message || 'OCR识别失败')
      })
      .finally(() => {
        loading.value = false
      })
  } catch (error) {
    loading.value = false
    console.error('OCR上传失败:', error)
    ElMessage.error(error.message || 'OCR上传失败')
  }
}

// ===== 用户操作 =====
const handleUserCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  }
}

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

// ===== 工具函数 =====
const getFolderName = (folderId) => {
  if (!folderId) return ''
  const folder = allFolders.value.find(f => f.id === folderId)
  return folder?.name || ''
}
</script>

<style scoped>
/* ===== 根容器：铺满整个视口 ===== */
.home-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: var(--bg-primary);
  overflow: hidden;
}

/* ===== ElSplitter：铺满父容器 ===== */
.main-splitter {
  width: 100%;
  height: 100%;
  flex: 1;
}

/* ===== ElSplitter Panel：确保内容区填满 ===== */
.main-splitter :deep(.el-splitter__panel) {
  overflow: hidden;
  height: 100%;
}



/* ===== ElSplitter 拖拽条样式 ===== */
.main-splitter :deep(.el-splitter__bar) {
  background-color: var(--border-primary);
}

.main-splitter :deep(.el-splitter__bar:hover) {
  background-color: var(--accent-primary);
}

/* ===== 中间内容区容器 ===== */
.main-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  overflow: hidden;
}
</style>
