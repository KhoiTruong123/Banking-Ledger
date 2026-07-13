import { describe, it, expect, beforeEach, vi } from 'vitest'

// localStorage is not available in the node test environment by default
// under jsdom it is, but we stub it for determinism regardless.
const storage = new Map()
vi.stubGlobal('localStorage', {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k)
})

const { mockDatabase } = await import('@/services/mockDatabase')
const { transferService, TransferError } = await import('@/services/transferService')

describe('transferService', () => {
  beforeEach(() => {
    storage.clear()
    mockDatabase.reset()
  })

  it('moves funds between two active accounts and keeps totals consistent', async () => {
    const before = mockDatabase.getAccounts()
    const from = before.find((a) => a.id === 'acc-checking')
    const to = before.find((a) => a.id === 'acc-savings')
    const totalBefore = from.ledgerBalance + to.ledgerBalance

    const result = await transferService.transfer({
      fromAccountId: 'acc-checking',
      toAccountId: 'acc-savings',
      amount: 250
    })

    expect(result.fromAccount.ledgerBalance).toBeCloseTo(from.ledgerBalance - 250, 2)
    expect(result.toAccount.ledgerBalance).toBeCloseTo(to.ledgerBalance + 250, 2)
    // Conservation of money: nothing created or destroyed.
    expect(result.fromAccount.ledgerBalance + result.toAccount.ledgerBalance).toBeCloseTo(totalBefore, 2)
  })

  it('records a linked debit/credit pair sharing one transferGroupId', async () => {
    const result = await transferService.transfer({
      fromAccountId: 'acc-checking',
      toAccountId: 'acc-travel',
      amount: 100,
      note: 'Trip fund'
    })

    expect(result.debitTransaction.amount).toBe(-100)
    expect(result.creditTransaction.amount).toBe(100)
    expect(result.debitTransaction.transferGroupId).toBe(result.creditTransaction.transferGroupId)
    expect(result.debitTransaction.balanceAfter).toBe(result.fromAccount.ledgerBalance)
    expect(result.creditTransaction.balanceAfter).toBe(result.toAccount.ledgerBalance)

    const persisted = mockDatabase.getTransactions()
    expect(persisted.find((t) => t.id === result.debitTransaction.id)).toBeTruthy()
    expect(persisted.find((t) => t.id === result.creditTransaction.id)).toBeTruthy()
  })

  it('rejects transfers exceeding the available balance and leaves state untouched', async () => {
    const before = JSON.stringify(mockDatabase.getAccounts())

    await expect(
      transferService.transfer({
        fromAccountId: 'acc-travel',
        toAccountId: 'acc-savings',
        amount: 999999
      })
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_FUNDS' })

    expect(JSON.stringify(mockDatabase.getAccounts())).toBe(before)
  })

  it('validates against available balance, not ledger balance, when holds exist', async () => {
    const checking = mockDatabase.getAccountById('acc-checking')
    expect(checking.pendingHoldsTotal).toBeGreaterThan(0)

    // An amount between available and ledger must be rejected.
    const inBetween = checking.availableBalance + 1
    expect(inBetween).toBeLessThanOrEqual(checking.ledgerBalance)

    await expect(
      transferService.transfer({
        fromAccountId: 'acc-checking',
        toAccountId: 'acc-savings',
        amount: inBetween
      })
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_FUNDS' })
  })

  it('rejects non-active accounts on either side', async () => {
    await expect(
      transferService.transfer({
        fromAccountId: 'acc-legacy',
        toAccountId: 'acc-checking',
        amount: 10
      })
    ).rejects.toMatchObject({ code: 'ACCOUNT_NOT_ACTIVE' })

    await expect(
      transferService.transfer({
        fromAccountId: 'acc-checking',
        toAccountId: 'acc-legacy',
        amount: 10
      })
    ).rejects.toMatchObject({ code: 'ACCOUNT_NOT_ACTIVE' })
  })

  it('rejects same-account, zero, and negative transfers', async () => {
    await expect(
      transferService.transfer({ fromAccountId: 'acc-checking', toAccountId: 'acc-checking', amount: 10 })
    ).rejects.toBeInstanceOf(TransferError)

    await expect(
      transferService.transfer({ fromAccountId: 'acc-checking', toAccountId: 'acc-savings', amount: 0 })
    ).rejects.toMatchObject({ code: 'INVALID_AMOUNT' })

    await expect(
      transferService.transfer({ fromAccountId: 'acc-checking', toAccountId: 'acc-savings', amount: -5 })
    ).rejects.toMatchObject({ code: 'INVALID_AMOUNT' })
  })
})
