# Frontend Current State Issues and Fixes

## What Was Checked
- Frontend source files under `frontend/src/`
- Backend Java controllers under `backend-java/src/main/java/com/apextrade/controller/`
- Backend Python routes under `backend-python/main.py`
- Supporting frontend API client in `frontend/src/services/api.js`

## Confirmed Backend Contracts Used by the Frontend
- `GET /api/market/price/{symbol}` via Java gateway
- `GET /api/market/history/{symbol}?period=&interval=` via Java gateway
- `GET /api/market/signal/{symbol}` via Java gateway
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/portfolio`
- `GET /api/wallet/balance`
- `GET /api/transactions`
- `POST /api/trade/buy`
- `POST /api/trade/sell`
- `GET /api/user/profile`

## Issues Found
- Candle chart rendering was broken because the Recharts candlestick implementation used a custom bar shape that did not receive the fields it expected.
- The Portfolio and Analytics labels in the top navbar were decorative spans, so they did not actually navigate anywhere.
- The live/sandbox mode control behaved like a destructive client toggle instead of a status indicator, which could flip the entire page into fallback mode.
- The dashboard layout was constrained by a fixed max width, which made the page feel smaller than the viewport.
- Several cards used `h-full`, `min-h-*`, or `justify-between` patterns that stretched sections vertically and created unwanted whitespace.
- The trading terminal form had too much internal spacing, which pushed the Symbol and Quantity inputs apart.
- The instrument selector was a fixed button grid, which made symbol lookup slower than necessary.
- Several UI labels used very small font sizes, which made the interface feel cramped.

## Fixes Applied
- Replaced the broken candlestick rendering path with a real Recharts `Customized` candle layer in `frontend/src/components/CandleChart.jsx`.
- Kept the existing chart shell, header, price badge, and toggle controls intact.
- Turned the navbar tabs into clickable section anchors so Terminal, Portfolio, and Analytics now scroll to real dashboard regions.
- Changed the connection badge to a read-only status control so automatic sandbox fallback can still happen without a user-triggered mode flip.
- Expanded the dashboard wrapper in `frontend/src/pages/Dashboard.jsx` so the application can use the full viewport width.
- Aligned the main grid and right-side panels to the top.
- Removed the terminal form's `justify-between` layout and changed it to a compact top-aligned flex column.
- Replaced the static instrument button grid with a searchable dropdown in `frontend/src/components/TradingPanel.jsx`.
- Marked the signal card and table cards as top-aligned so they do not stretch unnecessarily.
- Increased key typography sizes in the navbar, auth page, portfolio table, and transaction history.
- Adjusted the global root sizing in `frontend/src/index.css` so `html`, `body`, and `#root` occupy the full width and viewport height.

## Notes on Backend-to-Frontend Alignment
- The candle chart should use the `history.data` array returned by `/api/market/history/{symbol}`.
- Each candle item must include `date`, `open`, `high`, `low`, `close`, and `volume`.
- The frontend should continue calling Java only for market data, auth, portfolio, wallet, trade, and transactions.
- There is no WebSocket or SSE stream in the backend code, so the frontend should rely on request/response refreshes only.
- The live/sandbox badge is intentionally passive now because the backend already falls back automatically when the live gateway is unavailable.

## Suggestions
- Add a lightweight empty-state check for the candle chart when `historyData.length === 0` so the UI clearly shows when data has not loaded yet.
- Consider standardizing heading and body font sizes across all components so dashboard cards feel consistent.
- If the page should feel even more expansive later, remove remaining hard-coded height wrappers from the dashboard after verifying each card still renders correctly.
- If live candle data changes shape in the future, keep the chart adapter isolated in one component so the rendering logic stays easy to update.
