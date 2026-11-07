# Synthetic Government Service Co-Usage Dataset

## What this dataset is
This is a **synthetic teaching and prototyping dataset** containing 20,000 simulated journeys across 30 illustrative government-service categories.

It was generated to develop and test a pipeline for:
- transaction-basket construction
- Apriori and FP-Growth frequent-itemset mining
- support, confidence and lift calculation
- lift-based filtering
- service relationship visualization

## Critical limitation
These rows are **not real citizens, not real government transactions, and not measured Indian service usage**. The journey archetypes, mixture weights and service inclusion probabilities are explicit simulation assumptions. Results from this dataset must be described as simulated proof-of-concept findings only.

## Files
- `citizen_journeys.csv`: one row per synthetic journey; includes a synthetic journey-type label and pipe-separated service names/IDs.
- `journey_services_long.csv`: one row per journey-service pair; useful for analysis and database loading.
- `basket_onehot.csv`: one row per journey and one binary column per service; ready for Apriori/FP-Growth after dropping `Journey_ID`.
- `service_catalogue.csv`: service IDs, names, categories and **illustrative placeholder platform IDs**. Platform mapping is not real and must be replaced with verified platform metadata before making integration recommendations.
- `synthetic_pattern_assumptions.csv`: the probabilities used to construct each synthetic journey pattern. Use this as simulation ground truth for controlled validation, not as empirical evidence.
- `generation_config.json`: reproducibility configuration.
- `dataset_summary.json`: basic dataset statistics.
- `generate_dataset.py`: reproducible generator script.

## Recommended analysis
1. Load `basket_onehot.csv`.
2. Drop `Journey_ID` before passing the matrix to `mlxtend`.
3. Run Apriori and FP-Growth with documented thresholds.
4. Generate association rules and report support, confidence and lift.
5. Compare discovered patterns with `synthetic_pattern_assumptions.csv`.
6. Test sensitivity to different random seeds, noise rates and support thresholds.
7. Do not use `Journey_Type_Synthetic` as an input feature for association mining; it is metadata for validation only.

## Reproducibility
The generator uses NumPy's `default_rng` with seed 20261107. Running `python generate_dataset.py` recreates the CSV files.
