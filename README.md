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

### 1. Environment Setup
```bash
# Clone or navigate to repository root
cd Government-Service-CoUsage-main

# Activate virtual environment
.\venv\Scripts\Activate.ps1   # Windows PowerShell
# or: source venv/bin/activate # Linux / macOS

# Install dependencies if needed
pip install -r requirements.txt
```

### 2. Run Test Suite
```bash
python -m pytest tests/
```

### 3. Launch Streamlit Application
```bash
streamlit run app.py
```
