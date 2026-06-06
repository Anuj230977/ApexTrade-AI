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

## What's In Progress
- Java Spring Boot gateway service

## What's Next
- React frontend price display
- Docker Compose wiring all 3 together

## Decisions Made
- Frontend talks to Java only, never Python directly
- Java acts as gateway between Frontend and Python
- Node.js/Express NOT used - intentionally chose Spring Boot for enterprise signal

## Phase Completion Checklist
- [ ] Phase 1: Walking Skeleton (in progress)
- [ ] Phase 2: Trading Engine
- [ ] Phase 3: RAG Intelligence
- [ ] Phase 4: Enterprise Layer
- [ ] Phase 5: Deploy
