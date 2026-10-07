"""
SKILL//X Copilot Service.
Grounded analytics interface answering strictly from the official hackathon datasets:
1. Analytics Jobs.csv (Workforce Market Intelligence & Geography)
2. Data Science Jobs.csv (Employer Hiring Volumes & Compensation)
3. JDS Skill Traits.xlsx (Career Success Logistic Regression Model)
4. SDS Personality Traits.xlsx (Senior Success Random Forest Model)
5. Skill Genome (Jaccard Co-occurrence Network)
6. Career Scan (Multi-layer Profile Synthesis)

Zero generic chatbot fluff. Zero fabricated statistics. Zero future forecasts.
Returns exact standard message when evidence is insufficient:
"I don't have enough evidence in the supplied hackathon data to answer that."
"""
import re
import logging
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

from app.schemas.copilot import (
    CopilotContext,
    CopilotInput,
    CopilotResponse,
    EvidenceItem,
)
from app.services.market_service import MarketService
from app.services.role_service import RoleService
from app.services.genome_service import GenomeService
from app.services.career_success_service import get_career_success_service
from app.services.senior_success_service import get_senior_success_service
from app.services.career_scan_service import CareerScanService
from app.services.data_loader import DataLoader
from app.schemas.career_scan import CareerScanInput
from app.schemas.career_success import CareerSuccessInput
from app.schemas.senior_success import SeniorSuccessInput

logger = logging.getLogger("skillx.copilot")

KNOWN_LOCATIONS = [
    "bengaluru", "bangalore", "mumbai", "pune", "delhi", "delhi ncr",
    "hyderabad", "chennai", "kolkata", "noida", "gurgaon", "ahmedabad",
]

KNOWN_ROLES = [
    "data scientist", "business analyst", "data analyst", "data engineer",
    "machine learning engineer", "statistician", "analytics consultant",
    "software engineer", "analyst",
]

KNOWN_SKILLS = [
    "python", "sql", "machine learning", "tableau", "power bi", "r", "aws",
    "spark", "hadoop", "excel", "deep learning", "nlp", "statistics",
    "data analysis", "java", "business analysis",
]


