# ADR-0002 — Pinia for state management

**Status:** Accepted

## Context

Account balances are read on the overview page, consumed by the transfer form
(for validation and account pickers), and must update immediately after a
transfer. The transaction list must reflect new transfer entries without a
page reload. This is shared, cross-view state that outlives any single
component, and a transfer mutates three concerns at once (accounts,
transactions, notifications).

## Alternatives considered

1. **Component-local state + props/events.** Zero dependencies, but the
   accounts list would need lifting to `App.vue` and threading through
   props — and the transfer flow would still need an event bus or provide/
   inject chain to update the transaction list. Fragile as the app grows.
2. **Composables with module-level `reactive()` state.** Idiomatic Vue and
   dependency-free; effectively a hand-rolled store. Workable, but gives up
   Pinia's devtools integration, established action/getter conventions, and
   the discoverability of a standard solution — for no real saving, since
   Pinia is ~1.5 kB.
3. **Vuex.** Superseded; Pinia is the officially recommended store for Vue 3,
   with less boilerplate (no mutations) and better composition-API ergonomics.
4. **Pinia (chosen)** with four small stores split by domain: `accounts`,
   `transactions`, `transfer`, and `ui` (toasts).

## Decision

Pinia, with one store per domain rather than one global store. The `transfer`
store acts as the orchestrator: its `submit` action calls the transfer
service, and on success pushes the result into the `accounts` store
(`applyTransferResult`) and the `transactions` store (`prependTransactions`),
then raises a toast via the `ui` store. Server-derived state is kept in
stores; purely local concerns (form fields, panel open/closed) stay in
component state.

Derivable values are getters, not stored state: `totalAvailableBalance` and
`transferableAccounts` are computed from the accounts array so they can never
drift out of sync with it.

## Consequences

- ✅ A successful transfer updates every affected surface (balances, register,
  toast) through explicit, traceable store actions — no event bus, no
  refetch-everything.
- ✅ Stores are unit-testable without mounting components, and inspectable in
  Vue devtools.
- ✅ Loading/error status lives beside the data it describes
  (`status: idle | loading | ready | error`), so views render states
  consistently.
- ❌ Cross-store coupling: the `transfer` store knows about three other
  stores. Acceptable at this size; at larger scale this orchestration would
  move into a dedicated application-service layer.
- ❌ The transactions store holds whatever the current filter returned, not a
  normalized cache; switching filters refetches. Fine for a small dataset,
  and it keeps filtering logic in one place (the service).
