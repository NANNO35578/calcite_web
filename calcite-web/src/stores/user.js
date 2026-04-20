import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserProfile } from '../api/user'

/**
 * @typedef {import('../types').UserInfo} UserInfo
 */

/**
 * 用户状态管理
 * @returns {{
 *   userInfo: import('vue').Ref<UserInfo | null>,
 *   fetchUserInfo: () => Promise<void>,
 *   clearUserInfo: () => void
 * }}
 */
export const useUserStore = defineStore('user', () => {
  /** @type {import('vue').Ref<UserInfo | null>} */
  const userInfo = ref(null)

  const fetchUserInfo = async () => {
    try {
      /** @type {UserInfo} */
      const data = await getUserProfile()
      userInfo.value = data
      localStorage.setItem('userInfo', JSON.stringify(data))
    } catch (error) {
      console.error('获取用户信息失败:', error)
      const localUserInfo = localStorage.getItem('userInfo')
      if (localUserInfo) {
        try {
          userInfo.value = JSON.parse(localUserInfo)
        } catch (e) {
          console.error('解析本地用户信息失败:', e)
        }
      }
    }
  }

  const clearUserInfo = () => {
    userInfo.value = null
  }

  return { userInfo, fetchUserInfo, clearUserInfo }
})
