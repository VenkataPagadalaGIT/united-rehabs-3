# United Rehabs - Changelog

## January 24, 2026

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
