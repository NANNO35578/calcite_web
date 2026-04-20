<template>
  <div class="home-container" @wheel="handleWheel">
    <!-- 使用 ElSplitter 实现三栏拖拽布局，默认比例 1:2:1 (25% : 50% : 25%) -->
    <el-splitter class="main-splitter">
      <!-- 左侧栏 - 文件浏览器 -->
      <el-splitter-panel :size="layoutStore.leftCollapsed ? '0px' : '20%'" :min="0" :resizable="!layoutStore.leftCollapsed">
        <LeftSidebar
          ref="leftSidebarRef"
          :selected-folder-id="folderStore.selectedFolderId"
          :selected-note-id="noteStore.selectedNoteId"
          :expanded-folders="folderStore.expandedFolders"
          @create-note="handleCreateNote"
          @create-folder="handleCreateFolder"
          @folder-click="handleFolderClick"
          @folder-expand="folderStore.expandFolder"
          @folder-collapse="folderStore.collapseFolder"
          @note-click="handleNoteClick"
          @folder-create="handleFolderCreate"
          @folder-rename="handleRenameFolder"
          @folder-delete="handleDeleteFolder"
          @user-command="handleUserCommand"
          @ocr-upload="handleOCRUpload"
          @folders-loaded="folderStore.handleFoldersLoaded"
          @notes-loaded="noteStore.handleNotesLoaded"
        />
      </el-splitter-panel>

      <!-- 中间内容区 (自适应剩余宽度) -->
      <el-splitter-panel size="60%" :min="300">
        <div class="main-content">
          <!-- 顶部工具栏：控制左右侧栏、搜索 -->
          <CenterToolbar />

          <!-- 搜索结果视图 -->
          <SearchResults
            v-if="noteStore.searchKeyword && !noteStore.editingNote && !noteStore.previewingNote"
            @note-click="handleNoteClick"
            @public-note-click="handlePublicNoteClick"
          />

          <!-- 笔记列表视图 -->
          <NoteListView
            v-else-if="!noteStore.editingNote && !noteStore.previewingNote"
            @note-click="handleListNoteClick"
          />

          <!-- 公开笔记预览视图 -->
          <PublicNotePreview
            v-else-if="noteStore.previewingNote"
            @back="handleClosePreview"
          />

          <!-- 笔记编辑视图 -->
          <NoteEditor
            v-else
            @back="handleCloseEditor"
            @save="handleSaveNoteManual"
            @file-uploaded="fileStore.fetchAllUserFiles"
          />
        </div>
      </el-splitter-panel>

      <!-- 右侧栏 - 标签和文件管理 -->
      <el-splitter-panel :size="layoutStore.rightCollapsed ? '0px' : '20%'" :min="0" :resizable="!layoutStore.rightCollapsed">
        <RightSidebar
          @delete-note="handleDeleteNote"
        />
      </el-splitter-panel>
    </el-splitter>

    <!-- 文件夹对话框 -->
    <FolderDialog
      v-model:visible="dialogStore.folderDialogVisible"
      :is-editing="!!dialogStore.editingFolder"
      :form="dialogStore.folderForm"
      :all-folders="folderStore.allFolders"
      @confirm="handleSaveFolder"
    />

    <!-- 笔记对话框 -->
    <NoteDialog
      v-model:visible="dialogStore.noteDialogVisible"
      :form="dialogStore.noteForm"
      :all-folders="folderStore.allFolders"
      @confirm="handleSaveNote"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  useUserStore,
  useLayoutStore,
  useFolderStore,
  useNoteStore,
  useFileStore,
  useDialogStore
} from '../stores'
import { logout } from '../api/auth'
import { recognizeOCR, pollOCRStatus } from '../api/ocr'
import { getNoteDetail } from '../api/note'

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
const userStore = useUserStore()
const layoutStore = useLayoutStore()
const folderStore = useFolderStore()
const noteStore = useNoteStore()
const fileStore = useFileStore()
const dialogStore = useDialogStore()

