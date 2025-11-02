import chromadb
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

# Initialize persistent client with increased timeout
client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=chromadb.Settings(
        chroma_server_http_timeout=300,
        allow_reset=True
    )
)

# Initialize local embedding model
embedding_model = None

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        logger.info("🚀 Loading local embedding model: all-MiniLM-L6-v2")
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("✅ Local embedding model loaded successfully!")
    return embedding_model

def get_embeddings(texts):
    """Generate embeddings using local model"""
    model = get_embedding_model()
    if isinstance(texts, str):
        texts = [texts]
    embeddings = model.encode(texts).tolist()
    return embeddings

# Create collection with custom embedding function
try:
    collection = client.get_collection("documents")
except Exception as e:
    logger.info("Creating new collection 'documents'")
    collection = client.create_collection(
        name="documents",
        embedding_function=get_embeddings
    )

def add_documents(documents, metadatas=None, ids=None):
    """Add documents to the vector store"""
    try:
        if ids is None:
            ids = [f"doc_{i}" for i in range(len(documents))]
        
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        logger.info(f"✅ Added {len(documents)} documents to vector store")
        return True
    except Exception as e:
        logger.error(f"❌ Error adding documents: {e}")
        return False

def query_similar(query_text, n_results=3):
    """Query similar documents from vector store"""
    try:
        logger.info(f"🔍 Querying Chroma for: {query_text}")
        
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        
        logger.info(f"✅ Found {len(results['documents'][0])} similar documents")
        return results
    except Exception as e:
        logger.error(f"❌ Error querying vector store: {e}")
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

def reset_vector_store():
    """Reset the vector store"""
    try:
        client.delete_collection("documents")
        global collection
        collection = client.create_collection(
            name="documents",
            embedding_function=get_embeddings
        )
        logger.info("✅ Vector store reset successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Error resetting vector store: {e}")
        return False