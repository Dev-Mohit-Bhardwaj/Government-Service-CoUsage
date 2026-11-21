"""
Association Rule Evaluation Module (Project KRATOS)

Generates and evaluates association rules from frequent itemsets using mlxtend.
Calculates Support, Confidence, Lift, and Lift Filtering Survival Share.
Provides readable name translation, multi-criteria filtering, and redundancy pruning.
"""

from typing import Dict, Any, Optional, List
import pandas as pd
from mlxtend.frequent_patterns import association_rules


def generate_rules(
    frequent_itemsets: pd.DataFrame,
    min_confidence: float = 0.30,
    metric: str = "confidence"
) -> pd.DataFrame:
    """
    Generates association rules from frequent itemsets meeting a minimum confidence threshold.
    
    Args:
        frequent_itemsets: DataFrame containing 'itemsets' and 'support' (from Apriori / FP-Growth).
        min_confidence: Minimum confidence threshold (0.0 to 1.0).
        metric: Metric to evaluate for rule generation (default: 'confidence').
        
    Returns:
        DataFrame containing generated association rules.
    """
    if frequent_itemsets is None or not isinstance(frequent_itemsets, pd.DataFrame):
        raise ValueError("frequent_itemsets must be a valid pandas DataFrame.")
    
    if frequent_itemsets.empty or "itemsets" not in frequent_itemsets.columns:
        return pd.DataFrame(columns=[
            "antecedents", "consequents", "antecedent support", "consequent support",
            "support", "confidence", "lift"
        ])
    
    # Check if there are itemsets with length >= 2
    has_multi_items = frequent_itemsets["itemsets"].apply(len).max() >= 2 if len(frequent_itemsets) > 0 else False
    if not has_multi_items:
        return pd.DataFrame(columns=[
            "antecedents", "consequents", "antecedent support", "consequent support",
            "support", "confidence", "lift"
        ])
    
    if not isinstance(min_confidence, (int, float)) or min_confidence < 0.0 or min_confidence > 1.0:
        raise ValueError(f"min_confidence must be between 0.0 and 1.0. Received: {min_confidence}")
    
    rules = association_rules(
        frequent_itemsets,
        metric=metric,
        min_threshold=min_confidence
    )
    
    if rules.empty:
        return pd.DataFrame(columns=[
            "antecedents", "consequents", "antecedent support", "consequent support",
            "support", "confidence", "lift"
        ])
    
    # Compute sizes for convenient filtering
    rules["antecedent_len"] = rules["antecedents"].apply(len)
    rules["consequent_len"] = rules["consequents"].apply(len)
    
    return rules.reset_index(drop=True)


def calculate_lift_survival(
    rules_df: pd.DataFrame,
    min_lift: float = 1.0
) -> Dict[str, Any]:
    """
    Computes the Lift Filtering Survival Share:
    
        Survival Share (%) = (Rules with Lift >= min_lift / Total Generated Rules) * 100
        
    Handles empty rules gracefully with clear metric separation.
    
    Args:
        rules_df: Association rules DataFrame.
        min_lift: Lift threshold cutoff (typically 1.0 for positive association).
        
    Returns:
        Dictionary with total_rules, surviving_rules, filtered_rules_count,
        survival_percentage, and threshold applied.
    """
    if rules_df is None or rules_df.empty or "lift" not in rules_df.columns:
        return {
            "total_rules": 0,
            "surviving_rules": 0,
            "filtered_out_rules": 0,
            "survival_percentage": 0.0,
            "min_lift_threshold": min_lift
        }
    
    total = len(rules_df)
    surviving = (rules_df["lift"] >= min_lift).sum()
    filtered_out = total - surviving
    survival_pct = round((surviving / total) * 100.0, 2) if total > 0 else 0.0
    
    return {
        "total_rules": int(total),
        "surviving_rules": int(surviving),
        "filtered_out_rules": int(filtered_out),
        "survival_percentage": float(survival_pct),
        "min_lift_threshold": float(min_lift)
    }


