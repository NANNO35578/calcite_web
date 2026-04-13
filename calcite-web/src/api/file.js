import request from '../utils/request'

/**
 * 上传文件
 * @param {FormData} formData - 包含文件的 FormData 对象
 * @param {number} noteId - 关联的笔记ID（可选）
 * @returns {Promise<{file_id: number, status: string}>}
 */
export function uploadFile(formData, noteId = null) {
  if (noteId !== null) {
    formData.append('note_id', noteId)
  }
  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      // 将 Content-Type 设为 null，让 axios 跳过该 header，
      // 浏览器在发送 FormData 时会自动补充 multipart/form-data; boundary=...
      'Content-Type': null
    }
  })
}

/**
 * 获取文件列表
 * @param {Object} params - 查询参数 { user_id?, note_id?, status? }
 * @returns {Promise<Array>}
 */
export function getFileList(params = {}) {
  return request({
    url: '/file/list',
    method: 'get',
    params
  })
}

/**
 * 删除文件
 * @param {Object} data - { file_id }
 * @returns {Promise<{minio_deleted: boolean}>}
 */
export function deleteFile(data) {
  return request({
    url: '/file/delete',
    method: 'post',
    data
  })
}

/**
 * 查询文件上传状态
 * @param {Object} params - { file_id }
 * @returns {Promise<{file_id: number, file_name: string, status: string, url?: string, file_size: number}>}
 */
export function getFileStatus(params) {
  return request({
    url: '/file/status',
    method: 'get',
    params
  })
}

/**
 * 获取单个文件详情
 * @param {Object} params - { file_id }
 * @returns {Promise<Object>}
 */
export function getFileInfo(params) {
  return request({
    url: '/file/info',
    method: 'get',
    params
  })
}

/**
 * 轮询检查文件上传状态，直到上传完成或失败
 * @param {number} fileId - 文件ID
 * @param {Object} options - 轮询配置
 * @param {number} options.interval - 轮询间隔（毫秒），默认 1000
 * @param {number} options.maxAttempts - 最大尝试次数，默认 60（60秒）
 * @returns {Promise<{file_id: number, status: string, url: string}>}
 */
export async function pollFileStatus(fileId, options = {}) {
  const { interval = 1000, maxAttempts = 60 } = options
  let attempts = 0

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      attempts++
      
      try {
        const data = await getFileStatus({ file_id: fileId })
        
        if (data.status === 'done') {
          resolve(data)
          return
        }
        
        if (data.status === 'failed') {
          reject(new Error(`文件 "${data.file_name}" 上传失败`))
          return
        }
        
        if (attempts >= maxAttempts) {
          reject(new Error(`文件 "${data.file_name}" 上传超时，请稍后刷新查看`))
          return
        }
        
        // 继续轮询
        setTimeout(checkStatus, interval)
      } catch (error) {
        reject(error)
      }
    }
    
    checkStatus()
  })
}
