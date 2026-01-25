# United Rehabs - Product Requirements Document

## ✅ DATA ACCURACY FIXED (Jan 25, 2026)

### Critical Fix Applied
- **Issue**: Frontend was showing rounded numbers (e.g., "4K" instead of "4,039")
- **Issue**: Canada 2019 showed 6,375 deaths instead of actual 4,039
- **Fix**: Now showing **EXACT numbers** from official government sources
- **Verified**: All key countries match Google SERP results exactly

### Verified Against Google SERP
| Country | Year | Our Data | Google/Official | Status |
|---------|------|----------|-----------------|--------|
| USA | 2022 | 107,941 | 107,941 (CDC) | ✅ EXACT |
| USA | 2021 | 106,699 | 106,699 (CDC) | ✅ EXACT |
| USA | 2020 | 91,799 | 91,799 (CDC) | ✅ EXACT |
| USA | 2019 | 70,630 | 70,630 (CDC) | ✅ EXACT |
| Canada | 2022 | 7,525 | 7,525 (Health Canada) | ✅ EXACT |
| Canada | 2021 | 7,993 | 7,993 (Health Canada) | ✅ EXACT |
| Canada | 2020 | 6,412 | 6,412 (Statistics Canada) | ✅ EXACT |
| Canada | 2019 | 4,039 | 4,039 (Statistics Canada) | ✅ EXACT |
| UK | 2022 | 4,907 | 4,907 (ONS) | ✅ EXACT |
| UK | 2021 | 4,859 | 4,859 (ONS) | ✅ EXACT |
| Australia | 2022 | 1,874 | 1,874 (ABS) | ✅ EXACT |
| Germany | 2022 | 1,990 | 1,990 (BKA) | ✅ EXACT |

### Changes Made
1. **Frontend**: Removed K/M rounding - now shows exact numbers with commas
2. **Database**: Updated with EXACT official figures from:
   - CDC NCHS (USA)
   - Health Canada / Statistics Canada (Canada)
   - ONS (UK)
   - ABS (Australia)
   - BKA (Germany)
3. **USA Page**: Now uses CDC national figures instead of state aggregation

### Official Data Sources
| Country | Source | URL |
|---------|--------|-----|
| USA | CDC NCHS | https://www.cdc.gov/nchs/hus/topics/drug-overdose-deaths.htm |
| Canada | Health Canada | https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/ |
| UK | ONS | https://www.ons.gov.uk/.../deathsrelatedtodrugpoisoning |
| Australia | ABS | https://www.abs.gov.au/statistics/health/causes-death |
| Germany | BKA | https://www.bka.de/EN/OurTasks/AreasOfCrime/DrugRelatedCrime |

---

## Files Modified
- `/app/frontend/src/pages/EnhancedCountryPage.tsx` - Exact numbers, CDC national data for USA
- `/app/frontend/src/pages/CountryPage.tsx` - Exact numbers
- `/app/frontend/src/pages/ComparePage.tsx` - Exact numbers
- `/app/frontend/src/components/listing/tabs/StatisticsTab.tsx` - Exact numbers
- `/app/frontend/src/components/home/TrustIndicators.tsx` - Exact numbers
- `/app/backend/exact_verified_data.py` - Official source data
- `/app/backend/serp_crosscheck_validator.py` - Validation system

## Test Credentials
- **Admin Email**: admin@unitedrehabs.com
- **Admin Password**: admin_password

## Verification Commands
```bash
# Verify database accuracy
cd /app/backend && python3 exact_verified_data.py

# Check specific country
curl https://truthful-stats.preview.emergentagent.com/api/countries/USA
curl https://truthful-stats.preview.emergentagent.com/api/countries/CAN
```

## Google Spot-Check Queries
Search these in Google to verify our data:
- "drug overdose deaths united states 2022" → Should show ~107,941
- "drug overdose deaths canada 2019" → Should show ~4,039
- "drug poisoning deaths england wales 2022" → Should show ~4,907
