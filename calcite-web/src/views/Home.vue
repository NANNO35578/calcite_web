<template>
  <div class="home-container" @wheel="handleWheel">
    <!-- 使用 ElSplitter 实现三栏拖拽布局，默认比例 1:2:1 (25% : 50% : 25%) -->
    <el-splitter class="main-splitter">
      <!-- 左侧栏 - 文件浏览器 -->
      <el-splitter-panel :size="leftCollapsed ? '0px' : '20%'" :min="0" :resizable="!leftCollapsed">
        <LeftSidebar
          :all-folders="allFolders"
          :folders="rootFolders"
          :all-notes="allNotes"
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
        />
      </el-splitter-panel>

      <!-- 中间内容区 (自适应剩余宽度) -->
      <el-splitter-panel size="60%" :min="300">
        <div class="main-content">
          <!-- 顶部工具栏：控制左右侧栏、搜索 -->
          <CenterToolbar
            v-model:search-keyword="searchKeyword"
            @toggle-left="leftCollapsed = !leftCollapsed"
            @toggle-right="rightCollapsed = !rightCollapsed"
            @search-input="handleSearch"
            @search-prev="handleSearchPrev"
            @search-next="handleSearchNext"
          />

          <!-- 搜索结果视图 -->
          <SearchResults
            v-if="searchKeyword && !editingNote"
            :results="searchResults"
            :total="searchTotal"
            :from="searchFrom"
            :page-size="searchPageSize"
            :loading="searching"
            :selected-note-id="selectedNoteId"
            @note-click="handleNoteClick"
            @prev="handleSearchPrev"
            @next="handleSearchNext"
          />

          <!-- 笔记列表视图 -->
          <NoteListView
            v-else-if="!editingNote"
            :title="contentTitle"
            :notes="displayNotes"
            :loading="loading"
            :selected-note-id="selectedNoteId"
            @note-click="handleNoteClick"
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
            @delete="handleDeleteNote"
            @file-uploaded="handleFileUploaded"
          />
        </div>
      </el-splitter-panel>

      <!-- 右侧栏 - 标签和文件管理 -->
      <el-splitter-panel :size="rightCollapsed ? '0px' : '20%'" :min="0" :resizable="!rightCollapsed">
        <RightSidebar
          :all-tags="allTags"
          :note-tags="noteTags"
          :editing-note="editingNote"
          :all-files="allFiles"
          :files-loading="filesLoading"
          :tags-loading="tagsLoading"
          @create-tag="handleCreateTagInline"
          @tag-click="handleTagClick"
          @tag-delete="handleTagDelete"
          @tag-edit="handleTagEdit"
          @tag-delete-all="handleTagDeleteAll"
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

    <!-- 标签对话框 -->
    <TagDialog
      v-model:visible="tagDialogVisible"
      :is-editing="!!editingTag"
      :form="tagForm"
      @confirm="handleSaveTag"
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
  Menu,
  CollectionTag
} from '@element-plus/icons-vue'
import { getNoteList, createNote, updateNote, deleteNote, searchNotes, getNoteDetail } from '../api/note'
import { createFolder, getFolderList, updateFolder, deleteFolder as deleteFolderApi } from '../api/folder'
import { getUserProfile } from '../api/user'
import { logout } from '../api/auth'
import { getTagList, bindTag, createTag, updateTag } from '../api/tag'
import { getFileList, deleteFile } from '../api/file'

// 导入拆分后的组件
import LeftSidebar from '../components/sidebar/LeftSidebar.vue'
import RightSidebar from '../components/sidebar/RightSidebar.vue'
import SearchResults from '../components/sidebar/SearchResults.vue'
import CenterToolbar from '../components/center/CenterToolbar.vue'
import NoteListView from '../components/center/NoteListView.vue'
import NoteEditor from '../components/center/NoteEditor.vue'
import FolderDialog from '../components/dialogs/FolderDialog.vue'
import NoteDialog from '../components/dialogs/NoteDialog.vue'
import TagDialog from '../components/dialogs/TagDialog.vue'

