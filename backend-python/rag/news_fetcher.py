import feedparser
import re

RSS_FEEDS = {
    "default": "https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US",
}

def fetch_news(symbol: str, max_articles: int = 10) -> list[dict]:
    url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol}&region=US&lang=en-US"
    feed = feedparser.parse(url)

    articles = []
    for entry in feed.entries[:max_articles]:
        title = entry.get("title", "").strip()
        summary = entry.get("summary", "").strip()
        published = entry.get("published", "")
        clean_summary = re.sub(r'<[^>]+>', '', summary)
        if title:
            articles.append({
                "title": title,
                "summary": clean_summary,
                "published": published,
                "text": f"{title}. {clean_summary}"
            })

    return articles