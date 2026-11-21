"""
Unit tests for Association Mining module (Project KRATOS).
Verifies Apriori and FP-Growth implementations, edge cases, validations,
and algorithm equivalence.
"""

import pytest
import pandas as pd
from modules.association_mining import (
    run_apriori,
    run_fpgrowth,
    compare_algorithms,
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


def test_apriori_fpgrowth_equivalence(sample_basket):
    """Verify Apriori and FP-Growth produce identical frequent itemsets."""
    ap_res = run_apriori(sample_basket, min_support=0.3)
    fp_res = run_fpgrowth(sample_basket, min_support=0.3)

    assert not ap_res.empty
    assert not fp_res.empty
    assert len(ap_res) == len(fp_res)

    ap_sets = set(ap_res["itemsets"])
    fp_sets = set(fp_res["itemsets"])
    assert ap_sets == fp_sets


def test_empty_results_high_threshold(sample_basket):
    """Verify handling when no itemsets meet the threshold."""
    ap_res = run_apriori(sample_basket, min_support=0.99)
    fp_res = run_fpgrowth(sample_basket, min_support=0.99)

    assert ap_res.empty
    assert fp_res.empty
    assert list(ap_res.columns) == ["support", "itemsets", "length"]
    assert list(fp_res.columns) == ["support", "itemsets", "length"]


def test_max_len_constraint(sample_basket):
    """Verify max_len limits the maximum itemset size."""
    ap_res = run_apriori(sample_basket, min_support=0.2, max_len=1)
    assert (ap_res["length"] <= 1).all()

    fp_res = run_fpgrowth(sample_basket, min_support=0.2, max_len=2)
    assert (fp_res["length"] <= 2).all()


def test_compare_algorithms(sample_basket):
    """Verify algorithm comparison metrics structure and execution."""
    comp = compare_algorithms(sample_basket, min_support=0.3)

    assert comp["identical_results"] is True
    assert "execution_time_seconds" in comp["apriori"]
    assert "execution_time_seconds" in comp["fpgrowth"]
    assert comp["apriori"]["itemset_count"] == comp["fpgrowth"]["itemset_count"]


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
