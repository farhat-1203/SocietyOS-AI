from sentence_transformers import SentenceTransformer
import numpy as np
from src.config import EMBEDDING_MODEL

model = SentenceTransformer(EMBEDDING_MODEL)

def get_embedding(text):
    if not isinstance(text, str):
        raise ValueError("Text must be a string.")
    embedding = model.encode(
        text,
        normalize_embeddings=True
    )
    return np.array(embedding, dtype="float32")


def get_embeddings(texts, batch_size=32):
    if not isinstance(texts, (list, tuple)):
        raise ValueError("Texts must be a list of strings.")
    embeddings = model.encode(
        list(texts),
        batch_size=batch_size,
        show_progress_bar=True,
        normalize_embeddings=True
    )
    return np.array(embeddings, dtype="float32")
