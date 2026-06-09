# Trading Simulator - Project Context

## Stack
- Frontend: React.js
- Backend Java: Spring Boot (gateway, auth, transactions)
- Backend Python: FastAPI (price fetching, RAG pipeline)
- Database: PostgreSQL
- Vector DB: ChromaDB
- Cache: Redis
- DevOps: Docker, GitHub Actions

## Current Phase: Phase 2 - Trading Engine

## What's Built
- Python FastAPI service (backend-python/)
  - GET /price/{symbol} endpoint
  - yFinance integration
  - Dockerized and tested
- Java Spring Boot gateway (backend-java/)
  - GET /api/market/price/{symbol} endpoint
  - Calls Python service via RestTemplate
  - Global CORS configuration via WebMvcConfigurer
  - Dockerized with multi-stage build
- React frontend (frontend/)
  - PriceTicker component
  - Fetches price through Java gateway only
  - Dockerized with nginx
- Docker Compose (docker-compose.yml)
  - All 3 services on trading-net bridge network
  - Correct startup order via depends_on
  - Environment variable for Python URL

## What's In Progress
- Phase 2: PostgreSQL + JWT Auth + Virtual Wallet

## What's Next
- Add PostgreSQL container to Docker Compose
- User registration and login endpoints in Java
- JWT token generation and validation
- Virtual wallet ($10,000 on signup)

## Decisions Made
- Frontend talks to Java only, never Python directly
- Java acts as gateway between Frontend and Python
- Node.js/Express NOT used - intentionally chose Spring Boot for enterprise signal

## Phase Completion Checklist
- [x] Phase 1: Walking Skeleton ✅
- [ ] Phase 2: Trading Engine
- [ ] Phase 3: RAG Intelligence
- [ ] Phase 4: Enterprise Layer
- [ ] Phase 5: Deploy
