import { defineStore } from 'pinia'
import { transferService } from '@/services/transferService'
import { useAccountsStore } from './accounts'
import { useTransactionsStore } from './transactions'
import { useUiStore } from './ui'
import { formatCurrency } from '@/utils/format'

export const useTransferStore = defineStore('transfer', {
  state: () => ({
    submitting: false,
    error: null,
    lastResult: null
  }),

  actions: {
    async submit({ fromAccountId, toAccountId, amount, note }) {
      this.submitting = true
      this.error = null
      this.lastResult = null

      const accountsStore = useAccountsStore()
      const transactionsStore = useTransactionsStore()
      const uiStore = useUiStore()

      try {
        // No optimistic update here on purpose: balances and the
        // transaction list only change once the service confirms success.
        const result = await transferService.transfer({ fromAccountId, toAccountId, amount, note })
        accountsStore.applyTransferResult(result)
        transactionsStore.prependTransactions(result.creditTransaction, result.debitTransaction)
        this.lastResult = result
        uiStore.pushToast('success', `Transfer of ${formatCurrency(amount)} complete.`)
        return result
      } catch (err) {
        this.error = err.message
        uiStore.pushToast('error', err.message)
        throw err
      } finally {
        this.submitting = false
      }
    },

    reset() {
      this.error = null
      this.lastResult = null
    }
  }
})
