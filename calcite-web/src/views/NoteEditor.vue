<template>
  <div class="editor-container" @wheel="handleWheel">
    <!-- 左侧栏 - 文件列表 -->
    <div class="sidebar left-sidebar" :class="{ collapsed: leftCollapsed }">
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="leftCollapsed = !leftCollapsed">
        <el-icon v-if="!leftCollapsed"><DArrowLeft /></el-icon>
        <el-icon v-else><DArrowRight /></el-icon>
      </div>

      <!-- 左侧内容 -->
      <div v-show="!leftCollapsed" class="sidebar-content">
        <!-- 顶部文件夹信息 -->
        <div class="sidebar-header">
          <el-button
            type="text"
            @click="handleBack"
            :icon="ArrowLeft"
            class="back-btn"
          >
            返回列表
          </el-button>
        </div>

        <div class="folder-info">
          <el-icon class="folder-icon"><Folder /></el-icon>
          <span class="folder-name">{{ currentFolderName || '未分类' }}</span>
        </div>

        <div class="divider"></div>

        <!-- 笔记列表 -->
        <div class="note-list">
          <div
            v-for="note in folderNotes"
            :key="note.id"
            class="note-item"
            :class="{ active: currentNoteId === note.id }"
            @click="handleSelectNote(note)"
          >
            <div class="note-item-title">{{ note.title || '无标题' }}</div>
            <div class="note-item-time">{{ formatTime(note.updatedAt) }}</div>
          </div>

          <div v-if="folderNotes.length === 0 && !loading" class="empty-notes">
            暂无笔记
          </div>

          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
        </div>
      </div>
    </div>

    <!-- 中间编辑区 -->
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
          <span v-if="currentFolderName">
            所属文件夹: {{ currentFolderName }}
          </span>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-editor">
        <el-empty description="请选择或创建一个笔记" />
      </div>
    </div>

    <!-- 右侧栏 - 标签列表 -->
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
            :icon="Plus"
            @click="handleCreateTag"
          >
            添加标签
          </el-button>
        </div>

        <div class="divider"></div>

        <!-- 当前笔记的标签 -->
        <div v-if="currentNoteId" class="tag-list">
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

    <!-- 创建/编辑标签对话框 -->
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
  Search,
  User,
  Delete,
  ArrowLeft,
  Folder,
  DArrowLeft,
  DArrowRight,
  Plus,
  MoreFilled
} from '@element-plus/icons-vue'
import { getNoteList, createNote, updateNote, deleteNote, searchNotes, getNoteDetail } from '../api/note'
import { getTagList, bindTag, createTag, updateTag, deleteTag as deleteTagApi } from '../api/tag'
import { getFolderList } from '../api/folder'
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
const folderNotes = ref([])
const currentNote = ref(null)
const currentFolderId = ref(null)
const saveStatus = ref('已保存')
const saveTimer = ref(null)
const hasUnsavedChanges = ref(false)
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)

