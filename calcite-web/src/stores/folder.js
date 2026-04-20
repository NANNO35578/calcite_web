import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getFolderList,
  createFolder,
  updateFolder,
  deleteFolder as deleteFolderApi
} from '../api/folder'
import { ElMessage } from 'element-plus'

/**
 * 文件夹状态管理
 */
export const useFolderStore = defineStore('folder', () => {
  const allFolders = ref([])
  const selectedFolderId = ref(null)
  const expandedFolders = ref(new Set())
  const loading = ref(false)

  const rootFolders = computed(() =>
    allFolders.value.filter((f) => !f.parent_id || f.parent_id === 0)
  )

  const folderTreeData = computed(() => {
    const list = allFolders.value || []
    const map = new Map()
    const roots = []

    list.forEach((item) => {
      map.set(item.id, { ...item, children: [] })
    })

    map.forEach((item) => {
      if (item.parent_id && item.parent_id !== 0) {
        const parent = map.get(item.parent_id)
        if (parent) parent.children.push(item)
        else roots.push(item)
      } else {
        roots.push(item)
      }
    })

    return roots
  })

  const fetchRootFolders = async () => {
    try {
      const data = await getFolderList({ folder_id: 0 })
      const rootList = Array.isArray(data) ? data : []
      allFolders.value = allFolders.value.filter(
        (f) => f.parent_id !== 0 && f.parent_id != null
      )
      const existingIds = new Set(allFolders.value.map((f) => f.id))
      const newFolders = rootList.filter((f) => !existingIds.has(f.id))
      allFolders.value.push(...newFolders)
    } catch (error) {
      console.error('获取根文件夹列表失败:', error)
    }
  }

  const handleFoldersLoaded = ({ folders, parentId }) => {
    const existingIds = new Set(allFolders.value.map((f) => f.id))
    const newFolders = folders.filter((f) => !existingIds.has(f.id))
    allFolders.value.push(...newFolders)
  }

  const refreshFolderData = async (folderId) => {
    try {
      const folders = await getFolderList({ folder_id: folderId })
      handleFoldersLoaded({
        folders: Array.isArray(folders) ? folders : [],
        parentId: folderId
      })
    } catch (e) {
      console.error(`刷新文件夹 ${folderId} 数据失败:`, e)
    }
  }

  const createFolderAction = async ({ name, parent_id }) => {
    await createFolder({ name, parent_id })
    ElMessage.success('文件夹创建成功')
    await fetchRootFolders()
    await refreshFolderData(parent_id || 0)
  }

  const updateFolderAction = async ({ folder_id, name }) => {
    await updateFolder({ folder_id, name })
    ElMessage.success('文件夹修改成功')
    await fetchRootFolders()
  }

  const deleteFolderAction = async ({ folder_id, parent_id }) => {
    await deleteFolderApi({ folder_id })
    ElMessage.success('文件夹删除成功')
    if (selectedFolderId.value === folder_id) {
      selectedFolderId.value = null
    }
    await fetchRootFolders()
    await refreshFolderData(parent_id ?? 0)
  }

  const selectFolder = (folder) => {
    selectedFolderId.value = folder?.id || null
  }

  const expandFolder = (folder) => {
    expandedFolders.value.add(folder.id)
  }

  const collapseFolder = (folder) => {
    expandedFolders.value.delete(folder.id)
  }

  const expandParentFolders = (parentId) => {
    if (!parentId || parentId === 0) return
    expandedFolders.value.add(parentId)
    const parent = allFolders.value.find((f) => f.id === parentId)
    if (parent && parent.parent_id) {
      expandParentFolders(parent.parent_id)
    }
  }

  return {
    allFolders,
    selectedFolderId,
    expandedFolders,
    loading,
    rootFolders,
    folderTreeData,
    fetchRootFolders,
    handleFoldersLoaded,
    refreshFolderData,
    createFolderAction,
    updateFolderAction,
    deleteFolderAction,
    selectFolder,
    expandFolder,
    collapseFolder,
    expandParentFolders
  }
})