const leftSidebarRef = ref(null)

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

  // Ctrl+S：保存笔记
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    if (noteStore.editingNote) {
      handleSaveNoteManual()
    }
  }

  // Esc：返回
  if (e.key === 'Escape') {
    if (noteStore.previewingNote) {
      handleClosePreview()
    } else if (noteStore.editingNote) {
      handleCloseEditor()
    }
  }
}

const handleKeyUp = (e) => {
  if (!e.ctrlKey) {
    isCtrlPressed.value = false
  }
}

const handleResize = () => {
  layoutStore.updateWindowWidth(window.innerWidth)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('resize', handleResize)
  handleResize()
  userStore.fetchUserInfo()
  fileStore.fetchAllUserFiles()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', handleResize)
})

// ===== 列表笔记点击（根据当前模式决定行为） =====
const handleListNoteClick = (note) => {
  if (noteStore.recommending) {
    handlePublicNoteClick(note)
  } else {
    handleNoteClick(note)
  }
}

// ===== 文件夹操作 =====
const handleFolderClick = (folder) => {
  noteStore.recommending = false
  noteStore.searchKeyword = ''
  folderStore.selectFolder(folder)
  noteStore.editingNote = null
  noteStore.previewingNote = null
  noteStore.selectedNoteId = null
}

const handleFolderCreate = (folder) => {
  dialogStore.openFolderDialog(null, folder.id)
}

const handleRenameFolder = (folder) => {
  dialogStore.openFolderDialog(folder)
}

const handleDeleteFolder = (folder) => {
  ElMessageBox.confirm(
    '确定要删除该文件夹吗？文件夹中的笔记将一起被删除。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      await folderStore.deleteFolderAction({
        folder_id: folder.id,
        parent_id: folder.parent_id
      })
    })
    .catch(() => {})
}

const handleSaveFolder = async () => {
  if (!dialogStore.folderForm.name.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }

  try {
    if (dialogStore.editingFolder) {
      await folderStore.updateFolderAction({
        folder_id: dialogStore.editingFolder.id,
        name: dialogStore.folderForm.name
      })
    } else {
      await folderStore.createFolderAction({
        name: dialogStore.folderForm.name,
        parent_id: Number(dialogStore.folderForm.parentId) || 0
      })
    }
    dialogStore.closeFolderDialog()
    const parentId = dialogStore.editingFolder
      ? dialogStore.editingFolder.parent_id
      : Number(dialogStore.folderForm.parentId) || 0
    await folderStore.refreshFolderData(parentId)
    leftSidebarRef.value?.fileTreeRef?.refreshNode?.(parentId)
  } catch (error) {
    console.error('保存文件夹失败:', error)
  }
}

// ===== 笔记操作 =====
const handleNoteClick = async (note) => {
  noteStore.selectNote(note.id)

  const currentUserId = userStore.userInfo?.user_id
  if (note.author_id !== undefined && note.author_id !== currentUserId) {
    if (noteStore.hasUnsavedChanges) {
      ElMessageBox.confirm('当前笔记有未保存的更改，是否保存？', '提示', {
        confirmButtonText: '保存',
        cancelButtonText: '放弃',
        type: 'warning'
      })
        .then(() => {
          noteStore.saveCurrentNote().then(() => {
            handlePublicNoteClick(note)
          })
        })
        .catch(() => {
          noteStore.hasUnsavedChanges = false
          handlePublicNoteClick(note)
        })
    } else {
      await handlePublicNoteClick(note)
    }
    return
  }

  if (noteStore.hasUnsavedChanges) {
    ElMessageBox.confirm('当前笔记有未保存的更改，是否保存？', '提示', {
      confirmButtonText: '保存',
      cancelButtonText: '放弃',
      type: 'warning'
    })
      .then(() => {
        noteStore.saveCurrentNote().then(() => {
          noteStore.openEditor(note)
        })
      })
      .catch(() => {
        noteStore.hasUnsavedChanges = false
        noteStore.openEditor(note)
      })
  } else {
    await noteStore.openEditor(note)
  }

  // 展开父文件夹
  if (note.folder_id) {
    const folder = folderStore.allFolders.find((f) => f.id === note.folder_id)
    if (folder) {
      folderStore.expandParentFolders(folder.parent_id)
    }
  }
}

