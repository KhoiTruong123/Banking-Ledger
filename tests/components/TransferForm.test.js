import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TransferForm from '@/components/transfer/TransferForm.vue'
import { useAccountsStore } from '@/stores/accounts'
import { useTransferStore } from '@/stores/transfer'

const accountsFixture = [
  { id: 'acc-checking', nickname: 'Everyday Checking', accountNumber: '1111222233', status: 'active', availableBalance: 1000 },
  { id: 'acc-savings', nickname: 'Savings', accountNumber: '4444555566', status: 'active', availableBalance: 500 },
  { id: 'acc-legacy', nickname: 'Old Account', accountNumber: '7777888899', status: 'closed', availableBalance: 0 }
]

function setup() {
  setActivePinia(createPinia())
  const accountsStore = useAccountsStore()
  accountsStore.accounts = accountsFixture
  const transferStore = useTransferStore()
  const wrapper = mount(TransferForm)
  return { wrapper, accountsStore, transferStore }
}

describe('TransferForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('only lists active accounts as transfer sources', () => {
    const { wrapper } = setup()
    const fromOptions = wrapper.find('#from').findAll('option')

    expect(fromOptions.map((o) => o.text())).toEqual([
      'Select Source',
      expect.stringContaining('Everyday Checking'),
      expect.stringContaining('Savings')
    ])
  })

  it('excludes the selected source account from the destination options', async () => {
    const { wrapper } = setup()

    await wrapper.find('#from').setValue('acc-checking')

    const toOptions = wrapper.find('#to').findAll('option')
    expect(toOptions.map((o) => o.text()).join(' ')).not.toContain('Everyday Checking')
    expect(toOptions.map((o) => o.text()).join(' ')).toContain('Savings')
  })

  it('blocks submit and shows field errors when the form is empty', async () => {
    const { wrapper, transferStore } = setup()
    const submitSpy = vi.spyOn(transferStore, 'submit')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Choose a source account.')
    expect(wrapper.text()).toContain('Choose a destination account.')
    expect(wrapper.text()).toContain('Enter an amount greater than zero.')
    expect(submitSpy).not.toHaveBeenCalled()
  })

  it('shows an insufficient-balance error without submitting', async () => {
    const { wrapper, transferStore } = setup()
    const submitSpy = vi.spyOn(transferStore, 'submit')

    await wrapper.find('#from').setValue('acc-checking')
    await wrapper.find('#to').setValue('acc-savings')
    await wrapper.find('#amount').setValue('1500')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Exceeds the $1,000.00 available in Everyday Checking.')
    expect(submitSpy).not.toHaveBeenCalled()
  })

  it('submits a valid transfer and resets the amount and note fields', async () => {
    const { wrapper, transferStore } = setup()
    const submitSpy = vi.spyOn(transferStore, 'submit').mockResolvedValue({})

    await wrapper.find('#from').setValue('acc-checking')
    await wrapper.find('#to').setValue('acc-savings')
    await wrapper.find('#amount').setValue('250')
    await wrapper.find('#note').setValue('Rent split')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(submitSpy).toHaveBeenCalledWith({
      fromAccountId: 'acc-checking',
      toAccountId: 'acc-savings',
      amount: 250,
      note: 'Rent split'
    })
    expect(wrapper.find('#amount').element.value).toBe('')
    expect(wrapper.find('#note').element.value).toBe('')
  })
})
