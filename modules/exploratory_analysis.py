"""
Exploratory Data Analysis Module (Project KRATOS)

Provides backward-compatible and standard exports for exploratory data analysis functions.
"""

from modules.exploratory_data_analysis import (
    get_service_distribution,
    get_journey_length_distribution,
    get_frequent_service_pairs,
    get_category_distribution,
    get_synthetic_pattern_distribution,
)

__all__ = [
    "get_service_distribution",
    "get_journey_length_distribution",
    "get_frequent_service_pairs",
    "get_category_distribution",
    "get_synthetic_pattern_distribution",
]
