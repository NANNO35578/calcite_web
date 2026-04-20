import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 对话框状态管理
 */
export const useDialogStore = defineStore('dialog', () => {
  const folderDialogVisible = ref(false)
  const editingFolder = ref(null)
  const folderForm = ref({ name: '', parentId: 0 })

  const noteDialogVisible = ref(false)
  const noteForm = ref({ title: '', folderId: null })

  const openFolderDialog = (folder = null, parentId = 0) => {
    editingFolder.value = folder
    folderForm.value = {
      name: folder?.name || '',
      parentId: folder?.parent_id ?? parentId
    }
    folderDialogVisible.value = true
  }

  const closeFolderDialog = () => {
    folderDialogVisible.value = false
    editingFolder.value = null
  }

  const openNoteDialog = (folderId = null) => {
    noteForm.value = { title: '', folderId }
    noteDialogVisible.value = true
  }

  const closeNoteDialog = () => {
    noteDialogVisible.value = false
  }

  return {
    folderDialogVisible,
    editingFolder,
    folderForm,
    noteDialogVisible,
    noteForm,
    openFolderDialog,
    closeFolderDialog,
    openNoteDialog,
    closeNoteDialog
  }
})
