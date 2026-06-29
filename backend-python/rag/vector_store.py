import chromadb
from chromadb.utils import embedding_functions

chroma_client = chromadb.Client()
default_ef = embedding_functions.DefaultEmbeddingFunction()

def get_or_create_collection(symbol: str):
    name = f"news_{symbol.lower()}"
    return chroma_client.get_or_create_collection(
        name=name,
        embedding_function=default_ef
    )

def store_articles(symbol: str, articles: list[dict]):
    collection = get_or_create_collection(symbol)
    existing = collection.get()
    existing_ids = set(existing["ids"])

    docs, ids, metas = [], [], []
    for i, article in enumerate(articles):
        doc_id = f"{symbol}_{i}"
        if doc_id not in existing_ids:
            docs.append(article["text"])
            ids.append(doc_id)
            metas.append({
                "title": article["title"],
                "published": article["published"]
            })

    if docs:
        collection.add(documents=docs, ids=ids, metadatas=metas)

def query_relevant_news(symbol: str, query: str, n_results: int = 5) -> list[str]:
    collection = get_or_create_collection(symbol)
    count = collection.count()
    if count == 0:
        return []
    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, count)
    )
    return results["documents"][0] if results["documents"] else []