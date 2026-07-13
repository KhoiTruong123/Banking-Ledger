import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import InsightsView from '@/views/InsightsView.vue'

vi.mock('@/services/transactionService', () => ({
  transactionService: {
    getTransactions: vi.fn().mockResolvedValue([
      { id: 't1', date: '2026-06-05T10:00:00Z', amount: 2400, category: 'Income', merchant: 'Acme Payroll', description: 'Payroll', status: 'posted' },
      { id: 't2', date: '2026-06-08T10:00:00Z', amount: -120, category: 'Groceries', merchant: 'Safeway', description: 'Groceries', status: 'posted' },
      { id: 't3', date: '2026-06-12T10:00:00Z', amount: -80, category: 'Groceries', merchant: 'Safeway', description: 'Groceries', status: 'posted' },
      { id: 't4', date: '2026-06-15T10:00:00Z', amount: -60, category: 'Dining', merchant: 'Chipotle', description: 'Lunch', status: 'posted' }
    ])
  }
}))

const Stub = { template: '<div />' }

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/insights', name: 'insights', component: Stub },
      { path: '/transactions', name: 'transactions', component: Stub }
    ]
  })
  router.push('/insights')
  return router
}

async function mountView() {
  const router = createTestRouter()
  await router.isReady()
  const wrapper = mount(InsightsView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('InsightsView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-20T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a loading state before transactions resolve', async () => {
    const router = createTestRouter()
    await router.isReady()
    const wrapper = mount(InsightsView, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('Crunching your transactions…')
  })

  it('renders spending by category totals excluding income and transfers', async () => {
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Spending by Category')
    expect(wrapper.text()).toContain('Groceries')
    expect(wrapper.text()).toContain('$200.00')
  })

  it('renders the net cash flow for the selected range', async () => {
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Net cash flow')
    expect(wrapper.text()).toContain('+$2,140.00')
  })

  it('lists top merchants ranked by spend', async () => {
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Largest Merchants')
    expect(wrapper.text()).toContain('Safeway')
    expect(wrapper.text()).toContain('Chipotle')
  })
})
