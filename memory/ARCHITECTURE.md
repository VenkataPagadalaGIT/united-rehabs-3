# United Rehabs - System Architecture & Implementation Log

## Document Purpose
This document serves as the single source of truth for system architecture, implementation progress, and recovery information. All changes are logged here for continuity.

---

## 🌍 Project Scope (Updated January 24, 2026)

### Original Scope
- US-focused addiction treatment directory (51 states)
- Admin panel for content management
- AI pipeline for data generation

### Expanded Scope (International)
- **195 Countries** with verified addiction statistics
- Historical data: **2019-2025** (7 years)
- **Government & WHO data sources** with citations
- International treatment centers directory
- Multi-language ready architecture

---

## 📊 Data Sources & Citations

### Global Organizations
| Source | Coverage | Data Types | URL |
|--------|----------|------------|-----|
| WHO | 194 countries | Alcohol, Drug use, Deaths | who.int |
| UNODC | Global | Drug trafficking, Use disorders | unodc.org |
| EMCDDA | 30 EU countries | Treatment, Deaths, Prevalence | emcdda.europa.eu |
| IHME/GBD | Global | Disease burden, Deaths | healthdata.org |

### Regional Sources
| Region | Source | Countries |
|--------|--------|-----------|
| North America | SAMHSA, CCSA, CONADIC | USA, Canada, Mexico |
| Europe | EMCDDA, OHID | EU + UK |
| Asia Pacific | AIHW, WHO SEARO | Australia, India, Thailand |
| South America | SENAD, OAS/CICAD | Brazil, Argentina, Colombia |

### Data Attribution Format
All statistics include:
- `source_name`: Organization name
- `source_url`: Direct link to data
- `source_year`: Publication year
- `confidence_level`: high/medium/estimated

---

## 🗄️ Database Architecture

### Collections Overview

```
MongoDB: united_rehabs
├── users                        # Admin authentication
├── countries                    # 195 country metadata [NEW]
├── country_statistics           # Country addiction stats [NEW]
├── country_substance_stats      # Substance breakdown by country [NEW]
├── state_addiction_statistics   # US state stats (existing)
├── substance_statistics         # US state substance stats (existing)
├── treatment_centers            # International centers [EXPANDED]
├── data_sources                 # Citation registry [NEW]
├── faqs                         # FAQs (state + country)
├── free_resources               # Resources (state + country)
├── articles                     # Blog/news content
├── page_content                 # CMS content [ENHANCED]
├── page_seo                     # SEO metadata
└── audit_log                    # Version history [NEW]
```

### Country Statistics Schema
```javascript
{
  id: "uuid",
  country_code: "USA",           // ISO 3166-1 alpha-3
  country_name: "United States",
  region: "North America",
  year: 2024,
  
  // Core Statistics
  population: 331900000,
  total_affected: 48000000,      // People with SUD
  prevalence_rate: 14.5,         // % of population
  
  // Deaths
  drug_overdose_deaths: 107000,
  alcohol_related_deaths: 140000,
  
  // Treatment
  treatment_centers: 16066,
  treatment_capacity: 2500000,
  treatment_admissions: 1800000,
  treatment_gap_percent: 89,     // % not receiving treatment
  
  // Economic
  economic_cost_billions: 442,
  
  // Data Source Attribution
  sources: [
    {
      field: "drug_overdose_deaths",
      source_name: "CDC WONDER",
      source_url: "https://wonder.cdc.gov",
      source_year: 2024,
      confidence: "high"
    }
  ],
  
  created_at: ISODate,
  updated_at: ISODate
}
```

### Treatment Center Schema (International)
```javascript
{
  id: "uuid",
  name: "Center Name",
  
  // Location
  country_code: "USA",
  country_name: "United States",
  state_id: "CA",                // For US states
  state_name: "California",
  city: "Los Angeles",
  address: "123 Recovery St",
  zip_code: "90001",
  latitude: 34.0522,
  longitude: -118.2437,
  
  // Contact
  phone: "+1-555-123-4567",
  email: "info@center.com",
  website: "https://center.com",
  
  // Details
  treatment_types: ["Inpatient", "Outpatient", "Detox"],
  substances_treated: ["Alcohol", "Opioids", "Stimulants"],
  services: ["Individual Therapy", "Group Therapy", "MAT"],
  insurance_accepted: ["Medicare", "Medicaid", "Private"],
  languages: ["English", "Spanish"],
  
  // Ratings
  rating: 4.5,
  reviews_count: 127,
  is_verified: true,
  is_featured: false,
  
  // Media
  image_url: "https://...",
  gallery: ["url1", "url2"],
  
  is_active: true,
  created_at: ISODate,
  updated_at: ISODate
}
```

---

## 🔄 API Endpoints

### Existing Endpoints
- `GET /api/homepage/data` - Homepage aggregated data
- `GET /api/statistics` - US state statistics
- `GET /api/treatment-centers` - Treatment centers

### New Endpoints (Implemented ✅)
```
# Countries ✅
GET  /api/countries                    # List all countries
GET  /api/countries/{code}             # Single country details
GET  /api/countries/{code}/statistics  # Country statistics
GET  /api/countries/{code}/centers     # Treatment centers in country

# Treatment Centers (Enhanced) ✅
GET  /api/treatment-centers            # With country filter
GET  /api/treatment-centers/search     # Full-text search
GET  /api/treatment-centers/{id}       # Single center

# CMS/Legal Pages ✅
GET  /api/pages/{slug}                 # Get page content
PUT  /api/pages/{slug}                 # Update page (admin)

# Global Statistics ✅
GET  /api/global/statistics            # Aggregated global stats
GET  /api/homepage/data/international  # International homepage data

# Audit/Version History ✅
GET  /api/audit/{collection}/{id}      # Get change history
```

