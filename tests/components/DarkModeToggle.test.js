import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'
import { useUiStore } from '@/stores/ui'

describe('DarkModeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('starts in light mode showing the moon icon', () => {
    const wrapper = mount(DarkModeToggle)

    expect(wrapper.attributes('aria-pressed')).toBe('false')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles dark mode, the html class, and localStorage on click', async () => {
    const wrapper = mount(DarkModeToggle)
    const uiStore = useUiStore()

    await wrapper.find('button').trigger('click')

    expect(uiStore.darkMode).toBe(true)
    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    await wrapper.find('button').trigger('click')

    expect(uiStore.darkMode).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
