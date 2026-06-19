# ApexTrade AI - Java Backend

## Role
The Java service is the gateway and business API layer. It bridges the frontend to Python market-data calls and will own auth, wallet, portfolio, and trade logic.

## Current Endpoints
- `GET /api/market/price/{symbol}` - forwards to the Python service

## Main Configuration
- `python.service.url` points to the Python service base URL
- `spring.datasource.*` configures PostgreSQL access
- `spring.flyway.*` enables schema migrations from `db/migration`
- `jwt.secret` and `jwt.expiration` are already prepared for auth work

## Current Components
- `MarketController` proxies price requests
- `AppConfig` provides `RestTemplate`
- `CorsConfig` allows local frontend origins
- JPA entities exist for users, wallets, portfolios, positions, and transactions

## Database Layer
The Java app is already set up to validate the schema with Flyway and JPA instead of creating tables dynamically.

## Next Backend Work
- Registration and login endpoints
- Password hashing and JWT filters
- Wallet creation on signup
- Trading operations against PostgreSQL