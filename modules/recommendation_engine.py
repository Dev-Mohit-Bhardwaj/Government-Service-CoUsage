"""
Citizen Journey Recommendation Engine Module (Project KRATOS)

Provides transparent, rule-grounded recommendations of complementary government services
based on association rules mined from citizen journeys.

IMPORTANT: Recommendations reflect observed complementary co-usage associations across
distributed platforms. They do NOT represent chronological next-step predictions.
"""

from typing import List, Dict, Any, Optional, Set
import pandas as pd


def recommend_services(
    selected_service_ids: List[str],
    rules_df: pd.DataFrame,
    service_catalogue: pd.DataFrame,
    max_recommendations: int = 5,
    min_confidence: float = 0.20,
    min_lift: float = 1.0,
    ranking_metric: str = "confidence"
) -> List[Dict[str, Any]]:
    """
    Finds complementary service recommendations matching the user's selected services.
    
    Args:
        selected_service_ids: List of Service IDs already utilized by the citizen (e.g. ['S01', 'S03']).
        rules_df: DataFrame of mined association rules.
        service_catalogue: DataFrame with Service_ID, Service_Name, Category, Illustrative_Platform_ID.
        max_recommendations: Maximum number of ranked recommendations to return.
        min_confidence: Minimum rule confidence to qualify.
        min_lift: Minimum rule lift to qualify.
        ranking_metric: Primary metric for ranking ('confidence', 'lift', or 'composite').
        
    Returns:
        List of recommendation dictionaries, ranked and deduplicated.
    """
    if not selected_service_ids:
        return []
    
    if rules_df is None or rules_df.empty:
        return []
    
    selected_set = set(selected_service_ids)
    
    # Metadata lookup mappings
    name_map = dict(zip(service_catalogue["Service_ID"], service_catalogue["Service_Name"]))
    cat_map = dict(zip(service_catalogue["Service_ID"], service_catalogue["Category"]))
    plat_map = dict(zip(service_catalogue["Service_ID"], service_catalogue["Illustrative_Platform_ID"]))
    
    # Filter rules meeting baseline thresholds
    candidate_rules = rules_df[
        (rules_df["confidence"] >= min_confidence) &
        (rules_df["lift"] >= min_lift)
    ].copy()
    
    if candidate_rules.empty:
        return []
    
    # Find matching rules where Antecedent is a subset of Selected Services
    matching_records = []
    
    for _, row in candidate_rules.iterrows():
        ant = row["antecedents"]
        con = row["consequents"]
        
        # Antecedent must be subset of selected services
        if ant.issubset(selected_set):
            # Recommend services in Consequent that are NOT yet selected
            unselected_consequents = con - selected_set
            
            for rec_sid in unselected_consequents:
                matching_records.append({
                    "recommended_service_id": rec_sid,
                    "recommended_service_name": name_map.get(rec_sid, rec_sid),
                    "recommended_category": cat_map.get(rec_sid, "Unknown"),
                    "recommended_platform": plat_map.get(rec_sid, "Unknown"),
                    "trigger_service_ids": sorted(list(ant)),
                    "trigger_service_names": [name_map.get(s, s) for s in sorted(ant)],
                    "antecedent_length": len(ant),
                    "support": float(row["support"]),
                    "confidence": float(row["confidence"]),
                    "lift": float(row["lift"])
                })
                
    if not matching_records:
        return []
    
    # Deduplicate: if multiple rules recommend the same service, pick the best rule
    # Priority: higher confidence, then higher lift, then larger antecedent (more specific context)
    best_by_service: Dict[str, Dict[str, Any]] = {}
    
    for rec in matching_records:
        sid = rec["recommended_service_id"]
        if sid not in best_by_service:
            best_by_service[sid] = rec
        else:
            existing = best_by_service[sid]
            # Compare based on confidence then lift
            if (rec["confidence"], rec["lift"], rec["antecedent_length"]) > (
                existing["confidence"], existing["lift"], existing["antecedent_length"]
            ):
                best_by_service[sid] = rec
                
    unique_recommendations = list(best_by_service.values())
    
    # Calculate composite score (0-100)
    max_lift = max([r["lift"] for r in unique_recommendations]) if unique_recommendations else 1.0
    min_lift_val = min([r["lift"] for r in unique_recommendations]) if unique_recommendations else 1.0
    
    for rec in unique_recommendations:
        norm_lift = (
            (rec["lift"] - min_lift_val) / (max_lift - min_lift_val)
            if max_lift > min_lift_val else 1.0
        )
        # Composite ranking: 50% confidence, 30% lift, 20% support
        rec["score"] = round((0.50 * rec["confidence"] + 0.30 * norm_lift + 0.20 * rec["support"]) * 100, 2)
    
    # Sort recommendations
    if ranking_metric == "confidence":
        unique_recommendations.sort(key=lambda r: (r["confidence"], r["lift"], r["support"]), reverse=True)
    elif ranking_metric == "lift":
        unique_recommendations.sort(key=lambda r: (r["lift"], r["confidence"], r["support"]), reverse=True)
    else:  # composite
        unique_recommendations.sort(key=lambda r: r["score"], reverse=True)
        
    # Assign ranks and slice to max_recommendations
    final_recs = unique_recommendations[:max_recommendations]
    for rank, rec in enumerate(final_recs, start=1):
        rec["rank"] = rank
        rec["support_pct"] = round(rec["support"] * 100, 2)
        rec["confidence_pct"] = round(rec["confidence"] * 100, 2)
        rec["lift"] = round(rec["lift"], 3)
        
    return final_recs
