"""Future Scan service predicting skill demand shifts and role evolution over 1-5 year horizons."""
from typing import Optional
from sqlalchemy.orm import Session
from app.schemas.future_scan import FutureScanRequest, FutureScanResponse, ForecastSkillItem, SkillCombination


class FutureScanService:
    @staticmethod
    def forecast_workforce_evolution(
        request: FutureScanRequest, db: Optional[Session] = None
    ) -> FutureScanResponse:
        """
        Calculates future workforce skill emergence and decay.
        IMPORTANT: Does not fabricate ML predictions when model is untrained.
        Returns a structured, unpopulated response indicating readiness for trained XGBoost model artifacts.
        """
        return FutureScanResponse(
            role=request.role,
            industry=request.industry,
            region=request.region or "Global",
            horizon_years=request.horizon,
            emerging_skills=[],
            declining_skills=[],
            rising_skill_combinations=[],
            role_evolution_summary=f"Forecast pipeline ready for {request.role} in {request.industry}. Waiting for trained model checkpoint.",
            confidence_score=0.0,
            supporting_signals=[],
            is_real_data=False,
            message="No fabricated ML predictions are returned. Ingest dataset and train model via ml/training/train_demand_model.py to generate live inferences."
        )
