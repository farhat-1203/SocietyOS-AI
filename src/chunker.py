from langchain_text_splitters import RecursiveCharacterTextSplitter

# this is our file to chunk documents into smaller pieces for embedding and retrieval. 
# it uses a recursive character text splitter to ensure that chunks are of manageable size and overlap slightly for context.

def chunk_documents(documents, chunk_size=700, chunk_overlap=100):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " "]  
    )

    all_chunks = []

    for doc in documents:
        chunks = splitter.split_text(doc["content"])

        for i, chunk in enumerate(chunks):
            all_chunks.append({
                "text": chunk.strip(),
                "source": doc["source"],
                "doc_type": doc["doc_type"],
                "chunk_id": f"{doc['source']}_chunk_{i}"
            })

    print(f"Total chunks created: {len(all_chunks)}")
    return all_chunks