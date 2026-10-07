"""
SKILL//X Custom Emergence Index Engine.

NOTE: This is a custom SKILL//X intelligence score, NOT an industry-standard metric.
Formula:
Emergence Score =
  w1 * normalized(growth_rate)
+ w2 * normalized(acceleration)
+ w3 * normalized(cross_industry_adoption)
+ w4 * normalized(co_occurrence_score)
+ w5 * normalized(future_model_prediction)
"""
from typing import Dict, Any, Optional
from app.core.config import settings


class EmergenceIndexService:
    """Configurable SKILL//X Emergence Index Calculator."""

    def __init__(
        self,
        weight_growth: Optional[float] = None,
        weight_acceleration: Optional[float] = None,
        weight_cross_industry: Optional[float] = None,
        weight_co_occurrence: Optional[float] = None,
        weight_model_prediction: Optional[float] = None,
    ):
        self.w_growth = weight_growth if weight_growth is not None else settings.WEIGHT_GROWTH
        self.w_accel = weight_acceleration if weight_acceleration is not None else settings.WEIGHT_ACCELERATION
        self.w_cross = weight_cross_industry if weight_cross_industry is not None else settings.WEIGHT_CROSS_INDUSTRY
        self.w_co_occur = weight_co_occurrence if weight_co_occurrence is not None else settings.WEIGHT_CO_OCCURRENCE
        self.w_pred = weight_model_prediction if weight_model_prediction is not None else settings.WEIGHT_MODEL_PREDICTION

        # Normalize weights to ensure sum = 1.0
        total_w = self.w_growth + self.w_accel + self.w_cross + self.w_co_occur + self.w_pred
        if total_w > 0:
            self.w_growth /= total_w
            self.w_accel /= total_w
            self.w_cross /= total_w
            self.w_co_occur /= total_w
            self.w_pred /= total_w

    @staticmethod
    def _sigmoid_normalize(value: float, midpoint: float = 0.0, scale: float = 1.0) -> float:
        """Normalizes an unbounded metric (like growth rate or acceleration) smoothly into [0, 1]."""
        import math
        try:
            return 1.0 / (1.0 + math.exp(-(value - midpoint) * scale))
        except OverflowError:
            return 1.0 if value > 0 else 0.0

    def calculate_score(
        self,
        growth_rate: float,
        acceleration: float,
        cross_industry_adoption: float,
        co_occurrence_score: float = 0.0,
        model_prediction: float = 0.0,
        sample_size: int = 10,
    ) -> Dict[str, Any]:
        """
        Calculates the composite emergence score and explanation components.
        Returns a score scaled to 0-100.
        """
        # Normalize individual components into [0.0, 1.0]
        norm_growth = self._sigmoid_normalize(growth_rate, midpoint=0.1, scale=5.0)
        norm_accel = self._sigmoid_normalize(acceleration, midpoint=0.0, scale=8.0)
        norm_cross = max(0.0, min(1.0, cross_industry_adoption))
        norm_co_occur = max(0.0, min(1.0, co_occurrence_score))
        norm_pred = max(0.0, min(1.0, model_prediction))

        # Composite score calculation
        composite = (
            self.w_growth * norm_growth
            + self.w_accel * norm_accel
            + self.w_cross * norm_cross
            + self.w_co_occur * norm_co_occur
            + self.w_pred * norm_pred
        )

        final_score = round(composite * 100, 1)

        # Statistical confidence based on observation support
        confidence = round(min(1.0, max(0.2, (sample_size / (sample_size + 20)))), 2)

        return {
            "emergence_score": final_score,
            "normalized_components": {
                "growth": round(norm_growth, 3),
                "acceleration": round(norm_accel, 3),
                "cross_industry": round(norm_cross, 3),
                "co_occurrence": round(norm_co_occur, 3),
                "model_prediction": round(norm_pred, 3),
            },
            "weights": {
                "growth": round(self.w_growth, 2),
                "acceleration": round(self.w_accel, 2),
                "cross_industry": round(self.w_cross, 2),
                "co_occurrence": round(self.w_co_occur, 2),
                "model_prediction": round(self.w_pred, 2),
            },
            "confidence": confidence,
        }
