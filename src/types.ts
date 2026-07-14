import type { CATEGORIES } from '@/utils/constants'

export type Category = (typeof CATEGORIES)[number]

export type AccountType = 'checking' | 'savings'
export type AccountStatus = 'active' | 'frozen' | 'closed'
export type TransactionStatus = 'posted' | 'pending'

export interface Customer {
  id: string
  name: string
  email: string
}

export interface Account {
  id: string
  accountNumber: string
  nickname: string
  type: AccountType
  status: AccountStatus
  currency: string
  ledgerBalance: number
  pendingHoldsTotal: number
  availableBalance: number
}

export interface Transaction {
  id: string
  accountId: string
  date: string
  description: string
  merchant: string
  category: Category
  amount: number
  status: TransactionStatus
  balanceAfter: number | null
  transferGroupId: string | null
}

export interface TransactionFilters {
  accountId: string
  category: string
  search: string
  status: string
  dateFrom: string
  dateTo: string
}

export interface TransferResult {
  fromAccount: Account
  toAccount: Account
  debitTransaction: Transaction
  creditTransaction: Transaction
}

export interface CategoryTotal {
  category: Category
  total: number
  percent: number
}

export interface MonthlyFlow {
  month: string
  income: number
  expense: number
  net: number
}

export interface MerchantTotal {
  merchant: string
  category: Category
  total: number
  count: number
}
