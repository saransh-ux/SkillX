"""
CLI script to train, evaluate, compare, and persist SKILL//X ML models:
1. Career Success Model (JDS Skill Traits.xlsx -> salary_hike_high_or_low)
2. Senior Success Model (SDS Personality Traits.xlsx -> success_classification_high_low)
"""
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
import sys
import numpy as np

# Ensure backend root is in sys.path
backend_root = Path(__file__).parent.parent.resolve()
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.ml.preprocessing import (
    RAW_FEATURE_COLS,
    TARGET_COL,
    load_and_validate_dataset,
    prepare_features_and_target,
    get_train_test_split,
)
from app.ml.career_model import (
    DEFAULT_ARTIFACTS_DIR,
    train_and_compare_models,
    save_artifacts,
)
from app.ml.senior_model import (
    SDS_FEATURE_COLS,
    SDS_TARGET_COL,
    SDS_FEATURE_DISPLAY_NAMES,
    load_and_validate_sds_dataset,
    prepare_sds_features_and_target,
    get_sds_train_test_split,
    train_and_compare_senior_models,
    save_senior_artifacts,
)
from app.ml.evaluation import extract_feature_importance

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("train_models")


def train_career_model():
    print("=" * 75)
    print(" [MODEL 1] CAREER SUCCESS (JDS Skill Traits.xlsx)")
    print(" Target: salary_hike_high_or_low")
    print("=" * 75)

    df = load_and_validate_dataset()
    total_samples = len(df)
    class_counts = df[TARGET_COL].value_counts().to_dict()

    print(f"\n1. Class Balance (Total Rows: {total_samples}):")
    print(f"   • Class 0 (Low Hike):  {class_counts.get(0, 0)} ({class_counts.get(0, 0)/total_samples*100:.1f}%)")
    print(f"   • Class 1 (High Hike): {class_counts.get(1, 0)} ({class_counts.get(1, 0)/total_samples*100:.1f}%)")

    X, y = prepare_features_and_target(df)
    X_train, X_test, y_train, y_test = get_train_test_split(
        X, y, test_size=0.25, random_state=42
    )

    selected_name, winning_pipeline, comparison_summary, models_dict = (
        train_and_compare_models(X_train, y_train, X_test, y_test, random_state=42)
    )

    models_metrics = comparison_summary["models"]
    metrics_keys = ["accuracy", "balanced_accuracy", "precision", "recall", "f1", "roc_auc"]
    header = f"{'Metric':<20} | {'Logistic Regression':<22} | {'Random Forest':<22}"
    print("\n2. Holdout Test Metrics (n=35):")
    print("-" * len(header))
    print(header)
    print("-" * len(header))
    for m in metrics_keys:
        lr_val = models_metrics["LogisticRegression"].get(m)
        rf_val = models_metrics["RandomForestClassifier"].get(m)
        lr_str = f"{lr_val:.4f}" if lr_val is not None else "N/A"
        rf_str = f"{rf_val:.4f}" if rf_val is not None else "N/A"
        print(f"{m:<20} | {lr_str:<22} | {rf_str:<22}")
    print("-" * len(header))

    print("\n3. Feature Importance & Coefficients:")
    lr_importance = extract_feature_importance(models_dict["LogisticRegression"], RAW_FEATURE_COLS)
    for item in lr_importance:
        sign = "+" if item["coefficient"] >= 0 else ""
        print(
            f"   • {item['display_name']:<25} : coef={sign}{item['coefficient']:.4f}, odds_ratio={item['odds_ratio']:.4f}"
        )

    print(f"\n4. Selection Decision: {selected_name}")
    print(f"   Rationale: {comparison_summary['selection_rationale']}")

    # Save
    artifacts_dir = DEFAULT_ARTIFACTS_DIR
    feat_importance = extract_feature_importance(winning_pipeline, RAW_FEATURE_COLS)
    metadata = {
        "model_type": (
            "StandardScaler + LogisticRegression (balanced)"
            if selected_name == "LogisticRegression"
            else "RandomForestClassifier (balanced)"
        ),
        "selected_model_name": selected_name,
        "selection_rationale": comparison_summary["selection_rationale"],
        "training_dataset_name": "JDS Skill Traits.xlsx",
        "target": TARGET_COL,
        "dataset_size": total_samples,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "class_distribution": {
            "class_0_low": class_counts.get(0, 0),
            "class_1_high": class_counts.get(1, 0),
        },
        "metrics": models_metrics[selected_name],
        "comparison_metrics": models_metrics,
        "feature_importance": feat_importance,
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "limitations": [
            "Observational data only from JDS Skill Traits dataset (sample size: 139 roles).",
            "Does not establish causality: high skill ratings correlate with higher salary-hike classes but do not guarantee salary growth.",
            "Binary target (salary_hike_high_or_low) simplifies continuous career compensation dynamics.",
            "Model should not be used as an automated determinant in personnel or hiring decisions.",
        ],
    }
    save_artifacts(winning_pipeline, metadata, artifacts_dir)
    print(f"   Saved to: {artifacts_dir / 'model.joblib'}")


