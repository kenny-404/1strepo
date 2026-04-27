from bs4 import BeautifulSoup
from typing import Optional
from playwright.sync_api import sync_playwright
import re

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
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
            )
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1280, "height": 800},
                locale="en-US",
            )
            page_obj = context.new_page()

            # Block images/fonts to speed up load
            page_obj.route(
                "**/*.{png,jpg,jpeg,gif,webp,woff,woff2,ttf,otf}",
                lambda route: route.abort(),
            )

            page_obj.goto(url, wait_until="domcontentloaded", timeout=30000)
            # Wait for listing cards to appear
            try:
                page_obj.wait_for_selector("div.vehicle-card", timeout=15000)
            except Exception:
                pass  # Parse whatever loaded

            html = page_obj.content()
            browser.close()

    except Exception as e:
        return {"error": str(e), "listings": [], "total": 0, "url": url}

    soup = BeautifulSoup(html, "lxml")
    cars = []

    for card in soup.select("div.vehicle-card"):
        title_el    = card.select_one("h2.title")
        price_el    = card.select_one("span.primary-price")
        mileage_el  = card.select_one("div.mileage")
        dealer_el   = card.select_one("div.dealer-name")
        location_el = card.select_one("div.miles-from")
        img_el      = card.select_one("img.vehicle-image")
        link_el     = card.select_one("a.vehicle-card-link")
        rating_el   = card.select_one("span.sds-rating__count")

        listing = {
            "title":    _clean(title_el.text)    if title_el    else "N/A",
            "price":    _clean(price_el.text)    if price_el    else "N/A",
            "mileage":  _clean(mileage_el.text)  if mileage_el  else "N/A",
            "dealer":   _clean(dealer_el.text)   if dealer_el   else "N/A",
            "distance": _clean(location_el.text) if location_el else "",
            "rating":   _clean(rating_el.text)   if rating_el   else "",
            "image":    img_el.get("src", "")    if img_el      else "",
            "url":      "https://www.cars.com" + link_el.get("href", "") if link_el else "",
        }

        match = re.match(r"^(\d{4})\s+(\w+)\s+(.+)$", listing["title"])
        if match:
            listing["year"]  = match.group(1)
            listing["make"]  = match.group(2)
            listing["model"] = match.group(3)
        else:
            listing["year"]  = ""
            listing["make"]  = make
            listing["model"] = model

        cars.append(listing)

    total_el   = soup.select_one("span.total-filter-count, [data-total-count]")
    total_text = _clean(total_el.text) if total_el else "0"
    total_num  = int(re.sub(r"[^\d]", "", total_text) or 0)

    return {
        "listings": cars,
        "total":    total_num,
        "page":     page,
        "url":      url,
        "error":    None,
    }
