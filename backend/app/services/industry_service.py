"""
Industry Compatibility Service.

IMPORTANT ARCHITECTURAL NOTICE:
Analytics Jobs.csv does NOT contain an official industry column.
To avoid fabricating synthetic industry data, this service wraps empirical
Geographic Market intelligence with explicit metadata declaring the dimension is LOCATION, not INDUSTRY.
Never claims location is industry.
"""
import logging
from typing import List, Optional, Any, Union
from sqlalchemy.orm import Session

from app.services.market_service import MarketService
from app.schemas.skill import DatasetMetadata
from app.schemas.industry import (
    IndustryCompatibilityItem,
    IndustryCompatibilityResponse,
    IndustrySkillsResponse,
    IndustrySkillDemand,
    IndustryResponse,
)

logger = logging.getLogger("skillx.industry_service")

NOTICE_TEXT = (
    "Analytics Jobs.csv does NOT contain an official industry column. "
    "Geographic location market distribution is provided as a transparent compatibility proxy. "
    "The underlying segmentation dimension is strictly LOCATION, not INDUSTRY."
)


class IndustryService:
    """Service providing transparent geographic market data for legacy industry endpoints."""

    @staticmethod
    def get_market_service() -> MarketService:
        return MarketService.get_instance()

    @classmethod
    def get_all_industries(
        cls,
        db: Optional[Session] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> IndustryCompatibilityResponse:
        """
        Retrieves geographic market hubs labeled transparently as LOCATION compatibility data.
        Never fabricates or claims that location is industry.
        """
        ms = cls.get_market_service()
        geo_resp = ms.get_geographic_markets(limit=limit + skip)
        sliced = geo_resp.data[skip : skip + limit]

        items = [
            IndustryCompatibilityItem(
                id=idx + 1,
                name=item.location,
                location=item.location,
                dimension="LOCATION",
                posting_count=item.posting_count,
                percentage_of_postings=item.percentage_of_postings,
                top_skills=item.top_skills,
                average_salary=item.average_salary,
                note="This metric represents geographic market location because Analytics Jobs does not contain an official industry column.",
            )
            for idx, item in enumerate(sliced)
        ]

        metadata = DatasetMetadata(
            dataset_name=geo_resp.metadata.dataset_name,
            sample_size=geo_resp.sample_size,
            methodology="Geographic market aggregation used as compatibility proxy",
            limitations=(
                "Analytics Jobs.csv does not contain an official industry column; "
                "location is used instead. Dimension is LOCATION, not INDUSTRY."
            ),
        )

        return IndustryCompatibilityResponse(
            dimension="LOCATION",
            notice=NOTICE_TEXT,
            total_locations=len(items),
            sample_size=geo_resp.sample_size,
            data=items,
            metadata=metadata,
        )

    @classmethod
    def get_industry_skills(
        cls,
        db: Optional[Session] = None,
        industry_name: str = "",
    ) -> IndustrySkillsResponse:
        """
        Retrieves skills demanded in the queried geographic market hub.
        Explicitly notes that skills reflect location-level demand, not industry.
        """
        ms = cls.get_market_service()
        detail = ms.get_geographic_market_detail(location=industry_name)

        if not detail:
            # Fallback to general market if unknown location
            return IndustrySkillsResponse(
                dimension="LOCATION",
                target_entity=industry_name,
                notice=NOTICE_TEXT,
                total_skills=0,
                sample_size=0,
                top_skills=[],
                is_real_data=False,
                metadata=DatasetMetadata(
                    dataset_name="Analytics Jobs.csv (Official Hackathon Dataset)",
                    sample_size=ms.total_eligible_postings,
                    methodology="Geographic market lookup",
                    limitations="Queried entity not found in dataset; Analytics Jobs has no industry column",
                ),
            )

        top_demands = [
            IndustrySkillDemand(
                skill=s.display_name,
                canonical_name=s.canonical_name,
                category="Technical & Analytical",
                demand_share=s.prevalence,
                posting_count=s.posting_count,
                rank=s.rank,
            )
            for s in detail.top_skills[:15]
        ]

        return IndustrySkillsResponse(
            dimension="LOCATION",
            target_entity=detail.location,
            notice=NOTICE_TEXT,
            total_skills=len(top_demands),
            sample_size=detail.posting_count,
            top_skills=top_demands,
            is_real_data=True,
            metadata=detail.metadata,
        )
