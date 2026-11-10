from itertools import combinations
from collections import Counter

import pandas as pd


def get_service_distribution(journey_services):

    service_distribution = (
        journey_services
        .groupby(["Service_ID", "Service_Name", "Category"])
        ["Journey_ID"]
        .nunique()
        .reset_index(name="Journey_Count")
    )

    total_journeys = journey_services["Journey_ID"].nunique()

    service_distribution["Percentage"] = (
        service_distribution["Journey_Count"] / total_journeys
    ) * 100

    return service_distribution.sort_values(
        by="Journey_Count",
        ascending=False
    )


def get_journey_length_distribution(journeys):

    distribution = (
        journeys["Service_Count"]
        .value_counts()
        .sort_index()
        .reset_index()
    )

    distribution.columns = ["Number_of_Services", "Journey_Count"]

    return distribution


def get_frequent_service_pairs(journey_services):

    pair_counter = Counter()

    for journey_id, group in journey_services.groupby("Journey_ID"):

        services = sorted(group["Service_Name"].unique())

        for pair in combinations(services, 2):
            pair_counter[pair] += 1

    pairs = pd.DataFrame(
        [
            {
                "Service_1": pair[0],
                "Service_2": pair[1],
                "Journey_Count": count
            }
            for pair, count in pair_counter.items()
        ]
    )

    if pairs.empty:
        return pairs

    return pairs.sort_values(
        by="Journey_Count",
        ascending=False
    ).reset_index(drop=True)


def get_category_distribution(service_catalogue):

    return (
        service_catalogue
        .groupby("Category")
        .size()
        .reset_index(name="Number_of_Services")
        .sort_values(
            by="Number_of_Services",
            ascending=False
        )
    )


def get_synthetic_pattern_distribution(journeys):

    return (
        journeys["Journey_Type_Synthetic"]
        .value_counts()
        .reset_index()
    ).rename(
        columns={
            "Journey_Type_Synthetic": "Journey_Type",
            "count": "Journey_Count"
        }
    )