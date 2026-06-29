from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import re
import os
from rag.news_fetcher import fetch_news
from rag.vector_store import store_articles, query_relevant_news
from rag.signal_generator import generate_signal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYMBOL_PATTERN = re.compile(r'^[A-Z]{1,10}$')

def validate_symbol(symbol: str):
    clean = symbol.upper().strip()
    if not SYMBOL_PATTERN.match(clean):
        raise HTTPException(status_code=400, detail=f"Invalid symbol: {symbol}")
    return clean


@app.get("/price/{symbol}")
def get_price(symbol: str):
    symbol = validate_symbol(symbol)
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        price = info.get("currentPrice") or info.get("regularMarketPrice")
        if price is None:
            raise HTTPException(status_code=404, detail=f"Price not found for symbol: {symbol}")
        return {
            "symbol": symbol,
            "price": round(float(price), 2),
            "currency": info.get("currency", "USD"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Market data unavailable: {str(e)}")


@app.get("/history/{symbol}")
def get_history(symbol: str, period: str = "1mo", interval: str = "1d"):
    symbol = validate_symbol(symbol)
    valid_periods = {"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y"}
    valid_intervals = {"1m", "5m", "15m", "30m", "1h", "1d", "1wk", "1mo"}
    if period not in valid_periods:
        raise HTTPException(status_code=400, detail=f"Invalid period: {period}")
    if interval not in valid_intervals:
        raise HTTPException(status_code=400, detail=f"Invalid interval: {interval}")
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No history for symbol: {symbol}")
        result = []
        for date, row in hist.iterrows():
            result.append({
                "date": date.strftime("%Y-%m-%d %H:%M:%S"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })
        return {"symbol": symbol, "period": period, "interval": interval, "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Market data unavailable: {str(e)}")


@app.get("/signal/{symbol}")
def get_signal(symbol: str):
    symbol = validate_symbol(symbol)
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        price = info.get("currentPrice") or info.get("regularMarketPrice")
        if price is None:
            raise HTTPException(status_code=404, detail=f"Price not found for symbol: {symbol}")
        price = round(float(price), 2)

        articles = fetch_news(symbol)
        store_articles(symbol, articles)
        relevant_chunks = query_relevant_news(symbol, f"{symbol} stock price analysis", n_results=5)
        signal = generate_signal(symbol, price, relevant_chunks)
        return signal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Signal generation failed: {str(e)}")