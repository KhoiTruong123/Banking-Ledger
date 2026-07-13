import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionRow from '@/components/transactions/TransactionRow.vue'

describe('TransactionRow', () => {
  it('renders a credit with a plus sign and credit styling', () => {
    const wrapper = mount(TransactionRow, {
      props: {
        transaction: {
          id: 'txn-1',
          description: 'Payroll',
          merchant: 'Acme Inc',
          category: 'Income',
          status: 'posted',
          amount: 2400,
          date: '2026-06-05T10:00:00Z'
        },
        accountName: 'Everyday Checking'
      }
    })

    expect(wrapper.text()).toContain('+$2,400.00')
    expect(wrapper.find('.amount-credit').exists()).toBe(true)
    expect(wrapper.text()).toContain('Everyday Checking')
  })

  it('renders a debit with no plus sign and debit styling', () => {
    const wrapper = mount(TransactionRow, {
      props: {
        transaction: {
          id: 'txn-2',
          description: 'Coffee Shop',
          merchant: 'Blue Bottle',
          category: 'Dining',
          status: 'pending',
          amount: -12.5,
          date: '2026-06-05T10:00:00Z'
        },
        accountName: 'Savings'
      }
    })

    expect(wrapper.text()).toContain('-$12.50')
    expect(wrapper.text()).not.toContain('+-$12.50')
    expect(wrapper.find('.amount-debit').exists()).toBe(true)
    expect(wrapper.text()).toContain('pending')
  })

  it('emits select with the transaction id when clicked', async () => {
    const wrapper = mount(TransactionRow, {
      props: {
        transaction: {
          id: 'txn-3',
          description: 'Rent',
          merchant: 'Landlord',
          category: 'Utilities',
          status: 'posted',
          amount: -1200,
          date: '2026-06-05T10:00:00Z'
        },
        accountName: 'Everyday Checking'
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('select')).toEqual([['txn-3']])
  })
})
