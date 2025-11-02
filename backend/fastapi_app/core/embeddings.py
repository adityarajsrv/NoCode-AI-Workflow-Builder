from sentence_transformers import SentenceTransformer # type: ignore
from utils.logger import get_logger
import numpy as np

logger = get_logger("embeddings")

class LocalEmbedder:
    def __init__(self):
        self.model = None
        self.model_name = "all-MiniLM-L6-v2"  # Fast, free, reliable
        self.is_loaded = False
        self.load_model()
    
    def load_model(self):
        """Load the local embedding model"""
        try:
            logger.info(f"🚀 Loading local embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            self.is_loaded = True
            logger.info("✅ Local embedding model loaded successfully!")
            logger.info(f"📊 Model dimensions: {self.model.get_sentence_embedding_dimension()}")
        except Exception as e:
            logger.error(f"❌ Failed to load embedding model: {str(e)}")
            self.is_loaded = False
            raise e
    
    def embed_texts(self, texts: list) -> list:
        """Generate embeddings for a list of texts"""
        if not texts:
            return []
            
        if not self.is_loaded or self.model is None:
            logger.error("❌ Model not loaded, using emergency fallback")
            return self._fallback_embeddings(texts)
        
        logger.info(f"🔄 Generating embeddings for {len(texts)} text chunks")
        
        try:
            # Generate embeddings
            embeddings = self.model.encode(
                texts,
                convert_to_tensor=False,
                normalize_embeddings=True,
                show_progress_bar=False
            ).tolist()
            
            logger.info(f"✅ Successfully generated {len(embeddings)} embeddings")
            logger.info(f"📐 Embedding dimensions: {len(embeddings[0])}D")
            return embeddings
            
        except Exception as e:
            logger.error(f"❌ Embedding generation failed: {str(e)}")
            logger.warning("🔄 Using fallback embeddings")
            return self._fallback_embeddings(texts)
    
    def _fallback_embeddings(self, texts: list) -> list:
        """Simple fallback if model fails"""
        logger.warning("Using fallback embedding method")
        embeddings = []
        embedding_size = 384  # Same as MiniLM
        
        for i, text in enumerate(texts):
            # Create deterministic embeddings based on text content
            np.random.seed(hash(text) % 10000)
            embedding = np.random.normal(0, 1, embedding_size).tolist()
            embeddings.append(embedding)
            
        logger.info(f"📦 Generated {len(embeddings)} fallback embeddings")
        return embeddings

# Global instance - this will load automatically when imported
local_embedder = LocalEmbedder()

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Main function - uses local embeddings instead of Gemini
    """
    return local_embedder.embed_texts(texts)

def get_model_info():
    """Get information about the current embedding model"""
    return {
        "model_name": local_embedder.model_name,
        "is_loaded": local_embedder.is_loaded,
        "dimensions": 384 if local_embedder.is_loaded else "unknown"
    }