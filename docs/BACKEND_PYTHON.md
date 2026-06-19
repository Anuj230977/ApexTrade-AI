# ApexTrade AI - Python Backend

## Role
The Python service is the market-data layer. It resolves live stock prices and keeps that logic separate from the Java gateway.

## Current Endpoint
- `GET /price/{symbol}`

## Behavior
- Uses yFinance to fetch market data
- Returns the symbol in uppercase
- Falls back to `currentPrice` or `regularMarketPrice`
- Returns `404` if no price can be found

## Response Shape
```json
{
  "symbol": "AAPL",
  "price": 189.24,
  "currency": "USD"
}
```

## Notes
- CORS is enabled for local development
- The service is intentionally simple so the Java layer can own the public API