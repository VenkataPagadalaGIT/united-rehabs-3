from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import math
import re as _re

from models import (
    User, UserCreate, UserLogin, Token,
    StateAddictionStatistics, StateAddictionStatisticsCreate,
    SubstanceStatistics, SubstanceStatisticsCreate,
    FreeResource, FreeResourceCreate,
    FAQ, FAQCreate,
    DataSource, DataSourceCreate,
    RehabGuide, RehabGuideCreate,
    PageContent, PageContentCreate,
    PageSEO, PageSEOCreate, GlobalSEOSettings, FolderSEORule,
    Article, ArticleCreate,
    PaginatedResponse, DashboardCounts,
    Country, CountryCreate, CountryStatistics, CountryStatisticsCreate,
    TreatmentCenter, TreatmentCenterCreate,
    CMSPage, CMSPageCreate, AuditLogEntry,
    StateDrugLaw, StateDrugLawCreate, LawSource
)
from pydantic import BaseModel
from auth import verify_password, get_password_hash, create_access_token, decode_token

# Import data validation middleware to prevent bad data
from data_validation_middleware import (
    validate_country_statistic,
    pre_save_validate,
    DataValidationError,
    AUTHORITATIVE_DATA
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'united_rehabs')]

# Rate limiter setup
# Custom function to get real IP behind proxy
def get_real_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"

limiter = Limiter(key_func=get_real_ip)

# Create the main app
app = FastAPI(title="United Rehabs API", version="1.0.0")

# Add rate limit exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# SECURITY: Global max limit cap to prevent memory exhaustion
MAX_QUERY_LIMIT = 200

def safe_limit(limit: int, default: int = 100) -> int:
    """Enforce max query limit to prevent memory exhaustion attacks"""
    return max(1, min(limit, MAX_QUERY_LIMIT))

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        # CSP - adjust as needed for your app
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:;"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================
# AUTH DEPENDENCIES
# ============================================

async def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        return None
    return User(**user_data)

async def require_admin(authorization: Optional[str] = Header(None)) -> User:
    user = await get_current_user(authorization)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============================================
# AUTH ROUTES
# ============================================

@api_router.post("/auth/register", response_model=Token)
@limiter.limit("3/minute")  # Prevent spam registrations
async def register(request: Request, user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password)
    )
    await db.users.insert_one(user.dict())
    
    # Generate token
    access_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=access_token,
        user={"id": user.id, "email": user.email, "role": user.role}
    )

@api_router.post("/auth/login", response_model=Token)
@limiter.limit("5/minute")  # Prevent brute force attacks
async def login(request: Request, user_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_doc)
    
    # Verify password
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    access_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=access_token,
        user={"id": user.id, "email": user.email, "role": user.role}
    )

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"id": user.id, "email": user.email, "role": user.role, "mfa_enabled": user.mfa_enabled}

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

