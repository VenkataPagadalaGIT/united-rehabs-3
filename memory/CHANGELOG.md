# United Rehabs - Changelog

## January 24, 2026

### Phase 13: Enhanced Country Pages with Comprehensive Visualizations ✅ (Latest - Jan 24, 2026)
**Upgraded country pages to match state page richness with full data visualizations**

#### New Features:
- **USA Aggregated Statistics**: Combines all 51 state data into comprehensive national view
- **Historical Trend Charts**: Area, Line, and Bar charts for 2019-2025 data
- **Age Demographics Pie Chart**: Shows affected population by age group
- **Treatment Facilities Pie Chart**: Inpatient vs Outpatient breakdown
- **Substance Statistics Section** (USA only): Detailed opioid, alcohol, stimulant, cannabis stats
- **Economic Impact Charts**: Yearly economic cost in billions USD
- **Drug vs Alcohol Deaths Comparison**: Side-by-side mortality analysis
- **Data Methodology Accordion**: Sources, methodology, limitations explained

#### Files Modified:
- `/app/frontend/src/pages/EnhancedCountryPage.tsx` - NEW: Rich country page with full visualizations
- `/app/frontend/src/App.tsx` - Updated to use EnhancedCountryPage

---

### Phase 12: Advanced Features (Interactive Map, Comparison, Export) ✅ (Jan 24, 2026)
**Implemented interactive global map, country comparison tool, data export, and workflow management**

#### New Features:
- **Interactive Global Map**: Clickable world map on homepage - clicking any country navigates to its stats page
  - Color-coded by region (Europe: blue, Asia: pink, Africa: yellow, Americas: green/purple, Oceania: cyan)
  - Hover tooltips showing country name, flag, and region
  - Legend showing region colors
- **Country Comparison Tool** (`/compare`): Side-by-side comparison of up to 4 countries
  - Default comparison: USA, UK, Germany
  - Year selector (2019-2025)
  - Bar charts: People Affected, Deaths Comparison (Drug Overdose + Alcohol)
  - Horizontal bar chart: Treatment Centers Available
  - Stat cards for each country
- **Data Export API** (admin only):
  - `GET /api/export/countries?format=csv|json&year=YYYY`
  - `GET /api/export/statistics?format=csv|json&state_id=XX`
  - `GET /api/export/treatment-centers?format=csv|json`
- **Draft → Review → Publish Workflow**:
  - `PUT /api/statistics/{id}/status` - Update status (draft/review/published/archived)
  - `GET /api/statistics/pending-review` - Get records awaiting review
  - Audit logging for status changes

#### Files Created/Modified:
- `/app/frontend/src/components/InteractiveGlobalMap.tsx` - NEW: Clickable world map
- `/app/frontend/src/pages/ComparePage.tsx` - NEW: Country comparison tool
- `/app/frontend/src/pages/Index.tsx` - Added map section to homepage
- `/app/frontend/src/pages/AboutUs.tsx` - Updated with CMS integration
- `/app/frontend/src/pages/PrivacyPolicy.tsx` - Updated with CMS integration
- `/app/backend/server.py` - Added export endpoints and status workflow

---

### Phase 11: Multi-Language Support (i18n) ✅ (Jan 24, 2026)
**Implemented full internationalization with 4 languages: English, Spanish, French, Portuguese**

#### New Features:
- **Language Switcher**: Globe icon in header opens dropdown with 4 languages
- **Translations**: EN (English), ES (Español), FR (Français), PT (Português)
- **Persistent Language**: User's language preference saved in localStorage
- **Translated Components**: Header, Footer, TrustIndicators, and key UI elements
- **i18next Integration**: React-i18next with browser language detection

#### Files Created/Modified:
- `/app/frontend/src/i18n.ts` - NEW: i18n configuration
- `/app/frontend/src/components/LanguageSwitcher.tsx` - NEW: Language dropdown component
- `/app/frontend/src/locales/en/translation.json` - English translations
- `/app/frontend/src/locales/es/translation.json` - Spanish translations
- `/app/frontend/src/locales/fr/translation.json` - French translations
- `/app/frontend/src/locales/pt/translation.json` - Portuguese translations
- `/app/frontend/src/components/listing/Header.tsx` - Added LanguageSwitcher
- `/app/frontend/src/components/home/TrustIndicators.tsx` - Added translations
- `/app/frontend/src/components/listing/Footer.tsx` - Added translations
- `/app/frontend/src/App.tsx` - Added i18n import

