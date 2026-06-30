# Trading Simulator - Project Context

## Project Summary
ApexTrade AI is a three-service trading simulator with a React frontend, a Java Spring Boot gateway, and a FastAPI market-data service. PostgreSQL is wired in for the trading engine. Phase 2 is complete, and the current repo focus is moving into Python hardening plus chart/history support for the frontend.

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
- Python will next expose `/history/{symbol}` for OHLC daily data.
- Java owns the PostgreSQL connection, Flyway migrations, auth, trading, and API gateway logic.
- Docker Compose runs `postgres`, `python-service`, `java-service`, and `frontend` on the same bridge network.

## What Is Built
- Python FastAPI service in `backend-python/`
  - `GET /price/{symbol}`
  - yFinance lookup with basic CORS
  - Returns `symbol`, `price`, and `currency`
  - Next: symbol validation, timeout handling, and `GET /history/{symbol}` for OHLC chart data
- Java Spring Boot service in `backend-java/`
  - `GET /api/market/price/{symbol}` proxy endpoint
  - `RestTemplate` client to the Python service
  - CORS config for local frontend origins
  - PostgreSQL, Flyway, JPA, and JWT properties already configured
  - Entity model exists for `User`, `Wallet`, `Portfolio`, `Position`, and `Transaction`
  - `POST /api/auth/register` creates the user, wallet, and portfolio records
  - `POST /api/auth/login` returns a JWT token for authenticated sessions
  - JWT filter, wallet balance, buy/sell, portfolio, and transactions endpoints are complete
- React frontend in `frontend/`
  - `PriceTicker` component for symbol lookup
  - Fetches price data through the Java gateway
  - Vite app scaffold with minimal UI
- Database schema in `backend-java/src/main/resources/db/migration/`
  - Tables for users, wallets, portfolios, positions, transactions, watchlists, and AI signals

## Current Phase
- Phase 4: Frontend Dashboard + Enterprise Hardening
- Phase 3 complete: Python hardening, OHLC endpoint, RAG signal pipeline

## Phase 2 Status
- Done: register endpoint
- Done: login endpoint
- Done: user, wallet, and portfolio creation on signup
- Done: JWT validation filter for request-time protection
- Done: authenticated wallet balance endpoint
- Done: trading endpoints for buy/sell
- Done: `GET /api/portfolio`
- Done: `GET /api/transactions`

## Phase 3 Status (Complete)
- Done: symbol validation, timeout handling, OHLC endpoint
- Done: RAG pipeline — news fetcher, ChromaDB vector store, Groq LLM signal generation
- Done: GET /api/market/signal/{symbol} (Java → Python proxy)

## Next Work
- Harden Python service input handling
- Add symbol validation to the Python service
- Add timeout handling around yFinance calls
- Add `GET /history/{symbol}` returning daily OHLC data for Recharts candlestick charts
- Keep Java as the gateway and continue preparing frontend data contracts for charting

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
- [x] Phase 2: Trading Engine
- [x] Phase 3: Python Hardening + OHLC + RAG
- [ ] Phase 4: Frontend Dashboard + Enterprise Layer
- [ ] Phase 5: Deploy