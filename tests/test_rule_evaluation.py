"""
Unit tests for Association Rule Evaluation module (Project KRATOS).
Verifies rule generation, metric calculations, filtering, survival percentage,
and edge handling.
"""

import pytest
import pandas as pd
from modules.association_mining import run_apriori
from modules.rule_evaluation import (
    generate_rules,
    calculate_lift_survival,
    filter_rules,
    format_rules_with_names,
    remove_redundant_rules
)


@pytest.fixture
def sample_basket():
    return pd.DataFrame({
        "S01": [1, 1, 1, 0, 1, 1, 0, 1],
        "S02": [1, 1, 0, 1, 1, 0, 0, 1],
        "S03": [0, 1, 1, 1, 0, 1, 1, 1],
        "S04": [0, 0, 0, 1, 0, 0, 0, 0],
    })


@pytest.fixture
def sample_catalogue():
    return pd.DataFrame({
        "Service_ID": ["S01", "S02", "S03", "S04"],
        "Service_Name": ["Scholarship", "Registration", "Income Cert", "Pension"],
        "Category": ["Education", "Education", "Revenue", "Social Welfare"]
    })


def test_generate_rules_valid(sample_basket):
    """Verify rule generation from itemsets."""
    itemsets = run_apriori(sample_basket, min_support=0.2)
    rules = generate_rules(itemsets, min_confidence=0.3)

    assert not rules.empty
    assert "support" in rules.columns
    assert "confidence" in rules.columns
    assert "lift" in rules.columns
    assert (rules["confidence"] >= 0.3).all()


def test_generate_rules_empty_itemsets():
    """Verify empty DataFrame returned when itemsets are empty or 1-item only."""
    empty_itemsets = pd.DataFrame(columns=["support", "itemsets", "length"])
    rules = generate_rules(empty_itemsets)
    assert rules.empty

    single_itemsets = pd.DataFrame({
        "support": [0.5, 0.4],
        "itemsets": [frozenset(["S01"]), frozenset(["S02"])],
        "length": [1, 1]
    })
    rules_single = generate_rules(single_itemsets)
    assert rules_single.empty


def test_calculate_lift_survival():
    """Verify Lift Filtering Survival Share calculations under various conditions."""
    df_rules = pd.DataFrame({
        "lift": [0.8, 1.2, 1.5, 2.0]
    })
    survival = calculate_lift_survival(df_rules, min_lift=1.0)
    assert survival["total_rules"] == 4
    assert survival["surviving_rules"] == 3
    assert survival["filtered_out_rules"] == 1
    assert survival["survival_percentage"] == 75.0

    # Test edge case: empty rules
    empty_survival = calculate_lift_survival(pd.DataFrame(), min_lift=1.0)
    assert empty_survival["total_rules"] == 0
    assert empty_survival["surviving_rules"] == 0
    assert empty_survival["survival_percentage"] == 0.0


def test_filter_rules(sample_basket):
    """Verify multi-criteria filtering."""
    itemsets = run_apriori(sample_basket, min_support=0.2)
    rules = generate_rules(itemsets, min_confidence=0.2)

    filtered = filter_rules(rules, min_confidence=0.6, min_lift=1.1, single_consequent_only=True)
    if not filtered.empty:
        assert (filtered["confidence"] >= 0.6).all()
        assert (filtered["lift"] >= 1.1).all()
        assert (filtered["consequents"].apply(len) == 1).all()


def test_format_rules_with_names(sample_basket, sample_catalogue):
    """Verify readable names, formatted rule strings, and metric columns."""
    itemsets = run_apriori(sample_basket, min_support=0.2)
    rules = generate_rules(itemsets, min_confidence=0.2)
    formatted = format_rules_with_names(rules, sample_catalogue)

    assert not formatted.empty
    assert "Rule" in formatted.columns
    assert "Antecedent_Names" in formatted.columns
    assert "Consequent_Names" in formatted.columns
    assert "->" in formatted["Rule"].iloc[0]


def test_remove_redundant_rules():
    """Verify redundant rules with superset antecedents and no confidence gain are pruned."""
    rules = pd.DataFrame({
        "antecedents": [frozenset(["S01"]), frozenset(["S01", "S02"])],
        "consequents": [frozenset(["S03"]), frozenset(["S03"])],
        "confidence": [0.80, 0.75],
        "support": [0.4, 0.3],
        "lift": [1.5, 1.4],
        "antecedent_len": [1, 2],
        "consequent_len": [1, 1]
    })
    pruned = remove_redundant_rules(rules)
    assert len(pruned) == 1
    assert frozenset(["S01"]) in pruned["antecedents"].values
