import json
import os
import numpy as np
import pandas as pd

# Re-run this script from its directory to recreate the dataset files.
OUTDIR = os.path.dirname(os.path.abspath(__file__))
SEED = 20261107
N_JOURNEYS = 20000

services = [
    ("S01","Scholarship Application","Education","P01"),
    ("S02","Student Registration","Education","P01"),
    ("S03","Income Certificate","Revenue","P02"),
    ("S04","Caste Certificate","Revenue","P02"),
    ("S05","Aadhaar Verification","Identity","P03"),
    ("S06","Bank Account Verification","Financial","P04"),
    ("S07","Pension Application","Social Welfare","P05"),
    ("S08","Life Certificate","Social Welfare","P05"),
    ("S09","Age Verification","Identity","P03"),
    ("S10","Ration Card Service","Food and Civil Supplies","P06"),
    ("S11","Family ID Registration","Civil Administration","P06"),
    ("S12","Land Records","Land and Revenue","P02"),
    ("S13","Property Registration","Land and Revenue","P07"),
    ("S14","Encumbrance Certificate","Land and Revenue","P07"),
    ("S15","Farmer Registration","Agriculture","P08"),
    ("S16","Crop Insurance","Agriculture","P08"),
    ("S17","Soil Health Card","Agriculture","P08"),
    ("S18","Employment Registration","Employment","P09"),
    ("S19","Skill Development Registration","Employment","P09"),
    ("S20","Job Application","Employment","P10"),
    ("S21","Health Scheme Registration","Healthcare","P11"),
    ("S22","Hospital Appointment","Healthcare","P12"),
    ("S23","Birth Certificate","Civil Registration","P13"),
    ("S24","Death Certificate","Civil Registration","P13"),
    ("S25","Driving Licence","Transport","P14"),
    ("S26","Vehicle Registration","Transport","P14"),
    ("S27","Utility Bill Payment","Utilities","P15"),
    ("S28","Water Connection","Utilities","P15"),
    ("S29","Business Registration","Business Services","P16"),
    ("S30","Trade Licence","Business Services","P16"),
]

patterns = {
    "Education_Scholarship": {"weight":0.18, "probs":{"S01":0.98,"S02":0.55,"S03":0.78,"S04":0.42,"S05":0.86,"S06":0.72}},
    "Pension_Support": {"weight":0.13, "probs":{"S07":0.98,"S08":0.48,"S03":0.38,"S05":0.88,"S06":0.82,"S09":0.32}},
    "Agriculture_Support": {"weight":0.14, "probs":{"S15":0.98,"S12":0.62,"S16":0.68,"S17":0.52,"S06":0.48,"S05":0.45}},
    "Property_Transaction": {"weight":0.12, "probs":{"S13":0.98,"S12":0.84,"S14":0.58,"S05":0.82,"S03":0.25}},
    "Employment_Skills": {"weight":0.13, "probs":{"S18":0.98,"S19":0.68,"S20":0.46,"S05":0.58,"S03":0.18}},
    "Healthcare_Access": {"weight":0.12, "probs":{"S21":0.98,"S22":0.62,"S05":0.60,"S06":0.32,"S11":0.22}},
    "Civil_Registration": {"weight":0.09, "probs":{"S23":0.62,"S24":0.38,"S05":0.58,"S09":0.35,"S11":0.42}},
    "Transport_Business": {"weight":0.09, "probs":{"S25":0.52,"S26":0.48,"S29":0.40,"S30":0.35,"S05":0.52,"S03":0.16}},
}
background = {s[0]:0.012 for s in services}
background.update({"S05":0.035,"S06":0.025,"S03":0.022,"S11":0.018,"S27":0.025})

rng = np.random.default_rng(SEED)
names = list(patterns)
weights = np.array([patterns[n]["weight"] for n in names], dtype=float)
weights /= weights.sum()
journey_rows, long_rows = [], []

