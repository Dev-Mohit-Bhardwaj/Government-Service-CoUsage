"""
Unit tests for Integration Opportunity Analyzer module (Project KRATOS).
Verifies multi-criteria scoring, cross-platform and cross-category detection,
metadata mapping, and ranking.
"""

import pytest
import pandas as pd
from modules.integration_analyzer import analyze_integration_opportunities, DEFAULT_WEIGHTS


@pytest.fixture
def sample_catalogue():
    return pd.DataFrame({
        "Service_ID": ["S01", "S02", "S03", "S04"],
        "Service_Name": [
            "Scholarship Application",
            "Student Registration",
            "Income Certificate",
            "Aadhaar Verification"
        ],
        "Category": ["Education", "Education", "Revenue", "Identity"],
        "Illustrative_Platform_ID": ["P01", "P01", "P02", "P03"]
    })


@pytest.fixture
def sample_rules():
    return pd.DataFrame({
        "antecedents": [
            frozenset(["S01"]),
            frozenset(["S01"]),
            frozenset(["S01", "S02"])
        ],
        "consequents": [
            frozenset(["S02"]),  # Intra-category, intra-platform
            frozenset(["S03"]),  # Cross-category, cross-platform
            frozenset(["S04"])   # Cross-category, cross-platform, multi-antecedent
        ],
        "support": [0.15, 0.20, 0.12],
        "confidence": [0.70, 0.85, 0.90],
        "lift": [2.5, 3.2, 4.0]
    })


def test_integration_analyzer_ranking_and_bounds(sample_rules, sample_catalogue):
    """Verify opportunities are correctly ranked 1..N and scores bounded in [0, 100]."""
    opps = analyze_integration_opportunities(sample_rules, sample_catalogue)

    assert not opps.empty
    assert len(opps) == 3
    assert list(opps["Rank"]) == [1, 2, 3]
    assert (opps["Opportunity_Score"] >= 0).all()
    assert (opps["Opportunity_Score"] <= 100).all()
    # Rank 1 score >= Rank 2 score
    assert opps.iloc[0]["Opportunity_Score"] >= opps.iloc[1]["Opportunity_Score"]


def test_cross_category_and_platform_detection(sample_rules, sample_catalogue):
    """Verify cross-category and cross-platform flags are correctly identified."""
    opps = analyze_integration_opportunities(sample_rules, sample_catalogue)

    # S01 -> S02 is Education -> Education, P01 -> P01 (both False)
    intra = opps[opps["Antecedent_Services"] == "Scholarship Application"].loc[
        opps["Consequent_Services"] == "Student Registration"
    ].iloc[0]
    assert not intra["Is_Cross_Category"]
    assert not intra["Is_Cross_Platform"]

    # S01 -> S03 is Education -> Revenue, P01 -> P02 (both True)
    cross = opps[opps["Antecedent_Services"] == "Scholarship Application"].loc[
        opps["Consequent_Services"] == "Income Certificate"
    ].iloc[0]
    assert cross["Is_Cross_Category"] is True or cross["Is_Cross_Category"] == True
    assert cross["Is_Cross_Platform"] is True or cross["Is_Cross_Platform"] == True


def test_custom_weights(sample_rules, sample_catalogue):
    """Verify custom weights alter scoring appropriately."""
    heavy_lift_weights = {
        "confidence": 0.05,
        "lift": 0.80,
        "support": 0.05,
        "cross_platform": 0.05,
        "cross_category": 0.05
    }
    opps = analyze_integration_opportunities(
        sample_rules, sample_catalogue, weights=heavy_lift_weights
    )
    # The rule with highest lift (4.0) should be ranked #1
    assert opps.iloc[0]["Lift"] == 4.0


def test_empty_rules_handling(sample_catalogue):
    """Verify empty rules input returns empty DataFrame with expected schema."""
    empty_opps = analyze_integration_opportunities(pd.DataFrame(), sample_catalogue)
    assert empty_opps.empty
    assert "Opportunity_Score" in empty_opps.columns
    assert "Rank" in empty_opps.columns


def test_missing_metadata_handling(sample_rules):
    """Verify handling when service catalogue is missing certain services."""
    sparse_catalogue = pd.DataFrame({
        "Service_ID": ["S01"],
        "Service_Name": ["Scholarship"],
        "Category": ["Education"],
        "Illustrative_Platform_ID": ["P01"]
    })
    # S02, S03, S04 missing from catalogue
    opps = analyze_integration_opportunities(sample_rules, sparse_catalogue)
    assert not opps.empty
    # Doesn't crash, fills with fallbacks
    assert "Opportunity_Score" in opps.columns
