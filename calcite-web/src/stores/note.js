import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFolderStore } from './folder'
import {
  getNoteList,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  getNoteDetail,
  viewNote,
  getRecommendNotes
} from '../api/note'
import { ElMessage } from 'element-plus'

/**
 * 笔记状态管理
 */
export const useNoteStore = defineStore('note', () => {
  // ===== 基础状态 =====
  const allNotes = ref([])
  const selectedNoteId = ref(null)
  const editingNote = ref(null)
  const previewingNote = ref(null)
  const loading = ref(false)

  // ===== 保存状态 =====
  const saveStatus = ref('已保存')
  const hasUnsavedChanges = ref(false)
  let saveTimer = null

  // ===== 搜索状态 =====
  const searchKeyword = ref('')
  const searchIsPublic = ref(false)
  const searchResults = ref([])
  const searchTotal = ref(0)
  const searchFrom = ref(0)
  const searchPageSize = ref(20)
  const searching = ref(false)
  let searchDebounceTimer = null

  // ===== 推荐状态 =====
  const recommending = ref(false)
  const recommendNotes = ref([])
  const recommendLoading = ref(false)
  const recommendPage = ref(1)
  const recommendPageSize = ref(10)

  // ===== 计算属性 =====
  const displayNotes = computed(() => {
    const folderStore = useFolderStore()
    if (recommending.value) return recommendNotes.value
    if (searchKeyword.value) return searchResults.value
    if (folderStore.selectedFolderId) {
      return allNotes.value.filter(
        (n) => n.folder_id === folderStore.selectedFolderId
      )
    }
    return allNotes.value
  })

  const contentTitle = computed(() => {
    const folderStore = useFolderStore()
    if (recommending.value) return '推荐笔记'
    if (searchKeyword.value) return '搜索结果'
    if (folderStore.selectedFolderId) {
      const folder = folderStore.allFolders.find(
        (f) => f.id === folderStore.selectedFolderId
      )
      return folder?.name || '文件夹'
    }
    return '全部笔记'
  })

  // ===== 基础方法 =====
  const fetchRootNotes = async () => {
    loading.value = true
    try {
      const data = await getNoteList({ folder_id: 0 })
      const rootNotes = Array.isArray(data) ? data : []
      allNotes.value = allNotes.value.filter(
        (n) => n.folder_id !== 0 && n.folder_id != null
      )
      const existingIds = new Set(allNotes.value.map((n) => n.id))
      const newNotes = rootNotes.filter((n) => !existingIds.has(n.id))
      allNotes.value.push(...newNotes)
    } catch (error) {
      console.error('获取根笔记列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleNotesLoaded = ({ notes }) => {
    const existingIds = new Set(allNotes.value.map((n) => n.id))
    const newNotes = notes.filter((n) => !existingIds.has(n.id))
    allNotes.value.push(...newNotes)
  }

  const selectNote = (noteId) => {
    selectedNoteId.value = noteId
  }

  // ===== 编辑器方法 =====
  const openEditor = async (note) => {
    loading.value = true
    try {
      const data = await getNoteDetail({ note_id: note.id })
      editingNote.value = {
        ...data,
        id: data.id || data.note_id,
        folder_id: data.folder_id || data.folderId,
        is_public: !!data.is_public
      }
      hasUnsavedChanges.value = false
      saveStatus.value = '已保存'
      previewingNote.value = null
    } catch (error) {
      console.error('获取笔记详情失败:', error)
      ElMessage.error('获取笔记详情失败')
    } finally {
      loading.value = false
    }
  }

  const openPreview = async (note) => {
    loading.value = true
    try {
      await viewNote({ note_id: note.id })
      const data = await getNoteDetail({ note_id: note.id })
      previewingNote.value = {
        ...data,
        id: data.id || data.note_id,
        folder_id: data.folder_id || data.folderId,
        is_public: !!data.is_public
      }
      editingNote.value = null
    } catch (error) {
      console.error('打开公开笔记预览失败:', error)
      ElMessage.error('获取笔记详情失败')
    } finally {
      loading.value = false
    }
  }

  const closeEditor = () => {
    editingNote.value = null
    selectedNoteId.value = null
    hasUnsavedChanges.value = false
    saveStatus.value = '已保存'
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
  }

  const closePreview = () => {
    previewingNote.value = null
    selectedNoteId.value = null
  }

  const markUnsaved = () => {
    hasUnsavedChanges.value = true
    saveStatus.value = '有未保存的更改...'
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveCurrentNote()
    }, 2000)
  }

  const saveCurrentNote = async () => {
    if (!editingNote.value || !hasUnsavedChanges.value) return
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
      return { noteId: editingNote.value.id, folderId: editingNote.value?.folder_id }
    } catch (error) {
      console.error('保存笔记失败:', error)
      saveStatus.value = '保存失败'
      ElMessage.error('保存笔记失败')
      throw error
    }
  }

  const deleteCurrentNote = async () => {
    if (!editingNote.value) return null
    const noteId = editingNote.value.id
    const folderId = editingNote.value?.folder_id
    await deleteNote({ note_id: noteId })
    ElMessage.success('笔记删除成功')
    hasUnsavedChanges.value = false
    editingNote.value = null
    selectedNoteId.value = null
    return { noteId, folderId }
  }

  const createNewNote = async ({ title, folderId }) => {
    const result = await createNote({ title, folder_id: folderId })
    ElMessage.success('笔记创建成功')
    const newNote = await getNoteDetail({ note_id: result.note_id || result.id })
    if (newNote) {
      const note = {
        ...newNote,
        folder_id: newNote.folder_id || newNote.folderId
      }
      allNotes.value.push(note)
      editingNote.value = note
      selectedNoteId.value = note.id
      return note
    }
    return null
  }

  const updateNoteField = (payload) => {
    if (!editingNote.value) return
    Object.assign(editingNote.value, payload)
    hasUnsavedChanges.value = true
    saveStatus.value = '有未保存的更改...'
  }

  // ===== 搜索方法 =====
  const doSearch = async (resetPage = true) => {
    if (!searchKeyword.value.trim()) {
      searchResults.value = []
      searchTotal.value = 0
      searchFrom.value = 0
      return
    }
    if (resetPage) searchFrom.value = 0
    searching.value = true
    try {
      const params = {
        keyword: searchKeyword.value.trim(),
        from: searchFrom.value,
        size: searchPageSize.value
      }
      if (searchIsPublic.value) params.is_public = 1
      const data = await searchNotes(params)
      if (Array.isArray(data)) {
        searchResults.value = data
        searchTotal.value =
          data.length < searchPageSize.value
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

  const setSearchKeyword = ({ keyword, isPublic }) => {
    recommending.value = false
    searchKeyword.value = keyword
    searchIsPublic.value = !!isPublic
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
      doSearch(true)
    }, 300)
  }

  const searchPrev = () => {
    if (searchFrom.value <= 0) return
    searchFrom.value = Math.max(0, searchFrom.value - searchPageSize.value)
    doSearch(false)
  }

  const searchNext = () => {
    if (searchFrom.value + searchPageSize.value >= searchTotal.value) return
    searchFrom.value += searchPageSize.value
    doSearch(false)
  }

  // ===== 推荐方法 =====
  const fetchRecommendNotes = async () => {
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

  const getFolderName = (folderId, folders) => {
    if (!folderId) return ''
    const folder = folders.find((f) => f.id === folderId)
    return folder?.name || ''
  }

  return {
    allNotes,
    selectedNoteId,
    editingNote,
    previewingNote,
    loading,
    saveStatus,
    hasUnsavedChanges,
    searchKeyword,
    searchIsPublic,
    searchResults,
    searchTotal,
    searchFrom,
    searchPageSize,
    searching,
    recommending,
    recommendNotes,
    recommendLoading,
    displayNotes,
    contentTitle,
    fetchRootNotes,
    handleNotesLoaded,
    selectNote,
    openEditor,
    openPreview,
    closeEditor,
    closePreview,
    markUnsaved,
    saveCurrentNote,
    deleteCurrentNote,
    createNewNote,
    updateNoteField,
    doSearch,
    setSearchKeyword,
    searchPrev,
    searchNext,
    fetchRecommendNotes,
    getFolderName
  }
})
