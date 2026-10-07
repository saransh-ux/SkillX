"""
Official SAS Hackathon Data Ingestion Script.

Executes end-to-end data ingestion, validation, and quality assessment:
1. Analytics Jobs (~15,800 records)
2. Data Science Jobs (~1,600 records)
3. JDS Skill Traits (~140 records)
4. SDS Personality Traits (~160 records)

Produces a unified data-quality report and saves cleaned parquet/csv datasets.
Can be executed directly from backend root or workspace root.
"""
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any

# Ensure backend directory is in sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.data_loader import DataLoader
from app.services.data_cleaning import DataCleaner

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("skillx.ingest")


def run_ingestion() -> Dict[str, Any]:
    """Runs data loading, cleaning, validation, and produces unified quality report."""
    loader = DataLoader()
    cleaner = DataCleaner()

    # Step 1: Check availability of raw files
    file_status = loader.check_files_availability()
    missing_files = [k for k, v in file_status.items() if not v["available"]]

    if missing_files:
        print("\n" + "=" * 60)
        print("ERROR: MISSING OFFICIAL DATASET FILES")
        print("=" * 60)
        print("Please place the official SAS hackathon datasets in:")
        print(f"  {loader.data_dir}\n")
        print("Missing files for keys:")
        for mf in missing_files:
            print(f"  - {mf} (expected names: {file_status[mf]['expected_names']})")
        print("=" * 60 + "\n")
        sys.exit(1)

    print("\n" + "=" * 80)
    print("STARTING SKILL//X OFFICIAL HACKATHON DATA INGESTION & QUALITY PIPELINE")
    print("=" * 80)

    quality_reports = []
    processed_dir = BACKEND_DIR / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)

    # 1. Analytics Jobs
    print("\n[1/4] Loading & Cleaning Analytics Jobs...")
    raw_analytics = loader.load_analytics_jobs_raw()
    clean_analytics, rep_analytics = cleaner.clean_analytics_jobs(raw_analytics)
    quality_reports.append(rep_analytics)
    # Save cleaned version as CSV
    clean_analytics.to_csv(processed_dir / "analytics_jobs_cleaned.csv", index=False)
    print(f"      Raw rows: {rep_analytics['raw_rows']} | Cleaned rows: {rep_analytics['cleaned_rows']} | Usable: {rep_analytics['usable_percentage']}%")

    # 2. Data Science Jobs
    print("\n[2/4] Loading & Cleaning Data Science Jobs...")
    raw_ds = loader.load_datascience_jobs_raw()
    clean_ds, rep_ds = cleaner.clean_datascience_jobs(raw_ds)
    quality_reports.append(rep_ds)
    clean_ds.to_csv(processed_dir / "datascience_jobs_cleaned.csv", index=False)
    print(f"      Raw rows: {rep_ds['raw_rows']} | Cleaned rows: {rep_ds['cleaned_rows']} | Usable: {rep_ds['usable_percentage']}%")

    # 3. JDS Skill Traits
    print("\n[3/4] Loading & Cleaning JDS Skill Traits...")
    raw_jds = loader.load_jds_traits_raw()
    clean_jds, rep_jds = cleaner.clean_jds_traits(raw_jds)
    quality_reports.append(rep_jds)
    clean_jds.to_csv(processed_dir / "jds_traits_cleaned.csv", index=False)
    print(f"      Raw rows: {rep_jds['raw_rows']} | Cleaned rows: {rep_jds['cleaned_rows']} | Usable: {rep_jds['usable_percentage']}%")

    # 4. SDS Personality Traits
    print("\n[4/4] Loading & Cleaning SDS Personality Traits...")
    raw_sds = loader.load_sds_traits_raw()
    clean_sds, rep_sds = cleaner.clean_sds_traits(raw_sds)
    quality_reports.append(rep_sds)
    clean_sds.to_csv(processed_dir / "sds_traits_cleaned.csv", index=False)
    print(f"      Raw rows: {rep_sds['raw_rows']} | Cleaned rows: {rep_sds['cleaned_rows']} | Usable: {rep_sds['usable_percentage']}%")

    # Unified Quality Report Table
    print("\n" + "=" * 80)
    print("UNIFIED DATA QUALITY AUDIT REPORT")
    print("=" * 80)
    header = f"{'DATASET':<25} | {'RAW':<7} | {'CLEAN':<7} | {'DUPES':<6} | {'INVALID':<7} | {'USABLE %':<8}"
    print(header)
    print("-" * len(header))

    for rep in quality_reports:
        print(
            f"{rep['dataset']:<25} | "
            f"{rep['raw_rows']:<7} | "
            f"{rep['cleaned_rows']:<7} | "
            f"{rep['duplicates_removed']:<6} | "
            f"{rep['invalid_rows']:<7} | "
            f"{rep['usable_percentage']:>7.2f}%"
        )
    print("=" * 80)

    # Save quality summary json
    summary_path = processed_dir / "data_quality_report.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(quality_reports, f, indent=2)
    print(f"\nData quality report saved to: {summary_path}")

    return {
        "status": "SUCCESS",
        "reports": quality_reports,
        "processed_dir": str(processed_dir),
    }


if __name__ == "__main__":
    run_ingestion()
