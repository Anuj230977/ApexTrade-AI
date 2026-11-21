# ApexTrade AI - Deployment

## Docker Compose Services

The intended local architecture contains:

- `postgres` on port `5432`
- `python-service` on port `8000`
- `java-service` on port `8080`
- `frontend` on port `5173`, mapped to container port `80`

Docker Desktop is currently unavailable in the P0-2 environment. Docker and database runtime checks are deferred; this document describes the intended Compose topology only.

## Network

All services join the `trading-net` bridge network. Java reaches Python and PostgreSQL by Compose service name.

## Volumes

- `postgres_data` persists PostgreSQL database files.

## Environment Variables

- `PYTHON_SERVICE_URL`: Java-to-Python base URL.
- `DB_URL`, `DB_USER`, `DB_PASS`: PostgreSQL connection overrides.
- `JWT_SECRET`: JWT signing secret.
- `TRADING_MODE`: must be `PAPER`; it defaults to `PAPER`.

The Java property is:

```properties
trading.mode=${TRADING_MODE:PAPER}
```

A startup guard refuses to continue when `TRADING_MODE` is any value other than case-insensitive `PAPER`.

## Startup Order

1. PostgreSQL starts first.
2. Python starts for market-data lookups.
3. Java applies Flyway migrations and validates the JPA schema.
4. Java refuses startup if the trading mode is not PAPER.
5. Frontend starts and calls Java only.

## P0-2 Database Status

V8 is implemented at:

`backend-java/src/main/resources/db/migration/V8__add_trade_constraints.sql`

It adds `NOT VALID` CHECK constraints for:

- Non-negative wallet cash.
- Positive position quantity.

V8 was not executed against PostgreSQL in P0-2. Do not report it as migration-tested or constraint-tested until Flyway runs against a live database.

## P0-2 Validation Status

Verified without Docker:

- `mvn test`: 14 passed, 0 failures, 0 errors, 0 skipped.
- `mvn package`: successful.

Deferred until Docker/PostgreSQL is available:

- Docker Compose startup.
- Flyway V8 execution.
- Spring startup guard runtime test.
- Database constraint tests.
- Live HTTP buy/sell tests.

## P0-3 Outstanding Runtime Work

P0-3 will address items outside P0-2:

- Concurrency and row-locking behavior.
- Idempotency and duplicate-trade protection.
- Java market-data HTTP timeout configuration.

## Local Development Note

The stack is intended to mirror Docker Compose wiring locally. Secrets and database credentials remain development-grade defaults until separately hardened; do not treat this document or P0-2 as secret-management hardening.
