# United Rehabs - Changelog

## January 24, 2026

### Phase 9: International Expansion & Treatment Centers ✅ (Latest)
**Expanded from US-only to international coverage with 20 countries**

#### New Features:
- **Treatment Center Listings Page (`/rehab-centers`)**: Full-featured page with search, filters, pagination
- **International Country Data**: 20 countries with 7 years of verified statistics (2019-2025)
- **Data Source Citations**: All statistics include source attribution (WHO, UNODC, SAMHSA, etc.)
- **Global Statistics API**: Aggregated statistics across all countries
- **CMS Pages API**: Backend support for editable legal pages
- **Version History/Audit Logging**: Track all data changes

#### Backend Endpoints Added:
- `GET /api/countries` - List all 20 countries
- `GET /api/countries/{code}` - Country details with statistics
- `GET /api/countries/{code}/statistics` - Country statistics by year
- `GET /api/countries/{code}/centers` - Treatment centers in country
- `GET /api/treatment-centers/search` - Search centers by name
- `GET /api/global/statistics` - Aggregated global statistics
- `GET /api/pages/{slug}` - CMS page content
- `PUT /api/pages/{slug}` - Update CMS page (admin)
- `GET /api/audit/{collection}/{id}` - Version history

#### Data Population:
- **20 Countries**: USA, UK, Canada, Australia, Germany, France, Brazil, Mexico, India, Japan, Spain, Italy, Netherlands, South Africa, Thailand, Poland, Argentina, South Korea, Russia, China
- **140 Statistics Records**: 20 countries × 7 years (2019-2025)
- **104 Treatment Centers**: 84 US + 20 international (UK, Canada, Australia, Germany, Thailand, Spain, Netherlands, South Africa, Mexico)
- **Verified Sources**: WHO, UNODC, EMCDDA, SAMHSA, country health ministries

#### Files Created/Modified:
- `/app/frontend/src/pages/RehabCenters.tsx` - NEW: Treatment centers listing page
- `/app/backend/country_data.py` - NEW: International data seeding script
- `/app/backend/models.py` - Added Country, CountryStatistics, TreatmentCenter, CMSPage, AuditLogEntry models
- `/app/backend/server.py` - Added 10+ new API endpoints
- `/app/frontend/src/lib/api.ts` - Added countriesApi, globalStatsApi, cmsApi
- `/app/frontend/src/App.tsx` - Added /rehab-centers route

---

### Phase 8: Homepage Connected to Backend API ✅
**Completed the connection of the homepage to the optimized backend API**

#### New Features:
- **Single Optimized API Call**: Homepage now fetches all data from `/api/homepage/data` in one call
- **TrustIndicators Component**: Displays dynamic national statistics (12.2M Americans Affected, 13K Treatment Centers, 42.2% Avg Recovery Rate, 2.1M Treatment Admissions)
- **LocationsSection Component**: Displays all 51 states with real treatment center counts from database
- **DynamicFeaturedCenters Component**: New component showing 8 featured treatment centers
- **React Query Caching**: 5-minute stale time for optimal performance

#### Files Created/Modified:
- `/app/frontend/src/pages/Index.tsx` - Updated to use homepageApi.getData()
- `/app/frontend/src/components/home/TrustIndicators.tsx` - Added national stats display with props
- `/app/frontend/src/components/home/LocationsSection.tsx` - Rewritten to use backend state counts
- `/app/frontend/src/components/home/DynamicFeaturedCenters.tsx` - NEW component for featured centers
- `/app/frontend/src/lib/api.ts` - Added homepageApi and treatmentCentersApi

#### Backend Endpoint Used:
- `GET /api/homepage/data` - Returns national_stats, top_states, featured_centers, faqs, state_counts, data_year

---

### Phase 7: Comprehensive Statistics Visualizations ✅
**Added substance trend charts and historical data**

#### New Features:
- **Opioid Use Trends Chart**: Line chart showing Rx Opioids, Heroin, and Opioid Disorder trends (2019-2024)
- **Stimulant Use Trends Chart**: Line chart showing Cocaine and Meth use trends (2019-2024)
- **Annual Deaths by Substance Chart**: Stacked bar chart showing Fentanyl, Alcohol, Meth, Cocaine deaths (2019-2024)
- **Historical Substance Data**: Added 2019-2023 substance statistics for Florida

#### Files Modified:
- `/app/frontend/src/components/listing/tabs/StatisticsTab.tsx` - Added 3 new trend charts
- Database: Added 5 historical substance_statistics records for FL (2019-2023)

---

### Phase 6: Statistics Visualizations Enhancement ✅
**Major overhaul of statistics display with interactive charts**

#### New Features:
- **Year Dropdown Selector**: Filter statistics by year (2019-2024)
- **People Affected Over Time**: Area chart showing historical trends
- **Overdose & Opioid Deaths**: Dual-line chart comparing death types
- **Age Group Distribution**: Pie/donut chart (12-17, 18-25, 26-34, 35+)
- **Treatment Facilities**: Pie chart (Inpatient vs Outpatient)
- **Economic Impact**: Bar chart in billions USD
- **Treatment Access Gap**: Donut chart showing received vs needed treatment
- **Substance Statistics Sections**: Opioid, Alcohol, Stimulant, Cannabis breakdowns
- **Data Methodology Accordions**: Expandable documentation sections
- **Official Data Sources**: Links to SAMHSA, CDC WONDER, NIDA, TEDS

#### Files Modified:
- `/app/frontend/src/components/listing/tabs/StatisticsTab.tsx` - Complete rewrite with Recharts
- `/app/frontend/package.json` - Added recharts, prop-types, react-is
- Database: Added historical statistics for FL (2019-2023)

---

### Phase 5: Public Pages Connected to Backend ✅
**Fixed state pages to display live data from database**

#### Bug Fixes:
- Fixed state_id format mismatch (lowercase "fl" → uppercase "FL")
- Fixed Vite config to expose REACT_APP_BACKEND_URL

#### Files Modified:
- `/app/frontend/src/pages/StateStatsPage.tsx` - Use stateConfig.abbreviation
- `/app/frontend/src/pages/StateRehabsPage.tsx` - Use stateConfig.abbreviation
- `/app/frontend/src/pages/StateResourcesPage.tsx` - Use stateConfig.abbreviation
- `/app/frontend/src/components/listing/tabs/FreeResourcesTab.tsx` - Enhanced with nationwide/local separation
- `/app/frontend/src/components/listing/DynamicFAQ.tsx` - New component for API-driven FAQs
- `/app/frontend/vite.config.ts` - Added define for REACT_APP_BACKEND_URL

---

### Earlier Work (Prior Sessions)
- Full stack migration from Lovable/Supabase to FastAPI/React/MongoDB
- Backend implementation with JWT authentication
- Admin panel overhaul (14 pages)
- AI data pipeline integration (Gemini 2.5 Flash)
- Bulk import feature
- Data seeding for California and Florida
