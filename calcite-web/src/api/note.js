import request from '../utils/request'

/**
 * 新建笔记
 * @param {Object} data - 笔记数据 { title, content, folder_id }
 */
export function createNote(data) {
  return request({
    url: '/note/create',
    method: 'post',
    data
  })
}

/**
 * 更新笔记
 * @param {Object} data - 笔记数据 { note_id, title, content, folder_id }
 */
export function updateNote(data) {
  return request({
    url: '/note/update',
    method: 'post',
    data
  })
}

/**
 * 删除笔记
 * @param {Object} data - { note_id }
 */
export function deleteNote(data) {
  return request({
    url: '/note/delete',
    method: 'post',
    data
  })
}

/**
 * 获取笔记列表
 * @param {Object} params - 查询参数 { folder_id?, page?, pageSize? }
 */
export function getNoteList(params) {
  return request({
    url: '/note/list',
    method: 'get',
    params
  })
}

/**
 * 获取笔记详情
 * @param {Object} params - { note_id }
 */
export function getNoteDetail(params) {
  return request({
    url: '/note/detail',
    method: 'get',
    params
  })
}

/**
 * 全文搜索笔记
 * @param {Object} params - { keyword, from?, size? }
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.from - 分页起始位置，默认0
 * @param {number} params.size - 每页条数，默认20，最大100
 */
export function searchNotes(params) {
  return request({
    url: '/note/search',
    method: 'get',
    params
  })
}
