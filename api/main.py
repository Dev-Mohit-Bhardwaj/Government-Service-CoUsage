import os
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure root directory is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from modules.data_loader import load_all_datasets
from modules.data_validator import validate_datasets
from modules.preprocessing import prepare_basket_data
from modules.popularity_analysis import calculate_service_popularity
from modules.exploratory_data_analysis import (
    get_service_distribution,
    get_journey_length_distribution,
    get_frequent_service_pairs,
    get_category_distribution,
    get_synthetic_pattern_distribution,
)
from modules.association_mining import (
    run_apriori,
    run_fpgrowth,
    compare_algorithms,
    format_itemsets_with_names,
)
from modules.rule_evaluation import (
    generate_rules,
    calculate_lift_survival,
    filter_rules,
    format_rules_with_names,
    remove_redundant_rules,
)
from modules.integration_analyzer import analyze_integration_opportunities, DEFAULT_WEIGHTS
from modules.recommendation_engine import recommend_services
from modules.explanation_engine import explain_all_recommendations
from config import DEFAULT_MIN_SUPPORT, DEFAULT_MIN_CONFIDENCE, DEFAULT_MIN_LIFT

# Initialize FastAPI App
app = FastAPI(
    title="PROJECT KRATOS API",
    description="Government Service Intelligence & Recommendation System API Layer",
    version="2.0.0",
)

# Enable CORS for React Vite frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cached dataset state
_DATASETS = None
_PREPARED_BASKET = None
_CACHED_RULES = {}
_CACHED_ITEMSETS = {}

def get_datasets():
    global _DATASETS
    if _DATASETS is None:
        _DATASETS = load_all_datasets()
    return _DATASETS

def get_basket():
    global _PREPARED_BASKET
    if _PREPARED_BASKET is None:
        ds = get_datasets()
        _PREPARED_BASKET = prepare_basket_data(ds["basket"])
    return _PREPARED_BASKET

def get_or_compute_rules(min_support: float = 0.01, min_confidence: float = 0.20):
    cache_key = (round(min_support, 4), round(min_confidence, 4))
    if cache_key in _CACHED_RULES:
        return _CACHED_RULES[cache_key]
    
    basket = get_basket()
    itemsets = run_fpgrowth(basket, min_support=min_support)
    rules = generate_rules(itemsets, min_confidence=min_confidence)
    _CACHED_RULES[cache_key] = (itemsets, rules)
    return itemsets, rules

# -------------------------------------------------------------
# Schemas
# -------------------------------------------------------------
class RecommendationRequest(BaseModel):
    selected_service_ids: List[str] = Field(..., description="List of chosen Service IDs e.g. ['S01', 'S03']")
    max_recommendations: int = Field(5, ge=1, le=20)
    min_confidence: float = Field(0.20, ge=0.0, le=1.0)
    min_lift: float = Field(1.0, ge=0.0)
    ranking_metric: str = Field("confidence", description="'confidence', 'lift', or 'composite'")

class IntegrationWeightsRequest(BaseModel):
    confidence: Optional[float] = 0.30
    lift: Optional[float] = 0.25
    support: Optional[float] = 0.15
    cross_platform: Optional[float] = 0.15
    cross_category: Optional[float] = 0.15

# -------------------------------------------------------------
# Routes
# -------------------------------------------------------------

@app.get("/api/health")
def health_check():
    ds = get_datasets()
    return {
        "status": "online",
        "system": "PROJECT KRATOS Intelligence Engine",
        "version": "2.0.0",
        "dataset_loaded": ds is not None,
        "total_journeys": len(ds["journeys"]),
        "total_services": len(ds["services"]),
        "synthetic_notice": "SYNTHETIC DATASET — ILLUSTRATIVE ANALYSIS ONLY",
        "co_usage_notice": "Results reflect complementary co-usage associations, not chronological predictions."
    }

@app.get("/api/overview")
def get_overview_metrics():
    ds = get_datasets()
    journeys = ds["journeys"]
    services = ds["services"]
    long_data = ds["long_data"]

    total_journeys = len(journeys)
    total_services = len(services)
    total_interactions = len(long_data)
    avg_services = round(float(journeys["Service_Count"].mean()), 2)
    median_services = float(journeys["Service_Count"].median())

    # Precompute default frequent itemsets and rules
    itemsets, rules = get_or_compute_rules(DEFAULT_MIN_SUPPORT, DEFAULT_MIN_CONFIDENCE)
    lift_stats = calculate_lift_survival(rules, DEFAULT_MIN_LIFT)

    # Category counts
    cat_dist = get_category_distribution(services).to_dict(orient="records")

    # Top popular services
    pop_df = calculate_service_popularity(long_data, services, total_journeys)
    top_services = pop_df.head(6).to_dict(orient="records")

    # Journey length distribution
    length_dist = get_journey_length_distribution(journeys).to_dict(orient="records")

    # Synthetic patterns
    pattern_dist = get_synthetic_pattern_distribution(journeys).to_dict(orient="records")

    return {
        "kpis": {
            "total_journeys": total_journeys,
            "total_services": total_services,
            "total_interactions": total_interactions,
            "avg_services_per_journey": avg_services,
            "median_services_per_journey": median_services,
            "min_services_per_journey": int(journeys["Service_Count"].min()),
            "max_services_per_journey": int(journeys["Service_Count"].max()),
            "frequent_itemsets_count": len(itemsets),
            "rules_generated_count": len(rules),
            "surviving_rules_count": lift_stats["surviving_rules"],
            "lift_survival_percentage": lift_stats["survival_percentage"]
        },
        "top_services": top_services,
        "category_distribution": cat_dist,
        "journey_length_distribution": length_dist,
        "pattern_distribution": pattern_dist,
        "disclaimer": "Synthetic dataset illustrative analysis. Non-causal associations."
    }

