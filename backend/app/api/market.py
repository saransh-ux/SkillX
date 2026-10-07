"""
Geographic Market Intelligence API Router.
Directly derived from the location field in Analytics Jobs.csv.

IMPORTANT: Analytics Jobs does NOT contain an official industry column.
Geographical location is used instead without fabricating industry data.
"""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException

from app.schemas.geography import (
    GeographicMarketListResponse,
    GeographicMarketDetailResponse,
)
from app.services.market_service import MarketService

router = APIRouter(prefix="/market", tags=["Market Geography"])


@router.get("/geography", response_model=GeographicMarketListResponse)
def get_geographic_markets(
    limit: int = Query(20, ge=1, le=100, description="Number of top geographic hubs to return"),
):
    """
    Retrieves top geographical market hubs ranked by job posting frequency.
    Returns:
    - location
    - posting_count
    - percentage_of_postings
    - top_skills
    - average and median salary where parseable
    - experience summary
    - transparency metadata noting dimension is LOCATION, not INDUSTRY
    """
    ms = MarketService.get_instance()
    return ms.get_geographic_markets(limit=limit)


@router.get("/geography/{location}", response_model=GeographicMarketDetailResponse)
def get_geographic_market_detail(
    location: str,
):
    """
    Retrieves detailed empirical workforce structure for a specific location:
    - location name & posting count
    - top skills with within-location prevalence
    - job designations distribution
    - job types distribution
    - salary summary (average, median, brackets)
    - experience summary
    - explicit caveats that industry is not available in Analytics Jobs
    """
    ms = MarketService.get_instance()
    detail = ms.get_geographic_market_detail(location=location)
    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Location '{location}' not found in Analytics Jobs.csv corpus."
        )
    return detail
