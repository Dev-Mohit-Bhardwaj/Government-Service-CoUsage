from pathlib import Path

# Root directory of the project
BASE_DIR = Path(__file__).resolve().parent

# Main directories
DATASET_DIR = BASE_DIR / "Dataset"
OUTPUT_DIR = BASE_DIR / "outputs"

REPORTS_DIR = OUTPUT_DIR / "reports"
CHARTS_DIR = OUTPUT_DIR / "charts"
RULES_DIR = OUTPUT_DIR / "generated_rules"

# Dataset file paths
JOURNEYS_FILE = DATASET_DIR / "citizen_journeys.csv"

LONG_DATA_FILE = DATASET_DIR / "journey_services_long.csv"

BASKET_FILE = DATASET_DIR / "basket_onehot.csv"

SERVICE_CATALOGUE_FILE = DATASET_DIR / "service_catalogue.csv"

PATTERN_FILE = DATASET_DIR / "synthetic_pattern_assumptions.csv"

# Default algorithm parameters
DEFAULT_MIN_SUPPORT = 0.01
DEFAULT_MIN_CONFIDENCE = 0.30
DEFAULT_MIN_LIFT = 1.0

# Application information
APP_TITLE = "Government Service Co-Usage Discovery"

APP_DESCRIPTION = (
    "Discovering associations and integration opportunities "
    "across government digital services."
)