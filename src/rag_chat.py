import requests
import time
from src.config import OLLAMA_MODEL, OLLAMA_API_URL, TOP_K
from src.retriever import retrieve

SYSTEM_PROMPT = """You are SocietyAI, an assistant for housing society residents.
Answer ONLY using the provided context.
Be concise and direct.
If the answer is not available in the context, say exactly:
"The requested information is not available in society records."
Do not make up information.
"""


def build_context(chunks):
    return "\n\n".join(
        f"[Source: {chunk['source']}\n\n{chunk['text']}" for chunk in chunks
    )


def generate_ollama(question, chunks):
    context = build_context(chunks)
    prompt = f"{SYSTEM_PROMPT}\n\nContext:\n{context}\n\nQuestion: {question}\nAnswer:"

    response = requests.post(
        OLLAMA_API_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "num_predict": 256,  # Reduced from 512 - shorter responses
            "temperature": 0.0,
            "stream": False,
            "num_ctx": 2048,  # Limit context window
        },
        timeout=180,
    )
    response.raise_for_status()
    payload = response.json()

    if "response" in payload:
        return payload["response"].strip()

    if "results" in payload and payload["results"]:
        result = payload["results"][0]
        output = result.get("output") or result.get("response")
        if isinstance(output, list):
            output = "".join(output)
        return str(output).strip()

    if "choices" in payload and payload["choices"]:
        output = payload["choices"][0].get("output") or payload["choices"][0].get("text")
        if isinstance(output, list):
            output = "".join(output)
        return str(output).strip()

    raise ValueError(f"Unexpected Ollama response: {payload}")


def ask_society_ai(question, index, metadata, top_k=TOP_K):
    chunks = retrieve(question, index, metadata, k=top_k)

    if not chunks:
        return {
            "answer": "The requested information is not available in society records.",
            "sources": []
        }

    try:
        answer = generate_ollama(question, chunks)
    except Exception:
        # Ollama failed or timed out — fall back to using retrieved chunks directly
        answer = "The requested information is not available in society records."

    sources = list(dict.fromkeys(chunk["source"] for chunk in chunks))

    # Fallback: if the model says 'not available' but we have vendor/emergency chunks, return those directly
    if answer.strip() == "The requested information is not available in society records.":
        for chunk in chunks:
            src = chunk.get("source", "").lower()
            if "vendor" in src or "vendors" in src or "emergency" in src:
                return {
                    "answer": chunk["text"],
                    "sources": [chunk["source"]],
                }

    return {
        "answer": answer,
        "sources": sources,
    }


def ask(question, index, metadata, top_k=TOP_K):
    return ask_society_ai(question, index, metadata, top_k)
