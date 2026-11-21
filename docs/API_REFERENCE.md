# ApexTrade AI - API Reference

The frontend calls Java as the public application API. Java proxies market-data requests to Python and owns paper-trading state.

## Java Market API

### `GET /api/market/price/{symbol}`

Proxies a real or delayed market-data lookup to the Python service.

Example response:

```json
{
  "symbol": "AAPL",
  "price": 189.24,
  "currency": "USD"
}
```

This endpoint provides market data only. It does not execute a trade.

## Java Trade API

### `POST /api/trade/buy`

Buys a virtual position using the authenticated user's simulated wallet.

Request:

```json
{
  "symbol": "AAPL",
  "quantity": 1.25
}
```

The quantity is required, positive, at most `1,000,000.0000`, and scale at most 4 decimal places. The symbol is trimmed, converted to uppercase, and restricted to 1–10 letters.

A successful response includes:

- `symbol`
- `quantity`
- `price`
- `totalCost`
- `remainingBalance`

### `POST /api/trade/sell`

Sells from a virtual position using the authenticated user's portfolio.

Request:

```json
{
  "symbol": "AAPL",
  "quantity": 1.25
}
```

A successful response includes:

- `symbol`
- `quantity`
- `price`
- `totalProceeds`
- `remainingBalance`

A full sell removes the position row instead of storing zero quantity.

## Python API

### `GET /price/{symbol}`

Returns a market price from the Python market-data service.

Example response:

```json
{
  "symbol": "AAPL",
  "price": 189.24,
  "currency": "USD"
}
```

Java validates the received price before using it in a trade.

## P0-2 Error Envelope

Trade and validation errors use JSON with these fields:

```json
{
  "timestamp": "2026-11-21T12:00:00Z",
  "status": 400,
  "code": "INVALID_QUANTITY",
  "message": "Quantity must be greater than zero",
  "path": "/api/trade/buy",
  "fieldErrors": {}
}
```

`fieldErrors` may contain field-specific validation messages for DTO validation failures.

### Implemented Trade Codes

| Code | Status | Meaning |
|------|--------|---------|
| `VALIDATION_ERROR` | 400 | Jakarta Bean Validation failed |
| `MALFORMED_REQUEST` | 400 | JSON could not be read |
| `INVALID_SYMBOL` | 400 | Symbol missing or outside the accepted pattern |
| `INVALID_QUANTITY` | 400 | Quantity null, non-positive, too precise, or too large |
| `INSUFFICIENT_FUNDS` | 400 | Virtual wallet cash is lower than total cost |
| `INSUFFICIENT_SHARES` | 400 | Virtual position is lower than sell quantity |
| `POSITION_NOT_FOUND` | 400 | Wallet, portfolio, or position is missing |
| `UPSTREAM_INVALID_PRICE` | 503 | Market price missing, malformed, zero, negative, or oversized |
| `UPSTREAM_UNAVAILABLE` | 503 | Python market-data call failed |
| `DATA_INTEGRITY_VIOLATION` | 409 | A database constraint or integrity rule rejected a write |
| `INTERNAL_ERROR` | 500 | Unexpected server-side failure |

P0-2 does not change authentication error behavior or global Jackson unknown-field behavior.

## Runtime Notes

- Prices are validated as positive `BigDecimal` values and normalized to scale 2 for trades.
- The application startup guard requires `TRADING_MODE=PAPER` or its default.
- P0-3 concurrency and idempotency behavior is not yet implemented.
- The documented error mappings are source-implemented but no live HTTP integration test was run in P0-2.
