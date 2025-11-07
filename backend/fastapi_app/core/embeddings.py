from sentence_transformers import SentenceTransformer # type: ignore
from utils.logger import get_logger
import numpy as np
import os
import gc

logger = get_logger("embeddings")

class LocalEmbedder:
    def __init__(self):
        self.model = None
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"  
        self.is_loaded = False
    
    def _load_model(self):
        """Load model only when absolutely needed with memory optimizations"""
        if self.is_loaded:
            return True
            
        try:
            logger.info(f"🚀 Loading optimized embedding model: {self.model_name}")
            
            os.environ["TOKENIZERS_PARALLELISM"] = "false"
            
            self.model = SentenceTransformer(
                self.model_name,
                device='cpu',
                cache_folder='./model_cache'
            )
            
            import torch
            torch.cuda.empty_cache() if torch.cuda.is_available() else None
            
            self.is_loaded = True
            logger.info("✅ Model loaded successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Model loading failed: {str(e)}")
            self.is_loaded = False
            return False
    
    def embed_texts(self, texts: list) -> list:
        """Generate embeddings with maximum memory efficiency"""
        if not texts:
            return []
        
        if len(texts) == 1 and len(texts[0]) < 10:
            return self._fallback_embeddings(texts)
            
        if not self._load_model():
            return self._fallback_embeddings(texts)
        
        try:
            batch_size = min(4, len(texts))  
            all_embeddings = []
            
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                
                batch_embeddings = self.model.encode(
                    batch_texts,
                    convert_to_tensor=False,
                    normalize_embeddings=True,
                    show_progress_bar=False,
                    batch_size=2,  
                    convert_to_numpy=True  
                )
                
                embeddings_list = batch_embeddings.tolist() if hasattr(batch_embeddings, 'tolist') else batch_embeddings
                all_embeddings.extend(embeddings_list)
                
                del batch_embeddings
                gc.collect()
            
            logger.info(f"✅ Generated {len(all_embeddings)} embeddings")
            return all_embeddings
            
        except Exception as e:
            logger.error(f"❌ Embedding failed: {str(e)}")
            return self._fallback_embeddings(texts)
    
    def _fallback_embeddings(self, texts: list) -> list:
        """Memory-efficient fallback embeddings"""
        embedding_size = 384  
        embeddings = []
        
        for text in texts:
            seed = abs(hash(text)) % 10000
            np.random.seed(seed)
            embedding = np.random.normal(0, 0.1, embedding_size).tolist()
            embeddings.append(embedding)
            
        logger.info(f"📦 Used fallback for {len(texts)} texts")
        return embeddings

local_embedder = LocalEmbedder()

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Main embedding function with memory guard"""
    return local_embedder.embed_texts(texts)

def get_model_info():
    return {
        "model_name": local_embedder.model_name,
        "is_loaded": local_embedder.is_loaded,
        "dimensions": 384
    }