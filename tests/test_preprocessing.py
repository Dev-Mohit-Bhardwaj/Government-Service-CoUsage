"""
Unit tests for data preprocessing module (Project KRATOS).
Tests prepare_basket_data validations and transformations.
"""

import pytest
import pandas as pd
from modules.preprocessing import prepare_basket_data


@pytest.fixture
def sample_valid_basket():
    return pd.DataFrame({
        "Journey_ID": ["J001", "J002", "J003"],
        "S01": [1, 0, 1],
        "S02": [0, 1, 1],
        "S03": [1, 1, 0]
    })


def test_prepare_basket_data_valid(sample_valid_basket):
    """Verify standard basket data is prepared correctly."""
    prepared = prepare_basket_data(sample_valid_basket)
    assert "Journey_ID" not in prepared.columns
    assert list(prepared.columns) == ["S01", "S02", "S03"]
    assert prepared.shape == (3, 3)
    assert (prepared.dtypes == int).all()


def test_prepare_basket_missing_journey_id():
    """Verify error when Journey_ID column is absent."""
    df = pd.DataFrame({
        "S01": [1, 0],
        "S02": [0, 1]
    })
    with pytest.raises(ValueError, match="Journey_ID column is missing"):
        prepare_basket_data(df)


def test_prepare_basket_duplicate_journey_id():
    """Verify error when duplicate Journey_ID values exist."""
    df = pd.DataFrame({
        "Journey_ID": ["J001", "J001"],
        "S01": [1, 0],
        "S02": [0, 1]
    })
    with pytest.raises(ValueError, match="Duplicate Journey_ID values found"):
        prepare_basket_data(df)


def test_prepare_basket_insufficient_services():
    """Verify error when fewer than 2 service columns are present."""
    df = pd.DataFrame({
        "Journey_ID": ["J001", "J002"],
        "S01": [1, 0]
    })
    with pytest.raises(ValueError, match="Insufficient service columns"):
        prepare_basket_data(df)


def test_prepare_basket_missing_values():
    """Verify error when null / NaN values are present in basket."""
    df = pd.DataFrame({
        "Journey_ID": ["J001", "J002"],
        "S01": [1, None],
        "S02": [0, 1]
    })
    with pytest.raises(ValueError, match="Missing values found"):
        prepare_basket_data(df)


def test_prepare_basket_non_binary_values():
    """Verify error when non-binary values (e.g. 2, -1, 'yes') are present."""
    df = pd.DataFrame({
        "Journey_ID": ["J001", "J002"],
        "S01": [1, 2],
        "S02": [0, 1]
    })
    with pytest.raises(ValueError, match="Non-binary values found"):
        prepare_basket_data(df)