#### Translated Elements:
- Header: "Get Help Now" → ES: "Obtener Ayuda Ahora", FR: "Obtenir de l'Aide", PT: "Obter Ajuda Agora"
- Stats: "People Affected", "Treatment Centers", "Recovery Rate", "Treatment Admissions"
- Trust Indicators: "Only Verified Facilities", "Personalized Approach"
- Footer: Copyright text, serving countries, global coverage

---

### Phase 10.5: Admin CMS Stability Fix ✅ (Jan 24, 2026)
**Fixed admin login flow and CMS page stability issue**

#### Bug Fixes:
- Verified admin login flow working with credentials
- Confirmed CMS admin page loads without browser crash
- All 6 CMS page tabs functional (About Us, Privacy Policy, Terms, Legal, Accessibility, Affiliate)

---

### Phase 10: 195 Countries + CMS Admin ✅ (Latest - Jan 24, 2026)
**Expanded to full international coverage with 195 countries and CMS admin interface**

#### New Features:
- **195 Countries**: Complete coverage of all UN-recognized countries
- **1,365 Statistics Records**: 195 countries × 7 years (2019-2025)
- **Verified + Estimated Data**: Clear confidence levels (high/medium/estimated)
- **Data Sources**: WHO, UNODC, EMCDDA, regional health authorities
- **Footer SEO Enhancement**: Collapsible country sections by region
- **CMS Admin Interface**: `/admin/cms` for editing legal pages

#### Data by Region:
- Europe: 44 countries
- Asia: 48 countries
- Africa: 54 countries
- North America: 23 countries
- South America: 12 countries
- Oceania: 14 countries

#### Files Created/Modified:
- `/app/backend/country_data_full.py` - Complete 195 country data seeding
- `/app/frontend/src/data/countryConfig.ts` - All 195 countries with slugs
- `/app/frontend/src/components/listing/Footer.tsx` - Collapsible country sections
- `/app/frontend/src/pages/admin/CMSAdmin.tsx` - NEW: CMS page editor
- `/app/frontend/src/pages/Admin.tsx` - Added CMS Pages menu item
- `/app/frontend/src/App.tsx` - Added /admin/cms route

---

### Phase 9: Country Pages & Footer SEO ✅
**Created country statistics pages with same URL structure as US states and added SEO footer links**

#### New Features:
- **Country Statistics Pages**: All 20 countries have dedicated pages at `/{country-slug}-addiction-rehabs`
- **Same URL Pattern**: UK at `/united-kingdom-addiction-rehabs`, Germany at `/germany-addiction-rehabs`, etc.
- **Year Selector**: Dropdown for 2019-2025 data selection
- **Historical Charts**: Line chart (People Affected) and Bar chart (Drug vs Alcohol Deaths)
- **Data Source Citations**: Each country shows source with "View Source" link (e.g., "ONS UK 2024")
- **Treatment Centers Section**: Shows verified centers for each country with "View All" link
- **Footer SEO Enhancement**: "Browse by Country" with 20 countries grouped by region with emoji flags
- **Footer US States**: "Browse by US State" with top 10 states by population

#### URLs Created:
- `/united-kingdom-addiction-rehabs`
- `/germany-addiction-rehabs`
- `/france-addiction-rehabs`
- `/australia-addiction-rehabs`
- `/canada-addiction-rehabs`
- `/thailand-addiction-rehabs`
- `/japan-addiction-rehabs`
- `/india-addiction-rehabs`
- `/brazil-addiction-rehabs`
- `/mexico-addiction-rehabs`
- ... and 10 more countries

#### Files Created/Modified:
- `/app/frontend/src/pages/CountryPage.tsx` - NEW: Country statistics page
- `/app/frontend/src/data/countryConfig.ts` - NEW: Country configuration with slugs
- `/app/frontend/src/components/listing/Footer.tsx` - Updated with Browse by Country section
- `/app/frontend/src/App.tsx` - Added LocationPage helper for routing

---

### Phase 8: International Expansion & Treatment Centers ✅
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
