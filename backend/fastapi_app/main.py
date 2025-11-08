from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from utils.logger import get_logger
from db import database, models
from api import documents, workflows, llm

logger = get_logger("main")
app = FastAPI(title="NoCode AI Builder Backend", version="1.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM"])

@app.on_event("startup")
def on_startup():
    """Initialize application on startup"""
    logger.info("Starting NoCode AI Builder Backend")
    
    # Create database tables
    models.Base.metadata.create_all(bind=database.engine)
    
    # Ensure upload directory exists
    os.makedirs("uploads", exist_ok=True)
    
    logger.info("Application startup complete")

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "ok", 
        "message": "NoCode AI Builder Backend running",
        "version": "1.0"
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected" if database.engine else "disconnected",
        "upload_dir": "exists" if os.path.exists("uploads") else "missing"
    }

if __name__ == "__main__":
    import os
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting server on port {port}")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        workers=1
    )