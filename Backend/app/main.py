from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.database import Base, engine
from app.routers import auth, predictions, health_metrics, dashboard, recommendations

# Create all tables
Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="GlucoGuard API",
    description="AI-powered diabetes risk prediction and monitoring platform",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://gluco-guard-eight.vercel.app",
        "https://gluco-guard-ej8mj0mmf-nyaknno-jackson-s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(health_metrics.router)
app.include_router(dashboard.router)
app.include_router(recommendations.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "GlucoGuard API"}