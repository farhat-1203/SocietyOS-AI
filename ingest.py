from src.pdf_loader import load_all_pdfs
from src.chunker import chunk_documents
from src.embedder import get_embeddings
from src.vector_db import save_index

print("=== SocietyAI RAG Ingestion ===\n")

# 1. Load PDFs
documents = load_all_pdfs()

# 2. Chunk
chunks = chunk_documents(documents)

# 3. Embed
texts = [chunk["text"] for chunk in chunks]
embeddings = get_embeddings(texts)

# 4. Build FAISS index
save_index(embeddings, chunks)

print("\nIngestion complete. Run main.py to start chatting.")
