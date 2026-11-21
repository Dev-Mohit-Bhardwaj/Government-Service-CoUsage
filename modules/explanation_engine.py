"""
Recommendation Explanation Engine Module (Project KRATOS)

Generates human-readable, statistically transparent, and non-causal explanations
for complementary government service recommendations.
"""

from typing import Dict, Any, List


def generate_recommendation_explanation(
    recommendation: Dict[str, Any],
    service_catalogue: Any = None
) -> Dict[str, str]:
    """
    Constructs multi-faceted, metric-grounded explanations for a recommendation.
    
    Args:
        recommendation: A recommendation dictionary output by recommend_services().
        service_catalogue: Optional catalogue for additional context if needed.
        
    Returns:
        Dictionary containing structured explanation components:
        - summary: Concise one-sentence takeaway.
        - metric_rationale: Exact empirical metrics (support, confidence, lift).
        - governance_insight: Administrative context (cross-category/cross-platform).
        - disclaimers: Ethical reminder regarding synthetic/non-causal limitations.
    """
    rec_name = recommendation.get("recommended_service_name", "Complementary Service")
    triggers = recommendation.get("trigger_service_names", [])
    triggers_str = " and ".join(triggers) if triggers else "selected services"
    
    conf_pct = recommendation.get("confidence_pct", round(recommendation.get("confidence", 0.0) * 100, 1))
    lift_val = recommendation.get("lift", 1.0)
    supp_pct = recommendation.get("support_pct", round(recommendation.get("support", 0.0) * 100, 1))
    
    rec_cat = recommendation.get("recommended_category", "General")
    rec_plat = recommendation.get("recommended_platform", "P00")
    
    # 1. Summary
    summary = (
        f"Citizens whose journeys included {triggers_str} also frequently utilized {rec_name}."
    )
    
    # 2. Metric Rationale
    metric_rationale = (
        f"This recommendation is grounded in an empirical co-usage pattern with {conf_pct}% confidence "
        f"and a lift of {lift_val:.2f}x (indicating co-occurrence is {lift_val:.2f} times more frequent "
        f"than expected under statistical independence). The combination appears in {supp_pct}% of all journeys."
    )
    
    # 3. Governance Insight
    governance_insight = (
        f"Recommended service belongs to the '{rec_cat}' domain (Platform: {rec_plat}). "
        f"Suggesting {rec_name} proactively bridges departmental workflows and reduces friction "
        f"for citizens requiring complementary verification or enrollment."
    )
    
    # 4. Ethical Non-Causal Disclaimer
    disclaimer = (
        "Non-causal co-usage pattern derived from synthetic simulated journeys. "
        "Does not imply temporal sequence or compulsory prerequisite status."
    )
    
    return {
        "summary": summary,
        "metric_rationale": metric_rationale,
        "governance_insight": governance_insight,
        "disclaimer": disclaimer,
        "full_text": f"{summary} {metric_rationale}"
    }


def explain_all_recommendations(
    recommendations: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Attaches generated explanations directly to each recommendation dictionary.
    """
    explained = []
    for rec in recommendations:
        rec_copy = rec.copy()
        rec_copy["explanation"] = generate_recommendation_explanation(rec)
        explained.append(rec_copy)
    return explained
