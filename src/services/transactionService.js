import { mockDatabase } from './mockDatabase'

const NETWORK_DELAY_MS = 350

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export const transactionService = {
  /**
   * @param {object} [filters]
   * @param {string} [filters.accountId]
   * @param {string} [filters.category]
   * @param {string} [filters.search] free-text match against description/merchant
   * @param {string} [filters.status] 'posted' | 'pending'
   * @param {string} [filters.dateFrom] 'YYYY-MM-DD', inclusive
   * @param {string} [filters.dateTo] 'YYYY-MM-DD', inclusive
   */
  async getTransactions(filters = {}) {
    await delay()
    let results = clone(mockDatabase.getTransactions())

    if (filters.accountId) {
      results = results.filter((t) => t.accountId === filters.accountId)
    }
    if (filters.category) {
      results = results.filter((t) => t.category === filters.category)
    }
    if (filters.status) {
      results = results.filter((t) => t.status === filters.status)
    }
    if (filters.search) {
      const q = filters.search.trim().toLowerCase()
      results = results.filter(
        (t) => t.description.toLowerCase().includes(q) || t.merchant.toLowerCase().includes(q)
      )
    }
    if (filters.dateFrom) {
      results = results.filter((t) => t.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      results = results.filter((t) => t.date <= `${filters.dateTo}T23:59:59.999Z`)
    }

    return results
  },

  async getTransactionById(transactionId) {
    await delay(200)
    const transaction = mockDatabase.getTransactions().find((t) => t.id === transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} was not found`)
    }
    return clone(transaction)
  }
}
