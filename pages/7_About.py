import streamlit as st

# ------------------------------------------
# PAGE CONFIGURATION
# ------------------------------------------

st.set_page_config(
    page_title="About Project KRATOS",
    page_icon="ℹ️",
    layout="wide"
)

st.title("🏛️ About Project KRATOS")
st.subheader("Government Service Intelligence & Recommendation System")

st.divider()

st.markdown(
    """
    ### 1. Executive Summary & Problem Context
    Modern digital governance often suffers from platform fragmentation. Citizens navigating complex life events
    (such as applying for college scholarships, enrolling in pensions, registering farmland, or purchasing property)
    are frequently forced to interact with disparate, disconnected departmental portals.
    
    **Project KRATOS** is an unsupervised data intelligence and machine learning framework designed to:
    1. Uncover empirical service co-usage patterns across disconnected government platforms.
    2. Establish individual service popularity baselines to avoid conflating raw volume with true synergy.
    3. Mine frequent service combinations using Apriori and FP-Growth algorithms.
    4. Objectively evaluate associations using Support, Confidence, Lift, and Lift Survival share metrics.
    5. Prioritize high-value inter-departmental and inter-portal integration opportunities.
    6. Deliver explainable, transparent complementary service recommendations for citizen journeys.
    """
)

st.divider()

st.markdown(
    r"""
    ### 2. Analytical Methodology & Pipeline
    
    The KRATOS analytical pipeline is structured into decoupled, modular phases:
    
    1. **Data Ingestion & Integrity Validation**:
       - 8 rigorous automated quality checks verify absence of missing values, uniqueness of identifiers, count consistency, and one-hot matrix integrity.
    2. **Exploratory Data Analysis & Popularity Baseline**:
       - Analyzes journey length distributions, category balances, and individual service penetration rates to ground association rules in empirical context.
    3. **Frequent Itemset Mining (Apriori & FP-Growth)**:
       - Compares classical level-wise candidate generation (Apriori) against compact tree-based projection (FP-Growth).
    4. **Rule Evaluation & Lift Filtering Survival**:
       - Computes mathematical Support, Confidence, and Lift. Evaluates the *Lift Survival Percentage* ($P_{survive} = \frac{\text{Rules with Lift} \ge \tau}{\text{Total Generated Rules}} \times 100$) to measure how many rules exhibit genuine statistical synergy beyond independence.
    5. **Integration Opportunity Prioritization**:
       - Calculates a transparent, multi-criteria Opportunity Score combining normalized support, confidence, lift, cross-platform flags, and cross-category flags.
    6. **Citizen Journey Simulator & Explanation Engine**:
       - Matches arbitrary user service selections against rule antecedents, excludes previously utilized services, and outputs metric-grounded explanations.
    """
)

st.divider()

st.markdown(
    """
    ### 3. Critical Dataset Limitations & Ethical Governance
    
    > ⚠️ **MANDATORY SCIENTIFIC & ETHICAL DISCLAIMERS**
    > 
    > - **Synthetic Nature**: The dataset consists of 20,000 synthetic citizen journeys generated via mixture models across 8 synthetic journey archetypes with a 12% noise factor. Findings reflect simulation parameters, not empirical citizen behavior.
    > - **Illustrative Platform IDs**: Platforms `P01` through `P16` are illustrative placeholders and do not correspond to actual government servers or departmental infrastructure.
    > - **No Chronological Sequencing**: Journeys do not record event timestamps. Recommendations discover **complementary co-usage**, not chronological next-step transitions.
    > - **Non-Causal Associations**: Association rules describe statistical co-occurrence and dependency. They do **not** imply causality, administrative prerequisites, or mandatory requirements.
    """
)

st.divider()

st.markdown(
    """
    ### 4. Technical Architecture & Technology Stack
    
    The project follows a clean separation of concerns:
    - **Core Analytical Modules** (`modules/`): Pure Python, Pandas, NumPy, and `mlxtend`. Zero coupling to Streamlit, ensuring seamless future portability to FastAPI.
    - **User Experience Layer** (`pages/`): Streamlit multi-page dashboard with Plotly Express interactive visualizations.
    - **Quality Assurance** (`tests/`): Automated pytest test suite covering validation, preprocessing, popularity analysis, mining, rule evaluation, integration scoring, and recommendations.
    
    | Component | Technology | Version | Purpose |
    |:---|:---|:---|:---|
    | Runtime | Python | 3.11 / 3.14 | Core execution environment |
    | Data Manipulation | Pandas, NumPy | 3.1.1, 2.5.4 | Basket manipulation and vector calculations |
    | Pattern Mining | mlxtend | 0.25.0 | Apriori, FP-Growth, and Association Rules |
    | Dashboard UI | Streamlit | 1.67.0 | Multi-page interactive application |
    | Visualizations | Plotly | 7.1.0 | Interactive scatter, bar, and matrix charts |
    | Testing | Pytest | 9.2.0 | Automated unit testing |
    """
)
