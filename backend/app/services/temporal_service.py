"""Temporal and statistical analytics for workforce skills demand."""
from typing import Dict, List, Optional
import numpy as np
import pandas as pd


class TemporalAnalyticsService:
    """Computes time-series metrics over historical skill distributions."""

    @staticmethod
    def calculate_growth_rate(demand_t: float, demand_prev: float) -> float:
        """Calculates normalized YoY growth rate: (D_t - D_{t-1}) / max(D_{t-1}, 1)."""
        if demand_prev <= 0:
            return 0.0 if demand_t <= 0 else 1.0
        return (demand_t - demand_prev) / demand_prev

    @staticmethod
    def calculate_acceleration(growth_t: float, growth_prev: float) -> float:
        """Calculates acceleration: first derivative of growth rate."""
        return growth_t - growth_prev

    @staticmethod
    def calculate_cross_industry_adoption(industry_demands: Dict[str, float]) -> float:
        """
        Calculates cross-industry adoption using normalized Shannon entropy.
        0.0 = concentrated in a single industry.
        1.0 = evenly dispersed across all observed industries.
        """
        total = sum(industry_demands.values())
        if total <= 0 or len(industry_demands) <= 1:
            return 0.0

        probabilities = [v / total for v in industry_demands.values() if v > 0]
        if not probabilities:
            return 0.0

        entropy = -sum(p * np.log2(p) for p in probabilities)
        max_entropy = np.log2(len(industry_demands))
        if max_entropy == 0:
            return 0.0
        return float(min(1.0, max(0.0, entropy / max_entropy)))

    @staticmethod
    def calculate_co_occurrence(skill_a_count: int, skill_b_count: int, joint_count: int, total_jobs: int) -> float:
        """
        Calculates Normalized Pointwise Mutual Information (NPMI) or Jaccard similarity.
        Using Jaccard coefficient here for bounded [0, 1] predictability.
        """
        union = (skill_a_count + skill_b_count) - joint_count
        if union <= 0:
            return 0.0
        return float(joint_count / union)

    @classmethod
    def aggregate_temporal_trends(
        cls, df_unified: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Aggregates unified dataset into temporal trends across:
        skill × year
        skill × role × year
        skill × industry × year
        skill × region × year
        """
        if df_unified.empty:
            return pd.DataFrame()

        # Group by skill and year
        grouped = df_unified.groupby(["skill", "year"]).size().reset_index(name="demand")
        grouped = grouped.sort_values(by=["skill", "year"])

        results = []
        for skill_name, group in grouped.groupby("skill"):
            group = group.sort_values("year")
            demands = group["demand"].tolist()
            years = group["year"].tolist()

            prev_growth = 0.0
            for i in range(len(demands)):
                cur_demand = demands[i]
                prev_demand = demands[i - 1] if i > 0 else cur_demand
                growth = cls.calculate_growth_rate(cur_demand, prev_demand)
                accel = cls.calculate_acceleration(growth, prev_growth) if i > 1 else 0.0
                prev_growth = growth

                results.append({
                    "skill": skill_name,
                    "year": years[i],
                    "demand": cur_demand,
                    "growth_rate": round(growth, 4),
                    "acceleration": round(accel, 4),
                })

        return pd.DataFrame(results)
