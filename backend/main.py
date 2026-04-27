from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from scraper import scrape_listings, scrape_raw
import os

app = FastAPI(title="Cars.com Scraper API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/search")
def search(
    make: str = Query(default=""),
    model: str = Query(default=""),
    zip_code: str = Query(default="90210"),
    max_price: str = Query(default=""),
    max_distance: str = Query(default="100"),
    stock_type: str = Query(default="used"),
    page: int = Query(default=1, ge=1),
    max_results: int = Query(default=100, ge=1, le=500),
    date_filter: str = Query(default="any"),   # 'any' | 'within' | 'between'
    days_listed: int = Query(default=7),
    date_from: str = Query(default=""),
    date_to: str = Query(default=""),
):
    return scrape_listings(
        make=make,
        model=model,
        zip_code=zip_code,
        max_price=max_price,
        max_distance=max_distance,
        stock_type=stock_type,
        page=page,
        max_results=max_results,
        date_filter=date_filter,
        days_listed=days_listed,
        date_from=date_from,
        date_to=date_to,
    )


@app.get("/api/raw")
def raw(
    make: str = Query(default="Toyota"),
    zip_code: str = Query(default="90210"),
):
    """Returns first raw Apify item — use to inspect real field names."""
    return scrape_raw(make=make, zip_code=zip_code)


@app.get("/api/makes")
def makes():
    return {
        "makes": [
            "Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz",
            "Audi", "Tesla", "Nissan", "Hyundai", "Kia", "Jeep", "Ram",
            "GMC", "Subaru", "Mazda", "Volkswagen", "Lexus", "Dodge", "Acura",
        ]
    }


# Serve React frontend
frontend_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        index = os.path.join(frontend_path, "index.html")
        return FileResponse(index)
