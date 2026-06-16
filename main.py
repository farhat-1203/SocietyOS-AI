from src.vector_db import load_index
from src.rag_chat import ask

print("=== SocietyAI RAG Assistant ===")
print("Type your question. Type 'exit' to quit.\n")

index, metadata = load_index()

while True:
    question = input("You: ").strip()

    if not question:
        continue
    if question.lower() == "exit":
        break

    result = ask(question, index, metadata)

    print(f"\nSocietyAI: {result['answer']}")
    print(f"Sources   : {', '.join(result['sources'])}")
    print()