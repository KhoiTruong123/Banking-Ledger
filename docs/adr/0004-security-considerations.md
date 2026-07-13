# ADR-0004 — Security posture and assumptions

**Status:** Accepted

## Context

Authentication is listed as *nice to have*, and the app has no real backend
(ADR-0001), so most production banking controls (session management, TLS,
server-side authorization) have nothing real to attach to. The risk of a demo
is different: pretending to have security it doesn't have. This ADR records
what is enforced, what is simulated, and what is explicitly assumed away — so
a reviewer can see the trust boundaries were understood even where they
couldn't be implemented.

## Alternatives considered

1. **Mock login screen with a fake JWT in localStorage.** Looks complete, but
   a client-minted, client-verified token protects nothing — it is security
   theater that could mislead a reader into thinking auth exists. Rejected.
2. **Real auth service (nice-to-have path).** Meaningful only with a real
   backend to enforce it; pulls in the full-stack option already rejected in
   ADR-0001 for setup-cost reasons.
3. **No authentication, with the assumption stated loudly (chosen), plus the
   subset of controls that *are* meaningful client-side.**

## Decision

Assume a single already-authenticated customer session, and implement the
controls that carry real weight even in a client-only app:

- **Server-side-style validation at the trust boundary.** The transfer
  service re-validates every rule regardless of what the form checked
  (ADR-0003). Form validation is treated as UX, never as enforcement —
  the same posture a real backend must take toward any client.
- **Authorization by construction.** The data layer only ever contains the
  demo customer's own accounts, and the transfer service resolves accounts by
  ID from that set — there is no code path to another customer's data. In the
  real schema (`docs/schema.sql`), this becomes a `WHERE customer_id = ?`
  check on every account read inside the transfer transaction.
- **Data minimization in the UI.** Account numbers render masked
  (`•••• 1234`) everywhere; full numbers exist only in the data layer.
- **No secrets in the repository.** Nothing to configure means nothing to
  leak: no API keys, tokens, or credentials anywhere in the codebase.
- **Fail-closed money movement.** Any validation failure throws before any
  state is written; there is no partial-transfer state (verified by test:
  a rejected transfer leaves the database byte-identical).

## Explicit assumptions (out of scope by design)

- No authentication or session management; anyone with the URL is "Jordan
  Lee". A production version requires a real identity provider, short-lived
  tokens, and server-enforced session expiry.
- `localStorage` is not a secure store: data is unencrypted and readable by
  any script on the origin. Acceptable only because the data is synthetic.
  Real financial data must never be persisted client-side this way.
- No CSRF/XSS hardening beyond Vue's default template escaping (no `v-html`
  is used anywhere), no rate limiting, no audit logging, no idempotency keys
  on transfers. Each of these belongs to the real backend at the service-layer
  boundary defined in ADR-0001.

## Consequences

- ✅ The demo makes no false security claims; the trust boundary and the
  production migration path are documented rather than faked.
- ✅ The two controls that matter most in any deployment — never trust the
  client, fail closed on money movement — are actually implemented and
  tested, not just described.
- ❌ The app must not be deployed with real data in its current form; this is
  a stated constraint, not an oversight.
