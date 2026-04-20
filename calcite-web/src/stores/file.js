import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFileList, deleteFile } from '../api/file'
import { ElMessage } from 'element-plus'

/**
 * 文件状态管理
 */
export const useFileStore = defineStore('file', () => {
  const allFiles = ref([])
  const filesLoading = ref(false)

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

  const deleteFileAction = async (file) => {
    await deleteFile({ file_id: file.id })
    ElMessage.success('文件删除成功')
    await fetchAllUserFiles()
  }

  return { allFiles, filesLoading, fetchAllUserFiles, deleteFileAction }
})
