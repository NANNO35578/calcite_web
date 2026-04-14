import request from '../utils/request'

/**
 * 提交OCR识别任务
 * @param {File} file - 要识别的图片或PDF文件
 * @returns {Promise<{file_id: number, status: string}>}
 */
export function recognizeOCR(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/ocr/recognize',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': null
    }
  })
}

/**
 * 查询OCR处理状态
 * @param {number} fileId - 文件ID
 * @returns {Promise<Object>}
 */
export function getOCRStatus(fileId) {
  return request({
    url: '/ocr/status',
    method: 'get',
    params: { file_id: fileId }
  })
}

/**
 * 轮询检查OCR处理状态，直到处理完成或失败
 * @param {number} fileId - 文件ID
 * @param {Object} options - 轮询配置
 * @param {number} options.interval - 轮询间隔（毫秒），默认 1500
 * @param {number} options.maxAttempts - 最大尝试次数，默认 120（3分钟）
 * @returns {Promise<{file_id: number, status: string, note_id?: number}>}
 */
export async function pollOCRStatus(fileId, options = {}) {
  const { interval = 1500, maxAttempts = 120 } = options
  let attempts = 0

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      attempts++

      try {
        const data = await getOCRStatus(fileId)

        if (data.status === 'done') {
          resolve(data)
          return
        }

        if (data.status === 'failed') {
          reject(new Error(`OCR处理失败: ${data.file_name || fileId}`))
          return
        }

        if (attempts >= maxAttempts) {
          reject(new Error(`OCR处理超时，请稍后到笔记列表中查看`))
          return
        }

        setTimeout(checkStatus, interval)
      } catch (error) {
        reject(error)
      }
    }

    checkStatus()
  })
}
