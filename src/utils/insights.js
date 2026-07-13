function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function postedOnly(transactions) {
  return transactions.filter((t) => t.status === 'posted')
}

/**
 * Groups expense transactions (negative amounts, excluding internal
 * transfers) by category and returns them sorted largest-first.
 */
export function spendingByCategory(transactions) {
  const totals = new Map()
  for (const t of postedOnly(transactions)) {
    if (t.amount >= 0 || t.category === 'Transfer') continue
    totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount))
  }
  const grand = [...totals.values()].reduce((a, b) => a + b, 0)
  return [...totals.entries()]
    .map(([category, total]) => ({
      category,
      total: Math.round(total * 100) / 100,
      percent: grand > 0 ? Math.round((total / grand) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Income vs. expense per month, oldest to newest, for the last `months`
 * distinct calendar months present in the data.
 */
export function incomeVsExpense(transactions, months = 6) {
  const byMonth = new Map()
  for (const t of postedOnly(transactions)) {
    if (t.category === 'Transfer') continue
    const key = monthKey(t.date)
    if (!byMonth.has(key)) byMonth.set(key, { month: key, income: 0, expense: 0 })
    const bucket = byMonth.get(key)
    if (t.amount > 0) bucket.income += t.amount
    else bucket.expense += Math.abs(t.amount)
  }
  return [...byMonth.values()]
    .sort((a, b) => (a.month < b.month ? -1 : 1))
    .slice(-months)
    .map((b) => ({
      ...b,
      income: Math.round(b.income * 100) / 100,
      expense: Math.round(b.expense * 100) / 100,
      net: Math.round((b.income - b.expense) * 100) / 100
    }))
}

/**
 * Largest merchants by total spend (expenses only, transfers excluded).
 */
export function topMerchants(transactions, limit = 5) {
  const totals = new Map()
  for (const t of postedOnly(transactions)) {
    if (t.amount >= 0 || t.category === 'Transfer') continue
    if (!totals.has(t.merchant)) totals.set(t.merchant, { merchant: t.merchant, category: t.category, total: 0, count: 0 })
    const bucket = totals.get(t.merchant)
    bucket.total += Math.abs(t.amount)
    bucket.count += 1
  }
  return [...totals.values()]
    .map((b) => ({ ...b, total: Math.round(b.total * 100) / 100 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}
