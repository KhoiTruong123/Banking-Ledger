import { defineStore } from 'pinia'
import { transactionService } from '@/services/transactionService'
import type { Transaction, TransactionFilters } from '@/types'

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface TransactionsState {
  items: Transaction[]
  filters: TransactionFilters
  status: Status
  error: string | null
  selected: Transaction | null
  selectedStatus: Status
  page: number
  pageSize: number
}

export const useTransactionsStore = defineStore('transactions', {
  state: (): TransactionsState => ({
    items: [],
    filters: { accountId: '', category: '', search: '', status: '', dateFrom: '', dateTo: '' },
    status: 'idle',
    error: null,
    selected: null,
    selectedStatus: 'idle',
    page: 1,
    pageSize: 5
  }),

  getters: {
    totalPages(state): number {
      return Math.max(1, Math.ceil(state.items.length / state.pageSize))
    },
    pagedItems(state): Transaction[] {
      const start = (state.page - 1) * state.pageSize
      return state.items.slice(start, start + state.pageSize)
    }
  },

  actions: {
    async fetch(partialFilters: Partial<TransactionFilters> = {}) {
      this.filters = { ...this.filters, ...partialFilters }
      this.status = 'loading'
      this.error = null
      this.page = 1
      try {
        this.items = await transactionService.getTransactions(this.filters)
        this.status = 'ready'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        this.status = 'error'
      }
    },

    setPage(page: number) {
      this.page = Math.min(Math.max(1, page), this.totalPages)
    },

    async selectTransaction(transactionId: string) {
      this.selectedStatus = 'loading'
      try {
        this.selected = await transactionService.getTransactionById(transactionId)
        this.selectedStatus = 'ready'
      } catch {
        this.selectedStatus = 'error'
      }
    },

    clearSelected() {
      this.selected = null
      this.selectedStatus = 'idle'
    },

    // Inserted locally right after a transfer succeeds.
    prependTransactions(...transactions: Transaction[]) {
      this.items.unshift(...transactions)
      this.page = 1
    }
  }
})
