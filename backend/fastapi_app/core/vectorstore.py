import chromadb
from utils.logger import get_logger

logger = get_logger("vectorstore")

try:
    client = chromadb.PersistentClient(path="./chroma_db")
    logger.info("✅ ChromaDB client initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize ChromaDB: {e}")
    raise e

try:
    collection = client.get_or_create_collection(name="documents")
    logger.info("✅ ChromaDB collection 'documents' ready")
except Exception as e:
    logger.error(f"❌ Failed to get/create collection: {e}")
    raise e

def add_document_chunks(doc_id: str, chunks: list[str], embeddings: list[list[float]], metas: list[dict] = None):
    """Add document chunks to ChromaDB"""
    try:
        ids = [f"{doc_id}-{i}" for i in range(len(chunks))]
        metas = metas or [{} for _ in chunks]
        
        logger.info(f"🔄 Adding {len(chunks)} chunks to ChromaDB for doc {doc_id}")
        
        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metas
        )
        
        logger.info(f"✅ Successfully added {len(chunks)} chunks to ChromaDB")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error adding documents to ChromaDB: {e}")
        return False

def query_similar(query_text: str, n_results: int = 3):
    """Query similar documents from ChromaDB"""
    try:
        logger.info(f"🔍 Querying ChromaDB for: {query_text}")
        
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i in range(len(results["documents"][0])):
                formatted_results.append({
                    "id": results["ids"][0][i] if results["ids"] else f"doc-{i}",
                    "text": results["documents"][0][i],
                    "meta": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else 0.0
                })
        
        logger.info(f"✅ Found {len(formatted_results)} similar documents")
        return formatted_results
        
    except Exception as e:
        logger.error(f"❌ Error querying ChromaDB: {e}")
        return []

def reset_collection():
    """Reset the collection (for testing)"""
    try:
        client.delete_collection(name="documents")
        global collection
        collection = client.create_collection(name="documents")
        logger.info("✅ ChromaDB collection reset successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Error resetting collection: {e}")
        return False