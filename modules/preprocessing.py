import pandas as pd


def prepare_basket_data(basket):

    if "Journey_ID" not in basket.columns:
        raise ValueError("Journey_ID column is missing.")

    if basket["Journey_ID"].duplicated().any():
        raise ValueError("Duplicate Journey_ID values found.")

    service_columns = [
        col for col in basket.columns
        if col != "Journey_ID"
    ]

    if len(service_columns) < 2:
        raise ValueError("Insufficient service columns.")

    prepared_basket = basket[service_columns].copy()

    if prepared_basket.isnull().any().any():
        raise ValueError("Missing values found in basket data.")

    for column in service_columns:

        if not prepared_basket[column].isin([0, 1]).all():
            raise ValueError(
                f"Non-binary values found in {column}."
            )

    prepared_basket = prepared_basket.astype(int)

    return prepared_basket