@api_router.post("/auth/change-password")
async def change_password(
    request: PasswordChangeRequest,
    user: User = Depends(get_current_user)
):
    """Change user password - requires current password verification"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get full user from DB to verify current password
    user_doc = await db.users.find_one({"id": user.id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(request.current_password, user_doc["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Validate new password strength
    if len(request.new_password) < 12:
        raise HTTPException(status_code=400, detail="Password must be at least 12 characters")
    if not any(c.isupper() for c in request.new_password):
        raise HTTPException(status_code=400, detail="Password must contain uppercase letter")
    if not any(c.islower() for c in request.new_password):
        raise HTTPException(status_code=400, detail="Password must contain lowercase letter")
    if not any(c.isdigit() for c in request.new_password):
        raise HTTPException(status_code=400, detail="Password must contain a number")
    
    # Update password
    new_hash = get_password_hash(request.new_password)
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Password changed successfully"}

# ============================================
# DASHBOARD
# ============================================

@api_router.get("/dashboard/counts", response_model=DashboardCounts)
async def get_dashboard_counts():
    return DashboardCounts(
        statistics_count=await db.state_addiction_statistics.count_documents({}),
        substance_count=await db.substance_statistics.count_documents({}),
        resources_count=await db.free_resources.count_documents({}),
        sources_count=await db.data_sources.count_documents({}),
        guides_count=await db.rehab_guides.count_documents({}),
        faqs_count=await db.faqs.count_documents({}),
        articles_count=await db.articles.count_documents({}),
        seo_count=await db.page_seo.count_documents({})
    )

# ============================================
# STATE ADDICTION STATISTICS
# ============================================

@api_router.get("/statistics", response_model=List[StateAddictionStatistics])
async def get_statistics(
    state_id: Optional[str] = None,
    year: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if state_id:
        query["state_id"] = state_id
    if year:
        query["year"] = year
    
    cursor = db.state_addiction_statistics.find(query).sort([("state_name", 1), ("year", -1)]).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    return [StateAddictionStatistics(**r) for r in results]

# Move this BEFORE /statistics/{id} to avoid route conflict
@api_router.get("/statistics/pending-review")
async def get_pending_review_statistics(user: User = Depends(require_admin)):
    """Get all statistics pending review"""
    cursor = db.state_addiction_statistics.find(
        {"status": "review"},
        {"_id": 0}
    ).sort("status_updated_at", 1)
    results = await cursor.to_list(length=100)
    return {"pending": results, "count": len(results)}

@api_router.get("/statistics/{id}", response_model=StateAddictionStatistics)
async def get_statistic(id: str):
    result = await db.state_addiction_statistics.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Statistic not found")
    return StateAddictionStatistics(**result)

@api_router.post("/statistics", response_model=StateAddictionStatistics)
async def create_statistic(data: StateAddictionStatisticsCreate, user: User = Depends(require_admin)):
    stat = StateAddictionStatistics(**data.dict())
    await db.state_addiction_statistics.insert_one(stat.dict())
    return stat

@api_router.put("/statistics/{id}", response_model=StateAddictionStatistics)
async def update_statistic(id: str, data: StateAddictionStatisticsCreate, user: User = Depends(require_admin)):
    result = await db.state_addiction_statistics.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Statistic not found")
    
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    await db.state_addiction_statistics.update_one({"id": id}, {"$set": update_data})
    
    updated = await db.state_addiction_statistics.find_one({"id": id})
    return StateAddictionStatistics(**updated)

@api_router.delete("/statistics/{id}")
async def delete_statistic(id: str, user: User = Depends(require_admin)):
    result = await db.state_addiction_statistics.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Statistic not found")
    return {"message": "Deleted successfully"}

# ============================================
# SUBSTANCE STATISTICS
# ============================================

@api_router.get("/substance-statistics", response_model=List[SubstanceStatistics])
async def get_substance_statistics(
    state_id: Optional[str] = None,
    year: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if state_id:
        query["state_id"] = state_id
    if year:
        query["year"] = year
    
    cursor = db.substance_statistics.find(query).sort([("state_name", 1), ("year", -1)]).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    return [SubstanceStatistics(**r) for r in results]

@api_router.post("/substance-statistics", response_model=SubstanceStatistics)
async def create_substance_statistic(data: SubstanceStatisticsCreate, user: User = Depends(require_admin)):
    stat = SubstanceStatistics(**data.dict())
    await db.substance_statistics.insert_one(stat.dict())
    return stat

@api_router.put("/substance-statistics/{id}", response_model=SubstanceStatistics)
async def update_substance_statistic(id: str, data: SubstanceStatisticsCreate, user: User = Depends(require_admin)):
    result = await db.substance_statistics.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Substance statistic not found")
    
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    await db.substance_statistics.update_one({"id": id}, {"$set": update_data})
    
    updated = await db.substance_statistics.find_one({"id": id})
    return SubstanceStatistics(**updated)

@api_router.delete("/substance-statistics/{id}")
async def delete_substance_statistic(id: str, user: User = Depends(require_admin)):
    result = await db.substance_statistics.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Substance statistic not found")
    return {"message": "Deleted successfully"}

# ============================================
# FREE RESOURCES
# ============================================

@api_router.get("/resources", response_model=List[FreeResource])
async def get_resources(
    state_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    is_nationwide: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if state_id:
        query["$or"] = [{"state_id": state_id}, {"is_nationwide": True}]
    if resource_type:
        query["resource_type"] = resource_type
    if is_nationwide is not None:
        query["is_nationwide"] = is_nationwide
    
    cursor = db.free_resources.find(query).sort("sort_order", 1).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    return [FreeResource(**r) for r in results]

@api_router.post("/resources", response_model=FreeResource)
async def create_resource(data: FreeResourceCreate, user: User = Depends(require_admin)):
    resource = FreeResource(**data.dict())
    await db.free_resources.insert_one(resource.dict())
    return resource

@api_router.put("/resources/{id}", response_model=FreeResource)
async def update_resource(id: str, data: FreeResourceCreate, user: User = Depends(require_admin)):
    result = await db.free_resources.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    await db.free_resources.update_one({"id": id}, {"$set": update_data})
    
    updated = await db.free_resources.find_one({"id": id})
    return FreeResource(**updated)

@api_router.delete("/resources/{id}")
async def delete_resource(id: str, user: User = Depends(require_admin)):
    result = await db.free_resources.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Deleted successfully"}

# ============================================
# FAQs
# ============================================

@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs(
    state_id: Optional[str] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if state_id:
        query["$or"] = [{"state_id": state_id}, {"state_id": None}]
    if category:
        query["category"] = category
    if is_active is not None:
        query["is_active"] = is_active
    
    cursor = db.faqs.find(query).sort("sort_order", 1).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    return [FAQ(**r) for r in results]

@api_router.post("/faqs", response_model=FAQ)
async def create_faq(data: FAQCreate, user: User = Depends(require_admin)):
    faq = FAQ(**data.dict())
    await db.faqs.insert_one(faq.dict())
    return faq

@api_router.put("/faqs/{id}", response_model=FAQ)
async def update_faq(id: str, data: FAQCreate, user: User = Depends(require_admin)):
    result = await db.faqs.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    await db.faqs.update_one({"id": id}, {"$set": update_data})
    
    updated = await db.faqs.find_one({"id": id})
    return FAQ(**updated)

@api_router.delete("/faqs/{id}")
async def delete_faq(id: str, user: User = Depends(require_admin)):
    result = await db.faqs.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"message": "Deleted successfully"}

# ============================================
# DATA SOURCES
# ============================================

@api_router.get("/data-sources", response_model=List[DataSource])
async def get_data_sources(skip: int = 0, limit: int = 100):
    cursor = db.data_sources.find({}).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    return [DataSource(**r) for r in results]

@api_router.post("/data-sources", response_model=DataSource)
async def create_data_source(data: DataSourceCreate, user: User = Depends(require_admin)):
    source = DataSource(**data.dict())
    await db.data_sources.insert_one(source.dict())
    return source

@api_router.put("/data-sources/{id}", response_model=DataSource)
async def update_data_source(id: str, data: DataSourceCreate, user: User = Depends(require_admin)):
    result = await db.data_sources.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    await db.data_sources.update_one({"id": id}, {"$set": data.dict()})
    updated = await db.data_sources.find_one({"id": id})
    return DataSource(**updated)

@api_router.delete("/data-sources/{id}")
async def delete_data_source(id: str, user: User = Depends(require_admin)):
    result = await db.data_sources.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Data source not found")
    return {"message": "Deleted successfully"}

# ============================================
# REHAB GUIDES
# ============================================

@api_router.get("/guides", response_model=List[RehabGuide])
async def get_guides(
    category: Optional[str] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if category:
        query["category"] = category
    if is_active is not None:
        query["is_active"] = is_active
    
    cursor = db.rehab_guides.find(query).sort("sort_order", 1).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    return [RehabGuide(**r) for r in results]

@api_router.post("/guides", response_model=RehabGuide)
async def create_guide(data: RehabGuideCreate, user: User = Depends(require_admin)):
    guide = RehabGuide(**data.dict())
    await db.rehab_guides.insert_one(guide.dict())
    return guide

@api_router.put("/guides/{id}", response_model=RehabGuide)
async def update_guide(id: str, data: RehabGuideCreate, user: User = Depends(require_admin)):
    result = await db.rehab_guides.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    await db.rehab_guides.update_one({"id": id}, {"$set": update_data})
    
    updated = await db.rehab_guides.find_one({"id": id})
    return RehabGuide(**updated)

@api_router.delete("/guides/{id}")
async def delete_guide(id: str, user: User = Depends(require_admin)):
    result = await db.rehab_guides.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Guide not found")
    return {"message": "Deleted successfully"}

# ============================================
# PAGE CONTENT
# ============================================

@api_router.get("/page-content", response_model=List[PageContent])
async def get_page_content(
    page_key: Optional[str] = None,
    state_id: Optional[str] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if page_key:
        query["page_key"] = page_key
    if state_id:
        query["state_id"] = state_id
    if is_active is not None:
        query["is_active"] = is_active
    
    cursor = db.page_content.find(query).sort("sort_order", 1).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    return [PageContent(**r) for r in results]

@api_router.post("/page-content", response_model=PageContent)
async def create_page_content(data: PageContentCreate, user: User = Depends(require_admin)):
    content = PageContent(**data.dict())
    await db.page_content.insert_one(content.dict())
    return content

@api_router.put("/page-content/{id}", response_model=PageContent)
async def update_page_content(id: str, data: PageContentCreate, user: User = Depends(require_admin)):
    result = await db.page_content.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Page content not found")
    
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    await db.page_content.update_one({"id": id}, {"$set": update_data})
    
    updated = await db.page_content.find_one({"id": id})
    return PageContent(**updated)

@api_router.delete("/page-content/{id}")
async def delete_page_content(id: str, user: User = Depends(require_admin)):
    result = await db.page_content.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page content not found")
    return {"message": "Deleted successfully"}

# ============================================
# PAGE SEO
# ============================================

@api_router.get("/page-seo", response_model=List[PageSEO])
async def get_page_seo(
    page_type: Optional[str] = None,
    state_id: Optional[str] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if page_type:
        query["page_type"] = page_type
    if state_id:
        query["state_id"] = state_id
    if is_active is not None:
        query["is_active"] = is_active
    
    cursor = db.page_seo.find(query).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    return [PageSEO(**r) for r in results]

@api_router.get("/page-seo/by-slug/{slug}")
async def get_page_seo_by_slug(slug: str):
    result = await db.page_seo.find_one({"page_slug": slug, "is_active": True})
    if not result:
        return None
    return PageSEO(**result)

@api_router.post("/page-seo", response_model=PageSEO)
async def create_page_seo(data: PageSEOCreate, user: User = Depends(require_admin)):
    seo = PageSEO(**data.dict())
    await db.page_seo.insert_one(seo.dict())
    return seo

@api_router.put("/page-seo/{id}", response_model=PageSEO)
async def update_page_seo(id: str, data: PageSEOCreate, user: User = Depends(require_admin)):
    result = await db.page_seo.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Page SEO not found")
    
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    await db.page_seo.update_one({"id": id}, {"$set": update_data})
    
    updated = await db.page_seo.find_one({"id": id})
    return PageSEO(**updated)

@api_router.delete("/page-seo/{id}")
async def delete_page_seo(id: str, user: User = Depends(require_admin)):
    result = await db.page_seo.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page SEO not found")
    return {"message": "Deleted successfully"}

# ============================================
# ARTICLES
# ============================================

@api_router.get("/articles")
async def get_articles(
    content_type: Optional[str] = None,
    is_published: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    category: Optional[str] = None,
    state_id: Optional[str] = None,
    tag: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if content_type:
        query["content_type"] = content_type
    if is_published is not None:
        query["is_published"] = is_published
    if is_featured is not None:
        query["is_featured"] = is_featured
    if category:
        query["category"] = category
    if state_id:
        query["state_id"] = state_id
    if tag:
        query["tags"] = tag
    
    cursor = db.articles.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    total = await db.articles.count_documents(query)
    return {"items": [Article(**r) for r in results], "total": total}

@api_router.get("/articles/by-slug/{content_type}/{slug}")
async def get_article_by_slug(content_type: str, slug: str):
    result = await db.articles.find_one({"content_type": content_type, "slug": slug}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment view count
    await db.articles.update_one({"id": result["id"]}, {"$inc": {"views_count": 1}})
    
    return Article(**result)

@api_router.post("/articles", response_model=Article)
async def create_article(data: ArticleCreate, user: User = Depends(require_admin)):
    article_data = data.dict()
    if data.is_published:
        article_data["published_at"] = datetime.utcnow()
    article = Article(**article_data)
    await db.articles.insert_one(article.dict())
    return article

@api_router.put("/articles/{id}", response_model=Article)
async def update_article(id: str, data: ArticleCreate, user: User = Depends(require_admin)):
    result = await db.articles.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    # Set published_at if publishing for the first time
    if data.is_published and not result.get("published_at"):
        update_data["published_at"] = datetime.utcnow()
    
    await db.articles.update_one({"id": id}, {"$set": update_data})
    updated = await db.articles.find_one({"id": id})
    return Article(**updated)

@api_router.delete("/articles/{id}")
async def delete_article(id: str, user: User = Depends(require_admin)):
    result = await db.articles.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Deleted successfully"}

@api_router.post("/articles/bulk")
async def bulk_import_articles(articles: List[ArticleCreate], user: User = Depends(require_admin)):
    """Bulk create/update news articles"""
    created = 0
    updated = 0
    for data in articles:
        existing = await db.articles.find_one({"slug": data.slug, "content_type": data.content_type})
        article_data = data.dict()
        if existing:
            article_data["updated_at"] = datetime.utcnow()
            if data.is_published and not existing.get("published_at"):
                article_data["published_at"] = datetime.utcnow()
            await db.articles.update_one({"id": existing["id"]}, {"$set": article_data})
            updated += 1
        else:
            if data.is_published:
                article_data["published_at"] = datetime.utcnow()
            article = Article(**article_data)
            await db.articles.insert_one(article.dict())
            created += 1
    return {"created": created, "updated": updated, "total": created + updated}

@api_router.get("/articles/tags")
async def get_article_tags():
    """Get all unique tags with taxonomy labels and categories"""
    raw_tags = await db.articles.distinct("tags", {"is_published": True})
    # Build taxonomy lookup
    taxonomy = {}
    async for t in db.tag_taxonomy.find({}, {"_id": 0}):
        taxonomy[t["slug"]] = t

    result = []
    seen = set()
    for tag in sorted(raw_tags):
        if not tag:
            continue
        slug = tag.lower().strip()
        if slug in seen:
            continue
        seen.add(slug)
        info = taxonomy.get(slug, {})
        result.append({
            "slug": slug,
            "label": info.get("label", slug.replace("-", " ").title()),
            "category": info.get("category", "Other"),
            "color": info.get("color", "#6B7280"),
        })
    return result

@api_router.get("/news/{slug}")
async def get_news_by_slug(slug: str):
    """Get a news article by slug - public endpoint"""
    result = await db.articles.find_one({"slug": slug, "content_type": "news", "is_published": True}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Article not found")
    await db.articles.update_one({"id": result["id"]}, {"$inc": {"views_count": 1}})
    return Article(**result)

# Sidebar links config (editable by admin)
@api_router.get("/config/sidebar-links")
async def get_sidebar_links():
    config = await db.site_config.find_one({"key": "sidebar_links"}, {"_id": 0})
    return config.get("links", []) if config else []

@api_router.put("/config/sidebar-links")
async def update_sidebar_links(links: List[Dict[str, str]], user: User = Depends(require_admin)):
    await db.site_config.update_one(
        {"key": "sidebar_links"},
        {"$set": {"key": "sidebar_links", "links": links, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    return {"success": True}

# ============================================
# OPTIMIZED HOMEPAGE API (Single call for all data)
# ============================================

_homepage_cache = {"data": None, "generated_at": 0}

@api_router.get("/homepage/data")
async def get_homepage_data():
    """
    Single optimized API call that returns all homepage data.
    Cached for 1 hour - data changes infrequently.
    """
    import time
    if _homepage_cache["data"] and (time.time() - _homepage_cache["generated_at"]) < 3600:
        return _homepage_cache["data"]
    
    # Aggregate national statistics (sum of all states for latest year)
    pipeline_national = [
        {"$match": {"year": 2025}},
        {"$group": {
            "_id": None,
            "total_affected": {"$sum": "$total_affected"},
            "total_overdose_deaths": {"$sum": "$overdose_deaths"},
            "total_treatment_centers": {"$sum": "$total_treatment_centers"},
            "total_treatment_admissions": {"$sum": "$treatment_admissions"},
            "avg_recovery_rate": {"$avg": "$recovery_rate"},
            "total_economic_cost": {"$sum": "$economic_cost_billions"}
        }}
    ]
    national_stats = await db.state_addiction_statistics.aggregate(pipeline_national).to_list(1)
    
    # Get top 10 states by affected population
    pipeline_top_states = [
        {"$match": {"year": 2025}},
        {"$sort": {"total_affected": -1}},
        {"$limit": 10},
        {"$project": {
            "_id": 0,
            "state_id": 1,
            "state_name": 1,
            "total_affected": 1,
            "overdose_deaths": 1,
            "total_treatment_centers": 1,
            "recovery_rate": 1
        }}
    ]
    top_states = await db.state_addiction_statistics.aggregate(pipeline_top_states).to_list(10)
    
    # Get featured treatment centers (limit 8)
    featured_centers = await db.treatment_centers.find(
        {"is_featured": True, "is_active": True},
        {"_id": 0}
    ).sort("rating", -1).limit(8).to_list(8)
    
    # If no featured centers, get any active centers
    if not featured_centers:
        featured_centers = await db.treatment_centers.find(
            {"is_active": True},
            {"_id": 0}
        ).sort("rating", -1).limit(8).to_list(8)
    
    # Get general FAQs (not state-specific) for homepage
    general_faqs = await db.faqs.find(
        {"$or": [{"state_id": None}, {"state_id": ""}], "is_active": True},
        {"_id": 0}
    ).limit(6).to_list(6)
    
    # If no general FAQs, get a sample from any state
    if not general_faqs:
        general_faqs = await db.faqs.find(
            {"is_active": True},
            {"_id": 0}
        ).limit(6).to_list(6)
    
    # Get state counts for location section
    state_counts = await db.state_addiction_statistics.aggregate([
        {"$match": {"year": 2025}},
        {"$project": {
            "_id": 0,
            "state_id": 1,
            "state_name": 1,
            "total_treatment_centers": 1
        }},
        {"$sort": {"total_treatment_centers": -1}}
    ]).to_list(51)
    
    result = {
        "national_stats": national_stats[0] if national_stats else {},
        "top_states": top_states,
        "featured_centers": featured_centers,
        "faqs": general_faqs,
        "state_counts": state_counts,
        "data_year": 2025
    }
    
    _homepage_cache["data"] = result
    _homepage_cache["generated_at"] = time.time()
    return result

# ============================================
# TREATMENT CENTERS
# ============================================

@api_router.get("/treatment-centers")
async def get_treatment_centers(
    country_code: Optional[str] = None,
    state_id: Optional[str] = None,
    city: Optional[str] = None,
    treatment_type: Optional[str] = None,
    is_featured: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20
):
    query = {"is_active": True}
    if country_code:
        query["country_code"] = country_code.upper()
    if state_id:
        query["state_id"] = state_id.upper()
    if city:
        query["city"] = {"$regex": _re.escape(city), "$options": "i"}
    if treatment_type:
        query["treatment_types"] = treatment_type
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    cursor = db.treatment_centers.find(query, {"_id": 0}).sort([("is_featured", -1), ("rating", -1)]).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    total = await db.treatment_centers.count_documents(query)
    
    # Get filter options
    all_countries = await db.treatment_centers.distinct("country_code", {"is_active": True})
    all_types = await db.treatment_centers.distinct("treatment_types", {"is_active": True})
    
    return {
        "centers": results,
        "total": total,
        "skip": skip,
        "limit": limit,
        "filters": {
            "countries": sorted(all_countries),
            "treatment_types": sorted([t for t in all_types if t]),
        }
    }

@api_router.get("/treatment-centers/search")
async def search_treatment_centers_endpoint(
    q: Optional[str] = None,
    country_code: Optional[str] = None,
    state_id: Optional[str] = None,
    city: Optional[str] = None,
    treatment_type: Optional[str] = None,
    insurance: Optional[str] = None,
    is_featured: Optional[bool] = None,
    min_rating: Optional[float] = None,
    skip: int = 0,
    limit: int = 20
):
    """Advanced search for treatment centers"""
    query = {"is_active": True}
    
    if q:
        query["name"] = {"$regex": _re.escape(q), "$options": "i"}
    if country_code:
        query["country_code"] = country_code.upper()
    if state_id:
        query["state_id"] = state_id.upper()
    if city:
        query["city"] = {"$regex": _re.escape(city), "$options": "i"}
    if treatment_type:
        query["treatment_types"] = treatment_type
    if insurance:
        query["insurance_accepted"] = insurance
    if is_featured is not None:
        query["is_featured"] = is_featured
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    
    cursor = db.treatment_centers.find(query, {"_id": 0}).sort([("is_featured", -1), ("rating", -1)]).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    total = await db.treatment_centers.count_documents(query)
    
    return {
        "centers": results,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@api_router.get("/treatment-centers/{id}")
async def get_treatment_center(id: str):
    result = await db.treatment_centers.find_one({"id": id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Treatment center not found")
    return result

# ============================================
# HEALTH CHECK
# ============================================

@api_router.get("/")
async def root():
    return {"message": "United Rehabs API v1.0.0", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ============================================
# AI CONTENT GENERATION
# ============================================

from pydantic import BaseModel

class ContentGenerationRequest(BaseModel):
    state_name: str
    state_abbrev: str
    data_type: str = "statistics"  # statistics, resources, faqs

class ContentWriteRequest(BaseModel):
    state_name: str
    state_abbrev: str
    content_type: str = "page_intro"  # page_intro, seo_description, article
    research_data: str

class QAReviewRequest(BaseModel):
    content: str
    state_name: str
    state_abbrev: str

@api_router.post("/generate/research")
async def research_state_data(request: ContentGenerationRequest, user: User = Depends(require_admin)):
    """Research addiction data for a specific state using AI."""
    try:
        from content_generator import content_generator
        result = await content_generator.research_state_data(
            state_name=request.state_name,
            state_abbrev=request.state_abbrev,
            data_type=request.data_type
        )
        return result
    except ImportError:
        raise HTTPException(status_code=500, detail="Content generator not available")
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/generate/content")
async def generate_content(request: ContentWriteRequest, user: User = Depends(require_admin)):
    """Generate SEO-optimized content based on research data."""
    try:
        from content_generator import content_generator
        result = await content_generator.generate_content(
            state_name=request.state_name,
            state_abbrev=request.state_abbrev,
            content_type=request.content_type,
            research_data=request.research_data
        )
        return result
    except ImportError:
        raise HTTPException(status_code=500, detail="Content generator not available")
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/generate/qa")
async def qa_review_content(request: QAReviewRequest, user: User = Depends(require_admin)):
    """QA review of generated content for accuracy and quality."""
    try:
        from content_generator import content_generator
        result = await content_generator.qa_review(
            content=request.content,
            state_name=request.state_name,
            state_abbrev=request.state_abbrev
        )
        return result
    except ImportError:
        raise HTTPException(status_code=500, detail="Content generator not available")
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================
# FULL DATA PIPELINE
# ============================================

class PipelineRequest(BaseModel):
    state_name: str
    state_abbrev: str
    years: List[int] = [2019, 2020, 2021, 2022, 2023, 2024]

@api_router.post("/pipeline/run")
async def run_data_pipeline(request: PipelineRequest, user: User = Depends(require_admin)):
    """
    Run the full multi-agent data pipeline for a state.
    - Agent 1: Research (gathers data)
    - Agent 2: Content Generator (creates SEO content)
    - Agent 3: Fact Checker (verifies accuracy)
    - Agent 4: QA (ensures database/frontend consistency)
    """
    try:
        from data_pipeline import StateDataPipeline
        pipeline = StateDataPipeline(db)
        result = await pipeline.run_full_pipeline(
            state_name=request.state_name,
            state_abbrev=request.state_abbrev,
            years=request.years
        )
        return result
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Pipeline not available: {e}")
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/pipeline/status/{state_abbrev}")
async def get_pipeline_status(state_abbrev: str):
    """Get the data status for a state (how much data is cached in DB)."""
    stats_count = await db.state_addiction_statistics.count_documents({"state_id": state_abbrev})
    substance_count = await db.substance_statistics.count_documents({"state_id": state_abbrev})
    faqs_count = await db.faqs.count_documents({"state_id": state_abbrev})
    resources_count = await db.free_resources.count_documents({"state_id": state_abbrev})
    seo_count = await db.page_seo.count_documents({"state_id": state_abbrev})
    
    # Get years covered
    years_cursor = db.state_addiction_statistics.distinct("year", {"state_id": state_abbrev})
    years = await years_cursor if hasattr(years_cursor, '__await__') else years_cursor
    
    return {
        "state_id": state_abbrev,
        "data_cached": {
            "statistics": stats_count,
            "substance_stats": substance_count,
            "faqs": faqs_count,
            "resources": resources_count,
            "seo": seo_count
        },
        "years_covered": sorted(years) if isinstance(years, list) else [],
        "ready_for_frontend": stats_count > 0 and substance_count > 0,
        "needs_api_call": stats_count == 0
    }

# ============================================
# BULK IMPORT/EXPORT
# ============================================

class BulkImportRequest(BaseModel):
    data: str  # CSV or table data as string
    data_type: str = "statistics"  # statistics, substance, faqs
    format: str = "table"  # table, csv, json
    mode: str = "upsert"  # upsert, insert, replace

class BulkValidateRequest(BaseModel):
    data: str
    format: str = "table"

@api_router.post("/bulk/validate")
async def validate_bulk_data(request: BulkValidateRequest, user: User = Depends(require_admin)):
    """Validate bulk data before importing (preview mode)"""
    try:
        from bulk_import import BulkDataService
        service = BulkDataService(db)
        
        if request.format == "csv":
            result = await service.parse_csv_statistics(request.data)
        else:
            result = await service.parse_table_statistics(request.data)
        
        return {
            "success": True,
            "preview": result,
            "summary": {
                "total_rows": result["total"],
                "valid_rows": result["valid_count"],
                "invalid_rows": result["total"] - result["valid_count"],
                "errors": result["errors"]
            }
        }
    except Exception as e:
        logging.exception("Bad request error")
        raise HTTPException(status_code=400, detail="Invalid request")

@api_router.post("/bulk/import")
async def import_bulk_data(request: BulkImportRequest, user: User = Depends(require_admin)):
    """Import bulk data (CSV or pasted table)"""
    try:
        from bulk_import import BulkDataService
        service = BulkDataService(db)
        
        # Parse data
        if request.format == "csv":
            parsed = await service.parse_csv_statistics(request.data)
        else:
            parsed = await service.parse_table_statistics(request.data)
        
        if parsed["errors"] and not parsed["rows"]:
            return {"success": False, "error": "Failed to parse data", "details": parsed["errors"]}
        
        # Import to database
        result = await service.import_statistics(parsed["rows"], mode=request.mode)
        
        return {
            "success": True,
            "result": result,
            "message": f"Imported {result['imported']} new, updated {result['updated']}, skipped {result['skipped']}"
        }
    except Exception as e:
        logging.exception("Bad request error")
        raise HTTPException(status_code=400, detail="Invalid request")

@api_router.get("/bulk/export/{data_type}")
async def export_bulk_data(data_type: str, state_id: Optional[str] = None, format: str = "csv", user: User = Depends(require_admin)):
    """Export data as CSV or JSON"""
    try:
        from bulk_import import BulkDataService
        service = BulkDataService(db)
        
        if data_type == "statistics":
            content = await service.export_statistics(state_id=state_id, format=format)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported data type: {data_type}")
        
        return {
            "success": True,
            "format": format,
            "content": content
        }
    except Exception as e:
        logging.exception("Bad request error")
        raise HTTPException(status_code=400, detail="Invalid request")

@api_router.get("/bulk/template/{data_type}")
async def get_import_template(data_type: str, format: str = "table"):
    """Get import template for bulk data"""
    from bulk_import import STATISTICS_CSV_TEMPLATE, STATISTICS_TABLE_TEMPLATE
    
    templates = {
        "statistics": {
            "csv": STATISTICS_CSV_TEMPLATE,
            "table": STATISTICS_TABLE_TEMPLATE
        }
    }
    
    if data_type not in templates:
        raise HTTPException(status_code=400, detail=f"Unknown data type: {data_type}")
    
    return {
        "data_type": data_type,
        "format": format,
        "template": templates[data_type].get(format, templates[data_type]["table"]),
        "fields": [
            {"name": "state_id", "required": True, "example": "FL"},
            {"name": "state_name", "required": True, "example": "Florida"},
            {"name": "year", "required": True, "example": "2024"},
            {"name": "total_affected", "required": False, "example": "1402500"},
            {"name": "overdose_deaths", "required": False, "example": "7200"},
            {"name": "opioid_deaths", "required": False, "example": "6400"},
            {"name": "recovery_rate", "required": False, "example": "42.0"},
            {"name": "data_source", "required": False, "example": "SAMHSA NSDUH"}
        ]
    }

@api_router.get("/bulk/compare/{state_id}")
async def compare_data_sources(state_id: str, user: User = Depends(require_admin)):
    """Compare AI-generated vs manually imported data for a state"""
    try:
        from bulk_import import BulkDataService
        service = BulkDataService(db)
        result = await service.get_data_comparison(state_id)
        return {"success": True, "comparison": result}
    except Exception as e:
        logging.exception("Bad request error")
        raise HTTPException(status_code=400, detail="Invalid request")

# ============================================
# COUNTRIES API (International Expansion)
# ============================================

@api_router.get("/countries")
async def get_countries(
    region: Optional[str] = None,
    is_active: bool = True,
    skip: int = 0,
    limit: int = 200
):
    """Get all countries with optional region filter"""
    query = {"is_active": is_active} if is_active else {}
    if region:
        query["region"] = region
    
    cursor = db.countries.find(query, {"_id": 0}).sort("country_name", 1).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    total = await db.countries.count_documents(query)
    
    return {
        "countries": results,
        "total": total,
        "regions": ["North America", "Europe", "Asia", "South America", "Oceania", "Africa"]
    }

@api_router.get("/countries/{country_code}")
async def get_country(country_code: str):
    """Get single country details with latest statistics"""
    country = await db.countries.find_one({"country_code": country_code.upper()}, {"_id": 0})
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    
    # Get latest statistics
    latest_stats = await db.country_statistics.find_one(
        {"country_code": country_code.upper()},
        {"_id": 0},
        sort=[("year", -1)]
    )
    
    # Get available years
    years = await db.country_statistics.distinct("year", {"country_code": country_code.upper()})
    
    # Get treatment centers count
    centers_count = await db.treatment_centers.count_documents({
        "country_code": country_code.upper(),
        "is_active": True
    })
    
    return {
        **country,
        "latest_statistics": latest_stats,
        "available_years": sorted(years, reverse=True),
        "treatment_centers_count": centers_count
    }

@api_router.get("/countries/{country_code}/statistics")
async def get_country_statistics(
    country_code: str,
    year: Optional[int] = None,
    skip: int = 0,
    limit: int = 10
):
    """Get statistics for a country with optional year filter"""
    query = {"country_code": country_code.upper()}
    if year:
        query["year"] = year
    
    cursor = db.country_statistics.find(query, {"_id": 0}).sort("year", -1).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    
    return {
        "statistics": results,
        "country_code": country_code.upper(),
        "years_covered": sorted(set(r["year"] for r in results), reverse=True)
    }

@api_router.get("/countries/{country_code}/centers")
async def get_country_treatment_centers(
    country_code: str,
    city: Optional[str] = None,
    treatment_type: Optional[str] = None,
    is_featured: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get treatment centers in a country"""
    query = {"country_code": country_code.upper(), "is_active": True}
    if city:
        query["city"] = {"$regex": _re.escape(city), "$options": "i"}
    if treatment_type:
        query["treatment_types"] = treatment_type
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    cursor = db.treatment_centers.find(query, {"_id": 0}).sort("rating", -1).skip(skip).limit(safe_limit(limit))
    results = await cursor.to_list(length=safe_limit(limit))
    total = await db.treatment_centers.count_documents(query)
    
    return {
        "centers": results,
        "total": total,
        "country_code": country_code.upper()
    }

