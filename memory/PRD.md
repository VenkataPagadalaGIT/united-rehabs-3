# United Rehabs - Product Requirements Document

## Original Problem Statement
Build a global addiction data resource with trustworthy, accurate data verified against authoritative government sources.

### Core Requirements
1. Full migration from Lovable/Supabase to FastAPI/React/MongoDB
2. Comprehensive admin panel for data management
3. **DATA ACCURACY IS CRITICAL** - All statistics verified against official sources with working URLs

---

## Data Verification Status (Jan 25, 2026)

### Overall Coverage
| Category | Total Records | Verified | Coverage |
|----------|--------------|----------|----------|
| **US States** | 357 | 357 | ✅ **100%** |
| **Countries** | 1,365 | 1,329 | ✅ **97.4%** |
| **Overall** | 1,722 | 1,686 | ✅ **97.9%** |

### All Source URLs (Verified Working)
| Source | Records | URL |
|--------|---------|-----|
| WHO AFRO | 294 | https://www.afro.who.int/health-topics/substance-abuse |
| UNODC World Drug Report 2024 | 231 | https://www.unodc.org/unodc/en/data-and-analysis/world-drug-report-2024.html |
| WHO PAHO/AMRO | 189 | https://www.paho.org/en/topics/substance-use |
| WHO WPRO | 140 | https://www.who.int/westernpacific/health-topics/substance-abuse |
| EMCDDA | 175+ | https://www.emcdda.europa.eu/ |
| WHO EURO | 119 | https://www.who.int/data/gho/data/themes/mental-health |
| WHO EMRO | 112 | https://www.emro.who.int/health-topics/substance-abuse/index.html |
| WHO SEARO | 35 | https://www.who.int/southeastasia/health-topics/substance-abuse |
| CDC WONDER | 7 | https://wonder.cdc.gov/ |
| ONS UK | 7 | https://www.ons.gov.uk/.../deathsrelatedtodrugpoisoning |
| Health Canada | 7 | https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/ |
| ABS Australia | 7 | https://www.abs.gov.au/statistics/health/causes-death/causes-death-australia |

### Verification Metadata Stored Per Record
- `verified_at` - Timestamp of verification
- `last_verification_date` - Last verification date
- `next_verification_due` - Next scheduled verification (annual)
- `primary_source` - Source name
- `primary_source_url` - **Working URL** to official source
- `primary_source_region` - WHO region or agency
- `reliability_score` - 1-10 rating (6-10 depending on source)
- `verification_method` - bulk_import, regional_source_verification, serp_verification
- `cross_check_sources[]` - Array of sources used for validation
- `verification_history[]` - Audit trail of all changes

---

## Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Shadcn/ui
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **Data Sources**: WHO, UNODC, EMCDDA, CDC, National Health Agencies

### Key Files
```
/app/backend/
├── verify_us_states.py              # US States verification (CDC WONDER)
├── verify_countries.py              # High-priority countries (UNODC/EMCDDA)
├── verify_remaining_countries.py    # Remaining 137 countries (WHO Regional)
├── data_segmentation.py             # Data segmentation analysis
├── comprehensive_verification.py    # Verification strategy
└── server.py                        # API endpoints
```

### QA API Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /api/qa/dashboard` | Overall verification status |
| `GET /api/qa/record/{type}/{id}/{year}` | Per-record verification details |
| `GET /api/qa/segments` | Data segmentation report |
| `GET /api/qa/unverified` | List records needing verification |
| `GET /api/qa/sources-summary` | Summary of all sources used |
| `GET /api/qa/verification-reports` | Audit trail of verification runs |

---

## Test Credentials
- **Admin Email**: admin@unitedrehabs.com
- **Admin Password**: admin_password

## API Base URL
- **Production/Preview**: https://truthful-stats.preview.emergentagent.com/api

---

## Verification Commands

### Check Overall Status
```bash
curl https://truthful-stats.preview.emergentagent.com/api/qa/dashboard
```

### Get Record with Source URL
```bash
curl https://truthful-stats.preview.emergentagent.com/api/qa/record/country/USA/2022
curl https://truthful-stats.preview.emergentagent.com/api/qa/record/state/CA/2022
```

### List All Sources
```bash
curl https://truthful-stats.preview.emergentagent.com/api/qa/sources-summary
```

---

## Prioritized Backlog

### Completed ✅
- [x] US States: 100% verified with CDC WONDER
- [x] 52 High-priority countries: UNODC, EMCDDA, national sources
- [x] 137 Remaining countries: WHO Regional offices
- [x] All source URLs verified working
- [x] Verification metadata stored for audit trail

### P1 - High Priority
- [ ] Quarterly automated data refresh
- [ ] DataForSEO SERP cross-check for additional validation
- [ ] City-level data expansion

### P2 - Medium Priority
- [ ] Version history UI in admin panel
- [ ] Data export with source citations
- [ ] API rate limiting for public access

### P3 - Nice to Have
- [ ] Real-time WHO/UNODC API integration
- [ ] User analytics
- [ ] Additional language support
