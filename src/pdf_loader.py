import os
from pypdf import PdfReader
import json

# just a sanity check to ensure that the PDF reader is working correctly and can extract text from a sample PDF file.

DOCUMENT_TYPES = {
    "AGM_Minutes.pdf": "agm",
    "Society_Circulars.pdf": "circular",
    "Society_Notices.pdf": "notice",
    "housing_society_documents.pdf": "bylaws",
}

def load_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        extracted = page.extract_text()

        if extracted:
            extracted = extracted.replace("■", "Rs. ")
            extracted = extracted.replace("₹", "Rs. ")
            extracted = extracted.replace("â‚¹", "Rs. ")
            extracted = extracted.replace("\t", " ")
            extracted = extracted.replace("  ", " ")

            text += extracted + "\n"

    return text

def load_all_pdfs(data_folder=None):
    if data_folder is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_folder = os.path.join(script_dir, "..", "data")
    
    documents = []

    for filename in os.listdir(data_folder):
        if not filename.endswith(".pdf"):
            continue

        file_path = os.path.join(data_folder, filename)
        text = load_pdf(file_path)

        if not text.strip():
            print(f"WARNING: {filename} extracted no text — may be scanned/image PDF")
            continue

        documents.append({
            "source": filename,
            "doc_type": DOCUMENT_TYPES.get(filename, "general"),
            "content": text
        })
        print(f"Loaded: {filename} ({len(text)} chars)")

    return documents


def load_all_jsons(kb_folder=None):
    """Load structured JSON knowledge base files and convert entries to readable text documents.

    Returns a list of documents with keys: source, doc_type, content
    """
    if kb_folder is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        kb_folder = os.path.join(script_dir, "..", "knowledge_base")

    docs = []

    if not os.path.exists(kb_folder):
        print(f"Knowledge base folder not found: {kb_folder}")
        return docs

    for filename in os.listdir(kb_folder):
        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(kb_folder, filename)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"Failed loading {filename}: {e}")
            continue

        key = filename.lower()

        # Handle known KB file formats
        entries = []
        if "committee" in key:
            entries = data.get("committee_members", [])
            doc_type = "committee"
            for e in entries:
                content = (
                    f"Name: {e.get('name')}\nRole: {e.get('role')}\nFlat: {e.get('flat')}\n"
                    f"Contact: {e.get('contact')}\nEmail: {e.get('email')}\n"
                    f"Responsibilities: {', '.join(e.get('responsibilities', []))}"
                )
                docs.append({"source": filename, "doc_type": doc_type, "content": content})

        elif "emergency" in key or "contacts" in key:
            entries = data.get("emergency_contacts", [])
            doc_type = "emergency_contact"
            for e in entries:
                content = (
                    f"Name: {e.get('name')}\nCategory: {e.get('category')}\n"
                    f"Number: {e.get('number')}\nAvailable: {e.get('available')}"
                )
                docs.append({"source": filename, "doc_type": doc_type, "content": content})

        elif "vendor" in key or "vendors" in key:
            entries = data.get("vendors", [])
            doc_type = "vendor"
            for v in entries:
                content = (
                    f"Name: {v.get('name')}\nCategory: {v.get('category')}\nContact: {v.get('contact')}\n"
                    f"Available: {v.get('available')}\nRate: {v.get('rate')}\nNotes: {v.get('notes')}"
                )
                docs.append({"source": filename, "doc_type": doc_type, "content": content})

        elif "notice" in key:
            entries = data.get("notices", [])
            doc_type = "notice"
            for n in entries:
                content = (
                    f"Title: {n.get('title')}\nDate: {n.get('date')}\nUrgent: {n.get('urgent')}\n"
                    f"Category: {n.get('category')}\nContent: {n.get('content')}"
                )
                docs.append({"source": filename, "doc_type": doc_type, "content": content})

        else:
            # Generic fallback — stringify the JSON
            doc_type = "json"
            docs.append({"source": filename, "doc_type": doc_type, "content": json.dumps(data, ensure_ascii=False)})

        print(f"Loaded KB: {filename} ({len(entries) if isinstance(entries, list) else 1} items)")

    return docs

if __name__ == "__main__":
    docs = load_all_pdfs()
    for doc in docs:
        print(f"\n--- {doc['source']} ---")
        print(doc["content"][:300])