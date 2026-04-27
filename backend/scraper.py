import os
import re
from apify_client import ApifyClient

BASE_URL = "https://www.cars.com/shopping/results/"
ACTOR_ID = "glasswing/cars-scraper"


def build_url(
    make: str = "",
    model: str = "",
    zip_code: str = "90210",
    max_price: str = "",
    max_distance: str = "100",
    stock_type: str = "used",
    page: int = 1,
) -> str:
    params: dict[str, str] = {"stock_type": stock_type}
    if make:
        params["makes[]"] = make.lower()
    if model:
        params["models[]"] = f"{make.lower()}-{model.lower()}"
    if max_price:
        params["list_price_max"] = max_price
    params["maximum_distance"] = max_distance
    params["zip"] = zip_code
    if page > 1:
        params["page"] = str(page)
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{BASE_URL}?{query}"


def _str(val) -> str:
    if val is None:
        return ""
    return re.sub(r"\s+", " ", str(val)).strip()


def _price(val) -> str:
    if not val:
        return "N/A"
    try:
        return f"${int(val):,}"
    except (ValueError, TypeError):
        return _str(val)


def _mileage(val) -> str:
    if not val:
        return "N/A"
    try:
        return f"{int(val):,} mi"
    except (ValueError, TypeError):
        return _str(val)


def scrape_listings(
    make: str = "",
    model: str = "",
    zip_code: str = "90210",
    max_price: str = "",
    max_distance: str = "100",
    stock_type: str = "used",
    page: int = 1,
) -> dict:
    api_token = os.environ.get("APIFY_API_TOKEN", "")
    if not api_token:
        return {
            "error": "APIFY_API_TOKEN environment variable is not set.",
            "listings": [], "total": 0, "url": "",
        }

    url = build_url(make, model, zip_code, max_price, max_distance, stock_type, page)

    try:
        client = ApifyClient(api_token)
        run = client.actor(ACTOR_ID).call(
            run_input={
                "startUrls": [{"url": url}],
                "maxItemsPerLink": 20,
                "maxItemsTotal": 20,
            }
        )

        items = list(
            client.dataset(run["defaultDatasetId"]).iterate_items()
        )
    except Exception as e:
        return {"error": str(e), "listings": [], "total": 0, "url": url}

    listings = []
    for item in items:
        # glasswing/cars-scraper output field mapping
        title = _str(item.get("title") or f"{item.get('year','')} {item.get('make','')} {item.get('model','')}".strip())

        images = item.get("images") or item.get("media") or []
        image = images[0] if isinstance(images, list) and images else _str(item.get("image", ""))

        listing = {
            "title":    title or "N/A",
            "price":    _price(item.get("price") or item.get("listing_price")),
            "mileage":  _mileage(item.get("mileage") or item.get("miles")),
            "dealer":   _str(item.get("dealer") or item.get("dealer_name") or item.get("sellerName", "")),
            "distance": _str(item.get("distance") or item.get("miles_from_zip", "")),
            "rating":   _str(item.get("dealer_rating") or item.get("rating", "")),
            "image":    image,
            "url":      _str(item.get("url") or item.get("listing_url") or item.get("link", "")),
            "year":     _str(item.get("year", "")),
            "make":     _str(item.get("make", make)),
            "model":    _str(item.get("model", model)),
            "vin":      _str(item.get("vin", "")),
            "trim":     _str(item.get("trim", "")),
            "body":     _str(item.get("body_type") or item.get("bodyType", "")),
            "fuel":     _str(item.get("fuel_type") or item.get("fuelType", "")),
            "transmission": _str(item.get("transmission", "")),
        }
        listings.append(listing)

    return {
        "listings": listings,
        "total":    len(listings),
        "page":     page,
        "url":      url,
        "error":    None,
    }
