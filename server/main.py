from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
import faiss
import calendar

# ----- FastAPI app setup -----
app = FastAPI()

# Enable CORS so React (or any origin) can call your API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Load & index data once at startup -----
CSV_PATH = "/Users/tadhgsavage/Desktop/Flights Generator/VectorDatabseTest/synthetic_weighted_global_flights_50k.csv"
df = pd.read_csv(CSV_PATH)
df["departure_datetime"] = pd.to_datetime(df["departure_datetime"], errors="coerce")
df = df.dropna(subset=["departure_datetime"])

holiday_options = [
    "City Break", "Cultural", "Luxury",
    "Religious", "Adventure", "Beach", "Party"
]
climate_map = {"hot": 28, "mild": 20, "cold": 10}

# prune rows missing any fields we need
df = df.dropna(subset=[
    "origin_city",
    "Holiday Type",
    "price_gbp",
    "destination_temp_c"
])
df.reset_index(drop=True, inplace=True)

# feature engineering
df["price_log"] = np.log1p(df["price_gbp"])
encoder = OneHotEncoder(sparse_output=False).fit(df[["Holiday Type"]])
scaler  = MinMaxScaler().fit(df[["price_log", "destination_temp_c"]])

# precompute full matrix for potential reuse
holiday_enc_full = encoder.transform(df[["Holiday Type"]])
num_scaled_full  = scaler.transform(df[["price_log", "destination_temp_c"]])
# invert price dimension so lower prices are closer
num_scaled_full[:, 0] = 1 - num_scaled_full[:, 0]
vectors_full     = np.hstack([holiday_enc_full, num_scaled_full]).astype("float32")

# Dimensions
vector_dim = vectors_full.shape[1]

# ----- Request model -----
class SearchParams(BaseModel):
    origin_city: str
    month:        str     # e.g. "July"
    year:         int
    holiday_type: str
    max_price:    float
    climate:      str     # "hot", "mild", or "cold"

# ----- Search endpoint -----
@app.post("/search")
def search(params: SearchParams):
    # Validate inputs
    if params.origin_city not in set(df["origin_city"]):
        raise HTTPException(400, "Unknown origin_city")
    if params.holiday_type not in holiday_options:
        raise HTTPException(400, "Invalid holiday_type")
    if params.climate not in climate_map:
        raise HTTPException(400, "Invalid climate")

    # Filter by origin & departure month
    try:
        month_idx = list(calendar.month_name).index(params.month)
    except ValueError:
        raise HTTPException(400, "Invalid month name")
    start = pd.Timestamp(f"{params.year}-{month_idx:02d}-01")
    end   = (start + pd.offsets.MonthEnd(1)) + pd.Timedelta(days=1)

    mask = (
        (df.origin_city == params.origin_city) &
        (df.departure_datetime >= start) &
        (df.departure_datetime < end)
    )
    candidate_idxs = np.where(mask)[0]
    if candidate_idxs.size == 0:
        return []

    # Build query vector
    qlog = np.log1p(params.max_price)
    qcat = encoder.transform(pd.DataFrame([[params.holiday_type]], columns=["Holiday Type"]))
    qnum = scaler.transform(pd.DataFrame([[qlog, climate_map[params.climate]]], columns=["price_log", "destination_temp_c"]))
    qnum[0, 0] = 1 - qnum[0, 0]
    qvec = np.hstack([qcat, qnum]).astype("float32")

    # Build a small FAISS index for the candidates
    cand_vectors = vectors_full[candidate_idxs]
    index = faiss.IndexFlatL2(vector_dim)
    index.add(cand_vectors)

    # Search top K among candidates
    K = min(20, len(candidate_idxs))
    D, I = index.search(qvec, K)
    selected = candidate_idxs[I[0]]

    # Gather and sort results
    results_df = df.iloc[selected].sort_values("price_gbp").head(5)

    # Return JSON-friendly records
    return results_df[[
        "airline",
        "origin_city",
        "destination_city",
        "price_gbp",
        "departure_datetime"
    ]].to_dict(orient="records")
