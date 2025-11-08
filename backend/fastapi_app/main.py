from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from utils.logger import get_logger
from utils.config import settings  
from db import database, models
from api import documents, workflows, llm

logger = get_logger("main")

app = FastAPI(
    title="NoCode AI Builder Backend", 
    version="1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM"])

@app.on_event("startup")
def on_startup():
    """Initialize application on startup"""
    logger.info("Starting NoCode AI Builder Backend")
    
    models.Base.metadata.create_all(bind=database.engine)
    
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    
    logger.info("Application startup complete")
    logger.info(f"Upload folder: {settings.UPLOAD_FOLDER}")
    logger.info(f"CORS origins: {settings.get_cors_origins}")

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "ok", 
        "message": "NoCode AI Builder Backend running",
        "version": "1.0",
        "environment": "production"
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected" if database.engine else "disconnected",
        "upload_dir": "exists" if os.path.exists(settings.UPLOAD_FOLDER) else "missing",
        "cors_origins": settings.get_cors_origins
    }

@app.get("/config")
def show_config():
    """Show current configuration (for debugging)"""
    return {
        "database_url": settings.DATABASE_URL,
        "upload_folder": settings.UPLOAD_FOLDER,
        "chromadb_path": settings.CHROMADB_PATH,
        "cors_origins": settings.get_cors_origins,
        "client_url": settings.CLIENT_URL,
        "auth_url": settings.AUTH_URL,
        "fastapi_url": settings.FASTAPI_URL
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting server on port {port}")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        workers=1
    )