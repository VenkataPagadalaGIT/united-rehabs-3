from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# ============================================
# AUTH MODELS
# ============================================

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    role: str = "admin"  # admin, editor, viewer
    is_active: bool = True
    mfa_enabled: bool = False
    mfa_secret: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# ============================================
# STATE ADDICTION STATISTICS
# ============================================

class StateAddictionStatisticsCreate(BaseModel):
    state_id: str
    state_name: str
    year: int
    total_affected: Optional[int] = None
    overdose_deaths: Optional[int] = None
    opioid_deaths: Optional[int] = None
    drug_abuse_rate: Optional[float] = None
    alcohol_abuse_rate: Optional[float] = None
    affected_age_12_17: Optional[int] = None
    affected_age_18_25: Optional[int] = None
    affected_age_26_34: Optional[int] = None
    affected_age_35_plus: Optional[int] = None
    total_treatment_centers: Optional[int] = None
    inpatient_facilities: Optional[int] = None
    outpatient_facilities: Optional[int] = None
    treatment_admissions: Optional[int] = None
    recovery_rate: Optional[float] = None
    relapse_rate: Optional[float] = None
    economic_cost_billions: Optional[float] = None
    data_source: Optional[str] = None
    source_url: Optional[str] = None

class StateAddictionStatistics(StateAddictionStatisticsCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# SUBSTANCE STATISTICS
# ============================================

class SubstanceStatisticsCreate(BaseModel):
    state_id: str
    state_name: str
    year: int
    # Alcohol
    alcohol_use_past_month_percent: Optional[float] = None
    alcohol_binge_drinking_percent: Optional[float] = None
    alcohol_heavy_use_percent: Optional[float] = None
    alcohol_use_disorder: Optional[int] = None
    alcohol_related_deaths: Optional[int] = None
    # Opioids
    opioid_use_disorder: Optional[int] = None
    opioid_misuse_past_year: Optional[int] = None
    prescription_opioid_misuse: Optional[int] = None
    heroin_use: Optional[int] = None
    fentanyl_deaths: Optional[int] = None
    fentanyl_involved_overdoses: Optional[int] = None
    # Marijuana
    marijuana_use_past_month: Optional[int] = None
    marijuana_use_past_year: Optional[int] = None
    marijuana_use_disorder: Optional[int] = None
    # Cocaine
    cocaine_use_past_year: Optional[int] = None
    cocaine_use_disorder: Optional[int] = None
    cocaine_related_deaths: Optional[int] = None
    # Meth
    meth_use_past_year: Optional[int] = None
    meth_use_disorder: Optional[int] = None
    meth_related_deaths: Optional[int] = None
    # Prescription drugs
    prescription_stimulant_misuse: Optional[int] = None
    prescription_sedative_misuse: Optional[int] = None
    prescription_tranquilizer_misuse: Optional[int] = None
    # Treatment
    treatment_received: Optional[int] = None
    treatment_needed_not_received: Optional[int] = None
    mat_recipients: Optional[int] = None
    # Mental health
    mental_illness_with_sud: Optional[int] = None
    serious_mental_illness_with_sud: Optional[int] = None

class SubstanceStatistics(SubstanceStatisticsCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# FREE RESOURCES
# ============================================

class FreeResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    resource_type: str  # government_program, hotline, support_group, treatment_locator, etc.
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    is_free: bool = True
    is_nationwide: bool = False
    featured: bool = False
    state_id: Optional[str] = None
    sort_order: int = 0

class FreeResource(FreeResourceCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# FAQs
# ============================================

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    state_id: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class FAQ(FAQCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# DATA SOURCES
# ============================================

class DataSourceCreate(BaseModel):
    source_name: str
    source_abbreviation: str
    agency: str
    source_url: str
    description: Optional[str] = None
    data_types: Optional[List[str]] = None
    last_updated_year: Optional[int] = None

class DataSource(DataSourceCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# REHAB GUIDES
# ============================================

class RehabGuideCreate(BaseModel):
    title: str
    description: str
    category: str
    content: Optional[str] = None
    icon_name: Optional[str] = None
    read_time: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class RehabGuide(RehabGuideCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# PAGE CONTENT
# ============================================

class PageContentCreate(BaseModel):
    page_key: str
    section_key: str
    content_type: str = "text"  # text, html, json
    title: Optional[str] = None
    subtitle: Optional[str] = None
    body: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    state_id: Optional[str] = None
    city_id: Optional[str] = None
    country_code: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class PageContent(PageContentCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# PAGE SEO
# ============================================

class PageSEOCreate(BaseModel):
    page_slug: str
    page_type: str = "state"  # state, city, treatment, article, etc.
    meta_title: str
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    h1_title: Optional[str] = None
    intro_text: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image_url: Optional[str] = None
    canonical_url: Optional[str] = None
    robots: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    state_id: Optional[str] = None
    is_active: bool = True

class PageSEO(PageSEOCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# ARTICLES
# ============================================

class ArticleCreate(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    content_type: str = "blog"  # blog, news, article, guide
    featured_image_url: Optional[str] = None
    author_name: Optional[str] = None
    state_id: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: bool = False
    is_published: bool = False
    read_time: Optional[str] = None
    sort_order: int = 0

class Article(ArticleCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    published_at: Optional[datetime] = None
    views_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# API RESPONSE MODELS
# ============================================

class PaginatedResponse(BaseModel):
    data: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

class DashboardCounts(BaseModel):
    statistics_count: int
    substance_count: int
    resources_count: int
    sources_count: int
    guides_count: int
    faqs_count: int
    articles_count: int
    seo_count: int