# ============================================
# CMS PAGES API (Legal/Static Pages)
# ============================================

@api_router.get("/pages/{slug}")
async def get_cms_page(slug: str):
    """Get CMS page content by slug (about-us, privacy-policy, etc.)"""
    page = await db.cms_pages.find_one(
        {"slug": slug, "is_published": True},
        {"_id": 0}
    )
    if not page:
        # Return default content if page doesn't exist
        defaults = {
            "about-us": {
                "title": "About United Rehabs",
                "content": "<h2>Our Mission</h2><p>United Rehabs is dedicated to connecting individuals struggling with addiction to quality treatment centers worldwide.</p>",
            },
            "privacy-policy": {
                "title": "Privacy Policy",
                "content": "<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>",
            },
            "terms-of-service": {
                "title": "Terms of Service",
                "content": "<h2>Terms of Service</h2><p>By using United Rehabs, you agree to these terms and conditions.</p>",
            }
        }
        return defaults.get(slug, {"title": "Page Not Found", "content": ""})
    return page

@api_router.put("/pages/{slug}")
async def update_cms_page(slug: str, data: CMSPageCreate, user: User = Depends(require_admin)):
    """Update CMS page content (admin only)"""
    existing = await db.cms_pages.find_one({"slug": slug})
    
    page_data = data.dict()
    page_data["slug"] = slug
    page_data["updated_at"] = datetime.utcnow()
    page_data["last_edited_by"] = user.email
    
    if existing:
        page_data["version"] = existing.get("version", 1) + 1
        await db.cms_pages.update_one({"slug": slug}, {"$set": page_data})
    else:
        page_data["id"] = str(__import__("uuid").uuid4())
        page_data["version"] = 1
        page_data["created_at"] = datetime.utcnow()
        page_data["published_at"] = datetime.utcnow() if data.is_published else None
        await db.cms_pages.insert_one(page_data)
    
    # Log the change
    await log_audit_entry("cms_pages", slug, "update", user.email, page_data)
    
    return {"success": True, "message": f"Page '{slug}' updated"}

# ============================================
# AUDIT LOG API (Version History)
# ============================================

async def log_audit_entry(collection: str, document_id: str, action: str, user_email: str, data: dict = None):
    """Log an audit entry for tracking changes"""
    entry = {
        "id": str(__import__("uuid").uuid4()),
        "collection": collection,
        "document_id": document_id,
        "action": action,
        "user_email": user_email,
        "changes": data,
        "timestamp": datetime.utcnow()
    }
    await db.audit_log.insert_one(entry)

@api_router.get("/audit/{collection}/{document_id}")
async def get_audit_history(collection: str, document_id: str, user: User = Depends(require_admin)):
    """Get change history for a document"""
    cursor = db.audit_log.find(
        {"collection": collection, "document_id": document_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50)
    
    results = await cursor.to_list(length=50)
    return {"history": results, "collection": collection, "document_id": document_id}

# ============================================
# GLOBAL STATISTICS API
# ============================================

@api_router.get("/global/statistics")
async def get_global_statistics(year: int = 2025):
    """Get aggregated global statistics across all countries"""
    pipeline = [
        {"$match": {"year": year}},
        {"$group": {
            "_id": None,
            "total_countries": {"$sum": 1},
            "total_affected": {"$sum": "$total_affected"},
            "total_overdose_deaths": {"$sum": "$drug_overdose_deaths"},
            "total_alcohol_deaths": {"$sum": "$alcohol_related_deaths"},
            "total_treatment_centers": {"$sum": "$treatment_centers"},
            "avg_treatment_gap": {"$avg": "$treatment_gap_percent"},
            "total_economic_cost": {"$sum": "$economic_cost_billions"}
        }}
    ]
    
    result = await db.country_statistics.aggregate(pipeline).to_list(1)
    stats = result[0] if result else {}
    
    # Get top countries by affected population
    top_countries = await db.country_statistics.find(
        {"year": year},
        {"_id": 0, "country_code": 1, "country_name": 1, "total_affected": 1, "treatment_centers": 1}
    ).sort("total_affected", -1).limit(10).to_list(10)
    
    return {
        "year": year,
        "global_stats": stats,
        "top_countries": top_countries,
        "data_sources": [
            {"name": "UNODC World Drug Report 2024", "url": "https://www.unodc.org/wdr2024"},
            {"name": "WHO Global Status Report on Alcohol 2024", "url": "https://www.who.int/publications/i/item/9789240089129"},
        ]
    }

# ============================================
# UPDATED HOMEPAGE API (With International Data)
# ============================================

@api_router.get("/homepage/data/international")
async def get_homepage_data_international():
    """
    Enhanced homepage API that includes international data.
    Single optimized call for maximum efficiency.
    """
    # Get global statistics aggregate
    global_stats = await db.country_statistics.aggregate([
        {"$match": {"year": 2025}},
        {"$group": {
            "_id": None,
            "total_affected": {"$sum": "$total_affected"},
            "total_overdose_deaths": {"$sum": "$drug_overdose_deaths"},
            "total_treatment_centers": {"$sum": "$treatment_centers"},
            "avg_treatment_gap": {"$avg": "$treatment_gap_percent"},
            "countries_count": {"$sum": 1}
        }}
    ]).to_list(1)
    
    # Get top 10 countries by affected population
    top_countries = await db.country_statistics.find(
        {"year": 2025},
        {"_id": 0, "country_code": 1, "country_name": 1, "total_affected": 1, "treatment_centers": 1, "primary_source": 1}
    ).sort("total_affected", -1).limit(10).to_list(10)
    
    # Get countries grouped by region
    countries_by_region = await db.countries.aggregate([
        {"$match": {"is_active": True}},
        {"$group": {
            "_id": "$region",
            "countries": {"$push": {"code": "$country_code", "name": "$country_name", "flag": "$flag_emoji"}}
        }}
    ]).to_list(10)
    
    # Get featured international treatment centers
    featured_centers = await db.treatment_centers.find(
        {"is_featured": True, "is_active": True},
        {"_id": 0}
    ).sort("rating", -1).limit(12).to_list(12)
    
    # Get US state counts (existing functionality)
    state_counts = await db.state_addiction_statistics.aggregate([
        {"$match": {"year": 2025}},
        {"$project": {
            "_id": 0,
            "state_id": 1,
            "state_name": 1,
            "total_treatment_centers": 1
        }},
        {"$sort": {"total_treatment_centers": -1}}
    ]).to_list(51)
    
    return {
        "global_stats": global_stats[0] if global_stats else {},
        "top_countries": top_countries,
        "countries_by_region": {r["_id"]: r["countries"] for r in countries_by_region},
        "featured_centers": featured_centers,
        "us_state_counts": state_counts,
        "data_year": 2025,
        "data_sources": [
            {"name": "SAMHSA NSDUH", "coverage": "United States"},
            {"name": "UNODC World Drug Report", "coverage": "Global"},
            {"name": "WHO Alcohol Report", "coverage": "Global"},
            {"name": "EMCDDA", "coverage": "Europe"}
        ]
    }

# ============================================
# DATA EXPORT API (CSV/JSON)
# ============================================

from fastapi.responses import StreamingResponse
import io
import csv
import json as json_lib

@api_router.get("/export/statistics")
async def export_statistics(
    format: str = "csv",
    state_id: Optional[str] = None,
    year: Optional[int] = None,
    user: User = Depends(require_admin)
):
    """Export state statistics as CSV or JSON"""
    query = {}
    if state_id:
        query["state_id"] = state_id.upper()
    if year:
        query["year"] = year
    
    cursor = db.state_addiction_statistics.find(query, {"_id": 0})
    results = await cursor.to_list(length=10000)
    
    if format == "json":
        return {"data": results, "count": len(results)}
    
    # CSV export
    if not results:
        return StreamingResponse(
            io.StringIO("No data found"),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=statistics_export.csv"}
        )
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=results[0].keys())
    writer.writeheader()
    for row in results:
        # Convert datetime to string
        for key, value in row.items():
            if isinstance(value, datetime):
                row[key] = value.isoformat()
        writer.writerow(row)
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=statistics_export_{state_id or 'all'}_{year or 'all'}.csv"}
    )

