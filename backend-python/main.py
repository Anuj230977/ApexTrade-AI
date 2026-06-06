from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/price/{symbol}")
def get_price(symbol: str):
    ticker = yf.Ticker(symbol.upper())
    info = ticker.info

    price = info.get("currentPrice") or info.get("regularMarketPrice")
    if price is None:
        raise HTTPException(status_code=404, detail=f"Price not found for symbol: {symbol}")

    return {
        "symbol": symbol.upper(),
        "price": round(float(price), 2),
        "currency": info.get("currency", "USD"),
    }
