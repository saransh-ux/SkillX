"""Service handling Industry sectors and cross-industry skill diffusion."""
from typing import List
from sqlalchemy.orm import Session
from app.models.industry import Industry
from app.schemas.industry import IndustryResponse, IndustrySkillsResponse


class IndustryService:
    @staticmethod
    def get_all_industries(db: Session, skip: int = 0, limit: int = 100) -> List[IndustryResponse]:
        """Retrieves registered industry verticals."""
        if db is None:
            return []
        try:
            industries = db.query(Industry).offset(skip).limit(limit).all()
            return [IndustryResponse.model_validate(i) for i in industries]
        except Exception:
            return []

    @staticmethod
    def get_industry_skills(db: Session, industry_name: str) -> IndustrySkillsResponse:
        """
        Retrieves skills demanded within an industry sector.
        Returns a clean empty state with is_real_data=False when unpopulated.
        """
        if db is None:
            return IndustrySkillsResponse(industry=industry_name, total_skills=0, top_skills=[], is_real_data=False)

        try:
            industry_obj = db.query(Industry).filter(Industry.name.ilike(industry_name)).first()
            if not industry_obj:
                return IndustrySkillsResponse(
                    industry=industry_name,
                    total_skills=0,
                    top_skills=[],
                    is_real_data=False
                )

            return IndustrySkillsResponse(
                industry=industry_obj.name,
                total_skills=0,
                top_skills=[],
                is_real_data=False
            )
        except Exception:
            return IndustrySkillsResponse(industry=industry_name, total_skills=0, top_skills=[], is_real_data=False)
