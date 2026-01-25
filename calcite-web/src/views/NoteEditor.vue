<template>
  <div class="editor-container" @wheel="handleWheel">
    <!-- 左侧栏 - 笔记列表 -->
    <div class="sidebar">
      <!-- 顶部按钮区 - 固定 -->
      <div class="sidebar-top">
        <el-button
          type="success"
          class="new-note-btn"
          @click="handleCreateNote"
          :icon="DocumentAdd"
        >新建笔记
        </el-button>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索笔记..."
          class="search-input"
          clearable
          :prefix-icon="Search"
          @input="handleSearch"
        />
      </div>

      <!-- 中间滚动区 -->
      <div class="note-list">
        <div
          v-for="note in notes"
          :key="note.id"
          class="note-item"
          :class="{ active: currentNoteId === note.id }"
          @click="handleSelectNote(note)"
        >
          <div class="note-item-title">{{ note.title || '无标题' }}</div>
          <div class="note-item-time">{{ formatTime(note.updatedAt) }}</div>
        </div>

        <div v-if="notes.length === 0 && !loading" class="empty-notes">
          暂无笔记
        </div>

        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
      </div>

      <!-- 底部固定用户信息 -->
      <div class="sidebar-footer">
        <el-dropdown trigger="click" @command="handleUserCommand">
          <div class="user-info">
            <div class="user-avatar">
              <el-icon><User /></el-icon>
            </div>
            <div class="user-details">
              <div class="username">{{ userInfo?.username || '用户' }}</div>
              <div class="user-email">{{ userInfo?.email || '点击编辑' }}</div>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="home">返回首页</el-dropdown-item>
              <el-dropdown-item command="edit">修改个人信息</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 右侧编辑区 -->
    <div class="editor-main">
      <div class="editor-header">
        <el-button
          type="text"
          @click="handleBack"
          :icon="ArrowLeft"
          class="back-btn"
        >
          返回
        </el-button>
        <div class="header-actions">
          <span class="save-status">{{ saveStatus }}</span>
          <el-button
            type="danger"
            :icon="Delete"
            @click="handleDeleteNote"
          >
            删除
          </el-button>
        </div>
      </div>

      <div v-if="currentNote" class="editor-content">
        <el-input
          v-model="currentNote.title"
          placeholder="输入笔记标题..."
          class="title-input"
          @input="handleNoteChange"
        />

        <el-input
          v-model="currentNote.content"
          type="textarea"
          placeholder="开始输入笔记内容..."
          class="content-input"
          :rows="20"
          @input="handleNoteChange"
        />

        <div class="note-info">
          <span>最后更新: {{ formatFullTime(currentNote.updatedAt) }}</span>
          <span v-if="currentNote.folderName">
            所属文件夹: {{ currentNote.folderName }}
          </span>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-editor">
        <el-empty description="请选择或创建一个笔记" />
      </div>
    </div>

    <!-- 新建笔记对话框 -->
    <el-dialog v-model="createNoteDialogVisible" title="新建笔记" width="500px">
      <el-form :model="newNoteForm" label-width="80px">
        <el-form-item label="笔记标题">
          <el-input v-model="newNoteForm.title" placeholder="请输入笔记标题" />
        </el-form-item>
        <el-form-item label="所属文件夹">
          <el-select v-model="newNoteForm.folderId" placeholder="选择文件夹">
            <el-option label="未分类" :value="null" />
            <el-option
              v-for="folder in folders"
              :key="folder.id"
              :label="folder.name"
              :value="folder.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createNoteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveNewNote">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改用户信息对话框 -->
    <el-dialog v-model="editUserDialogVisible" title="修改个人信息" width="400px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUserInfo">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DocumentAdd,
  Search,
  User,
  Delete,
  ArrowLeft
} from '@element-plus/icons-vue'
import { getNoteList, createNote, updateNote, deleteNote, searchNotes, getNoteDetail } from '../api/note'
import { getUserProfile } from '../api/user'
import { logout } from '../api/auth'

const router = useRouter()
const route = useRoute()
const currentNoteId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

// 状态管理
const loading = ref(false)
const notes = ref([])
const folders = ref([])
const currentNote = ref(null)
const searchKeyword = ref('')
const saveStatus = ref('已保存')
const saveTimer = ref(null)
const hasUnsavedChanges = ref(false)

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
})

