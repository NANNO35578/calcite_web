import request from '../utils/request'

/**
 * 创建标签
 * @param {Object} data - 标签数据 { name }
 */
export function createTag(data) {
  return request({
    url: '/tag/create',
    method: 'post',
    data
  })
}

/**
 * 获取标签列表
 * @param {Object} params - 查询参数 { note_id? }
 */
export function getTagList(params) {
  return request({
    url: '/tag/list',
    method: 'get',
    params
  })
}

/**
 * 绑定/解除笔记标签
 * @param {Object} data - { note_id, tag_ids }
 */
export function bindTag(data) {
  return request({
    url: '/tag/bind',
    method: 'post',
    data
  })
}

/**
 * 更新标签
 * @param {Object} data - 标签数据 { tag_id, name }
 */
export function updateTag(data) {
  return request({
    url: '/tag/update',
    method: 'post',
    data
  })
}

/**
 * 删除标签
 * @param {Object} data - { tag_id }
 */
export function deleteTag(data) {
  return request({
    url: '/tag/delete',
    method: 'post',
    data
  })
}
