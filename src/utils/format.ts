const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatSignedCurrency(amount: number): string {
  const formatted = currencyFormatter.format(Math.abs(amount))
  return amount < 0 ? `-${formatted}` : `+${formatted}`
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}

export function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4)
  return `•••• ${last4}`
}
