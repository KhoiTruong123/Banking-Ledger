import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAccountsStore } from '@/stores/accounts'

const Stub = { template: '<div />' }

function createTestRouter(initialPath = '/accounts') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/accounts', name: 'accounts', component: Stub },
      { path: '/transactions', name: 'transactions', component: Stub },
      { path: '/transfer', name: 'transfer', component: Stub },
      { path: '/insights', name: 'insights', component: Stub }
    ]
  })
  router.push(initialPath)
  return router
}

async function mountSidebar(initialPath = '/accounts') {
  setActivePinia(createPinia())
  const accountsStore = useAccountsStore()
  accountsStore.customer = { name: 'Jane Doe' }
  const router = createTestRouter(initialPath)
  await router.isReady()
  const wrapper = mount(AppSidebar, { global: { plugins: [router] } })
  return { wrapper, router, accountsStore }
}

describe('AppSidebar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the brand, customer name, and nav items', async () => {
    const { wrapper } = await mountSidebar()

    expect(wrapper.text()).toContain('Ledger')
    expect(wrapper.text()).toContain('Jane Doe')
    expect(wrapper.text()).toContain('Accounts')
    expect(wrapper.text()).toContain('Transactions')
    expect(wrapper.text()).toContain('Transfer')
    expect(wrapper.text()).toContain('Insights')
  })

  it('highlights the nav link matching the current route', async () => {
    const { wrapper } = await mountSidebar('/transactions')

    const links = wrapper.findAll('a')
    const transactionsLink = links.find((l) => l.text() === 'Transactions')
    const accountsLink = links.find((l) => l.text() === 'Accounts')

    expect(transactionsLink.classes()).toContain('text-teal')
    expect(accountsLink.classes()).not.toContain('text-teal')
  })

  it('toggles the mobile menu button label and expanded state', async () => {
    const { wrapper } = await mountSidebar()
    const menuButton = wrapper.find('button[aria-label="Toggle menu"]')

    expect(menuButton.attributes('aria-expanded')).toBe('false')

    await menuButton.trigger('click')

    expect(menuButton.attributes('aria-expanded')).toBe('true')
  })

  it('includes a dark mode toggle button', async () => {
    const { wrapper } = await mountSidebar()

    expect(wrapper.find('button[aria-label="Toggle dark mode"]').exists()).toBe(true)
  })
})
