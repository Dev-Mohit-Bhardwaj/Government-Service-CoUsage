import pandas as pd
import pytest

from modules.popularity_analysis import calculate_service_popularity


@pytest.fixture
def sample_data():

    journey_services = pd.DataFrame({
        "Journey_ID": ["J1", "J1", "J2", "J3", "J3"],
        "Service_ID": ["S01", "S02", "S01", "S02", "S03"]
    })

    service_catalogue = pd.DataFrame({
        "Service_ID": ["S01", "S02", "S03", "S04"],
        "Service_Name": [
            "Scholarship",
            "Income Certificate",
            "Aadhaar",
            "Pension"
        ],
        "Category": [
            "Education",
            "Documentation",
            "Identity",
            "Social Welfare"
        ]
    })

    return journey_services, service_catalogue


def test_popularity_calculation(sample_data):

    journey_services, catalogue = sample_data

    result = calculate_service_popularity(
        journey_services,
        catalogue,
        total_journeys=3
    )

    s01 = result[result["Service_ID"] == "S01"].iloc[0]

    assert s01["Journey_Count"] == 2
    assert round(s01["Popularity_Percentage"], 2) == 66.67


def test_zero_usage_service(sample_data):

    journey_services, catalogue = sample_data

    result = calculate_service_popularity(
        journey_services,
        catalogue,
        total_journeys=3
    )

    s04 = result[result["Service_ID"] == "S04"].iloc[0]

    assert s04["Journey_Count"] == 0
    assert s04["Popularity_Percentage"] == 0


def test_ranking(sample_data):

    journey_services, catalogue = sample_data

    result = calculate_service_popularity(
        journey_services,
        catalogue,
        total_journeys=3
    )

    assert result.iloc[0]["Journey_Count"] >= result.iloc[1]["Journey_Count"]

    assert result.iloc[0]["Rank"] == 1

    assert result["Rank"].tolist() == [1, 2, 3, 4]


def test_invalid_total_journeys(sample_data):

    journey_services, catalogue = sample_data

    with pytest.raises(ValueError):

        calculate_service_popularity(
            journey_services,
            catalogue,
            total_journeys=0
        )


def test_unknown_service(sample_data):

    journey_services, catalogue = sample_data

    journey_services.loc[len(journey_services)] = ["J4", "S99"]

    with pytest.raises(ValueError):

        calculate_service_popularity(
            journey_services,
            catalogue,
            total_journeys=4
        )