from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import re
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


def fetch_history(symbol: str, period: str, interval: str):
    ticker = yf.Ticker(symbol)
    return ticker.history(period=period, interval=interval, timeout=10)


def fetch_latest_price(symbol: str):
    history = fetch_history(symbol, period="5d", interval="1d")
    if history.empty or history["Close"].dropna().empty:
        raise HTTPException(status_code=404, detail=f"Price not found for symbol: {symbol}")

    return round(float(history["Close"].dropna().iloc[-1]), 2)


@app.get("/price/{symbol}")
def get_price(symbol: str):
    symbol = validate_symbol(symbol)
    try:
        price = fetch_latest_price(symbol)
        return {
            "symbol": symbol,
            "price": round(float(price), 2),
            "currency": "USD",
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
        hist = fetch_history(symbol, period=period, interval=interval)
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
        price = fetch_latest_price(symbol)

        articles = fetch_news(symbol)
        store_articles(symbol, articles)
        relevant_chunks = query_relevant_news(symbol, f"{symbol} stock price analysis", n_results=5)
        signal = generate_signal(symbol, price, relevant_chunks)
        return signal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Signal generation failed: {str(e)}")