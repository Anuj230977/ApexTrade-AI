# ApexTrade AI - Project Context

## Project Summary

ApexTrade AI is a three-service paper-trading platform:

- React 19 + Vite frontend.
- Java 21 / Spring Boot 3.2 gateway and virtual-trading engine.
- FastAPI / Python market-data service.
- PostgreSQL system of record for virtual financial state.

The platform uses real, delayed, or historical external market data. It does not place real brokerage orders or execute live trades.

## Current Architecture

- React calls Java for application, market-data, auth, portfolio, wallet, trade, and transaction operations.
- Java calls Python for market prices and other market-data features.
- Java owns PostgreSQL persistence and Flyway migrations.
- Python owns upstream market-data retrieval and AI-related market features.
- PostgreSQL stores virtual cash, positions, and transaction history.

## Current P0-2 Status

P0-2 trade safety is implemented:

- Typed trade DTO and Bean Validation.
- Normalized symbol and validated quantity.
- Missing, invalid, non-positive, and oversized upstream prices rejected.
- Insufficient-funds and insufficient-shares checks prevent state mutation.
- Full sells delete the position instead of storing zero quantity.
- Consistent JSON error envelope for trade failures.
- V8 migration adds `NOT VALID` CHECK constraints.
- Startup guard requires `trading.mode=PAPER`.

Verified unit tests: 14 passed, 0 failures, 0 errors, 0 skipped.

Verified build: `mvn package` succeeded.

## Deferred P0-2 Runtime Checks

Docker Desktop and PostgreSQL were unavailable, so the following were not executed:

- Flyway V8 migration against PostgreSQL.
- Live constraint enforcement tests.
- Legacy-row validation or cleanup.
- Spring startup guard runtime test.
- Live HTTP buy/sell integration tests.
- Docker Compose smoke test.

V8 is implemented but not yet database-executed.

## P0-3 Outstanding Work

P0-3 still needs:

- Row locking or optimistic versioning.
- Concurrent buy/sell safety tests.
- Idempotency keys and duplicate-trade prevention.
- Java outbound HTTP timeout configuration.

`@Transactional` provides rollback/atomic method behavior but does not by itself guarantee concurrency safety or duplicate-request prevention.

## Repository Areas

- `frontend/`: React application.
- `backend-java/`: Spring Boot API, persistence, migrations, and paper-trading logic.
- `backend-python/`: FastAPI market-data and AI services.
- `docs/`: architecture, database, API, deployment, and phase documentation.

## Documentation Map

- `docs/README.md`: documentation index.
- `docs/phases/P0-2_TRADE_SAFETY.md`: authoritative P0-2 report.
- `docs/PROJECT_OVERVIEW.md`: project overview.
- `docs/BACKEND_JAVA.md`: Java implementation and configuration.
- `docs/API_REFERENCE.md`: public API and error contracts.
- `docs/DATABASE.md`: schema, migrations, and financial constraints.
- `docs/DEPLOYMENT.md`: Docker Compose and environment settings.
