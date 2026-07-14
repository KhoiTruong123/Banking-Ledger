import { defineStore } from 'pinia'
import { transferService } from '@/services/transferService'
import type { TransferInput } from '@/services/transferService'
import { useAccountsStore } from './accounts'
import { useTransactionsStore } from './transactions'
import { useUiStore } from './ui'
import { formatCurrency } from '@/utils/format'
import type { TransferResult } from '@/types'

interface TransferState {
  submitting: boolean
  error: string | null
  lastResult: TransferResult | null
}

export const useTransferStore = defineStore('transfer', {
  state: (): TransferState => ({
    submitting: false,
    error: null,
    lastResult: null
  }),

  actions: {
    async submit({ fromAccountId, toAccountId, amount, note }: TransferInput) {
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
        const message = err instanceof Error ? err.message : String(err)
        this.error = message
        uiStore.pushToast('error', message)
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
