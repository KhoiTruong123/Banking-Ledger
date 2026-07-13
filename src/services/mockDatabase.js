import { generateSeedData } from '@/data/seedData'

const STORAGE_KEY = 'ledger-mock-db-v1'

let state = null

function load() {
  if (state) return state

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      state = JSON.parse(raw)
      return state
    }
  } catch (err) {
    console.warn('Could not read mock database from localStorage, reseeding.', err)
  }

  state = generateSeedData()
  persist()
  return state
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Could not persist mock database to localStorage.', err)
  }
}

export const mockDatabase = {
  getCustomer() {
    return load().customer
  },
  getAccounts() {
    return load().accounts
  },
  getAccountById(accountId) {
    return load().accounts.find((a) => a.id === accountId) ?? null
  },
  getTransactions() {
    return load().transactions
  },
  /**
   * Applies a fund transfer atomically against the in-memory ledger.
   * Either both accounts and both transaction records are written, or
   * nothing is (the caller is expected to have already validated the
   * request — see transferService for the actual business rules).
   */
  commitTransfer({ fromAccount, toAccount, debitTransaction, creditTransaction }) {
    const db = load()
    const fromIndex = db.accounts.findIndex((a) => a.id === fromAccount.id)
    const toIndex = db.accounts.findIndex((a) => a.id === toAccount.id)
    if (fromIndex === -1 || toIndex === -1) {
      throw new Error('Account not found while committing transfer')
    }

    db.accounts[fromIndex] = fromAccount
    db.accounts[toIndex] = toAccount
    db.transactions.unshift(creditTransaction, debitTransaction)
    persist()
  },
  reset() {
    state = generateSeedData()
    persist()
    return state
  }
}