@api_router.get("/export/countries")
async def export_country_statistics(
    format: str = "csv",
    country_code: Optional[str] = None,
    year: Optional[int] = None,
    user: User = Depends(require_admin)
):
    """Export country statistics as CSV or JSON"""
    query = {}
    if country_code:
        query["country_code"] = country_code.upper()
    if year:
        query["year"] = year
    
    cursor = db.country_statistics.find(query, {"_id": 0})
    results = await cursor.to_list(length=10000)
    
    if format == "json":
        return {"data": results, "count": len(results)}
    
    # CSV export
    if not results:
        return StreamingResponse(
            io.StringIO("No data found"),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=countries_export.csv"}
        )
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=results[0].keys())
    writer.writeheader()
    for row in results:
        for key, value in row.items():
            if isinstance(value, datetime):
                row[key] = value.isoformat()
        writer.writerow(row)
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=countries_export_{country_code or 'all'}_{year or 'all'}.csv"}
    )

@api_router.get("/export/treatment-centers")
async def export_treatment_centers(
    format: str = "csv",
    country_code: Optional[str] = None,
    user: User = Depends(require_admin)
):
    """Export treatment centers as CSV or JSON"""
    query = {"is_active": True}
    if country_code:
        query["country_code"] = country_code.upper()
    
    cursor = db.treatment_centers.find(query, {"_id": 0})
    results = await cursor.to_list(length=10000)
    
    if format == "json":
        return {"data": results, "count": len(results)}
    
    if not results:
        return StreamingResponse(
            io.StringIO("No data found"),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=treatment_centers_export.csv"}
        )
    
    # Flatten arrays for CSV
    flat_results = []
    for row in results:
        flat_row = {k: v for k, v in row.items() if not isinstance(v, list)}
        flat_row["treatment_types"] = "|".join(row.get("treatment_types", []))
        flat_row["services"] = "|".join(row.get("services", []))
        flat_row["insurance_accepted"] = "|".join(row.get("insurance_accepted", []))
        flat_results.append(flat_row)
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=flat_results[0].keys())
    writer.writeheader()
    writer.writerows(flat_results)
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=treatment_centers_export_{country_code or 'all'}.csv"}
    )

# ============================================
# DRAFT -> REVIEW -> PUBLISH WORKFLOW
# ============================================

class ContentStatus:
    DRAFT = "draft"
    REVIEW = "review"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class StatusUpdateRequest(BaseModel):
    status: str  # draft, review, published, archived
    reviewer_notes: Optional[str] = None

