import google.generativeai as genai
from utils.config import settings
from utils.logger import get_logger

logger = get_logger("embeddings")
genai.configure(api_key=settings.GEMINI_API_KEY)

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Return list of embeddings (one per text). Uses Gemini embeddings model.
    """
    logger.info(f"Requesting embeddings for {len(texts)} chunks")
    embeddings = []
    for t in texts:
        res = genai.embed_content(model="models/embedding-001", content=t)
        emb = res.get("embedding") or res.get("data", [{}])[0].get("embedding")
        embeddings.append(emb)
    logger.info("Received embeddings")
    return embeddings