@app.get("/api/validation")
def get_validation_report():
    ds = get_datasets()
    validation_df = validate_datasets(ds)
    total_checks = len(validation_df)
    passed_checks = int((validation_df["Status"] == "PASS").sum())
    failed_checks = total_checks - passed_checks
    
    return {
        "total_checks": total_checks,
        "passed_checks": passed_checks,
        "failed_checks": failed_checks,
        "all_passed": failed_checks == 0,
        "checks": validation_df.to_dict(orient="records")
    }

@app.get("/api/services")
def list_services():
    ds = get_datasets()
    services_df = ds["services"]
    return services_df.to_dict(orient="records")

@app.get("/api/popularity")
def get_popularity(category: Optional[str] = None):
    ds = get_datasets()
    pop_df = calculate_service_popularity(ds["long_data"], ds["services"], len(ds["journeys"]))
    if category and category.lower() != "all":
        pop_df = pop_df[pop_df["Category"].str.lower() == category.lower()]
    return pop_df.to_dict(orient="records")

@app.get("/api/eda")
def get_eda():
    ds = get_datasets()
    service_dist = get_service_distribution(ds["long_data"]).to_dict(orient="records")
    length_dist = get_journey_length_distribution(ds["journeys"]).to_dict(orient="records")
    frequent_pairs = get_frequent_service_pairs(ds["long_data"]).head(25).to_dict(orient="records")
    cat_dist = get_category_distribution(ds["services"]).to_dict(orient="records")
    pattern_dist = get_synthetic_pattern_distribution(ds["journeys"]).to_dict(orient="records")
    
    return {
        "service_distribution": service_dist,
        "journey_length_distribution": length_dist,
        "frequent_pairs": frequent_pairs,
        "category_distribution": cat_dist,
        "synthetic_pattern_distribution": pattern_dist,
        "notes": {
            "synthetic_pattern": "Synthetic journey-pattern metadata used strictly for exploratory validation, not an input feature for mining."
        }
    }

@app.get("/api/mining/itemsets")
def get_itemsets(
    min_support: float = 0.01,
    max_len: Optional[int] = None,
    algorithm: str = "fpgrowth"
):
    basket = get_basket()
    ds = get_datasets()
    
    if algorithm == "apriori":
        raw_itemsets = run_apriori(basket, min_support=min_support, max_len=max_len)
    else:
        raw_itemsets = run_fpgrowth(basket, min_support=min_support, max_len=max_len)
        
    formatted = format_itemsets_with_names(raw_itemsets, ds["services"], total_journeys=len(ds["journeys"]))
    return {
        "algorithm": algorithm,
        "count": len(formatted),
        "min_support": min_support,
        "max_len": max_len,
        "itemsets": formatted.to_dict(orient="records")
    }

@app.get("/api/mining/rules")
def get_rules(
    min_support: float = 0.01,
    min_confidence: float = 0.30,
    min_lift: float = 1.0,
    max_antecedent_len: Optional[int] = None,
    single_consequent_only: bool = True,
    remove_redundant: bool = False
):
    ds = get_datasets()
    itemsets, raw_rules = get_or_compute_rules(min_support, min_confidence)
    
    filtered = filter_rules(
        raw_rules,
        min_support=min_support,
        min_confidence=min_confidence,
        min_lift=min_lift,
        max_antecedent_len=max_antecedent_len,
        single_consequent_only=single_consequent_only
    )
    
    if remove_redundant:
        filtered = remove_redundant_rules(filtered)
        
    lift_stats = calculate_lift_survival(raw_rules, min_lift=min_lift)
    formatted = format_rules_with_names(filtered, ds["services"])
    
    return {
        "total_generated": len(raw_rules),
        "total_filtered": len(formatted),
        "lift_survival": lift_stats,
        "rules": formatted.to_dict(orient="records")
    }

