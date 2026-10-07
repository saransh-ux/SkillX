"""
Evaluation metrics, feature importance extraction, and model selection.
Strictly reports factual empirical results on validation/test sets.
"""
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

from app.ml.preprocessing import FEATURE_DISPLAY_NAMES


def evaluate_classifier(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: Optional[np.ndarray] = None,
) -> Dict[str, Any]:
    """
    Calculate comprehensive evaluation metrics for binary classification.
    Reports:
    - accuracy
    - balanced accuracy
    - precision
    - recall
    - F1
    - ROC-AUC (when probabilities are provided)
    - confusion matrix and breakdown
    """
    acc = float(accuracy_score(y_true, y_pred))
    balanced_acc = float(balanced_accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    roc_auc: Optional[float] = None
    if y_prob is not None:
        try:
            roc_auc = float(roc_auc_score(y_true, y_prob))
        except Exception:
            roc_auc = None

    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    return {
        "accuracy": round(acc, 4),
        "balanced_accuracy": round(balanced_acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "confusion_matrix": cm.tolist(),
        "confusion_matrix_breakdown": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "sample_count": int(len(y_true)),
        "class_distribution": {
            "class_0": int((np.array(y_true) == 0).sum()),
            "class_1": int((np.array(y_true) == 1).sum()),
        },
    }


def extract_feature_importance(
    model_pipeline: Any,
    feature_names: List[str],
) -> List[Dict[str, Any]]:
    """
    Extract feature importance or coefficients depending on model architecture.
    For LogisticRegression: extracts signed standardized coefficients and odds ratios.
    For RandomForestClassifier: extracts Gini / Mean Decrease in Impurity.
    """
    clf = model_pipeline.named_steps.get("clf", model_pipeline)
    items: List[Dict[str, Any]] = []

    if hasattr(clf, "coef_"):
        # Linear model (Logistic Regression)
        coefs = clf.coef_[0]
        # Sort by absolute coefficient magnitude descending
        indices = np.argsort(np.abs(coefs))[::-1]
        for rank, idx in enumerate(indices, start=1):
            fname = feature_names[idx]
            coef_val = float(coefs[idx])
            items.append({
                "feature": fname,
                "display_name": FEATURE_DISPLAY_NAMES.get(fname, fname),
                "coefficient": round(coef_val, 4),
                "odds_ratio": round(float(np.exp(coef_val)), 4),
                "importance": round(abs(coef_val), 4),
                "rank": rank,
                "type": "standardized_coefficient",
            })

    elif hasattr(clf, "feature_importances_"):
        # Tree-based model (Random Forest)
        importances = clf.feature_importances_
        indices = np.argsort(importances)[::-1]
        for rank, idx in enumerate(indices, start=1):
            fname = feature_names[idx]
            imp_val = float(importances[idx])
            items.append({
                "feature": fname,
                "display_name": FEATURE_DISPLAY_NAMES.get(fname, fname),
                "coefficient": None,
                "odds_ratio": None,
                "importance": round(imp_val, 4),
                "rank": rank,
                "type": "gini_importance",
            })
    else:
        for rank, fname in enumerate(feature_names, start=1):
            items.append({
                "feature": fname,
                "display_name": FEATURE_DISPLAY_NAMES.get(fname, fname),
                "coefficient": None,
                "odds_ratio": None,
                "importance": 0.0,
                "rank": rank,
                "type": "unknown",
            })

    return items


def select_best_model(
    metrics_by_model: Dict[str, Dict[str, Any]],
    primary_metric: str = "balanced_accuracy",
) -> Tuple[str, str]:
    """
    Select best model based on validation/test performance using a defensible metric.
    Returns (selected_model_name, rationale).
    """
    best_name = ""
    best_score = -1.0
    rationale_points: List[str] = []

    for name, m in metrics_by_model.items():
        score = m.get(primary_metric, 0.0) or 0.0
        rationale_points.append(
            f"{name} achieved {primary_metric}={score:.4f} (ROC-AUC={m.get('roc_auc')}, Precision={m.get('precision')}, Recall={m.get('recall')})"
        )
        if score > best_score:
            best_score = score
            best_name = name

    # In case of tie, check ROC-AUC
    if len(metrics_by_model) > 1:
        models = list(metrics_by_model.keys())
        s1 = metrics_by_model[models[0]].get(primary_metric, 0.0)
        s2 = metrics_by_model[models[1]].get(primary_metric, 0.0)
        if abs(s1 - s2) < 1e-4:
            auc1 = metrics_by_model[models[0]].get("roc_auc", 0.0) or 0.0
            auc2 = metrics_by_model[models[1]].get("roc_auc", 0.0) or 0.0
            if auc1 >= auc2:
                best_name = models[0]
            else:
                best_name = models[1]

    rationale = (
        f"Selected {best_name} using defensible primary evaluation criterion '{primary_metric}'. "
        + " | ".join(rationale_points)
    )
    return best_name, rationale
