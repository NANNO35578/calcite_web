import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

const MOBILE_BREAKPOINT = 768

/**
 * 布局状态管理（侧边栏折叠等）
 * @returns {{
 *   leftCollapsed: import('vue').Ref<boolean>,
 *   rightCollapsed: import('vue').Ref<boolean>,
 *   isMobile: import('vue').ComputedRef<boolean>,
 *   toggleLeft: () => void,
 *   toggleRight: () => void,
 *   updateWindowWidth: (width: number) => void
 * }}
 */
export const useLayoutStore = defineStore('layout', () => {
  /** @type {import('vue').Ref<boolean>} */
  const leftCollapsed = ref(localStorage.getItem('calcite:leftCollapsed') === 'true')
  /** @type {import('vue').Ref<boolean>} */
  const rightCollapsed = ref(localStorage.getItem('calcite:rightCollapsed') === 'true')
  /** @type {import('vue').Ref<number>} */
  const windowWidth = ref(window.innerWidth)

  /** @type {import('vue').ComputedRef<boolean>} */
  const isMobile = computed(() => windowWidth.value < MOBILE_BREAKPOINT)

  watch(leftCollapsed, (val) => {
    localStorage.setItem('calcite:leftCollapsed', String(val))
  })

  watch(rightCollapsed, (val) => {
    localStorage.setItem('calcite:rightCollapsed', String(val))
  })

  const toggleLeft = () => { leftCollapsed.value = !leftCollapsed.value }
  const toggleRight = () => { rightCollapsed.value = !rightCollapsed.value }

  /**
   * @param {number} width
   */
  const updateWindowWidth = (width) => {
    windowWidth.value = width
    if (isMobile.value) {
      leftCollapsed.value = true
      rightCollapsed.value = true
    }
  }

  return { leftCollapsed, rightCollapsed, isMobile, toggleLeft, toggleRight, updateWindowWidth }
})
