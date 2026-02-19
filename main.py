"""
Turathna Hub — FastAPI Marketplace Backend v1.0
Saudi artisan marketplace: onboarding, product listings, Stripe payments, SMSA shipping
Project 4 in the $3M ARR roadmap
"""
import os
import time
import uuid
import stripe
import hashlib
import secrets
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List
from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel, EmailStr
import uvicorn

# ── Stripe ────────────────────────────────────────────────────────────────────
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# ── Commission Plans ──────────────────────────────────────────────────────────
COMMISSION_RATES = {
    "basic":    {"rate": 0.15, "monthly_fee": 0,   "max_products": 10,  "name": "Basic (Free)"},
    "standard": {"rate": 0.10, "monthly_fee": 49,  "max_products": 100, "name": "Standard ($49/mo)"},
    "premium":  {"rate": 0.05, "monthly_fee": 149, "max_products": -1,  "name": "Premium ($149/mo)"},
}

PLAN_PRICE_IDS = {
    "standard": os.getenv("STRIPE_STANDARD_PRICE_ID", ""),
    "premium":  os.getenv("STRIPE_PREMIUM_PRICE_ID", ""),
}

# ── In-Memory DB ──────────────────────────────────────────────────────────────
artisans_db: Dict[str, dict] = {}     # api_key → artisan
products_db: Dict[str, dict] = {}     # product_id → product
orders_db:   Dict[str, dict] = {}     # order_id → order
buyers_db:   Dict[str, dict] = {}     # email → buyer

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Turathna Hub API",
    description="Saudi artisan marketplace — authentic handmade products",
    version="1.0.0",
)
# CORS: allow_credentials must be False when allow_origins=["*"] (CORS spec requirement)
# Set ALLOWED_ORIGINS env var to restrict to specific domains in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ────────────────────────────────────────────────────────────────────
class ArtisanOnboard(BaseModel):
    name: str
    email: str
    phone: str
    city: str
    craft_type: str           # pottery, weaving, jewelry, wood, leather, etc.
    bio: str
    bank_iban: Optional[str] = None
    plan: Optional[str] = "basic"

class ProductCreate(BaseModel):
    name_ar: str              # Arabic name
    name_en: str              # English name
    description_ar: str
    description_en: str
    price_sar: float          # Price in Saudi Riyals
    category: str
    stock: int
    images: Optional[List[str]] = []
    weight_kg: Optional[float] = 0.5
    dimensions: Optional[str] = ""

class OrderCreate(BaseModel):
    product_ids: List[str]
    quantities: List[int]
    buyer_name: str
    buyer_email: str
    buyer_phone: str
    delivery_address: str
    city: str
    postal_code: str

class CheckoutRequest(BaseModel):
    plan: str
    artisan_email: str

# ── Auth ──────────────────────────────────────────────────────────────────────
def get_artisan(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key not in artisans_db:
        raise HTTPException(status_code=401, detail="Invalid artisan API key")
    return artisans_db[x_api_key]

# ── SMSA Shipping Helper ──────────────────────────────────────────────────────
def estimate_shipping(city: str, weight_kg: float) -> dict:
    """Estimate SMSA shipping cost (simplified — integrate real SMSA API in production)"""
    base_rates = {
        "riyadh": 15, "jeddah": 20, "dammam": 20, "mecca": 25,
        "medina": 25, "khobar": 22, "tabuk": 35, "abha": 35,
    }
    city_lower = city.lower()
    base = base_rates.get(city_lower, 40)
    weight_surcharge = max(0, (weight_kg - 0.5) * 5)
    total = base + weight_surcharge
    return {
        "carrier": "SMSA Express",
        "estimated_days": 2 if city_lower in ["riyadh", "jeddah", "dammam"] else 4,
        "cost_sar": round(total, 2),
        "tracking_available": True,
    }

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def root():
    dashboard = Path(__file__).parent / "dashboard" / "index.html"
    if dashboard.exists():
        return FileResponse(dashboard)
    return HTMLResponse("<h1>Turathna Hub API</h1><p>Visit /docs</p>")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "artisans": len(artisans_db),
        "products": len(products_db),
        "orders": len(orders_db),
        "timestamp": datetime.utcnow().isoformat(),
    }

# ── Artisan Onboarding ────────────────────────────────────────────────────────
@app.post("/artisans/register")
async def register_artisan(data: ArtisanOnboard):
    """Onboard a new artisan — generates API key"""
    # Check if already registered
    existing = next((a for a in artisans_db.values() if a["email"] == data.email), None)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    api_key = f"tur_{secrets.token_urlsafe(32)}"
    artisan = {
        "api_key": api_key,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "city": data.city,
        "craft_type": data.craft_type,
        "bio": data.bio,
        "bank_iban": data.bank_iban,
        "plan": data.plan,
        "status": "pending_review",   # pending_review → active → suspended
        "products_count": 0,
        "total_sales_sar": 0.0,
        "rating": 0.0,
        "reviews_count": 0,
        "joined_at": datetime.utcnow().isoformat(),
        "stripe_account_id": None,
    }
    artisans_db[api_key] = artisan

    return {
        "api_key": api_key,
        "message": f"Welcome to Turathna Hub, {data.name}! Your account is pending review (1-2 business days).",
        "artisan_id": api_key[:12] + "...",
        "plan": COMMISSION_RATES[data.plan]["name"],
        "commission_rate": f"{int(COMMISSION_RATES[data.plan]['rate'] * 100)}%",
    }

