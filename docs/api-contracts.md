# PROJECT KRATOS — API Contracts & Integration Specifications

## Overview
Project KRATOS features a high-performance RESTful API layer built with FastAPI (`api/main.py`), wrapping the mathematical and unsupervised analytics modules located in `modules/`.

Base URL: `http://127.0.0.1:8000/api`

---

## 1. System Health & Metadata
- **Endpoint**: `GET /api/health`
- **Description**: Returns operational status of the analytical engine and dataset integrity confirmation.
- **Response**:
```json
{
  "status": "online",
  "system": "PROJECT KRATOS Intelligence Engine",
  "version": "2.0.0",
  "dataset_loaded": true,
  "total_journeys": 20000,
  "total_services": 30,
  "synthetic_notice": "SYNTHETIC DATASET — ILLUSTRATIVE ANALYSIS ONLY",
  "co_usage_notice": "Results reflect complementary co-usage associations, not chronological predictions."
}
```

---

## 2. Intelligence Overview KPIs
- **Endpoint**: `GET /api/overview`
- **Description**: Summary metrics across journeys, interactions, mining metrics, top popular services, and category distributions.
- **Response**:
```json
{
  "kpis": {
    "total_journeys": 20000,
    "total_services": 30,
    "total_interactions": 76765,
    "avg_services_per_journey": 3.84,
    "median_services_per_journey": 4.0,
    "min_services_per_journey": 1,
    "max_services_per_journey": 9,
    "frequent_itemsets_count": 139,
    "rules_generated_count": 782,
    "surviving_rules_count": 527,
    "lift_survival_percentage": 67.39
  },
  "top_services": [...],
  "category_distribution": [...],
  "journey_length_distribution": [...],
  "pattern_distribution": [...]
}
```

---

## 3. Dataset Integrity Validation (8 Quality Checks)
- **Endpoint**: `GET /api/validation`
- **Description**: Executes the 8 quality assertions from `data_validator.py`.
- **Response**:
```json
{
  "total_checks": 8,
  "passed_checks": 8,
  "failed_checks": 0,
  "all_passed": true,
  "checks": [
    { "Validation": "Missing Values", "Status": "PASS", "Details": "0 missing values found" },
    { "Validation": "Duplicate Journeys", "Status": "PASS", "Details": "0 duplicate Journey IDs found" },
    ...
  ]
}
```

---

## 4. Service Catalogue
- **Endpoint**: `GET /api/services`
- **Description**: Returns all 30 catalogued services with metadata and illustrative platform mappings.
- **Response**: Array of service objects (`Service_ID`, `Service_Name`, `Category`, `Illustrative_Platform_ID`, `Illustrative_Platform_Name`).

---

## 5. Service Popularity Analysis
- **Endpoint**: `GET /api/popularity?category={category}`
- **Parameters**: `category` (optional, default: "all")
- **Response**: Array of services ranked by unique journey appearances and popularity share (%).

---

## 6. Exploratory Data Analysis (EDA)
- **Endpoint**: `GET /api/eda`
- **Description**: Co-occurrence pair frequencies (top 25 pairs), length distribution histogram, category breakdown, and synthetic journey archetypes.

---

## 7. Frequent Itemsets Mining
- **Endpoint**: `GET /api/mining/itemsets`
- **Parameters**:
  - `min_support` (float, default: 0.01)
  - `max_len` (int, optional)
  - `algorithm` (string: "fpgrowth" | "apriori", default: "fpgrowth")

---

## 8. Association Rule Explorer
- **Endpoint**: `GET /api/mining/rules`
- **Parameters**:
  - `min_support` (float, default: 0.01)
  - `min_confidence` (float, default: 0.30)
  - `min_lift` (float, default: 1.0)
  - `max_antecedent_len` (int, optional)
  - `single_consequent_only` (bool, default: true)
  - `remove_redundant` (bool, default: false)

---

## 9. Algorithm Benchmark Comparison
- **Endpoint**: `GET /api/mining/compare`
- **Parameters**: `min_support` (float, default: 0.01), `max_len` (int, optional)
- **Response**: Execution times for Apriori vs FP-Growth, itemset counts, speedup ratio, and mathematical equivalence check.

---

## 10. Citizen Journey Simulator / Recommendations
- **Endpoint**: `POST /api/recommend`
- **Request Body**:
```json
{
  "selected_service_ids": ["S01", "S03"],
  "max_recommendations": 5,
  "min_confidence": 0.20,
  "min_lift": 1.0,
  "ranking_metric": "confidence"
}
```
- **Response**:
```json
{
  "selected_service_ids": ["S01", "S03"],
  "recommendations_count": 4,
  "ranking_metric": "confidence",
  "recommendations": [
    {
      "rank": 1,
      "recommended_service_id": "S05",
      "recommended_service_name": "Aadhaar Verification",
      "recommended_category": "Identity",
      "recommended_platform": "P03",
      "trigger_service_ids": ["S01", "S03"],
      "trigger_service_names": ["Scholarship Application", "Income Certificate"],
      "confidence_pct": 58.2,
      "lift": 1.42,
      "support_pct": 8.1,
      "score": 64.5,
      "explanation": {
        "summary": "...",
        "metric_rationale": "...",
        "governance_insight": "...",
        "disclaimer": "..."
      }
    }
  ]
}
```

---

## 11. Service Relationship Network
- **Endpoint**: `GET /api/network`
- **Parameters**: `min_support` (float), `min_confidence` (float), `min_lift` (float)
- **Response**: Graph topology with `nodes` and `edges` for canvas/WebGL visualization.

---

## 12. Strategic Integration Planning
- **Endpoint**: `GET /api/integration`
- **Parameters**: `min_confidence`, `min_lift`, `top_n`, `w_confidence`, `w_lift`, `w_support`, `w_platform`, `w_category`
- **Response**: Ranked list of multi-criteria scored integration candidates with strategic rationales.
