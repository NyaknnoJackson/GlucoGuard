import os
from functools import lru_cache

# Debug: print all env vars at startup
print("=== ENVIRONMENT VARIABLES ===")
for key, value in os.environ.items():
    if any(x in key.upper() for x in ["DATABASE", "SECRET", "POSTGRES", "RAILWAY"]):
        print(f"{key} = {value[:20]}...")
print("=== END ENV VARS ===")

class Settings:
    def __init__(self):
        # Try multiple possible variable names Railway might use
        self.database_url = (
            os.environ.get("DATABASE_URL") or
            os.environ.get("DATABASE_PRIVATE_URL") or
            os.environ.get("POSTGRES_URL") or
            os.environ.get("POSTGRESQL_URL")
        )
        self.secret_key = os.environ.get("SECRET_KEY", "fallback-secret-key-for-debug")
        self.algorithm = os.environ.get("ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
        self.refresh_token_expire_days = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", 7))
        self.environment = os.environ.get("ENVIRONMENT", "development")

        if not self.database_url:
            raise ValueError(f"No database URL found. Available vars: {list(os.environ.keys())}")

@lru_cache()
def get_settings():
    return Settings()