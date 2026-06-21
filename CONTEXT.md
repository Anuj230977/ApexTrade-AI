# Trading Simulator - Project Context

## Project Summary
ApexTrade AI is a three-service trading simulator with a React frontend, a Java Spring Boot gateway, and a FastAPI market-data service. PostgreSQL is already wired in for the trading engine work, and the current repo is focused on the API gateway, market price flow, and the database/schema foundation for auth, wallet, and portfolio features.

## Stack
- Frontend: React 19 + Vite
- Backend Java: Spring Boot 3.2, Java 21, JPA, Flyway, JWT, PostgreSQL
- Backend Python: FastAPI + yFinance
- Database: PostgreSQL
- DevOps: Docker, Docker Compose

## Current Architecture
- The React app calls the Java service only.
- Java exposes `/api/market/price/{symbol}` and forwards requests to Python.
- Python exposes `/price/{symbol}` and resolves the live price with yFinance.
- Java also owns the PostgreSQL connection, Flyway migrations, and future auth/trading endpoints.
- Docker Compose runs `postgres`, `python-service`, `java-service`, and `frontend` on the same bridge network.

## What Is Built
- Python FastAPI service in `backend-python/`
  - `GET /price/{symbol}`
  - yFinance lookup with basic CORS
  - Returns `symbol`, `price`, and `currency`
- Java Spring Boot service in `backend-java/`
  - `GET /api/market/price/{symbol}` proxy endpoint
  - `RestTemplate` client to the Python service
  - CORS config for local frontend origins
  - PostgreSQL, Flyway, JPA, and JWT properties already configured
  - Entity model exists for `User`, `Wallet`, `Portfolio`, `Position`, and `Transaction`
  - `POST /api/auth/register` creates the user, wallet, and portfolio records
  - `POST /api/auth/login` returns a JWT token for authenticated sessions
- React frontend in `frontend/`
  - `PriceTicker` component for symbol lookup
  - Fetches price data through the Java gateway
  - Vite app scaffold with minimal UI
- Database schema in `backend-java/src/main/resources/db/migration/`
  - Tables for users, wallets, portfolios, positions, transactions, watchlists, and AI signals

## Current Phase
- Phase 2: Trading Engine
- In progress: PostgreSQL-backed auth, JWT security, and virtual wallet foundation

## Phase 2 Status
- Done: register endpoint
- Done: login endpoint
- Done: user, wallet, and portfolio creation on signup
- Not done: JWT validation filter for request-time protection
- Not done: authenticated wallet balance endpoint
- Not done: trading endpoints for buy/sell
- Not done: portfolio endpoint

## Next Work
- Wire JWT validation into Spring Security with a request filter
- Add authenticated `GET /api/wallet/balance`
- Add buy/sell trading endpoints
- Add portfolio retrieval endpoint
- Continue connecting trading operations to the portfolio and transaction tables

## Project Decisions
- Frontend talks to Java only, never directly to Python.
- Java is the gateway and the main business API layer.
- Python stays focused on market data and AI-related services.
- PostgreSQL is the system of record for financial state.

## Docs Map
- `docs/DATABASE.md` - table design and data modeling notes
- `docs/PROJECT_OVERVIEW.md` - overall architecture and repo summary
- `docs/API_REFERENCE.md` - external and internal API endpoints
- `docs/BACKEND_JAVA.md` - Spring Boot gateway, data, and security notes
- `docs/BACKEND_PYTHON.md` - FastAPI market price service notes
- `docs/FRONTEND.md` - React app structure and data flow
- `docs/DEPLOYMENT.md` - Docker Compose and local run instructions

## Phase Checklist
- [x] Phase 1: Walking Skeleton
- [ ] Phase 2: Trading Engine
- [ ] Phase 3: RAG Intelligence
- [ ] Phase 4: Enterprise Layer
- [ ] Phase 5: Deploy
