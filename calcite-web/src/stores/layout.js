import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

/**
 * 布局状态管理（侧边栏折叠等）
 */
export const useLayoutStore = defineStore('layout', () => {
  const leftCollapsed = ref(localStorage.getItem('calcite:leftCollapsed') === 'true')
  const rightCollapsed = ref(localStorage.getItem('calcite:rightCollapsed') === 'true')

  watch(leftCollapsed, (val) => {
    localStorage.setItem('calcite:leftCollapsed', String(val))
  })

  watch(rightCollapsed, (val) => {
    localStorage.setItem('calcite:rightCollapsed', String(val))
  })

  const toggleLeft = () => { leftCollapsed.value = !leftCollapsed.value }
  const toggleRight = () => { rightCollapsed.value = !rightCollapsed.value }

  return { leftCollapsed, rightCollapsed, toggleLeft, toggleRight }
})
