import streamlit as st
import plotly.express as px
import pandas as pd

from modules.data_loader import load_all_datasets
from modules.preprocessing import prepare_basket_data
from modules.association_mining import run_fpgrowth
from modules.rule_evaluation import generate_rules
from modules.integration_analyzer import analyze_integration_opportunities, DEFAULT_WEIGHTS
from config import DEFAULT_MIN_SUPPORT, DEFAULT_MIN_CONFIDENCE, DEFAULT_MIN_LIFT


# ------------------------------------------
# PAGE CONFIGURATION
# ------------------------------------------

st.set_page_config(
    page_title="Integration Insights | Project KRATOS",
    page_icon="🔗",
    layout="wide"
)

st.title("🔗 Cross-Platform & Cross-Category Integration Insights")

st.markdown(
    """
    Transform statistical association rules into prioritized **Digital Governance Integration Opportunities**.
    Identify public service silos where high co-usage across disconnected platforms or ministries
    justifies single-sign-on, unified application flows, or automated verification APIs.
    """
)

st.warning(
    "⚠️ **Governance Notice**: Platform IDs (`P01`–`P16`) are illustrative placeholders representing "
    "disconnected portals. Actual digital infrastructure interoperability requires verification with "
    "relevant departmental architectures."
)

st.divider()


# ------------------------------------------
# DATA LOADING & CACHED MINING
# ------------------------------------------

@st.cache_data
def get_datasets():
    return load_all_datasets()


@st.cache_data
def get_prepared_basket():
    datasets = get_datasets()
    return prepare_basket_data(datasets["basket"])


@st.cache_data
def get_association_rules():
    basket = get_prepared_basket()
    # Mine base patterns at standard thresholds
    itemsets = run_fpgrowth(basket, min_support=DEFAULT_MIN_SUPPORT)
    rules = generate_rules(itemsets, min_confidence=0.25)
    return rules


