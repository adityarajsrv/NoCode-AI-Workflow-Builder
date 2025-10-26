from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
from utils.config import settings
from core.text_extractor import extract_text_from_pdf, chunk_text
from core.embeddings import embed_texts
from core.vectorstore import add_document_chunks
from utils.logger import get_logger

router = APIRouter()
logger = get_logger("api.documents")

os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename
    if not (filename.lower().endswith(".pdf") or filename.lower().endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF or TXT allowed")

    file_id = str(uuid.uuid4())
    save_path = os.path.join(settings.UPLOAD_FOLDER, f"{file_id}_{filename}")
    with open(save_path, "wb") as f:
        content = await file.read()
        f.write(content)
    logger.info(f"Saved uploaded file to {save_path}")

    text = extract_text_from_pdf(save_path) if filename.lower().endswith(".pdf") else content.decode("utf-8")
    chunks = chunk_text(text, chunk_size=800, overlap=80)
    embeddings = embed_texts(chunks)
    metas = [{"source": filename, "chunk_index": i} for i in range(len(chunks))]
    add_document_chunks(doc_id=file_id, chunks=chunks, embeddings=embeddings, metas=metas)
    return {"message": "uploaded", "file_id": file_id, "chunks": len(chunks)}
