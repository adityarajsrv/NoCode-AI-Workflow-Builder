import chromadb
from chromadb.config import Settings as ChromaSettings
from utils.config import settings
from utils.logger import get_logger

logger = get_logger("vectorstore")

client = chromadb.Client(ChromaSettings(persist_directory=settings.CHROMADB_PATH))
collection = client.get_or_create_collection(name="documents")

def add_document_chunks(doc_id: str, chunks: list[str], embeddings: list[list[float]], metas: list[dict] = None):
    ids = [f"{doc_id}-{i}" for i in range(len(chunks))]
    metas = metas or [{} for _ in chunks]
    logger.info(f"Adding {len(chunks)} chunks to Chroma for doc {doc_id}")
    collection.add(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metas)

def query_similar(query_text: str, n_results: int = 3):
    """
    Simple semantic query — returns list of {id, document, metadata, distance}
    """
    logger.info("Querying Chroma for similar docs")
    results = collection.query(query_texts=[query_text], n_results=n_results, include=["documents", "metadatas", "ids", "distances"])
    if not results or len(results["documents"]) == 0:
        return []
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    ids = results["ids"][0]
    dists = results["distances"][0]
    out = []
    for i in range(len(docs)):
        out.append({"id": ids[i], "text": docs[i], "meta": metas[i], "distance": dists[i]})
    return out
