# Trading Simulator - Project Context

## Stack
- Frontend: React.js
- Backend Java: Spring Boot (gateway, auth, transactions)
- Backend Python: FastAPI (price fetching, RAG pipeline)
- Database: PostgreSQL
- Vector DB: ChromaDB
- Cache: Redis
- DevOps: Docker, GitHub Actions

## Current Phase: Phase 1 - Walking Skeleton

## What's Built
- Project folder structure created
- Python FastAPI service (backend-python/)
  - GET /price/{symbol} endpoint
  - yFinance integration
  - Dockerized and tested
- Java Spring Boot gateway (backend-java/)
  - GET /api/market/price/{symbol} endpoint
  - Calls Python service via RestTemplate
  - Global CORS configuration
  - Dockerized with multi-stage build
- React frontend (frontend/)
  - PriceTicker component
  - Fetches price via Java gateway
  - Loading and error states handled

## What's In Progress
- Docker Compose wiring all 3 services together

## What's Next
- Phase 2: PostgreSQL + User Auth + Wallet

## Decisions Made
- Frontend talks to Java only, never Python directly
- Java acts as gateway between Frontend and Python
- Node.js/Express NOT used - intentionally chose Spring Boot for enterprise signal

## Phase Completion Checklist
- [ ] Phase 1: Walking Skeleton (in progress — pending Docker Compose)
- [ ] Phase 2: Trading Engine
- [ ] Phase 3: RAG Intelligence
- [ ] Phase 4: Enterprise Layer
- [ ] Phase 5: Deploy
