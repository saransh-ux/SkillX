"""
Data cleaning and normalization service for official SAS hackathon datasets.
Normalizes data according to official objectives:
- Analytics Jobs: columns, experience, designation, location, key_skills parsing
- Data Science Jobs: salary parsing, min_experience, company/title, num_of_jobs
- JDS Skill Traits: numeric range validation (1.0 to 5.0), binary target verification
- SDS Personality Traits: numeric validation, binary target verification
Generates comprehensive data quality metrics without fabricating missing information.
"""
import re
import logging
from typing import Dict, Any, List, Tuple, Optional
import pandas as pd
import numpy as np

logger = logging.getLogger("skillx.data_cleaning")


def normalize_string(val: Any) -> Optional[str]:
    """Trims whitespace and standardizes null representations."""
    if val is None or pd.isna(val):
        return None
    s = str(val).strip()
    if not s or s.lower() in ("nan", "null", "none", "na", "-"):
        return None
    # Collapse multiple whitespaces
    return re.sub(r"\s+", " ", s)


def parse_key_skills(val: Any) -> List[str]:
    """
    Parses comma/pipe/slash separated skill strings into clean,
    normalized, deduplicated skill tokens.
    Excludes pure noise tokens (e.g. '...', empty items).
    """
    if val is None or pd.isna(val):
        return []
    text = str(val)
    parts = re.split(r"[,|;/]+", text)
    cleaned = []
    for p in parts:
        token = p.strip()
        # Remove ellipsis or noise punctuation
        token = re.sub(r"^\.+|\.+$", "", token).strip()
        # Filter out empty or pure whitespace or single punctuation tokens
        if token and len(token) > 1 and not re.match(r"^[\W_]+$", token):
            cleaned.append(token)
    # Deduplicate while preserving order (case-insensitive deduplication)
    seen = set()
    result = []
    for item in cleaned:
        key = item.lower()
        if key not in seen:
            seen.add(key)
            result.append(item)
    return result


def parse_inr_salary_lakhs(val: Any) -> Optional[float]:
    """
    Parses salary strings formatted as '7.8L' or numeric into float value in Lakhs INR.
    Example: '7.8L' -> 7.8, '16.0L' -> 16.0.
    """
    if val is None or pd.isna(val):
        return None
    s = str(val).strip().upper()
    if not s or s in ("NAN", "NULL", "NONE"):
        return None
    # If ends with 'L' or 'LAKH'
    s_clean = s.replace("LAKHS", "").replace("LAKH", "").replace("L", "").replace(",", "").strip()
    try:
        return round(float(s_clean), 2)
    except (ValueError, TypeError):
        return None


def parse_experience_range(val: Any) -> Tuple[Optional[int], Optional[int]]:
    """
    Extracts min_exp and max_exp years from strings like '6-10 yrs', '2-5 yrs', '5 yrs', etc.
    """
    if val is None or pd.isna(val):
        return None, None
    s = str(val).strip().lower()
    # Find patterns like X-Y or X to Y
    range_match = re.search(r"(\d+)\s*(?:-|to)\s*(\d+)", s)
    if range_match:
        try:
            return int(range_match.group(1)), int(range_match.group(2))
        except (ValueError, TypeError):
            pass
    single_match = re.search(r"(\d+)", s)
    if single_match:
        try:
            exp = int(single_match.group(1))
            return exp, exp
        except (ValueError, TypeError):
            pass
    return None, None


