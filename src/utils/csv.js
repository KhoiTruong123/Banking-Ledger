import { formatDate } from '@/utils/format'

function escapeCsvField(value) {
  const str = String(value ?? '')
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function exportTransactionsToCsv(transactions, filename = 'transactions.csv') {
  const header = ['Description', 'Date', 'Merchant', 'Category', 'Status', 'Amount']
  const rows = transactions.map((t) => [
    t.description,
    formatDate(t.date),
    t.merchant,
    t.category,
    t.status,
    t.amount
  ])

  const csv = [header, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
