"""
Association Rule Mining Module (Project KRATOS)

Provides robust implementations of Apriori, FP-Growth, H-Mine, and ECLAT
algorithms, performance & memory benchmarking, threshold scalability sweeps,
and human-readable formatting for discovering frequent government service combinations.
"""

import time
import tracemalloc
from typing import Dict, Any, Optional, List, Tuple, Callable
import numpy as np
import pandas as pd
from mlxtend.frequent_patterns import apriori, fpgrowth, hmine


ALGORITHM_ORDER: Tuple[str, ...] = ("apriori", "fpgrowth", "hmine", "eclat")

ALGORITHM_PROFILES: Dict[str, Dict[str, str]] = {
    "apriori": {
        "name": "Apriori",
        "paradigm": "Level-Wise Candidate Generation",
        "data_layout": "Horizontal",
        "search_strategy": "Breadth-First (BFS)",
        "candidate_generation": "Yes (Join & Prune)",
        "dataset_scans": "Multiple (1 per k-level)",
    },
    "fpgrowth": {
        "name": "FP-Growth",
        "paradigm": "Compressed Prefix-Tree Growth",
        "data_layout": "Horizontal (FP-Tree)",
        "search_strategy": "Depth-First (DFS)",
        "candidate_generation": "No",
        "dataset_scans": "2 Passes",
    },
    "hmine": {
        "name": "H-Mine",
        "paradigm": "Hyper-Structure Pointer Projection",
        "data_layout": "Horizontal (H-Struct Queue)",
        "search_strategy": "Depth-First (DFS)",
        "candidate_generation": "No",
        "dataset_scans": "2 Passes",
    },
    "eclat": {
        "name": "ECLAT",
        "paradigm": "Vertical Tidset / Bitset Intersection",
        "data_layout": "Vertical (Bitset Tidlists)",
        "search_strategy": "Depth-First (Equivalence Class)",
        "candidate_generation": "No (Direct Tidset AND)",
        "dataset_scans": "1 Pass",
    },
}


def validate_mining_parameters(
    basket_df: pd.DataFrame,
    min_support: float,
    max_len: Optional[int] = None
) -> None:
    """
    Validates input basket DataFrame and hyperparameter values.

    Raises:
        ValueError: If basket is empty, min_support is out of bounds,
                    or max_len is invalid.
    """
    if basket_df is None or not isinstance(basket_df, pd.DataFrame):
        raise ValueError("Basket data must be a valid non-empty pandas DataFrame.")

    if basket_df.empty:
        raise ValueError("Basket DataFrame cannot be empty.")

    if not isinstance(min_support, (int, float)) or isinstance(min_support, bool):
        raise ValueError("min_support must be a numeric value.")

    if min_support <= 0.0 or min_support > 1.0:
        raise ValueError(
            f"min_support must be strictly between 0 and 1. Received: {min_support}"
        )

    if max_len is not None:
        if not isinstance(max_len, int) or isinstance(max_len, bool) or max_len < 1:
            raise ValueError(
                f"max_len must be a positive integer >= 1 or None. Received: {max_len}"
            )


def _finalize_itemsets(frequent_itemsets: pd.DataFrame) -> pd.DataFrame:
    """Normalizes empty check, length column, and descending support sort."""
    if frequent_itemsets.empty:
        return pd.DataFrame(columns=["support", "itemsets", "length"])

    res = frequent_itemsets.copy()
    res["length"] = res["itemsets"].apply(len)
    return res.sort_values(by="support", ascending=False).reset_index(drop=True)


def run_apriori(
    basket_df: pd.DataFrame,
    min_support: float = 0.01,
    max_len: Optional[int] = None,
    use_colnames: bool = True
) -> pd.DataFrame:
    """
    Generates frequent itemsets using the Apriori algorithm.

    Args:
        basket_df: Binary transaction matrix (0/1 or True/False).
        min_support: Minimum support threshold (0.0 to 1.0).
        max_len: Optional ceiling on maximum itemset size.
        use_colnames: If True, returns column names (Service IDs).

    Returns:
        DataFrame with columns ['support', 'itemsets', 'length'].
    """
    validate_mining_parameters(basket_df, min_support, max_len)
    bool_basket = basket_df.astype(bool)
    frequent_itemsets = apriori(
        bool_basket,
        min_support=min_support,
        use_colnames=use_colnames,
        max_len=max_len
    )
    return _finalize_itemsets(frequent_itemsets)


