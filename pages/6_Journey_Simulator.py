import streamlit as st
import plotly.express as px
import pandas as pd

from modules.data_loader import load_all_datasets
from modules.preprocessing import prepare_basket_data
from modules.association_mining import run_fpgrowth
from modules.rule_evaluation import generate_rules
from modules.recommendation_engine import recommend_services
from modules.explanation_engine import explain_all_recommendations
from config import DEFAULT_MIN_SUPPORT


# ------------------------------------------
# PAGE CONFIGURATION
# ------------------------------------------

st.set_page_config(
    page_title="Citizen Journey Simulator | Project KRATOS",
    page_icon="🧭",
    layout="wide"
)

st.title("🧭 Citizen Journey Recommendation Simulator")

st.markdown(
    """
    Simulate a citizen navigating government services and discover **complementary service recommendations**.
    The recommendation engine matches the citizen's active service basket against empirical association rules
    and explains the quantitative evidence behind each suggestion.
    """
)

st.info(
    "⚠️ **Important Disclaimer**: Recommendations are based on observed co-usage associations across "
    "synthetic citizen journeys. They represent **complementary service opportunities**, not chronological "
    "predictions or mandatory prerequisites."
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
def get_base_rules(min_conf, min_lft):
    basket = get_prepared_basket()
    itemsets = run_fpgrowth(basket, min_support=DEFAULT_MIN_SUPPORT)
    # Generate rules with low baseline threshold to allow rich simulator matching
    rules = generate_rules(itemsets, min_confidence=min_conf)
    return rules


try:
    datasets = get_datasets()
    services = datasets["services"]
    journeys = datasets["journeys"]

    # ------------------------------------------
    # SIDEBAR CONTROLS
    # ------------------------------------------

    st.sidebar.header("⚙️ Simulator Settings")

    sim_min_conf = st.sidebar.slider(
        "Minimum Rule Confidence",
        min_value=0.10,
        max_value=0.80,
        value=0.20,
        step=0.05,
        help="Minimum conditional probability P(B|A) for a rule to trigger a recommendation."
    )

    sim_min_lift = st.sidebar.slider(
        "Minimum Rule Lift",
        min_value=1.0,
        max_value=5.0,
        value=1.1,
        step=0.1,
        help="Minimum lift required for a recommendation."
    )

    max_recs = st.sidebar.slider(
        "Max Recommendations to Display",
        min_value=1,
        max_value=10,
        value=5
    )

    rank_by = st.sidebar.selectbox(
        "Rank Recommendations By",
        ["confidence", "lift", "composite"],
        format_func=lambda x: {
            "confidence": "Confidence (Reliability)",
            "lift": "Lift (Synergy Factor)",
            "composite": "Composite Multi-Criteria Score"
        }[x]
    )

    rules = get_base_rules(sim_min_conf, sim_min_lift)

    # ------------------------------------------
    # CITIZEN SERVICE SELECTION INTERFACE
    # ------------------------------------------

    st.subheader("1. Citizen Active Service Basket")

    # Service name to ID mapping
    service_options = {}
    for _, row in services.iterrows():
        label = f"{row['Service_Name']} ({row['Category']} — {row['Illustrative_Platform_ID']})"
        service_options[label] = row["Service_ID"]

    # Persona Presets
    st.caption("Quick Load Common Citizen Journeys:")
    preset_cols = st.columns(4)

    preset_basket = []
    if preset_cols[0].button("🎓 Scholarship Applicant"):
        preset_basket = ["S01", "S03"]  # Scholarship Application + Income Certificate
    elif preset_cols[1].button("🌾 Farmer Support"):
        preset_basket = ["S15", "S12"]  # Farmer Registration + Land Records
    elif preset_cols[2].button("👴 Pensioner Application"):
        preset_basket = ["S07", "S08"]  # Pension Application + Life Certificate
    elif preset_cols[3].button("🏠 Property Buyer"):
        preset_basket = ["S13", "S12"]  # Property Registration + Land Records

    # Multiselect input
    # Determine default labels based on preset or session
    reverse_map = {v: k for k, v in service_options.items()}
    default_labels = [reverse_map[sid] for sid in preset_basket if sid in reverse_map]

    selected_labels = st.multiselect(
        "Select services currently utilized in this journey:",
        options=list(service_options.keys()),
        default=default_labels if default_labels else None,
        placeholder="Choose one or more government services..."
    )

    selected_ids = [service_options[lbl] for lbl in selected_labels]

    if selected_ids:
        st.write(
            f"**Active Basket ({len(selected_ids)} services):** " +
            " • ".join([f"`{services.loc[services['Service_ID']==sid, 'Service_Name'].iloc[0]}`" for sid in selected_ids])
        )
    else:
        st.info("👆 Please select at least one service above or choose a preset journey to receive recommendations.")

    st.divider()

    # ------------------------------------------
    # RECOMMENDATION GENERATION & EXPLANATIONS
    # ------------------------------------------

    if selected_ids:
        st.subheader("2. Recommended Complementary Services")

        recommendations = recommend_services(
            selected_service_ids=selected_ids,
            rules_df=rules,
            service_catalogue=services,
            max_recommendations=max_recs,
            min_confidence=sim_min_conf,
            min_lift=sim_min_lift,
            ranking_metric=rank_by
        )

        explained_recs = explain_all_recommendations(recommendations)

        if not explained_recs:
            st.warning(
                f"No complementary service recommendations found matching the current basket "
                f"at minimum confidence {sim_min_conf:.2f} and lift {sim_min_lift:.1f}. "
                "Try lowering the minimum confidence or lift in the sidebar, or adding related services."
            )
        else:
            st.success(f"Discovered **{len(explained_recs)}** high-confidence complementary service recommendations!")

            # Metric Chart
            chart_df = pd.DataFrame(explained_recs)
            chart_df = chart_df.sort_values(by="confidence", ascending=True)

            fig_rec = px.bar(
                chart_df,
                x="confidence_pct",
                y="recommended_service_name",
                orientation="h",
                color="lift",
                text=chart_df["confidence_pct"].apply(lambda c: f"{c:.1f}% Conf"),
                hover_data=["recommended_category", "recommended_platform", "lift", "support_pct"],
                title="Recommended Services: Confidence & Lift",
                labels={
                    "confidence_pct": "Conditional Confidence (%)",
                    "recommended_service_name": "Recommended Service",
                    "lift": "Lift Factor"
                },
                color_continuous_scale="Viridis"
            )
            fig_rec.update_layout(height=max(350, len(chart_df) * 45), yaxis_title="")
            st.plotly_chart(fig_rec, use_container_width=True)

            # Detailed Cards with Explanations
            for rec in explained_recs:
                exp = rec["explanation"]
                with st.expander(
                    f"**Rank #{rec['rank']} — {rec['recommended_service_name']}** ({rec['recommended_category']}) "
                    f"| Confidence: **{rec['confidence_pct']:.1f}%** | Lift: **{rec['lift']:.2f}x**",
                    expanded=(rec["rank"] <= 2)
                ):
                    ecol1, ecol2, ecol3, ecol4 = st.columns(4)
                    ecol1.metric("Confidence", f"{rec['confidence_pct']:.1f}%")
                    ecol2.metric("Lift Factor", f"{rec['lift']:.2f}x")
                    ecol3.metric("Population Support", f"{rec['support_pct']:.1f}%")
                    ecol4.metric("Platform", f"{rec['recommended_platform']}")

                    st.markdown(f"**📌 Summary**: {exp['summary']}")
                    st.markdown(f"**📊 Quantitative Evidence**: {exp['metric_rationale']}")
                    st.markdown(f"**🏛️ Administrative Insight**: {exp['governance_insight']}")
                    st.caption(f"ℹ️ {exp['disclaimer']}")

            # Export table
            rec_export_df = pd.DataFrame([
                {
                    "Rank": r["rank"],
                    "Recommended_Service": r["recommended_service_name"],
                    "Recommended_ID": r["recommended_service_id"],
                    "Category": r["recommended_category"],
                    "Platform": r["recommended_platform"],
                    "Trigger_Services": ", ".join(r["trigger_service_names"]),
                    "Confidence_%": r["confidence_pct"],
                    "Lift": r["lift"],
                    "Support_%": r["support_pct"],
                    "Explanation": r["explanation"]["full_text"]
                }
                for r in explained_recs
            ])

            csv_recs = rec_export_df.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download Recommendation Results (CSV)",
                data=csv_recs,
                file_name="project_kratos_journey_recommendations.csv",
                mime="text/csv"
            )

except Exception as e:
    st.error(f"Journey Simulator Error: {e}")