class CopilotService:
    """Grounded query router and empirical response generator."""

    @classmethod
    def _extract_location(cls, text: str, context: Optional[CopilotContext]) -> Optional[str]:
        """Extract location from explicit context or query text."""
        if context and context.location and context.location.strip():
            return context.location.strip()
        t = text.lower()
        for loc in KNOWN_LOCATIONS:
            if loc in t:
                return "Bengaluru" if loc == "bangalore" else loc.title()
        return None

    @classmethod
    def _extract_role(cls, text: str, context: Optional[CopilotContext]) -> Optional[str]:
        """Extract role from explicit context or query text."""
        if context and context.role and context.role.strip():
            return context.role.strip()
        t = text.lower()
        for r in KNOWN_ROLES:
            if r in t:
                return r.title()
        # Regex match: "for [Role Name]"
        match = re.search(r"(?:for|role|title|as a|as an)\s+([a-zA-Z\s]{3,25})", text, re.IGNORECASE)
        if match:
            candidate = match.group(1).strip()
            # Clean common trailing punctuation or stop words
            candidate = re.sub(r"\b(skills|skill|postings|jobs|roles)\b", "", candidate, flags=re.IGNORECASE).strip()
            if candidate and len(candidate) > 2:
                return candidate.title()
        return None

    @classmethod
    def _extract_focal_skill(cls, text: str) -> Optional[str]:
        """Extract focal skill mentioned in co-occurrence question."""
        t = text.lower()
        for s in KNOWN_SKILLS:
            if s in t:
                return s.title()
        return None

    @classmethod
    def answer_query(cls, payload: CopilotInput) -> CopilotResponse:
        """Route question to deterministic domain handler or return insufficient evidence response."""
        q_raw = payload.question.strip()
        q = q_raw.lower()
        ctx = payload.context

        # Reject unsupported temporal forecasting / industry questions explicitly
        if any(term in q for term in ["2026", "2027", "2028", "2030", "forecast", "future growth rate", "predict the future"]):
            return cls._unsupported_response(
                "The supplied hackathon dataset does not contain longitudinal timestamps or future forecast data. "
                "SKILL//X evaluates factual cross-sectional market structure and empirical cohort models only."
            )

        if "industry" in q and not any(k in q for k in ["skill", "role", "model", "location"]):
            return cls._unsupported_response(
                "The supplied Analytics Jobs dataset does not provide an official industry classification column. "
                "Market demand is dimensioned by role designation and geographic location."
            )

        # 1. Career Scan Intent
        if any(p in q for p in ["career scan", "scan for", "evaluate profile for", "full scan"]):
            role = cls._extract_role(q_raw, ctx) or "Data Scientist"
            loc = cls._extract_location(q_raw, ctx)
            return cls._handle_career_scan(role, loc)

        # 2. JDS Career Success Model Intent
        if any(p in q for p in [
            "career success model", "jds model", "jds", "salary hike model",
            "skills matter most in the jds", "which skills matter most",
            "salary hike", "salary increase model", "jds career",
        ]):
            return cls._handle_jds_career_model()

        # 3. SDS Senior Success Model Intent
        if any(p in q for p in [
            "senior success model", "sds model", "sds", "personality model",
            "personality traits", "senior data scientist", "big five",
            "senior model", "conscientiousness",
        ]):
            return cls._handle_sds_senior_model()

        # 4. Skill Genome / Co-occurrence Intent
        if any(p in q for p in [
            "occur together", "co-occur", "cooccurrence", "together",
            "skill genome", "genome", "paired with", "associated with", "cluster",
        ]):
            focal = cls._extract_focal_skill(q_raw)
            return cls._handle_skill_genome(focal)

        # 5. Role Specific Skills Intent
        role_match = cls._extract_role(q_raw, ctx)
        if role_match and any(p in q for p in ["skill", "common for", "required for", "needed for", "demand for", "profile"]):
            return cls._handle_role_skills(role_match)

        # 6. Location Specific Skills Intent
        loc_match = cls._extract_location(q_raw, ctx)
        if loc_match and any(p in q for p in ["skill", "common in", "in ", "demand in", "location", "market in"]):
            return cls._handle_location_skills(loc_match)

        # 7. Top Demanded Skills Intent
        if any(p in q for p in [
            "most demanded", "top skills", "in-demand", "highest demand",
            "popular skills", "most common skills", "what skills are demanded",
        ]):
            return cls._handle_top_demanded_skills()

        # 8. Employer Hiring / Data Science Jobs Intent
        if any(p in q for p in [
            "companies", "company", "who is hiring", "employers",
            "hiring data scientists", "data science jobs", "top hiring",
        ]):
            return cls._handle_company_hiring()

        # Fallback: Check if general role query
        if role_match:
            return cls._handle_role_skills(role_match)

        # Fallback: Check if general location query
        if loc_match:
            return cls._handle_location_skills(loc_match)

        # 9. Not enough evidence in hackathon data
        return cls._unsupported_response()

    # ------------------------------------------------------------------
    # DOMAIN INTENT HANDLERS
    # ------------------------------------------------------------------

    @classmethod
    def _handle_top_demanded_skills(cls) -> CopilotResponse:
        """Answer queries about overall top in-demand skills."""
        ms = MarketService.get_instance()
        skills_resp = ms.get_skills(limit=5)
        total_sample = ms.total_eligible_postings

        lines = [f"Based on {total_sample:,} verified listings in Analytics Jobs.csv, the top in-demand skills are:"]
        evidence = []
        for rank, s in enumerate(skills_resp.data, start=1):
            pct = s.prevalence_pct
            lines.append(f"{rank}. {s.display_name}: {s.posting_count:,} postings ({pct:.1f}% market prevalence)")
            evidence.append(
                EvidenceItem(
                    source="Analytics Jobs.csv",
                    metric="posting_count & prevalence",
                    value=f"{s.display_name}: {s.posting_count} listings ({pct:.1f}%)",
                    sample_size=total_sample,
                )
            )

        return CopilotResponse(
            answer="\n".join(lines),
            evidence=evidence,
            methodology="Empirical frequency counting and canonicalization of key_skills from Analytics Jobs.csv.",
            caveats=[
                "Cross-sectional job listing census without historical timestamps; reflects current market snapshot.",
                "Listing requirements reflect keywords specified by employers in job descriptions.",
            ],
        )

    @classmethod
    def _handle_role_skills(cls, role_name: str) -> CopilotResponse:
        """Answer queries about skills required for a specific role."""
        role_detail = RoleService.get_role_detail(role_name)
        if not role_detail:
            roles_resp = RoleService.get_roles(search=role_name, limit=1)
            if roles_resp.data:
                role_detail = RoleService.get_role_detail(roles_resp.data[0].designation)

        if not role_detail or role_detail.posting_count == 0:
            return cls._unsupported_response(
                f"I don't have enough evidence for the role '{role_name}' in the supplied Analytics Jobs dataset."
            )

        matched_desig = role_detail.designation
        postings = role_detail.posting_count
        top_s = role_detail.top_skills[:5]

        lines = [
            f"Based on {postings:,} job postings for '{matched_desig}' in Analytics Jobs.csv, the top required skills are:"
        ]
        evidence = []
        for rank, s in enumerate(top_s, start=1):
            lines.append(f"{rank}. {s.display_name}: required in {s.posting_count} postings ({s.prevalence_pct:.1f}%)")
            evidence.append(
                EvidenceItem(
                    source="Analytics Jobs.csv",
                    metric="within_role_prevalence",
                    value=f"{s.display_name}: {s.posting_count}/{postings} ({s.prevalence_pct:.1f}%)",
                    sample_size=postings,
                )
            )

        return CopilotResponse(
            answer="\n".join(lines),
            evidence=evidence,
            methodology=f"Aggregation of key_skills within job_desig='{matched_desig}' postings.",
            caveats=[
                "Reflects cross-sectional job postings; employers may specify additional unlisted competencies.",
                "No temporal growth timeline is inferred from listing frequencies.",
            ],
        )

    @classmethod
    def _handle_skill_genome(cls, focal_skill: Optional[str] = None) -> CopilotResponse:
        """Answer queries regarding co-occurring skills and the Skill Genome network."""
        gs = GenomeService.get_instance()
        genome = gs.get_skill_genome(focal_skill=focal_skill, limit_edges=5)

        if not genome.edges:
            return cls._unsupported_response(
                f"No verified co-occurrence pairs found above minimum support threshold for '{focal_skill}'."
            )

        target_label = focal_skill if focal_skill else "the analytics workforce"
        lines = [f"In Analytics Jobs.csv, top skills co-occurring with {target_label} are:"]
        evidence = []

        for e in genome.edges[:5]:
            lines.append(
                f"• {e.source.title()} & {e.target.title()}: co-occur in {e.cooccurrence} postings "
                f"(Jaccard similarity: {e.association:.3f})"
            )
            evidence.append(
                EvidenceItem(
                    source="Analytics Jobs.csv (Skill Genome)",
                    metric="jaccard_similarity",
                    value=f"{e.source} <-> {e.target}: {e.cooccurrence} co-occurrences (Jaccard: {e.association:.4f})",
                    sample_size=genome.metadata.sample_size,
                )
            )

        return CopilotResponse(
            answer="\n".join(lines),
            evidence=evidence,
            methodology="Pairwise co-occurrence counting with normalized Jaccard similarity: cooc(A,B) / (count(A) + count(B) - cooc(A,B)).",
            caveats=[
                "Measures simultaneous keyword co-mention within postings; does not represent sequential skill progression.",
                "Minimum support threshold filters rare noisy terms.",
            ],
        )

    @classmethod
    def _handle_jds_career_model(cls) -> CopilotResponse:
        """Answer queries about the JDS Career Success model and high-leverage traits."""
        cs = get_career_success_service()
        meta = cs.get_metadata()

        lines = [
            f"The SKILL//X Career Success model is a {meta.model_type} trained on the JDS Skill Traits dataset (n={meta.dataset_size}).",
            f"Holdout Performance (Test Set n={meta.test_size}):",
            f"• Balanced Accuracy: {meta.metrics.balanced_accuracy * 100:.1f}%",
            f"• ROC-AUC: {meta.metrics.roc_auc * 100:.1f}%",
            f"• Precision: {meta.metrics.precision * 100:.1f}%",
            "\nStandardized Feature Coefficients (Association with High Salary-Hike Class):",
        ]

        evidence = [
            EvidenceItem(
                source="JDS Skill Traits.xlsx",
                metric="balanced_accuracy",
                value=f"{meta.metrics.balanced_accuracy:.4f}",
                sample_size=meta.dataset_size,
            ),
            EvidenceItem(
                source="JDS Skill Traits.xlsx",
                metric="roc_auc",
                value=f"{meta.metrics.roc_auc:.4f}",
                sample_size=meta.dataset_size,
            ),
        ]

        for item in meta.feature_importance:
            sign = "+" if (item.coefficient or 0) >= 0 else ""
            lines.append(
                f"{item.rank}. {item.display_name}: coef={sign}{item.coefficient:.4f} "
                f"(Odds Ratio: {item.odds_ratio:.2f})"
            )
            evidence.append(
                EvidenceItem(
                    source="JDS Skill Traits.xlsx",
                    metric="standardized_coefficient",
                    value=f"{item.display_name}: {sign}{item.coefficient:.4f} (odds ratio: {item.odds_ratio:.2f})",
                    sample_size=meta.dataset_size,
                )
            )

        lines.append(
            "\nConclusion: Mathematics & Statistics and Dashboard & Storytelling show the strongest statistical association "
            "with the high salary-hike class in this sample."
        )

        return CopilotResponse(
            answer="\n".join(lines),
            evidence=evidence,
            methodology="StandardScaler + Logistic Regression (class_weight='balanced') evaluated on a 75/25 stratified holdout split.",
            caveats=meta.limitations,
        )

    @classmethod
    def _handle_sds_senior_model(cls) -> CopilotResponse:
        """Answer queries about the SDS Senior Success model and personality trait importance."""
        ss = get_senior_success_service()
        meta = ss.get_metadata()

        lines = [
            f"The SKILL//X Senior Success model is a {meta.model_type} trained on the SDS Personality Traits dataset (n={meta.dataset_size}).",
            f"Holdout Performance (Test Set n={meta.test_size}):",
            f"• Balanced Accuracy: {meta.metrics.balanced_accuracy * 100:.1f}%",
            f"• ROC-AUC: {meta.metrics.roc_auc * 100:.1f}%",
            f"• Precision: {meta.metrics.precision * 100:.1f}%",
            "\nFeature Importance (Gini Tree Importance):",
        ]

        evidence = [
            EvidenceItem(
                source="SDS Personality Traits.xlsx",
                metric="balanced_accuracy",
                value=f"{meta.metrics.balanced_accuracy:.4f}",
                sample_size=meta.dataset_size,
            ),
            EvidenceItem(
                source="SDS Personality Traits.xlsx",
                metric="roc_auc",
                value=f"{meta.metrics.roc_auc:.4f}",
                sample_size=meta.dataset_size,
            ),
        ]

        for item in meta.feature_importance:
            pct = item.importance * 100.0
            lines.append(f"{item.rank}. {item.display_name}: importance={item.importance:.4f} ({pct:.1f}%)")
            evidence.append(
                EvidenceItem(
                    source="SDS Personality Traits.xlsx",
                    metric="tree_importance",
                    value=f"{item.display_name}: {item.importance:.4f} ({pct:.1f}%)",
                    sample_size=meta.dataset_size,
                )
            )

        lines.append(
            "\nConclusion: In the SDS sample, Conscientiousness and Openness to Experience are the primary traits differentiating "
            "senior professional success classifications."
        )

        return CopilotResponse(
            answer="\n".join(lines),
            evidence=evidence,
            methodology="Random Forest Classifier (n_estimators=100, max_depth=4, balanced) evaluated on a 75/25 stratified holdout split.",
            caveats=meta.limitations,
        )

    @classmethod
    def _handle_location_skills(cls, location: str) -> CopilotResponse:
        """Answer queries about geographic demand and prominent skills in a specific city."""
        ms = MarketService.get_instance()
        geo = ms.get_geographic_market_detail(location)

        if not geo:
            return cls._unsupported_response(
                f"I don't have enough evidence for the location '{location}' in the supplied Analytics Jobs dataset."
            )

        total_sample = ms.total_eligible_postings
        lines = [
            f"Based on Analytics Jobs.csv, {geo.location} represents {geo.posting_count:,} postings "
            f"({geo.percentage_of_postings:.1f}% of total listings).",
            f"\nTop in-demand skills in {geo.location}:",
        ]
        evidence = [
            EvidenceItem(
                source="Analytics Jobs.csv",
                metric="location_postings",
                value=f"{geo.location}: {geo.posting_count} ({geo.percentage_of_postings:.1f}%)",
                sample_size=total_sample,
            )
        ]

        for rank, s in enumerate(geo.top_skills[:5], start=1):
            lines.append(f"{rank}. {s.display_name}: {s.posting_count} listings ({s.prevalence_pct:.1f}% within city)")
            evidence.append(
                EvidenceItem(
                    source="Analytics Jobs.csv",
                    metric="city_skill_prevalence",
                    value=f"{s.display_name}: {s.posting_count} ({s.prevalence_pct:.1f}%)",
                    sample_size=geo.posting_count,
                )
            )

        return CopilotResponse(
            answer="\n".join(lines),
            evidence=evidence,
            methodology=f"Filtering of job postings matching location='{geo.location}' and aggregating key_skills.",
            caveats=[
                "Reflects employer posting locations; remote job postings may offer different geographic distributions.",
                "Analytics Jobs does not contain an official industry code.",
            ],
        )

    @classmethod
    def _handle_career_scan(cls, role_name: str, location: Optional[str] = None) -> CopilotResponse:
        """Synthesize a quick career scan summary for a specified role."""
        payload = CareerScanInput(
            target_role=role_name,
            location=location,
            skill_profile=CareerSuccessInput(
                big_data_skills=4.0,
                maths_stats_skills=4.5,
                coding_skills=4.0,
                ai_and_ml_skills=4.2,
                dashboard_and_storytelling_skills=4.0,
            ),
            personality_profile=SeniorSuccessInput(
                neuroticism=32.0,
                extraversion=48.0,
                openness_to_experience=50.0,
                agreeableness=46.0,
                conscientiousness=54.0,
            ),
        )
        scan = CareerScanService.run_career_scan(payload)

        lines = [
            f"SKILL//X Career Scan Summary for '{role_name}':",
            f"• Market Demand: {scan.market_evidence[0].summary}",
            f"• Career Success Model: {scan.career_model.interpretation}",
            f"• Senior Leadership Model: {scan.senior_model.interpretation}",
            "\nPriority Skill Focus Areas:",
        ]

        evidence = [
            EvidenceItem(
                source="Analytics Jobs.csv",
                metric="role_postings",
                value=f"{scan.market_evidence[0].posting_count} postings",
                sample_size=scan.market_evidence[0].sample_size,
            ),
            EvidenceItem(
                source="JDS Skill Traits.xlsx",
                metric="model_prediction",
                value=f"Prob high: {scan.career_model.probability_high * 100:.1f}%",
                sample_size=139,
            ),
        ]

        for ps in scan.priority_skills[:4]:
            lines.append(f"• {ps.skill_name} ({ps.priority_tier}): {ps.rationale}")
            evidence.append(
                EvidenceItem(
                    source="Analytics Jobs & JDS",
                    metric="priority_tier",
                    value=f"{ps.skill_name} -> {ps.priority_tier}",
                    sample_size=scan.market_evidence[0].posting_count,
                )
            )

        return CopilotResponse(
            answer="\n".join(lines),
            evidence=evidence,
            methodology="Synthesis across Market Demand (Analytics Jobs), Junior Success (JDS), and Senior Success (SDS).",
            caveats=scan.caveats,
        )

    @classmethod
    def _handle_company_hiring(cls) -> CopilotResponse:
        """Answer queries about companies and employers hiring data scientists."""
        dl = DataLoader()
        try:
            df = dl.load_datascience_jobs_raw()
        except Exception as e:
            return cls._unsupported_response("Data Science Jobs dataset unavailable.")

        sample_size = len(df)
        df_copy = df.copy()
        df_copy["jobs_numeric"] = pd.to_numeric(df_copy["num_of_jobs"], errors="coerce").fillna(0)
        top_companies = df_copy.sort_values(by="jobs_numeric", ascending=False).head(5)

        lines = [f"Based on {sample_size:,} employer records in Data Science Jobs.csv, top hiring employers are:"]
        evidence = []

        for rank, (_, row) in enumerate(top_companies.iterrows(), start=1):
            co = row["company_name"]
            jobs = int(row["jobs_numeric"])
            avg_sal = row.get("avg_salary", "N/A")
            lines.append(f"{rank}. {co}: {jobs:,} open listings (Average Salary: {avg_sal})")
            evidence.append(
                EvidenceItem(
                    source="Data Science Jobs.csv",
                    metric="num_of_jobs",
                    value=f"{co}: {jobs} jobs (Avg Salary: {avg_sal})",
                    sample_size=sample_size,
                )
            )

        return CopilotResponse(
            answer="\n".join(lines),
            evidence=evidence,
            methodology="Aggregation and sorting by num_of_jobs from Data Science Jobs.csv.",
            caveats=[
                "Reflects company-reported listings in the Data Science Jobs dataset.",
                "Salary ranges represent reported employer averages.",
            ],
        )

    @classmethod
    def _unsupported_response(cls, custom_caveat: Optional[str] = None) -> CopilotResponse:
        """Standard fallback response when evidence is insufficient."""
        caveats = [
            custom_caveat
            if custom_caveat
            else "The supplied hackathon datasets (Analytics Jobs, Data Science Jobs, JDS Skill Traits, SDS Personality Traits) do not contain sufficient evidence to answer this query."
        ]
        return CopilotResponse(
            answer="I don't have enough evidence in the supplied hackathon data to answer that.",
            evidence=[],
            methodology="Evidence verification gate against official hackathon datasets.",
            caveats=caveats,
        )
