# Ledger — personal banking demo (Vue 3)

A single-page personal banking application built with Vue 3 and Tailwind CSS v3. It covers the four
functional areas of the brief — account overview, transaction management, fund
transfer simulation, and spending insights — on top of a client-side mock data
layer that behaves like a real REST backend.

## Quick start

Requires Node.js 18+.

```bash
npm install
npm run dev        # open the printed localhost URL
```

Other scripts:

```bash
npm run test       # run unit tests (Vitest)
npm run build      # production build
npm run preview    # serve the production build locally
```

No backend, database, or environment variables are needed. Mock data is
generated on first load and persisted to `localStorage`, so balances and
transfers survive a page refresh. To reset the demo data, clear the
`ledger-mock-db-v1` key in localStorage (or run
`localStorage.removeItem('ledger-mock-db-v1')` in the browser console and
refresh).

## Features

**Accounts** — every account of the demo customer with masked account number,
type, status pill (active / frozen / closed), and available balance. When a
pending hold exists, the card shows the ledger balance and the amount on hold,
because `available = ledger − pending holds`.

**Transactions** — a searchable register across all accounts. Filter by
account, category, or posted/pending status; free-text search matches
description and merchant (debounced). Clicking a row opens a detail panel with
the running balance after the entry and, for transfers, a note that a linked
debit/credit exists on the other account.

**Transfer** — moves funds between the customer's own active accounts. Client-
side validation gives instant field-level feedback; the service layer then
re-validates everything (active status on both sides, amount vs. *available*
balance, distinct accounts) before committing. A successful transfer updates
both balances atomically, writes a linked debit + credit pair sharing one
`transferGroupId`, and shows a receipt plus a toast. Failures change nothing.

**Insights** — derived from posted activity only, with internal transfers
excluded so moving your own money never counts as spending: net cash flow for
the current month, spending by category, income vs. expenses for the last six
months, and largest merchants by total spend.

## Architecture

Full component diagrams, communication flows, and the transfer sequence live
in [docs/architecture.md](docs/architecture.md). Summary:

```
Views / components  →  Pinia stores  →  data services (async contract)  →  mock DB (in-memory + localStorage)
```

- `src/services/*` expose Promise-based functions with simulated latency —
  the exact shape a real HTTP client would have. Swapping the mock internals
  for `fetch` calls requires no changes above this layer.
- `src/stores/*` (Pinia) hold accounts, transactions, transfer status, and UI
  toasts. The transfer store applies a **pessimistic update**: state changes
  only after the service confirms success.
- `src/utils/insights.js` contains pure, unit-tested derivation functions.
- `docs/schema.sql` documents the relational schema the mock layer simulates
  (MySQL 8 DDL with the transfer transaction semantics spelled out). The app
  does not require it to run.

## Project structure

```
src/
  assets/         Tailwind directives + shared component classes (@layer)
  components/     layout, accounts, transactions, transfer building blocks
  data/           deterministic seed data generator
  router/         Vue Router setup
  services/       async API contract + mock database (swap point for a real API)
  stores/         Pinia stores (accounts, transactions, transfer, ui)
  utils/          formatting, insight derivations, constants
  views/          one component per route
tests/            Vitest unit tests (transfer rules, insights)
docs/
  schema.sql      reference database schema
  adr/            architecture decision records
```

## Architecture Decision Records

Critical design choices, each with context, alternatives, decision, and
consequences:

1. [ADR-0001 — Client-only architecture with a swappable mock data layer](docs/adr/0001-client-only-architecture.md)
2. [ADR-0002 — Pinia for state management](docs/adr/0002-state-management-pinia.md)
3. [ADR-0003 — Promise-based service contract with pessimistic updates](docs/adr/0003-api-integration-pessimistic-updates.md)
4. [ADR-0004 — Security posture and assumptions](docs/adr/0004-security-considerations.md)

## Testing

Unit tests focus on the two places where correctness matters most:

- `tests/transferService.test.js` — money conservation, linked debit/credit
  pairs, insufficient-funds and frozen-account rejection, validation against
  *available* (not ledger) balance, and that failed transfers leave state
  untouched.
- `tests/insights.test.js` — category totals, monthly income/expense
  bucketing, merchant ranking, and the exclusion of transfers and pending
  items from spending figures.

## Known limitations (deliberate scope cuts)

- Single hard-coded customer; no authentication (see ADR-0004).
- No pagination on the transaction register (dataset is small by design).
- Currency is fixed to USD.
- Pending transactions never "post" — they exist to demonstrate the
  available-vs-ledger balance distinction.
