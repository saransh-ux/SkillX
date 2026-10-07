"""
Data loader module for official SAS hackathon datasets.
Safely detects and loads raw files from backend/data/raw/.
Reports clear messages if required files are missing.
"""
import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd

logger = logging.getLogger("skillx.data_loader")

# Base directory for raw datasets
BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DATA_DIR = BASE_DIR / "data" / "raw"

# Expected dataset filenames and alternatives
EXPECTED_FILES = {
    "analytics_jobs": ["Analytics Jobs.csv"],
    "datascience_jobs": ["Data Science Jobs.csv", "DataScience Jobs.csv"],
    "jds_traits": ["JDS Skill Traits.xlsx"],
    "sds_traits": ["SDS Personality Traits.xlsx"],
}


class DataLoader:
    """Safely loads official hackathon raw data files."""

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or RAW_DATA_DIR
        self._ensure_data_dir()

    def _ensure_data_dir(self) -> None:
        """Creates the data/raw directory if not present."""
        if not self.data_dir.exists():
            self.data_dir.mkdir(parents=True, exist_ok=True)
            logger.warning(
                f"Created raw data directory at {self.data_dir}. "
                "Please place the official hackathon datasets inside this directory."
            )

    def find_file(self, file_key: str) -> Optional[Path]:
        """Finds the absolute path for an expected dataset key."""
        candidates = EXPECTED_FILES.get(file_key, [])
        for candidate in candidates:
            target = self.data_dir / candidate
            if target.is_file():
                return target
        return None

    def check_files_availability(self) -> Dict[str, Dict[str, Any]]:
        """Verifies presence of all required hackathon files."""
        status = {}
        for key, candidates in EXPECTED_FILES.items():
            path = self.find_file(key)
            status[key] = {
                "available": path is not None,
                "path": str(path) if path else None,
                "expected_names": candidates,
            }
        return status

    def load_analytics_jobs_raw(self) -> pd.DataFrame:
        """Loads Analytics Jobs.csv with safe encoding and types."""
        path = self.find_file("analytics_jobs")
        if not path:
            raise FileNotFoundError(
                f"Missing 'Analytics Jobs.csv' in {self.data_dir}. "
                "Please place the official dataset in backend/data/raw/."
            )
        df = pd.read_csv(
            path,
            encoding="utf-8",
            dtype=str,
            on_bad_lines="skip",
        )
        return df

    def load_datascience_jobs_raw(self) -> pd.DataFrame:
        """Loads Data Science Jobs.csv with safe encoding."""
        path = self.find_file("datascience_jobs")
        if not path:
            raise FileNotFoundError(
                f"Missing 'Data Science Jobs.csv' in {self.data_dir}. "
                "Please place the official dataset in backend/data/raw/."
            )
        df = pd.read_csv(
            path,
            encoding="utf-8",
            dtype=str,
            on_bad_lines="skip",
        )
        return df

    def load_jds_traits_raw(self) -> pd.DataFrame:
        """Loads JDS Skill Traits.xlsx sheet."""
        path = self.find_file("jds_traits")
        if not path:
            raise FileNotFoundError(
                f"Missing 'JDS Skill Traits.xlsx' in {self.data_dir}. "
                "Please place the official dataset in backend/data/raw/."
            )
        df = pd.read_excel(path, sheet_name=0)
        return df

    def load_sds_traits_raw(self) -> pd.DataFrame:
        """Loads SDS Personality Traits.xlsx sheet."""
        path = self.find_file("sds_traits")
        if not path:
            raise FileNotFoundError(
                f"Missing 'SDS Personality Traits.xlsx' in {self.data_dir}. "
                "Please place the official dataset in backend/data/raw/."
            )
        df = pd.read_excel(path, sheet_name=0)
        return df
