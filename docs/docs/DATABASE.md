# ApexTrade AI — Database Design Guide

## Why PostgreSQL?
PostgreSQL is the industry standard for financial applications because it 
supports ACID transactions — meaning money can never be lost or duplicated 
during a buy/sell operation. This is why Java Spring Boot uses @Transactional 
when executing trades.

## Why Flyway?
Flyway manages database migrations — versioned SQL scripts that run 
automatically when the app starts. Golden rule: never edit a migration file 
after it has been run. New changes = new file.

## Table Relationships
users

├── wallets      (one-to-one)  → user's cash balance
├── portfolios   (one-to-one)  → user's overall portfolio value
│     └── positions (one-to-many) → individual stock holdings
├── transactions (one-to-many) → full history of buys/sells
└── watchlists   (one-to-many) → stocks user is watching
ai_signals (standalone) → stores every AI recommendation ever made

## Table Explanations

### users
The master table. Every other table links back to this.
- `id` UUID — unique identifier, generated automatically by PostgreSQL
- `password_hash` — never store plain passwords, always bcrypt hashed
- `role` — TRADER or ADMIN, controls what endpoints they can access

### wallets
Stores virtual cash. One wallet per user.
- `cash_balance` starts at $10,000 on registration
- Decreases on BUY, increases on SELL
- Uses DECIMAL(15,2) not float — floats lose precision with money

### portfolios
Tracks overall portfolio performance.
- `total_value` = cash_balance + value of all positions
- `total_return_percent` = how much user has gained/lost since start

### positions
Each row = one stock holding.
- `average_cost` uses Weighted Average Cost method
  - Buy 10 AAPL @ $100 + Buy 10 AAPL @ $120 = average cost $110
- UNIQUE(portfolio_id, symbol) — can't have two rows for same stock

### transactions
Immutable record of every trade. Never deleted.
- `transaction_type` = BUY or SELL
- `total_amount` = quantity × price
- Used for trade history page and audit trail

### watchlists
Simple list of symbols a user wants to monitor.
- No price data stored here — prices always fetched live from Python service

### ai_signals
Every AI recommendation ever generated gets stored here.
- Standalone table — not linked to any user
- Used for AI accuracy tracking in admin dashboard
- `confidence` = 0-100 integer
- `reason` = TEXT, stores full RAG-generated explanation

## Key Concepts

### FOREIGN KEY
Links two tables together. Example:
wallets.user_id → users.id
This means a wallet cannot exist without a user.

### ON DELETE CASCADE
If a user is deleted, their wallet/portfolio/positions are 
automatically deleted too. Prevents orphaned data.

### UUID vs INTEGER for IDs
We use UUID instead of auto-increment integers because:
- UUIDs are unpredictable — users can't guess other users' IDs
- Safe to expose in URLs
- Industry standard for financial applications

### DECIMAL(15,2) vs FLOAT
Always use DECIMAL for money. 
FLOAT: 0.1 + 0.2 = 0.30000000000000004 (floating point error)
DECIMAL: 0.1 + 0.2 = 0.30 (exact)