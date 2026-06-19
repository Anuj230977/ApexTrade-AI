# ApexTrade AI - Frontend

## Role
The frontend is a React 19 app built with Vite. It provides a minimal UI for the current market price demo and is meant to grow into the trading dashboard later.

## Current UI
- `App.jsx` renders the app shell and the price ticker
- `PriceTicker.jsx` accepts a stock symbol and requests the live price

## Data Flow
- The UI calls `http://localhost:8080/api/market/price/{symbol}`
- It does not call the Python service directly
- It displays the returned symbol, price, and currency

## Scripts
- `npm run dev` - start the Vite dev server
- `npm run build` - create the production bundle
- `npm run lint` - run ESLint

## Notes
- The current UI is intentionally small and focused on the gateway flow
- Future work should expand this into portfolio, wallet, and trading screens