def run_fpgrowth(
    basket_df: pd.DataFrame,
    min_support: float = 0.01,
    max_len: Optional[int] = None,
    use_colnames: bool = True
) -> pd.DataFrame:
    """
    Generates frequent itemsets using the FP-Growth algorithm.

    Args:
        basket_df: Binary transaction matrix (0/1 or True/False).
        min_support: Minimum support threshold (0.0 to 1.0).
        max_len: Optional ceiling on maximum itemset size.
        use_colnames: If True, returns column names (Service IDs).

    Returns:
        DataFrame with columns ['support', 'itemsets', 'length'].
    """
    validate_mining_parameters(basket_df, min_support, max_len)
    bool_basket = basket_df.astype(bool)
    frequent_itemsets = fpgrowth(
        bool_basket,
        min_support=min_support,
        use_colnames=use_colnames,
        max_len=max_len
    )
    return _finalize_itemsets(frequent_itemsets)


def run_hmine(
    basket_df: pd.DataFrame,
    min_support: float = 0.01,
    max_len: Optional[int] = None,
    use_colnames: bool = True
) -> pd.DataFrame:
    """
    Generates frequent itemsets using the H-Mine (Hyper-structure) algorithm.

    Args:
        basket_df: Binary transaction matrix (0/1 or True/False).
        min_support: Minimum support threshold (0.0 to 1.0).
        max_len: Optional ceiling on maximum itemset size.
        use_colnames: If True, returns column names (Service IDs).

    Returns:
        DataFrame with columns ['support', 'itemsets', 'length'].
    """
    validate_mining_parameters(basket_df, min_support, max_len)
    bool_basket = basket_df.astype(bool)
    frequent_itemsets = hmine(
        bool_basket,
        min_support=min_support,
        use_colnames=use_colnames,
        max_len=max_len
    )
    return _finalize_itemsets(frequent_itemsets)


def run_eclat(
    basket_df: pd.DataFrame,
    min_support: float = 0.01,
    max_len: Optional[int] = None,
    use_colnames: bool = True
) -> pd.DataFrame:
    """
    Generates frequent itemsets using the ECLAT (Equivalence Class Transformation)
    vertical bitset intersection algorithm.

    Args:
        basket_df: Binary transaction matrix (0/1 or True/False).
        min_support: Minimum support threshold (0.0 to 1.0).
        max_len: Optional ceiling on maximum itemset size.
        use_colnames: If True, returns column names (Service IDs).

    Returns:
        DataFrame with columns ['support', 'itemsets', 'length'].
    """
    validate_mining_parameters(basket_df, min_support, max_len)

    bool_matrix = basket_df.to_numpy(dtype=bool, copy=False)
    n_transactions, n_items = bool_matrix.shape
    labels: List[Any] = list(basket_df.columns) if use_colnames else list(range(n_items))

    # Build vertical bitsets for frequent 1-itemsets
    frequent_1: List[Tuple[Any, int, float]] = []
    for col_idx in range(n_items):
        packed = np.packbits(bool_matrix[:, col_idx], bitorder="little")
        bitmask = int.from_bytes(packed.tobytes(), "little")
        support = bitmask.bit_count() / n_transactions
        if support >= min_support:
            frequent_1.append((labels[col_idx], bitmask, support))

    if not frequent_1:
        return pd.DataFrame(columns=["support", "itemsets", "length"])

    # Sort ascending by support so smaller tidsets intersect first
    frequent_1.sort(key=lambda entry: entry[2])

    records: List[Tuple[float, frozenset]] = []

    def _dfs(prefix: Tuple[Any, ...], suffix: List[Tuple[Any, int, float]]) -> None:
        for idx, (item_label, item_mask, item_support) in enumerate(suffix):
            new_items = prefix + (item_label,)
            records.append((item_support, frozenset(new_items)))

            if max_len is not None and len(new_items) >= max_len:
                continue

            next_suffix: List[Tuple[Any, int, float]] = []
            for other_label, other_mask, _ in suffix[idx + 1:]:
                intersect_mask = item_mask & other_mask
                intersect_support = intersect_mask.bit_count() / n_transactions
                if intersect_support >= min_support:
                    next_suffix.append((other_label, intersect_mask, intersect_support))

            if next_suffix:
                _dfs(new_items, next_suffix)

    _dfs((), frequent_1)

    if not records:
        return pd.DataFrame(columns=["support", "itemsets", "length"])

    df = pd.DataFrame(records, columns=["support", "itemsets"])
    return _finalize_itemsets(df)


ALGORITHM_RUNNERS: Dict[str, Callable[..., pd.DataFrame]] = {
    "apriori": run_apriori,
    "fpgrowth": run_fpgrowth,
    "hmine": run_hmine,
    "eclat": run_eclat,
}


