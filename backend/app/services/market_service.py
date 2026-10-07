"""
Market Intelligence Layer for Analytics Jobs.csv.
Empirically computes canonical skill frequencies, prevalence, rankings,
multi-dimensional filtering, co-occurrence associations, and Skill Radar metrics.

All values are strictly data-derived from the official SAS hackathon dataset.
No hardcoded percentages, fabricated ML predictions, or mock values.
"""
import re
import logging
from typing import List, Dict, Optional, Any, Tuple, Set
from collections import Counter
import pandas as pd

from app.services.data_loader import DataLoader
from app.services.skill_extraction import extract_and_canonicalize_skills, canonicalize_skill
from app.schemas.skill import (
    CanonicalSkill,
    SkillRadarItem,
    SkillRadarResponse,
    AssociatedSkill,
    SkillDetailResponse,
    SkillListResponse,
    DatasetMetadata,
)
from app.schemas.geography import (
    GeographicMarketItem,
    GeographicMarketListResponse,
    GeographicMarketDetailResponse,
)
from app.schemas.role import (
    SkillProfileItem,
    DistributionItem,
    ExperienceSummary,
    ExperienceDistributionItem,
    SalarySummary,
    SalaryBracketItem,
)

logger = logging.getLogger("skillx.market_service")

DATASET_NAME = "Analytics Jobs.csv (Official Hackathon Dataset)"
METHODOLOGY = (
    "Empirical frequency counting and normalized co-occurrence from observed job postings "
    "in Analytics Jobs.csv"
)
LIMITATIONS = (
    "Cross-sectional job listing data without historical timestamps; reflects current market "
    "snapshot; no official industry column present in dataset"
)


def parse_experience_range(exp_val: Any) -> Tuple[Optional[int], Optional[int]]:
    """Extracts min_exp and max_exp integers from experience strings like '6-10 yrs'."""
    if exp_val is None or pd.isna(exp_val):
        return None, None
    s = str(exp_val).strip().lower()
    range_match = re.search(r"(\d+)\s*(?:-|to)\s*(\d+)", s)
    if range_match:
        try:
            return int(range_match.group(1)), int(range_match.group(2))
        except (ValueError, TypeError):
            pass
    single_match = re.search(r"(\d+)", s)
    if single_match:
        try:
            v = int(single_match.group(1))
            return v, v
        except (ValueError, TypeError):
            pass
    return None, None


