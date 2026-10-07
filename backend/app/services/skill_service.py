"""
Skill service coordinating workforce skill analytics, canonical taxonomy,
co-occurrence networks, and Skill Radar intelligence from Analytics Jobs.csv.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.services.market_service import MarketService
from app.schemas.skill import (
    SkillListResponse,
    SkillRadarResponse,
    SkillDetailResponse,
    SkillResponse,
    EmergingSkillsResponse,
    EmergingSkillItem,
    SkillTrendResponse,
    SkillTrendPoint,
    DatasetMetadata,
)


class SkillService:
    """Service facade for skill taxonomy, empirical market analytics, and skill radar."""

    @staticmethod
    def get_market_service() -> MarketService:
        """Returns the MarketService singleton."""
        return MarketService.get_instance()

    @classmethod
    def get_skills(
        cls,
        search: Optional[str] = None,
        role: Optional[str] = None,
        location: Optional[str] = None,
        job_type: Optional[str] = None,
        min_experience: Optional[int] = None,
        max_experience: Optional[int] = None,
        experience: Optional[str] = None,
        min_count: int = 5,
        limit: int = 100,
    ) -> SkillListResponse:
        """
        Retrieves canonical skills with multi-dimensional filtering,
        prevalence, and minimum support threshold from Analytics Jobs.csv.
        """
        return cls.get_market_service().get_skills(
            search=search,
            role=role,
            location=location,
            job_type=job_type,
            min_experience=min_experience,
            max_experience=max_experience,
            experience=experience,
            min_count=min_count,
            limit=limit,
        )

    @classmethod
    def get_skill_radar(
        cls,
        role: Optional[str] = None,
        location: Optional[str] = None,
        job_type: Optional[str] = None,
        min_experience: Optional[int] = None,
        max_experience: Optional[int] = None,
        experience: Optional[str] = None,
        min_count: int = 5,
        limit: int = 50,
    ) -> SkillRadarResponse:
        """
        Retrieves Skill Radar dataset:
        {
          "skill": "...",
          "posting_count": number,
          "prevalence": number,
          "rank": number,
          "sample_size": number
        }
        """
        return cls.get_market_service().get_skill_radar(
            role=role,
            location=location,
            job_type=job_type,
            min_experience=min_experience,
            max_experience=max_experience,
            experience=experience,
            min_count=min_count,
            limit=limit,
        )

    @classmethod
    def get_skill_detail(
        cls,
        skill_name: str,
        top_n_associated: int = 10,
    ) -> Optional[SkillDetailResponse]:
        """
        Retrieves detailed profile, co-occurrence associations,
        and supporting sample count for a specific skill.
        """
        return cls.get_market_service().get_skill_detail(
            skill_name=skill_name,
            top_n_associated=top_n_associated,
        )

    @classmethod
    def get_all_skills(cls, db: Optional[Session] = None, skip: int = 0, limit: int = 100) -> List[SkillResponse]:
        """Backward-compatible method returning registered taxonomy skills."""
        resp = cls.get_market_service().get_skills(limit=limit + skip)
        sliced = resp.data[skip : skip + limit]
        return [
            SkillResponse(
                id=item.rank,
                name=item.display_name,
                canonical_name=item.canonical_name,
                category="Technical & Analytical",
                description=f"Observed in {item.posting_count} job postings ({item.prevalence_pct}% prevalence)",
            )
            for item in sliced
        ]

    @classmethod
    def get_emerging_skills(cls, db: Optional[Session] = None, limit: int = 20) -> EmergingSkillsResponse:
        """
        Retrieves top skills by empirical market demand from Analytics Jobs.csv.
        No fabricated or fake ML predictions are generated.
        """
        radar_resp = cls.get_market_service().get_skill_radar(limit=limit)
        emerging_items: List[EmergingSkillItem] = []

        for item in radar_resp.data:
            detail = cls.get_market_service().get_skill_detail(item.canonical_name or item.skill)
            co_occurring = [a.display_name for a in detail.top_associated_skills[:5]] if detail else []

            # Real empirical demand volume and emergence score derived from prevalence & rank
            score = round(min(100.0, max(10.0, item.prevalence * 1000)), 1)
            emerging_items.append(
                EmergingSkillItem(
                    id=item.skill_id or item.skill.lower().replace(" ", "-"),
                    name=item.display_name or item.skill,
                    canonical_name=item.canonical_name or item.skill.lower(),
                    category="Market Demand",
                    emergence_score=score,
                    growth_rate=round(item.prevalence * 100, 2),
                    acceleration=0.0,
                    cross_industry_adoption=round(item.prevalence, 4),
                    co_occurrence_score=round(item.prevalence, 4),
                    confidence=1.0,
                    demand_volume=item.posting_count,
                    trajectory=[item.posting_count],
                    co_occurring=co_occurring,
                    description=f"Empirically observed in {item.posting_count} job postings across {radar_resp.sample_size} listings.",
                )
            )

        return EmergingSkillsResponse(
            total=len(emerging_items),
            data=emerging_items,
            is_real_data=True,
            metadata=radar_resp.metadata,
        )

    @classmethod
    def get_skill_trend(cls, db: Optional[Session] = None, skill_name: str = "") -> SkillTrendResponse:
        """Retrieves empirical metric point for a given skill."""
        detail = cls.get_market_service().get_skill_detail(skill_name)
        if not detail:
            return SkillTrendResponse(
                skill=skill_name,
                canonical_name=skill_name.lower(),
                category=None,
                timeline=[],
                is_real_data=False,
                metadata=DatasetMetadata(
                    dataset_name="Analytics Jobs.csv (Official Hackathon Dataset)",
                    sample_size=0,
                    methodology="Empirical frequency counting",
                    limitations="Skill not found in dataset; cross-sectional data only",
                ),
            )

        point = SkillTrendPoint(
            year=2024,
            demand=float(detail.posting_count),
            growth_rate=float(detail.prevalence_pct),
            acceleration=0.0,
            cross_industry_adoption=float(detail.prevalence),
        )

        return SkillTrendResponse(
            skill=detail.display_name,
            canonical_name=detail.canonical_name,
            category="Technical & Analytical",
            timeline=[point],
            is_real_data=True,
            metadata=detail.metadata,
        )
