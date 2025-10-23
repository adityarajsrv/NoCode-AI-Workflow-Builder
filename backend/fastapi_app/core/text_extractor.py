import fitz  
from utils.logger import get_logger

logger = get_logger("text_extractor")

def extract_text_from_pdf(path: str) -> str:
    logger.info(f"Extracting text from {path}")
    text = ""
    with fitz.open(path) as doc:
        for page in doc:
            page_text = page.get_text()
            text += page_text + "\n"
    logger.info(f"Extracted {len(text)} characters")
    return text

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 50):
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if overlap >= chunk_size:
        overlap = chunk_size // 2  

    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        chunks.append(text[start:end].strip())
        start += chunk_size - overlap
        if start < 0:
            start = 0
    return [c for c in chunks if c]

