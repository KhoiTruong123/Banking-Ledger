import { describe, it, expect } from 'vitest'
import { spendingByCategory, incomeVsExpense, topMerchants } from '@/utils/insights'

const fixture = [
  { date: '2026-06-05T10:00:00Z', amount: 2400, category: 'Income', merchant: 'Acme Payroll', status: 'posted' },
  { date: '2026-06-08T10:00:00Z', amount: -120, category: 'Groceries', merchant: 'Safeway', status: 'posted' },
  { date: '2026-06-12T10:00:00Z', amount: -80, category: 'Groceries', merchant: 'Safeway', status: 'posted' },
  { date: '2026-06-15T10:00:00Z', amount: -60, category: 'Dining', merchant: 'Chipotle', status: 'posted' },
  { date: '2026-06-20T10:00:00Z', amount: -500, category: 'Transfer', merchant: 'Internal transfer', status: 'posted' },
  { date: '2026-06-20T10:00:00Z', amount: 500, category: 'Transfer', merchant: 'Internal transfer', status: 'posted' },
  { date: '2026-07-02T10:00:00Z', amount: -40, category: 'Dining', merchant: 'Chipotle', status: 'posted' },
  { date: '2026-07-03T10:00:00Z', amount: -99, category: 'Shopping', merchant: 'Amazon', status: 'pending' }
]

describe('spendingByCategory', () => {
  it('sums expenses per category, excluding transfers, income, and pending items', () => {
    const result = spendingByCategory(fixture)
    const byName = Object.fromEntries(result.map((r) => [r.category, r]))

    expect(byName.Groceries.total).toBe(200)
    expect(byName.Dining.total).toBe(100)
    expect(byName.Transfer).toBeUndefined()
    expect(byName.Income).toBeUndefined()
    expect(byName.Shopping).toBeUndefined() // pending
  })

  it('sorts largest category first and computes percentages against total spend', () => {
    const result = spendingByCategory(fixture)
    expect(result[0].category).toBe('Groceries')
    expect(result[0].percent).toBeCloseTo(66.7, 1)
  })
})

describe('incomeVsExpense', () => {
  it('buckets by calendar month and excludes internal transfers from both sides', () => {
    const result = incomeVsExpense(fixture)
    const june = result.find((m) => m.month === '2026-06')
    const july = result.find((m) => m.month === '2026-07')

    expect(june.income).toBe(2400)
    expect(june.expense).toBe(260)
    expect(june.net).toBe(2140)
    expect(july.expense).toBe(40)
  })
})

describe('topMerchants', () => {
  it('ranks merchants by total spend with visit counts', () => {
    const result = topMerchants(fixture)
    expect(result[0]).toMatchObject({ merchant: 'Safeway', total: 200, count: 2 })
    expect(result[1]).toMatchObject({ merchant: 'Chipotle', total: 100, count: 2 })
    expect(result.find((m) => m.merchant === 'Internal transfer')).toBeUndefined()
  })
})
