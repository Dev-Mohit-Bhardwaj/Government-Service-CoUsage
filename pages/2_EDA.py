import streamlit as st
import plotly.express as px

from modules.data_loader import load_all_datasets

from modules.exploratory_data_analysis import (
    get_service_distribution,
    get_journey_length_distribution,
    get_frequent_service_pairs,
    get_category_distribution,
    get_synthetic_pattern_distribution
)


# ------------------------------------------
# PAGE CONFIGURATION
# ------------------------------------------

st.set_page_config(
    page_title="Exploratory Data Analysis",
    page_icon="📊",
    layout="wide"
)


# ------------------------------------------
# APPLICATION HEADER
# ------------------------------------------

st.title("📊 Exploratory Data Analysis")

st.write(
    "Explore service popularity, citizen journey characteristics, "
    "frequently co-used services and service categories."
)

st.info(
    "Dataset notice: The current dataset contains synthetic "
    "journeys generated for project development and demonstration. "
    "Results should not be interpreted as actual citizen behaviour."
)

st.divider()


# ------------------------------------------
# LOAD DATASETS
# ------------------------------------------

@st.cache_data
def get_datasets():
    return load_all_datasets()


try:

    datasets = get_datasets()

    journeys = datasets["journeys"]
    long_data = datasets["long_data"]
    basket = datasets["basket"]
    services = datasets["services"]


    # ------------------------------------------
    # OVERVIEW METRICS
    # ------------------------------------------

    st.header("Dataset Overview")

    total_journeys = journeys["Journey_ID"].nunique()
    total_services = services["Service_ID"].nunique()
    total_records = len(long_data)

    avg_services = journeys["Service_Count"].mean()

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Total Journeys",
        f"{total_journeys:,}"
    )

    col2.metric(
        "Total Services",
        total_services
    )

    col3.metric(
        "Journey-Service Records",
        f"{total_records:,}"
    )

    col4.metric(
        "Avg. Services / Journey",
        f"{avg_services:.2f}"
    )

    st.divider()


    # ------------------------------------------
    # 1. SERVICE POPULARITY DISTRIBUTION
    # ------------------------------------------

    st.header("1. Service Popularity Distribution")

    service_distribution = get_service_distribution(long_data)

    categories = [
        "All Categories"
    ] + sorted(
        service_distribution["Category"].dropna().unique().tolist()
    )

    selected_category = st.selectbox(
        "Filter services by category",
        categories
    )

    if selected_category != "All Categories":

        filtered_services = service_distribution[
            service_distribution["Category"] == selected_category
        ]

    else:

        filtered_services = service_distribution


    top_n = st.slider(
        "Number of services to display",
        min_value=5,
        max_value=30,
        value=10
    )

    top_services = filtered_services.head(top_n)

    fig_services = px.bar(
        top_services.sort_values("Journey_Count"),
        x="Journey_Count",
        y="Service_Name",
        orientation="h",
        color="Category",
        hover_data=["Percentage"],
        title="Most Frequently Used Services"
    )

    fig_services.update_layout(
        xaxis_title="Number of Journeys",
        yaxis_title="Government Service",
        height=550
    )

    st.plotly_chart(
        fig_services,
        use_container_width=True
    )

    st.divider()


    # ------------------------------------------
    # 2. JOURNEY LENGTH DISTRIBUTION
    # ------------------------------------------

    st.header("2. Citizen Journey Length Distribution")

    journey_length = get_journey_length_distribution(journeys)

    fig_length = px.bar(
        journey_length,
        x="Number_of_Services",
        y="Journey_Count",
        text="Journey_Count",
        title="Distribution of Services Per Journey"
    )

    fig_length.update_layout(
        xaxis_title="Number of Services in a Journey",
        yaxis_title="Number of Journeys",
        height=450
    )

    st.plotly_chart(
        fig_length,
        use_container_width=True
    )

    st.success(
        f"The average journey contains {avg_services:.2f} services."
    )

    st.divider()


    # ------------------------------------------
    # 3. FREQUENT SERVICE PAIRS
    # ------------------------------------------

    st.header("3. Frequently Co-Used Service Pairs")

    service_pairs = get_frequent_service_pairs(long_data)

    top_pairs = service_pairs.head(10).copy()

    top_pairs["Service_Pair"] = (
        top_pairs["Service_1"] + " + " + top_pairs["Service_2"]
    )

    fig_pairs = px.bar(
        top_pairs.sort_values("Journey_Count"),
        x="Journey_Count",
        y="Service_Pair",
        orientation="h",
        title="Top 10 Frequently Co-Used Service Pairs",
        hover_data=["Service_1", "Service_2"]
    )

    fig_pairs.update_layout(
        xaxis_title="Number of Journeys",
        yaxis_title="Service Combination",
        height=550
    )

    st.plotly_chart(
        fig_pairs,
        use_container_width=True
    )

    st.caption(
        "These values represent co-occurrence. They do not indicate "
        "chronological order or a causal relationship."
    )

    st.divider()


    # ------------------------------------------
    # 4. SERVICE CATEGORY DISTRIBUTION
    # ------------------------------------------

    st.header("4. Service Category Distribution")

    category_distribution = get_category_distribution(services)

    fig_category = px.pie(
        category_distribution,
        names="Category",
        values="Number_of_Services",
        hole=0.4,
        title="Distribution of Services Across Categories"
    )

    fig_category.update_layout(height=500)

    st.plotly_chart(
        fig_category,
        use_container_width=True
    )

    st.divider()


    # ------------------------------------------
    # 5. SYNTHETIC JOURNEY PATTERNS
    # ------------------------------------------

    st.header("5. Synthetic Journey Pattern Distribution")

    pattern_distribution = get_synthetic_pattern_distribution(journeys)

    fig_patterns = px.bar(
        pattern_distribution,
        x="Journey_Type",
        y="Journey_Count",
        text="Journey_Count",
        title="Distribution of Generated Journey Types"
    )

    fig_patterns.update_layout(
        xaxis_title="Synthetic Journey Type",
        yaxis_title="Number of Journeys",
        xaxis_tickangle=-35,
        height=500
    )

    st.plotly_chart(
        fig_patterns,
        use_container_width=True
    )

    st.warning(
        "Journey types are synthetic generation metadata. "
        "They are used for exploratory analysis only and will "
        "not be used as inputs to association rule mining."
    )

    st.divider()

    st.success(
        "Exploratory Data Analysis completed successfully!"
    )


except Exception as e:

    st.error(f"EDA Application Error: {e}")