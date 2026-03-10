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
    role: str = "viewer"  # admin, editor, viewer — new users default to viewer
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

class GlobalSEOSettings(BaseModel):
    """Site-wide SEO defaults"""
    id: str = "global_seo_settings"
    site_name: str = "United Rehabs"
    default_title_suffix: str = " | United Rehabs"
    default_meta_description: str = "Find addiction treatment centers and recovery resources worldwide."
    default_og_image: Optional[str] = None
    default_robots: str = "index, follow"
    google_site_verification: Optional[str] = None
    bing_site_verification: Optional[str] = None
    twitter_handle: Optional[str] = None
    facebook_app_id: Optional[str] = None
    schema_org_type: str = "Organization"
    schema_org_data: Optional[Dict[str, Any]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FolderSEORule(BaseModel):
    """SEO rules for URL path patterns (folder-level)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    path_pattern: str  # e.g., "/{state}-addiction-rehabs", "/admin/*", "/rehab-centers"
    rule_name: str  # Human readable name
    title_template: Optional[str] = None  # e.g., "{state_name} Addiction Treatment | United Rehabs"
    meta_description_template: Optional[str] = None
    canonical_rule: str = "self"  # self, none, custom
    custom_canonical_pattern: Optional[str] = None
    robots: str = "index, follow"  # index/noindex, follow/nofollow
    priority: int = 0  # Higher = more specific, takes precedence
    og_type: str = "website"
    include_in_sitemap: bool = True
    sitemap_priority: float = 0.5  # 0.0-1.0
    sitemap_changefreq: str = "weekly"  # always, hourly, daily, weekly, monthly, yearly, never
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PageSEOCreate(BaseModel):
    """Page-level SEO overrides"""
    page_slug: str
    page_type: str = "state"  # state, country, city, treatment, article, legal, etc.
    meta_title: str
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    h1_title: Optional[str] = None
    intro_text: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image_url: Optional[str] = None
    og_type: str = "website"
    canonical_url: Optional[str] = None
    robots: Optional[str] = None  # None = inherit from folder/global
    noindex: bool = False  # Explicit noindex flag
    nofollow: bool = False  # Explicit nofollow flag
    structured_data: Optional[Dict[str, Any]] = None
    state_id: Optional[str] = None
    country_code: Optional[str] = None
    include_in_sitemap: bool = True
    sitemap_priority: Optional[float] = None  # None = inherit from folder
    sitemap_changefreq: Optional[str] = None  # None = inherit from folder
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
    meta_keywords: Optional[str] = None
    is_featured: bool = False
    is_published: bool = False
    read_time: Optional[str] = None
    sort_order: int = 0
    related_countries: Optional[List[str]] = None  # country codes e.g. ["USA","GBR"]
    related_states: Optional[List[str]] = None  # state IDs e.g. ["CA","NY"]
    sidebar_links: Optional[List[Dict[str, str]]] = None  # [{"label":"...","url":"..."}]
    faq_items: Optional[List[Dict[str, str]]] = None  # [{"question":"...","answer":"..."}]

class Article(ArticleCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    published_at: Optional[datetime] = None
    views_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# COUNTRY MODELS (International Expansion)
# ============================================

class DataSourceAttribution(BaseModel):
    """Attribution for a specific data field"""
    field: str
    source_name: str
    source_url: Optional[str] = None
    source_year: int
    confidence: str = "high"  # high, medium, estimated

class CountryCreate(BaseModel):
    country_code: str  # ISO 3166-1 alpha-3 (USA, GBR, DEU)
    country_name: str
    region: str  # North America, Europe, Asia, etc.
    sub_region: Optional[str] = None
    population: Optional[int] = None
    flag_emoji: Optional[str] = None
    currency_code: Optional[str] = None
    languages: Optional[List[str]] = None
    is_active: bool = True

class Country(CountryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CountryStatisticsCreate(BaseModel):
    country_code: str
    country_name: str
    year: int
    
    # Population & Prevalence
    population: Optional[int] = None
    total_affected: Optional[int] = None
    prevalence_rate: Optional[float] = None  # % of population with SUD
    
    # Drug Statistics
    drug_use_any: Optional[int] = None
    drug_use_disorder: Optional[int] = None
    drug_overdose_deaths: Optional[int] = None
    opioid_use: Optional[int] = None
    opioid_deaths: Optional[int] = None
    cannabis_use: Optional[int] = None
    cocaine_use: Optional[int] = None
    amphetamine_use: Optional[int] = None
    
    # Alcohol Statistics
    alcohol_use: Optional[int] = None
    alcohol_use_disorder: Optional[int] = None
    alcohol_related_deaths: Optional[int] = None
    alcohol_per_capita_liters: Optional[float] = None
    
    # Treatment
    treatment_centers: Optional[int] = None
    treatment_capacity: Optional[int] = None
    treatment_admissions: Optional[int] = None
    treatment_gap_percent: Optional[float] = None  # % not receiving treatment
    
    # Economic Impact
    economic_cost_billions: Optional[float] = None
    healthcare_cost_billions: Optional[float] = None
    
    # Data Sources (for citations)
    sources: Optional[List[DataSourceAttribution]] = None
    primary_source: Optional[str] = None
    primary_source_url: Optional[str] = None

class CountryStatistics(CountryStatisticsCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# TREATMENT CENTER (International)
# ============================================

class TreatmentCenterCreate(BaseModel):
    name: str
    
    # Location
    country_code: str = "USA"
    country_name: str = "United States"
    state_id: Optional[str] = None  # For US states
    state_name: Optional[str] = None
    city: str
    address: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Contact
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    
    # Services
    treatment_types: Optional[List[str]] = None  # Inpatient, Outpatient, Detox
    substances_treated: Optional[List[str]] = None  # Alcohol, Opioids, etc.
    services: Optional[List[str]] = None  # Therapy types, MAT, etc.
    insurance_accepted: Optional[List[str]] = None
    payment_options: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    
    # Ratings & Verification
    rating: Optional[float] = None
    reviews_count: int = 0
    is_verified: bool = False
    is_featured: bool = False
    verification_source: Optional[str] = None
    
    # Media
    image_url: Optional[str] = None
    gallery: Optional[List[str]] = None
    description: Optional[str] = None
    
    is_active: bool = True

class TreatmentCenter(TreatmentCenterCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# CMS PAGE CONTENT (Enhanced for Legal Pages)
# ============================================

class CMSPageCreate(BaseModel):
    slug: str  # about-us, privacy-policy, terms-of-service
    title: str
    content: str  # HTML or Markdown
    content_format: str = "html"  # html, markdown
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_published: bool = True
    last_edited_by: Optional[str] = None

class CMSPage(CMSPageCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    version: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None

# ============================================
# AUDIT LOG (Version History)
# ============================================

class AuditLogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    collection: str  # Which collection was modified
    document_id: str  # ID of the modified document
    action: str  # create, update, delete, publish
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    changes: Optional[Dict[str, Any]] = None  # What changed
    previous_data: Optional[Dict[str, Any]] = None  # Snapshot before change
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# DATA REVIEW WORKFLOW
# ============================================

class ReviewStatus(BaseModel):
    status: str = "draft"  # draft, pending_review, approved, published, rejected
    submitted_at: Optional[datetime] = None
    submitted_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None

# ============================================
# API RESPONSE MODELS
# ============================================

class PaginatedResponse(BaseModel):
    data: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

# ============================================
# STATE DRUG LAWS
# ============================================

class LawSource(BaseModel):
    name: str  # "Connecticut General Statutes"
    section: Optional[str] = None  # "§ 21a-279"
    url: Optional[str] = None  # Official legislature URL
    accessed_date: Optional[str] = None  # "2026-03-10"

class StateDrugLawCreate(BaseModel):
    state_id: str  # "CT"
    state_name: str  # "Connecticut"

    # Key takeaways (feeds AI Overviews & featured snippets)
    key_takeaways: Optional[List[str]] = None  # 5-7 bullet points

    # Content sections (HTML)
    overview: Optional[str] = None
    possession_penalties: Optional[str] = None
    dui_dwi_laws: Optional[str] = None
    marijuana_status: Optional[str] = None  # legal, medical, decriminalized, illegal
    marijuana_details: Optional[str] = None
    good_samaritan_law: Optional[str] = None  # yes/no + details
    good_samaritan_exists: bool = False
    naloxone_access: Optional[str] = None
    drug_courts: Optional[str] = None
    mandatory_minimums: Optional[str] = None
    recent_changes: Optional[str] = None  # 2025-2026 legislation
    treatment_alternatives: Optional[str] = None  # Diversion programs, Prop 36-type

    # Penalty table rows: [{offense, substance, amount, classification, jail_time, fine}]
    penalty_table: Optional[List[dict]] = None

    # Drug schedule classification: [{schedule, description, examples}]
    drug_schedules: Optional[List[dict]] = None

    # FAQ schema (PAA-matching questions): [{question, answer}]
    faqs: Optional[List[dict]] = None

    # Citations
    sources: Optional[List[LawSource]] = None

    # Attorney referral
    state_bar_url: Optional[str] = None
    state_bar_name: Optional[str] = None
    legal_aid_url: Optional[str] = None

    # SEO
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None

    # Author E-E-A-T
    reviewed_by: Optional[str] = None  # "John Smith, J.D."
    reviewer_credentials: Optional[str] = None  # "Licensed Attorney, CA Bar #12345"

    # Status
    status: str = "draft"  # draft, published
    last_verified_date: Optional[str] = None
    confidence_score: Optional[str] = None  # high, medium, low

class StateDrugLaw(StateDrugLawCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# API RESPONSE MODELS
# ============================================

class DashboardCounts(BaseModel):
    statistics_count: int
    substance_count: int
    resources_count: int
    sources_count: int
    guides_count: int
    faqs_count: int
    articles_count: int
    seo_count: int
    countries_count: int = 0
    treatment_centers_count: int = 0
