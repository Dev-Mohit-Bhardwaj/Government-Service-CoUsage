from pathlib import Path
import pandas as pd

from modules.exploratory_data_analysis import (
    get_service_distribution,
    get_journey_length_distribution,
    get_frequent_service_pairs,
    get_category_distribution,
    get_synthetic_pattern_distribution
)


# Load datasets
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "Dataset"

journeys = pd.read_csv(DATASET_DIR / "citizen_journeys.csv")
journey_services = pd.read_csv(
    DATASET_DIR / "journey_services_long.csv"
)
service_catalogue = pd.read_csv(
    DATASET_DIR / "service_catalogue.csv"
)


def test_service_distribution():

    result = get_service_distribution(journey_services)

    assert not result.empty
    assert "Service_Name" in result.columns
    assert "Journey_Count" in result.columns
    assert result["Journey_Count"].max() <= len(journeys)


def test_journey_length_distribution():

    result = get_journey_length_distribution(journeys)

    assert not result.empty
    assert result["Journey_Count"].sum() == len(journeys)


def test_frequent_service_pairs():

    result = get_frequent_service_pairs(journey_services)

    assert not result.empty
    assert "Service_1" in result.columns
    assert "Service_2" in result.columns

    assert result["Journey_Count"].max() <= len(journeys)


def test_category_distribution():

    result = get_category_distribution(service_catalogue)

    assert not result.empty
    assert result["Number_of_Services"].sum() == len(service_catalogue)


def test_synthetic_pattern_distribution():

    result = get_synthetic_pattern_distribution(journeys)

    assert not result.empty
    assert result["Journey_Count"].sum() == len(journeys)