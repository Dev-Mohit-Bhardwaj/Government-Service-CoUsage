"""
Association Rule Mining Module (Project KRATOS)

Provides robust implementations of Apriori and FP-Growth algorithms
using mlxtend, performance benchmarking, and human-readable formatting
for discovering frequent government service combinations.
"""

import time
from typing import Dict, Any, Optional
import pandas as pd
from mlxtend.frequent_patterns import apriori, fpgrowth


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
    
    # Cast to boolean for optimal mlxtend performance and deprecation safety
    bool_basket = basket_df.astype(bool)
    
    frequent_itemsets = apriori(
        bool_basket,
        min_support=min_support,
        use_colnames=use_colnames,
        max_len=max_len
    )
    
    if frequent_itemsets.empty:
        return pd.DataFrame(columns=["support", "itemsets", "length"])
    
    frequent_itemsets["length"] = frequent_itemsets["itemsets"].apply(len)
    return frequent_itemsets.sort_values(by="support", ascending=False).reset_index(drop=True)


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
    
    if frequent_itemsets.empty:
        return pd.DataFrame(columns=["support", "itemsets", "length"])
    
    frequent_itemsets["length"] = frequent_itemsets["itemsets"].apply(len)
    return frequent_itemsets.sort_values(by="support", ascending=False).reset_index(drop=True)


def compare_algorithms(
    basket_df: pd.DataFrame,
    min_support: float = 0.01,
    max_len: Optional[int] = None
) -> Dict[str, Any]:
    """
    Direct empirical performance comparison of Apriori vs FP-Growth
    under identical data and threshold conditions.
    
    Returns:
        Dictionary containing execution timings, itemset metrics,
        size distributions, and mathematical equivalence verification.
    """
    validate_mining_parameters(basket_df, min_support, max_len)
    
    # Run Apriori
    start_ap = time.perf_counter()
    ap_itemsets = run_apriori(basket_df, min_support=min_support, max_len=max_len)
    ap_time = time.perf_counter() - start_ap
    
    # Run FP-Growth
    start_fp = time.perf_counter()
    fp_itemsets = run_fpgrowth(basket_df, min_support=min_support, max_len=max_len)
    fp_time = time.perf_counter() - start_fp
    
    # Verify set equivalence
    ap_set = set(ap_itemsets["itemsets"]) if not ap_itemsets.empty else set()
    fp_set = set(fp_itemsets["itemsets"]) if not fp_itemsets.empty else set()
    sets_identical = (ap_set == fp_set)
    
    # Size distributions
    ap_size_dist = ap_itemsets["length"].value_counts().to_dict() if not ap_itemsets.empty else {}
    fp_size_dist = fp_itemsets["length"].value_counts().to_dict() if not fp_itemsets.empty else {}
    
    return {
        "apriori": {
            "execution_time_seconds": round(ap_time, 4),
            "itemset_count": len(ap_itemsets),
            "size_distribution": ap_size_dist,
            "max_itemset_size": int(ap_itemsets["length"].max()) if not ap_itemsets.empty else 0,
            "itemsets": ap_itemsets
        },
        "fpgrowth": {
            "execution_time_seconds": round(fp_time, 4),
            "itemset_count": len(fp_itemsets),
            "size_distribution": fp_size_dist,
            "max_itemset_size": int(fp_itemsets["length"].max()) if not fp_itemsets.empty else 0,
            "itemsets": fp_itemsets
        },
        "identical_results": sets_identical,
        "speedup_factor": round(ap_time / fp_time, 2) if fp_time > 0 else 1.0,
        "parameters": {
            "min_support": min_support,
            "max_len": max_len,
            "transaction_count": len(basket_df),
            "service_count": basket_df.shape[1]
        }
    }


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
