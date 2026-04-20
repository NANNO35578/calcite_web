import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
// 开发环境使用代理，生产环境使用完整URL
// const baseURL = 'http://localhost:8888'
const baseURL = import.meta.env.DEV ? '/api' : 'http://localhost:8888'

const request = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 开发环境下打印请求信息（生产环境已移除）
    // if (import.meta.env.DEV) {
    //   const logData = config.method?.toLowerCase() === 'get' ? config.params : config.data
    //   console.log('请求:', config.method?.toUpperCase(), config.url, logData)
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 开发环境下打印响应信息（生产环境已移除）
    // if (import.meta.env.DEV) {
    //   const requestParams = response.config.method?.toLowerCase() === 'get' ? response.config.params : response.config.data
    //   console.log('响应:', response.config.url, '请求参数:', requestParams, '响应数据:', res)
    // }
    
    // 检查响应数据格式
    if (typeof res !== 'object' || res === null) {
      // console.warn('响应数据格式异常:', res)
      return res
    }
    
    // 如果返回的code不是0，说明有错误
    if (res.code !== undefined && res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    // 如果响应包含data字段，返回data；否则返回整个响应
    return res.data !== undefined ? res.data : res
  },
  (error) => {
    // 处理HTTP错误
    if (error.response) {
      // 服务器返回了响应，但状态码不在2xx范围内
      const { status, data } = error.response
      if (status === 401) {
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/login'
      } else {
        // 尝试从响应数据中获取错误信息
        const errorMsg = data?.message || data?.error || `请求失败: ${status}`
        ElMessage.error(errorMsg)
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      // 可能是网络问题、CORS问题或服务器未响应
      console.error('请求错误:', error)
      if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请检查网络连接')
      } else if (error.message && error.message.includes('Network Error')) {
        ElMessage.error('网络错误，请检查：\n1. 后端服务是否运行在 http://localhost:8888\n2. 是否配置了CORS允许跨域请求')
      } else {
        ElMessage.error(`网络错误: ${error.message || '无法连接到服务器'}`)
      }
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error)
      ElMessage.error(`请求配置错误: ${error.message || '未知错误'}`)
    }
    return Promise.reject(error)
  }
)

export default request

