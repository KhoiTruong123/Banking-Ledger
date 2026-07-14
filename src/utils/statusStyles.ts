import type { TransactionStatus } from '@/types'

export function transactionStatusClasses(status: TransactionStatus): string {
  return status === 'pending' ? 'bg-teal-wash text-teal-dark' : 'bg-primary-wash text-primary'
}
