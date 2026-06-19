# ApexTrade AI - Project Overview

## Purpose
ApexTrade AI is a trading simulator built to demonstrate a full stack flow from UI to gateway to market-data service to database.

## Services
- Frontend: React 19 + Vite
- Java backend: Spring Boot gateway and trading engine core
- Python backend: FastAPI market price service
- Database: PostgreSQL

## Request Flow
1. The user enters a stock symbol in the React app.
2. React sends the request to Java at `/api/market/price/{symbol}`.
3. Java forwards the request to Python at `/price/{symbol}`.
4. Python uses yFinance to resolve the live price.
5. Java returns the Python response back to the frontend.

## Repo Structure
- `backend-java/` - API gateway, persistence, migrations, and future auth/trading logic
- `backend-python/` - price lookup service
- `frontend/` - React UI
- `docs/` - project documentation

## Current Focus
The repo is currently centered on Phase 2 work: PostgreSQL integration, JWT auth, wallet creation, and preparing the trading engine data model.