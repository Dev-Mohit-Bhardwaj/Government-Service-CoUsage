# Project KRATOS — Data Dictionary

This document details the schema, data types, constraints, and operational context for all datasets used within **Project KRATOS: Government Service Intelligence & Recommendation System**.

> **CRITICAL DATASET NOTICE & LIMITATIONS**  
> All data in this repository is **synthetic and simulated** (generated using controlled mixture weights, predefined domain patterns, and a 12% noise rate).  
> - **Not Real Citizen Behavior**: Findings must never be presented as empirical citizen activity.  
> - **Illustrative Platforms**: Platform IDs (`P01`–`P16`) are illustrative placeholders and do not correspond to actual operational infrastructure.  
> - **No Temporal Sequencing**: Journeys do not record timestamps or event sequences. Models discover **co-usage associations**, not chronological next-step transitions.  
> - **Non-Causal**: Correlation and association rules must not be interpreted causally.  
> - **Unsupervised Isolation**: `Journey_Type_Synthetic` is synthetic generation metadata and is strictly excluded from association rule mining inputs.

---

## 1. Primary Datasets

### A. `citizen_journeys.csv`
Summary level representation: one record per citizen journey.

| Field Name | Type | Description | Example / Domain |
|:---|:---|:---|:---|
| `Journey_ID` | `String` | Unique alphanumeric identifier for each journey | `J00001` to `J20000` |
| `Journey_Type_Synthetic` | `String` | Synthetic pattern category used during dataset generation | e.g. `Education_Scholarship`, `Pension_Support` |
| `Service_Count` | `Integer` | Total number of distinct services used in this journey | Range: 1 to 9 (Mean: ~3.84) |
| `Services_Pipe_Separated` | `String` | Pipe-separated list of service names used | `Aadhaar Verification\|Health Scheme Registration...` |
| `Service_IDs_Pipe_Separated`| `String` | Pipe-separated list of service IDs used | `S05\|S21\|S22` |

---

### B. `journey_services_long.csv`
Normalized long-format table: one record per journey-service interaction (76,765 rows).

| Field Name | Type | Description | Example / Domain |
|:---|:---|:---|:---|
| `Journey_ID` | `String` | Reference to citizen journey | Foreign key to `citizen_journeys.csv` |
| `Service_ID` | `String` | Identifier of the service utilized | `S01` through `S30` |
| `Service_Name` | `String` | Human-readable name of the service | `Scholarship Application`, `Income Certificate` |
| `Category` | `String` | Functional domain of the service | `Education`, `Revenue`, `Identity`, etc. |
| `Illustrative_Platform_ID` | `String` | Synthetic host platform identifier | `P01` through `P16` |

---

### C. `basket_onehot.csv`
Binary matrix representation: one record per journey with 30 binary indicators.

| Field Name | Type | Description | Example / Domain |
|:---|:---|:---|:---|
| `Journey_ID` | `String` | Unique identifier for the journey | `J00001` to `J20000` |
| `S01` to `S30` | `Integer (0/1)` | Binary indicator: `1` if service was used, `0` otherwise | `1` or `0` |

---

### D. `service_catalogue.csv`
Master catalogue of 30 illustrative government services.

| Field Name | Type | Description | Example / Domain |
|:---|:---|:---|:---|
| `Service_ID` | `String` | Unique primary key for the service | `S01` to `S30` |
| `Service_Name` | `String` | Full service title | `Aadhaar Verification` |
| `Category` | `String` | Administrative domain / category | `Identity`, `Revenue`, `Education`, etc. |
| `Illustrative_Platform_ID` | `String` | Illustrative platform mapping | `P01` to `P16` |
| `Illustrative_Platform_Name`| `String` | Human-readable illustrative platform label | `Illustrative Platform 03` |
| `Platform_Note` | `String` | Compliance note reiterating synthetic nature | Disclaimers on placeholder mappings |

---

## 2. Synthetic Generation Metadata

- **`synthetic_pattern_assumptions.csv`**: Contains the 8 predefined domain patterns, their mixture weights (e.g. `Education_Scholarship: 0.18`), and the conditional probabilities of services appearing within each pattern.
- **`generation_config.json`**: Parameters used during synthetic data synthesis (seed: `20261107`, noise rate: `0.12`, min services: `1`, max services: `9`).
- **`dataset_summary.json`**: Aggregate statistics of generated journeys (20,000 journeys, 30 services, 76,765 journey-service records).
