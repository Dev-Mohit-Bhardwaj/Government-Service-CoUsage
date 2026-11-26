"""
Unit tests for Association Mining module (Project KRATOS).
Verifies Apriori, FP-Growth, H-Mine, and ECLAT implementations, edge cases,
validations, and 4-way algorithm equivalence.
"""

import pytest
import pandas as pd
from modules.association_mining import (
    run_apriori,
    run_fpgrowth,
    run_hmine,
    run_eclat,
    run_algorithm,
    compare_algorithms,
    benchmark_support_sweep,
    format_itemsets_with_names,
    validate_mining_parameters,
)


@pytest.fixture
def sample_basket():
    """Synthetic small basket for deterministic verification."""
    return pd.DataFrame({
        "S01": [1, 1, 1, 0, 1, 1],
        "S02": [1, 1, 0, 1, 1, 0],
        "S03": [0, 1, 1, 1, 0, 1],
        "S04": [0, 0, 0, 1, 0, 0],
    })


@pytest.fixture
def sample_catalogue():
    return pd.DataFrame({
        "Service_ID": ["S01", "S02", "S03", "S04"],
        "Service_Name": ["Scholarship", "Registration", "Income Cert", "Pension"],
        "Category": ["Education", "Education", "Revenue", "Social Welfare"]
    })


def test_validation_invalid_support(sample_basket):
    """Verify validation flags out-of-bounds min_support."""
    with pytest.raises(ValueError, match="strictly between 0 and 1"):
        validate_mining_parameters(sample_basket, min_support=0.0)

    with pytest.raises(ValueError, match="strictly between 0 and 1"):
        validate_mining_parameters(sample_basket, min_support=1.5)

    with pytest.raises(ValueError, match="strictly between 0 and 1"):
        validate_mining_parameters(sample_basket, min_support=-0.1)

    with pytest.raises(ValueError, match="numeric value"):
        validate_mining_parameters(sample_basket, min_support="high")


def test_validation_invalid_max_len(sample_basket):
    """Verify validation flags non-positive or invalid max_len."""
    with pytest.raises(ValueError, match="positive integer"):
        validate_mining_parameters(sample_basket, min_support=0.1, max_len=0)

    with pytest.raises(ValueError, match="positive integer"):
        validate_mining_parameters(sample_basket, min_support=0.1, max_len="two")


def test_validation_invalid_basket():
    """Verify validation flags empty or non-DataFrame basket."""
    with pytest.raises(ValueError, match="non-empty pandas DataFrame"):
        validate_mining_parameters(None, min_support=0.1)

    with pytest.raises(ValueError, match="cannot be empty"):
        validate_mining_parameters(pd.DataFrame(), min_support=0.1)


def test_four_algorithm_equivalence(sample_basket):
    """Verify Apriori, FP-Growth, H-Mine, and ECLAT produce identical itemsets & supports."""
    ap_res = run_apriori(sample_basket, min_support=0.3)
    fp_res = run_fpgrowth(sample_basket, min_support=0.3)
    hm_res = run_hmine(sample_basket, min_support=0.3)
    ec_res = run_eclat(sample_basket, min_support=0.3)

    for res in (ap_res, fp_res, hm_res, ec_res):
        assert not res.empty
        assert len(res) == len(ap_res)
        assert list(res.columns) == ["support", "itemsets", "length"]

    ap_map = dict(zip(ap_res["itemsets"], ap_res["support"]))
    for res in (fp_res, hm_res, ec_res):
        res_map = dict(zip(res["itemsets"], res["support"]))
        assert set(res_map.keys()) == set(ap_map.keys())
        for iset, supp in ap_map.items():
            assert res_map[iset] == pytest.approx(supp, abs=1e-9)


def test_empty_results_high_threshold(sample_basket):
    """Verify handling when no itemsets meet the threshold across all 4 algorithms."""
    for algo in ("apriori", "fpgrowth", "hmine", "eclat"):
        res = run_algorithm(algo, sample_basket, min_support=0.99)
        assert res.empty
        assert list(res.columns) == ["support", "itemsets", "length"]


def test_max_len_constraint(sample_basket):
    """Verify max_len limits the maximum itemset size across all 4 algorithms."""
    for algo in ("apriori", "fpgrowth", "hmine", "eclat"):
        res_1 = run_algorithm(algo, sample_basket, min_support=0.2, max_len=1)
        assert (res_1["length"] <= 1).all()

        res_2 = run_algorithm(algo, sample_basket, min_support=0.2, max_len=2)
        assert (res_2["length"] <= 2).all()


def test_eclat_without_colnames(sample_basket):
    """Verify ECLAT supports use_colnames=False returning integer column indices."""
    ec_idx = run_eclat(sample_basket, min_support=0.3, use_colnames=False)
    ap_idx = run_apriori(sample_basket, min_support=0.3, use_colnames=False)
    assert set(ec_idx["itemsets"]) == set(ap_idx["itemsets"])


def test_unsupported_algorithm_raises(sample_basket):
    """Verify invalid algorithm key raises ValueError."""
    with pytest.raises(ValueError, match="Unsupported algorithm"):
        run_algorithm("invalid_algo", sample_basket, min_support=0.3)


def test_compare_algorithms(sample_basket):
    """Verify 4-way algorithm comparison metrics, memory stats, and equivalence."""
    comp = compare_algorithms(
        sample_basket,
        min_support=0.3,
        min_confidence=0.5,
        min_lift=1.0,
        include_sweep=True
    )

    assert comp["identical_itemsets"] is True
    assert comp["identical_rules"] is True
    assert comp["identical_results"] is True
    assert comp["algorithm_order"] == ["apriori", "fpgrowth", "hmine", "eclat"]
    assert comp["fastest_algorithm"] in comp["algorithm_order"]

    for key in ("apriori", "fpgrowth", "hmine", "eclat"):
        algo_stats = comp[key]
        assert "execution_time_seconds" in algo_stats
        assert "peak_memory_kb" in algo_stats
        assert "speedup_vs_apriori" in algo_stats
        assert "rank_by_speed" in algo_stats
        assert algo_stats["itemset_count"] == comp["apriori"]["itemset_count"]
        assert algo_stats["rules_generated_count"] == comp["apriori"]["rules_generated_count"]

    assert "support_sweep" in comp
    assert len(comp["support_sweep"]) == 5


def test_benchmark_support_sweep(sample_basket):
    """Verify custom threshold sweep returns rows for each threshold."""
    sweep = benchmark_support_sweep(sample_basket, thresholds=[0.5, 0.3])
    assert len(sweep) == 2
    assert sweep[0]["min_support"] == 0.5
    assert sweep[1]["min_support"] == 0.3
    for row in sweep:
        for key in ("apriori", "fpgrowth", "hmine", "eclat"):
            assert key in row


def test_format_itemsets_with_names(sample_basket, sample_catalogue):
    """Verify formatting replaces IDs with readable names and computes counts."""
    ap_res = run_apriori(sample_basket, min_support=0.3)
    formatted = format_itemsets_with_names(ap_res, sample_catalogue, total_journeys=6)

    assert not formatted.empty
    assert "Itemset_Names" in formatted.columns
    assert "Estimated_Journeys" in formatted.columns
    assert "Support_Percentage" in formatted.columns
    # Check that service names appear in Itemset_Names
    all_names_text = " ".join(formatted["Itemset_Names"].tolist())
    assert "Scholarship" in all_names_text or "Registration" in all_names_text
