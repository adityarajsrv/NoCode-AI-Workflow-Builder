from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from utils.logger import get_logger
from db import database, models
from api import documents, workflows, llm

logger = get_logger("main")

# Initialize FastAPI with optimized settings
app = FastAPI(
    title="NoCode AI Builder Backend", 
    version="1.0",
    docs_url="/docs",  # Explicitly enable docs
    redoc_url="/redoc"  # Enable redoc
)

# CORS configuration - Add your Render URL when you get it
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

# Include routers
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM"])

@app.on_event("startup")
def on_startup():
    """Initialize application on startup - OPTIMIZED for Render"""
    logger.info("🚀 Starting NoCode AI Builder Backend - Render Optimized")
    
    try:
        # Create database tables
        models.Base.metadata.create_all(bind=database.engine)
        logger.info("✅ Database tables initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    
    # Ensure upload directory exists
    os.makedirs("uploads", exist_ok=True)
    
    # Don't pre-load heavy models here - let them load on-demand
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

# CRITICAL FIX: Add this to the VERY BOTTOM of your file
if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get port from Render environment or default to 10000
    port = int(os.environ.get("PORT", 10000))
    
    print(f"🚀 Starting server on port {port}")
    print(f"📊 Environment: {os.environ.get('RENDER', 'Local')}")
    print(f"🔧 Host: 0.0.0.0, Port: {port}")
    
    uvicorn.run(
        app,  # Use the app instance directly
        host="0.0.0.0",
        port=port,
        workers=1,
        reload=False  # Important: disable reload in production
    )