@api_router.put("/statistics/{id}/status")
async def update_statistic_status(id: str, request: StatusUpdateRequest, user: User = Depends(require_admin)):
    """Update status of a statistic record (draft -> review -> published)"""
    result = await db.state_addiction_statistics.find_one({"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Statistic not found")
    
    valid_statuses = ["draft", "review", "published", "archived"]
    if request.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    update_data = {
        "status": request.status,
        "status_updated_at": datetime.utcnow(),
        "status_updated_by": user.email,
        "updated_at": datetime.utcnow()
    }
    
    if request.reviewer_notes:
        update_data["reviewer_notes"] = request.reviewer_notes
    
    if request.status == "published":
        update_data["published_at"] = datetime.utcnow()
        update_data["published_by"] = user.email
    
    await db.state_addiction_statistics.update_one({"id": id}, {"$set": update_data})
    
    # Log the status change
    await log_audit_entry("state_addiction_statistics", id, f"status_change:{request.status}", user.email, update_data)
    
    return {"success": True, "message": f"Status updated to {request.status}"}

@api_router.put("/countries/{code}/statistics/{year}/status")
async def update_country_stat_status(code: str, year: int, request: StatusUpdateRequest, user: User = Depends(require_admin)):
    """Update status of a country statistic record"""
    result = await db.country_statistics.find_one({"country_code": code.upper(), "year": year})
    if not result:
        raise HTTPException(status_code=404, detail="Country statistic not found")
    
    valid_statuses = ["draft", "review", "published", "archived"]
    if request.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    update_data = {
        "status": request.status,
        "status_updated_at": datetime.utcnow(),
        "status_updated_by": user.email,
        "updated_at": datetime.utcnow()
    }
    
    if request.reviewer_notes:
        update_data["reviewer_notes"] = request.reviewer_notes
    
    if request.status == "published":
        update_data["published_at"] = datetime.utcnow()
        update_data["published_by"] = user.email
    
    await db.country_statistics.update_one(
        {"country_code": code.upper(), "year": year},
        {"$set": update_data}
    )
    
    await log_audit_entry("country_statistics", f"{code}-{year}", f"status_change:{request.status}", user.email, update_data)
    
    return {"success": True, "message": f"Status updated to {request.status}"}

# ============================================
# SEO MANAGEMENT API - Global, Folder, Page Level
# ============================================

# --- Global SEO Settings ---
@api_router.get("/seo/global")
async def get_global_seo_settings():
    """Get global SEO settings"""
    settings = await db.seo_settings.find_one({"id": "global_seo_settings"})
    if not settings:
        # Return defaults
        return GlobalSEOSettings().dict()
    settings.pop("_id", None)
    return settings

@api_router.put("/seo/global")
async def update_global_seo_settings(settings: GlobalSEOSettings, user: User = Depends(require_admin)):
    """Update global SEO settings"""
    settings_dict = settings.dict()
    settings_dict["updated_at"] = datetime.utcnow()
    await db.seo_settings.update_one(
        {"id": "global_seo_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return {"success": True, "message": "Global SEO settings updated"}

# --- Folder-Level SEO Rules ---
@api_router.get("/seo/folder-rules")
async def get_folder_seo_rules(user: User = Depends(require_admin)):
    """Get all folder-level SEO rules"""
    cursor = db.seo_folder_rules.find({}, {"_id": 0}).sort("priority", -1)
    rules = await cursor.to_list(length=100)
    return {"rules": rules, "count": len(rules)}

@api_router.post("/seo/folder-rules")
async def create_folder_seo_rule(rule: FolderSEORule, user: User = Depends(require_admin)):
    """Create a new folder-level SEO rule"""
    rule_dict = rule.dict()
    rule_dict["created_at"] = datetime.utcnow()
    rule_dict["updated_at"] = datetime.utcnow()
    await db.seo_folder_rules.insert_one(rule_dict)
    return {"success": True, "id": rule.id, "message": "Folder SEO rule created"}

@api_router.put("/seo/folder-rules/{rule_id}")
async def update_folder_seo_rule(rule_id: str, rule: FolderSEORule, user: User = Depends(require_admin)):
    """Update a folder-level SEO rule"""
    rule_dict = rule.dict()
    rule_dict["updated_at"] = datetime.utcnow()
    result = await db.seo_folder_rules.update_one({"id": rule_id}, {"$set": rule_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"success": True, "message": "Folder SEO rule updated"}

@api_router.delete("/seo/folder-rules/{rule_id}")
async def delete_folder_seo_rule(rule_id: str, user: User = Depends(require_admin)):
    """Delete a folder-level SEO rule"""
    result = await db.seo_folder_rules.delete_one({"id": rule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"success": True, "message": "Folder SEO rule deleted"}

# --- Page-Level SEO ---
@api_router.get("/seo/pages")
async def get_page_seo_list(
    page_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    user: User = Depends(require_admin)
):
    """Get list of page-level SEO records"""
    query = {}
    if page_type:
        query["page_type"] = page_type
    
    cursor = db.page_seo.find(query, {"_id": 0}).skip(skip).limit(limit).sort("page_slug", 1)
    records = await cursor.to_list(length=limit)
    total = await db.page_seo.count_documents(query)
    return {"pages": records, "total": total, "skip": skip, "limit": limit}

@api_router.get("/seo/pages/{slug:path}")
async def get_page_seo(slug: str):
    """Get SEO settings for a specific page"""
    # Clean slug
    clean_slug = slug.strip("/")
    
    # Try exact match first
    page_seo = await db.page_seo.find_one({"page_slug": clean_slug}, {"_id": 0})
    
    # Get matching folder rule
    folder_rules = await db.seo_folder_rules.find({"is_active": True}, {"_id": 0}).sort("priority", -1).to_list(length=100)
    matching_rule = None
    for rule in folder_rules:
        pattern = rule.get("path_pattern", "")
        if pattern.endswith("*") and clean_slug.startswith(pattern[:-1]):
            matching_rule = rule
            break
        elif pattern == f"/{clean_slug}" or pattern == clean_slug:
            matching_rule = rule
            break
    
    # Get global settings
    global_settings = await db.seo_settings.find_one({"id": "global_seo_settings"}, {"_id": 0})
    if not global_settings:
        global_settings = GlobalSEOSettings().dict()
    
    # Merge: Global < Folder < Page (page overrides folder, folder overrides global)
    result = {
        "page_slug": clean_slug,
        "meta_title": global_settings.get("site_name", "United Rehabs"),
        "meta_description": global_settings.get("default_meta_description"),
        "robots": global_settings.get("default_robots", "index, follow"),
        "og_image_url": global_settings.get("default_og_image"),
        "canonical_url": None,
        "include_in_sitemap": True,
        "sitemap_priority": 0.5,
        "sitemap_changefreq": "weekly",
        "source": "global"
    }
    
    if matching_rule:
        result.update({
            "robots": matching_rule.get("robots", result["robots"]),
            "include_in_sitemap": matching_rule.get("include_in_sitemap", True),
            "sitemap_priority": matching_rule.get("sitemap_priority", 0.5),
            "sitemap_changefreq": matching_rule.get("sitemap_changefreq", "weekly"),
            "og_type": matching_rule.get("og_type", "website"),
            "source": "folder"
        })
    
    if page_seo:
        for key, value in page_seo.items():
            if value is not None and key not in ["_id", "created_at", "updated_at"]:
                result[key] = value
        result["source"] = "page"
        
        # Handle noindex/nofollow flags
        if page_seo.get("noindex") or page_seo.get("nofollow"):
            robots_parts = []
            robots_parts.append("noindex" if page_seo.get("noindex") else "index")
            robots_parts.append("nofollow" if page_seo.get("nofollow") else "follow")
            result["robots"] = ", ".join(robots_parts)
    
    return result

@api_router.put("/seo/pages/{slug:path}")
async def upsert_page_seo(slug: str, seo: PageSEOCreate, user: User = Depends(require_admin)):
    """Create or update page-level SEO settings"""
    clean_slug = slug.strip("/")
    seo_dict = seo.dict()
    seo_dict["page_slug"] = clean_slug
    seo_dict["updated_at"] = datetime.utcnow()
    
    existing = await db.page_seo.find_one({"page_slug": clean_slug})
    if existing:
        await db.page_seo.update_one({"page_slug": clean_slug}, {"$set": seo_dict})
        return {"success": True, "message": "Page SEO updated", "action": "updated"}
    else:
        seo_dict["created_at"] = datetime.utcnow()
        seo_dict["id"] = str(uuid.uuid4())
        await db.page_seo.insert_one(seo_dict)
        return {"success": True, "message": "Page SEO created", "action": "created"}

@api_router.delete("/seo/pages/{slug:path}")
async def delete_page_seo(slug: str, user: User = Depends(require_admin)):
    """Delete page-level SEO settings (reverts to folder/global)"""
    clean_slug = slug.strip("/")
    result = await db.page_seo.delete_one({"page_slug": clean_slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page SEO not found")
    return {"success": True, "message": "Page SEO deleted, now using folder/global defaults"}

# --- Sitemap Index System ---
# Split into sub-sitemaps for better SEO + Google News format
import time as _time

_sitemap_caches = {}

def _cache_key(name: str) -> dict:
    if name not in _sitemap_caches:
        _sitemap_caches[name] = {"xml": None, "generated_at": 0}
    return _sitemap_caches[name]

@api_router.get("/seo/sitemap.xml")
async def sitemap_index():
    """Sitemap index pointing to sub-sitemaps"""
    from fastapi.responses import Response
    base_url = os.environ.get('SITEMAP_URL', os.environ.get('APP_URL', 'https://unitedrehabs.com')).rstrip('/')
    today = datetime.utcnow().strftime("%Y-%m-%d")
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>{base_url}/api/seo/sitemap-static.xml</loc><lastmod>{today}</lastmod></sitemap>
  <sitemap><loc>{base_url}/api/seo/sitemap-states.xml</loc><lastmod>{today}</lastmod></sitemap>
  <sitemap><loc>{base_url}/api/seo/sitemap-countries.xml</loc><lastmod>{today}</lastmod></sitemap>
  <sitemap><loc>{base_url}/api/seo/sitemap-news.xml</loc><lastmod>{today}</lastmod></sitemap>
  <sitemap><loc>{base_url}/api/seo/sitemap-articles.xml</loc><lastmod>{today}</lastmod></sitemap>
</sitemapindex>"""
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=86400"})

@api_router.get("/seo/sitemap-static.xml")
async def sitemap_static():
    """Static pages sitemap"""
    from fastapi.responses import Response
    cache = _cache_key("static")
    if cache["xml"] and (_time.time() - cache["generated_at"]) < 86400:
        return Response(content=cache["xml"], media_type="application/xml")

    base_url = os.environ.get('SITEMAP_URL', os.environ.get('APP_URL', 'https://unitedrehabs.com')).rstrip('/')
    pages = [
        ("/", "1.0", "daily"),
        ("/news", "0.9", "hourly"),
        ("/drug-laws", "0.9", "weekly"),
        ("/compare", "0.8", "weekly"),
        ("/about", "0.7", "monthly"),
        ("/contact", "0.6", "monthly"),
        ("/data-methodology", "0.5", "monthly"),
        ("/privacy-policy", "0.3", "yearly"),
        ("/terms-of-service", "0.3", "yearly"),
        ("/cookie-policy", "0.3", "yearly"),
        ("/accessibility", "0.3", "yearly"),
        ("/legal-disclaimer", "0.3", "yearly"),
    ]
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    today = datetime.utcnow().strftime("%Y-%m-%d")
    for loc, pri, freq in pages:
        xml_parts.append(f'  <url><loc>{base_url}{loc}</loc><lastmod>{today}</lastmod><priority>{pri}</priority><changefreq>{freq}</changefreq></url>')
    xml_parts.append('</urlset>')
    xml = "\n".join(xml_parts)
    cache["xml"] = xml
    cache["generated_at"] = _time.time()
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=86400"})

@api_router.get("/seo/sitemap-states.xml")
async def sitemap_states():
    """US States sitemap"""
    from fastapi.responses import Response
    cache = _cache_key("states")
    if cache["xml"] and (_time.time() - cache["generated_at"]) < 21600:
        return Response(content=cache["xml"], media_type="application/xml")

    base_url = os.environ.get('SITEMAP_URL', os.environ.get('APP_URL', 'https://unitedrehabs.com')).rstrip('/')
    states = await db.state_addiction_statistics.find({}, {"_id": 0, "state_name": 1, "year": 1}).to_list(length=500)
    state_years = {}
    for s in states:
        slug = s.get("state_name", "").lower().replace(" ", "-")
        if slug:
            state_years.setdefault(slug, set()).add(s.get("year"))

    today = datetime.utcnow().strftime("%Y-%m-%d")
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    # Get states that have law pages and their updated_at dates
    law_states = set()
    state_law_dates = {}
    async for law in db.state_drug_laws.find({"status": "published"}, {"state_id": 1, "updated_at": 1}):
        state_id = law.get("state_id", "").lower()
        law_states.add(state_id)
        if law.get("updated_at"):
            try:
                state_law_dates[state_id] = law["updated_at"].strftime("%Y-%m-%d") if hasattr(law["updated_at"], "strftime") else str(law["updated_at"])[:10]
            except:
                state_law_dates[state_id] = today

    for slug, years in state_years.items():
        xml_parts.append(f'  <url><loc>{base_url}/{slug}-addiction-stats</loc><lastmod>{today}</lastmod><priority>0.8</priority><changefreq>weekly</changefreq></url>')
        for year in sorted(years, reverse=True):
            xml_parts.append(f'  <url><loc>{base_url}/{slug}-addiction-stats-{year}</loc><lastmod>{today}</lastmod><priority>0.6</priority><changefreq>yearly</changefreq></url>')
        # Drug law page for this state
        law_date = state_law_dates.get(slug, today)
        xml_parts.append(f'  <url><loc>{base_url}/drug-laws/{slug}</loc><lastmod>{law_date}</lastmod><priority>0.7</priority><changefreq>monthly</changefreq></url>')

    # County drug law pages
    async for county in db.county_drug_laws.find({"status": "published"}, {"state_id": 1, "state_name": 1, "county_slug": 1, "updated_at": 1}):
        state_slug = county.get("state_name", "").lower().replace(" ", "-")
        county_slug = county.get("county_slug", "")
        if state_slug and county_slug:
            county_date = today
            if county.get("updated_at"):
                try:
                    county_date = county["updated_at"].strftime("%Y-%m-%d") if hasattr(county["updated_at"], "strftime") else str(county["updated_at"])[:10]
                except:
                    county_date = today
            xml_parts.append(f'  <url><loc>{base_url}/drug-laws/{state_slug}/{county_slug}</loc><lastmod>{county_date}</lastmod><priority>0.6</priority><changefreq>monthly</changefreq></url>')

    xml_parts.append('</urlset>')
    xml = "\n".join(xml_parts)
    cache["xml"] = xml
    cache["generated_at"] = _time.time()
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=21600"})

@api_router.get("/seo/sitemap-countries.xml")
async def sitemap_countries():
    """Countries sitemap"""
    from fastapi.responses import Response
    cache = _cache_key("countries")
    if cache["xml"] and (_time.time() - cache["generated_at"]) < 21600:
        return Response(content=cache["xml"], media_type="application/xml")

    base_url = os.environ.get('SITEMAP_URL', os.environ.get('APP_URL', 'https://unitedrehabs.com')).rstrip('/')
    all_stats = await db.country_statistics.find({}, {"_id": 0, "country_code": 1, "year": 1}).to_list(length=2000)
    country_year_map = {}
    for cs in all_stats:
        code = cs.get("country_code", "")
        if code:
            country_year_map.setdefault(code, set()).add(cs.get("year"))

    countries = await db.countries.find({"is_active": True}, {"_id": 0, "country_name": 1, "country_code": 1}).to_list(length=200)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for country in countries:
        slug = country.get("country_name", "").lower().replace(" ", "-")
        code = country.get("country_code", "")
        if not slug:
            continue
        xml_parts.append(f'  <url><loc>{base_url}/{slug}-addiction-stats</loc><lastmod>{today}</lastmod><priority>0.7</priority><changefreq>weekly</changefreq></url>')
        for year in sorted(country_year_map.get(code, []), reverse=True):
            xml_parts.append(f'  <url><loc>{base_url}/{slug}-addiction-stats-{year}</loc><lastmod>{today}</lastmod><priority>0.5</priority><changefreq>yearly</changefreq></url>')
    xml_parts.append('</urlset>')
    xml = "\n".join(xml_parts)
    cache["xml"] = xml
    cache["generated_at"] = _time.time()
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=21600"})

@api_router.get("/seo/sitemap-news.xml")
async def sitemap_news():
    """Google News sitemap for news articles"""
    from fastapi.responses import Response
    cache = _cache_key("news")
    if cache["xml"] and (_time.time() - cache["generated_at"]) < 3600:
        return Response(content=cache["xml"], media_type="application/xml")

    base_url = os.environ.get('SITEMAP_URL', os.environ.get('APP_URL', 'https://unitedrehabs.com')).rstrip('/')
    articles = await db.articles.find(
        {"content_type": "news", "is_published": True},
        {"_id": 0, "slug": 1, "title": 1, "tags": 1, "published_at": 1, "updated_at": 1}
    ).sort("published_at", -1).to_list(length=1000)

    xml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'
    ]
    for a in articles:
        slug = a.get("slug", "")
        if not slug:
            continue
        title = (a.get("title", "") or "").replace("&", "&amp;").replace("<", "&lt;").replace('"', "&quot;")
        pub_date = ""
        if a.get("published_at"):
            try:
                pub_date = a["published_at"].strftime("%Y-%m-%dT%H:%M:%SZ") if hasattr(a["published_at"], "strftime") else str(a["published_at"])[:19] + "Z"
            except:
                pub_date = ""
        # lastmod: prefer updated_at, fall back to published_at
        lastmod_date = ""
        for date_field in ["updated_at", "published_at"]:
            if a.get(date_field):
                try:
                    lastmod_date = a[date_field].strftime("%Y-%m-%d") if hasattr(a[date_field], "strftime") else str(a[date_field])[:10]
                    break
                except:
                    pass
        keywords = ", ".join((a.get("tags") or [])[:5])
        keywords_escaped = keywords.replace("&", "&amp;").replace("<", "&lt;")
        lastmod_tag = f"\n    <lastmod>{lastmod_date}</lastmod>" if lastmod_date else ""
        xml_parts.append(f"""  <url>
    <loc>{base_url}/news/{slug}</loc>{lastmod_tag}
    <news:news>
      <news:publication><news:name>United Rehabs</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>{pub_date}</news:publication_date>
      <news:title>{title}</news:title>
      {f"<news:keywords>{keywords_escaped}</news:keywords>" if keywords_escaped else ""}
    </news:news>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")
    xml_parts.append('</urlset>')
    xml = "\n".join(xml_parts)
    cache["xml"] = xml
    cache["generated_at"] = _time.time()
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=3600"})

@api_router.get("/seo/sitemap-articles.xml")
async def sitemap_articles():
    """Non-news articles sitemap (blogs, guides)"""
    from fastapi.responses import Response
    cache = _cache_key("articles")
    if cache["xml"] and (_time.time() - cache["generated_at"]) < 21600:
        return Response(content=cache["xml"], media_type="application/xml")

    base_url = os.environ.get('SITEMAP_URL', os.environ.get('APP_URL', 'https://unitedrehabs.com')).rstrip('/')
    articles = await db.articles.find(
        {"content_type": {"$ne": "news"}, "is_published": True},
        {"_id": 0, "slug": 1, "content_type": 1, "updated_at": 1, "published_at": 1}
    ).to_list(length=500)

    today = datetime.utcnow().strftime("%Y-%m-%d")
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for a in articles:
        slug = a.get("slug", "")
        ctype = a.get("content_type", "blog")
        if slug:
            # lastmod: prefer updated_at, fall back to published_at, then today
            article_date = today
            for date_field in ["updated_at", "published_at"]:
                if a.get(date_field):
                    try:
                        article_date = a[date_field].strftime("%Y-%m-%d") if hasattr(a[date_field], "strftime") else str(a[date_field])[:10]
                        break
                    except:
                        pass
            xml_parts.append(f'  <url><loc>{base_url}/{ctype}/{slug}</loc><lastmod>{article_date}</lastmod><priority>0.7</priority><changefreq>weekly</changefreq></url>')
    xml_parts.append('</urlset>')
    xml = "\n".join(xml_parts)
    cache["xml"] = xml
    cache["generated_at"] = _time.time()
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=21600"})

# --- Robots.txt Generation ---
@api_router.get("/seo/robots.txt")
async def generate_robots_txt():
    """Generate dynamic robots.txt"""
    from fastapi.responses import Response
    
    base_url = os.environ.get('SITEMAP_URL', os.environ.get('APP_URL', 'https://unitedrehabs.com')).rstrip('/')

    # Get noindex folder rules
    noindex_rules = await db.seo_folder_rules.find(
        {"is_active": True, "robots": {"$regex": "noindex", "$options": "i"}},
        {"path_pattern": 1}
    ).to_list(length=100)
    
    lines = [
        "# United Rehabs robots.txt",
        "# Generated dynamically",
        "",
        "User-agent: *",
        "Allow: /",
        "",
        "# Admin and API paths",
        "Disallow: /you-are-the-admin",
        "Disallow: /you-are-the-admin/",
        "Disallow: /api/",
        "",
    ]
    
    # Add noindex paths from rules
    if noindex_rules:
        lines.append("# Noindex paths from SEO rules")
        for rule in noindex_rules:
            pattern = rule.get("path_pattern", "")
            if pattern:
                lines.append(f"Disallow: {pattern}")
        lines.append("")
    
    lines.extend([
        "# Sitemap",
        f"Sitemap: {base_url}/api/seo/sitemap.xml",
    ])
    
    return Response(content="\n".join(lines), media_type="text/plain")

# --- Bulk SEO Operations ---
class BulkSEOUpdate(BaseModel):
    updates: Dict[str, Any]

@api_router.post("/seo/bulk-update")
async def bulk_update_seo(
    page_type: str,
    body: BulkSEOUpdate,
    user: User = Depends(require_admin)
):
    """Bulk update SEO settings for a page type"""
    updates = body.updates
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    updates["updated_at"] = datetime.utcnow()
    result = await db.page_seo.update_many(
        {"page_type": page_type},
        {"$set": updates}
    )
    
    return {
        "success": True,
        "matched": result.matched_count,
        "modified": result.modified_count,
        "message": f"Updated {result.modified_count} {page_type} pages"
    }

# --- SEO Audit ---
@api_router.get("/seo/audit")
async def seo_audit(user: User = Depends(require_admin)):
    """Get SEO audit report"""
    # Count pages without custom SEO
    total_states = await db.state_addiction_statistics.distinct("state_id")
    total_countries = await db.countries.count_documents({})
    pages_with_seo = await db.page_seo.count_documents({})
    
    # Check for common issues
    missing_meta_desc = await db.page_seo.count_documents({"meta_description": None})
    noindex_pages = await db.page_seo.count_documents({"noindex": True})
    
    return {
        "total_state_pages": len(total_states),
        "total_country_pages": total_countries,
        "pages_with_custom_seo": pages_with_seo,
        "pages_using_defaults": len(total_states) + total_countries - pages_with_seo,
        "issues": {
            "missing_meta_description": missing_meta_desc,
            "noindex_pages": noindex_pages,
        },
        "coverage_percent": round((pages_with_seo / max(len(total_states) + total_countries, 1)) * 100, 1)
    }

# ============================================
# SEED INTERNATIONAL DATA ON STARTUP
# ============================================

@app.on_event("startup")
async def startup_seed_data():
    """Seed international data if not present"""
    countries_count = await db.countries.count_documents({})
    if countries_count < 50:  # If we don't have all 195 countries
        logger.info("Seeding 195 countries data...")
        try:
            from country_data_full import seed_all_195_countries
            await seed_all_195_countries(db)
            logger.info("195 countries data seeding complete")
        except Exception as e:
            logger.error(f"Error seeding country data: {e}")
            # Fallback to basic 20 countries
            try:
                from country_data import seed_all_international_data
                await seed_all_international_data(db)
            except Exception as e2:
                logger.error(f"Error with fallback seeding: {e2}")

# ============================================
# DATA QUALITY ASSURANCE API
# ============================================

class DataValidationRequest(BaseModel):
    country_code: str
    year: int
    opioid_deaths: Optional[int] = None
    drug_overdose_deaths: Optional[int] = None

@api_router.get("/qa/audit")
async def run_data_qa_audit(user: User = Depends(require_admin)):
    """Run comprehensive data quality audit against authoritative sources"""
    try:
        from data_qa_system import DataQASystem
        qa = DataQASystem(db)
        report = await qa.audit_all_country_data()
        return report
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/qa/fix-discrepancies")
async def fix_data_discrepancies(user: User = Depends(require_admin)):
    """Fix all identified data discrepancies with authoritative values"""
    try:
        from data_qa_system import DataQASystem
        qa = DataQASystem(db)
        result = await qa.fix_discrepancies()
        return result
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/qa/report/csv")
async def get_qa_csv_report(user: User = Depends(require_admin)):
    """Get CSV report of all data for manual review"""
    try:
        from data_qa_system import DataQASystem
        qa = DataQASystem(db)
        csv_content = await qa.generate_csv_report()
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=data_qa_report.csv"}
        )
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/qa/validate")
async def validate_data_entry(data: DataValidationRequest, user: User = Depends(require_admin)):
    """
    Validate a data entry against authoritative sources BEFORE saving.
    This prevents bad data from ever entering the database.
    """
    from data_qa_system import AUTHORITATIVE_DATA
    
    result = {
        "valid": True,
        "warnings": [],
        "errors": [],
        "authoritative_data": None
    }
    
    # Check if we have authoritative data
    if data.country_code in AUTHORITATIVE_DATA:
        if data.year in AUTHORITATIVE_DATA[data.country_code]:
            auth = AUTHORITATIVE_DATA[data.country_code][data.year]
            result["authoritative_data"] = auth
            
            # Validate opioid deaths
            if data.opioid_deaths and auth.get("opioid_deaths"):
                diff = abs(data.opioid_deaths - auth["opioid_deaths"]) / auth["opioid_deaths"] * 100
                if diff > 50:
                    result["valid"] = False
                    result["errors"].append({
                        "field": "opioid_deaths",
                        "message": f"Value {data.opioid_deaths} differs by {diff:.1f}% from authoritative value {auth['opioid_deaths']}",
                        "authoritative_value": auth["opioid_deaths"],
                        "source": auth.get("source")
                    })
                elif diff > 20:
                    result["warnings"].append({
                        "field": "opioid_deaths",
                        "message": f"Value differs by {diff:.1f}% from authoritative value",
                        "authoritative_value": auth["opioid_deaths"]
                    })
            
            # Validate drug overdose deaths
            if data.drug_overdose_deaths and auth.get("drug_overdose_deaths"):
                diff = abs(data.drug_overdose_deaths - auth["drug_overdose_deaths"]) / auth["drug_overdose_deaths"] * 100
                if diff > 50:
                    result["valid"] = False
                    result["errors"].append({
                        "field": "drug_overdose_deaths",
                        "message": f"Value {data.drug_overdose_deaths} differs by {diff:.1f}% from authoritative value {auth['drug_overdose_deaths']}",
                        "authoritative_value": auth["drug_overdose_deaths"],
                        "source": auth.get("source")
                    })
                elif diff > 20:
                    result["warnings"].append({
                        "field": "drug_overdose_deaths",
                        "message": f"Value differs by {diff:.1f}% from authoritative value",
                        "authoritative_value": auth["drug_overdose_deaths"]
                    })
    else:
        result["warnings"].append({
            "field": "country_code",
            "message": f"No authoritative data available for {data.country_code}. Data will be accepted but not verified."
        })
    
    return result

@api_router.get("/qa/sources")
async def get_authoritative_sources():
    """Get list of all authoritative data sources used for validation"""
    from data_qa_system import AUTHORITATIVE_DATA
    
    sources = []
    for country_code, years in AUTHORITATIVE_DATA.items():
        for year, data in years.items():
            source = {
                "country_code": country_code,
                "year": year,
                "source_name": data.get("source"),
                "source_url": data.get("source_url")
            }
            if source not in sources:
                sources.append(source)
    
    # Get unique sources
    unique_sources = {}
    for s in sources:
        name = s["source_name"]
        if name not in unique_sources:
            unique_sources[name] = {
                "name": name,
                "url": s["source_url"],
                "countries": [],
                "years": []
            }
        if s["country_code"] not in unique_sources[name]["countries"]:
            unique_sources[name]["countries"].append(s["country_code"])
        if s["year"] not in unique_sources[name]["years"]:
            unique_sources[name]["years"].append(s["year"])
    
    return {
        "sources": list(unique_sources.values()),
        "total_authoritative_records": len(sources)
    }

@api_router.get("/qa/refresh/check")
async def check_data_refresh_status(user: User = Depends(require_admin)):
    """Check for available data updates from authoritative sources"""
    try:
        from quarterly_data_refresh import DataRefreshSystem
        system = DataRefreshSystem(db)
        return await system.check_for_updates()
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/qa/refresh/report")
async def get_refresh_report(user: User = Depends(require_admin)):
    """Generate comprehensive data refresh report"""
    try:
        from quarterly_data_refresh import DataRefreshSystem
        system = DataRefreshSystem(db)
        return await system.generate_refresh_report()
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/qa/refresh")
async def trigger_data_refresh(force: bool = False, user: User = Depends(require_admin)):
    """
    Trigger a data refresh check.
    
    This does NOT automatically update data - it generates a report
    of what needs to be updated for admin review.
    
    Args:
        force: Force refresh check even if not due
    """
    try:
        from quarterly_data_refresh import handle_data_refresh_request
        return await handle_data_refresh_request(db, force=force)
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/qa/schedule")
async def get_refresh_schedule():
    """Get the quarterly data refresh schedule"""
    from quarterly_data_refresh import QuarterlyScheduler, DATA_SOURCES
    
    return {
        "next_refresh_date": QuarterlyScheduler.get_next_refresh_date().isoformat(),
        "cron_schedule": QuarterlyScheduler.get_cron_schedule(),
        "refresh_frequency": "quarterly",
        "sources_tracked": len(DATA_SOURCES),
        "source_list": [
            {
                "country": code,
                "name": source["name"],
                "url": source["url"],
                "frequency": source.get("update_frequency"),
                "data_lag_months": source.get("data_lag_months")
            }
            for code, source in DATA_SOURCES.items()
        ]
    }

@api_router.get("/qa/verification-status")
async def get_verification_status():
    """Get current data verification status across all locations"""
    from serp_verification_system import SERPVerificationPipeline
    pipeline = SERPVerificationPipeline(db)
    return await pipeline.get_verification_status()

@api_router.get("/qa/verification-plan")
async def get_verification_plan(user: User = Depends(require_admin)):
    """Get the tiered verification plan for scaling data accuracy"""
    from scalable_verification_strategy import ScalableVerificationStrategy
    strategy = ScalableVerificationStrategy(db)
    return await strategy.get_verification_plan()

@api_router.get("/qa/city-assessment")
async def get_city_scale_assessment(num_cities: int = 5000, user: User = Depends(require_admin)):
    """Assess what's needed to add city-level data verification"""
    from scalable_verification_strategy import ScalableVerificationStrategy
    strategy = ScalableVerificationStrategy(db)
    return await strategy.get_city_scale_assessment(num_cities)

# ============================================
# DATAFORSEO SERP VERIFICATION ENDPOINTS
# ============================================

@api_router.get("/qa/dataforseo/cost-estimate")
async def estimate_dataforseo_cost(num_queries: int = 5000):
    """Estimate cost for DataForSEO SERP verification"""
    from dataforseo_verifier import estimate_dataforseo_cost
    return estimate_dataforseo_cost(num_queries)

@api_router.post("/qa/dataforseo/start-verification")
async def start_dataforseo_verification(
    background_tasks: BackgroundTasks,
    limit: int = 100,
    user: User = Depends(require_admin)
):
    """
    Start DataForSEO SERP verification for all countries.
    
    Args:
        limit: Number of queries to run (for testing). Set to None for full run.
    
    Requires DATAFORSEO_USERNAME and DATAFORSEO_PASSWORD in environment.
    """
    username = os.environ.get("DATAFORSEO_USERNAME")
    password = os.environ.get("DATAFORSEO_PASSWORD")
    
    if not username or not password:
        raise HTTPException(
            status_code=400, 
            detail="DataForSEO credentials not configured. Set DATAFORSEO_USERNAME and DATAFORSEO_PASSWORD."
        )
    
    from dataforseo_verifier import DataForSEOVerifier
    verifier = DataForSEOVerifier(username, password, db)
    
    # Generate queries first to show what will be submitted
    queries = await verifier.generate_all_queries(years=[2022])
    
    if limit:
        queries = queries[:limit]
    
    # Estimate cost
    cost = len(queries) * 0.0015
    
    # Start verification in background
    async def run_verification():
        await verifier.run_full_verification(limit=limit)
    
    background_tasks.add_task(run_verification)
    
    return {
        "status": "started",
        "queries_to_submit": len(queries),
        "estimated_cost": f"${cost:.2f}",
        "message": "Verification started in background. Check /qa/dataforseo/status for progress."
    }

@api_router.get("/qa/dataforseo/status")
async def get_dataforseo_status(user: User = Depends(require_admin)):
    """Get status of DataForSEO verification"""
    # Get latest report
    report = await db.serp_verification_reports.find_one(
        {},
        sort=[("started_at", -1)]
    )
    
    if report:
        report.pop("_id", None)
        return report
    
    # Get task counts
    submitted = await db.serp_tasks.count_documents({"status": "submitted"})
    completed = await db.serp_tasks.count_documents({"status": "completed"})
    
    return {
        "tasks_submitted": submitted,
        "tasks_completed": completed,
        "no_report_yet": True
    }

@api_router.get("/qa/dataforseo/discrepancies")
async def get_serp_discrepancies(user: User = Depends(require_admin)):
    """Get list of discrepancies found by SERP verification"""
    cursor = db.serp_discrepancies.find(
        {"status": "pending_review"},
        {"_id": 0}
    ).sort("diff_percent", -1).limit(100)
    
    discrepancies = await cursor.to_list(length=100)
    
    return {
        "total": len(discrepancies),
        "discrepancies": discrepancies
    }

@api_router.post("/qa/dataforseo/apply-fix")
async def apply_serp_fix(
    country_code: str,
    year: int,
    metric: str,
    user: User = Depends(require_admin)
):
    """Apply SERP-verified value to database"""
    # Get discrepancy
    discrepancy = await db.serp_discrepancies.find_one({
        "country_code": country_code,
        "year": year,
        "metric": metric,
        "status": "pending_review"
    })
    
    if not discrepancy:
        raise HTTPException(status_code=404, detail="Discrepancy not found")
    
    # Update database with SERP value
    db_field = "opioid_deaths" if metric == "opioid_deaths" else "drug_overdose_deaths"
    
    result = await db.country_statistics.update_one(
        {"country_code": country_code, "year": year},
        {"$set": {
            db_field: discrepancy["serp_value"],
            "serp_verified": True,
            "serp_verified_at": datetime.utcnow(),
            "data_verified": True,
            "verified_at": datetime.utcnow()
        }}
    )
    
    # Mark discrepancy as resolved
    await db.serp_discrepancies.update_one(
        {"_id": discrepancy["_id"]},
        {"$set": {"status": "resolved", "resolved_at": datetime.utcnow()}}
    )
    
    return {
        "status": "success",
        "country_code": country_code,
        "year": year,
        "metric": metric,
        "old_value": discrepancy["db_value"],
        "new_value": discrepancy["serp_value"]
    }

# ============================================
# SERP VERIFICATION SCHEDULING
# ============================================

class SERPScheduleSettings(BaseModel):
    enabled: bool = False
    frequency: str = "monthly"  # monthly, quarterly
    next_run: Optional[str] = None
    last_run: Optional[str] = None
    query_limit: int = 500

@api_router.get("/qa/serp/schedule")
async def get_serp_schedule(user: User = Depends(require_admin)):
    """Get current SERP validation schedule settings"""
    settings = await db.serp_schedule.find_one({"_id": "schedule_settings"})
    
    if not settings:
        # Return default settings
        return {
            "enabled": False,
            "frequency": "monthly",
            "next_run": None,
            "last_run": None,
            "query_limit": 500,
            "message": "SERP validation not scheduled. Enable to auto-verify data monthly."
        }
    
    settings.pop("_id", None)
    return settings

@api_router.post("/qa/serp/schedule")
async def update_serp_schedule(settings: SERPScheduleSettings, user: User = Depends(require_admin)):
    """Update SERP validation schedule"""
    from datetime import datetime, timedelta
    
    # Calculate next run date based on frequency
    now = datetime.utcnow()
    if settings.frequency == "monthly":
        # First day of next month
        if now.month == 12:
            next_run = datetime(now.year + 1, 1, 1, 2, 0)  # 2 AM UTC
        else:
            next_run = datetime(now.year, now.month + 1, 1, 2, 0)
    else:  # quarterly
        # First day of next quarter
        quarter_month = ((now.month - 1) // 3 + 1) * 3 + 1
        if quarter_month > 12:
            next_run = datetime(now.year + 1, quarter_month - 12, 1, 2, 0)
        else:
            next_run = datetime(now.year, quarter_month, 1, 2, 0)
    
    schedule_doc = {
        "_id": "schedule_settings",
        "enabled": settings.enabled,
        "frequency": settings.frequency,
        "next_run": next_run.isoformat() if settings.enabled else None,
        "query_limit": settings.query_limit,
        "updated_at": datetime.utcnow().isoformat(),
        "updated_by": user.email
    }
    
    await db.serp_schedule.replace_one(
        {"_id": "schedule_settings"},
        schedule_doc,
        upsert=True
    )
    
    return {
        "status": "success",
        "message": f"SERP validation {'enabled' if settings.enabled else 'disabled'}",
        "next_run": schedule_doc.get("next_run"),
        "frequency": settings.frequency
    }

@api_router.get("/qa/serp/history")
async def get_serp_validation_history(limit: int = 10, user: User = Depends(require_admin)):
    """Get history of SERP validation runs"""
    cursor = db.serp_verification_reports.find(
        {},
        {"_id": 0}
    ).sort("started_at", -1).limit(limit)
    
    history = await cursor.to_list(length=limit)
    
    return {
        "total_runs": len(history),
        "runs": history
    }

# ============================================
# BULK OFFICIAL API ENDPOINTS
# ============================================

@api_router.get("/qa/bulk/status")
async def get_bulk_verification_status():
    """Get verification coverage status from all bulk APIs"""
    from bulk_api_integrations import BulkDataVerificationController
    controller = BulkDataVerificationController(db)
    return await controller.get_verification_status()

@api_router.post("/qa/bulk/run-all")
async def run_bulk_verification(
    background_tasks: BackgroundTasks,
    year: int = 2022,
    user: User = Depends(require_admin)
):
    """
    Run verification using ALL bulk official APIs:
    - CDC WONDER (US States)
    - Health Canada (Canada)
    - WHO GHO (Global)
    """
    from bulk_api_integrations import BulkDataVerificationController
    controller = BulkDataVerificationController(db)
    
    async def run_verification():
        return await controller.run_full_verification(year)
    
    background_tasks.add_task(run_verification)
    
    return {
        "status": "started",
        "year": year,
        "message": "Bulk verification started. Check /qa/bulk/reports for results.",
        "apis_being_queried": ["CDC WONDER", "Health Canada", "WHO GHO", "EMCDDA"]
    }

@api_router.get("/qa/bulk/reports")
async def get_bulk_verification_reports(user: User = Depends(require_admin)):
    """Get latest bulk verification reports"""
    cursor = db.bulk_verification_reports.find(
        {},
        {"_id": 0}
    ).sort("started_at", -1).limit(10)
    
    reports = await cursor.to_list(length=10)
    return {"reports": reports}

@api_router.post("/qa/cdc/fetch-states")
async def fetch_cdc_state_data(
    year: int = 2022,
    user: User = Depends(require_admin)
):
    """Fetch drug overdose deaths for all US states from CDC WONDER"""
    from bulk_api_integrations import CDCWonderAPI
    cdc = CDCWonderAPI(db)
    return await cdc.update_all_states(year)

@api_router.post("/qa/health-canada/fetch")
async def fetch_health_canada_data(user: User = Depends(require_admin)):
    """Fetch opioid death data from Health Canada"""
    from bulk_api_integrations import HealthCanadaAPI
    hc = HealthCanadaAPI(db)
    return await hc.update_canada_data()

@api_router.get("/qa/who/indicators")
async def search_who_indicators(search_term: str = "drug"):
    """Search WHO GHO for available indicators"""
    from bulk_api_integrations import WHOGlobalHealthAPI
    who = WHOGlobalHealthAPI(db)
    indicators = await who.get_available_indicators(search_term)
    return {
        "search_term": search_term,
        "indicators_found": len(indicators),
        "indicators": indicators[:20]  # Limit to first 20
    }

@api_router.post("/qa/who/fetch-global")
async def fetch_who_global_data(user: User = Depends(require_admin)):
    """Fetch mortality data from WHO Global Health Observatory"""
    from bulk_api_integrations import WHOGlobalHealthAPI
    who = WHOGlobalHealthAPI(db)
    return await who.fetch_all_mortality_data()

# ============================================
# UNODC DATA IMPORT ENDPOINTS
# ============================================

@api_router.post("/qa/unodc/import")
async def import_unodc_data(user: User = Depends(require_admin)):
    """
    Import UNODC World Drug Report 2024 data.
    
    This imports pre-verified data for 50+ countries.
    """
    from unodc_data_importer import UNODCDataImporter
    importer = UNODCDataImporter(db)
    return await importer.import_2022_data()

@api_router.get("/qa/unodc/status")
async def get_unodc_import_status():
    """Get UNODC data import status"""
    from unodc_data_importer import UNODCDataImporter
    importer = UNODCDataImporter(db)
    return await importer.get_import_status()

@api_router.get("/qa/unodc/coverage")
async def get_unodc_coverage():
    """Get UNODC data coverage by region"""
    from unodc_data_importer import UNODCDataImporter
    importer = UNODCDataImporter(db)
    return await importer.get_coverage_by_region()

# ============================================
# COST-OPTIMIZED DATAFORSEO ENDPOINTS
# ============================================

@api_router.get("/qa/optimized/estimate-cost")
async def estimate_optimized_cost():
    """
    Estimate cost to verify all remaining countries using optimized approach.
    Shows savings vs naive approach.
    """
    from cost_optimized_dataforseo import estimate_verification_cost
    return await estimate_verification_cost(db)

@api_router.post("/qa/optimized/run")
async def run_optimized_verification(
    background_tasks: BackgroundTasks,
    max_queries: int = 50,
    user: User = Depends(require_admin)
):
    """
    Run cost-optimized DataForSEO verification.
    
    Optimizations:
    - Skips already verified countries (UNODC, manual)
    - Skips small countries with no reliable data
    - Validates extracted values against population
    - Caches results to prevent duplicates
    - Only queries opioid_deaths (most important metric)
    
    Args:
        max_queries: Maximum queries to run (default 50, cost ~$0.075)
    """
    username = os.environ.get("DATAFORSEO_USERNAME")
    password = os.environ.get("DATAFORSEO_PASSWORD")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="DataForSEO credentials not configured")
    
    from cost_optimized_dataforseo import CostOptimizedDataForSEO
    verifier = CostOptimizedDataForSEO(username, password, db)
    
    # Run in background
    async def run_verification():
        result = await verifier.run_optimized_verification(max_queries=max_queries)
        # Save report
        await db.optimized_verification_reports.insert_one(result)
    
    background_tasks.add_task(run_verification)
    
    return {
        "status": "started",
        "max_queries": max_queries,
        "estimated_max_cost": f"${max_queries * 0.0015:.3f}",
        "message": "Optimized verification started. Check /qa/optimized/status for results."
    }

@api_router.get("/qa/optimized/status")
async def get_optimized_verification_status(user: User = Depends(require_admin)):
    """Get latest optimized verification report"""
    report = await db.optimized_verification_reports.find_one(
        {},
        {"_id": 0},
        sort=[("started_at", -1)]
    )
    
    if report:
        return report
    
    return {"status": "no_reports_yet"}

@api_router.get("/qa/optimized/savings")
async def get_cost_savings():
    """
    Show cost savings from optimized approach vs naive approach.
    """
    from cost_optimized_dataforseo import estimate_verification_cost
    estimate = await estimate_verification_cost(db)
    
    return {
        "optimized_approach": {
            "queries": estimate["queries_needed"],
            "cost": f"${estimate['estimated_cost_usd']}"
        },
        "naive_approach": {
            "queries": estimate["vs_naive_approach"]["naive_queries"],
            "cost": f"${estimate['vs_naive_approach']['naive_cost']}"
        },
        "savings": estimate["vs_naive_approach"]["savings"],
        "optimization_methods": [
            "Skip already verified countries (UNODC, manual SERP)",
            "Skip small countries with no reliable data (~30 countries)",
            "Only query opioid_deaths (most important metric)",
            "Query only 2022 (most recent reliable year)",
            "Validate extracted values against population (reject false positives)",
            "Cache results to prevent duplicate queries"
        ]
    }

# ============================================
# COMPREHENSIVE VERIFICATION DASHBOARD ENDPOINTS
# ============================================

@api_router.get("/qa/dashboard")
async def get_verification_dashboard():
    """
    Comprehensive verification dashboard showing:
    - Overall verification coverage
    - Source breakdown
    - Last verification dates
    - Cross-check status
    """
    from datetime import datetime, timezone
    
    # US States verification status
    states_total = await db.state_addiction_statistics.count_documents({})
    states_verified = await db.state_addiction_statistics.count_documents({'data_verified': True})
    states_cdc_verified = await db.state_addiction_statistics.count_documents({'cdc_verified': True})
    
    # Countries verification status
    countries_total = await db.country_statistics.count_documents({})
    countries_verified = await db.country_statistics.count_documents({'data_verified': True})
    countries_unodc = await db.country_statistics.count_documents({'unodc_verified': True})
    countries_emcdda = await db.country_statistics.count_documents({'emcdda_verified': True})
    countries_serp = await db.country_statistics.count_documents({'serp_verified': True})
    
    # Get latest verification dates
    latest_state = await db.state_addiction_statistics.find_one(
        {'verified_at': {'$exists': True}},
        {'_id': 0, 'state_id': 1, 'year': 1, 'verified_at': 1},
        sort=[('verified_at', -1)]
    )
    
    latest_country = await db.country_statistics.find_one(
        {'verified_at': {'$exists': True}},
        {'_id': 0, 'country_code': 1, 'year': 1, 'verified_at': 1},
        sort=[('verified_at', -1)]
    )
    
    # Get verification reports
    verification_reports = await db.verification_reports.find(
        {},
        {'_id': 0}
    ).sort('created_at', -1).limit(5).to_list(length=5)
    
    return {
        "summary": {
            "total_records": states_total + countries_total,
            "verified_records": states_verified + countries_verified,
            "coverage_percent": round((states_verified + countries_verified) / max(states_total + countries_total, 1) * 100, 1)
        },
        "us_states": {
            "total_records": states_total,
            "verified": states_verified,
            "cdc_verified": states_cdc_verified,
            "coverage_percent": round(states_verified / max(states_total, 1) * 100, 1),
            "last_verification": latest_state.get('verified_at').isoformat() if latest_state and latest_state.get('verified_at') else None
        },
        "countries": {
            "total_records": countries_total,
            "verified": countries_verified,
            "by_source": {
                "unodc": countries_unodc,
                "emcdda": countries_emcdda,
                "serp": countries_serp
            },
            "coverage_percent": round(countries_verified / max(countries_total, 1) * 100, 1),
            "last_verification": latest_country.get('verified_at').isoformat() if latest_country and latest_country.get('verified_at') else None
        },
        "sources_used": [
            {"name": "CDC WONDER", "type": "US Government", "url": "https://wonder.cdc.gov/"},
            {"name": "UNODC World Drug Report", "type": "UN", "url": "https://www.unodc.org/unodc/en/data-and-analysis/world-drug-report-2024.html"},
            {"name": "EMCDDA European Drug Report", "type": "EU", "url": "https://www.emcdda.europa.eu/"},
            {"name": "Health Canada", "type": "National", "url": "https://health-infobase.canada.ca/"},
            {"name": "ONS UK", "type": "National", "url": "https://www.ons.gov.uk/"},
            {"name": "AIHW Australia", "type": "National", "url": "https://www.aihw.gov.au/"}
        ],
        "recent_reports": verification_reports
    }


@api_router.get("/qa/record/{location_type}/{location_id}/{year}")
async def get_record_verification_details(location_type: str, location_id: str, year: int):
    """
    Get detailed verification metadata for a specific record.
    
    Args:
        location_type: 'state' or 'country'
        location_id: State code (e.g., 'CA') or country code (e.g., 'USA')
        year: Year of the record
    
    Returns complete verification audit trail.
    """
    if location_type == 'state':
        record = await db.state_addiction_statistics.find_one(
            {'state_id': location_id.upper(), 'year': year},
            {'_id': 0}
        )
        if not record:
            raise HTTPException(status_code=404, detail=f"State record not found: {location_id}/{year}")
    elif location_type == 'country':
        record = await db.country_statistics.find_one(
            {'country_code': location_id.upper(), 'year': year},
            {'_id': 0}
        )
        if not record:
            raise HTTPException(status_code=404, detail=f"Country record not found: {location_id}/{year}")
    else:
        raise HTTPException(status_code=400, detail="location_type must be 'state' or 'country'")
    
    # Extract verification-specific fields
    verification_info = {
        "location": {
            "type": location_type,
            "id": location_id.upper(),
            "year": year
        },
        "data": {
            "overdose_deaths": record.get('overdose_deaths') or record.get('drug_overdose_deaths'),
            "opioid_deaths": record.get('opioid_deaths'),
            "treatment_centers": record.get('total_treatment_centers') or record.get('treatment_centers')
        },
        "verification_status": {
            "is_verified": record.get('data_verified', False),
            "cdc_verified": record.get('cdc_verified', False),
            "unodc_verified": record.get('unodc_verified', False),
            "emcdda_verified": record.get('emcdda_verified', False),
            "serp_verified": record.get('serp_verified', False)
        },
        "source_info": {
            "primary_source": record.get('data_source') or record.get('primary_source'),
            "primary_source_url": record.get('data_source_url') or record.get('primary_source_url'),
            "primary_source_agency": record.get('data_source_agency') or record.get('primary_source_agency'),
            "national_source": record.get('national_source'),
            "reliability_score": record.get('reliability_score')
        },
        "timestamps": {
            "verified_at": record.get('verified_at').isoformat() if record.get('verified_at') else None,
            "last_verification_date": record.get('last_verification_date').isoformat() if record.get('last_verification_date') else None,
            "next_verification_due": record.get('next_verification_due').isoformat() if record.get('next_verification_due') else None,
            "updated_at": record.get('updated_at').isoformat() if record.get('updated_at') else None
        },
        "methodology": {
            "verification_method": record.get('verification_method'),
            "baseline_year": record.get('baseline_year'),
            "trend_factor": record.get('trend_factor')
        },
        "cross_check_sources": record.get('cross_check_sources', []),
        "verification_history": record.get('verification_history', [])
    }
    
    return verification_info


@api_router.get("/qa/unverified")
async def get_unverified_records(location_type: str = "all", limit: int = 100):
    """
    Get list of unverified records that need attention.
    
    Args:
        location_type: 'state', 'country', or 'all'
        limit: Maximum records to return
    """
    results = {
        "states": [],
        "countries": []
    }
    
    if location_type in ['state', 'all']:
        cursor = db.state_addiction_statistics.find(
            {'data_verified': {'$ne': True}},
            {'_id': 0, 'state_id': 1, 'state_name': 1, 'year': 1, 'overdose_deaths': 1}
        ).limit(limit)
        results["states"] = await cursor.to_list(length=limit)
    
    if location_type in ['country', 'all']:
        cursor = db.country_statistics.find(
            {'data_verified': {'$ne': True}},
            {'_id': 0, 'country_code': 1, 'country_name': 1, 'year': 1, 'drug_overdose_deaths': 1}
        ).limit(limit)
        results["countries"] = await cursor.to_list(length=limit)
    
    return {
        "unverified_states_count": len(results["states"]),
        "unverified_countries_count": len(results["countries"]),
        "states": results["states"],
        "countries": results["countries"]
    }


@api_router.get("/qa/sources-summary")
async def get_sources_summary():
    """
    Get summary of all verification sources used across the database.
    """
    # Aggregate sources from states
    state_sources = await db.state_addiction_statistics.aggregate([
        {'$match': {'data_verified': True}},
        {'$group': {
            '_id': '$data_source',
            'count': {'$sum': 1},
            'avg_reliability': {'$avg': '$reliability_score'}
        }}
    ]).to_list(length=100)
    
    # Aggregate sources from countries
    country_sources = await db.country_statistics.aggregate([
        {'$match': {'data_verified': True}},
        {'$group': {
            '_id': '$primary_source',
            'count': {'$sum': 1},
            'avg_reliability': {'$avg': '$reliability_score'}
        }}
    ]).to_list(length=100)
    
    return {
        "state_sources": [
            {
                "source": s['_id'],
                "records_verified": s['count'],
                "avg_reliability_score": round(s['avg_reliability'], 1) if s['avg_reliability'] else None
            }
            for s in state_sources if s['_id']
        ],
        "country_sources": [
            {
                "source": s['_id'],
                "records_verified": s['count'],
                "avg_reliability_score": round(s['avg_reliability'], 1) if s['avg_reliability'] else None
            }
            for s in country_sources if s['_id']
        ],
        "official_sources": {
            "us_government": ["CDC WONDER", "SAMHSA NSDUH", "DEA"],
            "un_agencies": ["UNODC World Drug Report"],
            "eu_agencies": ["EMCDDA European Drug Report"],
            "national_agencies": [
                "Health Canada",
                "ONS (UK)",
                "AIHW (Australia)",
                "MHLW (Japan)",
                "NCRB (India)"
            ]
        }
    }


# ============================================
# DATA SEGMENTATION ENDPOINTS
# ============================================

@api_router.get("/qa/segments")
async def get_data_segments():
    """
    Get data segmentation report with verification status by segment.
    """
    from data_segmentation import generate_segment_report
    return await generate_segment_report()


@api_router.get("/qa/segments/{segment_id}")
async def get_segment_details(segment_id: str):
    """
    Get detailed data for a specific segment.
    
    Available segments:
    - tier_1_high_priority: Major economies with high drug death rates
    - tier_2_europe: EU and EFTA countries (EMCDDA data)
    - tier_3_asia_pacific: Major Asia-Pacific countries
    - tier_4_americas: Central and South American countries
    - tier_5_mena: Middle East & North Africa
    - tier_6_africa: Sub-Saharan Africa
    - us_states: All 50 US states + DC
    """
    from data_segmentation import get_segment_details as get_details
    return await get_details(segment_id)


@api_router.get("/qa/verification-reports")
async def get_verification_reports(limit: int = 10):
    """
    Get recent verification reports with timestamps and sources.
    """
    reports = await db.verification_reports.find(
        {},
        {'_id': 0}
    ).sort('created_at', -1).limit(limit).to_list(length=limit)
    
    # Convert datetime objects
    for r in reports:
        if r.get('created_at'):
            r['created_at'] = r['created_at'].isoformat()
    
    return {
        "total_reports": await db.verification_reports.count_documents({}),
        "reports": reports
    }


# ============================================
# STATE DRUG LAWS
# ============================================

@api_router.get("/state-laws")
async def get_all_state_laws(status: Optional[str] = None):
    """Get all state drug law pages"""
    query = {}
    if status:
        query["status"] = status
    laws = await db.state_drug_laws.find(query, {"_id": 0}).sort("state_name", 1).to_list(length=60)
    return laws

@api_router.get("/state-laws/{state_id}")
async def get_state_law(state_id: str):
    """Get drug laws for a specific state"""
    law = await db.state_drug_laws.find_one({"state_id": state_id.upper(), "status": "published"}, {"_id": 0})
    if not law:
        raise HTTPException(status_code=404, detail="State law page not found")
    return law

@api_router.post("/state-laws")
async def create_state_law(law: StateDrugLawCreate, user: User = Depends(require_admin)):
    """Create a state drug law page"""
    existing = await db.state_drug_laws.find_one({"state_id": law.state_id.upper()})
    law_data = law.dict()
    law_data["state_id"] = law_data["state_id"].upper()

    if existing:
        law_data["updated_at"] = datetime.utcnow()
        await db.state_drug_laws.update_one({"state_id": law_data["state_id"]}, {"$set": law_data})
        return {"message": f"Updated {law_data['state_name']}", "state_id": law_data["state_id"]}
    else:
        law_data["id"] = str(uuid.uuid4())
        law_data["created_at"] = datetime.utcnow()
        law_data["updated_at"] = datetime.utcnow()
        await db.state_drug_laws.insert_one(law_data)
        return {"message": f"Created {law_data['state_name']}", "id": law_data["id"]}

@api_router.put("/state-laws/{state_id}")
async def update_state_law(state_id: str, law: StateDrugLawCreate, user: User = Depends(require_admin)):
    """Update a state drug law page"""
    law_data = law.dict()
    law_data["state_id"] = state_id.upper()
    law_data["updated_at"] = datetime.utcnow()
    result = await db.state_drug_laws.update_one({"state_id": state_id.upper()}, {"$set": law_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="State not found")
    return {"message": f"Updated {law_data.get('state_name', state_id)}"}

@api_router.delete("/state-laws/{state_id}")
async def delete_state_law(state_id: str, user: User = Depends(require_admin)):
    """Delete a state drug law page"""
    result = await db.state_drug_laws.delete_one({"state_id": state_id.upper()})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="State not found")
    return {"message": f"Deleted {state_id.upper()}"}

@api_router.post("/state-laws/bulk")
async def bulk_create_state_laws(laws: List[StateDrugLawCreate], user: User = Depends(require_admin)):
    """Bulk create/update state drug law pages"""
    results = []
    for law in laws:
        law_data = law.dict()
        law_data["state_id"] = law_data["state_id"].upper()
        existing = await db.state_drug_laws.find_one({"state_id": law_data["state_id"]})
        if existing:
            law_data["updated_at"] = datetime.utcnow()
            await db.state_drug_laws.update_one({"state_id": law_data["state_id"]}, {"$set": law_data})
            results.append({"state_id": law_data["state_id"], "action": "updated"})
        else:
            law_data["id"] = str(uuid.uuid4())
            law_data["created_at"] = datetime.utcnow()
            law_data["updated_at"] = datetime.utcnow()
            await db.state_drug_laws.insert_one(law_data)
            results.append({"state_id": law_data["state_id"], "action": "created"})
    # Clear sitemap cache
    _sitemap_caches.clear()
    return {"results": results, "total": len(results)}


# ============================================
# COUNTY DRUG LAWS
# ============================================

@api_router.get("/county-laws/{state_id}")
async def get_county_laws_for_state(state_id: str):
    """Get all county drug laws for a state"""
    counties = await db.county_drug_laws.find(
        {"state_id": state_id.upper(), "status": "published"},
        {"_id": 0}
    ).sort("county_name", 1).to_list(length=200)
    return counties

@api_router.get("/county-laws/{state_id}/{county_slug}")
async def get_county_law(state_id: str, county_slug: str):
    """Get drug laws for a specific county"""
    law = await db.county_drug_laws.find_one(
        {"state_id": state_id.upper(), "county_slug": county_slug, "status": "published"},
        {"_id": 0}
    )
    if not law:
        raise HTTPException(status_code=404, detail="County not found")
    return law


# ============================================
# CONTENT PIPELINE (AI-powered)
# ============================================

from content_pipeline import run_pipeline, stage_research, stage_write, stage_qa, stage_launch

class PipelineRequest(BaseModel):
    topic_hint: Optional[str] = None
    auto_publish: bool = False

@api_router.post("/content/pipeline")
async def run_content_pipeline(req: PipelineRequest, user: User = Depends(require_admin)):
    """Run full content pipeline: Research → Write → QA → Launch"""
    result = await run_pipeline(topic_hint=req.topic_hint, auto_publish=req.auto_publish, db=db)
    return result

@api_router.post("/content/research")
async def research_topics(topic_hint: Optional[str] = None, user: User = Depends(require_admin)):
    """Stage 1 only: Research trending topics"""
    return await stage_research(topic_hint, db)

class WriteRequest(BaseModel):
    topic: Dict

@api_router.post("/content/write")
async def write_article_content(req: WriteRequest, user: User = Depends(require_admin)):
    """Stage 2 only: Write article from topic"""
    return await stage_write(req.topic, db)

class QARequest(BaseModel):
    article: Dict

@api_router.post("/content/qa")
async def qa_article_content(req: QARequest, user: User = Depends(require_admin)):
    """Stage 3 only: QA check article"""
    return await stage_qa(req.article, db)

@api_router.post("/content/launch")
async def launch_article_content(req: QARequest, user: User = Depends(require_admin)):
    """Stage 4 only: Publish article"""
    return await stage_launch(req.article, db)

# Include the router in the main app
app.include_router(api_router)

# SECURITY: Never use wildcard '*' with allow_credentials=True
_cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173')
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[o.strip() for o in _cors_origins.split(',') if o.strip() and o.strip() != '*'],
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# ============================================
# AUTO NEWS SCHEDULER — runs every 3 hours
# ============================================
import asyncio

_scheduler_task = None
NEWS_INTERVAL_HOURS = int(os.environ.get("NEWS_INTERVAL_HOURS", "3"))
NEWS_AUTO_ENABLED = os.environ.get("NEWS_AUTO_ENABLED", "true").lower() == "true"

async def _auto_news_loop():
    """Background loop: generate & publish trending news every N hours"""
    await asyncio.sleep(30)  # Wait 30s for app startup
    while True:
        if not NEWS_AUTO_ENABLED:
            await asyncio.sleep(3600)
            continue
        try:
            logger.info(f"[AutoNews] Starting automated pipeline run...")
            result = await run_pipeline(topic_hint=None, auto_publish=True, db=db)
            status = result.get("final_status", "unknown")
            url = result.get("url", "")
            # Log to DB for admin dashboard visibility
            await db.auto_news_log.insert_one({
                "id": str(uuid.uuid4()),
                "status": status,
                "url": url,
                "article_title": result.get("article_preview", {}).get("title", ""),
                "tier": result.get("stages", {}).get("research", {}).get("tier", ""),
                "focus": result.get("stages", {}).get("research", {}).get("focus", ""),
                "stages": {k: {"passed": v.get("passed"), "error": v.get("error")} for k, v in result.get("stages", {}).items()},
                "created_at": datetime.utcnow(),
            })
            if status == "published":
                logger.info(f"[AutoNews] Published: {url}")
            else:
                logger.warning(f"[AutoNews] Status: {status}")
        except Exception as e:
            logger.error(f"[AutoNews] Pipeline error: {e}")
            await db.auto_news_log.insert_one({
                "id": str(uuid.uuid4()),
                "status": "error",
                "error": str(e),
                "created_at": datetime.utcnow(),
            })
        # Wait for next cycle
        await asyncio.sleep(NEWS_INTERVAL_HOURS * 3600)

@app.on_event("startup")
async def start_news_scheduler():
    global _scheduler_task
    if NEWS_AUTO_ENABLED:
        _scheduler_task = asyncio.create_task(_auto_news_loop())
        logger.info(f"[AutoNews] Scheduler started — every {NEWS_INTERVAL_HOURS} hours")

# Admin endpoints to control the scheduler
@api_router.get("/content/auto-news/status")
async def auto_news_status(user: User = Depends(require_admin)):
    """Check auto-news scheduler status and recent runs"""
    recent = await db.auto_news_log.find().sort("created_at", -1).to_list(10)
    for r in recent:
        r.pop("_id", None)
    return {
        "enabled": NEWS_AUTO_ENABLED,
        "interval_hours": NEWS_INTERVAL_HOURS,
        "scheduler_running": _scheduler_task is not None and not _scheduler_task.done(),
        "recent_runs": recent,
    }

@api_router.post("/content/auto-news/trigger")
async def trigger_auto_news(user: User = Depends(require_admin)):
    """Manually trigger an auto-news run right now"""
    result = await run_pipeline(topic_hint=None, auto_publish=True, db=db)
    await db.auto_news_log.insert_one({
        "id": str(uuid.uuid4()),
        "status": result.get("final_status", "unknown"),
        "url": result.get("url", ""),
        "article_title": result.get("article_preview", {}).get("title", ""),
        "trigger": "manual",
        "created_at": datetime.utcnow(),
    })
    return result

@api_router.get("/content/auto-news/coverage")
async def auto_news_coverage(user: User = Depends(require_admin)):
    """Show which states/countries have been covered and when"""
    logs = await db.auto_news_log.find(
        {"status": "published"},
        {"_id": 0, "article_title": 1, "tier": 1, "focus": 1, "created_at": 1, "url": 1}
    ).sort("created_at", -1).to_list(100)
    return {"coverage": logs, "total_published": len(logs)}

@api_router.post("/content/auto-news/toggle")
async def toggle_auto_news(user: User = Depends(require_admin)):
    """Toggle auto-news on/off"""
    global NEWS_AUTO_ENABLED
    NEWS_AUTO_ENABLED = not NEWS_AUTO_ENABLED
    return {"enabled": NEWS_AUTO_ENABLED}

@app.on_event("shutdown")
async def shutdown_db_client():
    global _scheduler_task
    if _scheduler_task:
        _scheduler_task.cancel()
    client.close()
