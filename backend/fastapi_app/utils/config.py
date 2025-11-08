from pydantic_settings import BaseSettings
from pydantic import ConfigDict
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"
    
    GEMINI_API_KEY: str = ""
    SERPAPI_KEY: str = ""
    
    CHROMADB_PATH: str = "./chroma_db"
    UPLOAD_FOLDER: str = "./uploads"
    
    @property
    def actual_database_url(self):
        render_db_url = os.getenv('DATABASE_URL')
        if render_db_url:
            if render_db_url.startswith('postgres://'):
                render_db_url = render_db_url.replace('postgres://', 'postgresql://', 1)
            return render_db_url
        return self.DATABASE_URL
    
    model_config = ConfigDict(
        env_file=".env",
        extra='ignore'
    )

settings = Settings()