// 用户信息
const userInfo = ref(null)
const editUserDialogVisible = ref(false)
const userForm = ref({
  username: '',
  email: ''
})

// 新建笔记对话框
const createNoteDialogVisible = ref(false)
const newNoteForm = ref({
  title: '',
  folderId: null
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

// 获取笔记列表
const fetchNotes = async () => {
  loading.value = true
  try {
    const data = await getNoteList()
    notes.value = Array.isArray(data) ? data : (data?.list || [])
  } catch (error) {
    console.error('获取笔记列表失败:', error)
    notes.value = []
  } finally {
    loading.value = false
  }
}

// 搜索笔记
let searchTimer = null
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!searchKeyword.value.trim()) {
    fetchNotes()
    return
  }

  searchTimer = setTimeout(async () => {
    loading.value = true
    try {
      const data = await searchNotes({ keyword: searchKeyword.value })
      notes.value = Array.isArray(data) ? data : (data?.list || [])
    } catch (error) {
      console.error('搜索笔记失败:', error)
      notes.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}

// 获取当前笔记详情
const fetchNoteDetail = async () => {
  if (!currentNoteId.value) return

  loading.value = true
  try {
    const data = await getNoteDetail({ note_id: currentNoteId.value })
    currentNote.value = data
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'
  } catch (error) {
    console.error('获取笔记详情失败:', error)
    ElMessage.error('获取笔记详情失败')
  } finally {
    loading.value = false
  }
}

// 选择笔记
const handleSelectNote = (note) => {
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm('当前笔记有未保存的更改，是否保存？', '提示', {
      confirmButtonText: '保存',
      cancelButtonText: '放弃',
      type: 'warning'
    }).then(() => {
      saveNote().then(() => {
        router.push(`/note/${note.id}`)
      })
    }).catch(() => {
      hasUnsavedChanges.value = false
      router.push(`/note/${note.id}`)
    })
  } else {
    router.push(`/note/${note.id}`)
  }
}

// 笔记内容变化
const handleNoteChange = () => {
  hasUnsavedChanges.value = true
  saveStatus.value = '有未保存的更改...'

  // 重置自动保存定时器
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }

  // 每2秒自动保存
  saveTimer.value = setTimeout(() => {
    saveNote()
  }, 2000)
}

// 保存笔记
const saveNote = async () => {
  if (!currentNote.value || !hasUnsavedChanges.value) {
    return
  }

  saveStatus.value = '保存中...'

  try {
    await updateNote({
      note_id: currentNote.value.id,
      title: currentNote.value.title,
      content: currentNote.value.content,
      folder_id: currentNote.value.folderId
    })
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'

    // 刷新笔记列表和当前笔记
    fetchNotes()
    fetchNoteDetail()
  } catch (error) {
    console.error('保存笔记失败:', error)
    saveStatus.value = '保存失败'
    ElMessage.error('保存笔记失败')
  }
}

// 创建新笔记
const handleCreateNote = () => {
  newNoteForm.value = {
    title: '',
    folderId: null
  }
  createNoteDialogVisible.value = true
}

// 保存新笔记
const handleSaveNewNote = async () => {
  if (!newNoteForm.value.title.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }

  try {
    const data = await createNote({
      title: newNoteForm.value.title,
      content: '',
      folder_id: newNoteForm.value.folderId
    })
    createNoteDialogVisible.value = false
    ElMessage.success('笔记创建成功')
    fetchNotes()
    // 后端返回的 data 可能是 { note_id: x } 或直接是 note_id
    const noteId = data?.note_id || data
    router.push(`/note/${noteId}`)
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

// 删除笔记
const handleDeleteNote = async () => {
  if (!currentNote.value) return

  try {
    await ElMessageBox.confirm('确定要删除该笔记吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteNote({ note_id: currentNote.value.id })
    ElMessage.success('笔记删除成功')
    hasUnsavedChanges.value = false
    router.push('/')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除笔记失败:', error)
    }
  }
}

// 返回
const handleBack = () => {
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm('当前笔记有未保存的更改，是否保存？', '提示', {
      confirmButtonText: '保存',
      cancelButtonText: '放弃',
      type: 'warning'
    }).then(() => {
      saveNote().then(() => {
        router.push('/')
      })
    }).catch(() => {
      hasUnsavedChanges.value = false
      router.push('/')
    })
  } else {
    router.push('/')
  }
}

const handleUserCommand = (command) => {
  if (command === 'home') {
    router.push('/')
  } else if (command === 'edit') {
    userForm.value = {
      username: userInfo.value?.username || '',
      email: userInfo.value?.email || ''
    }
    editUserDialogVisible.value = true
  } else if (command === 'logout') {
    handleLogout()
  }
}

// 保存用户信息
const handleSaveUserInfo = async () => {
  if (!userForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }

  try {
    userInfo.value = {
      ...userInfo.value,
      username: userForm.value.username,
      email: userForm.value.email
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    editUserDialogVisible.value = false
    ElMessage.success('个人信息修改成功')
  } catch (error) {
    console.error('修改个人信息失败:', error)
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

// 从本地存储加载文件夹
const loadFoldersFromStorage = () => {
  const storedFolders = localStorage.getItem('folders')
  if (storedFolders) {
    try {
      folders.value = JSON.parse(storedFolders)
    } catch (e) {
      console.error('解析文件夹数据失败:', e)
    }
  }
}

onMounted(() => {
  window.addEventListener('wheel', handleWheel)
  fetchUserInfo()
  loadFoldersFromStorage()
  fetchNotes()
  fetchNoteDetail()
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleWheel)
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>

<style scoped>
.editor-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background-color: #272e33;
}

.el-container {
  height: 100%;
}

/* 左侧栏 */
.sidebar {
  width: 16%;
  min-width: 280px;
  max-width: 400px;
  background-color: #2d353b;
  border-right: 1px solid #7a8478;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #7a8478;
}

.sidebar-header .el-button {
  margin-bottom: 12px;
}

.new-folder-btn,
.new-note-btn {
  width: 90%;
  margin-bottom: 12px;
  margin: 16px 16px 12px 16px;
}

.search-input {
  width: 90%;
  margin: 0 16px 16px 16px;
}

.search-input :deep(.el-input__wrapper) {
  background-color: #414b50;
  border-color: #7a8478;
}

.search-input :deep(.el-input__inner) {
  color: #d3c6aa;
}

.note-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.note-list::-webkit-scrollbar {
  width: 6px;
}

.note-list::-webkit-scrollbar-thumb {
  background-color: #4a5658;
  border-radius: 3px;
}

.note-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.note-item:hover {
  background-color: #414b50;
}

.note-item.active {
  background-color: #3d484d;
  border-left: 3px solid #7fbbb3;
}

.note-item-title {
  color: #d3c6aa;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-item-time {
  color: #9da9a0;
  font-size: 12px;
}

.empty-notes {
  text-align: center;
  color: #7a8478;
  padding: 20px;
  font-size: 14px;
}

.loading-container {
  padding: 20px;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #7a8478;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #7fbbb3;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.user-avatar .el-icon {
  font-size: 20px;
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

/* 编辑区 */
.editor-main {
  /* display: flex; */
  flex: 1;
  flex-direction: column;
  background-color: #272e33;
  padding: 0;
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

.empty-editor {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
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

:deep(.el-select__wrapper) {
  background-color: #414b50;
}

/* 浅色模式 */
@media (prefers-color-scheme: light) {
  .editor-container {
    background-color: #fdf6e3;
  }

  .sidebar {
    background-color: #f3e7c8;
    border-right-color: #a7c080;
  }

  .sidebar-header {
    border-bottom-color: #a7c080;
  }

  .search-input :deep(.el-input__wrapper) {
    background-color: #e6dcc4;
    border-color: #a7c080;
  }

  .search-input :deep(.el-input__inner) {
    color: #5c6a72;
  }

  .note-item:hover {
    background-color: #e6dcc4;
  }

  .note-item.active {
    background-color: #d9d3bc;
    border-left-color: #7fbbb3;
  }

  .note-item-title {
    color: #5c6a72;
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

  .editor-main {
    background-color: #fdf6e3;
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

  :deep(.el-select__wrapper) {
    background-color: #e6dcc4;
  }
}
</style>
