# ApexTrade AI - Java Backend

## Role

The Java service is the authenticated public API and virtual-trading engine. It bridges the frontend and Python market-data service while owning PostgreSQL state for wallets, portfolios, positions, and transactions.

Java does not place real brokerage orders. It only changes simulated paper-trading state.

## Current P0-2 Status

P0-2 is implemented and unit-tested.

Implemented:

- Typed `POST /api/trade/buy` and `POST /api/trade/sell` DTOs.
- Symbol normalization and validation.
- Quantity precision and range validation.
- Upstream price validation.
- Consistent trade error envelope.
- Full-sell position deletion.
- V8 wallet and position CHECK constraints.
- Startup refusal unless `trading.mode=PAPER`.

The P0-2 unit suite passed 14 tests. V8 and runtime integration checks remain deferred until PostgreSQL/Docker are available.

## Main Components

- `TradeController`: validates `TradeRequest` and obtains the authenticated user principal.
- `TradeService`: validates, fetches market price, checks funds/shares, and mutates virtual state.
- `TradeRules`: symbol, quantity, and price invariants.
- `GlobalExceptionHandler`: JSON error envelope and typed HTTP mappings.
- `TradingModeGuard`: startup enforcement for PAPER mode.
- `AppConfig`: Spring bean configuration, including `RestTemplate`.
- JPA entities/repositories: PostgreSQL persistence.
- Flyway: versioned schema migrations.
- `JwtAuthFilter` and `JwtUtil`: pre-existing JWT authentication components that protect endpoints; these components are separate from P0-2 trade-safety changes.

## Trade Request

Buy and sell use:

```json
{
  "symbol": "AAPL",
  "quantity": 1.25
}
```

The request body is represented by `TradeRequest`:

- `symbol`: required text.
- `quantity`: required positive `BigDecimal`, scale at most 4, maximum `1,000,000.0000`.

Unknown-field behavior is preserved; P0-2 does not change global Jackson settings.

## Validation Order

Both trade methods validate in this order:

1. Normalize and validate the symbol.
2. Validate the quantity.
3. Fetch the Python market price.
4. Validate and normalize the upstream price.
5. Load wallet/portfolio/position state.
6. Check funds or available shares.
7. Mutate wallet and position state.
8. Save the transaction.

This ordering prevents known invalid trades from changing financial state.

## Error Handling

Trade failures use JSON `ErrorResponse` fields:

- `timestamp`
- `status`
- `code`
- `message`
- `path`
- `fieldErrors`

P0-2 codes include `VALIDATION_ERROR`, `MALFORMED_REQUEST`, `INVALID_SYMBOL`, `INVALID_QUANTITY`, `INSUFFICIENT_FUNDS`, `INSUFFICIENT_SHARES`, `POSITION_NOT_FOUND`, `UPSTREAM_INVALID_PRICE`, `UPSTREAM_UNAVAILABLE`, `DATA_INTEGRITY_VIOLATION`, and `INTERNAL_ERROR`.

## Configuration

Relevant settings:

- `python.service.url` / `PYTHON_SERVICE_URL`
- `spring.datasource.*` / `DB_URL`, `DB_USER`, `DB_PASS`
- `spring.flyway.*`
- `jwt.secret` / `JWT_SECRET`
- `trading.mode` / `TRADING_MODE`, default `PAPER`

The startup guard is:

```properties
trading.mode=${TRADING_MODE:PAPER}
```

A non-PAPER value is an invalid configuration and should fail Spring startup.

## Transactions and Concurrency

The buy/sell methods use `@Transactional`. P0-2 uses it for atomic wallet/position/transaction method behavior and rollback.

P0-3 work remains outstanding:

- Pessimistic or optimistic locking for wallet/position read-modify-write operations.
- Concurrent trade tests.
- Idempotency key and duplicate-trade prevention.
- HTTP timeout configuration for the market-price call.

`@Transactional` alone does not guarantee concurrency safety or idempotency.

## Test and Build Status

Unit tests: 14 passed, 0 failed, 0 errors, 0 skipped.

`mvn package`: successful.

Database, Docker, live startup, and HTTP integration checks were deferred because Docker Desktop/PostgreSQL were unavailable.
