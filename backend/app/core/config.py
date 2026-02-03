from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Project"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Bunny.net Storage
    BUNNY_API_KEY: str = "961f23f8-3f8a-4e24-be36cc7f2c15-2954-41a5"
    BUNNY_STORAGE_ZONE: str = "brainx"
    BUNNY_REGION: str = "de"

    # Zoom Credentials
    ZOOM_API_KEY: str = ""
    ZOOM_API_SECRET: str = ""
    ZOOM_ACCOUNT_ID: str = ""

    # Google Meet Credentials
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""

    @property
    def ASYNC_DATABASE_URL(self) -> str:

        url = self.DATABASE_URL
        print("ASYNC_DATABASE_URL =", url)
        if url:
            # Handle specific password encoding if needed
            if ":Brainx26@103@" in url:
                url = url.replace(":Brainx26@103@", ":Brainx26%40103@")
            elif ":Infant@103@" in url:
                url = url.replace(":Infant@103@", ":Infant%40103@")
            
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
    
    class Config:
        env_file = ".env"

settings = Settings()
