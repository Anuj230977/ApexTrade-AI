# ApexTrade AI Documentation

This directory is the human-readable reference for ApexTrade AI. Source code remains the authoritative implementation; these documents explain and link to it.

## Start Here

- [Project overview](PROJECT_OVERVIEW.md)
- [Java backend](BACKEND_JAVA.md)
- [Python backend](BACKEND_PYTHON.md)
- [API reference](API_REFERENCE.md)
- [Database guide](DATABASE.md)
- [Deployment](DEPLOYMENT.md)
- [Frontend guide](FRONTEND.md)

## Phase Reports

- [P0-2 trade safety](phases/P0-2_TRADE_SAFETY.md) — current authoritative implementation report for trade validation, financial checks, database constraints, and PAPER-mode startup.

## Product and Architecture Rules

ApexTrade AI distinguishes data from execution:

- Python/market-data providers supply real, delayed, or historical prices.
- Java owns authentication, virtual-wallet state, positions, and transaction history.
- Trades use simulated cash and holdings only; they do not place real brokerage orders.
- The application startup mode must be `PAPER`.
- `BigDecimal` is used for money and quantities; floating-point types are not used for financial calculations.

## Documentation Status

| Area | Status |
|------|--------|
| P0-1 build and branch baseline | Historical baseline recorded in project context |
| P0-2 trade safety | Implemented; unit tests passed; Flyway V8 has not been executed against PostgreSQL, and other database/runtime validation is deferred |
| P0-3 concurrency | Not implemented |
| Docker runtime | Deferred while Docker Desktop is unavailable |

## Historical Documents

The following documents preserve older audit, incident, or UI-change context. They may contain dated conclusions and should be read together with current guides:

- [Project audit and UI/UX handoff](PROJECT_AUDIT_AND_UIUX_HANDOFF.md)
- [Frontend current-state issues and fixes](FRONTEND_CURRENT_STATE_ISSUES_AND_FIXES.md)
- [JWT and yFinance incident](INCIDENT_2026-06-30_JWT_AND_YFINANCE_FIX.md)

## Deferred Checks

P0-2 documentation does not claim that migrations or constraints passed a live database run. The following remain deferred:

- Executing Flyway migration V8 against PostgreSQL.
- Database constraint integration tests.
- Spring application startup test with `TRADING_MODE=PAPER` and non-PAPER modes.
- Docker Compose smoke testing.
- P0-3 locking, idempotency, HTTP timeout, and concurrency work.
