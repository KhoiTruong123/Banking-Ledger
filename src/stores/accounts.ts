import { defineStore } from 'pinia'
import { accountService } from '@/services/accountService'
import type { Account, Customer } from '@/types'

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface AccountsState {
  customer: Customer | null
  accounts: Account[]
  status: Status
  error: string | null
}

export const useAccountsStore = defineStore('accounts', {
  state: (): AccountsState => ({
    customer: null,
    accounts: [],
    status: 'idle',
    error: null
  }),

  getters: {
    totalAvailableBalance(state): number {
      return state.accounts
        .filter((a) => a.status === 'active')
        .reduce((sum, a) => sum + a.availableBalance, 0)
    },
    transferableAccounts(state): Account[] {
      return state.accounts.filter((a) => a.status === 'active')
    },
    getAccountById(state) {
      return (id: string): Account | null => state.accounts.find((a) => a.id === id) ?? null
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
        this.error = err instanceof Error ? err.message : String(err)
        this.status = 'error'
      }
    },

    // Applied locally right after a transfer succeeds, so both account
    // balances update in the UI without a full refetch.
    applyTransferResult({ fromAccount, toAccount }: { fromAccount: Account; toAccount: Account }) {
      const fromIndex = this.accounts.findIndex((a) => a.id === fromAccount.id)
      const toIndex = this.accounts.findIndex((a) => a.id === toAccount.id)
      if (fromIndex !== -1) this.accounts[fromIndex] = fromAccount
      if (toIndex !== -1) this.accounts[toIndex] = toAccount
    }
  }
})
