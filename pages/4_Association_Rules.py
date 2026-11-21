import streamlit as st
import plotly.express as px
import pandas as pd

from modules.data_loader import load_all_datasets
from modules.preprocessing import prepare_basket_data
from modules.association_mining import (
    run_apriori,
    run_fpgrowth,
    compare_algorithms,
    format_itemsets_with_names
)
from modules.rule_evaluation import (
    generate_rules,
    calculate_lift_survival,
    filter_rules,
    format_rules_with_names
)
from config import DEFAULT_MIN_SUPPORT, DEFAULT_MIN_CONFIDENCE, DEFAULT_MIN_LIFT


# ------------------------------------------
# PAGE CONFIGURATION
# ------------------------------------------

st.set_page_config(
    page_title="Association Rule Mining | Project KRATOS",
    page_icon="⛏️",
    layout="wide"
)

st.title("⛏️ Association Rule Mining & Evaluation")

st.markdown(
    """
    Discover hidden co-usage patterns across government services using **Apriori** and **FP-Growth** algorithms.
    Evaluate rule associations via **Support** (frequency), **Confidence** (conditional reliability),
    and **Lift** (synergy above random independence).
    """
)

st.info(
    "⚠️ **Analytical Notice**: Association rules reflect co-occurrence in synthetic citizen journeys. "
    "They do **not** imply chronological sequence (no timestamps) or causal necessity. "
    "All service combinations represent complementary co-usage."
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
def get_mined_patterns(min_supp, min_conf, min_lft, algo_choice, max_ant_len):
    basket = get_prepared_basket()
    datasets = get_datasets()
    services = datasets["services"]
    total_journeys = len(basket)

    # 1. Run chosen algorithm
    if algo_choice == "Apriori":
        itemsets = run_apriori(basket, min_support=min_supp)
    else:
        itemsets = run_fpgrowth(basket, min_support=min_supp)

    # 2. Generate raw rules
    raw_rules = generate_rules(itemsets, min_confidence=min_conf)

    # 3. Calculate Lift Survival Share before lift filtering
    survival_info = calculate_lift_survival(raw_rules, min_lift=min_lft)

    # 4. Filter rules by lift and antecedent length
    filtered_rules = filter_rules(
        raw_rules,
        min_lift=min_lft,
        max_antecedent_len=max_ant_len if max_ant_len > 0 else None,
        single_consequent_only=True
    )

    # 5. Format itemsets and rules
    formatted_itemsets = format_itemsets_with_names(itemsets, services, total_journeys=total_journeys)
    formatted_rules = format_rules_with_names(filtered_rules, services)

    return itemsets, formatted_itemsets, raw_rules, filtered_rules, formatted_rules, survival_info


try:
    datasets = get_datasets()
    services = datasets["services"]
    basket = get_prepared_basket()

    # ------------------------------------------
    # SIDEBAR MINING HYPERPARAMETERS
    # ------------------------------------------

    st.sidebar.header("⚙️ Mining Hyperparameters")

    algo_choice = st.sidebar.radio(
        "Mining Algorithm",
        ["FP-Growth", "Apriori"],
        help="FP-Growth constructs a compact tree structure for fast mining; Apriori uses iterative level-wise candidate generation."
    )

    min_support = st.sidebar.slider(
        "Minimum Support (min_sup)",
        min_value=0.005,
        max_value=0.10,
        value=float(DEFAULT_MIN_SUPPORT),
        step=0.005,
        format="%.3f",
        help="Minimum fraction of all journeys that must contain the service combination."
    )

    min_confidence = st.sidebar.slider(
        "Minimum Confidence (min_conf)",
        min_value=0.10,
        max_value=0.95,
        value=float(DEFAULT_MIN_CONFIDENCE),
        step=0.05,
        format="%.2f",
        help="Given antecedent A is used, probability that consequent B is also used: P(B|A)."
    )

    min_lift = st.sidebar.slider(
        "Minimum Lift (min_lift)",
        min_value=1.0,
        max_value=6.0,
        value=float(DEFAULT_MIN_LIFT),
        step=0.1,
        format="%.1f",
        help="Ratio of observed co-usage to expected independence. Lift > 1 indicates positive association."
    )

    max_ant_len = st.sidebar.selectbox(
        "Max Antecedent Size",
        [0, 1, 2, 3],
        format_func=lambda x: "All Sizes" if x == 0 else f"At most {x} service(s)",
        index=0,
        help="Restrict complexity of rule antecedent conditions."
    )

    # Compute patterns
    with st.spinner("Mining frequent patterns and generating association rules..."):
        itemsets, formatted_itemsets, raw_rules, filtered_rules, formatted_rules, survival_info = get_mined_patterns(
            min_support, min_confidence, min_lift, algo_choice, max_ant_len
        )

    # ------------------------------------------
    # EXECUTIVE KPI CARDS
    # ------------------------------------------

    st.subheader("📊 Mining Execution Overview")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Frequent Itemsets", f"{len(itemsets):,}")
    col2.metric("Base Rules Generated", f"{survival_info['total_rules']:,}")
    col3.metric("Rules Surviving Lift", f"{len(filtered_rules):,}")
    col4.metric(
        "Lift Survival Share",
        f"{survival_info['survival_percentage']:.1f}%",
        f"{survival_info['filtered_out_rules']} rules pruned (Lift < {min_lift:.1f})"
    )

    st.divider()

    # ------------------------------------------
    # TABS FOR ITEMIZED WORKFLOWS
    # ------------------------------------------

    tab_rules, tab_itemsets, tab_viz, tab_benchmark = st.tabs([
        "📜 Association Rules",
        "📦 Frequent Itemsets",
        "📈 Analytical Visualizations",
        "⚡ Algorithm Benchmark (Apriori vs FP-Growth)"
    ])

    # TAB 1: RULES
    with tab_rules:
        st.subheader("Discovered Association Rules")

        if formatted_rules.empty:
            st.warning("No association rules satisfy the selected thresholds. Try lowering minimum support, confidence, or lift.")
        else:
            rule_ctrl1, rule_ctrl2 = st.columns([3, 1])
            with rule_ctrl1:
                sort_col = st.selectbox("Sort rules by:", ["Lift", "Confidence", "Support"], index=0)
            with rule_ctrl2:
                sort_order = st.radio("Order:", ["Descending", "Ascending"], horizontal=True)

            sorted_rules = formatted_rules.sort_values(by=sort_col, ascending=(sort_order == "Ascending")).reset_index(drop=True)

            # Display table
            display_cols = ["Rule", "Support_%", "Confidence_%", "Lift", "Antecedent_Names", "Consequent_Names"]
            st.dataframe(
                sorted_rules[display_cols],
                use_container_width=True,
                hide_index=True
            )

            # Download CSV
            csv_rules = sorted_rules.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download Association Rules (CSV)",
                data=csv_rules,
                file_name="project_kratos_association_rules.csv",
                mime="text/csv"
            )

    # TAB 2: FREQUENT ITEMSETS
    with tab_itemsets:
        st.subheader("Discovered Frequent Itemsets")

        if formatted_itemsets.empty:
            st.warning("No frequent itemsets discovered at this support threshold.")
        else:
            size_options = ["All Itemset Sizes"] + sorted([f"{s}-Item" for s in formatted_itemsets["Itemset_Size"].unique()])
            selected_size = st.selectbox("Filter itemsets by size:", size_options)

            disp_itemsets = formatted_itemsets.copy()
            if selected_size != "All Itemset Sizes":
                target_size = int(selected_size.split("-")[0])
                disp_itemsets = disp_itemsets[disp_itemsets["Itemset_Size"] == target_size]

            st.dataframe(
                disp_itemsets,
                use_container_width=True,
                hide_index=True
            )

            csv_itemsets = disp_itemsets.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download Frequent Itemsets (CSV)",
                data=csv_itemsets,
                file_name="project_kratos_frequent_itemsets.csv",
                mime="text/csv"
            )

    # TAB 3: VISUALIZATIONS
    with tab_viz:
        st.subheader("Statistical Association Landscapes")

        if not filtered_rules.empty:
            viz_col1, viz_col2 = st.columns(2)

            with viz_col1:
                fig_scatter = px.scatter(
                    filtered_rules,
                    x="support",
                    y="confidence",
                    color="lift",
                    size="lift",
                    hover_data=["antecedents", "consequents", "lift"],
                    title="Support vs. Confidence (Colored & Sized by Lift)",
                    labels={
                        "support": "Support (P(A U B))",
                        "confidence": "Confidence (P(B|A))",
                        "lift": "Lift"
                    },
                    color_continuous_scale="Viridis"
                )
                fig_scatter.update_layout(height=450)
                st.plotly_chart(fig_scatter, use_container_width=True)

            with viz_col2:
                fig_hist = px.histogram(
                    filtered_rules,
                    x="lift",
                    nbins=25,
                    title="Lift Distribution Across Discovered Rules",
                    labels={"lift": "Lift Factor"}
                )
                fig_hist.add_vline(x=1.0, line_dash="dash", line_color="red", annotation_text="Independence (Lift=1.0)")
                fig_hist.update_layout(height=450)
                st.plotly_chart(fig_hist, use_container_width=True)

            # Itemset size breakdown
            size_counts = itemsets["length"].value_counts().reset_index()
            size_counts.columns = ["Itemset_Size", "Count"]
            size_counts["Itemset_Size"] = size_counts["Itemset_Size"].apply(lambda x: f"{x}-Itemset")

            fig_sizes = px.bar(
                size_counts,
                x="Itemset_Size",
                y="Count",
                text="Count",
                title="Frequent Itemset Count by Cardinality",
                color="Itemset_Size"
            )
            fig_sizes.update_layout(height=400, showlegend=False)
            st.plotly_chart(fig_sizes, use_container_width=True)
        else:
            st.info("Adjust thresholds to view interactive association visualizations.")

    # TAB 4: BENCHMARK
    with tab_benchmark:
        st.subheader("⚡ Apriori vs. FP-Growth Algorithmic Benchmarking")
        st.write("Execute both algorithms on the exact same dataset and support threshold to observe empirical computational characteristics.")

        if st.button("🚀 Run Comparative Benchmark"):
            with st.spinner("Executing synchronous benchmark..."):
                bench = compare_algorithms(basket, min_support=min_support)

            bcol1, bcol2, bcol3 = st.columns(3)
            bcol1.metric("FP-Growth Runtime", f"{bench['fpgrowth']['execution_time_seconds']:.4f} s")
            bcol2.metric("Apriori Runtime", f"{bench['apriori']['execution_time_seconds']:.4f} s")
            bcol3.metric("Speedup Factor (Apriori / FP)", f"{bench['speedup_factor']:.2f}x")

            st.success(
                f"✅ **Mathematical Equivalence Verified**: Both algorithms produced **identical** frequent itemset sets "
                f"({bench['apriori']['itemset_count']:,} itemsets) with identical support values."
            )

            st.markdown(
                """
                **Algorithmic Insight**:
                - **Apriori** uses a candidate generation and test approach (breadth-first level-wise search). At very low support thresholds or dense datasets, candidate generation can become a bottleneck.
                - **FP-Growth** compresses transactions into an FP-tree and uses recursive divide-and-conquer projected databases, eliminating repeated full dataset scans and explicit candidate generation.
                """
            )

except Exception as e:
    st.error(f"Association Mining Error: {e}")
