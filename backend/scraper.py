import requests
from bs4 import BeautifulSoup
from typing import Optional
import re

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

BASE_URL = "https://www.cars.com/shopping/results/"


def build_url(
    make: str = "",
    model: str = "",
    zip_code: str = "90210",
    max_price: str = "",
    max_distance: str = "100",
    stock_type: str = "used",
    page: int = 1,
) -> str:
    params = {
        "stock_type": stock_type,
        "makes[]": make.lower(),
        "models[]": f"{make.lower()}-{model.lower()}" if model else "",
        "list_price_max": max_price,
        "maximum_distance": max_distance,
        "zip": zip_code,
        "page": page,
    }
    query = "&".join(f"{k}={v}" for k, v in params.items() if v)
    return f"{BASE_URL}?{query}"


def _clean(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


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

    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        return {"error": str(e), "listings": [], "total": 0, "url": url}

    soup = BeautifulSoup(resp.text, "lxml")
    cars = []

    # Each listing card
    for card in soup.select("div.vehicle-card"):
        title_el = card.select_one("h2.title")
        price_el = card.select_one("span.primary-price")
        mileage_el = card.select_one("div.mileage")
        dealer_el = card.select_one("div.dealer-name")
        location_el = card.select_one("div.miles-from")
        img_el = card.select_one("img.vehicle-image")
        link_el = card.select_one("a.vehicle-card-link")
        rating_el = card.select_one("span.sds-rating__count")
        badge_el = card.select_one("div.vehicle-badge-dealer-rating")

        # Extract details rows (mileage, color, etc.)
        details = {}
        for row in card.select("dl.vehicle-details dt, dl.vehicle-details dd"):
            pass  # built differently on cars.com

        # Build listing dict
        listing = {
            "title": _clean(title_el.text) if title_el else "N/A",
            "price": _clean(price_el.text) if price_el else "N/A",
            "mileage": _clean(mileage_el.text) if mileage_el else "N/A",
            "dealer": _clean(dealer_el.text) if dealer_el else "N/A",
            "distance": _clean(location_el.text) if location_el else "",
            "rating": _clean(rating_el.text) if rating_el else "",
            "image": img_el.get("src", "") if img_el else "",
            "url": "https://www.cars.com" + link_el.get("href", "") if link_el else "",
        }

        # Try to extract year/make/model from title
        match = re.match(r"^(\d{4})\s+(\w+)\s+(.+)$", listing["title"])
        if match:
            listing["year"] = match.group(1)
            listing["make"] = match.group(2)
            listing["model"] = match.group(3)
        else:
            listing["year"] = ""
            listing["make"] = make
            listing["model"] = model

        cars.append(listing)

    # Total count
    total_el = soup.select_one("span.total-filter-count, .total-found, [data-total-count]")
    total_text = _clean(total_el.text) if total_el else "0"
    total_num = int(re.sub(r"[^\d]", "", total_text) or 0)

    return {
        "listings": cars,
        "total": total_num,
        "page": page,
        "url": url,
        "error": None,
    }
