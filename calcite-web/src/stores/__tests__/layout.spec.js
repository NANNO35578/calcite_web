import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLayoutStore } from '../layout'

describe('Layout Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default collapsed states', () => {
    const store = useLayoutStore()
    expect(typeof store.leftCollapsed).toBe('boolean')
    expect(typeof store.rightCollapsed).toBe('boolean')
  })

  it('should toggle left sidebar', () => {
    const store = useLayoutStore()
    const initial = store.leftCollapsed
    store.toggleLeft()
    expect(store.leftCollapsed).toBe(!initial)
  })

  it('should toggle right sidebar', () => {
    const store = useLayoutStore()
    const initial = store.rightCollapsed
    store.toggleRight()
    expect(store.rightCollapsed).toBe(!initial)
  })

  it('should detect mobile screen', () => {
    const store = useLayoutStore()
    store.updateWindowWidth(500)
    expect(store.isMobile).toBe(true)
    expect(store.leftCollapsed).toBe(true)
    expect(store.rightCollapsed).toBe(true)
  })

  it('should detect desktop screen', () => {
    const store = useLayoutStore()
    store.updateWindowWidth(1200)
    expect(store.isMobile).toBe(false)
  })
})
