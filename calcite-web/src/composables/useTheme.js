import { ref, computed, onMounted } from 'vue'
import { 
  themes, 
  defaultTheme, 
  applyTheme, 
  getSavedTheme, 
  initTheme,
  toggleTheme as toggleThemeUtil,
  setTheme as setThemeUtil,
  THEME_STORAGE_KEY 
} from '../styles/theme'

/**
 * 主题管理组合式函数
 * 
 * @example
 * // 在组件中使用
 * const { currentTheme, isDark, toggleTheme, setTheme } = useTheme()
 * 
 * // 切换主题
 * toggleTheme()
 * 
 * // 设置指定主题
 * setTheme('light')
 */
export function useTheme() {
  const currentTheme = ref(defaultTheme)
  
  // 是否是深色主题
  const isDark = computed(() => currentTheme.value === 'dark')
  
  // 是否是浅色主题
  const isLight = computed(() => currentTheme.value === 'light')
  
  // 当前主题配置对象
  const themeConfig = computed(() => themes[currentTheme.value] || themes[defaultTheme])
  
  // 所有可用主题列表
  const availableThemes = computed(() => 
    Object.entries(themes).map(([key, config]) => ({
      key,
      label: config.label
    }))
  )
  
  // 初始化主题
  const initialize = () => {
    currentTheme.value = initTheme()
  }
  
  // 切换主题
  const toggle = () => {
    currentTheme.value = toggleThemeUtil()
    return currentTheme.value
  }
  
  // 设置主题
  const set = (themeName) => {
    currentTheme.value = setThemeUtil(themeName)
    return currentTheme.value
  }
  
  // 监听存储变化（多标签页同步）
  const setupStorageListener = () => {
    window.addEventListener('storage', (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        const newTheme = e.newValue || defaultTheme
        currentTheme.value = newTheme
        applyTheme(newTheme)
      }
    })
  }
  
  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // 只有在用户没有手动设置过主题时才跟随系统
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        const newTheme = e.matches ? 'dark' : 'light'
        currentTheme.value = newTheme
        applyTheme(newTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    // 返回清理函数
    return () => mediaQuery.removeEventListener('change', handleChange)
  }
  
  // 在组件挂载时初始化
  onMounted(() => {
    initialize()
    setupStorageListener()
    setupSystemThemeListener()
  })
  
  return {
    // 状态
    currentTheme,
    isDark,
    isLight,
    themeConfig,
    availableThemes,
    
    // 方法
    initialize,
    toggleTheme: toggle,
    setTheme: set,
    applyTheme
  }
}

export default useTheme