class DataCleaner:
    """Provides validation and normalization routines for each dataset."""

    @staticmethod
    def clean_analytics_jobs(raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans Analytics Jobs dataset:
        - Normalizes column names
        - Preserves original job_description
        - Normalizes job_desig, experience, job_type, location, salary
        - Parses key_skills into list of normalized strings
        - Identifies and removes exact duplicates (ignoring s_no)
        - Computes missing values and quality report
        """
        raw_rows = len(raw_df)
        df = raw_df.copy()

        # Normalize column headers
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        # Calculate raw missing values
        missing_counts_raw = {col: int(df[col].isna().sum()) for col in df.columns}

        # Identify duplicates: checking content columns without 's_no'
        content_cols = [c for c in df.columns if c != "s_no"]
        duplicate_mask = df.duplicated(subset=content_cols, keep="first")
        duplicates_removed = int(duplicate_mask.sum())
        df = df[~duplicate_mask].copy()

        # Clean string fields
        df["job_desig"] = df["job_desig"].apply(normalize_string)
        df["experience_raw"] = df["experience"].copy()
        df["experience"] = df["experience"].apply(normalize_string)
        exp_parsed = df["experience"].apply(parse_experience_range)
        df["min_exp"] = [p[0] for p in exp_parsed]
        df["max_exp"] = [p[1] for p in exp_parsed]

        df["job_type"] = df["job_type"].apply(normalize_string)
        df["location"] = df["location"].apply(normalize_string)
        df["salary"] = df["salary"].apply(normalize_string)

        # Parse key_skills into clean token list and clean string
        df["skills_list"] = df["key_skills"].apply(parse_key_skills)
        df["skill_count"] = df["skills_list"].apply(len)

        # Job description preservation: clean surrounding whitespace only
        df["job_description"] = df["job_description"].apply(
            lambda v: str(v).strip() if pd.notna(v) and str(v).strip() != "" else None
        )

        cleaned_rows = len(df)
        missing_counts_clean = {col: int(df[col].isna().sum()) for col in df.columns if col in raw_df.columns}

        report = {
            "dataset": "Analytics Jobs",
            "raw_rows": raw_rows,
            "cleaned_rows": cleaned_rows,
            "duplicates_removed": duplicates_removed,
            "missing_values_raw": missing_counts_raw,
            "missing_values_clean": missing_counts_clean,
            "invalid_rows": 0,
            "usable_percentage": round((cleaned_rows / raw_rows) * 100, 2) if raw_rows > 0 else 0.0,
            "total_extracted_skills": int(df["skill_count"].sum()),
        }
        return df, report

    @staticmethod
    def clean_datascience_jobs(raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans Data Science Jobs dataset:
        - Normalizes column names
        - Parses salary fields (avg_salary, min_salary, max_salary) into float (Lakhs INR)
        - Parses min_experience into numeric int
        - Validates num_of_jobs
        - Removes duplicates
        - Reports data quality
        """
        raw_rows = len(raw_df)
        df = raw_df.copy()

        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        missing_counts_raw = {col: int(df[col].isna().sum()) for col in df.columns}

        # Check duplicates without reference_no
        content_cols = [c for c in df.columns if c != "reference_no"]
        duplicate_mask = df.duplicated(subset=content_cols, keep="first")
        duplicates_removed = int(duplicate_mask.sum())
        df = df[~duplicate_mask].copy()

        # Normalize company and title
        df["company_name"] = df["company_name"].apply(normalize_string)
        df["job_title"] = df["job_title"].apply(normalize_string)

        # Parse numeric salaries
        df["avg_salary_lakhs"] = df["avg_salary"].apply(parse_inr_salary_lakhs)
        df["min_salary_lakhs"] = df["min_salary"].apply(parse_inr_salary_lakhs)
        df["max_salary_lakhs"] = df["max_salary"].apply(parse_inr_salary_lakhs)

        # Parse min_experience
        df["min_experience"] = pd.to_numeric(df["min_experience"], errors="coerce").astype("Int64")

        # Parse num_of_jobs
        df["num_of_jobs"] = pd.to_numeric(df["num_of_jobs"], errors="coerce").astype("Int64")

        cleaned_rows = len(df)
        missing_counts_clean = {
            "company_name": int(df["company_name"].isna().sum()),
            "job_title": int(df["job_title"].isna().sum()),
            "avg_salary_lakhs": int(df["avg_salary_lakhs"].isna().sum()),
            "min_experience": int(df["min_experience"].isna().sum()),
            "num_of_jobs": int(df["num_of_jobs"].isna().sum()),
        }

        report = {
            "dataset": "Data Science Jobs",
            "raw_rows": raw_rows,
            "cleaned_rows": cleaned_rows,
            "duplicates_removed": duplicates_removed,
            "missing_values_raw": missing_counts_raw,
            "missing_values_clean": missing_counts_clean,
            "invalid_rows": 0,
            "usable_percentage": round((cleaned_rows / raw_rows) * 100, 2) if raw_rows > 0 else 0.0,
        }
        return df, report

    @staticmethod
    def clean_jds_traits(raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans and validates JDS Skill Traits:
        - Validates all 5 skill traits are numeric within 1.0 to 5.0
        - Validates salary_hike_high_or_low is binary (0 or 1)
        - Reports invalid rows without silently altering invalid values
        """
        raw_rows = len(raw_df)
        df = raw_df.copy()

        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        missing_counts_raw = {col: int(df[col].isna().sum()) for col in df.columns}

        skill_cols = [
            "big_data_skills",
            "maths-stats_skills",
            "coding_skills",
            "ai_and_ml_skills",
            "dashboard_and_storytelling_skills",
        ]
        target_col = "salary_hike_high_or_low"

        # Check validity
        invalid_mask = pd.Series(False, index=df.index)

        # 1. Check numeric and range [1.0, 5.0]
        for col in skill_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                out_of_range = (df[col] < 1.0) | (df[col] > 5.0) | df[col].isna()
                invalid_mask = invalid_mask | out_of_range
            else:
                invalid_mask = pd.Series(True, index=df.index)

        # 2. Check binary target {0, 1}
        if target_col in df.columns:
            df[target_col] = pd.to_numeric(df[target_col], errors="coerce")
            invalid_target = ~df[target_col].isin([0, 1]) | df[target_col].isna()
            invalid_mask = invalid_mask | invalid_target
            df[target_col] = df[target_col].astype("Int64")

        invalid_count = int(invalid_mask.sum())
        valid_df = df[~invalid_mask].copy()

        # Check duplicates on valid records
        duplicate_mask = valid_df.duplicated(subset=[c for c in valid_df.columns if c != "id"])
        duplicates_removed = int(duplicate_mask.sum())
        clean_df = valid_df[~duplicate_mask].copy()

        report = {
            "dataset": "JDS Skill Traits",
            "raw_rows": raw_rows,
            "cleaned_rows": len(clean_df),
            "duplicates_removed": duplicates_removed,
            "missing_values_raw": missing_counts_raw,
            "invalid_rows": invalid_count,
            "usable_percentage": round((len(clean_df) / raw_rows) * 100, 2) if raw_rows > 0 else 0.0,
        }
        return clean_df, report

    @staticmethod
    def clean_sds_traits(raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans and validates SDS Personality Traits:
        - Validates all 5 personality trait columns are numeric
        - Validates success_classification is binary (0 or 1)
        - Reports missing/invalid rows
        - Preserves normalized trait values
        """
        raw_rows = len(raw_df)
        df = raw_df.copy()

        # Normalize column names (handles leading whitespace like ' extraversion')
        df.columns = [re.sub(r"\s+", "_", c.strip().lower()) for c in df.columns]
        missing_counts_raw = {col: int(df[col].isna().sum()) for col in df.columns}

        trait_cols = [
            "neuroticism",
            "extraversion",
            "openness_to_experience",
            "agreeableness",
            "conscientiousness",
        ]
        # Match target column regardless of internal spacing
        target_candidates = [c for c in df.columns if "success" in c]
        target_col = target_candidates[0] if target_candidates else "success_classification_high_low"
        if target_col != "success_classification_high_low":
            df = df.rename(columns={target_col: "success_classification_high_low"})
        target_col = "success_classification_high_low"

        invalid_mask = pd.Series(False, index=df.index)

        # Check traits are numeric
        for col in trait_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                invalid_trait = df[col].isna()
                invalid_mask = invalid_mask | invalid_trait
            else:
                invalid_mask = pd.Series(True, index=df.index)

        # Check binary target
        if target_col in df.columns:
            df[target_col] = pd.to_numeric(df[target_col], errors="coerce")
            invalid_target = ~df[target_col].isin([0, 1]) | df[target_col].isna()
            invalid_mask = invalid_mask | invalid_target
            df[target_col] = df[target_col].astype("Int64")

        invalid_count = int(invalid_mask.sum())
        valid_df = df[~invalid_mask].copy()

        duplicate_mask = valid_df.duplicated(subset=[c for c in valid_df.columns if c != "id"])
        duplicates_removed = int(duplicate_mask.sum())
        clean_df = valid_df[~duplicate_mask].copy()

        report = {
            "dataset": "SDS Personality Traits",
            "raw_rows": raw_rows,
            "cleaned_rows": len(clean_df),
            "duplicates_removed": duplicates_removed,
            "missing_values_raw": missing_counts_raw,
            "invalid_rows": invalid_count,
            "usable_percentage": round((len(clean_df) / raw_rows) * 100, 2) if raw_rows > 0 else 0.0,
        }
        return clean_df, report
