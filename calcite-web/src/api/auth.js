import request from '../utils/request'

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名
 * @param {string} data.email - 邮箱（可选）
 * @param {string} data.password - 密码
 */
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 退出登录
 */
export function logout() {
  const token = localStorage.getItem('token')
  return request({
    url: '/auth/logout',
    method: 'post',
    // 某些后端实现要求 token 也在 body 中
    data: token ? { token } : undefined
  })
}

