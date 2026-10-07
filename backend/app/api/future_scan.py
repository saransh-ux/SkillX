"""Future Scan API router for predictive workforce intelligence."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.future_scan import FutureScanRequest, FutureScanResponse
from app.services.future_scan_service import FutureScanService

router = APIRouter(prefix="/future-scan", tags=["Future Scan"])


@router.post("", response_model=FutureScanResponse)
def run_future_scan(
    request: FutureScanRequest,
    db: Session = Depends(get_db),
):
    """
    Predicts forward-looking workforce evolution for a given role, industry, and region.
    Returns structured data without fabricating fake ML predictions.
    """
    return FutureScanService.forecast_workforce_evolution(request=request, db=db)
