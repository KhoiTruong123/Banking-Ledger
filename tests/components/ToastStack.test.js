import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ToastStack from '@/components/layout/ToastStack.vue'
import { useUiStore } from '@/stores/ui'

describe('ToastStack', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders a toast pushed onto the ui store', async () => {
    const uiStore = useUiStore()
    uiStore.pushToast('success', 'Transfer complete.')

    const wrapper = mount(ToastStack)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Transfer complete.')
  })

  it('dismisses a toast when its close button is clicked', async () => {
    const uiStore = useUiStore()
    uiStore.pushToast('error', 'Something went wrong.')

    const wrapper = mount(ToastStack)
    await wrapper.vm.$nextTick()

    await wrapper.find('button[aria-label="Dismiss notification"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Something went wrong.')
    expect(uiStore.toasts).toHaveLength(0)
  })
})
