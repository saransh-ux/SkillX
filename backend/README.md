# SKILL//X Backend — Workforce Skill Intelligence Engine

This backend serves the SKILL//X intelligence platform with FastAPI, SQLAlchemy, PostgreSQL, and time-aware ML demand forecasting pipelines.

---

## 1. Architecture Overview

```
backend/
├── app/
│   ├── main.py              # FastAPI application entrypoint & CORS
│   ├── core/
│   │   ├── config.py        # Settings (Pydantic BaseSettings & env vars)
│   │   └── database.py      # SQLAlchemy session factory & connection pool
│   ├── models/              # SQLAlchemy DB models (Job, Skill, Role, Industry, JobSkill, SkillTrend)
│   ├── schemas/             # Type-safe Pydantic request/response schemas
│   ├── api/                 # API routers (/health, /skills, /roles, /industries, /future-scan)
│   └── services/            # Business logic, Emergence Index, and Temporal analytics
├── requirements.txt
├── .env.example
└── README.md

ml/
├── preprocessing/           # Clean jobs, Schema adapter, Canonical skill normalization
├── features/                # Temporal feature extraction (lag demand, growth, acceleration)
├── training/                # Time-aware chronological model training
├── evaluation/              # Time-series metrics (MAE, RMSE, R²)
└── models/                  # Serialized ML model artifacts (.json / .bin)

data/
├── raw/                     # Raw job postings from various sources
├── processed/               # Cleaned job records
└── unified/                 # Normalized unified datasets
```

---

## 2. Environment Setup

### Prerequisites
- Python 3.12+ (or 3.14+)
- PostgreSQL (or local SQLite connection for dev mode)

### Create Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 3. Environment Variables Configuration

Copy the example configuration:
```bash
cp .env.example .env
```

Key environment options in `.env`:
- `DATABASE_URL`: Connection string for PostgreSQL (e.g. `postgresql://postgres:postgres@localhost:5432/skillx_db`)
- `BACKEND_CORS_ORIGINS`: Allowed origins (e.g. `http://localhost:5173`)
- `WEIGHT_GROWTH`, `WEIGHT_ACCELERATION`, `WEIGHT_CROSS_INDUSTRY`, etc.: Configurable weights for the SKILL//X Emergence Index.

---

## 4. Running the FastAPI Server

From the `backend/` directory:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API Base: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status confirmation |
| `GET` | `/api/skills` | List registered skills taxonomy |
| `GET` | `/api/skills/emerging` | Skills ranked by SKILL//X Emergence Index |
| `GET` | `/api/skills/{skill}/trend` | Historical demand, growth, and acceleration timeline |
| `GET` | `/api/roles` | Active workforce roles |
| `GET` | `/api/roles/{role}/evolution` | Role skill evolution and shift analysis |
| `GET` | `/api/industries` | Tracked industry sectors |
| `GET` | `/api/industries/{industry}/skills` | Skill concentration in an industry sector |
| `POST` | `/api/future-scan` | Forward-looking workforce evolution forecast |

---

## 6. Data Pipeline & Machine Learning

### Pipeline Steps:
1. **Raw Ingestion**: Place raw datasets under `data/raw/`.
2. **Schema Adaptation & Cleaning**: Run `ml/preprocessing/clean_jobs.py` to harmonize diverse schemas into standardized fields.
3. **Skill Normalization**: `ml/preprocessing/normalize_skills.py` applies canonical entity mapping (e.g., K8s -> Kubernetes, LLM -> Large Language Models).
4. **Unified Dataset**: `ml/preprocessing/build_unified_dataset.py` builds the atomic unified dataset under `data/unified/`.
5. **Feature Engineering**: `ml/features/extract_features.py` computes temporal lag demand, growth rate, acceleration, and co-occurrence.
6. **Chronological ML Training**: `ml/training/train_demand_model.py` splits strictly across chronological boundaries (Train: <=2023, Val: 2024, Test: 2025) and evaluates using MAE/RMSE/R².
