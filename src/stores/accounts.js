import { defineStore } from 'pinia'
import { accountService } from '@/services/accountService'

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    customer: null,
    accounts: [],
    status: 'idle', // idle | loading | ready | error
    error: null
  }),

  getters: {
    totalAvailableBalance(state) {
      return state.accounts
        .filter((a) => a.status === 'active')
        .reduce((sum, a) => sum + a.availableBalance, 0)
    },
    transferableAccounts(state) {
      return state.accounts.filter((a) => a.status === 'active')
    },
    getAccountById(state) {
      return (id) => state.accounts.find((a) => a.id === id) ?? null
    }
  },

  actions: {
    async fetchAll() {
      this.status = 'loading'
      this.error = null
      try {
        const [customer, accounts] = await Promise.all([
          accountService.getCustomer(),
          accountService.getAccounts()
        ])
        this.customer = customer
        this.accounts = accounts
        this.status = 'ready'
      } catch (err) {
        this.error = err.message
        this.status = 'error'
      }
    },

    // Applied locally right after a transfer succeeds, so both account
    // balances update in the UI without a full refetch.
    applyTransferResult({ fromAccount, toAccount }) {
      const fromIndex = this.accounts.findIndex((a) => a.id === fromAccount.id)
      const toIndex = this.accounts.findIndex((a) => a.id === toAccount.id)
      if (fromIndex !== -1) this.accounts[fromIndex] = fromAccount
      if (toIndex !== -1) this.accounts[toIndex] = toAccount
    }
  }
})
