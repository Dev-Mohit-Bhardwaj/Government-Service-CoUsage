import streamlit as st
from modules.data_validator import validate_datasets
from config import APP_TITLE, APP_DESCRIPTION
from modules.data_loader import load_all_datasets


# ----------------------------------
# PAGE CONFIGURATION
# ----------------------------------

st.set_page_config(
    page_title=APP_TITLE,
    page_icon="🏛️",
    layout="wide"
)


# ----------------------------------
# APPLICATION HEADER
# ----------------------------------

st.title("🏛️ PROJECT KRATOS")
st.subheader("Government Service Intelligence & Recommendation System")

st.markdown(
    f"""
    {APP_DESCRIPTION}
    
    Using unsupervised machine learning and association rule mining to discover frequently co-used
    digital services across disconnected government platforms and provide transparent citizen recommendations.
    """
)

st.info(
    "⚠️ **Analytical Notice & Limitations**: The dataset comprises 20,000 synthetic citizen journeys across "
    "30 illustrative services. Findings illustrate data mining workflows and should **not** be interpreted "
    "as empirical citizen behavior. Associations represent complementary co-usage, not chronological next-step predictions."
)

st.divider()


# ----------------------------------
# LOAD DATASETS
# ----------------------------------

@st.cache_data
def get_datasets():
    return load_all_datasets()


try:
    datasets = get_datasets()

    journeys = datasets["journeys"]
    long_data = datasets["long_data"]
    basket = datasets["basket"]
    services = datasets["services"]

    st.success("All primary datasets loaded successfully!")

    # ----------------------------------
    # DATASET VALIDATION (8 Quality Checks)
    # ----------------------------------

    st.subheader("🔍 Dataset Quality & Validation")

    validation_results = validate_datasets(datasets)

    total_checks = len(validation_results)
    passed_checks = (validation_results["Status"] == "PASS").sum()
    failed_checks = total_checks - passed_checks

    col1, col2, col3 = st.columns(3)
    col1.metric("Total Integrity Checks", total_checks)
    col2.metric("Checks Passed", int(passed_checks))
    col3.metric("Checks Failed", int(failed_checks))

    st.dataframe(
        validation_results,
        use_container_width=True,
        hide_index=True
    )

    if failed_checks == 0:
        st.success("✅ All 8 dataset validation checks passed with zero integrity anomalies!")
    else:
        st.warning(f"⚠️ {failed_checks} validation checks require attention.")

    st.divider()

    # ----------------------------------
    # DATASET OVERVIEW METRICS
    # ----------------------------------

    st.subheader("📊 Dataset Overview")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Journeys", f"{len(journeys):,}")
    col2.metric("Catalogued Services", len(services))
    col3.metric("Journey-Service Interactions", f"{len(long_data):,}")
    col4.metric("Avg. Services per Journey", f"{journeys['Service_Count'].mean():.2f}")

    st.divider()

    # ----------------------------------
    # PLATFORM MODULES & NAVIGATION
    # ----------------------------------

    st.subheader("🚀 Platform Capabilities & Analytical Modules")
    st.write("Navigate using the sidebar to access each specialized analytical module:")

    n_col1, n_col2, n_col3 = st.columns(3)

    with n_col1:
        st.markdown(
            """
            #### 📊 2. Exploratory Analysis
            Examine service distributions, journey length profiles, category breakdowns, and frequent service pairs.
            """
        )
        st.markdown(
            """
            #### 📈 3. Service Popularity
            Baseline individual service penetration rates (%) to contextualize co-occurrence vs. raw popularity.
            """
        )

    with n_col2:
        st.markdown(
            """
            #### ⛏️ 4. Association Rules
            Mine frequent service combinations via **Apriori** and **FP-Growth**. Evaluate Support, Confidence, Lift, and Lift Survival.
            """
        )
        st.markdown(
            """
            #### 🔗 5. Integration Insights
            Rank inter-departmental and cross-platform integration opportunities using transparent multi-criteria scoring.
            """
        )

    with n_col3:
        st.markdown(
            """
            #### 🧭 6. Journey Simulator
            Interactive citizen journey simulator. Recommends complementary services with metric-grounded explanations.
            """
        )
        st.markdown(
            """
            #### ℹ️ 7. About Project
            Complete project documentation, analytical methodology, technical architecture, and ethical limitations.
            """
        )

    st.divider()

    # ----------------------------------
    # DATASET PREVIEW
    # ----------------------------------

    st.subheader("📁 Dataset Inspection & Preview")

    selected_dataset = st.selectbox(
        "Select dataset to preview records:",
        [
            "Journeys (citizen_journeys.csv)",
            "Long Format (journey_services_long.csv)",
            "Basket Matrix (basket_onehot.csv)",
            "Service Catalogue (service_catalogue.csv)"
        ]
    )

    dataset_mapping = {
        "Journeys (citizen_journeys.csv)": journeys,
        "Long Format (journey_services_long.csv)": long_data,
        "Basket Matrix (basket_onehot.csv)": basket,
        "Service Catalogue (service_catalogue.csv)": services
    }

    st.dataframe(
        dataset_mapping[selected_dataset].head(10),
        use_container_width=True
    )
    st.caption("Displaying initial 10 records for schema and value verification.")

except Exception as e:
    st.error(f"Application Ingestion Error: {e}")
