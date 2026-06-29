from groq import Groq
import os

from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_signal(symbol: str, current_price: float, news_chunks: list[str]) -> dict:
    if not news_chunks:
        news_text = "No recent news available."
    else:
        news_text = "\n".join(f"- {chunk}" for chunk in news_chunks)

    prompt = f"""You are a financial analyst AI. Analyze the following data and provide a trading signal.

Symbol: {symbol}
Current Price: ${current_price}

Recent News:
{news_text}

Based on this information, provide:
1. Signal: BUY, SELL, or HOLD
2. Confidence: HIGH, MEDIUM, or LOW
3. Reasoning: 2-3 sentences explaining your decision

Respond in this exact format:
SIGNAL: <BUY/SELL/HOLD>
CONFIDENCE: <HIGH/MEDIUM/LOW>
REASONING: <your reasoning>"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.3
    )

    raw = response.choices[0].message.content.strip()

    signal = "HOLD"
    confidence = "LOW"
    reasoning = raw

    for line in raw.split("\n"):
        if line.startswith("SIGNAL:"):
            signal = line.replace("SIGNAL:", "").strip()
        elif line.startswith("CONFIDENCE:"):
            confidence = line.replace("CONFIDENCE:", "").strip()
        elif line.startswith("REASONING:"):
            reasoning = line.replace("REASONING:", "").strip()

    return {
        "symbol": symbol,
        "signal": signal,
        "confidence": confidence,
        "reasoning": reasoning,
        "price": current_price
    }