const handlePublicNoteClick = async (note) => {
  await noteStore.openPreview(note)
}

const handleClosePreview = () => {
  noteStore.closePreview()
}

const handleCloseEditor = () => {
  if (noteStore.hasUnsavedChanges) {
    ElMessageBox.confirm('当前笔记有未保存的更改，是否保存？', '提示', {
      confirmButtonText: '保存',
      cancelButtonText: '放弃',
      type: 'warning'
    })
      .then(() => {
        noteStore.saveCurrentNote().then(() => {
          noteStore.closeEditor()
        })
      })
      .catch(() => {
        noteStore.hasUnsavedChanges = false
        noteStore.closeEditor()
      })
  } else {
    noteStore.closeEditor()
  }
}

const handleSaveNoteManual = async () => {
  if (!noteStore.editingNote) return
  try {
    const result = await noteStore.saveCurrentNote()
    if (result?.folderId != null) {
      await folderStore.refreshFolderData(result.folderId)
      leftSidebarRef.value?.fileTreeRef?.refreshNode?.(result.folderId)
    }
  } catch (e) {
    // 错误已在 store 中处理
  }
}

const handleDeleteNote = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该笔记吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = await noteStore.deleteCurrentNote()
    if (result?.folderId != null) {
      await folderStore.refreshFolderData(result.folderId)
      leftSidebarRef.value?.fileTreeRef?.refreshNode?.(result.folderId)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除笔记失败:', error)
    }
  }
}

// ===== 笔记对话框操作 =====
const handleCreateNote = (params) => {
  noteStore.recommending = false
  const effectiveFolderId =
    params?.folder_id !== undefined
      ? params.folder_id
      : (folderStore.selectedFolderId ?? null)
  dialogStore.openNoteDialog(effectiveFolderId)
}

const handleSaveNote = async () => {
  if (!dialogStore.noteForm.title.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }

  try {
    await noteStore.createNewNote({
      title: dialogStore.noteForm.title,
      folderId: dialogStore.noteForm.folderId
    })
    dialogStore.closeNoteDialog()
    const folderId = noteStore.editingNote?.folder_id
    if (folderId != null) {
      await folderStore.refreshFolderData(folderId)
      leftSidebarRef.value?.fileTreeRef?.refreshNode?.(folderId)
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

// ===== OCR 识别上传 =====
const handleOCRUpload = async (file) => {
  try {
    noteStore.loading = true
    ElMessage.info('正在上传文件进行OCR识别...')
    const result = await recognizeOCR(file)
    ElMessage.success('OCR任务已提交，正在后台识别...')

    // 开始轮询状态
    pollOCRStatus(result.file_id, { interval: 1500, maxAttempts: 120 })
      .then(async (statusData) => {
        ElMessage.success('OCR识别完成，笔记已生成')
        await noteStore.fetchRootNotes()
        await folderStore.fetchRootFolders()
        if (statusData.folder_id != null) {
          await folderStore.refreshFolderData(statusData.folder_id)
          leftSidebarRef.value?.fileTreeRef?.refreshNode?.(statusData.folder_id)
        }
        if (statusData.note_id) {
          // 自动打开生成的笔记
          const note = noteStore.allNotes.find((n) => n.id === statusData.note_id)
          if (note) {
            await noteStore.openEditor(note)
          } else {
            // 如果本地列表还未刷新到该笔记，直接获取详情
            try {
              const detail = await getNoteDetail({ note_id: statusData.note_id })
              if (detail) {
                await noteStore.openEditor({
                  ...detail,
                  id: detail.id || detail.note_id,
                  folder_id: detail.folder_id || detail.folderId
                })
                await noteStore.fetchRootNotes()
                await folderStore.fetchRootFolders()
                const fid = detail.folder_id || detail.folderId
                if (fid != null) {
                  await folderStore.refreshFolderData(fid)
                  leftSidebarRef.value?.fileTreeRef?.refreshNode?.(fid)
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
        noteStore.loading = false
      })
  } catch (error) {
    noteStore.loading = false
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
    userStore.clearUserInfo()

    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
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
