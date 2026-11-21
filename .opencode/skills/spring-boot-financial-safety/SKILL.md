---
name: spring-boot-financial-safety
description: Use when implementing, reviewing, or testing Java Spring Boot trading, wallet, portfolio, order, or money-handling code in ApexTrade AI. Covers paper-trading invariants, BigDecimal precision, input validation, transaction safety, database constraints, error contracts, and required tests.
version: 1.0.0
---

# Spring Boot Financial Safety - ApexTrade AI

ApexTrade AI is a **paper-trading and financial-learning platform**. Market data is real; execution and money are simulated. Every change to money-handling code must preserve that distinction and the invariants below.

## When to use this skill

- Editing `TradeController`, `TradeService`, `WalletService`, `PortfolioService`, `TransactionService`, `AuthService` (wallet creation), entities, repositories, or Flyway migrations.
- Reviewing a PR that touches balances, positions, quantities, prices, or transaction rows.
- Writing or fixing tests for trading behaviour.
- Designing a new endpoint that reads or writes financial state.

## Non-negotiable product invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| INV-1 | Market data always comes from the real external provider. Never mock prices in shipped code or in any runtime mode. | Python market service is the only price source; tests may stub, production may not. |
| INV-2 | Every order is simulated against virtual cash. No real brokerage, custody, or live-order path may exist. | `TradeService` mutates only local PostgreSQL state. Startup guard requires `trading.mode=PAPER`. |
| INV-3 | Virtual starting capital is explicit, visible, and configurable. | Wallet creation sets a documented default; UI shows it. |
| INV-4 | Balances and positions can never become negative through a normal or malformed request. | Validation, service checks, DB `CHECK` constraints, tests. |
| INV-5 | A rejected trade never changes wallet, position, or transaction state. | Validate before mutation; `@Transactional` rollback; negative tests assert no writes. |
| INV-6 | Money is stored and compared with `BigDecimal`, never `double`/`float`. | Code review, tests. |
| INV-7 | Financial state changes are atomic per trade: wallet + position + transaction commit together or not at all. | `@Transactional` on service methods; integration tests. |
| INV-8 | The user is always derived from the authenticated principal, never from the request body. | Controllers read `SecurityContextHolder`; no client-supplied `userId`. |

## Money and precision rules

| Concern | Rule |
|---------|------|
| Type | `BigDecimal` only. No `double`, `float`, or `Number` arithmetic for money. |
| Money scale | 2 decimal places (matches `DECIMAL(15,2)`). |
| Quantity scale | 4 decimal places (matches `DECIMAL(15,4)`). |
| Price scale | 2 decimal places before storage and response. |
| Rounding | `RoundingMode.HALF_UP` at the boundary where a value is stored or returned. Do not round intermediate weighted-average calculations more than once. |
| Comparison | Use `compareTo(...)`, never `equals(...)` (scale-sensitive). |
| Null safety | Treat `null` balance, quantity, or price as invalid state, not as zero. |
| Overflow | Reject values that exceed column capacity before hitting the database. |
| Zero | Zero quantity is invalid for buy and sell. A fully sold position is deleted, not stored as zero. |

Recommended limits (document any change):

- Quantity: `> 0`, scale <= 4, maximum `1,000,000.0000`.
- Price: `> 0`, scale normalized to 2, maximum `1,000,000.00`.
- Symbol: `^[A-Z]{1,10}$` after trim + uppercase.

## Input validation

Validation happens **before** any price fetch, repository read that leads to a write, or state mutation. Apply it twice: Bean Validation on the DTO and an explicit service-level check.

### Symbol

1. Trim whitespace.
2. Uppercase.
3. Enforce `^[A-Z]{1,10}$`.
4. Reject blank, null, punctuation, path separators, and exchange suffixes the provider cannot resolve.
5. Use the normalized value for price fetch, position lookup, persistence, and response.

### Quantity

- Non-null.
- `signum() > 0`.
- Scale <= 4; reject sub-0.0001 values instead of silently rounding them to zero.
- At most `1,000,000`.
- Reject non-numeric input at the transport layer with a 400, never a 500.

### Price (upstream)

- Response must contain a non-null `price`.
- Parse with `new BigDecimal(...)` inside a try/catch; parse failure is an upstream error, not a client error.
- Reject `<= 0`, `NaN`/`Infinity` representations, and values above the sanity maximum.
- Normalize to 2 decimal places before use.

### Request shape

- Use a typed DTO, never `Map<String, String>`.
- Enable `@Valid` on the controller method.
- Reject missing or invalid required fields with a consistent error envelope.
- Handle unknown fields according to the existing API compatibility policy. Do not change global Jackson behavior as part of P0-2.
- Do not coerce a missing quantity to zero.

## Transaction safety

- Annotate each public buy/sell operation with `@Transactional`.
- Perform all validation before the first mutation.
- Keep external HTTP calls (price lookup) out of the transaction when practical; if they must stay inside, document the connection-holding risk.
- Read-modify-write on `wallets.cash_balance` and `positions.quantity` requires either optimistic versioning (`@Version`) or a pessimistic lock. Absence of either is a defect.
- A retry must not create a second trade: accept an idempotency key and enforce a unique constraint on it.
- On a full sell, delete the position row. Never persist `quantity = 0`.
- Create a new position with the actual quantity and price; do not initialize it to zero and then update it.
- Do not call `save` on an entity that has not changed.
- Let runtime exceptions roll back the transaction; never catch and swallow inside the service.

## Database constraints

Schema changes use Flyway only. Never edit a migration that has already been applied; add a new versioned file.

Required constraints:

```sql
-- wallets
CHECK (cash_balance >= 0)

-- positions
CHECK (quantity > 0)
```

Guidance:

