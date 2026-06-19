# ApexTrade AI - API Reference

## Java API
### `GET /api/market/price/{symbol}`
Proxies a live market price request to the Python service.

Example response:
```json
{
  "symbol": "AAPL",
  "price": 189.24,
  "currency": "USD"
}
```

## Python API
### `GET /price/{symbol}`
Returns a live price from yFinance.

Example response:
```json
{
  "symbol": "AAPL",
  "price": 189.24,
  "currency": "USD"
}
```

## Error Behavior
- If the symbol cannot be resolved, the Python service returns `404`.
- The Java service forwards that failure as part of the proxied response path.

## Notes
- The frontend should call Java only.
- Java is the stable public API layer for the app.