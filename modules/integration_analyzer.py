"""
Integration Opportunity Analyzer Module (Project KRATOS)

Translates statistical association rules into prioritized digital governance integration
opportunities. Evaluates cross-departmental (cross-category) and cross-platform relationships
using transparent, configurable multi-criteria scoring.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd


# Default transparent scoring weights (Sum = 1.0)
DEFAULT_WEIGHTS = {
    "confidence": 0.30,      # Directional predictability (0 to 1)
    "lift": 0.25,            # Statistical synergy above random chance
    "support": 0.15,         # Volume / Reach across citizen journeys
    "cross_platform": 0.15,  # Inter-portal integration need (Illustrative Platforms)
    "cross_category": 0.15   # Inter-ministerial coordination need
}


def analyze_integration_opportunities(
    rules_df: pd.DataFrame,
    service_catalogue: pd.DataFrame,
    weights: Optional[Dict[str, float]] = None,
    min_confidence: float = 0.30,
    min_lift: float = 1.05,
    top_n: int = 50
) -> pd.DataFrame:
    """
    Identifies and ranks high-value integration opportunities from association rules.
    
    Formula:
        Score = 100 * (w_c * Conf + w_l * NormLift + w_s * NormSupp + w_p * IsCrossPlat + w_cat * IsCrossCat)
        
    Args:
        rules_df: Association rules DataFrame (with antecedents, consequents, support, confidence, lift).
        service_catalogue: Service metadata containing Service_ID, Service_Name, Category, Illustrative_Platform_ID.
        weights: Dictionary of custom weights for the 5 criteria.
        min_confidence: Minimum confidence threshold.
        min_lift: Minimum lift threshold (typically > 1.0 for positive synergy).
        top_n: Number of top opportunities to return.
        
    Returns:
        Ranked DataFrame of integration opportunities with scores, metadata, and justifications.
    """
    if rules_df is None or rules_df.empty:
        return pd.DataFrame(columns=[
            "Rank", "Opportunity", "Antecedent_Services", "Consequent_Services",
            "Antecedent_Categories", "Consequent_Categories",
            "Antecedent_Platforms", "Consequent_Platforms",
            "Is_Cross_Category", "Is_Cross_Platform",
            "Support", "Confidence", "Lift", "Opportunity_Score", "Strategic_Rationale"
        ])
    
    # Merge weights with defaults
    active_weights = DEFAULT_WEIGHTS.copy()
    if weights:
        active_weights.update(weights)
        
    # Normalize weights to sum to 1.0
    weight_sum = sum(active_weights.values())
    if weight_sum > 0:
        norm_weights = {k: v / weight_sum for k, v in active_weights.items()}
    else:
        norm_weights = DEFAULT_WEIGHTS
    
    # Metadata lookup maps
    name_map = dict(zip(service_catalogue["Service_ID"], service_catalogue["Service_Name"]))
    cat_map = dict(zip(service_catalogue["Service_ID"], service_catalogue["Category"]))
    plat_map = dict(zip(service_catalogue["Service_ID"], service_catalogue["Illustrative_Platform_ID"]))
    
    # Filter rules by baseline thresholds
    filtered = rules_df[
        (rules_df["confidence"] >= min_confidence) &
        (rules_df["lift"] >= min_lift)
    ].copy()
    
    if filtered.empty:
        return pd.DataFrame(columns=[
            "Rank", "Opportunity", "Antecedent_Services", "Consequent_Services",
            "Antecedent_Categories", "Consequent_Categories",
            "Antecedent_Platforms", "Consequent_Platforms",
            "Is_Cross_Category", "Is_Cross_Platform",
            "Support", "Confidence", "Lift", "Opportunity_Score", "Strategic_Rationale"
        ])
    
    # Helper extractors
    def get_names(id_set):
        return ", ".join([name_map.get(sid, sid) for sid in sorted(id_set)])
    
    def get_categories(id_set):
        return ", ".join(sorted(set([str(cat_map.get(sid, "Unknown")) for sid in id_set])))
    
    def get_platforms(id_set):
        return ", ".join(sorted(set([str(plat_map.get(sid, "Unknown")) for sid in id_set])))
    
    filtered["Antecedent_Services"] = filtered["antecedents"].apply(get_names)
    filtered["Consequent_Services"] = filtered["consequents"].apply(get_names)
    filtered["Antecedent_Categories"] = filtered["antecedents"].apply(get_categories)
    filtered["Consequent_Categories"] = filtered["consequents"].apply(get_categories)
    filtered["Antecedent_Platforms"] = filtered["antecedents"].apply(get_platforms)
    filtered["Consequent_Platforms"] = filtered["consequents"].apply(get_platforms)
    
    # Cross-category & cross-platform indicators
    def is_cross_cat(row):
        cats_ant = set(cat_map.get(sid) for sid in row["antecedents"])
        cats_con = set(cat_map.get(sid) for sid in row["consequents"])
        return bool(len(cats_ant - cats_con) > 0 or len(cats_con - cats_ant) > 0)
    
    def is_cross_plat(row):
        plats_ant = set(plat_map.get(sid) for sid in row["antecedents"])
        plats_con = set(plat_map.get(sid) for sid in row["consequents"])
        return bool(len(plats_ant - plats_con) > 0 or len(plats_con - plats_ant) > 0)
    
    filtered["Is_Cross_Category"] = [is_cross_cat(r) for _, r in filtered.iterrows()]
    filtered["Is_Cross_Platform"] = [is_cross_plat(r) for _, r in filtered.iterrows()]
    
    # Normalization of numerical components
    max_supp = filtered["support"].max()
    min_supp = filtered["support"].min()
    norm_support = (
        (filtered["support"] - min_supp) / (max_supp - min_supp)
        if max_supp > min_supp else pd.Series(1.0, index=filtered.index)
    )
    
    max_lift = filtered["lift"].max()
    min_lift_val = filtered["lift"].min()
    norm_lift = (
        (filtered["lift"] - min_lift_val) / (max_lift - min_lift_val)
        if max_lift > min_lift_val else pd.Series(1.0, index=filtered.index)
    )
    
    norm_conf = filtered["confidence"]  # already 0 to 1
    
    # Composite Opportunity Score (0 to 100)
    raw_score = (
        norm_weights["confidence"] * norm_conf +
        norm_weights["lift"] * norm_lift +
        norm_weights["support"] * norm_support +
        norm_weights["cross_platform"] * filtered["Is_Cross_Platform"].astype(float) +
        norm_weights["cross_category"] * filtered["Is_Cross_Category"].astype(float)
    ) * 100.0
    
    filtered["Opportunity_Score"] = raw_score.round(2)
    filtered["Opportunity"] = filtered["Antecedent_Services"] + " ➔ " + filtered["Consequent_Services"]
    
    # Strategic Rationale generator
    def build_rationale(row):
        parts = []
        if row["Is_Cross_Platform"] and row["Is_Cross_Category"]:
            parts.append(
                f"High-impact cross-platform ({row['Antecedent_Platforms']} ➔ {row['Consequent_Platforms']}) "
                f"and inter-ministerial ({row['Antecedent_Categories']} ➔ {row['Consequent_Categories']}) coordination priority."
            )
        elif row["Is_Cross_Platform"]:
            parts.append(
                f"Cross-platform handoff ({row['Antecedent_Platforms']} ➔ {row['Consequent_Platforms']}) "
                f"benefits from single-sign-on or deep-link integration."
            )
        elif row["Is_Cross_Category"]:
            parts.append(
                f"Inter-departmental alignment between {row['Antecedent_Categories']} and {row['Consequent_Categories']}."
            )
        else:
            parts.append("Intra-platform service bundling candidate.")
            
        parts.append(
            f"Observed in {row['support']*100:.1f}% of journeys with {row['confidence']*100:.1f}% confidence "
            f"and {row['lift']:.2f}x synergy over random usage."
        )
        return " ".join(parts)
        
    filtered["Strategic_Rationale"] = filtered.apply(build_rationale, axis=1)
    
    # Sorting and ranking
    ranked = filtered.sort_values(by="Opportunity_Score", ascending=False).reset_index(drop=True)
    ranked["Rank"] = range(1, len(ranked) + 1)
    
    columns_order = [
        "Rank", "Opportunity", "Opportunity_Score",
        "Support", "Confidence", "Lift",
        "Is_Cross_Category", "Is_Cross_Platform",
        "Antecedent_Services", "Consequent_Services",
        "Antecedent_Categories", "Consequent_Categories",
        "Antecedent_Platforms", "Consequent_Platforms",
        "Strategic_Rationale"
    ]
    
    # Ensure numeric columns rounded for output
    ranked["Support"] = ranked["support"].round(4)
    ranked["Confidence"] = ranked["confidence"].round(4)
    ranked["Lift"] = ranked["lift"].round(3)
    
    return ranked[columns_order].head(top_n)
