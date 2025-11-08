from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"

    GEMINI_API_KEY: str = ""
    SERPAPI_KEY: str = ""
    
    CHROMADB_PATH: str = "./chroma_db"
    UPLOAD_FOLDER: str = "./uploads"
    
    CLIENT_URL: str = "https://flow-mind-ai-tan.vercel.app"
    AUTH_URL: str = "https://flowmind-ai-auth.onrender.com"
    FASTAPI_URL: str = "https://flowmind-ai-82ug.onrender.com"
    
    @property
    def get_cors_origins(self) -> List[str]:
        return [
            "http://localhost:5173",    
            "http://localhost:3000",      
            self.CLIENT_URL,            
            self.AUTH_URL                 
        ]
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra='ignore'
    )

settings = Settings()