# United Rehabs - Complete Technical Documentation

> **Version**: 1.0  
> **Last Updated**: January 2026  
> **Purpose**: VC Pitch Technical Reference & Developer Onboarding Guide

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Technology Stack](#3-technology-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Schema](#5-database-schema)
6. [Backend Services (Edge Functions)](#6-backend-services-edge-functions)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Authentication & Security](#8-authentication--security)
9. [AI Integration](#9-ai-integration)
10. [Content Management System](#10-content-management-system)
11. [Data Pipeline & Generation](#11-data-pipeline--generation)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [API Reference](#13-api-reference)
14. [Development Guide](#14-development-guide)
15. [Scaling Considerations](#15-scaling-considerations)

---

## 1. Executive Summary

**United Rehabs** is a comprehensive addiction recovery resource platform providing state-specific rehabilitation center listings, addiction statistics, educational content, and free resources for all 50 US states.

### Key Metrics
- **Coverage**: 50 US states with localized content
- **Data Sources**: CDC WONDER, SAMHSA, NIH, DEA (federal agencies)
- **Content Types**: Statistics (1992-2026), FAQs, Resources, Articles, SEO
- **AI-Powered**: Automated content generation with quality assurance

### Value Proposition
- First comprehensive, AI-augmented addiction recovery directory
- Real-time verified statistics from federal health agencies
- Scalable content generation for rapid market expansion

---

## 2. Product Overview

### 2.1 User-Facing Features

| Feature | Description | URL Pattern |
|---------|-------------|-------------|
| **State Pages** | Comprehensive rehab listings per state | `/{state-slug}` |
| **Statistics Tab** | Historical addiction data visualization | `/{state-slug}#statistics` |
| **Resources Tab** | Free local resources (hotlines, Medicaid) | `/{state-slug}#resources` |
| **Articles/Blog** | Educational content on addiction topics | `/blog`, `/article/{slug}` |
| **Treatment Finder** | Search with filters (insurance, therapy type) | Homepage search |

### 2.2 Admin Features

| Feature | Description | Route |
|---------|-------------|-------|
| **Dashboard** | Overview metrics and quick actions | `/admin` |
| **Content Generator** | AI-powered bulk content creation | `/admin/content-generator` |
| **Data Coverage** | Monitor data completeness across states | `/admin/data-coverage` |
| **Articles Manager** | CRUD for blog/news/guides | `/admin/articles` |
| **Statistics Admin** | Manage addiction statistics | `/admin/statistics` |
| **SEO Manager** | Page-level SEO configuration | `/admin/seo` |
| **Security Admin** | User roles and MFA management | `/admin/security` |

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool & dev server |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **shadcn/ui** | Latest | Component library (Radix primitives) |
| **React Query** | 5.83.0 | Server state management |
| **React Router** | 6.30.1 | Client-side routing |
| **Recharts** | 2.15.4 | Data visualization |
| **Framer Motion** | (via shadcn) | Animations |

### 3.2 Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database |
| **Supabase Auth** | Authentication (email/password) |
| **Supabase RLS** | Row-Level Security policies |
| **Edge Functions** | Serverless backend logic (Deno) |
| **Supabase Storage** | Image/file storage |

### 3.3 AI Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **Perplexity AI** | Perplexity | Web research (CDC, SAMHSA, NIH) |
| **Gemini** | Google (via Lovable AI) | Content generation & structuring |
| **Lovable AI Gateway** | Lovable | Unified AI access (no API keys needed) |

### 3.4 External Dependencies

```json
{
  "core": {
    "@supabase/supabase-js": "^2.89.0",
    "@tanstack/react-query": "^5.83.0",
    "react-router-dom": "^6.30.1"
  },
  "ui": {
    "lucide-react": "^0.462.0",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4"
  },
  "forms": {
    "react-hook-form": "^7.61.1",
    "zod": "^3.25.76",
    "@hookform/resolvers": "^3.10.0"
  },
  "security": {
    "dompurify": "^3.3.1"
  }
}
```

---

## 4. Architecture Overview

### 4.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     React SPA (Vite + TypeScript)                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │  Public UI   │  │  Admin CMS   │  │  Auth Pages  │              │   │
│  │  │  (State,     │  │  (Content,   │  │  (Login,     │              │   │
│  │  │   Articles)  │  │   Stats)     │  │   MFA)       │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                          ↓                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │              React Query (Server State Cache)                 │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOVABLE CLOUD (Supabase)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        EDGE FUNCTIONS (Deno)                         │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │   │
│  │  │ verify-admin   │  │ research-state │  │ generate-      │        │   │
│  │  │ (Auth Gate)    │  │ (Perplexity)   │  │ content        │        │   │
│  │  └────────────────┘  └────────────────┘  └────────────────┘        │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │   │
│  │  │ qa-review      │  │ verify-state-  │  │ generate-      │        │   │
│  │  │ (Quality Gate) │  │ data-dual      │  │ historical-    │        │   │
│  │  └────────────────┘  └────────────────┘  │ stats          │        │   │
│  │                                          └────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        POSTGRESQL DATABASE                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ state_      │  │ substance_  │  │ articles    │                 │   │
│  │  │ addiction_  │  │ statistics  │  │             │                 │   │
│  │  │ statistics  │  │             │  │             │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ faqs        │  │ free_       │  │ page_seo    │                 │   │
│  │  │             │  │ resources   │  │             │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ user_roles  │  │ rate_limits │  │ page_content│                 │   │
│  │  │ (RLS)       │  │ (Security)  │  │             │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SUPABASE AUTH + STORAGE                         │   │
│  │  • Email/Password Authentication                                     │   │
│  │  • Session Management (JWT)                                          │   │
│  │  • article-images bucket (public)                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL AI SERVICES                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  PERPLEXITY AI                    │  LOVABLE AI GATEWAY (Gemini)     │  │
│  │  • Web search (CDC, SAMHSA)       │  • Content structuring           │  │
│  │  • Real-time data verification    │  • JSON generation               │  │
│  │  • Citation extraction            │  • Quality assurance review      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     CONTENT GENERATION PIPELINE                          │
└──────────────────────────────────────────────────────────────────────────┘

     ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────┐
     │ Admin UI    │───▶│ Research    │───▶│ Generate    │───▶│ QA      │
     │ Triggers    │    │ (Perplexity)│    │ (Gemini)    │    │ Review  │
     └─────────────┘    └─────────────┘    └─────────────┘    └─────────┘
                                                                   │
     ┌─────────────────────────────────────────────────────────────┘
     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Approved?   │───▶│ Database    │───▶│ Live on     │
│ (Score≥70)  │    │ Upsert      │    │ State Page  │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA (PUBLIC)                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐       ┌──────────────────────────┐
│   state_addiction_       │       │   substance_statistics    │
│   statistics             │       │                          │
├──────────────────────────┤       ├──────────────────────────┤
│ id: uuid (PK)            │       │ id: uuid (PK)            │
│ state_id: text           │◄─────▶│ state_id: text           │
│ state_name: text         │       │ state_name: text         │
│ year: integer            │       │ year: integer            │
│ total_affected: int      │       │ alcohol_use_disorder: int│
│ overdose_deaths: int     │       │ opioid_use_disorder: int │
│ opioid_deaths: int       │       │ fentanyl_deaths: int     │
│ alcohol_abuse_rate: dec  │       │ cocaine_use_disorder: int│
│ drug_abuse_rate: decimal │       │ meth_use_disorder: int   │
│ treatment_admissions: int│       │ marijuana_use_disorder:  │
│ recovery_rate: decimal   │       │ treatment_received: int  │
│ economic_cost_billions:  │       │ mat_recipients: int      │
│ data_source: text        │       │ mental_illness_with_sud: │
│ created_at, updated_at   │       │ created_at, updated_at   │
└──────────────────────────┘       └──────────────────────────┘
            │                                   │
            └───────────────┬───────────────────┘
                            │ state_id
                            ▼
┌──────────────────────────┐       ┌──────────────────────────┐
│   faqs                   │       │   free_resources          │
├──────────────────────────┤       ├──────────────────────────┤
│ id: uuid (PK)            │       │ id: uuid (PK)            │
│ state_id: text (FK)      │       │ state_id: text (FK)      │
│ question: text           │       │ title: text              │
│ answer: text             │       │ description: text        │
│ category: text           │       │ resource_type: text      │
│ sort_order: integer      │       │ phone: text              │
│ is_active: boolean       │       │ website: text            │
│ created_at, updated_at   │       │ address: text            │
└──────────────────────────┘       │ is_nationwide: boolean   │
                                   │ is_free: boolean         │
                                   │ featured: boolean        │
                                   │ created_at, updated_at   │
                                   └──────────────────────────┘

┌──────────────────────────┐       ┌──────────────────────────┐
│   articles               │       │   page_seo               │
├──────────────────────────┤       ├──────────────────────────┤
│ id: uuid (PK)            │       │ id: uuid (PK)            │
│ title: text              │       │ page_slug: text          │
│ slug: text (unique)      │       │ page_type: text          │
│ excerpt: text            │       │ state_id: text           │
│ content: text (markdown) │       │ meta_title: text         │
│ content_type: text       │       │ meta_description: text   │
│ featured_image_url: text │       │ meta_keywords: text[]    │
│ author_name: text        │       │ og_title: text           │
│ state_id: text           │       │ og_description: text     │
│ category: text           │       │ og_image_url: text       │
│ tags: text[]             │       │ h1_title: text           │
│ meta_title: text         │       │ intro_text: text         │
│ meta_description: text   │       │ canonical_url: text      │
│ read_time: text          │       │ robots: text             │
│ is_published: boolean    │       │ structured_data: jsonb   │
│ is_featured: boolean     │       │ is_active: boolean       │
│ views_count: integer     │       │ created_at, updated_at   │
│ published_at: timestamp  │       └──────────────────────────┘
│ created_at, updated_at   │
└──────────────────────────┘

┌──────────────────────────┐       ┌──────────────────────────┐
│   user_roles             │       │   rate_limits            │
├──────────────────────────┤       ├──────────────────────────┤
│ id: uuid (PK)            │       │ id: uuid (PK)            │
│ user_id: uuid (FK→auth)  │       │ user_id: uuid            │
│ role: app_role enum      │       │ function_name: text      │
│ created_at: timestamp    │       │ request_count: integer   │
│                          │       │ window_start: timestamp  │
│ UNIQUE(user_id, role)    │       │ created_at: timestamp    │
└──────────────────────────┘       └──────────────────────────┘

┌──────────────────────────┐       ┌──────────────────────────┐
│   page_content           │       │   rehab_guides           │
├──────────────────────────┤       ├──────────────────────────┤
│ id: uuid (PK)            │       │ id: uuid (PK)            │
│ page_key: text           │       │ title: text              │
│ section_key: text        │       │ description: text        │
│ content_type: text       │       │ category: text           │
│ title: text              │       │ content: text            │
│ subtitle: text           │       │ icon_name: text          │
│ body: text               │       │ read_time: text          │
│ country_code: text       │       │ sort_order: integer      │
│ state_id: text           │       │ is_active: boolean       │
│ city_id: text            │       │ created_at, updated_at   │
│ metadata: jsonb          │       └──────────────────────────┘
│ is_active: boolean       │
│ sort_order: integer      │       ┌──────────────────────────┐
│ created_at, updated_at   │       │   data_sources           │
└──────────────────────────┘       ├──────────────────────────┤
                                   │ id: uuid (PK)            │
                                   │ source_name: text        │
                                   │ source_abbreviation: text│
                                   │ source_url: text         │
                                   │ description: text        │
                                   │ agency: text             │
                                   │ data_types: text[]       │
                                   │ last_updated_year: int   │
                                   │ created_at: timestamp    │
                                   └──────────────────────────┘
```

### 5.2 Table Details

#### `state_addiction_statistics`
Primary statistics table with yearly data per state.

| Column | Type | Description |
|--------|------|-------------|
| `state_id` | text | State abbreviation (e.g., "CA", "TX") |
| `year` | integer | Data year (1992-2026) |
| `total_affected` | integer | Total individuals with SUD |
| `overdose_deaths` | integer | Total overdose fatalities |
| `opioid_deaths` | integer | Opioid-specific deaths |
| `alcohol_abuse_rate` | decimal | % of population |
| `drug_abuse_rate` | decimal | % of population |
| `treatment_admissions` | integer | Annual treatment entries |
| `recovery_rate` | decimal | % successfully completing treatment |
| `economic_cost_billions` | decimal | State economic impact |

**Constraints**: Unique on `(state_id, year)`

#### `substance_statistics`
Detailed substance-specific breakdown.

| Column | Type | Description |
|--------|------|-------------|
| `alcohol_use_disorder` | integer | AUD cases |
| `opioid_use_disorder` | integer | OUD cases |
| `fentanyl_deaths` | integer | Fentanyl-involved deaths |
| `cocaine_use_disorder` | integer | Cocaine dependency |
| `meth_use_disorder` | integer | Methamphetamine dependency |
| `marijuana_use_disorder` | integer | Cannabis use disorder |
| `mat_recipients` | integer | MAT program participants |
| `mental_illness_with_sud` | integer | Dual diagnosis cases |

### 5.3 Enums

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
```

### 5.4 Database Functions

#### `check_rate_limit`
Implements sliding window rate limiting.

```sql
CREATE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_function_name text,
  p_max_requests integer DEFAULT 60,
  p_window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
```

**Logic**: Returns `TRUE` if request allowed, `FALSE` if rate limited.

#### `has_role`
Checks if user has specific role (used in RLS policies).

```sql
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
```

---

## 6. Backend Services (Edge Functions)

### 6.1 Function Overview

| Function | Purpose | Auth | Rate Limit |
|----------|---------|------|------------|
| `verify-admin` | Verify admin status server-side | Bearer Token | No |
| `research-state` | Perplexity research for state data | Admin | 30/hour |
| `generate-content` | Gemini JSON generation | Admin | 30/hour |
| `generate-state-content` | Full pipeline (research→generate) | Admin | 30/hour |
| `qa-review` | Quality assurance scoring | Admin | 30/hour |
| `verify-state-data-dual` | Dual-source verification | Admin | 30/hour |
| `generate-historical-stats` | Bulk historical data | Admin | 30/hour |
| `research-article` | Medical article research | Admin | 30/hour |
| `generate-seo-content` | SEO metadata generation | Admin | 30/hour |

### 6.2 Function Details

#### `verify-admin`
**Purpose**: Server-side admin verification (prevents client-side bypass)

```typescript
// Request
GET /functions/v1/verify-admin
Headers: { Authorization: "Bearer <jwt>" }

// Response (200 OK)
{ "isAdmin": true, "userId": "uuid", "timestamp": "ISO8601" }

// Response (403 Forbidden)
{ "isAdmin": false, "error": "Forbidden" }
```

#### `research-state`
**Purpose**: Research state-specific data using Perplexity AI

```typescript
// Request
POST /functions/v1/research-state
{
  "stateName": "California",
  "stateAbbreviation": "CA",
  "researchType": "statistics" | "substance_statistics" | "resources" | "faqs" | "seo",
  "year": 2023  // optional
}

// Response
{
  "success": true,
  "data": {
    "content": "...research results...",
    "citations": ["https://cdc.gov/...", "https://samhsa.gov/..."],
    "timestamp": "ISO8601"
  }
}
```

**Research Sources Priority**:
1. samhsa.gov (TEDS, NSDUH, N-SSATS)
2. cdc.gov (CDC WONDER, NCHS)
3. nida.nih.gov (NIH/NIDA)
4. dea.gov (DEA reports)
5. State .gov health departments

#### `generate-content`
**Purpose**: Transform research into structured JSON using Gemini

```typescript
// Request
POST /functions/v1/generate-content
{
  "stateName": "California",
  "stateAbbreviation": "CA",
  "contentType": "statistics",
  "researchData": "...from research-state...",
  "citations": [...],
  "year": 2023
}

// Response
{
  "success": true,
  "data": {
    "year": 2023,
    "state_id": "CA",
    "overdose_deaths": 12345,
    // ... structured data
  }
}
```

#### `qa-review`
**Purpose**: Quality assurance review of generated content

```typescript
// Request
POST /functions/v1/qa-review
{
  "stateName": "California",
  "contentType": "statistics",
  "generatedContent": {...},
  "originalResearch": "..."
}

// Response
{
  "success": true,
  "data": {
    "review": {
      "approved": true,
      "score": 85,
      "issues": [],
      "suggestions": ["Consider adding more recent data"]
    }
  }
}
```

**Approval Criteria**: `score >= 70`

### 6.3 Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTION SECURITY                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────┐
│  Request    │──▶│  Auth       │──▶│  Rate       │──▶│  Main   │
│  Received   │   │  Check      │   │  Limit      │   │  Logic  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────┘
                       │                  │
                       ▼                  ▼
                  ┌─────────────┐   ┌─────────────┐
                  │ 401/403     │   │ 429 Too     │
                  │ Unauthorized│   │ Many Reqs   │
                  └─────────────┘   └─────────────┘
```

**Verification Flow**:
1. Extract JWT from `Authorization: Bearer` header
2. Validate token via `supabase.auth.getUser()`
3. Query `user_roles` table for admin role
4. Check rate limit via `check_rate_limit()` RPC
5. Execute function logic

---

## 7. Frontend Architecture

### 7.1 Directory Structure

```
src/
├── components/
│   ├── admin/                    # Admin-specific components
│   │   ├── BulkImportExport.tsx
│   │   ├── PageTemplateGenerator.tsx
│   │   └── RecentActivityLog.tsx
│   ├── article/                  # Article/blog components
│   │   ├── ImageUploader.tsx
│   │   ├── RelatedArticles.tsx
│   │   ├── RichContentEditor.tsx
│   │   └── TableOfContents.tsx
│   ├── auth/                     # Authentication components
│   │   ├── TwoFactorManage.tsx
│   │   ├── TwoFactorSetup.tsx
│   │   └── TwoFactorVerify.tsx
│   ├── home/                     # Homepage components
│   │   ├── HeroSection.tsx
│   │   ├── BrowseBySection.tsx
│   │   ├── StatisticsSection.tsx
│   │   └── TestimonialsSection.tsx
│   ├── listing/                  # State page components
│   │   ├── Header.tsx
│   │   ├── TreatmentCard.tsx
│   │   ├── TreatmentGrid.tsx
│   │   └── tabs/
│   │       ├── StatisticsTab.tsx
│   │       ├── FreeResourcesTab.tsx
│   │       └── RehabListingsTab.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (40+ components)
├── data/
│   ├── allStates.ts              # 50 US states metadata
│   ├── stateConfig.ts            # Detailed state configurations
│   └── mockData.ts               # Development fallback data
├── hooks/
│   ├── useAuth.ts                # Authentication state
│   ├── useMFA.ts                 # Multi-factor auth
│   ├── useFilters.ts             # Search filters
│   └── usePageContent.ts         # Dynamic content fetching
├── lib/
│   ├── api/
│   │   └── contentGenerator.ts   # AI generation API wrapper
│   ├── sanitize.ts               # XSS prevention (DOMPurify)
│   ├── utils.ts                  # Utility functions
│   └── validation.ts             # Zod schemas
├── pages/
│   ├── admin/                    # Admin routes
│   │   ├── Dashboard.tsx
│   │   ├── ArticlesAdmin.tsx
│   │   ├── ContentGeneratorAdmin.tsx
│   │   ├── DataCoverageAdmin.tsx
│   │   └── ... (10 admin pages)
│   ├── Index.tsx                 # Homepage
│   ├── StatePage.tsx             # Dynamic state pages
│   ├── ArticlePage.tsx           # Article detail
│   └── ... (legal, about pages)
├── types/
│   └── index.ts                  # TypeScript interfaces
└── integrations/
    └── supabase/
        ├── client.ts             # Supabase client (auto-generated)
        └── types.ts              # Database types (auto-generated)
```

### 7.2 Routing Architecture

```typescript
// src/App.tsx - Route Configuration
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Index />} />
  <Route path="/blog" element={<ArticlesListPage />} />
  <Route path="/:type/:slug" element={<ArticlePage />} />
  <Route path="/:slug" element={<StatePage />} />  {/* State pages */}
  
  {/* Legal Routes */}
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/terms-of-service" element={<TermsOfService />} />
  
  {/* Admin Routes (Protected) */}
  <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin" element={<Admin />}>
    <Route index element={<Dashboard />} />
    <Route path="content-generator" element={<ContentGeneratorAdmin />} />
    <Route path="data-coverage" element={<DataCoverageAdmin />} />
    <Route path="articles" element={<ArticlesAdmin />} />
    <Route path="statistics" element={<StatisticsAdmin />} />
    <Route path="seo" element={<SEOAdmin />} />
  </Route>
  
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 7.3 State Management

**React Query** handles all server state:

```typescript
// Example: Fetching state statistics
const { data, isLoading, error } = useQuery({
  queryKey: ["state-statistics", stateId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("state_addiction_statistics")
      .select("*")
      .eq("state_id", stateId)
      .order("year", { ascending: false });
    
    if (error) throw error;
    return data;
  }
});
```

### 7.4 Key Hooks

#### `useAuth`
Manages authentication state and admin verification.

```typescript
const { user, session, isAdmin, loading, signIn, signUp, signOut } = useAuth();
```

**Features**:
- Server-side admin verification via `verify-admin` edge function
- Fallback to `user_roles` query if edge function unavailable
- Session persistence

#### `useMFA`
Handles two-factor authentication flow.

```typescript
const { mfaStatus, verifyTOTP, enableMFA, disableMFA } = useMFA();
// mfaStatus: "loading" | "required" | "verified" | "not_enabled"
```

#### `usePageContent`
Dynamic content fetching with state/city context.

```typescript
const { getContent, isLoading } = usePageContent({ stateId: "CA" });
const heroContent = getContent("hero", "title");
```

---

## 8. Authentication & Security

### 8.1 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                              │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  User       │──▶│  Supabase   │──▶│  JWT        │──▶│  Session    │
│  Login      │   │  Auth       │   │  Token      │   │  Stored     │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
                                                            │
                       ┌────────────────────────────────────┘
                       ▼
              ┌─────────────────┐
              │  Admin Access?  │
              └─────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌─────────┐  ┌─────────────┐  ┌─────────┐
    │ Public  │  │ verify-admin│  │ Admin   │
    │ Access  │  │ Edge Func   │  │ Panel   │
    └─────────┘  └─────────────┘  └─────────┘
```

### 8.2 Row-Level Security (RLS)

All tables have RLS enabled with appropriate policies:

```sql
-- Example: Statistics table
CREATE POLICY "Anyone can view statistics" 
ON public.state_addiction_statistics 
FOR SELECT USING (true);

CREATE POLICY "Admins can manage statistics" 
ON public.state_addiction_statistics 
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Rate limits: Completely locked down
CREATE POLICY "Block all access" 
ON public.rate_limits 
FOR ALL USING (false);
```

### 8.3 Security Measures

| Measure | Implementation |
|---------|----------------|
| **XSS Prevention** | DOMPurify sanitization |
| **CSRF Protection** | Supabase built-in |
| **Rate Limiting** | Database-backed sliding window |
| **Admin Verification** | Server-side edge function |
| **Input Validation** | Zod schemas |
| **SQL Injection** | Parameterized queries (Supabase) |

---

## 9. AI Integration

### 9.1 AI Service Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         AI SERVICE INTEGRATION                           │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        LOVABLE AI GATEWAY                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Endpoint: https://ai.gateway.lovable.dev/v1/chat/completions   │   │
│  │  Auth: LOVABLE_API_KEY (auto-provisioned)                       │   │
│  │  No user API keys required!                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │ Gemini 2.5 Pro  │  │ Gemini 2.5 Flash│  │ GPT-5 Series    │        │
│  │ (Complex tasks) │  │ (Fast tasks)    │  │ (Fallback)      │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        PERPLEXITY AI                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Endpoint: https://api.perplexity.ai/chat/completions           │   │
│  │  Auth: PERPLEXITY_API_KEY (via connector)                       │   │
│  │  Model: sonar-pro (with web search)                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Domain Filters:                                                 │   │
│  │  • cdc.gov, samhsa.gov, nida.nih.gov, dea.gov                   │   │
│  │  • ncbi.nlm.nih.gov, mayoclinic.org, hopkinsmedicine.org        │   │
│  │  • State .gov health department sites                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Content Generation Pipeline

```typescript
// src/lib/api/contentGenerator.ts

// Step 1: Research
const research = await researchState(
  "California", "CA", "statistics", 2023
);

// Step 2: Generate structured content
const content = await generateContent(
  "California", "CA", "statistics",
  research.data.content, research.data.citations, 2023
);

// Step 3: Quality assurance review
const qa = await qaReview(
  "California", "statistics",
  content.data, research.data.content
);

// Step 4: Auto-approve if score >= 70
if (qa.data.review.score >= 70) {
  // Upsert to database
}
```

### 9.3 Supported AI Models

| Model | Use Case | Cost Tier |
|-------|----------|-----------|
| `google/gemini-2.5-pro` | Complex reasoning, content generation | High |
| `google/gemini-2.5-flash` | Fast structured output | Medium |
| `google/gemini-2.5-flash-lite` | Simple classification | Low |
| `openai/gpt-5` | Fallback for complex tasks | High |

---

## 10. Content Management System

### 10.1 Admin Dashboard

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          ADMIN DASHBOARD                                 │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Dashboard    │  │ Content      │  │ Data         │  │ Security   │  │
│  │ Overview     │  │ Generator    │  │ Coverage     │  │ Settings   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ CONTENT MANAGEMENT                                                │   │
│  │ • Articles (Blog/News/Guides)                                     │   │
│  │ • Statistics (State data by year)                                 │   │
│  │ • Substance Statistics (Drug-specific data)                       │   │
│  │ • FAQs (Per-state questions)                                      │   │
│  │ • Resources (Hotlines, Medicaid, Centers)                         │   │
│  │ • SEO (Meta tags, OG data)                                        │   │
│  │ • Guides (Educational content)                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Content Generator Workflow

1. **Select States**: Choose 1-50 US states
2. **Select Content Types**: Statistics, Resources, FAQs, SEO
3. **Select Years** (for statistics): 2015-2024
4. **Start Generation**: AI pipeline processes each state
5. **Review Results**: QA scores, issues, suggestions
6. **Upload Approved**: Batch upsert to database

---

## 11. Data Pipeline & Generation

### 11.1 Historical Data Coverage

| Year Range | Primary Sources | Data Availability |
|------------|-----------------|-------------------|
| 1992-1998 | SAMHSA TEDS | Treatment admissions only |
| 1999-2001 | CDC WONDER, Early NSDUH | Overdose deaths added |
| 2002-Present | Full federal sources | Complete data |

### 11.2 Data Quality Assurance

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      DUAL-SOURCE VERIFICATION                            │
└──────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐                    ┌─────────────┐
    │  Perplexity │                    │   Gemini    │
    │  (Live Web) │                    │ (Training)  │
    └─────────────┘                    └─────────────┘
           │                                  │
           └──────────────┬───────────────────┘
                          ▼
                   ┌─────────────┐
                   │   Compare   │
                   │ (5% tol.)   │
                   └─────────────┘
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Match      │ │ Discrepancy │ │ Missing     │
    │  ✓ Verified │ │ ⚠ Flagged   │ │ ✗ Error     │
    └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 12. Deployment & Infrastructure

### 12.1 Lovable Cloud Features

| Feature | Description |
|---------|-------------|
| **Auto-Deploy** | Push to main branch triggers deployment |
| **Preview URLs** | Per-commit preview environments |
| **Edge Functions** | Automatic Deno deployment |
| **Database** | Managed PostgreSQL |
| **Storage** | S3-compatible object storage |
| **Secrets** | Encrypted environment variables |

### 12.2 Environment Variables

```bash
# Auto-provisioned by Lovable Cloud
VITE_SUPABASE_URL=https://yqtusenxmedosivmeone.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Managed secrets (Edge Functions)
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PERPLEXITY_API_KEY  # Via Perplexity connector
LOVABLE_API_KEY     # Auto-provisioned
```

### 12.3 URLs

| Environment | URL |
|-------------|-----|
| **Preview** | https://id-preview--a5a1563a-cfbe-442c-9143-a678fd64e1ba.lovable.app |
| **Production** | https://unitedrehabs.lovable.app |

---

## 13. API Reference

### 13.1 Public API (Read-Only)

All public data is accessible via Supabase client:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Get state statistics
const { data } = await supabase
  .from("state_addiction_statistics")
  .select("*")
  .eq("state_id", "CA");

// Get published articles
const { data } = await supabase
  .from("articles")
  .select("*")
  .eq("is_published", true);
```

### 13.2 Admin API (Protected)

```typescript
// Content generation (requires admin auth)
const { data, error } = await supabase.functions.invoke("generate-state-content", {
  body: { stateId: "CA", stateName: "California", contentType: "faqs" }
});
```

---

## 14. Development Guide

### 14.1 Local Setup

```bash
# Clone repository
git clone <repo-url>
cd united-rehabs

# Install dependencies
npm install

# Start development server
npm run dev
```

### 14.2 Adding a New State Page

1. State is auto-recognized from `src/data/allStates.ts`
2. Create database entries via Admin > Content Generator
3. Verify coverage in Admin > Data Coverage

### 14.3 Adding New Content Types

1. Create database migration (via Lovable)
2. Add TypeScript types to `src/types/index.ts`
3. Create admin page in `src/pages/admin/`
4. Add route in `src/App.tsx`

---

## 15. Scaling Considerations

### 15.1 Current Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| Database rows | 500K | Supabase free tier |
| Edge function invocations | 500K/month | Supabase free tier |
| Storage | 1GB | article-images bucket |
| AI generation | 30 requests/hour/user | Rate limited |

### 15.2 Scaling Strategies

1. **Database**: Upgrade Supabase tier, add indexes
2. **CDN**: Cloudflare for static assets
3. **Caching**: React Query + SWR patterns
4. **Edge Functions**: Increase memory limits

### 15.3 Roadmap Considerations

- [ ] City-level pages (sub-state granularity)
- [ ] Treatment center profiles with reviews
- [ ] User accounts for saved favorites
- [ ] Insurance verification integration
- [ ] Telehealth provider directory

---

## Appendix A: File Index

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main router configuration |
| `src/hooks/useAuth.ts` | Authentication hook |
| `src/lib/api/contentGenerator.ts` | AI generation API wrapper |
| `supabase/functions/verify-admin/index.ts` | Admin verification |
| `supabase/functions/research-state/index.ts` | Perplexity research |
| `supabase/functions/generate-content/index.ts` | Gemini generation |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **SUD** | Substance Use Disorder |
| **MAT** | Medication-Assisted Treatment |
| **RLS** | Row-Level Security (Supabase) |
| **CDC WONDER** | CDC's mortality database |
| **SAMHSA** | Substance Abuse and Mental Health Services Administration |
| **TEDS** | Treatment Episode Data Set |
| **NSDUH** | National Survey on Drug Use and Health |

---

*Document generated for United Rehabs VC Pitch - January 2026*