for i in range(N_JOURNEYS):
    pattern = rng.choice(names, p=weights)
    probs = patterns[pattern]["probs"]
    chosen = []
    for sid, *_ in services:
        if rng.random() < probs.get(sid, background[sid]):
            chosen.append(sid)
    if rng.random() < 0.12:
        remaining = [s[0] for s in services if s[0] not in chosen]
        if remaining:
            k = 1 if rng.random() < 0.85 else 2
            chosen.extend(rng.choice(remaining, size=min(k,len(remaining)), replace=False).tolist())
    if not chosen:
        chosen = [next(iter(probs))]
    chosen = sorted(set(chosen))
    jid = f"J{i+1:05d}"
    service_names = [next(s[1] for s in services if s[0] == sid) for sid in chosen]
    journey_rows.append({
        "Journey_ID":jid,
        "Journey_Type_Synthetic":pattern,
        "Service_Count":len(chosen),
        "Services_Pipe_Separated":"|".join(service_names),
        "Service_IDs_Pipe_Separated":"|".join(chosen)
    })
    for sid in chosen:
        long_rows.append({"Journey_ID":jid,"Service_ID":sid})

journeys = pd.DataFrame(journey_rows)
catalogue = pd.DataFrame(services, columns=["Service_ID","Service_Name","Category","Illustrative_Platform_ID"])
catalogue["Illustrative_Platform_Name"] = catalogue["Illustrative_Platform_ID"].map(
    {f"P{i:02d}":f"Illustrative Platform {i:02d}" for i in range(1,17)}
)
catalogue["Platform_Note"] = "Synthetic placeholder; replace with verified real platform mapping."
long_df = pd.DataFrame(long_rows).merge(catalogue, on="Service_ID", how="left")
basket = pd.crosstab(long_df["Journey_ID"], long_df["Service_ID"]).clip(upper=1).astype(int)
basket = basket.reindex(columns=[s[0] for s in services], fill_value=0).reset_index()
basket = journeys[["Journey_ID"]].merge(basket, on="Journey_ID", how="left").fillna(0)
for c in [s[0] for s in services]:
    basket[c] = basket[c].astype(int)

journeys.to_csv(os.path.join(OUTDIR,"citizen_journeys.csv"), index=False)
long_df.to_csv(os.path.join(OUTDIR,"journey_services_long.csv"), index=False)
basket.to_csv(os.path.join(OUTDIR,"basket_onehot.csv"), index=False)
catalogue.to_csv(os.path.join(OUTDIR,"service_catalogue.csv"), index=False)

gt = []
for pname, pdata in patterns.items():
    for sid, prob in pdata["probs"].items():
        sname = next(s[1] for s in services if s[0] == sid)
        gt.append({"Synthetic_Journey_Pattern":pname,"Pattern_Mixture_Weight":pdata["weight"],
                   "Service_ID":sid,"Service_Name":sname,
                   "Inclusion_Probability_Within_Pattern":prob,
                   "Interpretation":"Simulation assumption only; not observed behaviour."})
pd.DataFrame(gt).to_csv(os.path.join(OUTDIR,"synthetic_pattern_assumptions.csv"), index=False)

config = {
    "dataset_type":"synthetic_simulation","n_journeys":N_JOURNEYS,"random_seed":SEED,
    "journey_pattern_weights":{k:v["weight"] for k,v in patterns.items()},
    "pattern_service_inclusion_probabilities":{k:v["probs"] for k,v in patterns.items()},
    "background_service_inclusion_probabilities":background,
    "noise":{"probability":0.12,"extra_services":"1 with probability 0.85, otherwise 2"}
}
with open(os.path.join(OUTDIR,"generation_config.json"),"w",encoding="utf-8") as f:
    json.dump(config,f,indent=2)

print(f"Generated {len(journeys)} journeys and {len(catalogue)} services in {OUTDIR}")
