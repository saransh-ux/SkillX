"""
SKILL//X Career Scan Service.
Integrates three factual empirical evidence layers:
1. Market Demand (Analytics Jobs.csv)
2. Junior Career Success (JDS Skill Traits.xlsx supervised model)
3. Senior Success (SDS Personality Traits.xlsx supervised model)

Strictly non-temporal: No 2026-2030 future forecasts.
100% deterministic, explainable rules without LLM dependency.
"""
import logging
from typing import Any, Dict, List, Optional, Tuple

from app.schemas.career_scan import (
    CareerScanInput,
    CareerScanResponse,
    MarketEvidenceItem,
    PrioritySkillItem,
    RecommendationItem,
)
from app.services.market_service import MarketService
from app.services.role_service import RoleService
from app.services.career_success_service import get_career_success_service
from app.services.senior_success_service import get_senior_success_service

logger = logging.getLogger("skillx.career_scan")

# Mapping keywords to JDS Skill Traits
SKILL_TRAIT_KEYWORD_MAP = {
    # Mathematics & Statistics (JDS standardized weight: +1.2187)
    "statistics": "maths_stats_skills",
    "statistical": "maths_stats_skills",
    "mathematics": "maths_stats_skills",
    "math": "maths_stats_skills",
    "probability": "maths_stats_skills",
    "biostatistics": "maths_stats_skills",
    "econometrics": "maths_stats_skills",
    "quantitative": "maths_stats_skills",
    "r": "maths_stats_skills",
    "sas": "maths_stats_skills",
    "spss": "maths_stats_skills",
    "regression": "maths_stats_skills",
    "predictive modeling": "maths_stats_skills",

    # Dashboard & Storytelling (JDS standardized weight: +0.7983)
    "tableau": "dashboard_and_storytelling_skills",
    "power bi": "dashboard_and_storytelling_skills",
    "powerbi": "dashboard_and_storytelling_skills",
    "excel": "dashboard_and_storytelling_skills",
    "data visualization": "dashboard_and_storytelling_skills",
    "visualization": "dashboard_and_storytelling_skills",
    "dashboard": "dashboard_and_storytelling_skills",
    "storytelling": "dashboard_and_storytelling_skills",
    "reporting": "dashboard_and_storytelling_skills",
    "bi": "dashboard_and_storytelling_skills",
    "business intelligence": "dashboard_and_storytelling_skills",
    "looker": "dashboard_and_storytelling_skills",
    "qlikview": "dashboard_and_storytelling_skills",
    "communication": "dashboard_and_storytelling_skills",
    "presentation": "dashboard_and_storytelling_skills",

    # AI & Machine Learning (JDS standardized weight: +0.6935)
    "machine learning": "ai_and_ml_skills",
    "deep learning": "ai_and_ml_skills",
    "ai": "ai_and_ml_skills",
    "artificial intelligence": "ai_and_ml_skills",
    "nlp": "ai_and_ml_skills",
    "natural language processing": "ai_and_ml_skills",
    "computer vision": "ai_and_ml_skills",
    "neural networks": "ai_and_ml_skills",
    "tensorflow": "ai_and_ml_skills",
    "pytorch": "ai_and_ml_skills",
    "scikit-learn": "ai_and_ml_skills",
    "keras": "ai_and_ml_skills",
    "data mining": "ai_and_ml_skills",
    "llm": "ai_and_ml_skills",

    # Big Data Skills (JDS standardized weight: +0.6504)
    "big data": "big_data_skills",
    "hadoop": "big_data_skills",
    "spark": "big_data_skills",
    "pyspark": "big_data_skills",
    "hive": "big_data_skills",
    "kafka": "big_data_skills",
    "aws": "big_data_skills",
    "azure": "big_data_skills",
    "gcp": "big_data_skills",
    "cloud": "big_data_skills",
    "databricks": "big_data_skills",
    "snowflake": "big_data_skills",
    "data pipeline": "big_data_skills",
    "etl": "big_data_skills",
    "data warehousing": "big_data_skills",
    "nosql": "big_data_skills",

    # Coding Skills (JDS standardized weight: +0.4827)
    "python": "coding_skills",
    "java": "coding_skills",
    "c++": "coding_skills",
    "sql": "coding_skills",
    "coding": "coding_skills",
    "programming": "coding_skills",
    "git": "coding_skills",
    "linux": "coding_skills",
    "scala": "coding_skills",
}

TRAIT_DISPLAY_NAMES = {
    "maths_stats_skills": "Mathematics & Statistics",
    "dashboard_and_storytelling_skills": "Dashboard & Storytelling",
    "ai_and_ml_skills": "AI & Machine Learning",
    "big_data_skills": "Big Data Skills",
    "coding_skills": "Coding Skills",
}