const router = useRouter()

// ===== 状态管理 =====
const loading = ref(false)
const searching = ref(false)
const allNotes = ref([])
const allFolders = ref([])
const selectedFolderId = ref(null)
const selectedNoteId = ref(null)
const searchKeyword = ref('')
const searchResults = ref([])
const searchTotal = ref(0)
const searchFrom = ref(0)
const searchPageSize = ref(20)

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

// ===== 标签相关 =====
const allTags = ref([])
const noteTags = ref([])
const tagsLoading = ref(false)
const tagDialogVisible = ref(false)
const editingTag = ref(null)
const tagForm = ref({ name: '' })

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
  fetchAllFolders()
  fetchAllNotes()
  fetchAllTags()
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

// ===== 获取所有文件夹 =====
const fetchAllFolders = async () => {
  try {
    const rootData = await getFolderList({ folder_id: 0 })
    const rootList = rootData || []
    const allFoldersList = [...rootList]

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

// ===== 获取所有笔记 =====
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

// ===== 获取所有标签 =====
const fetchAllTags = async () => {
  tagsLoading.value = true
  try {
    const data = await getTagList()
    allTags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取标签列表失败:', error)
    allTags.value = []
  } finally {
    tagsLoading.value = false
  }
}

// ===== 获取当前笔记的标签 =====
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

const handleSearch = () => {
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

// ===== 文件夹操作 =====
const handleFolderClick = (folder) => {
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

const openNoteEditor = async (note) => {
  loading.value = true
  try {
    const data = await getNoteDetail({ note_id: note.id })
    editingNote.value = {
      ...data,
      id: data.id || data.note_id,  // 确保 id 字段存在
      folder_id: data.folder_id || data.folderId
    }
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'
    
    // 获取标签列表
    await fetchNoteTags()

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
      folder_id: editingNote.value.folder_id
    })
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'
    await fetchAllNotes()
    await fetchAllFolders()
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
  } catch (error) {
    console.error('保存文件夹失败:', error)
  }
}

// ===== 笔记对话框操作 =====
const handleCreateNote = (params) => {
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
      content: '',
      folder_id: noteForm.value.folderId
    })
    noteDialogVisible.value = false
    ElMessage.success('笔记创建成功')

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

// ===== 标签操作 =====
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

// 行内创建标签
const handleCreateTagInline = async (name) => {
  try {
    await createTag({ name })
    ElMessage.success('标签创建成功')
    fetchAllTags()
    if (editingNote.value) {
      await fetchNoteTags()
    }
  } catch (error) {
    console.error('创建标签失败:', error)
  }
}

// 标签删除/解绑
const handleTagDelete = async (tag) => {
  ElMessageBox.confirm('确定要解除该标签与当前笔记的绑定吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
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
  }).catch(() => { })
}

const handleTagEdit = async ({ tag, newName }) => {
  try {
    await updateTag({ tag_id: tag.id, name: newName })
    ElMessage.success('标签修改成功')
    fetchAllTags()
    if (editingNote.value) {
      await fetchNoteTags()
    }
  } catch (error) {
    console.error('修改标签失败:', error)
  }
}

const handleTagDeleteAll = async (tag) => {
  ElMessageBox.confirm(`确定要删除标签 "${tag.name}" 吗？删除后所有关联的笔记将失去该标签。`, '提示', {
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
  }).catch(() => { })
}

const isTagBound = (tagId) => {
  return noteTags.value.some(t => t.id === tagId)
}

const handleTagClick = async (tag) => {
  if (!editingNote.value) return

  try {
    if (isTagBound(tag.id)) {
      const boundTagIds = noteTags.value
        .filter(t => t.id !== tag.id)
        .map(t => t.id)
      await bindTag({
        note_id: editingNote.value.id,
        tag_ids: boundTagIds
      })
    } else {
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
