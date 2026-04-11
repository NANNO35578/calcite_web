/**
 * 主题配置系统 - Everforest 风格
 * 
 * 使用方法:
 * 1. 在 main.js 中导入并初始化主题
 * 2. 在组件中使用 CSS 变量或 useTheme 组合式函数
 */

// 深色主题 (Dark) - 默认
export const darkTheme = {
  name: 'dark',
  label: '深色',
  
  // 基础背景色
  bg: {
    primary: '#272e33',      // 主背景
    secondary: '#2d353b',    // 次背景 (侧边栏)
    tertiary: '#414b50',     // 三级背景 (按钮、输入框)
    hover: '#3d484d',        // 悬停背景
    active: '#4a5658',       // 激活背景
  },
  
  // 文字颜色
  text: {
    primary: '#d3c6aa',      // 主文字
    secondary: '#9da9a0',    // 次文字
    muted: '#7a8478',        // 弱化文字
    inverse: '#272e33',      // 反色文字 (用于强调背景上)
  },
  
  // 强调色/主题色
  accent: {
    primary: '#7fbbb3',      // 主强调色 (青绿色)
    secondary: '#a7c080',    // 次强调色 (绿色)
    warning: '#e69875',      // 警告色 (橙色)
    error: '#e67e80',        // 错误色 (红色)
  },
  
  // 边框颜色
  border: {
    primary: '#7a8478',      // 主边框
    secondary: '#4a5658',    // 次边框
    accent: '#7fbbb3',       // 强调边框
  },
  
  // 特殊组件颜色
  component: {
    folder: '#a7c080',       // 文件夹图标
    note: '#7fbbb3',         // 笔记图标
    tag: {
      bg: '#414b50',
      bgBound: '#7fbbb3',
      text: '#d3c6aa',
      textBound: '#272e33',
    },
    scrollThumb: '#4a5658',
  }
}

// 浅色主题 (Light)
export const lightTheme = {
  name: 'light',
  label: '浅色',
  
  // 基础背景色
  bg: {
    primary: '#fdf6e3',      // 主背景
    secondary: '#f3e7c8',    // 次背景 (侧边栏)
    tertiary: '#e6dcc4',     // 三级背景 (按钮、输入框)
    hover: '#e6dcc4',        // 悬停背景
    active: '#d9d3bc',       // 激活背景
  },
  
  // 文字颜色
  text: {
    primary: '#5c6a72',      // 主文字
    secondary: '#9da9a0',    // 次文字
    muted: '#9da9a0',        // 弱化文字
    inverse: '#fdf6e3',      // 反色文字
  },
  
  // 强调色/主题色
  accent: {
    primary: '#7fbbb3',      // 主强调色 (青绿色)
    secondary: '#a7c080',    // 次强调色 (绿色)
    warning: '#e69875',      // 警告色 (橙色)
    error: '#e67e80',        // 错误色 (红色)
  },
  
  // 边框颜色
  border: {
    primary: '#a7c080',      // 主边框
    secondary: '#d9d3bc',    // 次边框
    accent: '#7fbbb3',       // 强调边框
  },
  
  // 特殊组件颜色
  component: {
    folder: '#a7c080',       // 文件夹图标
    note: '#7fbbb3',         // 笔记图标
    tag: {
      bg: '#e6dcc4',
      bgBound: '#7fbbb3',
      text: '#5c6a72',
      textBound: '#fdf6e3',
    },
    scrollThumb: '#d9d3bc',
  }
}

// 所有主题映射
export const themes = {
  dark: darkTheme,
  light: lightTheme
}

// 默认主题
export const defaultTheme = 'dark'

// 本地存储键名
export const THEME_STORAGE_KEY = 'calcite-theme'

// 将主题对象转换为 CSS 变量
export function themeToCSSVariables(theme) {
  const vars = {}
  
  // 背景色
  vars['--bg-primary'] = theme.bg.primary
  vars['--bg-secondary'] = theme.bg.secondary
  vars['--bg-tertiary'] = theme.bg.tertiary
  vars['--bg-hover'] = theme.bg.hover
  vars['--bg-active'] = theme.bg.active
  
  // 文字色
  vars['--text-primary'] = theme.text.primary
  vars['--text-secondary'] = theme.text.secondary
  vars['--text-muted'] = theme.text.muted
  vars['--text-inverse'] = theme.text.inverse
  
  // 强调色
  vars['--accent-primary'] = theme.accent.primary
  vars['--accent-secondary'] = theme.accent.secondary
  vars['--accent-warning'] = theme.accent.warning
  vars['--accent-error'] = theme.accent.error
  
  // 边框色
  vars['--border-primary'] = theme.border.primary
  vars['--border-secondary'] = theme.border.secondary
  vars['--border-accent'] = theme.border.accent
  
  // 组件色
  vars['--component-folder'] = theme.component.folder
  vars['--component-note'] = theme.component.note
  vars['--component-tag-bg'] = theme.component.tag.bg
  vars['--component-tag-bg-bound'] = theme.component.tag.bgBound
  vars['--component-tag-text'] = theme.component.tag.text
  vars['--component-tag-text-bound'] = theme.component.tag.textBound
  vars['--component-scroll-thumb'] = theme.component.scrollThumb
  
  return vars
}

// 应用主题到 DOM
export function applyTheme(themeName) {
  const theme = themes[themeName] || themes[defaultTheme]
  const vars = themeToCSSVariables(theme)
  const root = document.documentElement
  
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  
  root.setAttribute('data-theme', themeName)
  localStorage.setItem(THEME_STORAGE_KEY, themeName)
  
  return theme
}

// 获取保存的主题
export function getSavedTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || defaultTheme
}

// 初始化主题
export function initTheme() {
  const savedTheme = getSavedTheme()
  applyTheme(savedTheme)
  return savedTheme
}

// 切换主题
export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || defaultTheme
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  applyTheme(newTheme)
  return newTheme
}

// 设置指定主题
export function setTheme(themeName) {
  if (themes[themeName]) {
    applyTheme(themeName)
    return themeName
  }
  console.warn(`Theme "${themeName}" not found, using default`)
  applyTheme(defaultTheme)
  return defaultTheme
}