TRAIT_STANDARDIZED_WEIGHTS = {
    "maths_stats_skills": 1.2187,
    "dashboard_and_storytelling_skills": 0.7983,
    "ai_and_ml_skills": 0.6935,
    "big_data_skills": 0.6504,
    "coding_skills": 0.4827,
}


class CareerScanService:
    """Service orchestrating the 3-layer SKILL//X Career Scan."""

    @classmethod
    def map_skill_to_trait(cls, skill_name: str) -> str:
        """Map canonical or display skill name to one of 5 JDS trait categories."""
        lower = skill_name.strip().lower()
        if lower in SKILL_TRAIT_KEYWORD_MAP:
            return SKILL_TRAIT_KEYWORD_MAP[lower]

        for kw, trait in SKILL_TRAIT_KEYWORD_MAP.items():
            if kw in lower:
                return trait

        # Default fallback: data/database related -> big_data, else coding
        if any(w in lower for w in ["data", "db", "warehouse", "etl"]):
            return "big_data_skills"
        return "coding_skills"

    @classmethod
    def run_career_scan(cls, payload: CareerScanInput) -> CareerScanResponse:
        """
        Executes Career Scan by combining:
        1. Market Demand (Analytics Jobs)
        2. Career Model (JDS Salary Hike Model)
        3. Senior Model (SDS Personality Success Model)
        """
        ms = MarketService.get_instance()
        total_sample = ms.total_eligible_postings

        # -------------------------------------------------------------
        # LAYER 1: MARKET DEMAND (Analytics Jobs.csv)
        # -------------------------------------------------------------
        market_evidence: List[MarketEvidenceItem] = []
        target_role_query = payload.target_role.strip() or "Data Scientist"

        # Resolve role details
        role_detail = RoleService.get_role_detail(target_role_query)
        if not role_detail:
            # Fallback search
            roles_resp = RoleService.get_roles(search=target_role_query, limit=1)
            if roles_resp.data:
                role_detail = RoleService.get_role_detail(roles_resp.data[0].designation)

        if not role_detail:
            # Fallback to top role
            role_detail = RoleService.get_role_detail("Data Scientist")

        matched_role_name = role_detail.designation if role_detail else target_role_query
        role_posting_count = role_detail.posting_count if role_detail else 0
        role_prevalence_pct = role_detail.prevalence_pct if role_detail else 0.0

        market_evidence.append(
            MarketEvidenceItem(
                dimension="role_demand",
                title=f"Market Demand for '{matched_role_name}'",
                posting_count=role_posting_count,
                prevalence_pct=role_prevalence_pct,
                summary=(
                    f"Analytics Jobs contains {role_posting_count} verified job postings for '{matched_role_name}', "
                    f"representing {role_prevalence_pct}% of total eligible listings (n={total_sample})."
                ),
                sample_size=total_sample,
            )
        )

        # Core top skills evidence
        top_skills = role_detail.top_skills if role_detail else []
        top_skill_names = [s.display_name for s in top_skills[:5]]
        market_evidence.append(
            MarketEvidenceItem(
                dimension="skill_demand",
                title=f"Primary Skill Requirements for '{matched_role_name}'",
                posting_count=sum(s.posting_count for s in top_skills[:5]) if top_skills else 0,
                prevalence_pct=top_skills[0].prevalence_pct if top_skills else 0.0,
                summary=(
                    f"The top demanded skills in the empirical listings for '{matched_role_name}' are "
                    f"{', '.join(top_skill_names)}."
                ),
                sample_size=role_posting_count,
            )
        )

        # Geographic demand (if requested or dominant)
        geo_detail = None
        if payload.location and payload.location.strip():
            geo_detail = ms.get_geographic_market_detail(payload.location.strip())
            if geo_detail:
                market_evidence.append(
                    MarketEvidenceItem(
                        dimension="location_demand",
                        title=f"Geographic Market Demand in '{geo_detail.location}'",
                        posting_count=geo_detail.posting_count,
                        prevalence_pct=geo_detail.percentage_of_postings,
                        summary=(
                            f"Location '{geo_detail.location}' accounts for {geo_detail.posting_count} postings "
                            f"({geo_detail.percentage_of_postings}% of market demand)."
                        ),
                        sample_size=total_sample,
                    )
                )

        # Compensation evidence
        if role_detail and role_detail.salary_summary and role_detail.salary_summary.brackets:
            dominant_bracket = role_detail.salary_summary.brackets[0]
            salary_postings_total = sum(b.count for b in role_detail.salary_summary.brackets)
            market_evidence.append(
                MarketEvidenceItem(
                    dimension="compensation",
                    title=f"Compensation Distribution for '{matched_role_name}'",
                    posting_count=salary_postings_total,
                    prevalence_pct=dominant_bracket.percentage,
                    summary=(
                        f"Dominant compensation bracket is {dominant_bracket.bracket} "
                        f"({dominant_bracket.count} postings, {dominant_bracket.percentage}% of salary-reporting listings)."
                    ),
                    sample_size=salary_postings_total,
                )
            )

        # -------------------------------------------------------------
        # LAYER 2: JUNIOR CAREER SUCCESS (JDS Model)
        # -------------------------------------------------------------
        career_service = get_career_success_service()
        career_prediction = career_service.predict(payload.skill_profile)

        # -------------------------------------------------------------
        # LAYER 3: SENIOR SUCCESS (SDS Model)
        # -------------------------------------------------------------
        senior_service = get_senior_success_service()
        senior_prediction = senior_service.predict(payload.personality_profile)

        # -------------------------------------------------------------
        # PRIORITY SKILLS (Evidence-Driven Alignment)
        # -------------------------------------------------------------
        user_skills_dict = payload.skill_profile.model_dump()
        priority_skills: List[PrioritySkillItem] = []

        seen_skills = set()
        for s in top_skills[:12]:
            s_name = s.display_name
            if s_name.lower() in seen_skills:
                continue
            seen_skills.add(s_name.lower())

            trait_key = cls.map_skill_to_trait(s_name)
            user_val = float(user_skills_dict.get(trait_key, 3.0))
            model_w = TRAIT_STANDARDIZED_WEIGHTS.get(trait_key, 0.50)
            trait_disp = TRAIT_DISPLAY_NAMES.get(trait_key, trait_key)

            # Categorize priority tier deterministically
            if s.prevalence_pct >= 25.0 and user_val < 4.2:
                tier = "High Demand & High Leverage"
                rationale = (
                    f"High market prevalence ({s.prevalence_pct}% of '{matched_role_name}' listings). "
                    f"Maps to {trait_disp} (JDS model weight: +{model_w:.2f}). "
                    f"User rating ({user_val:.1f}/5.0) has high upside potential."
                )
            elif s.prevalence_pct >= 25.0:
                tier = "Core Baseline Requirement"
                rationale = (
                    f"Core market requirement ({s.prevalence_pct}% of listings). "
                    f"User rating ({user_val:.1f}/5.0) already demonstrates baseline alignment."
                )
            else:
                tier = "Specialized Differentiation"
                rationale = (
                    f"Specialized requirement ({s.prevalence_pct}% of listings). "
                    f"Mapped to {trait_disp} (JDS model weight: +{model_w:.2f})."
                )

            priority_skills.append(
                PrioritySkillItem(
                    skill_name=s_name,
                    canonical_name=s.canonical_name,
                    category=trait_disp,
                    market_posting_count=s.posting_count,
                    market_prevalence_pct=s.prevalence_pct,
                    trait_alignment=trait_key,
                    user_proficiency=user_val,
                    model_weight=model_w,
                    priority_tier=tier,
                    rationale=rationale,
                )
            )

        # -------------------------------------------------------------
        # RECOMMENDATIONS (Deterministic, Grounded Rules)
        # -------------------------------------------------------------
        recommendations: List[RecommendationItem] = []

        # 1. Highest-Leverage Trait Recommendation (from JDS)
        lowest_high_weight_trait = min(
            ["maths_stats_skills", "dashboard_and_storytelling_skills", "ai_and_ml_skills"],
            key=lambda t: user_skills_dict.get(t, 5.0),
        )
        trait_val = user_skills_dict.get(lowest_high_weight_trait, 3.0)
        trait_w = TRAIT_STANDARDIZED_WEIGHTS[lowest_high_weight_trait]
        trait_name = TRAIT_DISPLAY_NAMES[lowest_high_weight_trait]

        recommendations.append(
            RecommendationItem(
                recommendation_type="skill_development",
                title=f"Prioritize High-Leverage Trait: {trait_name}",
                actionable_guidance=(
                    f"Strengthen portfolio evidence in {trait_name}. In the JDS salary-hike classification benchmark, "
                    f"{trait_name} carries a standardized coefficient of +{trait_w:.2f}. "
                    f"Current profile rating ({trait_val:.1f}/5.0) represents an actionable growth opportunity."
                ),
                evidence=(
                    f"In JDS Skill Traits (n=139), {trait_name} is a top positive associate of salary hike class "
                    f"(coefficient: +{trait_w:.4f}, odds ratio: {round(float(2.71828 ** trait_w), 2)})."
                ),
                source_dataset="JDS Skill Traits.xlsx",
                sample_size=139,
                confidence="Validated Holdout Balanced Accuracy: 85.8%",
                caveat="Statistical association in JDS cohort; does not guarantee individual promotion or salary increase.",
            )
        )

        # 2. Market Baseline Requirement (from Analytics Jobs)
        if top_skills:
            top_market_skill = top_skills[0]
            recommendations.append(
                RecommendationItem(
                    recommendation_type="market_alignment",
                    title=f"Solidify Core Market Requirement: {top_market_skill.display_name}",
                    actionable_guidance=(
                        f"Ensure verifiable expertise in {top_market_skill.display_name}. "
                        f"It is the single most demanded skill in '{matched_role_name}' job listings."
                    ),
                    evidence=(
                        f"Appears in {top_market_skill.posting_count} of {role_posting_count} postings "
                        f"({top_market_skill.prevalence_pct}%) for '{matched_role_name}' in Analytics Jobs.csv."
                    ),
                    source_dataset="Analytics Jobs.csv",
                    sample_size=role_posting_count,
                    confidence="Empirical Market Census",
                    caveat="Reflects stated employer keyword requirements in job listing descriptions.",
                )
            )

        # 3. Geographic Strategy Recommendation
        if geo_detail:
            recommendations.append(
                RecommendationItem(
                    recommendation_type="market_alignment",
                    title=f"Geographic Strategy for {geo_detail.location}",
                    actionable_guidance=(
                        f"Target opportunities in {geo_detail.location}, which represents a major cluster "
                        f"({geo_detail.percentage_of_postings}% of total analytics listings). "
                        f"Prominent local requirements include: {', '.join([s.display_name for s in geo_detail.top_skills[:3]])}."
                    ),
                    evidence=(
                        f"{geo_detail.posting_count} job listings located in {geo_detail.location} "
                        f"out of {total_sample} total postings."
                    ),
                    source_dataset="Analytics Jobs.csv",
                    sample_size=geo_detail.posting_count,
                    confidence="Empirical Geographic Aggregation",
                    caveat="Based on listing location metadata; remote work listings may offer alternative geographic distribution.",
                )
            )
        elif role_detail and role_detail.location_summary:
            top_loc = role_detail.location_summary[0]
            recommendations.append(
                RecommendationItem(
                    recommendation_type="market_alignment",
                    title=f"Key Geographic Hub: {top_loc.category}",
                    actionable_guidance=(
                        f"For '{matched_role_name}', {top_loc.category} represents the largest employer cluster "
                        f"({top_loc.percentage}% of role postings)."
                    ),
                    evidence=f"{top_loc.count} postings ({top_loc.percentage}%) for '{matched_role_name}' located in {top_loc.category}.",
                    source_dataset="Analytics Jobs.csv",
                    sample_size=role_posting_count,
                    confidence="Empirical Geographic Aggregation",
                    caveat="Reflects physical job listing location.",
                )
            )

        # 4. Senior Leadership Trait Recommendation (from SDS)
        p_dict = payload.personality_profile.model_dump()
        c_score = p_dict.get("conscientiousness", 50.0)
        o_score = p_dict.get("openness_to_experience", 50.0)

        recommendations.append(
            RecommendationItem(
                recommendation_type="senior_trait",
                title="Senior Professional Profile Alignment (Big Five)",
                actionable_guidance=(
                    f"In the SDS Senior Data Scientist benchmark, Conscientiousness (importance: 38.2%) and "
                    f"Openness to Experience (importance: 31.1%) are the primary traits differentiating success class. "
                    f"Your scores (Conscientiousness: {c_score:.1f}, Openness: {o_score:.1f}) show "
                    f"{'strong' if c_score >= 46 and o_score >= 42 else 'developing'} alignment with high-success cohort patterns."
                ),
                evidence=(
                    f"Random Forest model on SDS Personality Traits (n=161) identifies Conscientiousness (0.382) "
                    f"and Openness (0.311) as top predictors (Holdout Balanced Accuracy: 92.8%)."
                ),
                source_dataset="SDS Personality Traits.xlsx",
                sample_size=161,
                confidence="Validated Classification Benchmark",
                caveat="Observational psychometric patterns in a specific sample; personality traits do not determine or cause professional success.",
            )
        )

        # -------------------------------------------------------------
        # CAVEATS
        # -------------------------------------------------------------
        caveats = [
            "No Future Forecast: Career Scan provides cross-sectional market structure and cohort benchmarks; it does not model 2026-2030 future forecasts.",
            "Observational Associations Only: Predictive outputs from JDS (n=139) and SDS (n=161) reflect statistical correlations in sample cohorts, not causal career determinants.",
            "Absence of Official Industry Field: Analytics Jobs.csv does not contain an official industry column; market demand is dimensioned by role designation and geographic location.",
            "Decision-Support Only: Generated intelligence is intended to assist human strategic planning and self-assessment, not automated hiring or personnel evaluation.",
        ]

        return CareerScanResponse(
            market_evidence=market_evidence,
            career_model=career_prediction,
            senior_model=senior_prediction,
            priority_skills=priority_skills,
            recommendations=recommendations,
            caveats=caveats,
        )
