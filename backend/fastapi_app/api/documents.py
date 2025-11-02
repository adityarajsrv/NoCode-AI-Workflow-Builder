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

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF or TXT files allowed")

    file_id = str(uuid.uuid4())
    save_path = os.path.join(settings.UPLOAD_FOLDER, f"{file_id}_{file.filename}")
    
    try:
        # Save the file
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
        logger.info(f"Saved uploaded file to {save_path}")

        # Extract text based on file type
        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(save_path)
        else:
            text = content.decode("utf-8")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="File appears to be empty or could not be processed")
        
        # Process and chunk the text
        chunks = chunk_text(text, chunk_size=800, overlap=80)
        logger.info(f"Created {len(chunks)} chunks from document")
        
        if not chunks:
            raise HTTPException(status_code=400, detail="No text content could be extracted from file")
        
        # Generate embeddings and store in vector database
        embeddings = embed_texts(chunks)
        metas = [{"source": file.filename, "chunk_index": i, "file_id": file_id} for i in range(len(chunks))]
        
        add_document_chunks(doc_id=file_id, chunks=chunks, embeddings=embeddings, metas=metas)
        
        return {
            "message": "File uploaded and processed successfully", 
            "file_id": file_id, 
            "chunks": len(chunks),
            "filename": file.filename
        }
        
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        # Clean up the saved file if there was an error
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")