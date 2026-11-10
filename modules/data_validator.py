import pandas as pd


def validate_datasets(datasets):

    journeys = datasets["journeys"]
    long_data = datasets["long_data"]
    basket = datasets["basket"]
    services = datasets["services"]

    results = []

    def add_result(name, passed, details):
        results.append({
            "Validation": name,
            "Status": "PASS" if passed else "FAIL",
            "Details": details
        })

    # -----------------------------------
    # 1. Missing Values
    # -----------------------------------

    missing_count = (
        journeys.isnull().sum().sum()
        + long_data.isnull().sum().sum()
        + basket.isnull().sum().sum()
        + services.isnull().sum().sum()
    )

    add_result(
        "Missing Values",
        missing_count == 0,
        f"{missing_count} missing values found"
    )

    # -----------------------------------
    # 2. Duplicate Journey IDs
    # -----------------------------------

    duplicate_journeys = journeys["Journey_ID"].duplicated().sum()

    add_result(
        "Duplicate Journeys",
        duplicate_journeys == 0,
        f"{duplicate_journeys} duplicate Journey IDs found"
    )

    # -----------------------------------
    # 3. Duplicate Journey-Service Pairs
    # -----------------------------------

    duplicate_pairs = long_data.duplicated(
        subset=["Journey_ID", "Service_ID"]
    ).sum()

    add_result(
        "Duplicate Service Records",
        duplicate_pairs == 0,
        f"{duplicate_pairs} duplicate records found"
    )

    # -----------------------------------
    # 4. Duplicate Service IDs
    # -----------------------------------

    duplicate_services = services["Service_ID"].duplicated().sum()

    add_result(
        "Duplicate Service IDs",
        duplicate_services == 0,
        f"{duplicate_services} duplicate Service IDs found"
    )

    # -----------------------------------
    # 5. Unknown Service IDs
    # -----------------------------------

    valid_services = set(services["Service_ID"])

    used_services = set(long_data["Service_ID"])

    unknown_services = used_services - valid_services

    add_result(
        "Unknown Service IDs",
        len(unknown_services) == 0,
        f"{len(unknown_services)} unknown services found"
    )

    # -----------------------------------
    # 6. Journey Service Count Consistency
    # -----------------------------------

    actual_counts = (
        long_data.groupby("Journey_ID")
        .size()
        .rename("Actual_Count")
    )

    expected_counts = journeys.set_index("Journey_ID")["Service_Count"]

    comparison = pd.concat(
        [expected_counts, actual_counts],
        axis=1
    )

    count_mismatches = (
        comparison["Service_Count"] != comparison["Actual_Count"]
    )

    # Missing counts also indicate inconsistency
    count_mismatches = count_mismatches | comparison[
        ["Service_Count", "Actual_Count"]
    ].isnull().any(axis=1)

    mismatch_count = int(count_mismatches.sum())

    add_result(
        "Journey Count Consistency",
        mismatch_count == 0,
        f"{mismatch_count} inconsistent journeys found"
    )

    # -----------------------------------
    # 7. Journey ID Consistency
    # -----------------------------------

    journey_ids = set(journeys["Journey_ID"])

    long_journey_ids = set(long_data["Journey_ID"])

    basket_journey_ids = set(basket["Journey_ID"])

    journey_consistency = (
        journey_ids == long_journey_ids == basket_journey_ids
    )

    add_result(
        "Journey ID Consistency",
        journey_consistency,
        "Journey IDs match across all datasets"
        if journey_consistency
        else "Journey IDs differ across datasets"
    )

    # -----------------------------------
    # 8. One-Hot Matrix Consistency
    # -----------------------------------

    service_columns = services["Service_ID"].tolist()

    missing_columns = set(service_columns) - set(basket.columns)

    if not missing_columns:

        reconstructed = pd.crosstab(
            long_data["Journey_ID"],
            long_data["Service_ID"]
        )

        reconstructed = reconstructed.reindex(
            index=basket["Journey_ID"],
            columns=service_columns,
            fill_value=0
        )

        original = basket.set_index("Journey_ID")[service_columns]

        try:
            reconstructed = reconstructed.astype(int)
            original = original.astype(int)

            onehot_consistency = (
                reconstructed.to_numpy() == original.to_numpy()
            ).all()

        except (ValueError, TypeError):
            onehot_consistency = False

    else:
        onehot_consistency = False

    add_result(
        "One-Hot Matrix Consistency",
        onehot_consistency,
        "Basket matrix matches long-format data"
        if onehot_consistency
        else "Basket matrix does not match long-format data"
    )

    return pd.DataFrame(results)