// 标签相关
const allTags = ref([])
const noteTags = ref([])
const tagDialogVisible = ref(false)
const editingTag = ref(null)
const tagForm = ref({
  name: ''
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

// 用户信息
const userInfo = ref(null)
const editUserDialogVisible = ref(false)
const userForm = ref({
  username: '',
  email: ''
})

// 计算属性
const currentFolderName = computed(() => {
  if (!currentFolderId.value) return '未分类'
  const folder = folders.value.find(f => f.id === currentFolderId.value)
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

// 获取文件夹列表
const fetchFolders = async () => {
  try {
    const data = await getFolderList({ folder_id: 0 })
    folders.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取文件夹列表失败:', error)
    folders.value = []
  }
}

// 获取笔记列表
const fetchNotes = async () => {
  loading.value = true
  try {
    const data = await getNoteList()
    notes.value = Array.isArray(data) ? data : (data?.list || [])

    // 筛选当前文件夹的笔记
    if (currentFolderId.value) {
      folderNotes.value = notes.value.filter(n => n.folderId === currentFolderId.value)
    } else {
      folderNotes.value = notes.value
    }
  } catch (error) {
    console.error('获取笔记列表失败:', error)
    notes.value = []
    folderNotes.value = []
  } finally {
    loading.value = false
  }
}

// 获取当前笔记详情
const fetchNoteDetail = async () => {
  if (!currentNoteId.value) return

  loading.value = true
  try {
    const data = await getNoteDetail({ note_id: currentNoteId.value })
    currentNote.value = data
    currentFolderId.value = data.folderId || null
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'

    // 更新文件夹笔记列表
    if (currentFolderId.value) {
      folderNotes.value = notes.value.filter(n => n.folderId === currentFolderId.value)
    }

    // 获取当前笔记的标签
    await fetchNoteTags()
  } catch (error) {
    console.error('获取笔记详情失败:', error)
    ElMessage.error('获取笔记详情失败')
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
  if (!currentNoteId.value) return

  try {
    const data = await getTagList({ note_id: currentNoteId.value })
    noteTags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取笔记标签失败:', error)
    noteTags.value = []
  }
}

// 判断标签是否已绑定
const isTagBound = (tagId) => {
  return noteTags.value.some(t => t.id === tagId)
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
      // 更新标签
      await updateTag({
        tag_id: editingTag.value.id,
        name: tagForm.value.name
      })
      ElMessage.success('标签修改成功')
    } else {
      // 创建标签
      await createTag({ name: tagForm.value.name })
      ElMessage.success('标签创建成功')
    }
    tagDialogVisible.value = false
    fetchAllTags()
    if (currentNoteId.value) {
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
          note_id: currentNoteId.value,
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
        if (currentNoteId.value) {
          await fetchNoteTags()
        }
      } catch (error) {
        console.error('删除标签失败:', error)
      }
    }).catch(() => {})
  }
}

// 点击标签进行绑定/解绑
const handleTagClick = async (tag) => {
  if (!currentNoteId.value) return

  try {
    if (isTagBound(tag.id)) {
      // 解绑
      const boundTagIds = noteTags.value
        .filter(t => t.id !== tag.id)
        .map(t => t.id)
      await bindTag({
        note_id: currentNoteId.value,
        tag_ids: boundTagIds
      })
    } else {
      // 绑定
      const boundTagIds = [...noteTags.value.map(t => t.id), tag.id]
      await bindTag({
        note_id: currentNoteId.value,
        tag_ids: boundTagIds
      })
    }
    await fetchNoteTags()
  } catch (error) {
    console.error('标签绑定操作失败:', error)
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
    router.push('/home')
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
        router.push('/home')
      })
    }).catch(() => {
      hasUnsavedChanges.value = false
      router.push('/home')
    })
  } else {
    router.push('/home')
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

onMounted(() => {
  window.addEventListener('wheel', handleWheel)
  fetchUserInfo()
  fetchFolders()
  fetchNotes()
  fetchAllTags()
  fetchNoteDetail()
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

/* 顶部区域 */
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

.back-btn {
  color: #d3c6aa;
}

.back-btn:hover {
  color: #7fbbb3;
}

/* 文件夹信息 */
.folder-info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #a7c080;
  font-size: 14px;
}

.folder-icon {
  margin-right: 8px;
  font-size: 18px;
}

.folder-name {
  flex: 1;
  font-weight: 500;
}

/* 分隔线 */
.divider {
  height: 1px;
  background-color: #7a8478;
  margin: 0 16px;
}

/* 笔记列表 */
.note-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
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

/* 编辑区 */
.editor-main {
  flex: 1;
  display: flex;
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

  .sidebar-header {
    border-bottom-color: #a7c080;
  }

  .sidebar-header h3 {
    color: #5c6a72;
  }

  .back-btn {
    color: #5c6a72;
  }

  .back-btn:hover {
    color: #7fbbb3;
  }

  .folder-info {
    color: #7fbbb3;
  }

  .divider {
    background-color: #a7c080;
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

  .empty-notes {
    color: #9da9a0;
  }

  .section-title {
    color: #9da9a0;
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

  .editor-main {
    background-color: #fdf6e3;
  }

  .editor-header {
    background-color: #f3e7c8;
    border-bottom-color: #a7c080;
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
