import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TransferView from '@/views/TransferView.vue'
import { useTransferStore } from '@/stores/transfer'

describe('TransferView', () => {
  it('shows the security promo panel when there is no completed transfer yet', () => {
    setActivePinia(createPinia())
    const wrapper = mount(TransferView)

    expect(wrapper.text()).toContain('Secure Transfer')
    expect(wrapper.text()).toContain('No fees for internal accounts')
  })

  it('shows the transfer receipt once a transfer result exists', () => {
    setActivePinia(createPinia())
    const transferStore = useTransferStore()
    transferStore.lastResult = {
      fromAccount: { nickname: 'Everyday Checking', availableBalance: 750 },
      toAccount: { nickname: 'Savings', availableBalance: 1250 },
      debitTransaction: { date: '2026-06-05T10:00:00Z' },
      creditTransaction: { amount: 250 }
    }

    const wrapper = mount(TransferView)

    expect(wrapper.text()).toContain('Transfer complete')
    expect(wrapper.text()).toContain('$250.00')
    expect(wrapper.text()).not.toContain('Secure Transfer')
  })

  it('resets the transfer store when unmounted', () => {
    setActivePinia(createPinia())
    const transferStore = useTransferStore()
    transferStore.lastResult = { fromAccount: {}, toAccount: {}, debitTransaction: {}, creditTransaction: {} }
    transferStore.error = 'Something failed'

    const wrapper = mount(TransferView)
    wrapper.unmount()

    expect(transferStore.lastResult).toBeNull()
    expect(transferStore.error).toBeNull()
  })
})
