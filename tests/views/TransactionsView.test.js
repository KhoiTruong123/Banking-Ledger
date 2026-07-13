import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import TransactionsView from '@/views/TransactionsView.vue'
import { useAccountsStore } from '@/stores/accounts'
import { useTransactionsStore } from '@/stores/transactions'

vi.mock('@/services/transactionService', () => {
  const items = Array.from({ length: 6 }, (_, i) => ({
    id: `txn-${i + 1}`,
    accountId: 'acc-checking',
    description: `Transaction ${i + 1}`,
    merchant: `Merchant ${i + 1}`,
    category: 'Shopping',
    status: 'posted',
    amount: -10 * (i + 1),
    date: `2026-06-${String(20 - i).padStart(2, '0')}T10:00:00Z`,
    balanceAfter: 1000 - 10 * (i + 1)
  }))
  return {
    transactionService: {
      getTransactions: vi.fn().mockResolvedValue(items),
      getTransactionById: vi.fn((id) => Promise.resolve(items.find((t) => t.id === id)))
    }
  }
})

const Stub = { template: '<div />' }

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/transactions', name: 'transactions', component: Stub },
      { path: '/accounts', name: 'accounts', component: Stub }
    ]
  })
  router.push('/transactions')
  return router
}

async function mountView() {
  setActivePinia(createPinia())
  const accountsStore = useAccountsStore()
  accountsStore.accounts = [{ id: 'acc-checking', nickname: 'Everyday Checking' }]
  const transactionsStore = useTransactionsStore()
  const router = createTestRouter()
  await router.isReady()
  const wrapper = mount(TransactionsView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router, transactionsStore }
}

describe('TransactionsView', () => {
  it('renders the first page of transactions with pagination summary', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('Transaction 1')
    expect(wrapper.text()).toContain('Transaction 5')
    expect(wrapper.text()).not.toContain('Transaction 6')
    expect(wrapper.text()).toContain('Showing 1-5 of 6 transactions')
  })

  it('goes to the next page when the pager is clicked', async () => {
    const { wrapper } = await mountView()

    const nextButtons = wrapper.findAll('button').filter((b) => b.text() === '2')
    await nextButtons[0].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Transaction 6')
    expect(wrapper.text()).toContain('Showing 6-6 of 6 transactions')
  })

  it('opens the detail panel when a transaction row is clicked', async () => {
    const { wrapper } = await mountView()

    await wrapper.find('button.grid').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Transaction Details')
    expect(wrapper.text()).toContain('Everyday Checking')
  })

  it('triggers a debounced fetch when the search filter changes', async () => {
    vi.useFakeTimers()
    const { wrapper, transactionsStore } = await mountView()
    const fetchSpy = vi.spyOn(transactionsStore, 'fetch')

    await wrapper.find('input[type="search"]').setValue('lunch')
    expect(fetchSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(fetchSpy).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('resets filters when Reset Filters is clicked', async () => {
    const { wrapper, transactionsStore } = await mountView()
    const fetchSpy = vi.spyOn(transactionsStore, 'fetch')

    await wrapper.findAll('button').find((b) => b.text().includes('Reset Filters')).trigger('click')

    expect(fetchSpy).toHaveBeenCalledWith({ accountId: '', category: '', search: '', status: '', dateFrom: '', dateTo: '' })
  })
})
