"""
Unit tests for data validator module (Project KRATOS).
Validates all 8 dataset quality and consistency checks.
"""

import pytest
import pandas as pd
from modules.data_loader import load_all_datasets
from modules.data_validator import validate_datasets


@pytest.fixture
def clean_datasets():
    """Loads a fresh copy of the primary datasets."""
    datasets = load_all_datasets()
    return {k: v.copy() for k, v in datasets.items()}


def test_clean_datasets_pass_all_checks(clean_datasets):
    """Verify that the uncorrupted project datasets pass all 8 validation checks."""
    results = validate_datasets(clean_datasets)
    assert len(results) == 8
    assert (results["Status"] == "PASS").all()


def test_missing_values_detected(clean_datasets):
    """Verify detection of missing values."""
    clean_datasets["journeys"].loc[0, "Service_Count"] = None
    results = validate_datasets(clean_datasets)
    check = results[results["Validation"] == "Missing Values"].iloc[0]
    assert check["Status"] == "FAIL"


def test_duplicate_journeys_detected(clean_datasets):
    """Verify detection of duplicate journey IDs."""
    dup_row = clean_datasets["journeys"].iloc[0:1].copy()
    clean_datasets["journeys"] = pd.concat([clean_datasets["journeys"], dup_row], ignore_index=True)
    results = validate_datasets(clean_datasets)
    check = results[results["Validation"] == "Duplicate Journeys"].iloc[0]
    assert check["Status"] == "FAIL"


def test_duplicate_pairs_detected(clean_datasets):
    """Verify detection of duplicate Journey-Service records."""
    dup_row = clean_datasets["long_data"].iloc[0:1].copy()
    clean_datasets["long_data"] = pd.concat([clean_datasets["long_data"], dup_row], ignore_index=True)
    results = validate_datasets(clean_datasets)
    check = results[results["Validation"] == "Duplicate Service Records"].iloc[0]
    assert check["Status"] == "FAIL"


def test_duplicate_services_detected(clean_datasets):
    """Verify detection of duplicate Service IDs in catalogue."""
    dup_row = clean_datasets["services"].iloc[0:1].copy()
    clean_datasets["services"] = pd.concat([clean_datasets["services"], dup_row], ignore_index=True)
    results = validate_datasets(clean_datasets)
    check = results[results["Validation"] == "Duplicate Service IDs"].iloc[0]
    assert check["Status"] == "FAIL"


def test_unknown_services_detected(clean_datasets):
    """Verify detection of services in journeys that are missing from catalogue."""
    clean_datasets["long_data"].loc[0, "Service_ID"] = "S999"
    results = validate_datasets(clean_datasets)
    check = results[results["Validation"] == "Unknown Service IDs"].iloc[0]
    assert check["Status"] == "FAIL"


def test_count_mismatch_detected(clean_datasets):
    """Verify detection of service count inconsistencies."""
    clean_datasets["journeys"].loc[0, "Service_Count"] += 5
    results = validate_datasets(clean_datasets)
    check = results[results["Validation"] == "Journey Count Consistency"].iloc[0]
    assert check["Status"] == "FAIL"


def test_journey_id_consistency_detected(clean_datasets):
    """Verify detection of inconsistent Journey IDs across tables."""
    clean_datasets["basket"] = clean_datasets["basket"].iloc[1:].copy()
    results = validate_datasets(clean_datasets)
    check = results[results["Validation"] == "Journey ID Consistency"].iloc[0]
    assert check["Status"] == "FAIL"


def test_onehot_matrix_inconsistency_detected(clean_datasets):
    """Verify detection of mismatch between basket one-hot matrix and long data."""
    first_service_col = clean_datasets["services"]["Service_ID"].iloc[0]
    # Flip a bit
    clean_datasets["basket"].loc[0, first_service_col] = 1 - clean_datasets["basket"].loc[0, first_service_col]
    results = validate_datasets(clean_datasets)
    check = results[results["Validation"] == "One-Hot Matrix Consistency"].iloc[0]
    assert check["Status"] == "FAIL"
