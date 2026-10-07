"""
Role Intelligence Service backed by Analytics Jobs.csv.
Exposes empirical market structure, designation counts, skill profiles,
experience brackets, salary ranges, and geographic distributions.

Strictly factual: No invented 2023-2026 timelines or fabricated growth rates.
"""
import re
import logging
from typing import List, Dict, Optional, Any, Tuple, Set
from collections import Counter
from sqlalchemy.orm import Session

from app.services.market_service import MarketService
from app.schemas.skill import DatasetMetadata
from app.schemas.role import (
    RoleItem,
    RoleListResponse,
    RoleDetailResponse,
    RoleSkillsResponse,
    SkillProfileItem,
    ExperienceSummary,
    ExperienceDistributionItem,
    SalarySummary,
    SalaryBracketItem,
    DistributionItem,
    RoleResponse,
    RoleEvolutionResponse,
    SkillShift,
)

logger = logging.getLogger("skillx.role_service")

DATASET_NAME = "Analytics Jobs.csv (Official Hackathon Dataset)"
DATA_CAVEATS = [
    "Cross-sectional job listing data without historical timestamps; longitudinal 2023-2026 evolution is unsupported by source data.",
    "Salary reflects categorical annual compensation brackets (in INR Lakhs) specified in job listings.",
    "No official industry classification column exists in Analytics Jobs.csv.",
    "Skill requirements are empirically extracted from key_skills field.",
]

SALARY_LABEL_MAP = {
    "0to3": "0-3 Lakhs INR",
    "3to6": "3-6 Lakhs INR",
    "6to10": "6-10 Lakhs INR",
    "10to15": "10-15 Lakhs INR",
    "15to25": "15-25 Lakhs INR",
    "25to50": "25-50 Lakhs INR",
}

# Spam/noise designations to exclude from top professional roles
SPAM_TERMS = {
    "home base job", "freelancer work", "online work", "data entry",
    "part time work", "copy paste", "sms sending"
}


def is_spam_designation(desig: str) -> bool:
    """Detects whether a designation is a generic spam/data-entry listing."""
    if not desig:
        return True
    d_lower = desig.lower()
    return any(term in d_lower for term in SPAM_TERMS)


