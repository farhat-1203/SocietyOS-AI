from src import knowledge_base as kb
from src.rag_chat import ask as rag_ask

# Keyword routing maps

CONTACT_KEYWORDS = [
    "emergency", "contact", "number", "call", "phone",
    "fire", "police", "ambulance", "helpline", "security number"
]

VENDOR_KEYWORDS = [
    "plumber", "electrician", "cleaner", "lift repair", "gardener",
    "carpenter", "ac repair", "vendor", "service", "technician",
    "who to call for", "book a"
]

COMMITTEE_KEYWORDS = [
    "chairman", "secretary", "treasurer", "committee",
    "who is in charge", "who manages", "contact person",
    "society office", "management"
]

NOTICE_KEYWORDS = [
    "notice", "announcement", "shutdown", "maintenance schedule",
    "pest control", "upcoming", "latest news", "what's happening",
    "any update", "schedule"
]

RAG_KEYWORDS = [
    "rule", "policy", "allowed", "permit", "can i", "is it allowed",
    "agm", "approved", "bylaw", "regulation", "timing", "fee",
    "renovation", "pet", "parking rules", "what does the society say"
]


def detect_intent(query):
    query_lower = query.lower()

    scores = {
        "contact": sum(1 for kw in CONTACT_KEYWORDS if kw in query_lower),
        "vendor": sum(1 for kw in VENDOR_KEYWORDS if kw in query_lower),
        "committee": sum(1 for kw in COMMITTEE_KEYWORDS if kw in query_lower),
        "notice": sum(1 for kw in NOTICE_KEYWORDS if kw in query_lower),
        "rag": sum(1 for kw in RAG_KEYWORDS if kw in query_lower),
    }

    best = max(scores, key=scores.get)

    # If no keyword matched at all, default to RAG
    if scores[best] == 0:
        return "rag"

    return best


def route_query(query, index, metadata):
    intent = detect_intent(query)

    print(f"[Router] Intent detected: {intent.upper()}")

    if intent == "contact":
        results = kb.search_contacts(query)
        if not results:
            return {"answer": "No matching contacts found.", "source": "emergency_contacts.json"}
        lines = [kb.format_contact(c) for c in results]
        return {
            "answer": "\n".join(lines),
            "source": "emergency_contacts.json",
            "intent": intent
        }

    elif intent == "vendor":
        results = kb.search_vendors(query)
        if not results:
            return {"answer": "No matching vendors found.", "source": "vendors.json"}
        lines = [kb.format_vendor(v) for v in results]
        return {
            "answer": "\n\n".join(lines),
            "source": "vendors.json",
            "intent": intent
        }

    elif intent == "committee":
        results = kb.search_committee(query)
        if not results:
            results = kb.get_all_committee()
        lines = [kb.format_committee(m) for m in results]
        return {
            "answer": "\n\n".join(lines),
            "source": "committee_members.json",
            "intent": intent
        }

    elif intent == "notice":
        results = kb.search_notices(query)
        if not results:
            results = kb.get_urgent_notices()
        lines = [kb.format_notice(n) for n in results]
        return {
            "answer": "\n\n".join(lines),
            "source": "notices.json",
            "intent": intent
        }

    else:
        # RAG path — rules, policies, AGM decisions
        result = rag_ask(query, index, metadata)
        result["intent"] = "rag"
        return result