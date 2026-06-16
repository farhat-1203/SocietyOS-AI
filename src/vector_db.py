import faiss
import json
import os
import numpy as np
from src.config import FAISS_INDEX_PATH, METADATA_PATH, VECTOR_STORE_DIR


def save_index(embeddings, chunks):
    os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

    if embeddings.ndim != 2:
        raise ValueError("Embeddings must be a 2D numpy array.")

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(np.asarray(embeddings, dtype="float32"))

    faiss.write_index(index, FAISS_INDEX_PATH)

    metadata = [
        {
            "text": chunk["text"],
            "source": chunk["source"],
            "document_type": chunk.get("doc_type", "general"),
            "chunk_id": chunk.get("chunk_id")
        }
        for chunk in chunks
    ]

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"FAISS index built: {index.ntotal} vectors")
    print(f"Metadata saved: {METADATA_PATH}")
    return index, metadata


def load_index():
    if not os.path.exists(FAISS_INDEX_PATH) or not os.path.exists(METADATA_PATH):
        raise FileNotFoundError("Vector store not found. Run ingest.py first.")

    index = faiss.read_index(FAISS_INDEX_PATH)

    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    print(f"Loaded FAISS index: {index.ntotal} vectors")
    return index, metadata


def search(query_embedding, index, metadata, top_k=5):
    query_vec = np.asarray(query_embedding, dtype="float32")
    if query_vec.ndim == 1:
        query_vec = query_vec.reshape(1, -1)

    scores, indices = index.search(query_vec, top_k)
    results = []

    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        item = metadata[idx]
        results.append({
            "text": item["text"],
            "source": item["source"],
            "document_type": item.get("document_type"),
            "chunk_id": item.get("chunk_id"),
            "score": round(float(score), 4),
        })

    return results
