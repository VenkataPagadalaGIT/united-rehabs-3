# United Rehabs - Product Requirements Document

## Original Problem Statement
Build a global addiction data resource where trust and accuracy are the highest priority. The platform provides comprehensive addiction statistics and recovery resources across 195 countries and 51 US states.

## Core Mission
- **AWARE** - Raise awareness about addiction statistics globally
- **EDUCATE** - Provide accurate, verified data from official sources
- **SUPPORT** - Connect users with recovery resources
- **RECOVER** - Guide users toward recovery paths

## User Personas
1. **Researchers/Journalists** - Need accurate addiction statistics with verified sources
2. **Healthcare Professionals** - Require regional data for treatment planning
3. **Policy Makers** - Need comparative data across regions
4. **Individuals/Families** - Seeking information about addiction in their area

## What's Been Implemented

### Data & Statistics (Completed)
- All major country and US state data verified against official sources (CDC, WHO, SAMHSA)
- Frontend displays exact, non-rounded numbers
- Verification history tracked in database
- Data Methodology page explaining sources and processes

### Search & Navigation (Completed - Feb 14, 2026)
- Search bar repurposed for location search (states/countries)
- Autocomplete with "View Statistics" labels
- Removed irrelevant rehab-specific filters
- Footer links all working (tested 100% pass rate)
- "Coming Soon" labels for unimplemented features

### Security (Completed)
- JWT secret in environment variable
- Rate limiting on auth endpoints (5/min login, 3/min register)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Admin password change functionality

### Compliance (Completed)
- Privacy Policy (GDPR/CCPA compliant)
- Terms of Service
- Cookie Policy with consent banner
- Legal Disclaimer
- Accessibility Statement
- Affiliate Disclosure
- Do Not Sell My Info page

### Admin Features (Completed)
- SERP validation panel (manual trigger + scheduling)
- Statistics management
- Content management
- Security settings

## Technical Architecture

### Frontend (React + TypeScript)
- `/app/frontend/src/components/home/HeroSection.tsx` - Hero with search
- `/app/frontend/src/components/listing/Footer.tsx` - Footer with all links
- `/app/frontend/src/data/mockData.ts` - Footer link configuration

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` - Main server with security headers
- `/app/backend/auth.py` - Authentication with rate limiting

### Key Routes
- `/{state}-addiction-rehabs` - US state statistics pages
- `/{country}-addiction-rehabs` - Country statistics pages
- `/data-methodology` - Data sources explanation
- `/admin/*` - Admin panel routes

## Prioritized Backlog

### P0 - Launch Ready ✅
- [x] Fix all broken footer links
- [x] Update search bar for data focus
- [x] Complete security audit
- [x] Update compliance pages

### P1 - Post-Launch
- [ ] Change default admin password
- [ ] Enable SERP validation scheduling
- [ ] Monitor automated data verification

### P2 - Future Features
- [ ] Implement Insurance pages (currently "Coming Soon")
- [ ] Implement Treatments pages (currently "Coming Soon")
- [ ] Implement Conditions pages (currently "Coming Soon")
- [ ] Monetization (Premium Facility Listings)
- [ ] Geographic expansion to city-level data
- [ ] Admin Draft → Review → Publish workflow

## 3rd Party Integrations
- **DataForSEO** - SERP validation system (credentials in backend/.env)

## Credentials
- Admin: admin@unitedrehabs.com (password should be changed after launch)

## Documents
- `/app/SECURITY_AUDIT.md` - Security audit report
- `/app/memory/REVENUE_MODEL.md` - Monetization strategies
