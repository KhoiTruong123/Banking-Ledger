import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionDetail from '@/components/transactions/TransactionDetail.vue'

const postedDebit = {
  id: 'txn-1',
  description: 'Coffee Shop',
  merchant: 'Blue Bottle',
  category: 'Dining',
  status: 'posted',
  amount: -12.5,
  date: '2026-06-05T10:00:00Z',
  balanceAfter: 987.5
}

const pendingCredit = {
  id: 'txn-2',
  description: 'Payroll',
  merchant: 'Acme Inc',
  category: 'Income',
  status: 'pending',
  amount: 2400,
  date: '2026-06-01T10:00:00Z',
  balanceAfter: 3000
}

describe('TransactionDetail', () => {
  it('renders nothing meaningful when closed', () => {
    const wrapper = mount(TransactionDetail, { props: { open: false, transaction: postedDebit } })
    expect(wrapper.find('aside').exists()).toBe(false)
  })

  it('shows a loading state while status is loading', () => {
    const wrapper = mount(TransactionDetail, { props: { open: true, status: 'loading', transaction: null } })
    expect(wrapper.text()).toContain('Loading…')
  })

  it('renders a posted debit transaction with balance after', () => {
    const wrapper = mount(TransactionDetail, {
      props: { open: true, transaction: postedDebit, accountName: 'Everyday Checking', status: 'ready' }
    })

    expect(wrapper.text()).toContain('Coffee Shop')
    expect(wrapper.text()).toContain('Blue Bottle')
    expect(wrapper.text()).toContain('Debit')
    expect(wrapper.text()).toContain('-$12.50')
    expect(wrapper.text()).toContain('Everyday Checking')
    expect(wrapper.text()).toContain('Balance After')
    expect(wrapper.text()).toContain('$987.50')
  })

  it('hides the balance-after row for pending transactions and shows Credit', () => {
    const wrapper = mount(TransactionDetail, {
      props: { open: true, transaction: pendingCredit, accountName: 'Savings', status: 'ready' }
    })

    expect(wrapper.text()).toContain('Credit')
    expect(wrapper.text()).not.toContain('Balance After')
  })

  it('emits close when the close button is clicked', async () => {
    const wrapper = mount(TransactionDetail, {
      props: { open: true, transaction: postedDebit, status: 'ready' }
    })

    await wrapper.find('button[aria-label="Close"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
