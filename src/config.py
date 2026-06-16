OLLAMA_MODEL = "qwen2.5:7b"
TOP_K = 20
EMBEDDING_MODEL = "BAAI/bge-m3"
VECTOR_STORE_DIR = "vector_store"
FAISS_INDEX_PATH = f"{VECTOR_STORE_DIR}/index.faiss"
METADATA_PATH = f"{VECTOR_STORE_DIR}/metadata.json"
OLLAMA_API_URL = "http://localhost:11434/api/generate"
