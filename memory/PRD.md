# United Rehabs - Product Requirements Document

## Original Problem Statement
Build a global addiction data resource website that provides:
- Addiction statistics for 195 countries worldwide
- State-by-state data for the United States
- Treatment center directory (Coming Soon)
- Educational resources and blog content (Coming Soon)
- Crisis hotline resources (988 & SAMHSA)

## Core Features (Implemented)

### Data & Statistics
- Global addiction statistics from WHO, UNODC, SAMHSA, CDC
- 195 country coverage with country-specific pages
- US state-by-state statistics pages
- Data comparison tool

### Legal & Compliance
- GDPR/CCPA compliant privacy policy
- Click-wrap consent modal for legal protection
- Comprehensive Terms of Service
- Legal disclaimer
- Cookie consent banner
- Data methodology documentation

### SEO & Analytics
- Google Analytics integration (G-QXZLSZGM9P)
- robots.txt blocking admin pages
- sitemap.xml for all public pages
- Meta tags and Open Graph support

### Admin Panel
- Secure admin URL: `/you-are-the-admin/login`
- Statistics management
- SERP validation system (DataForSEO)
- Content management
- Data coverage monitoring

## Coming Soon Features
- `/rehab-centers` - Treatment Centers Directory
- `/blog` - Blog & Articles
- `/news` - News content
- `/guide` - Recovery guides

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- **Backend:** FastAPI + Python
- **Database:** MongoDB
- **Analytics:** Google Analytics
- **Validation:** DataForSEO API

## Key Pages
| Page | Status | Route |
|------|--------|-------|
| Home | ✅ Live | `/` |
| Country Stats | ✅ Live | `/:country-addiction-stats` |
| State Stats | ✅ Live | `/:state-addiction-rehabs` |
| Compare Tool | ✅ Live | `/compare` |
| About | ✅ Live | `/about` |
| Contact | ✅ Live | `/contact` |
| Treatment Centers | 🚧 Coming Soon | `/rehab-centers` |
| Blog | 🚧 Coming Soon | `/blog` |
| Admin | ✅ Live | `/you-are-the-admin` |

## Credentials
- **Admin Email:** admin@unitedrehabs.com
- **Admin URL:** /you-are-the-admin/login

## Last Updated
February 14, 2025 - QA fixes for Coming Soon pages and Contact page
