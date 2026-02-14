# United Rehabs - Roadmap

## Current Status: Phase 7 Complete ✅

---

## P0 - Critical (None)
All critical features implemented.

---

## P1 - High Priority

### Connect Homepage to Backend
- [ ] Update `/app/frontend/src/pages/Index.tsx` to fetch dynamic content
- [ ] Add featured centers from database
- [ ] Add testimonials from database
- [ ] Add statistics summary from database

### Add More States
- [ ] Use AI pipeline (`POST /api/pipeline/run`) to populate Texas data
- [ ] Use AI pipeline to populate New York data
- [ ] Use AI pipeline to populate Arizona data
- [ ] Verify all data appears correctly on state pages

### Error Boundaries
- [ ] Add error boundaries for public pages
- [ ] Implement fallback UI for API failures
- [ ] Add retry mechanisms for failed requests

---

## P2 - Medium Priority

### Data Review Workflow
- [ ] Add `status` field to data models (draft, review, published)
- [ ] Create review queue in admin panel
- [ ] Add approval workflow for data entries
- [ ] Implement data versioning

### Data Export
- [ ] Add CSV export endpoint
- [ ] Add JSON export endpoint
- [ ] Add Excel export option
- [ ] Implement filtered exports

### Rehab Center Management
- [ ] Create treatment_centers collection
- [ ] Build admin CRUD pages for centers
- [ ] Add center search and filtering
- [ ] Implement center profiles

---

## P3 - Nice to Have

### Analytics
- [ ] Add page view tracking
- [ ] Implement user analytics
- [ ] Create analytics dashboard
- [ ] Add conversion tracking

### Performance
- [ ] Implement caching layer (Redis)
- [ ] Add CDN for static assets
- [ ] Optimize database queries
- [ ] Add lazy loading for charts

### Internationalization
- [ ] Add i18n framework
- [ ] Translate core content
- [ ] Add language selector

---

## Technical Debt

### Code Quality
- [ ] Add comprehensive test coverage
- [ ] Implement E2E tests with Playwright
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Clean up unused components

### Infrastructure
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring (Sentry)
- [ ] Set up log aggregation
- [ ] Add health check endpoints

---

## Recovery Information

### Key Files for Recovery
```
/app/backend/server.py          - Main API server
/app/backend/models.py          - Data models
/app/backend/auth.py            - Authentication
/app/frontend/src/lib/api.ts    - API client
/app/frontend/src/components/listing/tabs/StatisticsTab.tsx - Main statistics component
/app/frontend/vite.config.ts    - Vite configuration (IMPORTANT: has env var exposure)
```

### Database Collections
- `users` - Admin users
- `state_addiction_statistics` - Statistics by state and year
- `substance_statistics` - Substance-specific stats by state and year
- `free_resources` - Treatment resources
- `faqs` - FAQs by state
- `articles` - Blog posts
- `page_seo` - SEO metadata
- `page_content` - Dynamic content

### Admin Credentials
- Email: `admin@unitedrehabs.com`
- Password: `admin_password`

### API Base URL
- `https://data-qa-pass.preview.emergentagent.com/api`

### Key Environment Variables
```
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=united_rehabs
EMERGENT_LLM_KEY=<key>

# Frontend (.env)
REACT_APP_BACKEND_URL=https://data-qa-pass.preview.emergentagent.com
```
