# United Rehabs - Product Requirements Document

## Original Problem Statement
Global addiction data resource website that provides comprehensive addiction statistics and data for 195 countries and all US states. The site needs to be professional, consistent, and deployable to a custom Namecheap domain.

## Core Requirements
- Global addiction statistics from WHO, CDC, SAMHSA, UNODC
- Country and US state-level data pages
- Interactive global map
- Country comparison tool
- Professional, premium typography (Inter font)
- SEO-optimized pages
- Legal compliance (GDPR, CCPA, Privacy Policy, Terms)
- Admin panel for content management

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Fonts**: Inter (Google Fonts)
- **Analytics**: Google Analytics (G-QXZLSZGM9P)
- **3rd Party**: DataForSEO (SERP validation)

## What's Been Implemented
- [x] Homepage with hero, trust indicators, global map, browse sections, FAQ, statistics
- [x] State pages (51 US states) with addiction statistics
- [x] Country pages (195 countries) with detailed data
- [x] Country comparison tool
- [x] Legal pages (Terms, Privacy, Cookie Policy, Accessibility, Legal Disclaimer, DNSMPI, Affiliate Disclosure, Data Methodology)
- [x] About page with CMS integration
- [x] Contact page with form
- [x] Coming Soon pages for /blog and /rehab-centers
- [x] Admin panel with dashboard, statistics, content management, SEO, SERP validation
- [x] Crisis hotline banner, cookie consent, disclaimer consent banners
- [x] Premium typography system (Inter font, consistent hierarchy)
- [x] **Typography fix (Feb 2026)**: Moved heading styles into @layer base, fixed FAQ accordion oversized text
- [x] **Removed "Get Help Now" button (Feb 2026)**: Removed from header and footer since no rehab listings exist yet
- [x] **Deep QA pass (Feb 2026)**: All pages, links, and content verified production-ready
- [x] **State page cleanup (Feb 2026)**: Removed filter dropdowns, 3 tabs (Statistics | Resources | Rehab Listings Coming Soon), no dummy content
- [x] **Year-based SEO URLs (Feb 2026)**: Dedicated URLs per year for all states and countries (e.g., /connecticut-addiction-stats-2025)
- [x] **Internal linking (Feb 2026)**: Year links on state/country pages, cross-links to rehabs and compare pages
- [x] **Sitemap expansion (Feb 2026)**: 823 URLs including year-based variants for all states and countries

## Prioritized Backlog

### P0 - Complete
- [x] Fix font/design inconsistency across entire site

### P1 - Next
- [ ] Deploy to custom Namecheap domain
- [ ] Post-launch monitoring (Google Analytics, Search Console)
- [ ] Enable automated SERP validation

### P2 - Future
- [ ] Monetization (Premium Facility Listings) - see REVENUE_MODEL.md
- [ ] Geographic expansion (city-level data)
- [ ] Admin data workflow (Draft -> Review -> Publish)

## Key Files
- `frontend/src/index.css` - Typography system and color variables
- `frontend/tailwind.config.ts` - Tailwind configuration with Inter font
- `frontend/src/components/ui/accordion.tsx` - Fixed accordion trigger text size
- `frontend/src/App.tsx` - All routes
- `frontend/src/pages/` - All page components
- `frontend/src/components/` - All shared components

## Admin Access
- URL: /you-are-the-admin/login
- Email: admin@unitedrehabs.com
- Password: Admin_password@9164
