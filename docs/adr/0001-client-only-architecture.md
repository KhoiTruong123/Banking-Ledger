# ADR-0001 — Client-only architecture with a swappable mock data layer

**Status:** Accepted

## Context

The brief requires a working banking demo with realistic handling of account
data, transactions, transfers, and state updates. A backend API, auth service,
and database are listed as *nice to have*. The primary evaluation criteria are
a working solution, easy local setup, and sound architectural reasoning — not
production infrastructure. The demo must be runnable by a reviewer in a couple
of minutes.

## Alternatives considered

1. **Full stack: Vue SPA + Node/Express API + MySQL.** Most realistic; the
   transfer transaction could use real row locks and `COMMIT`/`ROLLBACK`.
   Cost: three processes to install and run, database provisioning, seed
   scripts, and connection configuration — significant setup friction for a
   reviewer, and most of the added code (Express boilerplate, ORM wiring)
   demonstrates nothing about the problem domain.
2. **Vue SPA + standalone mock server (json-server / MSW).** Real HTTP over
   the wire, so the network tab shows genuine requests. Cost: a second process
   (json-server) or service-worker configuration (MSW); json-server also can't
   express the transfer's multi-row atomic update without custom middleware,
   which recreates the backend problem anyway.
3. **Vue SPA with an internal mock data layer (chosen).** All data lives in
   the browser: a deterministic seed generator, an in-memory store persisted
   to `localStorage`, and Promise-based service modules that simulate latency
   and mirror the shape of a real HTTP client.

## Decision

Option 3 — client-only, with two deliberate mitigations for its weaknesses:

- **The service layer is the swap point.** `accountService`,
  `transactionService`, and `transferService` expose async functions with the
  same signatures a `fetch`-based client would have. Stores and components
  never touch the mock database directly, so replacing the internals with real
  HTTP calls requires no changes above the service layer.
- **The relational model is still designed.** `docs/schema.sql` documents the
  MySQL schema the mock simulates, including the transfer transaction
  semantics (`SELECT ... FOR UPDATE`, two balance updates, two ledger inserts,
  commit-or-rollback), satisfying the database-schema deliverable without
  requiring a database to run the demo.

## Consequences

- ✅ `npm install && npm run dev` is the entire setup; no ports, processes, or
  credentials to manage.
- ✅ Transfer atomicity is enforced in one place (`transferService` +
  `mockDatabase.commitTransfer`) and covered by unit tests.
- ✅ Data survives refresh via `localStorage`, so the demo feels stateful.
- ❌ No real network traffic — HTTP error handling (timeouts, 5xx) is
  simulated only by thrown errors, not exercised for real.
- ❌ Business rules run in the browser, which would be unacceptable in
  production; this is acceptable here only because the "server side" boundary
  is clearly drawn at the service layer and documented in ADR-0004.
- ❌ `localStorage` is per-browser and unversioned beyond a key suffix
  (`-v1`); schema changes to seed data require bumping the key.
