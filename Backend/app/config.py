import os
from functools import lru_cache

class Settings:
    def __init__(self):
        self.database_url = os.environ.get("DATABASE_URL")
        self.secret_key = os.environ.get("SECRET_KEY")
        self.algorithm = os.environ.get("ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
        self.refresh_token_expire_days = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", 7))
        self.environment = os.environ.get("ENVIRONMENT", "development")

        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is not set")
        if not self.secret_key:
            raise ValueError("SECRET_KEY environment variable is not set")

@lru_cache()
def get_settings():
    return Settings()