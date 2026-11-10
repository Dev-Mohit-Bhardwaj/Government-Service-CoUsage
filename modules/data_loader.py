import pandas as pd

from config import (
    JOURNEYS_FILE,
    LONG_DATA_FILE,
    BASKET_FILE,
    SERVICE_CATALOGUE_FILE
)


def load_csv(file_path):
    """
    Loads a CSV file and returns a Pandas DataFrame.
    """

    if not file_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {file_path}"
        )

    return pd.read_csv(file_path)


def load_all_datasets():
    """
    Loads all primary project datasets.
    """

    datasets = {
        "journeys": load_csv(JOURNEYS_FILE),

        "long_data": load_csv(LONG_DATA_FILE),

        "basket": load_csv(BASKET_FILE),

        "services": load_csv(SERVICE_CATALOGUE_FILE)
    }

    return datasets