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


def _first(*keys, item: dict) -> str:
    """Return the first non-empty value among the given keys."""
    for k in keys:
        v = item.get(k)
        if v is not None and str(v).strip():
            return _str(v)
    return ""


def _price(item: dict) -> str:
    raw = _first("price", "listing_price", "listingPrice", "asking_price", item=item)
    if not raw:
        return "N/A"
    digits = re.sub(r"[^\d]", "", raw)
    if digits:
        return f"${int(digits):,}"
    return raw


def _mileage(item: dict) -> str:
    raw = _first("mileage", "miles", "odometer", "mileageValue", item=item)
    if not raw:
        return "N/A"
    digits = re.sub(r"[^\d]", "", raw)
    if digits:
        return f"{int(digits):,} mi"
    return raw


def _image(item: dict) -> str:
    for key in ("images", "media", "photos", "imageUrls"):
        val = item.get(key)
        if isinstance(val, list) and val:
            return _str(val[0].get("url", val[0]) if isinstance(val[0], dict) else val[0])
    return _first("image", "imageUrl", "thumbnail", item=item)


def _map_item(item: dict, make: str, model: str) -> dict:
    year  = _first("year", "modelYear", item=item)
    mk    = _first("make", "brand", item=item) or make
    mdl   = _first("model", item=item) or model

    # Build title from parts if not directly available
    title = _first("title", "name", "listingTitle", item=item)
    if not title and (year or mk or mdl):
        title = " ".join(filter(None, [year, mk, mdl]))

    return {
        "title":        title or "N/A",
        "price":        _price(item),
        "mileage":      _mileage(item),
        "year":         year,
        "make":         mk,
        "model":        mdl,
        "trim":         _first("trim", "trimLevel", item=item),
        "body":         _first("body_type", "bodyType", "bodyStyle", item=item),
        "fuel":         _first("fuel_type", "fuelType", "fuel", item=item),
        "transmission": _first("transmission", "transmissionType", item=item),
        "vin":          _first("vin", "VIN", item=item),
        "dealer":       _first("dealer", "dealer_name", "dealerName", "sellerName", item=item),
        "distance":     _first("distance", "miles_from_zip", "milesFromZip", item=item),
        "rating":       _first("dealer_rating", "dealerRating", "rating", item=item),
        "image":        _image(item),
        "url":          _first("url", "listing_url", "listingUrl", "link", item=item),
    }


def _run_actor(url: str) -> tuple[list[dict], str | None]:
    api_token = os.environ.get("APIFY_API_TOKEN", "")
    if not api_token:
        return [], "APIFY_API_TOKEN environment variable is not set."
    try:
        client = ApifyClient(api_token)
        run = client.actor(ACTOR_ID).call(
            run_input={"startUrls": [{"url": url}], "maxItemsPerLink": 20, "maxItemsTotal": 20}
        )
        items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
        return items, None
    except Exception as e:
        return [], str(e)


def scrape_raw(make: str = "Toyota", zip_code: str = "90210") -> dict:
    """Return first raw Apify item for debugging field names."""
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
) -> dict:
    url = build_url(make, model, zip_code, max_price, max_distance, stock_type, page)
    items, err = _run_actor(url)
    if err:
        return {"error": err, "listings": [], "total": 0, "url": url}

    listings = [_map_item(item, make, model) for item in items]
    return {"listings": listings, "total": len(listings), "page": page, "url": url, "error": None}
