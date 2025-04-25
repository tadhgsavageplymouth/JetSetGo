from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
import faiss
import calendar
import os

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

holiday_enc = encoder.transform(df[["Holiday Type"]])
num_scaled  = scaler.transform(df[["price_log", "destination_temp_c"]])
# invert price dimension so lower prices are closer
num_scaled[:, 0] = 1 - num_scaled[:, 0]

vectors = np.hstack([holiday_enc, num_scaled]).astype("float32")
index   = faiss.IndexFlatL2(vectors.shape[1])
index.add(vectors)

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

    sub = df[
        (df.origin_city == params.origin_city) &
        (df.departure_datetime >= start) &
        (df.departure_datetime < end)
    ]
    if sub.empty:
        return []

    # Build query vector
    qlog = np.log1p(params.max_price)
    qcat = encoder.transform([[params.holiday_type]])
    qnum = scaler.transform([[qlog, climate_map[params.climate]]])
    qnum[0, 0] = 1 - qnum[0, 0]
    qvec = np.hstack([qcat, qnum]).astype("float32")

    # FAISS search
    D, I = index.search(qvec, 20)
    results = sub.iloc[I[0]].sort_values("price_gbp").head(5)

    # Return JSON-friendly records
    return results[[
        "airline",
        "origin_city",
        "destination_city",
        "price_gbp",
        "departure_datetime"
    ]].to_dict(orient="records")
