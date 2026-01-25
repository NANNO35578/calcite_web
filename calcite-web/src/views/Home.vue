<template>
  <div class="home-container" @wheel="handleWheel">
    <!-- 左侧栏 - 顶部固定 -->
    <div class="sidebar">
      <!-- 顶部按钮区 -->
      <div class="sidebar-top">
        <!-- 新建文件夹按钮 -->
        <el-button
          type="primary"
          class="new-folder-btn"
          @click="handleCreateFolder"
          :icon="FolderAdd"
        >新建文件夹
        </el-button>

        <!-- 新建笔记按钮 -->
        <el-button
          type="success"
          class="new-note-btn"
          @click="handleCreateNote"
          :icon="DocumentAdd"
        >新建笔记
        </el-button>

        <!-- 搜索框 -->
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
      <div class="folder-container">
        <!-- 文件夹列表 -->
        <div class="folder-list">
          <div
            v-for="folder in folders"
            :key="folder.id"
            class="folder-item"
            :class="{ active: selectedFolderId === folder.id }"
            @click="selectFolder(folder.id)"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span class="folder-name">{{ folder.name }}</span>
            <el-dropdown @command="(cmd) => handleFolderAction(cmd, folder)">
              <el-icon class="more-icon"><More /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">重命名</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-if="folders.length === 0" class="empty-folders">
            暂无文件夹
          </div>
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
              <el-dropdown-item command="edit">修改个人信息</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="main-content">
      <div class="content-header">
        <h2>{{ selectedFolderName || '全部笔记' }}</h2>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="!selectedNoteId"
          @click="handleDeleteNote"
        >
          删除选中
        </el-button>
      </div>

      <div class="note-list">
        <el-card
          v-for="note in notes"
          :key="note.id"
          class="note-card"
          :class="{ selected: selectedNoteId === note.id }"
          @click="handleSelectNote(note)"
        >
          <div class="note-header">
            <h3 class="note-title">{{ note.title || '无标题' }}</h3>
            <span class="note-time">{{ formatTime(note.updatedAt) }}</span>
          </div>
          <div class="note-folder">
            <el-icon><Folder /></el-icon>
            <span>{{ note.folderName || '未分类' }}</span>
          </div>
          <div class="note-summary">{{ note.summary || '暂无摘要' }}</div>
        </el-card>

        <div v-if="notes.length === 0 && !loading" class="empty-notes">
          <el-empty description="暂无笔记，点击上方按钮创建新笔记" />
        </div>

        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
      </div>
    </div>

    <!-- 创建文件夹对话框 -->
    <el-dialog
      v-model="folderDialogVisible"
      :title="editingFolder ? '编辑文件夹' : '新建文件夹'"
      width="400px"
    >
      <el-form :model="folderForm" label-width="80px">
        <el-form-item label="文件夹名">
          <el-input v-model="folderForm.name" placeholder="请输入文件夹名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="folderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveFolder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新建笔记对话框 -->
    <el-dialog v-model="noteDialogVisible" title="新建笔记" width="500px">
      <el-form :model="noteForm" label-width="100px">
        <el-form-item label="笔记标题">
          <el-input v-model="noteForm.title" placeholder="请输入笔记标题" />
        </el-form-item>
        <el-form-item label="所属文件夹">
          <el-select v-model="noteForm.folderId" placeholder="选择文件夹">
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
        <el-button @click="noteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveNote">确定</el-button>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderAdd,
  DocumentAdd,
  Search,
  Folder,
  More,
  User,
  Delete
} from '@element-plus/icons-vue'
import { getNoteList, createNote, deleteNote, searchNotes } from '../api/note'
import { getUserProfile } from '../api/user'
import { logout } from '../api/auth'

const router = useRouter()

// 状态管理
const loading = ref(false)
const notes = ref([])
const folders = ref([])
const selectedFolderId = ref(null)
const selectedNoteId = ref(null)
const searchKeyword = ref('')

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