- Prefer `NOT VALID` when legacy rows may already violate a constraint, so the migration applies and all new writes are enforced. Clean the legacy rows separately, then validate the constraint.
- Keep entity precision aligned with the column: money `precision = 15, scale = 2`; quantity `precision = 15, scale = 4`.
- `UNIQUE (portfolio_id, symbol)` depends on normalized symbols; normalization is mandatory, not optional.
- Add indexes for access paths used by hot queries (for example `transactions(user_id, created_at)`), in a new migration.
- Never rely on `ddl-auto` to create or alter financial tables.

## Error handling contract

All trade failures return a JSON envelope, never a stack trace, HTML page, or raw exception message.

```json
{
  "timestamp": "2026-11-21T12:00:00Z",
  "status": 400,
  "code": "INVALID_QUANTITY",
  "message": "Quantity must be greater than zero.",
  "path": "/api/trade/buy",
  "fieldErrors": {
    "quantity": "must be greater than 0"
  }
}
```

| Situation | Status | Code |
|-----------|--------|------|
| Bean Validation failure | 400 | `VALIDATION_ERROR` |
| Malformed JSON / non-numeric quantity | 400 | `MALFORMED_REQUEST` |
| Invalid or missing symbol | 400 | `INVALID_SYMBOL` |
| Invalid quantity | 400 | `INVALID_QUANTITY` |
| Insufficient cash | 400 | `INSUFFICIENT_FUNDS` |
| Insufficient shares | 400 | `INSUFFICIENT_SHARES` |
| Position not found on sell | 400 | `POSITION_NOT_FOUND` |
| Upstream price missing/invalid | 503 | `UPSTREAM_INVALID_PRICE` |
| Upstream unreachable | 503 | `UPSTREAM_UNAVAILABLE` |
| Unique/constraint violation | 409 | `DATA_INTEGRITY_VIOLATION` |
| Unexpected server fault | 500 | `INTERNAL_ERROR` |

Rules:

- Use a single `@RestControllerAdvice` for these mappings.
- Never expose `e.getMessage()` from persistence or HTTP libraries to the client.
- Log the internal cause with a correlation id; return only the envelope.
- Map "insufficient funds/shares" to 400, not 500.
- Do not change authentication error semantics as a side effect of trade work.

## Testing requirements

Tests are part of the definition of done for any financial change.

### Required unit tests

- Quantity: null, zero, negative, too many decimals, above maximum, non-numeric payload.
- Symbol: blank, lowercase, mixed case, too long, punctuation, path traversal attempt.
- Price: missing, null, zero, negative, non-numeric, oversized.
- Service: invalid input throws before any repository call or price fetch.
- Service: insufficient funds/shares leaves wallet and position untouched.
- Service: full sell deletes the position instead of saving zero.
- Service: weighted average cost uses unrounded values and rounds once.
- Controller: invalid body returns 400 with the envelope and the service is never invoked.

### Required integration tests (when a database is available)

- Wallet and position constraints reject invalid writes.
- A failed trade rolls back every write.
- Concurrent buys cannot overdraw (P0-3).
- Duplicate idempotency key creates one trade (P0-3).
- Migrations apply cleanly on an empty database.

### Test rules

- Assert negative cases, not only the happy path.
- Use exact `BigDecimal` comparisons with `compareTo`, and assert scale where it matters.
- Do not assert on exception messages that include internal details.
- Tests must fail if a validation, constraint, or rollback is removed.
- Unit tests must not require Docker, PostgreSQL, or network access.
- Integration tests that need a database run in CI (Testcontainers) until local Docker is restored.

## Review checklist

Before approving a financial change:

- [ ] Symbol normalized before fetch and persistence.
- [ ] Quantity and price validated before any mutation.
- [ ] No `double`/`float`; `BigDecimal` with explicit scale and rounding.
- [ ] `compareTo` used for comparisons.
- [ ] Full sell deletes the row.
- [ ] `@Transactional` covers all writes.
- [ ] Locking or versioning present for read-modify-write (or explicitly tracked as P0-3 debt).
- [ ] No external HTTP call inside the transaction without justification.
- [ ] DB `CHECK` constraints cover non-negative cash and positive quantity.
- [ ] Errors use the standard envelope; no internal details leak.
- [ ] User identity comes from the principal.
- [ ] Tests cover invalid input and assert no state change.
- [ ] `mvn test` and `mvn package` pass.

## Anti-patterns

- Parsing money with `new BigDecimal(request.get("quantity"))` without null/positivity checks.
- Trusting a client-supplied `symbol` or `userId`.
- `wallet.getCashBalance().subtract(totalCost)` before checking funds.
- Using `Map<String, String>` for a trade request.
- Returning `RuntimeException("Insufficient funds")` and letting it become a 500.
- Persisting a zero-quantity position.
- Adding a `CHECK` constraint without considering existing dirty rows.
- Editing an applied migration.
- Testing only the successful buy path.
- Calling the market-data service inside the transaction without a timeout or justification.

## Current known gaps (tracked, do not silently ignore)

- No row locking or `@Version` yet (P0-3).
- No idempotency key yet (P0-3).
- Price fetch still runs inside the transaction (P0-3).
- Java outbound HTTP has no timeouts (P0-3).
- Migration execution is deferred until Docker/PostgreSQL is available (D-2).

## Repository references

- `backend-java/src/main/java/com/apextrade/controller/TradeController.java`
- `backend-java/src/main/java/com/apextrade/service/TradeService.java`
- `backend-java/src/main/java/com/apextrade/entity/{Wallet,Position,Transaction}.java`
- `backend-java/src/main/resources/db/migration/`
- `backend-java/src/main/resources/application.properties`
- `docs/DATABASE.md`