def run_algorithm(
    algorithm: str,
    basket_df: pd.DataFrame,
    min_support: float = 0.01,
    max_len: Optional[int] = None,
    use_colnames: bool = True
) -> pd.DataFrame:
    """Dispatches frequent itemset mining to one of the 4 supported algorithms."""
    algo_key = algorithm.lower().strip()
    if algo_key not in ALGORITHM_RUNNERS:
        supported = ", ".join(ALGORITHM_ORDER)
        raise ValueError(f"Unsupported algorithm '{algorithm}'. Choose from: {supported}")
    return ALGORITHM_RUNNERS[algo_key](
        basket_df,
        min_support=min_support,
        max_len=max_len,
        use_colnames=use_colnames,
    )


def _measure_peak_memory_kb(fn: Callable[[], pd.DataFrame]) -> float:
    """Measures peak Python allocation in KiB for a single mining run."""
    was_tracing = tracemalloc.is_tracing()
    if not was_tracing:
        tracemalloc.start()
    else:
        tracemalloc.reset_peak()

    try:
        fn()
        _, peak_bytes = tracemalloc.get_traced_memory()
    finally:
        if not was_tracing:
            tracemalloc.stop()

    return round(peak_bytes / 1024.0, 2)


def _rule_signature_set(rules_df: pd.DataFrame) -> set:
    """Returns canonical set of (antecedents, consequents) pairs for equivalence checks."""
    if rules_df is None or rules_df.empty:
        return set()
    return set(zip(rules_df["antecedents"], rules_df["consequents"]))


