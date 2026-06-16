from src.embedder import get_embedding
from src.vector_db import search


def retrieve(question, index, metadata, k=20):
    query_embedding = get_embedding(question)
    hits = search(query_embedding, index, metadata, top_k=k)

    return [
        {
            "text": hit["text"],
            "source": hit["source"],
        }
        for hit in hits
    ]