@app.get("/artisans/me")
async def get_my_profile(artisan: dict = Depends(get_artisan)):
    """Get artisan profile and stats"""
    my_products = [p for p in products_db.values() if p["artisan_key"] == artisan["api_key"]]
    my_orders = [o for o in orders_db.values() if o.get("artisan_key") == artisan["api_key"]]
    return {
        **{k: v for k, v in artisan.items() if k != "api_key"},
        "products": len(my_products),
        "active_products": sum(1 for p in my_products if p["status"] == "active"),
        "total_orders": len(my_orders),
        "pending_orders": sum(1 for o in my_orders if o["status"] == "pending"),
        "plan_details": COMMISSION_RATES.get(artisan["plan"], COMMISSION_RATES["basic"]),
    }

# ── Products ──────────────────────────────────────────────────────────────────
@app.post("/products")
async def create_product(data: ProductCreate, artisan: dict = Depends(get_artisan)):
    """List a new product"""
    if artisan["status"] != "active":
        raise HTTPException(status_code=403, detail="Account must be active to list products. Pending review.")

    plan = artisan.get("plan", "basic")
    max_products = COMMISSION_RATES[plan]["max_products"]
    current_count = sum(1 for p in products_db.values() if p["artisan_key"] == artisan["api_key"])
    if max_products != -1 and current_count >= max_products:
        raise HTTPException(status_code=403, detail=f"Plan limit reached ({max_products} products). Upgrade to list more.")

    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    product = {
        "product_id": product_id,
        "artisan_key": artisan["api_key"],
        "artisan_name": artisan["name"],
        "artisan_city": artisan["city"],
        "name_ar": data.name_ar,
        "name_en": data.name_en,
        "description_ar": data.description_ar,
        "description_en": data.description_en,
        "price_sar": data.price_sar,
        "price_usd": round(data.price_sar / 3.75, 2),
        "category": data.category,
        "stock": data.stock,
        "images": data.images,
        "weight_kg": data.weight_kg,
        "dimensions": data.dimensions,
        "status": "active",
        "views": 0,
        "sales_count": 0,
        "rating": 0.0,
        "created_at": datetime.utcnow().isoformat(),
    }
    products_db[product_id] = product
    artisan["products_count"] = artisan.get("products_count", 0) + 1

    return {"product_id": product_id, "message": "Product listed successfully", "product": product}

@app.get("/products")
async def list_products(
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 20,
):
    """Browse marketplace products"""
    products = [p for p in products_db.values() if p["status"] == "active"]
    if category:
        products = [p for p in products if p["category"].lower() == category.lower()]
    if city:
        products = [p for p in products if p["artisan_city"].lower() == city.lower()]
    if min_price:
        products = [p for p in products if p["price_sar"] >= min_price]
    if max_price:
        products = [p for p in products if p["price_sar"] <= max_price]
    products.sort(key=lambda x: x["sales_count"], reverse=True)
    return {"products": products[:limit], "total": len(products)}

@app.get("/products/{product_id}")
async def get_product(product_id: str):
    if product_id not in products_db:
        raise HTTPException(status_code=404, detail="Product not found")
    product = products_db[product_id]
    product["views"] = product.get("views", 0) + 1
    shipping = estimate_shipping("riyadh", product.get("weight_kg", 0.5))
    return {**product, "shipping_estimate": shipping}

