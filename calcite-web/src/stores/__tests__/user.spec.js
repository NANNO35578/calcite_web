import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import * as userApi from '../../api/user'

// Mock API 模块
vi.mock('../../api/user', () => ({
  getUserProfile: vi.fn()
}))

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with null userInfo', () => {
    const store = useUserStore()
    expect(store.userInfo).toBeNull()
  })

  it('should fetch and set user info', async () => {
    const mockUser = { user_id: 1, username: 'test', email: 'test@example.com' }
    userApi.getUserProfile.mockResolvedValue(mockUser)

    const store = useUserStore()
    await store.fetchUserInfo()

    expect(store.userInfo).toEqual(mockUser)
    expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(mockUser))
  })

  it('should handle fetch error and use localStorage fallback', async () => {
    const mockUser = { user_id: 2, username: 'local' }
    localStorage.setItem('userInfo', JSON.stringify(mockUser))
    userApi.getUserProfile.mockRejectedValue(new Error('Network Error'))

    const store = useUserStore()
    await store.fetchUserInfo()

    expect(store.userInfo).toEqual(mockUser)
  })

  it('should clear user info', () => {
    const store = useUserStore()
    store.userInfo = { user_id: 1, username: 'test' }
    store.clearUserInfo()
    expect(store.userInfo).toBeNull()
  })
})
