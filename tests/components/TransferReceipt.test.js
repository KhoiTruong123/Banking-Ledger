import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TransferReceipt from '@/components/transfer/TransferReceipt.vue'

const result = {
  fromAccount: { nickname: 'Everyday Checking', availableBalance: 750 },
  toAccount: { nickname: 'Savings', availableBalance: 1250 },
  debitTransaction: { date: '2026-06-05T10:00:00Z' },
  creditTransaction: { amount: 250 }
}

describe('TransferReceipt', () => {
  it('renders the transferred amount and both account names', () => {
    const wrapper = mount(TransferReceipt, { props: { result } })

    expect(wrapper.text()).toContain('$250.00')
    expect(wrapper.text()).toContain('Everyday Checking')
    expect(wrapper.text()).toContain('Savings')
  })

  it('renders the post-transfer balances for both accounts', () => {
    const wrapper = mount(TransferReceipt, { props: { result } })

    expect(wrapper.text()).toContain('$750.00')
    expect(wrapper.text()).toContain('$1,250.00')
  })
})
