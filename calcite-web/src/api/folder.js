import request from '../utils/request'

/**
 * 创建文件夹
 * @param {Object} data - 文件夹数据 { name, parent_id? }
 */
export function createFolder(data) {
  return request({
    url: '/folder/create',
    method: 'post',
    data
  })
}

/**
 * 获取文件夹列表
 * @param {Object} params - 查询参数 { folder_id? }
 */
export function getFolderList(params) {
  return request({
    url: '/folder/list',
    method: 'get',
    params
  })
}

/**
 * 更新文件夹
 * @param {Object} data - 文件夹数据 { folder_id, name?, parent_id? }
 */
export function updateFolder(data) {
  return request({
    url: '/folder/update',
    method: 'post',
    data
  })
}

/**
 * 删除文件夹
 * @param {Object} data - { folder_id }
 */
export function deleteFolder(data) {
  return request({
    url: '/folder/delete',
    method: 'post',
    data
  })
}
