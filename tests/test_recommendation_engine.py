"""
Unit tests for Citizen Journey Recommendation Engine & Explanation Engine (Project KRATOS).
Verifies antecedent matching, already-selected exclusion, deduplication,
ranking, empty returns, and metric explanations.
"""

import pytest
import pandas as pd
from modules.recommendation_engine import recommend_services
from modules.explanation_engine import generate_recommendation_explanation, explain_all_recommendations


@pytest.fixture
def sample_catalogue():
    return pd.DataFrame({
        "Service_ID": ["S01", "S02", "S03", "S04", "S05"],
        "Service_Name": [
            "Scholarship Application",
            "Student Registration",
            "Income Certificate",
            "Aadhaar Verification",
            "Bank Account Verification"
        ],
        "Category": ["Education", "Education", "Revenue", "Identity", "Financial"],
        "Illustrative_Platform_ID": ["P01", "P01", "P02", "P03", "P04"]
    })


@pytest.fixture
def sample_rules():
    return pd.DataFrame({
        "antecedents": [
            frozenset(["S01"]),
            frozenset(["S01", "S03"]),
            frozenset(["S02"]),
            frozenset(["S04"])
        ],
        "consequents": [
            frozenset(["S03"]),
            frozenset(["S04"]),
            frozenset(["S01"]),
            frozenset(["S05"])
        ],
        "support": [0.14, 0.10, 0.08, 0.18],
        "confidence": [0.75, 0.88, 0.60, 0.80],
        "lift": [2.8, 3.5, 2.1, 1.9]
    })


def test_single_selected_service(sample_rules, sample_catalogue):
    """Verify recommendations when a single service is selected."""
    recs = recommend_services(
        selected_service_ids=["S01"],
        rules_df=sample_rules,
        service_catalogue=sample_catalogue
    )
    assert len(recs) == 1
    assert recs[0]["recommended_service_id"] == "S03"
    assert recs[0]["recommended_service_name"] == "Income Certificate"
    assert recs[0]["rank"] == 1


def test_multiple_selected_services_and_multi_item_antecedents(sample_rules, sample_catalogue):
    """Verify multi-item antecedent matching when user selects multiple services."""
    recs = recommend_services(
        selected_service_ids=["S01", "S03"],
        rules_df=sample_rules,
        service_catalogue=sample_catalogue
    )
    # S01 -> S03 is excluded because S03 is already selected!
    # {S01, S03} -> S04 matches!
    rec_ids = [r["recommended_service_id"] for r in recs]
    assert "S04" in rec_ids
    assert "S03" not in rec_ids  # Already selected service excluded!
    assert "S01" not in rec_ids  # Already selected service excluded!


def test_exclusion_of_already_selected_services(sample_rules, sample_catalogue):
    """Verify that any service in the user's selected list is never recommended."""
    recs = recommend_services(
        selected_service_ids=["S01", "S03", "S04"],
        rules_df=sample_rules,
        service_catalogue=sample_catalogue
    )
    rec_ids = [r["recommended_service_id"] for r in recs]
    assert "S01" not in rec_ids
    assert "S03" not in rec_ids
    assert "S04" not in rec_ids


def test_duplicate_recommendation_prevention(sample_catalogue):
    """Verify duplicate recommendations are merged and the best rule is chosen."""
    rules_with_dups = pd.DataFrame({
        "antecedents": [
            frozenset(["S01"]),
            frozenset(["S02"])
        ],
        "consequents": [
            frozenset(["S04"]),  # recommended with conf 0.65
            frozenset(["S04"])   # recommended with conf 0.85
        ],
        "support": [0.10, 0.12],
        "confidence": [0.65, 0.85],
        "lift": [1.5, 2.0]
    })
    recs = recommend_services(
        selected_service_ids=["S01", "S02"],
        rules_df=rules_with_dups,
        service_catalogue=sample_catalogue
    )
    assert len(recs) == 1
    assert recs[0]["recommended_service_id"] == "S04"
    assert recs[0]["confidence"] == 0.85  # Picked the stronger rule


def test_no_matching_rules(sample_rules, sample_catalogue):
    """Verify graceful handling when no rule antecedents match selected services."""
    recs = recommend_services(
        selected_service_ids=["S05"],  # No rule has S05 as antecedent in sample_rules
        rules_df=sample_rules,
        service_catalogue=sample_catalogue
    )
    assert recs == []


def test_empty_selected_services(sample_rules, sample_catalogue):
    """Verify empty input returns empty list."""
    assert recommend_services([], sample_rules, sample_catalogue) == []


def test_explanation_generation(sample_rules, sample_catalogue):
    """Verify that explanation engine formats actual metrics and includes disclaimers."""
    recs = recommend_services(
        selected_service_ids=["S01"],
        rules_df=sample_rules,
        service_catalogue=sample_catalogue
    )
    explained = explain_all_recommendations(recs)
    assert len(explained) == 1

    exp = explained[0]["explanation"]
    assert "summary" in exp
    assert "metric_rationale" in exp
    assert "governance_insight" in exp
    assert "disclaimer" in exp

    # Check that actual metrics are present
    assert "75" in exp["metric_rationale"] or "75.0" in exp["metric_rationale"]
    assert "2.8" in exp["metric_rationale"]
    # Check that non-causal disclaimer is present
    assert "Non-causal" in exp["disclaimer"]