class MarketService:
    """
    Core Market Intelligence Service backed by Analytics Jobs.csv.
    Caches parsed postings in memory for fast querying, filtering, and co-occurrence lookup.
    """

    _instance: Optional["MarketService"] = None

    def __init__(self, data_loader: Optional[DataLoader] = None):
        self.data_loader = data_loader or DataLoader()
        self._df: Optional[pd.DataFrame] = None
        self._postings: List[Dict[str, Any]] = []
        self._skill_posting_indices: Dict[str, Set[int]] = {}
        self._skill_metadata: Dict[str, Dict[str, str]] = {}
        self._is_loaded = False
        self._load_dataset()

    @classmethod
    def get_instance(cls) -> "MarketService":
        """Singleton accessor for MarketService."""
        if cls._instance is None:
            cls._instance = MarketService()
        return cls._instance

    def _load_dataset(self) -> None:
        """Loads and pre-parses Analytics Jobs.csv into indexed structures."""
        try:
            raw_df = self.data_loader.load_analytics_jobs_raw()
            logger.info(f"Loaded {len(raw_df)} raw rows from Analytics Jobs.csv")
        except Exception as e:
            logger.error(f"Failed to load Analytics Jobs.csv: {e}")
            raw_df = pd.DataFrame(
                columns=["s_no", "experience", "job_description", "job_desig", "job_type", "key_skills", "location", "salary"]
            )

        # Standardize column names
        raw_df.columns = [c.strip().lower().replace(" ", "_") for c in raw_df.columns]

        # Extract rows
        postings: List[Dict[str, Any]] = []
        skill_indices: Dict[str, Set[int]] = {}
        skill_meta: Dict[str, Dict[str, str]] = {}

        for idx, row in raw_df.iterrows():
            job_desig = str(row["job_desig"]).strip() if pd.notna(row.get("job_desig")) else ""
            location = str(row["location"]).strip() if pd.notna(row.get("location")) else ""
            job_type = str(row["job_type"]).strip() if pd.notna(row.get("job_type")) else ""
            raw_exp = str(row["experience"]).strip() if pd.notna(row.get("experience")) else ""
            min_exp, max_exp = parse_experience_range(raw_exp)

            raw_skills = row.get("key_skills")
            extracted = extract_and_canonicalize_skills(raw_skills)

            posting_skill_ids: Set[str] = set()
            for s in extracted:
                sid = s["skill_id"]
                posting_skill_ids.add(sid)
                if sid not in skill_indices:
                    skill_indices[sid] = set()
                    skill_meta[sid] = {
                        "skill_id": sid,
                        "canonical_name": s["canonical_name"],
                        "display_name": s["display_name"],
                    }
                skill_indices[sid].add(idx)

            postings.append({
                "index": idx,
                "job_desig": job_desig,
                "job_desig_lower": job_desig.lower(),
                "location": location,
                "location_lower": location.lower(),
                "job_type": job_type,
                "job_type_lower": job_type.lower(),
                "experience_raw": raw_exp,
                "min_exp": min_exp,
                "max_exp": max_exp,
                "skills": extracted,
                "skill_ids": posting_skill_ids,
            })

        self._df = raw_df
        self._postings = postings
        self._skill_posting_indices = skill_indices
        self._skill_metadata = skill_meta
        self._is_loaded = True
        logger.info(
            f"Preprocessed {len(postings)} eligible postings; indexed {len(skill_indices)} distinct canonical skills."
        )

    @property
    def total_eligible_postings(self) -> int:
        """Returns total postings in the eligible dataset."""
        return len(self._postings)

    def _filter_postings(
        self,
        role: Optional[str] = None,
        location: Optional[str] = None,
        job_type: Optional[str] = None,
        min_experience: Optional[int] = None,
        max_experience: Optional[int] = None,
        experience: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Filters postings based on supported dimensions."""
        role_filter = role.strip().lower() if role and role.strip() else None
        loc_filter = location.strip().lower() if location and location.strip() else None
        type_filter = job_type.strip().lower() if job_type and job_type.strip() else None
        exp_str_filter = experience.strip().lower() if experience and experience.strip() else None

        filtered = []
        for p in self._postings:
            if role_filter and role_filter not in p["job_desig_lower"]:
                continue
            if loc_filter and loc_filter not in p["location_lower"]:
                continue
            if type_filter and type_filter not in p["job_type_lower"]:
                continue
            if exp_str_filter and exp_str_filter not in p["experience_raw"].lower():
                continue
            if min_experience is not None:
                p_max = p["max_exp"]
                if p_max is not None and p_max < min_experience:
                    continue
            if max_experience is not None:
                p_min = p["min_exp"]
                if p_min is not None and p_min > max_experience:
                    continue
            filtered.append(p)
        return filtered

    def get_skills(
        self,
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
        Retrieves canonical skills ranked by demand and prevalence.
        Applies multi-dimensional filters and minimum support threshold.
        """
        filtered_postings = self._filter_postings(
            role=role,
            location=location,
            job_type=job_type,
            min_experience=min_experience,
            max_experience=max_experience,
            experience=experience,
        )
        sample_size = len(filtered_postings)

        # Count postings mentioning each skill
        counts: Counter = Counter()
        for p in filtered_postings:
            for sid in p["skill_ids"]:
                counts[sid] += 1

        # Effective minimum support threshold
        # If filtered cohort is small (e.g. < 50 postings), automatically adapt min_count
        effective_min_count = min_count
        if sample_size > 0 and sample_size < 50:
            effective_min_count = max(1, min(min_count, sample_size // 10))

        # Search filter
        search_term = search.strip().lower() if search and search.strip() else None

        # Build list of CanonicalSkill items
        ranked_skills: List[CanonicalSkill] = []
        for sid, count in counts.most_common():
            if count < effective_min_count:
                continue

            meta = self._skill_metadata.get(sid, {
                "skill_id": sid,
                "canonical_name": sid.replace("-", " "),
                "display_name": sid.replace("-", " ").title(),
            })

            canonical_name = meta["canonical_name"]
            display_name = meta["display_name"]

            if search_term and (search_term not in canonical_name and search_term not in display_name.lower()):
                continue

            prevalence = round(count / sample_size, 4) if sample_size > 0 else 0.0
            prevalence_pct = round(prevalence * 100.0, 2)

            ranked_skills.append(
                CanonicalSkill(
                    skill_id=sid,
                    canonical_name=canonical_name,
                    display_name=display_name,
                    posting_count=count,
                    prevalence=prevalence,
                    prevalence_pct=prevalence_pct,
                    rank=len(ranked_skills) + 1,
                )
            )

        # Re-assign sequential rank after filtering
        for i, item in enumerate(ranked_skills):
            item.rank = i + 1

        total_skills_count = len(ranked_skills)
        sliced_data = ranked_skills[:limit] if limit > 0 else ranked_skills

        filters_applied = {
            "search": search,
            "role": role,
            "location": location,
            "job_type": job_type,
            "min_experience": min_experience,
            "max_experience": max_experience,
            "min_count": effective_min_count,
            "limit": limit,
        }

        metadata = DatasetMetadata(
            dataset_name=DATASET_NAME,
            sample_size=sample_size,
            methodology=METHODOLOGY,
            limitations=LIMITATIONS,
        )

        return SkillListResponse(
            total_skills=total_skills_count,
            sample_size=sample_size,
            filters_applied=filters_applied,
            data=sliced_data,
            metadata=metadata,
        )

    def get_skill_radar(
        self,
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
        Builds the Skill Radar dataset returning canonical skill representations:
        {
          "skill": "...",
          "posting_count": number,
          "prevalence": number,
          "rank": number,
          "sample_size": number
        }
        """
        skill_list_resp = self.get_skills(
            search=None,
            role=role,
            location=location,
            job_type=job_type,
            min_experience=min_experience,
            max_experience=max_experience,
            experience=experience,
            min_count=min_count,
            limit=limit,
        )

        radar_items: List[SkillRadarItem] = [
            SkillRadarItem(
                skill=item.display_name,
                skill_id=item.skill_id,
                canonical_name=item.canonical_name,
                display_name=item.display_name,
                posting_count=item.posting_count,
                prevalence=item.prevalence,
                rank=item.rank,
                sample_size=skill_list_resp.sample_size,
            )
            for item in skill_list_resp.data
        ]

        return SkillRadarResponse(
            total_skills=len(radar_items),
            sample_size=skill_list_resp.sample_size,
            filters_applied=skill_list_resp.filters_applied,
            data=radar_items,
            metadata=skill_list_resp.metadata,
        )

    def get_skill_detail(
        self,
        skill_name: str,
        top_n_associated: int = 10,
    ) -> Optional[SkillDetailResponse]:
        """
        Retrieves detailed empirical profile for an individual skill:
        - canonical representation, rank, prevalence
        - co-occurring skills network with Jaccard association strength and lift
        - top hiring designations and locations
        - transparency metadata
        """
        cleaned_target = canonicalize_skill(skill_name)
        target_id = cleaned_target["skill_id"] if cleaned_target else skill_name.strip().lower().replace(" ", "-")

        # Fallback search by canonical_name or display_name
        if target_id not in self._skill_posting_indices:
            found_id = None
            q_lower = skill_name.strip().lower()
            for sid, meta in self._skill_metadata.items():
                if sid == q_lower or meta["canonical_name"] == q_lower or meta["display_name"].lower() == q_lower:
                    found_id = sid
                    break
            if found_id:
                target_id = found_id
            else:
                return None

        target_postings_indices = self._skill_posting_indices[target_id]
        posting_count = len(target_postings_indices)
        total_sample = self.total_eligible_postings
        prevalence = round(posting_count / total_sample, 4) if total_sample > 0 else 0.0
        prevalence_pct = round(prevalence * 100.0, 2)

        meta = self._skill_metadata.get(target_id, {
            "skill_id": target_id,
            "canonical_name": target_id.replace("-", " "),
            "display_name": target_id.replace("-", " ").title(),
        })

        # Calculate rank across full dataset
        all_counts = [len(indices) for indices in self._skill_posting_indices.values()]
        all_counts.sort(reverse=True)
        try:
            rank = all_counts.index(posting_count) + 1
        except ValueError:
            rank = 1

        # Compute co-occurrence with all other skills
        co_counts: Counter = Counter()
        roles_counter: Counter = Counter()
        locations_counter: Counter = Counter()

        for idx in target_postings_indices:
            p = self._postings[idx]
            if p["job_desig"]:
                roles_counter[p["job_desig"]] += 1
            if p["location"]:
                locations_counter[p["location"]] += 1
            for sid in p["skill_ids"]:
                if sid != target_id:
                    co_counts[sid] += 1

        # Top associated skills with Jaccard and Lift
        associated_skills: List[AssociatedSkill] = []
        for sid, co_count in co_counts.most_common(50):
            other_meta = self._skill_metadata.get(sid, {
                "skill_id": sid,
                "canonical_name": sid.replace("-", " "),
                "display_name": sid.replace("-", " ").title(),
            })
            other_total = len(self._skill_posting_indices[sid])

            # Jaccard index: |A & B| / (|A| + |B| - |A & B|)
            union_count = posting_count + other_total - co_count
            jaccard = round(co_count / union_count, 4) if union_count > 0 else 0.0

            # Lift: P(A & B) / (P(A) * P(B)) = (co_count * total_sample) / (posting_count * other_total)
            expected = (posting_count * other_total) / total_sample if total_sample > 0 else 0.0
            lift = round(co_count / expected, 2) if expected > 0 else 0.0

            associated_skills.append(
                AssociatedSkill(
                    skill_id=sid,
                    canonical_name=other_meta["canonical_name"],
                    display_name=other_meta["display_name"],
                    co_occurrence_count=co_count,
                    association_strength=jaccard,
                    lift=lift,
                )
            )

        # Sort associated skills by association strength descending
        associated_skills.sort(key=lambda x: (x.association_strength, x.co_occurrence_count), reverse=True)
        top_associated = associated_skills[:top_n_associated]

        top_hiring_roles = [
            {"role": r, "count": c} for r, c in roles_counter.most_common(5)
        ]
        top_locations = [
            {"location": l, "count": c} for l, c in locations_counter.most_common(5)
        ]

        metadata = DatasetMetadata(
            dataset_name=DATASET_NAME,
            sample_size=total_sample,
            methodology=METHODOLOGY,
            limitations=LIMITATIONS,
        )

        return SkillDetailResponse(
            skill_id=target_id,
            canonical_name=meta["canonical_name"],
            display_name=meta["display_name"],
            posting_count=posting_count,
            prevalence=prevalence,
            prevalence_pct=prevalence_pct,
            rank=rank,
            supporting_sample_count=posting_count,
            sample_size=total_sample,
            skill_information={
                "skill_id": target_id,
                "canonical_name": meta["canonical_name"],
                "display_name": meta["display_name"],
                "rank": rank,
                "posting_count": posting_count,
                "prevalence": prevalence,
            },
            top_associated_skills=top_associated,
            top_hiring_roles=top_hiring_roles,
            top_locations=top_locations,
            metadata=metadata,
        )

    def get_geographic_markets(
        self,
        limit: int = 20,
    ) -> GeographicMarketListResponse:
        """
        Retrieves top geographical market hubs ranked by job posting frequency.
        Includes posting counts, market share percentage, top skills,
        and parsed salary/experience metrics.
        """
        total_sample = self.total_eligible_postings
        hubs = [
            "Bengaluru", "Mumbai", "Gurgaon", "Delhi NCR", "Pune",
            "Hyderabad", "Chennai", "Noida", "Kolkata", "Ahmedabad",
            "Kochi", "Trivandrum", "Chandigarh", "Jaipur", "Navi Mumbai"
        ]

        salary_midpoints = {
            "0to3": 1.5, "3to6": 4.5, "6to10": 8.0,
            "10to15": 12.5, "15to25": 20.0, "25to50": 37.5,
        }

        hub_items: List[GeographicMarketItem] = []

        for city in hubs:
            city_lower = city.lower()
            city_postings = [p for p in self._postings if city_lower in p["location_lower"]]
            count = len(city_postings)
            if count == 0:
                continue

            pct = round((count / total_sample) * 100.0, 2) if total_sample > 0 else 0.0

            # Top skills in this city
            city_skills: Counter = Counter()
            sal_values: List[float] = []
            exp_counts: Counter = Counter()
            min_exps: List[int] = []
            max_exps: List[int] = []

            for p in city_postings:
                for s in p["skills"]:
                    city_skills[s["display_name"]] += 1
                if p["experience_raw"]:
                    exp_counts[p["experience_raw"]] += 1
                if p["min_exp"] is not None:
                    min_exps.append(p["min_exp"])
                if p["max_exp"] is not None:
                    max_exps.append(p["max_exp"])

                raw_row = self._df.iloc[p["index"]]
                raw_sal = str(raw_row.get("salary", "")).strip()
                if raw_sal in salary_midpoints:
                    sal_values.append(salary_midpoints[raw_sal])

            top_skills = [s for s, _ in city_skills.most_common(5)]
            avg_sal = round(sum(sal_values) / len(sal_values), 2) if sal_values else None
            med_sal = round(float(pd.Series(sal_values).median()), 2) if sal_values else None
            dominant_exp = exp_counts.most_common(1)[0][0] if exp_counts else None
            avg_min_exp = round(sum(min_exps) / len(min_exps), 1) if min_exps else None
            avg_max_exp = round(sum(max_exps) / len(max_exps), 1) if max_exps else None

            exp_summary = {
                "dominant_range": dominant_exp,
                "average_min_experience_years": avg_min_exp,
                "average_max_experience_years": avg_max_exp,
            }

            hub_items.append(
                GeographicMarketItem(
                    location=city,
                    posting_count=count,
                    percentage_of_postings=pct,
                    top_skills=top_skills,
                    average_salary=avg_sal,
                    median_salary=med_sal,
                    salary_currency="INR (Lakhs per annum)",
                    dominant_experience=dominant_exp,
                    experience_summary=exp_summary,
                )
            )

        # Sort by posting count descending
        hub_items.sort(key=lambda x: x.posting_count, reverse=True)
        sliced_items = hub_items[:limit] if limit > 0 else hub_items

        metadata = DatasetMetadata(
            dataset_name=DATASET_NAME,
            sample_size=total_sample,
            methodology="Empirical frequency aggregation of location column from Analytics Jobs.csv",
            limitations=(
                "Analytics Jobs.csv does not contain an official industry column; geographical location is "
                "used instead as the primary spatial segmentation dimension."
            ),
        )

        return GeographicMarketListResponse(
            dimension="LOCATION",
            total_locations=len(sliced_items),
            sample_size=total_sample,
            data=sliced_items,
            metadata=metadata,
        )

    def get_geographic_market_detail(
        self,
        location: str,
    ) -> Optional[GeographicMarketDetailResponse]:
        """
        Retrieves detailed empirical workforce structure for a specific location:
        - posting count & percentage of total postings
        - top skills with within-location prevalence
        - job designations distribution
        - job types distribution
        - salary distribution (average, median, brackets)
        - experience distribution
        """
        loc_clean = location.strip()
        loc_lower = loc_clean.lower()
        total_sample = self.total_eligible_postings

        matched_postings = [p for p in self._postings if loc_lower in p["location_lower"]]
        if not matched_postings:
            return None

        count = len(matched_postings)
        pct = round((count / total_sample) * 100.0, 2) if total_sample > 0 else 0.0

        salary_midpoints = {
            "0to3": 1.5, "3to6": 4.5, "6to10": 8.0,
            "10to15": 12.5, "15to25": 20.0, "25to50": 37.5,
        }
        salary_labels = {
            "0to3": "0-3 Lakhs INR", "3to6": "3-6 Lakhs INR", "6to10": "6-10 Lakhs INR",
            "10to15": "10-15 Lakhs INR", "15to25": "15-25 Lakhs INR", "25to50": "25-50 Lakhs INR",
        }

        # 1. Skill Profile
        skill_counts: Counter = Counter()
        skill_meta: Dict[str, Dict[str, str]] = {}
        desig_counts: Counter = Counter()
        type_counts: Counter = Counter()
        exp_counts: Counter = Counter()
        sal_counts: Counter = Counter()
        sal_values: List[float] = []
        min_exps: List[int] = []
        max_exps: List[int] = []

        for p in matched_postings:
            for s in p["skills"]:
                sid = s["skill_id"]
                skill_counts[sid] += 1
                if sid not in skill_meta:
                    skill_meta[sid] = s

            if p["job_desig"]:
                desig_counts[p["job_desig"]] += 1
            type_counts[p["job_type"] or "Unspecified"] += 1

            if p["experience_raw"]:
                exp_counts[p["experience_raw"]] += 1
            if p["min_exp"] is not None:
                min_exps.append(p["min_exp"])
            if p["max_exp"] is not None:
                max_exps.append(p["max_exp"])

            raw_row = self._df.iloc[p["index"]]
            raw_sal = str(raw_row.get("salary", "")).strip()
            if raw_sal and raw_sal.lower() not in ("nan", "none", ""):
                sal_counts[raw_sal] += 1
                if raw_sal in salary_midpoints:
                    sal_values.append(salary_midpoints[raw_sal])

        top_skills: List[SkillProfileItem] = []
        for sid, cnt in skill_counts.most_common(20):
            meta = skill_meta[sid]
            sprev = round(cnt / count, 4) if count > 0 else 0.0
            top_skills.append(
                SkillProfileItem(
                    skill_id=sid,
                    canonical_name=meta["canonical_name"],
                    display_name=meta["display_name"],
                    posting_count=cnt,
                    prevalence=sprev,
                    prevalence_pct=round(sprev * 100.0, 2),
                    rank=len(top_skills) + 1,
                )
            )

        # 2. Designations
        job_desigs = [
            DistributionItem(
                category=desig,
                count=c,
                percentage=round((c / count) * 100.0, 1),
            )
            for desig, c in desig_counts.most_common(10)
        ]

        # 3. Job types
        job_types = [
            DistributionItem(
                category=jt,
                count=c,
                percentage=round((c / count) * 100.0, 1),
            )
            for jt, c in type_counts.most_common(5)
        ]

        # 4. Salary Summary
        avg_sal = round(sum(sal_values) / len(sal_values), 2) if sal_values else None
        med_sal = round(float(pd.Series(sal_values).median()), 2) if sal_values else None
        dom_bracket = sal_counts.most_common(1)[0][0] if sal_counts else None

        brackets = [
            SalaryBracketItem(
                bracket=salary_labels.get(raw_b, f"{raw_b} Lakhs"),
                raw_bracket=raw_b,
                count=c,
                percentage=round((c / count) * 100.0, 1),
            )
            for raw_b, c in sal_counts.most_common()
        ]

        sal_summary = SalarySummary(
            dominant_bracket=salary_labels.get(dom_bracket, dom_bracket) if dom_bracket else None,
            brackets=brackets,
            caveat=f"Average: {avg_sal}L INR, Median: {med_sal}L INR derived from bracket midpoints.",
        )

        # 5. Experience Summary
        dom_exp = exp_counts.most_common(1)[0][0] if exp_counts else None
        avg_min = round(sum(min_exps) / len(min_exps), 1) if min_exps else None
        avg_max = round(sum(max_exps) / len(max_exps), 1) if max_exps else None

        exp_breakdown = [
            ExperienceDistributionItem(
                experience=e,
                count=c,
                percentage=round((c / count) * 100.0, 1),
            )
            for e, c in exp_counts.most_common(10)
        ]

        exp_summary = ExperienceSummary(
            dominant_range=dom_exp,
            min_experience_avg=avg_min,
            max_experience_avg=avg_max,
            breakdown=exp_breakdown,
        )

        data_caveats = [
            "Analytics Jobs.csv does not contain an official industry column; geographical location is used instead.",
            "Salaries reflect broad categorical brackets in Lakhs INR per annum as stated in original job listings.",
            "Cross-sectional observational dataset without longitudinal timestamps.",
        ]

        metadata = DatasetMetadata(
            dataset_name=DATASET_NAME,
            sample_size=total_sample,
            methodology="Empirical location-filtered frequency aggregation from Analytics Jobs.csv",
            limitations=(
                "Analytics Jobs.csv does not contain an official industry column; geographical location is "
                "used instead as the primary spatial segmentation dimension."
            ),
        )

        return GeographicMarketDetailResponse(
            dimension="LOCATION",
            location=loc_clean.title(),
            posting_count=count,
            percentage_of_postings=pct,
            sample_size=total_sample,
            top_skills=top_skills,
            job_designations=job_desigs,
            job_types=job_types,
            salary_summary=sal_summary,
            experience_summary=exp_summary,
            data_caveats=data_caveats,
            metadata=metadata,
        )