def filter_rules(
    rules_df: pd.DataFrame,
    min_support: Optional[float] = None,
    min_confidence: Optional[float] = None,
    min_lift: Optional[float] = None,
    max_antecedent_len: Optional[int] = None,
    single_consequent_only: bool = True
) -> pd.DataFrame:
    """
    Filters association rules across multiple threshold dimensions.
    
    Args:
        rules_df: DataFrame of association rules.
        min_support: Minimum joint support threshold.
        min_confidence: Minimum conditional confidence threshold.
        min_lift: Minimum lift threshold.
        max_antecedent_len: Maximum number of items in antecedent.
        single_consequent_only: Restrict to rules with exactly 1 consequent.
        
    Returns:
        Filtered DataFrame of association rules.
    """
    if rules_df is None or rules_df.empty:
        return pd.DataFrame()
    
    filtered = rules_df.copy()
    
    if min_support is not None:
        filtered = filtered[filtered["support"] >= min_support]
        
    if min_confidence is not None:
        filtered = filtered[filtered["confidence"] >= min_confidence]
        
    if min_lift is not None:
        filtered = filtered[filtered["lift"] >= min_lift]
        
    if "antecedent_len" not in filtered.columns:
        filtered["antecedent_len"] = filtered["antecedents"].apply(len)
        
    if max_antecedent_len is not None:
        filtered = filtered[filtered["antecedent_len"] <= max_antecedent_len]
        
    if single_consequent_only:
        if "consequent_len" not in filtered.columns:
            filtered["consequent_len"] = filtered["consequents"].apply(len)
        filtered = filtered[filtered["consequent_len"] == 1]
        
    return filtered.reset_index(drop=True)


def format_rules_with_names(
    rules_df: pd.DataFrame,
    service_catalogue: pd.DataFrame
) -> pd.DataFrame:
    """
    Enriches rules with readable service names, formatted rule strings,
    and rounded percentage columns for display and export.
    
    Args:
        rules_df: Raw association rules DataFrame from mlxtend.
        service_catalogue: Service catalogue containing Service_ID and Service_Name.
        
    Returns:
        Human-readable DataFrame with rich presentation columns.
    """
    if rules_df is None or rules_df.empty:
        return pd.DataFrame(columns=[
            "Rule", "Antecedent_Names", "Consequent_Names",
            "Antecedents_IDs", "Consequents_IDs",
            "Support", "Confidence", "Lift"
        ])
    
    name_map = dict(zip(service_catalogue["Service_ID"], service_catalogue["Service_Name"]))
    
    formatted = rules_df.copy()
    
    def set_to_names(itemset):
        names = [name_map.get(sid, sid) for sid in sorted(itemset)]
        return ", ".join(names)
    
    def set_to_ids(itemset):
        return ", ".join(sorted(itemset))
    
    formatted["Antecedent_Names"] = formatted["antecedents"].apply(set_to_names)
    formatted["Consequent_Names"] = formatted["consequents"].apply(set_to_names)
    formatted["Antecedents_IDs"] = formatted["antecedents"].apply(set_to_ids)
    formatted["Consequents_IDs"] = formatted["consequents"].apply(set_to_ids)
    
    formatted["Rule"] = (
        "{" + formatted["Antecedent_Names"] + "} -> {" + formatted["Consequent_Names"] + "}"
    )
    
    formatted["Support"] = formatted["support"].round(4)
    formatted["Confidence"] = formatted["confidence"].round(4)
    formatted["Lift"] = formatted["lift"].round(3)
    formatted["Support_%"] = (formatted["support"] * 100).round(2)
    formatted["Confidence_%"] = (formatted["confidence"] * 100).round(2)
    
    display_cols = [
        "Rule", "Antecedent_Names", "Consequent_Names",
        "Support", "Confidence", "Lift", "Support_%", "Confidence_%",
        "Antecedents_IDs", "Consequents_IDs", "antecedents", "consequents"
    ]
    existing_cols = [c for c in display_cols if c in formatted.columns]
    
    return formatted[existing_cols]


def remove_redundant_rules(rules_df: pd.DataFrame) -> pd.DataFrame:
    """
    Identifies and removes redundant association rules where a more complex antecedent
    does not achieve higher confidence than a simpler sub-antecedent rule.
    
    A rule A1 U A2 -> B is considered redundant if A1 -> B exists with confidence >= conf(A1 U A2 -> B).
    """
    if rules_df is None or rules_df.empty or len(rules_df) <= 1:
        return rules_df
    
    # Index rules by consequent
    non_redundant_indices = []
    
    # Sort rules primarily by antecedent length ascending, then confidence descending
    sorted_df = rules_df.copy()
    if "antecedent_len" not in sorted_df.columns:
        sorted_df["antecedent_len"] = sorted_df["antecedents"].apply(len)
    sorted_df = sorted_df.sort_values(by=["antecedent_len", "confidence"], ascending=[True, False])
    
    seen_rules = []  # list of (frozenset_antecedent, frozenset_consequent, confidence)
    
    for idx, row in sorted_df.iterrows():
        ant = row["antecedents"]
        con = row["consequents"]
        conf = row["confidence"]
        
        is_redundant = False
        for prev_ant, prev_con, prev_conf in seen_rules:
            if con == prev_con and prev_ant.issubset(ant) and prev_conf >= conf:
                is_redundant = True
                break
                
        if not is_redundant:
            non_redundant_indices.append(idx)
            seen_rules.append((ant, con, conf))
            
    return rules_df.loc[non_redundant_indices].reset_index(drop=True)
