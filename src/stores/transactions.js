import { defineStore } from 'pinia'
import { transactionService } from '@/services/transactionService'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
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
    totalPages(state) {
      return Math.max(1, Math.ceil(state.items.length / state.pageSize))
    },
    pagedItems(state) {
      const start = (state.page - 1) * state.pageSize
      return state.items.slice(start, start + state.pageSize)
    }
  },

  actions: {
    async fetch(partialFilters = {}) {
      this.filters = { ...this.filters, ...partialFilters }
      this.status = 'loading'
      this.error = null
      this.page = 1
      try {
        this.items = await transactionService.getTransactions(this.filters)
        this.status = 'ready'
      } catch (err) {
        this.error = err.message
        this.status = 'error'
      }
    },

    setPage(page) {
      this.page = Math.min(Math.max(1, page), this.totalPages)
    },

    async selectTransaction(transactionId) {
      this.selectedStatus = 'loading'
      try {
        this.selected = await transactionService.getTransactionById(transactionId)
        this.selectedStatus = 'ready'
      } catch (err) {
        this.selectedStatus = 'error'
      }
    },

    clearSelected() {
      this.selected = null
      this.selectedStatus = 'idle'
    },

    // Inserted locally right after a transfer succeeds.
    prependTransactions(...transactions) {
      this.items.unshift(...transactions)
      this.page = 1
    }
  }
})
