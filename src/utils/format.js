const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export function formatCurrency(amount) {
  return currencyFormatter.format(amount)
}

export function formatSignedCurrency(amount) {
  const formatted = currencyFormatter.format(Math.abs(amount))
  return amount < 0 ? `-${formatted}` : `+${formatted}`
}

export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}

export function maskAccountNumber(accountNumber) {
  const last4 = accountNumber.slice(-4)
  return `•••• ${last4}`
}
