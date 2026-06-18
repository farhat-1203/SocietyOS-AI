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


from src.vector_db import load_index
from src.query_router import route_query
from src.knowledge_base import get_urgent_notices, format_notice

print("=== SocietyAI Knowledge Base ===\n")

# Show urgent notices on startup
urgent = get_urgent_notices()
if urgent:
    print("URGENT NOTICES:")
    for n in urgent:
        print(f"  {format_notice(n)}")
    print()

index, metadata = load_index()

print("Ask anything about your society. Type 'exit' to quit.\n")

while True:
    question = input("You: ").strip()
    if not question:
        continue
    if question.lower() == "exit":
        break

    result = route_query(question, index, metadata)

    print(f"\nSocietyAI [{result.get('intent', '').upper()}]:")
    print(result["answer"])
    print(f"\nSource: {result.get('source', result.get('sources', ''))}")
    print()