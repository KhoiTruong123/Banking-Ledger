import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AccountsView from '@/views/AccountsView.vue'
import { useAccountsStore } from '@/stores/accounts'

vi.mock('@/services/transactionService', () => ({
  transactionService: {
    getTransactions: vi.fn().mockResolvedValue([{ id: 'txn-1' }, { id: 'txn-2' }])
  }
}))

const Stub = { template: '<div />' }

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/accounts', name: 'accounts', component: Stub },
      { path: '/transactions', name: 'transactions', component: Stub }
    ]
  })
  router.push('/accounts')
  return router
}

async function mountView() {
  setActivePinia(createPinia())
  const accountsStore = useAccountsStore()
  accountsStore.status = 'ready'
  accountsStore.customer = { name: 'Jane Doe' }
  accountsStore.accounts = [
    { id: 'acc-checking', nickname: 'Everyday Checking', type: 'checking', status: 'active', accountNumber: '1111222233', availableBalance: 1000, ledgerBalance: 1000, pendingHoldsTotal: 0 },
    { id: 'acc-savings', nickname: 'Savings', type: 'savings', status: 'active', accountNumber: '4444555566', availableBalance: 500, ledgerBalance: 500, pendingHoldsTotal: 0 }
  ]
  const router = createTestRouter()
  await router.isReady()
  const wrapper = mount(AccountsView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router, accountsStore }
}

describe('AccountsView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-13T09:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('greets the customer by first name based on the time of day', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Good morning, Jane')
  })

  it('renders an AccountCard per account', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Everyday Checking')
    expect(wrapper.text()).toContain('Savings')
  })

  it('shows the pending transaction count once loaded', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('2 pending transactions')
  })

  it('navigates to transactions filtered by account when a card requests it', async () => {
    const { wrapper, router } = await mountView()

    await wrapper.findAll('button').find((b) => b.text() === 'View transactions').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('transactions')
    expect(router.currentRoute.value.query.accountId).toBe('acc-checking')
  })
})
