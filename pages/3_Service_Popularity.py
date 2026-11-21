import io
import streamlit as st
import plotly.express as px
import pandas as pd

from modules.data_loader import load_all_datasets
from modules.popularity_analysis import calculate_service_popularity


# ------------------------------------------
# PAGE CONFIGURATION
# ------------------------------------------

st.set_page_config(
    page_title="Service Popularity Analysis | Project KRATOS",
    page_icon="📈",
    layout="wide"
)

# ------------------------------------------
# APPLICATION HEADER
# ------------------------------------------

st.title("📈 Government Service Popularity Analysis")

st.markdown(
    """
    Establish an empirical baseline of individual government service utilization across citizen journeys.
    This baseline provides context for evaluating whether service co-occurrence in association rules
    reflects genuine synergy or merely broad underlying popularity.
    """
)

st.info(
    "⚠️ **Dataset Disclaimer**: Service interactions are generated from synthetic citizen journeys "
    "for project demonstration and simulation. Results illustrate analytical workflows and should not "
    "be interpreted as empirical citizen behavior or real platform usage."
)

st.divider()


# ------------------------------------------
# DATA LOADING
# ------------------------------------------

@st.cache_data
def get_datasets():
    return load_all_datasets()


try:
    datasets = get_datasets()
    journeys = datasets["journeys"]
    long_data = datasets["long_data"]
    services = datasets["services"]

    total_journeys = len(journeys)

    # Compute popularity baseline using core analytical module
    popularity_df = calculate_service_popularity(
        journey_services=long_data,
        service_catalogue=services,
        total_journeys=total_journeys
    )

    # ------------------------------------------
    # EXECUTIVE KPI METRICS
    # ------------------------------------------

    st.subheader("🏛️ Executive Summary Metrics")

    col1, col2, col3, col4 = st.columns(4)

    most_popular = popularity_df.iloc[0]
    least_popular = popularity_df.iloc[-1]

    col1.metric(
        "Total Journeys Analyzed",
        f"{total_journeys:,}"
    )

    col2.metric(
        "Catalogued Services",
        f"{len(popularity_df)}"
    )

    col3.metric(
        "Most Popular Service",
        f"{most_popular['Service_Name']}",
        f"{most_popular['Popularity_Percentage']:.1f}% ({most_popular['Journey_Count']:,} journeys)"
    )

    col4.metric(
        "Least Popular Service",
        f"{least_popular['Service_Name']}",
        f"{least_popular['Popularity_Percentage']:.1f}% ({least_popular['Journey_Count']:,} journeys)"
    )

    st.divider()

    # ------------------------------------------
    # FILTERING & SEARCH CONTROLS
    # ------------------------------------------

    st.subheader("🔍 Filter & Explore Service Baseline")

    ctrl_col1, ctrl_col2, ctrl_col3 = st.columns([2, 2, 1])

    with ctrl_col1:
        search_query = st.text_input(
            "Search service by name or ID:",
            placeholder="e.g. Aadhaar, Scholarship, S05..."
        ).strip().lower()

    with ctrl_col2:
        category_options = ["All Categories"] + sorted(popularity_df["Category"].dropna().unique().tolist())
        selected_category = st.selectbox(
            "Filter by administrative category:",
            category_options
        )

    with ctrl_col3:
        top_k = st.slider(
            "Display Top N services:",
            min_value=5,
            max_value=len(popularity_df),
            value=15
        )

    # Apply filters
    filtered_df = popularity_df.copy()

    if selected_category != "All Categories":
        filtered_df = filtered_df[filtered_df["Category"] == selected_category]

    if search_query:
        filtered_df = filtered_df[
            filtered_df["Service_Name"].str.lower().str.contains(search_query) |
            filtered_df["Service_ID"].str.lower().str.contains(search_query)
        ]

    # ------------------------------------------
    # INTERACTIVE VISUALIZATIONS
    # ------------------------------------------

    st.subheader("📊 Popularity Distribution Visualizations")

    chart_tab1, chart_tab2 = st.tabs(["🏆 Service Popularity Ranking", "📂 Category Comparison"])

    with chart_tab1:
        chart_data = filtered_df.head(top_k).sort_values("Popularity_Percentage", ascending=True)

        fig_popularity = px.bar(
            chart_data,
            x="Popularity_Percentage",
            y="Service_Name",
            orientation="h",
            color="Category",
            text=chart_data["Popularity_Percentage"].apply(lambda v: f"{v:.1f}%"),
            hover_data=["Service_ID", "Journey_Count", "Category"],
            title=f"Top {len(chart_data)} Services by Journey Penetration Rate (%)",
            labels={
                "Popularity_Percentage": "Journey Penetration Rate (%)",
                "Service_Name": "Government Service"
            }
        )

        fig_popularity.update_layout(
            height=max(450, len(chart_data) * 28),
            xaxis_title="Citizen Journeys Penetration (%)",
            yaxis_title="",
            hovermode="closest"
        )
        st.plotly_chart(fig_popularity, use_container_width=True)

    with chart_tab2:
        category_agg = popularity_df.groupby("Category").agg(
            Average_Popularity=("Popularity_Percentage", "mean"),
            Total_Service_Usages=("Journey_Count", "sum"),
            Service_Count=("Service_ID", "count")
        ).reset_index().sort_values("Average_Popularity", ascending=False)

        fig_cat = px.bar(
            category_agg,
            x="Category",
            y="Average_Popularity",
            text=category_agg["Average_Popularity"].apply(lambda v: f"{v:.1f}%"),
            color="Category",
            title="Mean Service Popularity by Administrative Category",
            labels={"Average_Popularity": "Mean Popularity (%)"}
        )
        fig_cat.update_layout(height=450, showlegend=False)
        st.plotly_chart(fig_cat, use_container_width=True)

    st.divider()

    # ------------------------------------------
    # TABULAR RANKING TABLE & EXPORT
    # ------------------------------------------

    st.subheader("📋 Comprehensive Popularity Ranking Table")

    display_table = filtered_df[[
        "Rank", "Service_ID", "Service_Name", "Category", "Journey_Count", "Popularity_Percentage"
    ]].copy()

    display_table["Popularity_Percentage"] = display_table["Popularity_Percentage"].apply(lambda x: f"{x:.2f}%")
    display_table["Journey_Count"] = display_table["Journey_Count"].apply(lambda x: f"{x:,}")

    st.dataframe(
        display_table,
        use_container_width=True,
        hide_index=True
    )

    # Download Buttons
    csv_data = filtered_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 Download Popularity Data (CSV)",
        data=csv_data,
        file_name="project_kratos_service_popularity.csv",
        mime="text/csv"
    )

except Exception as e:
    st.error(f"Service Popularity Analysis Error: {e}")