def benchmark_support_sweep(
    basket_df: pd.DataFrame,
    thresholds: Optional[List[float]] = None,
    max_len: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Measures execution time across multiple min_support thresholds for all 4 algorithms
    to illustrate scalability under denser pattern spaces.
    """
    if thresholds is None:
        thresholds = [0.05, 0.03, 0.02, 0.01, 0.005]

    sweep_rows: List[Dict[str, Any]] = []
    for supp in sorted(thresholds, reverse=True):
        row: Dict[str, Any] = {"min_support": float(supp)}
        itemset_count = 0
        for algo_key in ALGORITHM_ORDER:
            runner = ALGORITHM_RUNNERS[algo_key]
            start = time.perf_counter()
            res = runner(basket_df, min_support=supp, max_len=max_len)
            elapsed = time.perf_counter() - start
            row[algo_key] = round(elapsed, 4)
            itemset_count = len(res)
        row["itemset_count"] = itemset_count
        sweep_rows.append(row)

    return sweep_rows


def compare_algorithms(
    basket_df: pd.DataFrame,
    min_support: float = 0.01,
    max_len: Optional[int] = None,
    min_confidence: float = 0.30,
    min_lift: float = 1.0,
    include_sweep: bool = False
) -> Dict[str, Any]:
    """
    Direct empirical comparison of Apriori, FP-Growth, H-Mine, and ECLAT
    under identical data and threshold conditions.

    Returns:
        Dictionary containing execution timings, peak memory usage, itemset & rule
        metrics, algorithmic profiles, mathematical equivalence verification across
        all 4 algorithms, and optional threshold sweep data.
    """
    validate_mining_parameters(basket_df, min_support, max_len)

    from modules.rule_evaluation import generate_rules, calculate_lift_survival

    results: Dict[str, Dict[str, Any]] = {}
    support_maps: Dict[str, Dict[frozenset, float]] = {}
    rule_sets: Dict[str, set] = {}

    for algo_key in ALGORITHM_ORDER:
        runner = ALGORITHM_RUNNERS[algo_key]

        # Measure wall-clock time without tracemalloc overhead
        start = time.perf_counter()
        itemsets_df = runner(basket_df, min_support=min_support, max_len=max_len)
        elapsed = time.perf_counter() - start

        # Measure peak memory allocation separately
        peak_kb = _measure_peak_memory_kb(
            lambda r=runner: r(basket_df, min_support=min_support, max_len=max_len)
        )

        # Generate rules to verify rule-level equivalence and counts
        rules_df = generate_rules(itemsets_df, min_confidence=min_confidence)
        lift_stats = calculate_lift_survival(rules_df, min_lift=min_lift)

        size_dist = (
            {int(k): int(v) for k, v in itemsets_df["length"].value_counts().items()}
            if not itemsets_df.empty
            else {}
        )

        support_maps[algo_key] = (
            dict(zip(itemsets_df["itemsets"], itemsets_df["support"]))
            if not itemsets_df.empty
            else {}
        )
        rule_sets[algo_key] = _rule_signature_set(rules_df)

        results[algo_key] = {
            "key": algo_key,
            **ALGORITHM_PROFILES[algo_key],
            "execution_time_seconds": round(elapsed, 4),
            "peak_memory_kb": peak_kb,
            "peak_memory_mb": round(peak_kb / 1024.0, 3),
            "itemset_count": len(itemsets_df),
            "rules_generated_count": int(lift_stats["total_rules"]),
            "surviving_rules_count": int(lift_stats["surviving_rules"]),
            "size_distribution": size_dist,
            "max_itemset_size": int(itemsets_df["length"].max()) if not itemsets_df.empty else 0,
            "itemsets": itemsets_df,
        }

    # Compute speed rankings and speedup vs Apriori baseline
    ap_time = results["apriori"]["execution_time_seconds"]
    fp_time = results["fpgrowth"]["execution_time_seconds"]
    sorted_by_speed = sorted(
        ALGORITHM_ORDER,
        key=lambda k: results[k]["execution_time_seconds"]
    )
    for rank, algo_key in enumerate(sorted_by_speed, start=1):
        algo_time = results[algo_key]["execution_time_seconds"]
        results[algo_key]["rank_by_speed"] = rank
        results[algo_key]["speedup_vs_apriori"] = (
            round(ap_time / algo_time, 2) if algo_time > 0 else 1.0
        )

    # Verify 4-way itemset, support, and rule equivalence
    baseline_map = support_maps["apriori"]
    baseline_keys = set(baseline_map.keys())
    identical_itemsets = all(
        set(support_maps[k].keys()) == baseline_keys
        and all(abs(support_maps[k][iset] - baseline_map[iset]) < 1e-9 for iset in baseline_keys)
        for k in ALGORITHM_ORDER[1:]
    )

    baseline_rules = rule_sets["apriori"]
    identical_rules = all(rule_sets[k] == baseline_rules for k in ALGORITHM_ORDER[1:])

    fastest_key = sorted_by_speed[0]
    fastest_time = results[fastest_key]["execution_time_seconds"]

    payload: Dict[str, Any] = {
        **results,
        "algorithm_order": list(ALGORITHM_ORDER),
        "fastest_algorithm": fastest_key,
        "fastest_algorithm_name": results[fastest_key]["name"],
        "identical_itemsets": identical_itemsets,
        "identical_rules": identical_rules,
        "identical_results": identical_itemsets and identical_rules,
        "speedup_factor": round(ap_time / fp_time, 2) if fp_time > 0 else 1.0,
        "max_speedup_vs_apriori": round(ap_time / fastest_time, 2) if fastest_time > 0 else 1.0,
        "parameters": {
            "min_support": min_support,
            "min_confidence": min_confidence,
            "min_lift": min_lift,
            "max_len": max_len,
            "transaction_count": len(basket_df),
            "service_count": basket_df.shape[1],
        },
    }

    if include_sweep:
        payload["support_sweep"] = benchmark_support_sweep(basket_df, max_len=max_len)

    return payload


def format_itemsets_with_names(
    itemsets_df: pd.DataFrame,
    service_catalogue: pd.DataFrame,
    total_journeys: Optional[int] = None
) -> pd.DataFrame:
    """
    Transforms raw Service ID itemsets into human-readable service name collections.
    
    Args:
        itemsets_df: DataFrame with 'support', 'itemsets', 'length'.
        service_catalogue: DataFrame with 'Service_ID' and 'Service_Name'.
        total_journeys: Optional total count to calculate journey counts.
        
    Returns:
        Formatted DataFrame with Service Names, readable sets, and counts.
    """
    if itemsets_df.empty:
        cols = ["Itemset_Names", "Service_IDs", "Itemset_Size", "Support", "Support_Percentage"]
        if total_journeys:
            cols.append("Estimated_Journeys")
        return pd.DataFrame(columns=cols)
    
    # Create mapping from ID to Name
    name_map = dict(zip(service_catalogue["Service_ID"], service_catalogue["Service_Name"]))
    
    formatted = itemsets_df.copy()
    
    def get_service_names(ids_frozenset):
        names = [name_map.get(sid, sid) for sid in sorted(ids_frozenset)]
        return ", ".join(names)
    
    def get_service_ids_str(ids_frozenset):
        return ", ".join(sorted(ids_frozenset))
    
    formatted["Itemset_Names"] = formatted["itemsets"].apply(get_service_names)
    formatted["Service_IDs"] = formatted["itemsets"].apply(get_service_ids_str)
    formatted["Itemset_Size"] = formatted["length"]
    formatted["Support"] = formatted["support"].round(4)
    formatted["Support_Percentage"] = (formatted["support"] * 100).round(2)
    
    if total_journeys is not None and total_journeys > 0:
        formatted["Estimated_Journeys"] = (formatted["support"] * total_journeys).round().astype(int)
    
    ordered_cols = ["Itemset_Names", "Service_IDs", "Itemset_Size", "Support", "Support_Percentage"]
    if total_journeys is not None and total_journeys > 0:
        ordered_cols.append("Estimated_Journeys")
    
    return formatted[ordered_cols].sort_values(by="Support", ascending=False).reset_index(drop=True)
