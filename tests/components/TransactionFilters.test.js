import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionFilters from '@/components/transactions/TransactionFilters.vue'

const filters = { accountId: '', category: '', search: '', status: '', dateFrom: '', dateTo: '' }
const accounts = [
  { id: 'acc-checking', nickname: 'Everyday Checking' },
  { id: 'acc-savings', nickname: 'Savings' }
]

describe('TransactionFilters', () => {
  it('lists the given accounts as select options', () => {
    const wrapper = mount(TransactionFilters, { props: { filters, accounts } })
    const options = wrapper.find('select').findAll('option')

    expect(options.map((o) => o.text())).toEqual(['All Accounts', 'Everyday Checking', 'Savings'])
  })

  it('emits update:filters with the new search value on input', async () => {
    const wrapper = mount(TransactionFilters, { props: { filters, accounts } })

    await wrapper.find('input[type="search"]').setValue('coffee')

    const emitted = wrapper.emitted('update:filters')
    expect(emitted).toHaveLength(1)
    expect(emitted[0][0]).toMatchObject({ search: 'coffee' })
  })

  it('emits update:filters with the selected status on change', async () => {
    const wrapper = mount(TransactionFilters, { props: { filters, accounts } })
    const selects = wrapper.findAll('select')
    const statusSelect = selects[2]

    await statusSelect.setValue('pending')

    const emitted = wrapper.emitted('update:filters')
    expect(emitted[0][0]).toMatchObject({ status: 'pending' })
  })

  it('emits reset when the reset button is clicked', async () => {
    const wrapper = mount(TransactionFilters, { props: { filters, accounts } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('reset')).toHaveLength(1)
  })
})
