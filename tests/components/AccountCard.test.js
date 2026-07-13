import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountCard from '@/components/accounts/AccountCard.vue'

const activeAccount = {
  id: 'acc-checking',
  nickname: 'Everyday Checking',
  type: 'checking',
  status: 'active',
  accountNumber: '1234567890',
  availableBalance: 1500.5,
  ledgerBalance: 1600.5,
  pendingHoldsTotal: 100
}

const closedAccount = {
  id: 'acc-legacy',
  nickname: 'Old Savings',
  type: 'savings',
  status: 'closed',
  accountNumber: '9876543210',
  availableBalance: 0,
  ledgerBalance: 0,
  pendingHoldsTotal: 0
}

describe('AccountCard', () => {
  it('renders nickname, masked account number, and balances for an active account', () => {
    const wrapper = mount(AccountCard, { props: { account: activeAccount } })

    expect(wrapper.text()).toContain('Everyday Checking')
    expect(wrapper.text()).toContain('•••• 7890')
    expect(wrapper.text()).toContain('Checking')
    expect(wrapper.text()).toContain('$1,500.50')
    expect(wrapper.text()).toContain('$1,600.50')
    expect(wrapper.text()).toContain('-$100.00')
    expect(wrapper.text()).toContain('View transactions')
  })

  it('shows a closed state without ledger/hold rows', () => {
    const wrapper = mount(AccountCard, { props: { account: closedAccount } })

    expect(wrapper.text()).toContain('Final balance')
    expect(wrapper.text()).toContain('Account closed')
    expect(wrapper.text()).toContain('View history')
    expect(wrapper.text()).not.toContain('Ledger balance')
  })

  it('emits view-transactions with the account id when the button is clicked', async () => {
    const wrapper = mount(AccountCard, { props: { account: activeAccount } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('view-transactions')).toEqual([['acc-checking']])
  })
})
