import { mockDatabase } from './mockDatabase'
import type { Account, Customer } from '@/types'

const NETWORK_DELAY_MS = 400

function delay(ms = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Async, Promise-based contract mirroring what a real `GET /accounts`
 * endpoint would return. Swapping this file's internals for real HTTP
 * calls should require no changes in the Pinia store that consumes it.
 */
export const accountService = {
  async getAccounts(): Promise<Account[]> {
    await delay()
    return clone(mockDatabase.getAccounts())
  },

  async getAccountById(accountId: string): Promise<Account> {
    await delay(200)
    const account = mockDatabase.getAccountById(accountId)
    if (!account) {
      throw new Error(`Account ${accountId} was not found`)
    }
    return clone(account)
  },

  async getCustomer(): Promise<Customer> {
    await delay(150)
    return clone(mockDatabase.getCustomer())
  }
}
