# Project KRATOS — Government Service Intelligence & Recommendation System

Project KRATOS is an advanced, modular analytical software platform that utilizes association rule mining and machine learning techniques to uncover service co-usage patterns across disconnected government digital platforms and provide transparent, explainable recommendations for complementary citizen services.

---

## 🏛️ Project Motivation & Problem Statement

Citizens navigating government digital services frequently interact with multiple disconnected portals to accomplish holistic life events (such as enrolling in higher education, registering a farm, applying for pensions, or purchasing property). Because services are typically hosted on disparate platforms, governments face significant coordination hurdles, and citizens encounter fragmented service experiences.

Project KRATOS addresses this challenge through:
1. **Unsupervised Co-Usage Pattern Discovery**: Mining frequent service itemsets using Apriori and FP-Growth algorithms.
2. **Rigorous Rule Evaluation**: Measuring statistical association using Support, Confidence, and Lift, along with Lift Survival share analysis.
3. **Cross-Platform Integration Opportunity Identification**: Scoring and ranking high-value inter-service integration opportunities.
4. **Interactive Citizen Journey Recommendation Engine**: Suggesting complementary services based on an individual's current service basket.
5. **Human-Readable Explanations**: Delivering transparent, metric-grounded explanations without confusing correlation with causation.
6. **Executive Planning Dashboard**: Providing interactive visualizations via a modern Streamlit interface.

---

## ⚠️ Important Dataset Limitations & Ethical Governance

The dataset utilized in this project is **synthetic** (20,000 simulated citizen journeys, 30 illustrative government services, 8 predefined pattern archetypes, and 12% noise rate).
- **Synthetic Disclaimer**: Findings reflect simulation parameters, not empirical citizen behavior.
- **Illustrative Platforms**: Platform IDs (`P01`–`P16`) are synthetic placeholders and do not represent actual government servers.
- **No Chronological Sequencing**: Journeys do not include timestamps; recommendations represent **complementary co-usage**, not chronological next-step predictions.
- **Non-Causal Inference**: Association rules indicate co-occurrence and statistical dependency, not causation.

---

## 🏗️ Software Architecture

```
Government-Service-CoUsage-main/
│
├── app.py                      # Executive Overview & Data Quality Dashboard
├── config.py                   # Centralized Configuration & Hyperparameters
├── requirements.txt            # Python Dependencies
├── README.md                   # Project Overview & Execution Guide
│
├── DataSet/                    # Primary Datasets & Metadata
│   ├── citizen_journeys.csv
│   ├── journey_services_long.csv
│   ├── basket_onehot.csv
│   ├── service_catalogue.csv
│   ├── synthetic_pattern_assumptions.csv
│   └── dataset_summary.json
│
├── modules/                    # Pure Python Analytical Modules (Decoupled from UI)
│   ├── data_loader.py          # Dataset Ingestion
│   ├── data_validator.py       # 8 Integrity & Consistency Checks
│   ├── preprocessing.py        # Binary Matrix Preparation
│   ├── popularity_analysis.py  # Popularity Ranking & Calculations
│   ├── exploratory_data_analysis.py # EDA Aggregations
│   ├── exploratory_analysis.py # API Compatibility Bridge
│   ├── association_mining.py   # Apriori & FP-Growth Mining
│   ├── rule_evaluation.py      # Rule Generation & Lift Survival
│   ├── integration_analyzer.py # Cross-Platform Integration Scoring
│   ├── recommendation_engine.py# Complementary Service Recommendations
│   └── explanation_engine.py   # Metric-Grounded Explanations
│
├── pages/                      # Interactive Streamlit Multi-Page UI
│   ├── 2_Exploratory_Analysis.py
│   ├── 3_Service_Popularity.py
│   ├── 4_Association_Rules.py
│   ├── 5_Integration_Insights.py
│   ├── 6_Journey_Simulator.py
│   └── 7_About.py
│
├── tests/                      # Automated Pytest Test Suite
│   ├── test_data_validator.py
│   ├── test_preprocessing.py
│   ├── test_popularity_analysis.py
│   ├── test_EDA.py
│   ├── test_association_mining.py
│   ├── test_rule_evaluation.py
│   ├── test_integration_analyzer.py
│   └── test_recommendation_engine.py
│
└── docs/                       # Technical & Architectural Documentation
    ├── architecture.md
    ├── data_dictionary.md
    └── team_work_tracker.md
```

---

## 🚀 Installation & Running

### Option A: Futuristic Web Application (React + Vite + Three.js + FastAPI) [RECOMMENDED]

The new immersive UI is powered by a React 18 + Vite frontend with Three.js (CIVIC ORBIT 3D digital globe), Framer Motion, and a high-performance FastAPI analytics layer.

#### 1. Single-Command Launch (Backend + Built Frontend)
```bash
# Run FastAPI server (automatically serves API at /api and built React UI at /)
.\.venv\Scripts\python -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```
Open **`http://127.0.0.1:8000`** in your browser.

#### 2. Development Mode (With Hot Reloading)
```bash
# Terminal 1: Start FastAPI backend
.\.venv\Scripts\python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Start Vite Dev Server
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Option B: Legacy Streamlit Application [FALLBACK]
```bash
.\.venv\Scripts\streamlit run app.py
```
Open **`http://localhost:8501`** in your browser.

---

### 🧪 Running Automated Tests
```bash
.\.venv\Scripts\python -m pytest
```
All 51 unit and integration tests across data validation, preprocessing, popularity analysis, association mining, rule evaluation, and recommendation logic will run and report status.
```

### 2. Run Test Suite
```bash
python -m pytest tests/
```

### 3. Launch Streamlit Application
```bash
streamlit run app.py
```
### Thank you so much for visiting us!!!