---

## 📁 File Structure

```
/app/
├── backend/
│   ├── server.py              # Main API server
│   ├── models.py              # Pydantic models [UPDATE]
│   ├── auth.py                # JWT authentication
│   ├── data_pipeline.py       # AI data generation
│   ├── country_data.py        # Country data seeding [NEW]
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── home/
│   │   │   │   ├── LocationsSection.tsx  [UPDATE - countries]
│   │   │   │   └── WorldMap.tsx          [UPDATE - interactive]
│   │   │   ├── listing/
│   │   │   │   └── DataSourceCitation.tsx [NEW]
│   │   │   └── centers/
│   │   │       ├── CenterCard.tsx        [NEW]
│   │   │       ├── CenterFilters.tsx     [NEW]
│   │   │       └── CenterSearch.tsx      [NEW]
│   │   ├── pages/
│   │   │   ├── RehabCenters.tsx          [NEW]
│   │   │   ├── CountryPage.tsx           [NEW]
│   │   │   ├── AboutPage.tsx             [UPDATE - CMS]
│   │   │   └── PrivacyPage.tsx           [UPDATE - CMS]
│   │   └── lib/
│   │       └── api.ts                    [UPDATE]
│   └── package.json
│
└── memory/
    ├── PRD.md
    ├── CHANGELOG.md
    ├── ROADMAP.md
    └── ARCHITECTURE.md          # This file
```

---

## ✅ Implementation Progress

### Phase 1: Treatment Center Listings Page ✅ COMPLETE
- [x] Create `/rehab-centers` page component
- [x] Implement search functionality  
- [x] Add filters (country, state, treatment type, insurance)
- [x] Add pagination
- [ ] Add map view option (future enhancement)

### Phase 2: International Countries Data ✅ COMPLETE
- [x] Create country models in backend
- [x] Seed top 20 countries with verified data
- [x] Add data source citations
- [x] Create `/api/countries` endpoints
- [x] Create `/api/global/statistics` endpoint
- [ ] Update LocationsSection for countries (partial - needs country links)
- [ ] Create country detail pages (next task)

### Phase 3: Legal/CMS Pages ✅ BACKEND COMPLETE
- [x] Create page_content API for CMS
- [x] Add GET/PUT `/api/pages/{slug}` endpoints
- [ ] Update About Us page to use CMS (frontend pending)
- [ ] Update Privacy Policy to use CMS (frontend pending)
- [ ] Add admin interface for editing (future)

### Phase 4: Data Review Workflow (Future)
- [ ] Add status field (draft/review/published)
- [ ] Create review queue in admin
- [ ] Add approval workflow

### Phase 5: Version History ✅ BACKEND COMPLETE
- [x] Create audit_log collection
- [x] Track all data changes
- [ ] Add revision viewer in admin (future)

---

## 🌍 Top 20 Priority Countries

Based on population, data availability, and treatment infrastructure:

| Rank | Country | Code | Region | Priority |
|------|---------|------|--------|----------|
| 1 | United States | USA | North America | ✅ Done |
| 2 | United Kingdom | GBR | Europe | High |
| 3 | Canada | CAN | North America | High |
| 4 | Australia | AUS | Oceania | High |
| 5 | Germany | DEU | Europe | High |
| 6 | France | FRA | Europe | High |
| 7 | Brazil | BRA | South America | High |
| 8 | Mexico | MEX | North America | High |
| 9 | India | IND | Asia | Medium |
| 10 | Japan | JPN | Asia | Medium |
| 11 | Spain | ESP | Europe | Medium |
| 12 | Italy | ITA | Europe | Medium |
| 13 | Netherlands | NLD | Europe | Medium |
| 14 | South Africa | ZAF | Africa | Medium |
| 15 | Thailand | THA | Asia | Medium |
| 16 | Poland | POL | Europe | Medium |
| 17 | Argentina | ARG | South America | Medium |
| 18 | South Korea | KOR | Asia | Medium |
| 19 | Russia | RUS | Europe/Asia | Medium |
| 20 | China | CHN | Asia | Medium |

---

## 🔧 Recovery Information

### If System Crashes
1. All data is in MongoDB `united_rehabs` database
2. Code is in `/app/` directory
3. Environment variables in `/app/backend/.env` and `/app/frontend/.env`
4. This document contains full architecture

### Key Environment Variables
```
# Backend
MONGO_URL=mongodb://localhost:27017
DB_NAME=united_rehabs
EMERGENT_LLM_KEY=sk-emergent-...

# Frontend  
REACT_APP_BACKEND_URL=https://...
```

### Admin Credentials
- Email: admin@unitedrehabs.com
- Password: admin_password

---

## 📝 Change Log (This Session)

| Time | Change | Files |
|------|--------|-------|
| - | Created ARCHITECTURE.md | /app/memory/ARCHITECTURE.md |
| - | Next: Treatment Centers Page | - |

---

*Last Updated: January 24, 2026*
