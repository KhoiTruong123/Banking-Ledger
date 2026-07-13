import { mockDatabase } from './mockDatabase'

const NETWORK_DELAY_MS = 400

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Async, Promise-based contract mirroring what a real `GET /accounts`
 * endpoint would return. Swapping this file's internals for real HTTP
 * calls should require no changes in the Pinia store that consumes it.
 */
export const accountService = {
  async getAccounts() {
    await delay()
    return clone(mockDatabase.getAccounts())
  },

  async getAccountById(accountId) {
    await delay(200)
    const account = mockDatabase.getAccountById(accountId)
    if (!account) {
      throw new Error(`Account ${accountId} was not found`)
    }
    return clone(account)
  },

  async getCustomer() {
    await delay(150)
    return clone(mockDatabase.getCustomer())
  }
}
