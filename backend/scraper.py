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


def _s(val) -> str:
    if val is None:
        return ""
    return re.sub(r"\s+", " ", str(val)).strip()


def _map_item(item: dict) -> dict:
    vehicle = item.get("vehicle") or {}
    pricing = item.get("pricing") or {}
    dealer  = item.get("dealer")  or {}
    media   = item.get("media")   or {}
    listing = item.get("listing") or {}
    specs   = vehicle.get("specs") or {}

    price_raw = pricing.get("priceRaw") or ""
    if not price_raw and pricing.get("price"):
        price_raw = f"${int(pricing['price']):,}"

    mileage = vehicle.get("mileage")
    mileage_str = f"{int(mileage):,} mi" if mileage is not None else (vehicle.get("mileageRaw") or "N/A")

    distance = dealer.get("distanceMiles")
    distance_str = f"{distance} mi away" if distance is not None else ""

    return {
        "title":        _s(vehicle.get("title")),
        "year":         _s(vehicle.get("year")),
        "make":         _s(vehicle.get("make")),
        "model":        _s(vehicle.get("model")),
        "trim":         _s(vehicle.get("trim")),
        "price":        price_raw or "N/A",
        "mileage":      mileage_str,
        "body":         _s(vehicle.get("bodyStyle")),
        "fuel":         _s(specs.get("fuelType")),
        "transmission": _s(specs.get("transmission")),
        "drivetrain":   _s(specs.get("drivetrain")),
        "mpg":          f"{specs['mpgCombined']} mpg" if specs.get("mpgCombined") else "",
        "engine":       _s(specs.get("engine")),
        "vin":          _s(vehicle.get("vin")),
        "condition":    _s(vehicle.get("condition")),
        "deal_badge":   _s(pricing.get("dealBadge")),
        "days_on_market": _s(pricing.get("daysOnMarket")),
        "image":        _s(media.get("primaryImage")),
        "url":          _s(listing.get("listingUrl")),
        "dealer":       _s(dealer.get("name")),
        "dealer_city":  f"{dealer.get('city', '')}, {dealer.get('state', '')}".strip(", "),
        "dealer_phone": _s(dealer.get("phoneFormatted")),
        "dealer_rating":_s(dealer.get("rating")),
        "dealer_reviews":_s(dealer.get("reviewCount")),
        "distance":     distance_str,
        # keep legacy keys for card component
        "rating":       _s(dealer.get("rating")),
    }


def _run_actor(url: str, max_results: int = 100) -> tuple[list[dict], str | None]:
    api_token = os.environ.get("APIFY_API_TOKEN", "")
    if not api_token:
        return [], "APIFY_API_TOKEN environment variable is not set."
    try:
        client = ApifyClient(api_token)
        run = client.actor(ACTOR_ID).call(
            run_input={
                "startUrls": [{"url": url}],
                "maxItemsPerLink": max_results,
                "maxItemsTotal": max_results,
            }
        )
        items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
        return items, None
    except Exception as e:
        return [], str(e)


def scrape_raw(make: str = "Toyota", zip_code: str = "90210") -> dict:
    url = build_url(make=make, zip_code=zip_code)
    items, err = _run_actor(url)
    return {"raw": items[0] if items else {}, "error": err, "url": url}


def scrape_listings(
    make: str = "",
    model: str = "",
    zip_code: str = "90210",
    max_price: str = "",
    max_distance: str = "100",
    stock_type: str = "used",
    page: int = 1,
    max_results: int = 100,
) -> dict:
    url = build_url(make, model, zip_code, max_price, max_distance, stock_type, page)
    items, err = _run_actor(url, max_results)
    if err:
        return {"error": err, "listings": [], "total": 0, "url": url}

    listings = [_map_item(item) for item in items]
    return {"listings": listings, "total": len(listings), "page": page, "url": url, "error": None}
