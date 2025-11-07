from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from utils.logger import get_logger
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
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",
        # Add your Render frontend URL here later:
        # "https://your-frontend.onrender.com"
    ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM"])

@app.on_event("startup")
def on_startup():
    """Initialize application on startup - OPTIMIZED for Render"""
    logger.info("🚀 Starting NoCode AI Builder Backend - Render Optimized")
    
    try:
        models.Base.metadata.create_all(bind=database.engine)
        logger.info("✅ Database tables initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    
    os.makedirs("uploads", exist_ok=True)
    
    logger.info("📦 Heavy models will load on-demand to save memory")
    logger.info("✅ Application startup complete")

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "ok", 
        "message": "NoCode AI Builder Backend running on Render",
        "version": "1.0",
        "optimized": True
    }

@app.get("/health")
def health_check():
    """Detailed health check - lightweight for Render"""
    return {
        "status": "healthy",
        "environment": "render" if os.getenv('RENDER') else "local",
        "memory_optimized": True,
        "upload_dir": "exists" if os.path.exists("uploads") else "missing"
    }