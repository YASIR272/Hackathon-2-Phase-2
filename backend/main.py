from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel
from database import engine
from routes import tasks
from config import settings
from schemas import ErrorResponse
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler to initialize the database
    """
    logger.info("Initializing database...")
    # Drop and recreate tables to apply schema changes (development only)
    # In production, use proper migrations with Alembic
    SQLModel.metadata.drop_all(bind=engine)
    SQLModel.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")
    yield
    logger.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Todo Backend API",
    description="Secure, scalable backend API for the Todo application with JWT-based authentication and user isolation",
    version="1.0.0",
    lifespan=lifespan
)


# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://hackathon-2-phase-2-lyart.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Allow Authorization header for JWT
)


# Include routes
app.include_router(tasks.router)


@app.get("/")
def read_root():
    """
    Root endpoint for health check
    """
    return {"message": "Todo Backend API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "todo-backend-api"}


from fastapi.responses import JSONResponse


# Global exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Global handler for HTTP exceptions
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
            "message": exc.detail
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )