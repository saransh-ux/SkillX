"""
Data preprocessing, schema validation, and feature preparation for Career Success ML models.
Trained strictly on official JDS Skill Traits dataset.
"""
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import logging
import pandas as pd
from sklearn.model_selection import train_test_split

logger = logging.getLogger("skillx.ml.preprocessing")

# Dataset canonical feature names
RAW_FEATURE_COLS = [
    "big_data_skills",
    "maths-stats_skills",
    "coding_skills",
    "ai_and_ml_skills",
    "dashboard_and_storytelling_skills",
]

TARGET_COL = "salary_hike_high_or_low"

FEATURE_DISPLAY_NAMES = {
    "big_data_skills": "Big Data Skills",
    "maths-stats_skills": "Mathematics & Statistics",
    "maths_stats_skills": "Mathematics & Statistics",
    "coding_skills": "Coding Skills",
    "ai_and_ml_skills": "AI & Machine Learning",
    "dashboard_and_storytelling_skills": "Dashboard & Storytelling",
}

# Mapping between code-friendly identifier and raw column name
FEATURE_NAME_MAP = {
    "maths_stats_skills": "maths-stats_skills",
    "maths-stats_skills": "maths-stats_skills",
    "big_data_skills": "big_data_skills",
    "coding_skills": "coding_skills",
    "ai_and_ml_skills": "ai_and_ml_skills",
    "dashboard_and_storytelling_skills": "dashboard_and_storytelling_skills",
}


def find_jds_dataset_path(custom_path: Optional[Union[str, Path]] = None) -> Path:
    """Resolve the path to the JDS Skill Traits Excel file."""
    if custom_path:
        p = Path(custom_path)
        if p.exists():
            return p

    candidates = [
        Path("data/raw/JDS Skill Traits.xlsx"),
        Path("backend/data/raw/JDS Skill Traits.xlsx"),
        Path(__file__).parent.parent.parent / "data" / "raw" / "JDS Skill Traits.xlsx",
        Path("C:/Users/aadit/Desktop/SkillX/SkillX-main/backend/data/raw/JDS Skill Traits.xlsx"),
    ]
    for c in candidates:
        if c.exists():
            return c.resolve()

    raise FileNotFoundError(
        "Could not locate 'JDS Skill Traits.xlsx'. Checked candidates: "
        + ", ".join(str(c) for c in candidates)
    )


def load_and_validate_dataset(
    filepath: Optional[Union[str, Path]] = None,
) -> pd.DataFrame:
    """
    Load JDS Skill Traits dataset, validate types, ranges (1.0 to 5.0), and target distribution.
    """
    path = find_jds_dataset_path(filepath)
    logger.info("Loading JDS dataset from %s", path)
    df = pd.read_excel(path)

    # Validate required columns
    required_cols = RAW_FEATURE_COLS + [TARGET_COL]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"JDS dataset missing required columns: {missing}")

    # Check for missing values
    null_counts = df[required_cols].isnull().sum()
    if null_counts.any():
        logger.warning("Found nulls in JDS dataset: %s", null_counts.to_dict())
        df = df.dropna(subset=required_cols)

    # Validate target values are strictly binary 0 or 1
    unique_targets = set(df[TARGET_COL].unique())
    if not unique_targets.issubset({0, 1}):
        raise ValueError(f"Unexpected target values in {TARGET_COL}: {unique_targets}")

    # Validate feature ranges (1.0 to 5.0)
    for col in RAW_FEATURE_COLS:
        col_min = df[col].min()
        col_max = df[col].max()
        if col_min < 1.0 or col_max > 5.0:
            raise ValueError(
                f"Feature '{col}' values outside valid range [1.0, 5.0]: min={col_min}, max={col_max}"
            )

    logger.info(
        "Successfully validated JDS dataset: %d rows, target distribution=%s",
        len(df),
        df[TARGET_COL].value_counts().to_dict(),
    )
    return df


def prepare_features_and_target(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.Series]:
    """Extract feature matrix X and target vector y."""
    X = df[RAW_FEATURE_COLS].copy()
    y = df[TARGET_COL].astype(int).copy()
    return X, y


def get_train_test_split(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.25,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Perform stratified, reproducible train/test split.
    Guarantees consistent class balance across splits.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )
    logger.info(
        "Split dataset: Train=%d (class 1: %d, class 0: %d), Test=%d (class 1: %d, class 0: %d)",
        len(X_train),
        (y_train == 1).sum(),
        (y_train == 0).sum(),
        len(X_test),
        (y_test == 1).sum(),
        (y_test == 0).sum(),
    )
    return X_train, X_test, y_train, y_test


def normalize_input_features(raw_input: Dict[str, float]) -> pd.DataFrame:
    """
    Convert a dictionary of skill inputs (allowing either underscores or hyphens)
    into a single-row DataFrame aligned with RAW_FEATURE_COLS.
    """
    row: Dict[str, float] = {}
    for canonical_name in RAW_FEATURE_COLS:
        # Check canonical or underscore variant
        alt_name = canonical_name.replace("-", "_")
        if canonical_name in raw_input:
            val = float(raw_input[canonical_name])
        elif alt_name in raw_input:
            val = float(raw_input[alt_name])
        else:
            raise KeyError(
                f"Missing required skill trait feature: '{canonical_name}' (or '{alt_name}')"
            )

        if not (1.0 <= val <= 5.0):
            raise ValueError(
                f"Skill rating for '{canonical_name}' must be between 1.0 and 5.0 (got {val})"
            )
        row[canonical_name] = val

    return pd.DataFrame([row], columns=RAW_FEATURE_COLS)
