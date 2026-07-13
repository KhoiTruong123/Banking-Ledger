// Deterministic pseudo-random generator so the demo data is stable across reloads
// (still regenerates relative to "today" so the app always feels current).
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260709)

function randomInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min
}

function randomAmount(min, max) {
  return Math.round((rand() * (max - min) + min) * 100) / 100
}

function pick(list) {
  return list[Math.floor(rand() * list.length)]
}

function isoDaysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(randomInt(7, 20), randomInt(0, 59), 0, 0)
  return d.toISOString()
}

const EXPENSE_CATALOG = [
  { category: 'Groceries', merchants: ["Trader Joe's", 'Whole Foods Market', 'Safeway'], min: 18, max: 130 },
  { category: 'Dining', merchants: ['Blue Bottle Coffee', 'Chipotle', 'The Local Bistro', 'Corner Deli'], min: 6, max: 68 },
  { category: 'Transport', merchants: ['Uber', 'Shell Gas Station', 'Metro Transit'], min: 8, max: 72 },
  { category: 'Utilities', merchants: ['City Power & Water', 'Comcast Internet', 'Verizon Wireless'], min: 42, max: 185 },
  { category: 'Shopping', merchants: ['Amazon', 'Target', 'Best Buy'], min: 14, max: 225 },
  { category: 'Entertainment', merchants: ['Netflix', 'Spotify', 'AMC Theatres'], min: 9, max: 46 },
  { category: 'Health', merchants: ['CVS Pharmacy', 'City Health Clinic'], min: 12, max: 150 }
]

let txnCounter = 0
function nextId() {
  txnCounter += 1
  return `txn-${String(txnCounter).padStart(4, '0')}`
}

// Builds the posted-transaction spec list for an account, then walks it
// chronologically so every entry gets a correct running `balanceAfter`,
// ending exactly at `targetBalance`.
function buildLedger(accountId, targetBalance, specs) {
  const sorted = [...specs].sort((a, b) => b.daysAgo - a.daysAgo) // oldest first
  const total = sorted.reduce((sum, s) => sum + s.amount, 0)
  let running = targetBalance - total
  const transactions = sorted.map((s) => {
    running = Math.round((running + s.amount) * 100) / 100
    return {
      id: nextId(),
      accountId,
      date: isoDaysAgo(s.daysAgo),
      description: s.description,
      merchant: s.merchant,
      category: s.category,
      amount: s.amount,
      status: 'posted',
      balanceAfter: running,
      transferGroupId: s.transferGroupId ?? null
    }
  })
  return transactions
}

function buildPending(accountId, specs) {
  return specs.map((s) => ({
    id: nextId(),
    accountId,
    date: isoDaysAgo(s.daysAgo),
    description: s.description,
    merchant: s.merchant,
    category: s.category,
    amount: s.amount,
    status: 'pending',
    balanceAfter: null,
    transferGroupId: null
  }))
}

function checkingSpecs() {
  const specs = []
  for (let i = 0; i < 7; i += 1) {
    specs.push({
      daysAgo: 3 + i * 14,
      amount: 2400,
      category: 'Income',
      merchant: 'Acme Corp Payroll',
      description: 'Payroll deposit'
    })
  }
  for (let i = 0; i < 32; i += 1) {
    const entry = pick(EXPENSE_CATALOG)
    specs.push({
      daysAgo: randomInt(1, 89),
      amount: -randomAmount(entry.min, entry.max),
      category: entry.category,
      merchant: pick(entry.merchants),
      description: pick(entry.merchants)
    })
  }
  ;[2, 32, 62].forEach((daysAgo) => {
    specs.push({
      daysAgo,
      amount: -12,
      category: 'Fees',
      merchant: 'Ledger Bank',
      description: 'Monthly maintenance fee'
    })
  })
  ;[
    { daysAgo: 20, amount: -500, to: 'High-Yield Savings' },
    { daysAgo: 48, amount: -150, to: 'Travel Fund' }
  ].forEach((t) => {
    specs.push({
      daysAgo: t.daysAgo,
      amount: t.amount,
      category: 'Transfer',
      merchant: 'Internal transfer',
      description: `Transfer to ${t.to}`,
      transferGroupId: `seed-${t.daysAgo}`
    })
  })
  return specs
}

