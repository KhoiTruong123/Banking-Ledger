# ADR-0003 — Promise-based service contract with pessimistic updates

**Status:** Accepted

## Context

The UI needs a data-fetching strategy that (a) behaves like a real API today
despite being mock-backed, (b) survives the swap to a real backend untouched,
and (c) handles the one write operation — fund transfer — in a way that can
never display balances that disagree with the ledger.

## Alternatives considered

### Contract shape

1. **Components import the mock database directly.** Simplest, but couples
   every view to the mock and makes the later backend swap a rewrite.
2. **A generic repository/DAO abstraction with interchangeable adapters.**
   Over-engineered for one data source; interfaces without a second
   implementation are speculation.
3. **Plain async service modules per domain (chosen).** Each function returns
   a Promise, simulates 150–600 ms latency, deep-clones its results (so
   callers can never mutate the "database" by reference — the same isolation
   JSON over HTTP gives), and throws typed errors (`TransferError` with a
   machine-readable `code`). This is exactly the surface an axios/fetch
   client would expose.

### Write strategy for transfers

1. **Optimistic update:** mutate balances immediately, roll back on failure.
   Best perceived latency, but rollback of a two-account money movement is
   the highest-risk code in the app — a bug shows the user wrong balances,
   the worst failure mode a banking UI can have.
2. **Refetch everything after success:** simple and always consistent, but
   wasteful, and it still leaves a window where the UI shows stale data.
3. **Pessimistic update with server-returned state (chosen):** the UI waits
   for the service to confirm, then applies the *returned* accounts and
   transactions — not locally recomputed ones — to the stores.

## Decision

Plain async service modules + pessimistic writes. The transfer service is the
single authority: it validates (distinct accounts, both active, amount > 0,
amount ≤ *available* balance), computes both new balances, and commits
atomically — both accounts and both ledger entries, or nothing. The store then
applies exactly what the service returned. During the wait the submit button
is disabled and labeled "Transferring…", which honestly reflects that money
movement takes a moment.

Client-side form validation still runs first, but purely for UX (instant
field-level feedback); it is never trusted — the service re-validates
everything, mirroring the client/server trust boundary of a real deployment.

## Consequences

- ✅ The UI can never show a balance the "server" didn't produce; there is no
  rollback code to get wrong.
- ✅ Swapping mock for HTTP means editing service internals only — the
  Promise/error contract, stores, and components are untouched.
- ✅ Typed error codes (`INSUFFICIENT_FUNDS`, `ACCOUNT_NOT_ACTIVE`, …) let the
  UI map failures to specific, actionable messages.
- ❌ ~600 ms of deliberate latency on every transfer; mitigated by the
  disabled/labeled button and acceptable for a money-movement action, where
  instant success would actually read as fake.
- ❌ Deep-cloning via `JSON.parse(JSON.stringify(...))` drops non-JSON types;
  acceptable because the domain model is deliberately JSON-only (ISO date
  strings, numbers).
