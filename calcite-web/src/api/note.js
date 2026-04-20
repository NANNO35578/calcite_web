import request from '../utils/request'

/**
 * 新建笔记
 * @param {Object} data - 笔记数据 { title, folder_id }
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
 * @param {Object} data - 笔记数据 { note_id, title?, content?, summary?, folder_id?, is_public? }
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
 * @param {Object} params - { keyword, isPublic?, from?, size? }
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.is_public - 有就搜索公开的
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

/**
 * 获取笔记标签列表
 * @param {number} note_id - 笔记ID
 */
export function getNoteTags(note_id) {
  return request({
    url: '/notes/tags',
    method: 'get',
    params: { note_id }
  })
}

/**
 * AI生成笔记标签
 * @param {number} note_id - 笔记ID
 */
export function generateNoteTagsAI(note_id) {
  return request({
    url: '/notes/tags/ai',
    method: 'post',
    data: { note_id }
  })
}

/**
 * 浏览笔记
 * @param {Object} data - { note_id }
 */
export function viewNote(data) {
  return request({
    url: '/note/view',
    method: 'post',
    data
  })
}

/**
 * 点赞笔记
 * @param {Object} data - { note_id }
 */
export function likeNote(data) {
  return request({
    url: '/note/like',
    method: 'post',
    data
  })
}

/**
 * 收藏笔记
 * @param {Object} data - { note_id }
 */
export function collectNote(data) {
  return request({
    url: '/note/collect',
    method: 'post',
    data
  })
}

/**
 * 取消点赞
 * @param {Object} data - { note_id }
 */
export function unlikeNote(data) {
  return request({
    url: '/notes/like',
    method: 'delete',
    data
  })
}

/**
 * 取消收藏
 * @param {Object} data - { note_id }
 */
export function uncollectNote(data) {
  return request({
    url: '/notes/collect',
    method: 'delete',
    data
  })
}

/**
 * 获取推荐笔记
 * @param {Object} params - 查询参数 { page?, page_size? }
 * @param {number} params.page - 页码，默认1
 * @param {number} params.page_size - 每页数量，默认10，最大50
 */
export function getRecommendNotes(params) {
  return request({
    url: '/recommend/notes',
    method: 'get',
    params
  })
}