class RoleService:
    """Service handling factual workforce role intelligence from Analytics Jobs.csv."""

    @staticmethod
    def get_market_service() -> MarketService:
        """Returns the MarketService singleton."""
        return MarketService.get_instance()

    @classmethod
    def get_roles(
        cls,
        search: Optional[str] = None,
        limit: int = 100,
        exclude_spam: bool = True,
    ) -> RoleListResponse:
        """
        Retrieves top job designations ranked by actual posting counts.
        """
        ms = cls.get_market_service()
        postings = ms._postings
        sample_size = len(postings)

        # Count postings by exact designation
        desig_counts: Counter = Counter()
        desig_skills: Dict[str, Counter] = {}

        for p in postings:
            desig = p["job_desig"]
            if not desig:
                continue
            if exclude_spam and is_spam_designation(desig):
                continue
            desig_counts[desig] += 1
            if desig not in desig_skills:
                desig_skills[desig] = Counter()
            for s in p["skills"]:
                desig_skills[desig][s["display_name"]] += 1

        search_term = search.strip().lower() if search and search.strip() else None

        role_items: List[RoleItem] = []
        for desig, count in desig_counts.most_common():
            if search_term and search_term not in desig.lower():
                continue

            slug = re.sub(r"[^\w\s\-]", "", desig.lower())
            slug = re.sub(r"[\s_]+", "-", slug).strip("-") or "role"
            prevalence = round(count / sample_size, 4) if sample_size > 0 else 0.0
            prevalence_pct = round(prevalence * 100.0, 2)

            top_skills = [
                skill_name for skill_name, _ in desig_skills[desig].most_common(5)
            ]

            role_items.append(
                RoleItem(
                    role_id=slug,
                    designation=desig,
                    posting_count=count,
                    sample_size=sample_size,
                    prevalence=prevalence,
                    prevalence_pct=prevalence_pct,
                    rank=len(role_items) + 1,
                    top_skills=top_skills,
                )
            )

        # Re-assign sequential rank after search filtering
        for i, item in enumerate(role_items):
            item.rank = i + 1

        total_roles = len(role_items)
        sliced_data = role_items[:limit] if limit > 0 else role_items

        metadata = DatasetMetadata(
            dataset_name=DATASET_NAME,
            sample_size=sample_size,
            methodology="Empirical frequency aggregation of job_desig column from Analytics Jobs.csv",
            limitations="Cross-sectional observational snapshot without temporal timestamps",
        )

        return RoleListResponse(
            total_roles=total_roles,
            sample_size=sample_size,
            data=sliced_data,
            metadata=metadata,
        )

    @classmethod
    def _find_postings_for_role(
        cls,
        role_name: str,
    ) -> Tuple[Optional[str], List[Dict[str, Any]]]:
        """
        Finds matching postings for a role string.
        Prioritizes exact case-insensitive match, falls back to substring match.
        """
        ms = cls.get_market_service()
        postings = ms._postings
        q_raw = role_name.strip()
        q_clean = q_raw.replace("-", " ").lower()

        # 1. Exact match search
        exact_postings = [
            p for p in postings
            if p["job_desig_lower"] == q_clean or p["job_desig_lower"] == q_raw.lower()
        ]
        if exact_postings:
            matched_title = exact_postings[0]["job_desig"]
            return matched_title, exact_postings

        # 2. Substring match search
        sub_postings = [
            p for p in postings
            if q_clean in p["job_desig_lower"] or q_raw.lower() in p["job_desig_lower"]
        ]
        if sub_postings:
            # Pick most common exact title within the substring matches
            title_counts = Counter(p["job_desig"] for p in sub_postings)
            dominant_title = title_counts.most_common(1)[0][0]
            return dominant_title, sub_postings

        return None, []

    @classmethod
    def get_role_detail(
        cls,
        role_name: str,
    ) -> Optional[RoleDetailResponse]:
        """
        Retrieves comprehensive factual market structure profile for a role:
        - posting count & prevalence
        - top skills with prevalence within role
        - experience distribution
        - job type distribution
        - salary distribution
        - location distribution
        - data caveats
        """
        title, matched_postings = cls._find_postings_for_role(role_name)
        if not matched_postings:
            return None

        ms = cls.get_market_service()
        total_sample = len(ms._postings)
        role_count = len(matched_postings)
        prevalence = round(role_count / total_sample, 4) if total_sample > 0 else 0.0
        prevalence_pct = round(prevalence * 100.0, 2)

        # 1. Skill Profile
        skill_counts: Counter = Counter()
        skill_meta: Dict[str, Dict[str, str]] = {}
        for p in matched_postings:
            for s in p["skills"]:
                sid = s["skill_id"]
                skill_counts[sid] += 1
                if sid not in skill_meta:
                    skill_meta[sid] = s

        skill_profile: List[SkillProfileItem] = []
        for sid, cnt in skill_counts.most_common(20):
            meta = skill_meta[sid]
            sprev = round(cnt / role_count, 4) if role_count > 0 else 0.0
            sprev_pct = round(sprev * 100.0, 2)
            skill_profile.append(
                SkillProfileItem(
                    skill_id=sid,
                    canonical_name=meta["canonical_name"],
                    display_name=meta["display_name"],
                    posting_count=cnt,
                    prevalence=sprev,
                    prevalence_pct=sprev_pct,
                    rank=len(skill_profile) + 1,
                )
            )

        # 2. Experience Distribution
        exp_counts: Counter = Counter()
        min_exps: List[int] = []
        max_exps: List[int] = []

        for p in matched_postings:
            raw_exp = p["experience_raw"] or "Unspecified"
            exp_counts[raw_exp] += 1
            if p["min_exp"] is not None:
                min_exps.append(p["min_exp"])
            if p["max_exp"] is not None:
                max_exps.append(p["max_exp"])

        dominant_exp = exp_counts.most_common(1)[0][0] if exp_counts else None
        avg_min = round(sum(min_exps) / len(min_exps), 1) if min_exps else None
        avg_max = round(sum(max_exps) / len(max_exps), 1) if max_exps else None

        exp_breakdown = [
            ExperienceDistributionItem(
                experience=exp,
                count=c,
                percentage=round((c / role_count) * 100.0, 1),
            )
            for exp, c in exp_counts.most_common(10)
        ]

        exp_summary = ExperienceSummary(
            dominant_range=dominant_exp,
            min_experience_avg=avg_min,
            max_experience_avg=avg_max,
            breakdown=exp_breakdown,
        )

        # 3. Salary Distribution
        sal_counts: Counter = Counter()
        for p in matched_postings:
            raw_row = ms._df.iloc[p["index"]]
            raw_sal = str(raw_row.get("salary", "")).strip()
            if raw_sal and raw_sal.lower() not in ("nan", "none", ""):
                sal_counts[raw_sal] += 1

        salary_brackets: List[SalaryBracketItem] = []
        dominant_salary = sal_counts.most_common(1)[0][0] if sal_counts else None

        for raw_sal, cnt in sal_counts.most_common():
            label = SALARY_LABEL_MAP.get(raw_sal, f"{raw_sal} Lakhs")
            salary_brackets.append(
                SalaryBracketItem(
                    bracket=label,
                    raw_bracket=raw_sal,
                    count=cnt,
                    percentage=round((cnt / role_count) * 100.0, 1),
                )
            )

        sal_summary = SalarySummary(
            dominant_bracket=SALARY_LABEL_MAP.get(dominant_salary, dominant_salary) if dominant_salary else None,
            brackets=salary_brackets,
        )

        # 4. Job Type Distribution
        type_counts: Counter = Counter()
        for p in matched_postings:
            jt = p["job_type"] or "Unspecified"
            type_counts[jt] += 1

        job_type_dist = [
            DistributionItem(
                category=cat,
                count=c,
                percentage=round((c / role_count) * 100.0, 1),
            )
            for cat, c in type_counts.most_common(5)
        ]

        # 5. Location Distribution
        loc_counts: Counter = Counter()
        for p in matched_postings:
            loc = p["location"] or "Unspecified"
            # In multi-location listings, count primary location
            primary_loc = loc.split(",")[0].strip() if "," in loc else loc
            loc_counts[primary_loc] += 1

        loc_dist = [
            DistributionItem(
                category=cat,
                count=c,
                percentage=round((c / role_count) * 100.0, 1),
            )
            for cat, c in loc_counts.most_common(8)
        ]

        metadata = DatasetMetadata(
            dataset_name=DATASET_NAME,
            sample_size=total_sample,
            methodology="Empirical frequency aggregation from observed job listings in Analytics Jobs.csv",
            limitations="Cross-sectional observational dataset without longitudinal timestamps; no official industry column present",
        )

        return RoleDetailResponse(
            role_name=role_name,
            designation=title or role_name,
            posting_count=role_count,
            sample_size=total_sample,
            prevalence=prevalence,
            prevalence_pct=prevalence_pct,
            top_skills=skill_profile,
            experience_distribution=exp_summary,
            job_type_distribution=job_type_dist,
            salary_summary=sal_summary,
            location_summary=loc_dist,
            data_caveats=DATA_CAVEATS,
            metadata=metadata,
        )

    @classmethod
    def get_role_skills(
        cls,
        role_name: str,
        limit: int = 20,
    ) -> Optional[RoleSkillsResponse]:
        """
        Retrieves top skill requirements for a selected job designation.
        """
        detail = cls.get_role_detail(role_name)
        if not detail:
            return None

        sliced_skills = detail.top_skills[:limit] if limit > 0 else detail.top_skills

        return RoleSkillsResponse(
            role_name=detail.role_name,
            designation=detail.designation,
            posting_count=detail.posting_count,
            sample_size=detail.sample_size,
            skills=sliced_skills,
            metadata=detail.metadata,
        )

    @classmethod
    def get_all_roles(cls, db: Optional[Session] = None, skip: int = 0, limit: int = 100) -> List[RoleResponse]:
        """Backward-compatible method returning active roles with empirical posting counts."""
        roles_resp = cls.get_roles(limit=limit + skip)
        sliced = roles_resp.data[skip : skip + limit]
        return [
            RoleResponse(
                id=item.rank,
                name=item.designation,
                industry="Analytics & Tech",
                posting_count=item.posting_count,
            )
            for item in sliced
        ]

    @classmethod
    def get_role_evolution(cls, db: Optional[Session] = None, role_name: str = "") -> RoleEvolutionResponse:
        """
        Backward-compatible method returning real market structure.
        No fabricated 2023-2026 timelines or invented growth percentages.
        """
        detail = cls.get_role_detail(role_name)
        if not detail:
            return RoleEvolutionResponse(
                role=role_name,
                industry="Analytics & Tech",
                sample_size=0,
                top_skills=[],
                stable_core_skills=[],
                skill_composition=[],
                is_real_data=False,
                caveat="Role not found in Analytics Jobs.csv corpus",
            )

        skills = [s.display_name for s in detail.top_skills[:10]]
        shifts = [
            SkillShift(
                skill=s.display_name,
                weight=s.prevalence,
                type="core" if idx < 3 else ("prominent" if idx < 6 else "adjacent"),
            )
            for idx, s in enumerate(detail.top_skills[:10])
        ]

        return RoleEvolutionResponse(
            role=detail.designation,
            industry="Analytics & Tech",
            sample_size=detail.posting_count,
            top_skills=skills,
            stable_core_skills=skills[:5],
            skill_composition=shifts,
            is_real_data=True,
            caveat="Factual empirical skill profile from Analytics Jobs.csv; cross-sectional data only",
        )
