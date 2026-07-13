import { mockDatabase } from './mockDatabase'

const NETWORK_DELAY_MS = 600

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function round2(value) {
  return Math.round(value * 100) / 100
}

export class TransferError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'TransferError'
    this.code = code
  }
}

function assertTransferable(account, role) {
  if (!account) {
    throw new TransferError('ACCOUNT_NOT_FOUND', `${role} account could not be found.`)
  }
  if (account.status !== 'active') {
    throw new TransferError(
      'ACCOUNT_NOT_ACTIVE',
      `${account.nickname} is ${account.status} and can't be used in a transfer.`
    )
  }
}

/**
 * Promise-based transfer contract. Every validation rule that would matter
 * against a real backend is enforced here, server-side of the UI boundary,
 * so the client never has to be trusted to get it right.
 */
export const transferService = {
  async transfer({ fromAccountId, toAccountId, amount, note = '' }) {
    await delay()

    if (fromAccountId === toAccountId) {
      throw new TransferError('SAME_ACCOUNT', 'Choose two different accounts to transfer between.')
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new TransferError('INVALID_AMOUNT', 'Enter an amount greater than zero.')
    }

    const fromAccount = mockDatabase.getAccountById(fromAccountId)
    const toAccount = mockDatabase.getAccountById(toAccountId)
    assertTransferable(fromAccount, 'Source')
    assertTransferable(toAccount, 'Destination')

    if (round2(amount) > fromAccount.availableBalance) {
      throw new TransferError(
        'INSUFFICIENT_FUNDS',
        `${fromAccount.nickname} only has ${fromAccount.availableBalance.toFixed(2)} available.`
      )
    }

    const timestamp = new Date().toISOString()
    const transferGroupId = `xfer-${Date.now()}`
    const newFromLedger = round2(fromAccount.ledgerBalance - amount)
    const newToLedger = round2(toAccount.ledgerBalance + amount)

    const updatedFromAccount = {
      ...fromAccount,
      ledgerBalance: newFromLedger,
      availableBalance: round2(newFromLedger - fromAccount.pendingHoldsTotal)
    }
    const updatedToAccount = {
      ...toAccount,
      ledgerBalance: newToLedger,
      availableBalance: round2(newToLedger - toAccount.pendingHoldsTotal)
    }

    const debitTransaction = {
      id: `${transferGroupId}-debit`,
      accountId: fromAccountId,
      date: timestamp,
      description: note ? `Transfer to ${toAccount.nickname} — ${note}` : `Transfer to ${toAccount.nickname}`,
      merchant: 'Internal transfer',
      category: 'Transfer',
      amount: round2(-amount),
      status: 'posted',
      balanceAfter: newFromLedger,
      transferGroupId
    }

    const creditTransaction = {
      id: `${transferGroupId}-credit`,
      accountId: toAccountId,
      date: timestamp,
      description: note ? `Transfer from ${fromAccount.nickname} — ${note}` : `Transfer from ${fromAccount.nickname}`,
      merchant: 'Internal transfer',
      category: 'Transfer',
      amount: round2(amount),
      status: 'posted',
      balanceAfter: newToLedger,
      transferGroupId
    }

    mockDatabase.commitTransfer({
      fromAccount: updatedFromAccount,
      toAccount: updatedToAccount,
      debitTransaction,
      creditTransaction
    })

    return clone({
      fromAccount: updatedFromAccount,
      toAccount: updatedToAccount,
      debitTransaction,
      creditTransaction
    })
  }
}
