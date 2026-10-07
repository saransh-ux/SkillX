"""Health check API endpoint."""
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """System health check endpoint verifying API availability."""
    return {
        "status": "online",
        "service": "SKILL//X API"
    }