try:
    datasets = get_datasets()
    services = datasets["services"]
    rules = get_association_rules()

    # ------------------------------------------
    # SIDEBAR: SCORING WEIGHTS & THRESHOLDS
    # ------------------------------------------

    st.sidebar.header("⚖️ Opportunity Scoring Model")
    st.sidebar.caption("Configure multi-criteria weights for strategic prioritization:")

    w_conf = st.sidebar.slider("Confidence Weight (Reliability)", 0.0, 1.0, float(DEFAULT_WEIGHTS["confidence"]), 0.05)
    w_lift = st.sidebar.slider("Lift Weight (Synergy)", 0.0, 1.0, float(DEFAULT_WEIGHTS["lift"]), 0.05)
    w_supp = st.sidebar.slider("Support Weight (Citizen Reach)", 0.0, 1.0, float(DEFAULT_WEIGHTS["support"]), 0.05)
    w_plat = st.sidebar.slider("Cross-Platform Weight (Inter-Portal)", 0.0, 1.0, float(DEFAULT_WEIGHTS["cross_platform"]), 0.05)
    w_cat = st.sidebar.slider("Cross-Category Weight (Inter-Ministry)", 0.0, 1.0, float(DEFAULT_WEIGHTS["cross_category"]), 0.05)

    custom_weights = {
        "confidence": w_conf,
        "lift": w_lift,
        "support": w_supp,
        "cross_platform": w_plat,
        "cross_category": w_cat
    }

    st.sidebar.divider()
    st.sidebar.header("🔍 Filter Priorities")
    only_cross_plat = st.sidebar.checkbox("Cross-Platform Only", value=False)
    only_cross_cat = st.sidebar.checkbox("Cross-Category Only", value=False)
    min_score_cutoff = st.sidebar.slider("Minimum Opportunity Score", 0.0, 100.0, 40.0, 5.0)

    # Compute opportunities
    opportunities_df = analyze_integration_opportunities(
        rules_df=rules,
        service_catalogue=services,
        weights=custom_weights,
        min_confidence=0.25,
        min_lift=1.05,
        top_n=100
    )

    # Apply interactive filters
    filtered_opps = opportunities_df.copy()
    if only_cross_plat:
        filtered_opps = filtered_opps[filtered_opps["Is_Cross_Platform"]]
    if only_cross_cat:
        filtered_opps = filtered_opps[filtered_opps["Is_Cross_Category"]]
    filtered_opps = filtered_opps[filtered_opps["Opportunity_Score"] >= min_score_cutoff].reset_index(drop=True)
    # Re-rank
    filtered_opps["Rank"] = range(1, len(filtered_opps) + 1)

    # ------------------------------------------
    # EXECUTIVE KPI METRICS
    # ------------------------------------------

    st.subheader("🏛️ Strategic Integration Overview")

    mcol1, mcol2, mcol3, mcol4 = st.columns(4)

    mcol1.metric("Total Opportunities Identified", f"{len(opportunities_df):,}")
    mcol2.metric("Cross-Platform Opportunities", f"{int(opportunities_df['Is_Cross_Platform'].sum()):,}")
    mcol3.metric("Cross-Category Opportunities", f"{int(opportunities_df['Is_Cross_Category'].sum()):,}")
    top_score = filtered_opps.iloc[0]["Opportunity_Score"] if not filtered_opps.empty else 0.0
    mcol4.metric("Top Opportunity Score", f"{top_score:.1f} / 100")

    st.divider()

    # ------------------------------------------
    # VISUALIZATIONS & RANKING
    # ------------------------------------------

    tab_rank, tab_heat, tab_matrix = st.tabs([
        "🏆 Prioritized Opportunities",
        "🌐 Cross-Platform Coordination Map",
        "🏛️ Inter-Departmental Matrix"
    ])

    with tab_rank:
        st.subheader("Ranked Digital Service Integration Opportunities")

        if filtered_opps.empty:
            st.warning("No opportunities match the current filter criteria. Try adjusting threshold sliders.")
        else:
            # Top 15 horizontal bar chart
            top_display = filtered_opps.head(15).sort_values("Opportunity_Score", ascending=True)

            fig_opps = px.bar(
                top_display,
                x="Opportunity_Score",
                y="Opportunity",
                orientation="h",
                color="Opportunity_Score",
                text=top_display["Opportunity_Score"].apply(lambda s: f"{s:.1f}"),
                title="Top 15 Strategic Integration Opportunities by Opportunity Score",
                labels={"Opportunity_Score": "Integration Opportunity Score (0-100)"},
                color_continuous_scale="Tealgrn"
            )
            fig_opps.update_layout(height=max(450, len(top_display) * 32), yaxis_title="")
            st.plotly_chart(fig_opps, use_container_width=True)

            # Table display
            disp_cols = [
                "Rank", "Opportunity", "Opportunity_Score", "Support", "Confidence", "Lift",
                "Is_Cross_Category", "Is_Cross_Platform",
                "Antecedent_Platforms", "Consequent_Platforms", "Strategic_Rationale"
            ]
            st.dataframe(filtered_opps[disp_cols], use_container_width=True, hide_index=True)

            # Download CSV
            csv_opps = filtered_opps.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download Integration Opportunities (CSV)",
                data=csv_opps,
                file_name="project_kratos_integration_opportunities.csv",
                mime="text/csv"
            )

    with tab_heat:
        st.subheader("Platform-to-Platform Interaction Density")
        st.write("Identifies which illustrative digital platforms have the highest volume of citizen cross-usage.")

        plat_pairs = opportunities_df.groupby(["Antecedent_Platforms", "Consequent_Platforms"]).agg(
            Opportunity_Count=("Opportunity", "count"),
            Mean_Lift=("Lift", "mean")
        ).reset_index()

        fig_plat = px.scatter(
            plat_pairs,
            x="Antecedent_Platforms",
            y="Consequent_Platforms",
            size="Opportunity_Count",
            color="Mean_Lift",
            title="Cross-Platform Coordination Demand (Antecedent Platform ➔ Consequent Platform)",
            labels={
                "Antecedent_Platforms": "Originating Service Platform",
                "Consequent_Platforms": "Target Service Platform",
                "Mean_Lift": "Mean Lift (Synergy)"
            },
            color_continuous_scale="Plasma"
        )
        fig_plat.update_layout(height=550)
        st.plotly_chart(fig_plat, use_container_width=True)

    with tab_matrix:
        st.subheader("Inter-Departmental / Category Synergies")
        cat_pairs = opportunities_df.groupby(["Antecedent_Categories", "Consequent_Categories"]).agg(
            Count=("Opportunity", "count"),
            Mean_Score=("Opportunity_Score", "mean")
        ).reset_index()

        fig_cat = px.bar(
            cat_pairs.sort_values("Count", ascending=False).head(12),
            x="Count",
            y=cat_pairs.sort_values("Count", ascending=False).head(12).apply(
                lambda r: f"{r['Antecedent_Categories']} ➔ {r['Consequent_Categories']}", axis=1
            ),
            orientation="h",
            color="Mean_Score",
            title="Top Inter-Category Association Pairs by Opportunity Volume",
            labels={"y": "Category Flow", "Count": "Number of Rules", "Mean_Score": "Mean Score"}
        )
        fig_cat.update_layout(height=500, yaxis_title="")
        st.plotly_chart(fig_cat, use_container_width=True)

except Exception as e:
    st.error(f"Integration Insights Error: {e}")
