"""Service handling Skill retrieval, emergence calculations, and trends."""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.skill import Skill
from app.models.skill_trend import SkillTrend
from app.schemas.skill import SkillResponse, EmergingSkillItem, EmergingSkillsResponse, SkillTrendResponse, SkillTrendPoint
from app.services.emergence_service import EmergenceIndexService

emergence_engine = EmergenceIndexService()


class SkillService:
    @staticmethod
    def get_all_skills(db: Session, skip: int = 0, limit: int = 100) -> List[SkillResponse]:
        """Retrieves registered skills from the database."""
        if db is None:
            return []
        try:
            skills = db.query(Skill).offset(skip).limit(limit).all()
            return [SkillResponse.model_validate(s) for s in skills]
        except Exception:
            return []

    @staticmethod
    def get_emerging_skills(db: Session, limit: int = 20) -> EmergingSkillsResponse:
        """
        Retrieves skills ranked by the SKILL//X Emergence Index.
        If real database records are not yet ingested, returns clearly marked empty state.
        No fabricated or fake ML predictions are generated.
        """
        if db is None:
            return EmergingSkillsResponse(total=0, data=[], is_real_data=False)

        try:
            # Query recent skill trends
            trends = db.query(SkillTrend).order_by(SkillTrend.year.desc()).limit(limit * 5).all()
            if not trends:
                return EmergingSkillsResponse(total=0, data=[], is_real_data=False)

            # Map trends through EmergenceIndexService
            emerging_items: List[EmergingSkillItem] = []
            seen_skills = set()

            for trend in trends:
                if trend.skill_id in seen_skills:
                    continue
                seen_skills.add(trend.skill_id)

                skill_obj = db.query(Skill).filter(Skill.id == trend.skill_id).first()
                if not skill_obj:
                    continue

                metrics = emergence_engine.calculate_score(
                    growth_rate=trend.growth_rate,
                    acceleration=trend.acceleration,
                    cross_industry_adoption=trend.cross_industry_adoption,
                    co_occurrence_score=trend.co_occurrence_score,
                    model_prediction=0.0,
                    sample_size=int(trend.demand) if trend.demand else 10,
                )

                emerging_items.append(
                    EmergingSkillItem(
                        id=str(skill_obj.name).lower().replace(" ", "-"),
                        name=skill_obj.name,
                        canonical_name=skill_obj.canonical_name,
                        category=skill_obj.category,
                        emergence_score=metrics["emergence_score"],
                        growth_rate=trend.growth_rate,
                        acceleration=trend.acceleration,
                        cross_industry_adoption=trend.cross_industry_adoption,
                        co_occurrence_score=trend.co_occurrence_score,
                        confidence=metrics["confidence"],
                        demand_volume=int(trend.demand),
                        trajectory=[trend.demand],
                        co_occurring=[],
                        description=skill_obj.description or "",
                    )
                )

                if len(emerging_items) >= limit:
                    break

            emerging_items.sort(key=lambda x: x.emergence_score, reverse=True)
            return EmergingSkillsResponse(
                total=len(emerging_items),
                data=emerging_items,
                is_real_data=True
            )
        except Exception:
            return EmergingSkillsResponse(total=0, data=[], is_real_data=False)

    @staticmethod
    def get_skill_trend(db: Session, skill_name: str) -> SkillTrendResponse:
        """Retrieves chronological trend line for a specific skill."""
        if db is None:
            return SkillTrendResponse(skill=skill_name, canonical_name=skill_name, timeline=[], is_real_data=False)

        try:
            skill_obj = db.query(Skill).filter(
                (Skill.name.ilike(skill_name)) | (Skill.canonical_name.ilike(skill_name))
            ).first()

            if not skill_obj:
                return SkillTrendResponse(
                    skill=skill_name,
                    canonical_name=skill_name,
                    timeline=[],
                    is_real_data=False
                )

            trends = db.query(SkillTrend).filter(
                SkillTrend.skill_id == skill_obj.id
            ).order_by(SkillTrend.year.asc()).all()

            timeline = [
                SkillTrendPoint(
                    year=t.year,
                    demand=t.demand,
                    growth_rate=t.growth_rate,
                    acceleration=t.acceleration,
                    cross_industry_adoption=t.cross_industry_adoption,
                )
                for t in trends
            ]

            return SkillTrendResponse(
                skill=skill_obj.name,
                canonical_name=skill_obj.canonical_name,
                category=skill_obj.category,
                timeline=timeline,
                is_real_data=len(timeline) > 0,
            )
        except Exception:
            return SkillTrendResponse(skill=skill_name, canonical_name=skill_name, timeline=[], is_real_data=False)
