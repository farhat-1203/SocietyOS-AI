import os
from pypdf import PdfReader

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


if __name__ == "__main__":
    docs = load_all_pdfs()
    for doc in docs:
        print(f"\n--- {doc['source']} ---")
        print(doc["content"][:300])