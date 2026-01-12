import request from '../utils/request'

/**
 * 获取用户信息
 */
export function getUserProfile() {
  return request({
    url: '/user/profile',
    method: 'get'
  })
}

