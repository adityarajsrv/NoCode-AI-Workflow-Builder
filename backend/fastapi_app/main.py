from fastapi import FastAPI,  UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from utils.logger import get_logger
from db import database, models
from api import documents, workflows, chat

logger = get_logger("main")
app = FastAPI(title="NoCode AI Builder Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.on_event("startup")
def on_startup():
    logger.info("Starting app - ensuring DB tables exist")
    models.Base.metadata.create_all(bind=database.engine)
    logger.info("Startup complete")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": file.filename, "message": "File uploaded successfully!"}

@app.get("/")
def root():
    return {"status": "ok", "message": "NoCode AI Backend running"}