function savingsSpecs() {
  const specs = []
  ;[5, 35, 65].forEach((daysAgo) => {
    specs.push({
      daysAgo,
      amount: randomAmount(15, 22),
      category: 'Income',
      merchant: 'Ledger Bank',
      description: 'Interest payment'
    })
  })
  specs.push({
    daysAgo: 20,
    amount: 500,
    category: 'Transfer',
    merchant: 'Internal transfer',
    description: 'Transfer from Primary Checking',
    transferGroupId: 'seed-20'
  })
  return specs
}

function travelSpecs() {
  const specs = [
    {
      daysAgo: 48,
      amount: 150,
      category: 'Transfer',
      merchant: 'Internal transfer',
      description: 'Transfer from Primary Checking',
      transferGroupId: 'seed-48'
    }
  ]
  ;[70, 25].forEach((daysAgo) => {
    specs.push({
      daysAgo,
      amount: randomAmount(50, 120),
      category: 'Transfer',
      merchant: 'Internal transfer',
      description: 'Manual savings top-up'
    })
  })
  return specs
}

function legacySpecs() {
  return [
    {
      daysAgo: 410,
      amount: -25,
      category: 'Fees',
      merchant: 'Ledger Bank',
      description: 'Account inactivity fee'
    },
    {
      daysAgo: 430,
      amount: 325,
      category: 'Income',
      merchant: 'Ledger Bank',
      description: 'Closing legacy promotion credit'
    }
  ]
}

export function generateSeedData() {
  txnCounter = 0

  const customer = {
    id: 'cust-001',
    name: 'Jordan Lee',
    email: 'jordan.lee@example.com'
  }

  const accountDefs = [
    { id: 'acc-checking', accountNumber: '4471820156', nickname: 'Primary Checking', type: 'checking', status: 'active', targetBalance: 4250.75 },
    { id: 'acc-savings', accountNumber: '5583910442', nickname: 'High-Yield Savings', type: 'savings', status: 'active', targetBalance: 12800.0 },
    { id: 'acc-travel', accountNumber: '5583910775', nickname: 'Travel Fund', type: 'savings', status: 'active', targetBalance: 1200.5 },
    { id: 'acc-legacy', accountNumber: '3390004411', nickname: 'Legacy Checking', type: 'checking', status: 'frozen', targetBalance: 300.0 }
  ]

  const transactions = []

  transactions.push(...buildLedger('acc-checking', 4250.75, checkingSpecs()))
  transactions.push(...buildLedger('acc-savings', 12800.0, savingsSpecs()))
  transactions.push(...buildLedger('acc-travel', 1200.5, travelSpecs()))
  transactions.push(...buildLedger('acc-legacy', 300.0, legacySpecs()))

  const pending = buildPending('acc-checking', [
    { daysAgo: 0, amount: -84.2, category: 'Dining', merchant: 'The Local Bistro', description: 'Pending — card authorization' },
    { daysAgo: 1, amount: -180, category: 'Shopping', merchant: 'Hotel Ridgeline', description: 'Pending — hotel hold' }
  ])
  transactions.push(...pending)

  const accounts = accountDefs.map((def) => {
    const pendingHoldsTotal = pending
      .filter((p) => p.accountId === def.id && p.amount < 0)
      .reduce((sum, p) => sum + Math.abs(p.amount), 0)
    return {
      ...def,
      currency: 'USD',
      ledgerBalance: def.targetBalance,
      pendingHoldsTotal: Math.round(pendingHoldsTotal * 100) / 100,
      availableBalance: Math.round((def.targetBalance - pendingHoldsTotal) * 100) / 100
    }
  })

  transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  return { customer, accounts, transactions }
}
