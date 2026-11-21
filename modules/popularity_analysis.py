import pandas as pd


def calculate_service_popularity(
    journey_services,
    service_catalogue,
    total_journeys
):
    """
    Calculate the popularity of each service based on
    the percentage of unique journeys containing it.
    """

    # 1. Validate required columns

    required_journey_columns = [
        "Journey_ID",
        "Service_ID"
    ]

    required_catalogue_columns = [
        "Service_ID",
        "Service_Name",
        "Category"
    ]

    for column in required_journey_columns:
        if column not in journey_services.columns:
            raise ValueError(
                f"Missing column in journey data: {column}"
            )

    for column in required_catalogue_columns:
        if column not in service_catalogue.columns:
            raise ValueError(
                f"Missing column in service catalogue: {column}"
            )

    # 2. Validate total journeys

    if (
        not isinstance(total_journeys, int)
        or isinstance(total_journeys, bool)
        or total_journeys <= 0
    ):
        raise ValueError("Total journeys must be a positive integer.")

    # 3. Check duplicate service IDs in catalogue

    if service_catalogue["Service_ID"].duplicated().any():
        raise ValueError("Duplicate Service_ID in service catalogue.")

    # 4. Check for unknown services

    known_services = set(service_catalogue["Service_ID"])
    observed_services = set(journey_services["Service_ID"])

    unknown_services = observed_services - known_services

    if unknown_services:
        raise ValueError(
            f"Unknown Service IDs found: {unknown_services}"
        )

    # 5. Count unique journeys for every service

    popularity = (
        journey_services
        .groupby("Service_ID")["Journey_ID"]
        .nunique()
        .reset_index(name="Journey_Count")
    )

    # 6. Include all catalogue services, even unused ones

    popularity = service_catalogue[
        ["Service_ID", "Service_Name", "Category"]
    ].merge(
        popularity,
        on="Service_ID",
        how="left"
    )

    popularity["Journey_Count"] = (
        popularity["Journey_Count"]
        .fillna(0)
        .astype(int)
    )

    # 7. Calculate popularity percentage

    popularity["Popularity_Percentage"] = (
        popularity["Journey_Count"] / total_journeys
    ) * 100

    # 8. Calculate ranking

    popularity = popularity.sort_values(
        by=["Journey_Count", "Service_Name"],
        ascending=[False, True]
    ).reset_index(drop=True)

    popularity["Rank"] = range(1, len(popularity) + 1)

    return popularity