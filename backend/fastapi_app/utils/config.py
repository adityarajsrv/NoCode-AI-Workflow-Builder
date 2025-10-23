from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    SERPAPI_KEY: str
    CHROMADB_PATH: str
    UPLOAD_FOLDER: str = "./uploads"

    class Config:
        env_file = ".env"

settings = Settings()