// 计算属性
const selectedFolderName = computed(() => {
  if (searchKeyword.value) return '搜索结果'
  if (!selectedFolderId.value) return '全部笔记'
  const folder = folders.value.find(f => f.id === selectedFolderId.value)
  return folder?.name || ''
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
    const params = {}
    if (selectedFolderId.value) {
      params.folder_id = selectedFolderId.value
    }
    const data = await getNoteList(params)
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

// 选择文件夹
const selectFolder = (folderId) => {
  selectedFolderId.value = folderId
  searchKeyword.value = ''
  fetchNotes()
}

// 选择笔记
const handleSelectNote = (note) => {
  selectedNoteId.value = note.id
  router.push(`/note/${note.id}`)
}

// 创建文件夹
const handleCreateFolder = () => {
  editingFolder.value = null
  folderForm.value = { name: '' }
  folderDialogVisible.value = true
}

// 保存文件夹
const handleSaveFolder = async () => {
  if (!folderForm.value.name.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }

  // 模拟文件夹创建（如果后端没有文件夹API，使用本地存储）
  const newFolder = {
    id: Date.now(),
    name: folderForm.value.name
  }
  folders.value.push(newFolder)
  saveFoldersToStorage()

  folderDialogVisible.value = false
  ElMessage.success(editingFolder.value ? '文件夹修改成功' : '文件夹创建成功')
}

// 文件夹操作
const handleFolderAction = (command, folder) => {
  if (command === 'rename') {
    editingFolder.value = folder
    folderForm.value = { name: folder.name }
    folderDialogVisible.value = true
  } else if (command === 'delete') {
    ElMessageBox.confirm('确定要删除该文件夹吗？文件夹中的笔记将变为未分类。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      folders.value = folders.value.filter(f => f.id !== folder.id)
      if (selectedFolderId.value === folder.id) {
        selectedFolderId.value = null
        fetchNotes()
      }
      saveFoldersToStorage()
      ElMessage.success('文件夹删除成功')
    }).catch(() => {})
  }
}

// 创建笔记
const handleCreateNote = () => {
  noteForm.value = {
    title: '',
    folderId: selectedFolderId.value
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
    await createNote({
      title: noteForm.value.title,
      content: '',
      folder_id: noteForm.value.folderId
    })
    noteDialogVisible.value = false
    ElMessage.success('笔记创建成功')
    fetchNotes()
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

// 删除笔记
const handleDeleteNote = async () => {
  if (!selectedNoteId.value) {
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除该笔记吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteNote({ note_id: selectedNoteId.value })
    ElMessage.success('笔记删除成功')
    selectedNoteId.value = null
    fetchNotes()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除笔记失败:', error)
    }
  }
}

const handleUserCommand = (command) => {
  if (command === 'edit') {
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
    // 更新本地用户信息（如果后端有更新API，可以调用）
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

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < week) return `${Math.floor(diff / day)}天前`
  if (diff < month) return `${Math.floor(diff / week)}周前`
  if (diff < year) return `${Math.floor(diff / month)}个月前`
  return `${Math.floor(diff / year)}年前`
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

// 保存文件夹到本地存储
const saveFoldersToStorage = () => {
  localStorage.setItem('folders', JSON.stringify(folders.value))
}

onMounted(() => {
  fetchUserInfo()
  loadFoldersFromStorage()
  fetchNotes()
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

/* 顶部按钮区 - 固定 */
.sidebar-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background-color: #2d353b;
  border-bottom: 1px solid #7a8478;
  z-index: 10;
}

.new-folder-btn,
.new-note-btn {
  width: 100%;
  margin-bottom: 12px;
  margin-left: auto;
}

.new-folder-btn :deep(.el-icon),
.new-note-btn :deep(.el-icon) {
  margin-right: 4px;
}

.search-input {
  margin-bottom: 0;
}

.search-input :deep(.el-input__wrapper) {
  background-color: #414b50;
  border-color: #7a8478;
}

.search-input :deep(.el-input__inner) {
  color: #d3c6aa;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #7fbbb3;
}

/* 中间滚动区 */
.folder-container {
  margin-top: 160px;
  margin-bottom: 80px;
  flex: 1;
  overflow-y: auto;
  /* padding: 0 16px; */
}

.folder-container::-webkit-scrollbar {
  width: 6px;
}

.folder-container::-webkit-scrollbar-thumb {
  background-color: #4a5658;
  border-radius: 3px;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.folder-item:hover {
  background-color: #414b50;
}

.folder-item.active {
  background-color: #3d484d;
  border-left: 3px solid #7fbbb3;
}

.folder-icon {
  margin-right: 8px;
  color: #a7c080;
}

.folder-name {
  flex: 1;
  color: #d3c6aa;
  font-size: 14px;
}

.more-icon {
  opacity: 1;
  transition: opacity 0.6s;
  color: #7a8478;
  padding: 1px;
}

.folder-item:hover .more-icon {
  opacity: 1;
}

.empty-folders {
  text-align: center;
  color: #7a8478;
  padding: 20px;
  font-size: 14px;
}

/* 底部用户信息 - 固定 */
.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #2d353b;
  border-top: 1px solid #7a8478;
  padding: 12px 16px;
  z-index: 10;
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

/* 右侧内容区 */
.main-content {
  flex: 1;
  padding: 24px;
  background-color: #272e33;
  overflow-y: auto;
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: #4a5658;
  border-radius: 4px;
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

.note-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.note-folder {
  display: flex;
  align-items: center;
  color: #a7c080;
  font-size: 12px;
  margin-bottom: 8px;
}

.note-folder .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

.note-summary {
  color: #9da9a0;
  font-size: 13px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
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

:deep(.el-select__placeholder) {
  color: #9da9a0;
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

  .sidebar-top {
    background-color: #f3e7c8;
    border-bottom-color: #a7c080;
  }

  .sidebar-footer {
    background-color: #f3e7c8;
    border-top-color: #a7c080;
  }

  .search-input :deep(.el-input__wrapper) {
    background-color: #e6dcc4;
    border-color: #a7c080;
  }

  .search-input :deep(.el-input__inner) {
    color: #5c6a72;
  }

  .folder-item:hover {
    background-color: #e6dcc4;
  }

  .folder-item.active {
    background-color: #d9d3bc;
    border-left-color: #7fbbb3;
  }

  .folder-icon {
    color: #7fbbb3;
  }

  .folder-name {
    color: #5c6a72;
  }

  .more-icon {
    color: #9da9a0;
  }

  .empty-folders {
    color: #9da9a0;
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

  .main-content {
    background-color: #fdf6e3;
  }

  .content-header {
    border-bottom-color: #a7c080;
  }

  .content-header h2 {
    color: #5c6a72;
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

  .note-folder {
    color: #7fbbb3;
  }

  .note-summary {
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