def train_senior_model():
    print("\n" + "=" * 75)
    print(" [MODEL 2] SENIOR SUCCESS (SDS Personality Traits.xlsx)")
    print(" Target: success_classification_high_low")
    print("=" * 75)

    df = load_and_validate_sds_dataset()
    total_samples = len(df)
    class_counts = df[SDS_TARGET_COL].value_counts().to_dict()

    print(f"\n1. Class Balance (Total Rows: {total_samples}):")
    print(f"   • Class 0 (Low Success):  {class_counts.get(0, 0)} ({class_counts.get(0, 0)/total_samples*100:.1f}%)")
    print(f"   • Class 1 (High Success): {class_counts.get(1, 0)} ({class_counts.get(1, 0)/total_samples*100:.1f}%)")

    X, y = prepare_sds_features_and_target(df)
    X_train, X_test, y_train, y_test = get_sds_train_test_split(
        X, y, test_size=0.25, random_state=42
    )

    selected_name, winning_pipeline, comparison_summary, models_dict = (
        train_and_compare_senior_models(X_train, y_train, X_test, y_test, random_state=42)
    )

    models_metrics = comparison_summary["models"]
    metrics_keys = ["accuracy", "balanced_accuracy", "precision", "recall", "f1", "roc_auc"]
    header = f"{'Metric':<20} | {'Logistic Regression':<22} | {'Random Forest':<22}"
    print("\n2. Holdout Test Metrics (n=41):")
    print("-" * len(header))
    print(header)
    print("-" * len(header))
    for m in metrics_keys:
        lr_val = models_metrics["LogisticRegression"].get(m)
        rf_val = models_metrics["RandomForestClassifier"].get(m)
        lr_str = f"{lr_val:.4f}" if lr_val is not None else "N/A"
        rf_str = f"{rf_val:.4f}" if rf_val is not None else "N/A"
        print(f"{m:<20} | {lr_str:<22} | {rf_str:<22}")
    print("-" * len(header))

    print("\nConfusion Matrices (Test Set, n=41):")
    for mname, mdata in models_metrics.items():
        breakdown = mdata["confusion_matrix_breakdown"]
        print(f"  • {mname}: [[TN={breakdown['true_negatives']}, FP={breakdown['false_positives']}], [FN={breakdown['false_negatives']}, TP={breakdown['true_positives']}]]")

    print("\n3. Feature Importance & Tree Importance:")
    clf = winning_pipeline.named_steps.get("clf", winning_pipeline)
    importances = getattr(clf, "feature_importances_", [0.2] * len(SDS_FEATURE_COLS))
    indices = np.argsort(importances)[::-1]
    feature_importance_list = []
    for rank, idx in enumerate(indices, start=1):
        fname = SDS_FEATURE_COLS[idx]
        disp = SDS_FEATURE_DISPLAY_NAMES.get(fname, fname)
        imp = float(importances[idx])
        print(f"   {rank}. {disp:<25} : importance={imp:.4f} ({imp*100:.1f}%)")
        feature_importance_list.append({
            "feature": fname,
            "display_name": disp,
            "importance": round(imp, 4),
            "coefficient": None,
            "rank": rank,
            "type": "gini_importance",
        })

    print(f"\n4. Selection Decision: {selected_name}")
    print(f"   Rationale: {comparison_summary['selection_rationale']}")

    # Save
    artifacts_dir = DEFAULT_ARTIFACTS_DIR
    metadata = {
        "model_type": (
            "RandomForestClassifier (n_estimators=100, max_depth=4, balanced)"
            if selected_name == "RandomForestClassifier"
            else "StandardScaler + LogisticRegression (balanced)"
        ),
        "selected_model_name": selected_name,
        "selection_rationale": comparison_summary["selection_rationale"],
        "training_dataset_name": "SDS Personality Traits.xlsx",
        "target": SDS_TARGET_COL,
        "dataset_size": total_samples,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "class_distribution": {
            "class_0_low": class_counts.get(0, 0),
            "class_1_high": class_counts.get(1, 0),
        },
        "metrics": models_metrics[selected_name],
        "comparison_metrics": models_metrics,
        "feature_importance": feature_importance_list,
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "limitations": [
            "Observational study on a specific cohort of data scientists (n=161).",
            "Does NOT establish that personality traits cause professional success.",
            "Personality inventories vary across instruments and cultural contexts.",
            "This model must not be interpreted as a universal rule about data scientists or used for hiring/promotions.",
        ],
        "dataset_information": {
            "source": "SDS Personality Traits.xlsx",
            "features": SDS_FEATURE_COLS,
            "target": SDS_TARGET_COL,
            "positive_label": "High success classification (1)",
            "negative_label": "Low success classification (0)",
        },
    }
    save_senior_artifacts(winning_pipeline, metadata, artifacts_dir)
    print(f"   Saved to: {artifacts_dir / 'senior_model.joblib'}")
    print(f"   Saved to: {artifacts_dir / 'senior_metadata.json'}")
    print("=" * 75)


def main():
    train_career_model()
    train_senior_model()


if __name__ == "__main__":
    main()