# ── Orders ────────────────────────────────────────────────────────────────────
@app.post("/orders")
async def create_order(data: OrderCreate):
    """Create an order and initiate Stripe checkout"""
    if len(data.product_ids) != len(data.quantities):
        raise HTTPException(status_code=400, detail="product_ids and quantities must match")

    line_items = []
    total_sar = 0.0
    order_products = []

    for pid, qty in zip(data.product_ids, data.quantities):
        if pid not in products_db:
            raise HTTPException(status_code=404, detail=f"Product {pid} not found")
        product = products_db[pid]
        if product["stock"] < qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name_en']}")
        subtotal = product["price_sar"] * qty
        total_sar += subtotal
        order_products.append({"product_id": pid, "name": product["name_en"], "qty": qty, "price_sar": product["price_sar"]})
        line_items.append({
            "price_data": {
                "currency": "sar",
                "product_data": {"name": product["name_en"], "description": product["description_en"][:100]},
                "unit_amount": int(product["price_sar"] * 100),
            },
            "quantity": qty,
        })

    # Estimate shipping
    shipping = estimate_shipping(data.city, sum(products_db[pid].get("weight_kg", 0.5) for pid in data.product_ids))
    total_sar += shipping["cost_sar"]

    order_id = f"ord_{uuid.uuid4().hex[:12]}"
    order = {
        "order_id": order_id,
        "buyer_name": data.buyer_name,
        "buyer_email": data.buyer_email,
        "buyer_phone": data.buyer_phone,
        "delivery_address": data.delivery_address,
        "city": data.city,
        "postal_code": data.postal_code,
        "products": order_products,
        "subtotal_sar": round(total_sar - shipping["cost_sar"], 2),
        "shipping_sar": shipping["cost_sar"],
        "total_sar": round(total_sar, 2),
        "shipping_info": shipping,
        "status": "pending_payment",
        "created_at": datetime.utcnow().isoformat(),
    }
    orders_db[order_id] = order

    # Create Stripe checkout
    if stripe.api_key:
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                customer_email=data.buyer_email,
                line_items=line_items,
                success_url=os.getenv("BASE_URL", "http://localhost:8004") + f"/order-success?order_id={order_id}",
                cancel_url=os.getenv("BASE_URL", "http://localhost:8004") + "/",
                metadata={"order_id": order_id},
            )
            order["stripe_session_id"] = session.id
            return {"order_id": order_id, "checkout_url": session.url, "total_sar": total_sar}
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))

    # Demo mode (no Stripe configured)
    return {"order_id": order_id, "message": "Order created (demo mode — Stripe not configured)", "total_sar": total_sar}

@app.get("/orders/{order_id}")
async def get_order(order_id: str):
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    return orders_db[order_id]

@app.get("/artisans/orders")
async def get_artisan_orders(artisan: dict = Depends(get_artisan)):
    """Get all orders for this artisan's products"""
    my_product_ids = {pid for pid, p in products_db.items() if p["artisan_key"] == artisan["api_key"]}
    my_orders = []
    for order in orders_db.values():
        for item in order.get("products", []):
            if item["product_id"] in my_product_ids:
                my_orders.append(order)
                break
    my_orders.sort(key=lambda x: x["created_at"], reverse=True)
    return {"orders": my_orders[:50], "total": len(my_orders)}

# ── Webhook ───────────────────────────────────────────────────────────────────
@app.post("/webhook")
async def stripe_webhook(request_body: bytes, stripe_signature: str = Header(None)):
    try:
        event = stripe.Webhook.construct_event(request_body, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = session.get("metadata", {}).get("order_id")
        if order_id and order_id in orders_db:
            orders_db[order_id]["status"] = "paid"
            orders_db[order_id]["paid_at"] = datetime.utcnow().isoformat()
            # Update stock
            for item in orders_db[order_id].get("products", []):
                pid = item["product_id"]
                if pid in products_db:
                    products_db[pid]["stock"] = max(0, products_db[pid]["stock"] - item["qty"])
                    products_db[pid]["sales_count"] = products_db[pid].get("sales_count", 0) + item["qty"]
            print(f"✅ Order paid: {order_id}")
    return {"received": True}

# ── Artisan Subscription ──────────────────────────────────────────────────────
@app.post("/artisans/upgrade")
async def upgrade_plan(request: CheckoutRequest):
    plan = request.plan.lower()
    if plan not in PLAN_PRICE_IDS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    price_id = PLAN_PRICE_IDS[plan]
    if not price_id:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            customer_email=request.artisan_email,
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=os.getenv("BASE_URL", "http://localhost:8004") + "/dashboard",
            cancel_url=os.getenv("BASE_URL", "http://localhost:8004") + "/pricing",
            metadata={"plan": plan, "email": request.artisan_email},
        )
        return {"checkout_url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ── Analytics ─────────────────────────────────────────────────────────────────
@app.get("/analytics/marketplace")
async def marketplace_analytics():
    """Public marketplace stats"""
    total_gmv = sum(o.get("total_sar", 0) for o in orders_db.values() if o.get("status") == "paid")
    return {
        "total_artisans": len(artisans_db),
        "active_artisans": sum(1 for a in artisans_db.values() if a["status"] == "active"),
        "total_products": len(products_db),
        "total_orders": len(orders_db),
        "paid_orders": sum(1 for o in orders_db.values() if o.get("status") == "paid"),
        "total_gmv_sar": round(total_gmv, 2),
        "categories": list(set(p["category"] for p in products_db.values())),
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/order-success")
async def order_success(order_id: str = ""):
    return HTMLResponse(f"""<html><head><title>Order Confirmed!</title>
    <style>body{{font-family:sans-serif;text-align:center;padding:80px;background:#07071a;color:white;}}
    h1{{color:#10b981;}} a{{color:#8b5cf6;}}</style></head>
    <body><h1>🎉 شكراً! Order Confirmed!</h1>
    <p>Order ID: <strong>{order_id}</strong></p>
    <p>You'll receive a confirmation email with tracking details.</p>
    <p><a href="/">← Continue Shopping</a></p></body></html>""")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8004, reload=True)
