# ApexTrade AI Frontend

A React 19 and Vite frontend for the ApexTrade AI paper-trading platform.

The frontend calls the Java application API for:

- Authentication.
- Market price, history, and signal data.
- Virtual wallet and portfolio views.
- Buy/sell paper trades.
- Transaction history.

The frontend should call Java only. It should not call Python market-data services directly.

## Requirements

- Node.js with npm.
- Java backend available on `http://localhost:8080` for local API development.
- Python market-data service available through the Java gateway.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## API Base

Development API calls use the Java backend at `http://localhost:8080` when configured in the existing frontend API client.

## Paper-Trading Display Rules

The UI should clearly distinguish simulated state from real market data:

- Show timestamps and live/delayed/historical status where applicable.
- Identify wallet and holdings as virtual/paper-trading values.
- Do not present AI signals as guaranteed predictions.
- Do not display buy/sell actions as real brokerage orders.

## P0-2 Scope Note

P0-2 changed Java trade validation and database safety; it did not change frontend source or sandbox behavior.

Frontend trade calls still send `symbol` and `quantity` to:

- `POST /api/trade/buy`
- `POST /api/trade/sell`

See `docs/API_REFERENCE.md` for the current P0-2 API contract and `docs/phases/P0-2_TRADE_SAFETY.md` for implementation details.
