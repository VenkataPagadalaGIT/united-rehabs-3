from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import math

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
    CMSPage, CMSPageCreate, AuditLogEntry
)
from auth import verify_password, get_password_hash, create_access_token, decode_token

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'united_rehabs')]

# Create the main app
app = FastAPI(title="United Rehabs API", version="1.0.0")

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
async def register(user_data: UserCreate):
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
async def login(user_data: UserLogin):
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
    
    cursor = db.state_addiction_statistics.find(query).sort([("state_name", 1), ("year", -1)]).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
    
    cursor = db.substance_statistics.find(query).sort([("state_name", 1), ("year", -1)]).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
    
    cursor = db.free_resources.find(query).sort("sort_order", 1).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
    
    cursor = db.faqs.find(query).sort("sort_order", 1).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
    cursor = db.data_sources.find({}).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
    
    cursor = db.rehab_guides.find(query).sort("sort_order", 1).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
    
    cursor = db.page_content.find(query).sort("sort_order", 1).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
    
    cursor = db.page_seo.find(query).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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

@api_router.get("/articles", response_model=List[Article])
async def get_articles(
    content_type: Optional[str] = None,
    is_published: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    category: Optional[str] = None,
    state_id: Optional[str] = None,
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
    
    cursor = db.articles.find(query).sort("created_at", -1).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
    return [Article(**r) for r in results]

@api_router.get("/articles/by-slug/{content_type}/{slug}")
async def get_article_by_slug(content_type: str, slug: str):
    result = await db.articles.find_one({"content_type": content_type, "slug": slug})
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

# ============================================
# OPTIMIZED HOMEPAGE API (Single call for all data)
# ============================================

@api_router.get("/homepage/data")
async def get_homepage_data():
    """
    Single optimized API call that returns all homepage data.
    Reduces multiple API calls to just ONE for maximum efficiency.
    """
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
    
    return {
        "national_stats": national_stats[0] if national_stats else {},
        "top_states": top_states,
        "featured_centers": featured_centers,
        "faqs": general_faqs,
        "state_counts": state_counts,
        "data_year": 2025
    }

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
        query["city"] = {"$regex": city, "$options": "i"}
    if treatment_type:
        query["treatment_types"] = treatment_type
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    cursor = db.treatment_centers.find(query, {"_id": 0}).sort([("is_featured", -1), ("rating", -1)]).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
        query["name"] = {"$regex": q, "$options": "i"}
    if country_code:
        query["country_code"] = country_code.upper()
    if state_id:
        query["state_id"] = state_id.upper()
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if treatment_type:
        query["treatment_types"] = treatment_type
    if insurance:
        query["insurance_accepted"] = insurance
    if is_featured is not None:
        query["is_featured"] = is_featured
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    
    cursor = db.treatment_centers.find(query, {"_id": 0}).sort([("is_featured", -1), ("rating", -1)]).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
        raise HTTPException(status_code=500, detail=str(e))

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
        raise HTTPException(status_code=500, detail=str(e))

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
        raise HTTPException(status_code=500, detail=str(e))

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
        raise HTTPException(status_code=500, detail=str(e))

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
        raise HTTPException(status_code=400, detail=str(e))

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
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/bulk/export/{data_type}")
async def export_bulk_data(data_type: str, state_id: Optional[str] = None, format: str = "csv"):
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
        raise HTTPException(status_code=400, detail=str(e))

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
        raise HTTPException(status_code=400, detail=str(e))

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
    
    cursor = db.countries.find(query, {"_id": 0}).sort("country_name", 1).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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
    
    cursor = db.country_statistics.find(query, {"_id": 0}).sort("year", -1).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
    
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
        query["city"] = {"$regex": city, "$options": "i"}
    if treatment_type:
        query["treatment_types"] = treatment_type
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    cursor = db.treatment_centers.find(query, {"_id": 0}).sort("rating", -1).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
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

# --- Sitemap Generation ---
@api_router.get("/seo/sitemap.xml")
async def generate_sitemap():
    """Generate dynamic sitemap.xml"""
    from fastapi.responses import Response
    
    base_url = "https://unitedrehabs.com"  # Replace with actual domain
    
    # Start XML
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_parts.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Get folder rules for priority/changefreq
    folder_rules = await db.seo_folder_rules.find({"is_active": True, "include_in_sitemap": True}, {"_id": 0}).to_list(length=100)
    
    # Static pages
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "daily"},
        {"loc": "/about", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/contact", "priority": "0.6", "changefreq": "monthly"},
        {"loc": "/privacy-policy", "priority": "0.3", "changefreq": "yearly"},
        {"loc": "/terms-of-service", "priority": "0.3", "changefreq": "yearly"},
        {"loc": "/rehab-centers", "priority": "0.9", "changefreq": "daily"},
        {"loc": "/compare", "priority": "0.8", "changefreq": "weekly"},
    ]
    
    for page in static_pages:
        xml_parts.append(f"""  <url>
    <loc>{base_url}{page['loc']}</loc>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>""")
    
    # State pages (51 states)
    states = await db.state_addiction_statistics.distinct("state_id")
    for state_id in states:
        state = await db.state_addiction_statistics.find_one({"state_id": state_id}, {"state_name": 1})
        if state:
            slug = state.get("state_name", "").lower().replace(" ", "-")
            xml_parts.append(f"""  <url>
    <loc>{base_url}/{slug}-addiction-rehabs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")
    
    # Country pages (195 countries)
    countries = await db.countries.find({}, {"slug": 1}).to_list(length=200)
    for country in countries:
        slug = country.get("slug", "")
        if slug:
            xml_parts.append(f"""  <url>
    <loc>{base_url}/{slug}-addiction-rehabs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>""")
    
    # Published articles
    articles = await db.articles.find({"is_published": True}, {"slug": 1}).to_list(length=500)
    for article in articles:
        slug = article.get("slug", "")
        if slug:
            xml_parts.append(f"""  <url>
    <loc>{base_url}/articles/{slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>""")
    
    xml_parts.append('</urlset>')
    
    return Response(content="\n".join(xml_parts), media_type="application/xml")

# --- Robots.txt Generation ---
@api_router.get("/seo/robots.txt")
async def generate_robots_txt():
    """Generate dynamic robots.txt"""
    from fastapi.responses import Response
    
    base_url = "https://unitedrehabs.com"
    
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
        "Disallow: /admin",
        "Disallow: /admin/",
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