@app.get("/api/mining/compare")
def compare_mining_algorithms(
    min_support: float = 0.01,
    max_len: Optional[int] = None
):
    basket = get_basket()
    comparison = compare_algorithms(basket, min_support=min_support, max_len=max_len)
    
    # Exclude raw DataFrame for JSON serialization
    res = {
        "apriori": {
            "execution_time_seconds": comparison["apriori"]["execution_time_seconds"],
            "itemset_count": comparison["apriori"]["itemset_count"],
            "size_distribution": comparison["apriori"]["size_distribution"],
            "max_itemset_size": comparison["apriori"]["max_itemset_size"],
        },
        "fpgrowth": {
            "execution_time_seconds": comparison["fpgrowth"]["execution_time_seconds"],
            "itemset_count": comparison["fpgrowth"]["itemset_count"],
            "size_distribution": comparison["fpgrowth"]["size_distribution"],
            "max_itemset_size": comparison["fpgrowth"]["max_itemset_size"],
        },
        "identical_results": comparison["identical_results"],
        "speedup_factor": comparison["speedup_factor"],
        "parameters": comparison["parameters"]
    }
    return res

@app.post("/api/recommend")
def get_recommendations(payload: RecommendationRequest = Body(...)):
    ds = get_datasets()
    _, rules = get_or_compute_rules(min_support=0.01, min_confidence=payload.min_confidence)
    
    recs = recommend_services(
        selected_service_ids=payload.selected_service_ids,
        rules_df=rules,
        service_catalogue=ds["services"],
        max_recommendations=payload.max_recommendations,
        min_confidence=payload.min_confidence,
        min_lift=payload.min_lift,
        ranking_metric=payload.ranking_metric
    )
    
    explained_recs = explain_all_recommendations(recs)
    
    return {
        "selected_service_ids": payload.selected_service_ids,
        "recommendations_count": len(explained_recs),
        "ranking_metric": payload.ranking_metric,
        "recommendations": explained_recs,
        "disclaimer": "Non-causal co-usage recommendations. Does not imply sequential timeline."
    }

@app.get("/api/network")
def get_service_network(
    min_support: float = 0.015,
    min_confidence: float = 0.35,
    min_lift: float = 1.0
):
    """
    Generates Graph Data (Nodes + Edges) for interactive Service Network visualization.
    Nodes = 30 services with category, platform, popularity.
    Edges = Discovered association rules or high-support co-occurrences.
    """
    ds = get_datasets()
    services_df = ds["services"]
    pop_df = calculate_service_popularity(ds["long_data"], services_df, len(ds["journeys"]))
    pop_map = dict(zip(pop_df["Service_ID"], pop_df["Popularity_Percentage"]))
    count_map = dict(zip(pop_df["Service_ID"], pop_df["Journey_Count"]))
    
    # Construct Nodes
    nodes = []
    for _, row in services_df.iterrows():
        sid = row["Service_ID"]
        nodes.append({
            "id": sid,
            "name": row["Service_Name"],
            "category": row["Category"],
            "platform_id": row["Illustrative_Platform_ID"],
            "platform_name": row["Illustrative_Platform_Name"],
            "popularity": round(float(pop_map.get(sid, 0.0)), 2),
            "journey_count": int(count_map.get(sid, 0))
        })
        
    # Get Rules for Edges
    _, rules = get_or_compute_rules(min_support=min_support, min_confidence=min_confidence)
    filtered_rules = filter_rules(
        rules,
        min_support=min_support,
        min_confidence=min_confidence,
        min_lift=min_lift,
        single_consequent_only=True
    )
    
    edges = []
    seen_pairs = set()
    for _, r in filtered_rules.iterrows():
        # Source can be multi-item antecedent, so create link for each item in antecedent to consequent
        consequent_sid = list(r["consequents"])[0]
        for antecedent_sid in r["antecedents"]:
            pair_key = (antecedent_sid, consequent_sid)
            if pair_key not in seen_pairs:
                seen_pairs.add(pair_key)
                edges.append({
                    "source": antecedent_sid,
                    "target": consequent_sid,
                    "support": round(float(r["support"]), 4),
                    "confidence": round(float(r["confidence"]), 4),
                    "lift": round(float(r["lift"]), 3),
                    "is_strong": float(r["lift"]) > 1.2 and float(r["confidence"]) > 0.45
                })
                
    return {
        "nodes": nodes,
        "edges": edges,
        "summary": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "min_support": min_support,
            "min_confidence": min_confidence,
            "min_lift": min_lift
        }
    }

@app.get("/api/integration")
def get_integration_opportunities(
    min_confidence: float = 0.30,
    min_lift: float = 1.05,
    top_n: int = 50,
    w_confidence: float = 0.30,
    w_lift: float = 0.25,
    w_support: float = 0.15,
    w_platform: float = 0.15,
    w_category: float = 0.15
):
    ds = get_datasets()
    _, rules = get_or_compute_rules(min_support=0.01, min_confidence=min_confidence)
    
    weights = {
        "confidence": w_confidence,
        "lift": w_lift,
        "support": w_support,
        "cross_platform": w_platform,
        "cross_category": w_category
    }
    
    opportunities = analyze_integration_opportunities(
        rules,
        ds["services"],
        weights=weights,
        min_confidence=min_confidence,
        min_lift=min_lift,
        top_n=top_n
    )
    
    return {
        "weights": weights,
        "count": len(opportunities),
        "opportunities": opportunities.to_dict(orient="records"),
        "disclaimer": "Illustrative platform mappings. Synthetic analysis for policy evaluation."
    }

# Mount Production Static Frontend if built
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
if FRONTEND_DIST.exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
