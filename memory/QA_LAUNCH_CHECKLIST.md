# United Rehabs - QA & Launch Checklist
## Target Launch Date: January 31, 2026

---

## 🔍 QA CHECKLIST

### 404 & Broken Links Check

#### State Pages (51 pages)
- [ ] Alabama `/alabama-addiction-rehabs`
- [ ] Alaska `/alaska-addiction-rehabs`
- [ ] Arizona `/arizona-addiction-rehabs`
- [ ] Arkansas `/arkansas-addiction-rehabs`
- [ ] California `/california-addiction-rehabs`
- [ ] Colorado `/colorado-addiction-rehabs`
- [ ] Connecticut `/connecticut-addiction-rehabs`
- [ ] Delaware `/delaware-addiction-rehabs`
- [ ] Florida `/florida-addiction-rehabs`
- [ ] Georgia `/georgia-addiction-rehabs` ✅ (Fixed - routes to US state)
- [ ] Hawaii `/hawaii-addiction-rehabs`
- [ ] Idaho `/idaho-addiction-rehabs`
- [ ] Illinois `/illinois-addiction-rehabs`
- [ ] Indiana `/indiana-addiction-rehabs`
- [ ] Iowa `/iowa-addiction-rehabs`
- [ ] Kansas `/kansas-addiction-rehabs`
- [ ] Kentucky `/kentucky-addiction-rehabs`
- [ ] Louisiana `/louisiana-addiction-rehabs`
- [ ] Maine `/maine-addiction-rehabs`
- [ ] Maryland `/maryland-addiction-rehabs`
- [ ] Massachusetts `/massachusetts-addiction-rehabs`
- [ ] Michigan `/michigan-addiction-rehabs`
- [ ] Minnesota `/minnesota-addiction-rehabs`
- [ ] Mississippi `/mississippi-addiction-rehabs`
- [ ] Missouri `/missouri-addiction-rehabs`
- [ ] Montana `/montana-addiction-rehabs`
- [ ] Nebraska `/nebraska-addiction-rehabs`
- [ ] Nevada `/nevada-addiction-rehabs`
- [ ] New Hampshire `/new-hampshire-addiction-rehabs`
- [ ] New Jersey `/new-jersey-addiction-rehabs`
- [ ] New Mexico `/new-mexico-addiction-rehabs`
- [ ] New York `/new-york-addiction-rehabs`
- [ ] North Carolina `/north-carolina-addiction-rehabs`
- [ ] North Dakota `/north-dakota-addiction-rehabs`
- [ ] Ohio `/ohio-addiction-rehabs`
- [ ] Oklahoma `/oklahoma-addiction-rehabs`
- [ ] Oregon `/oregon-addiction-rehabs`
- [ ] Pennsylvania `/pennsylvania-addiction-rehabs`
- [ ] Rhode Island `/rhode-island-addiction-rehabs`
- [ ] South Carolina `/south-carolina-addiction-rehabs`
- [ ] South Dakota `/south-dakota-addiction-rehabs`
- [ ] Tennessee `/tennessee-addiction-rehabs`
- [ ] Texas `/texas-addiction-rehabs`
- [ ] Utah `/utah-addiction-rehabs`
- [ ] Vermont `/vermont-addiction-rehabs`
- [ ] Virginia `/virginia-addiction-rehabs`
- [ ] Washington `/washington-addiction-rehabs`
- [ ] West Virginia `/west-virginia-addiction-rehabs`
- [ ] Wisconsin `/wisconsin-addiction-rehabs`
- [ ] Wyoming `/wyoming-addiction-rehabs`
- [ ] Washington DC `/washington-dc-addiction-rehabs`

#### Key Country Pages (Top 20 - spot check)
- [ ] USA `/united-states-addiction-rehabs`
- [ ] UK `/united-kingdom-addiction-rehabs`
- [ ] Canada `/canada-addiction-rehabs`
- [ ] Australia `/australia-addiction-rehabs`
- [ ] Germany `/germany-addiction-rehabs`
- [ ] France `/france-addiction-rehabs`
- [ ] India `/india-addiction-rehabs`
- [ ] Brazil `/brazil-addiction-rehabs`
- [ ] Mexico `/mexico-addiction-rehabs`
- [ ] Japan `/japan-addiction-rehabs`
- [ ] South Africa `/south-africa-addiction-rehabs`
- [ ] Nigeria `/nigeria-addiction-rehabs`
- [ ] Kenya `/kenya-addiction-rehabs`
- [ ] Spain `/spain-addiction-rehabs`
- [ ] Italy `/italy-addiction-rehabs`
- [ ] Netherlands `/netherlands-addiction-rehabs`
- [ ] Sweden `/sweden-addiction-rehabs`
- [ ] Thailand `/thailand-addiction-rehabs`
- [ ] Philippines `/philippines-addiction-rehabs`
- [ ] Georgia (Country) `/georgia-country-addiction-rehabs` ✅ (New slug)

#### Core Pages
- [ ] Homepage `/`
- [ ] Treatment Centers `/rehab-centers`
- [ ] Compare Tool `/compare`
- [ ] About `/about`
- [ ] Contact `/contact`
- [ ] Privacy Policy `/privacy-policy`
- [ ] Terms of Service `/terms-of-service`
- [ ] Legal Disclaimer `/legal-disclaimer`

#### Admin Pages (with login)
- [ ] Admin Login `/admin/login`
- [ ] Admin Dashboard `/admin`
- [ ] Statistics `/admin/statistics`
- [ ] CMS `/admin/cms`
- [ ] SEO Manager `/admin/seo-manager`
- [ ] Content Generator `/admin/content-generator`

---

### Functionality Testing

#### Homepage
- [ ] Hero section loads correctly
- [ ] "AWARE • EDUCATE • SUPPORT • RECOVER" displays
- [ ] Statistics section shows USA data with heading
- [ ] Interactive map loads and is clickable
- [ ] Language switcher works (EN/ES/FR/PT)
- [ ] Footer loads with all country links
- [ ] Mobile responsive

#### State Pages
- [ ] Data loads from API
- [ ] Charts render correctly
- [ ] Year selector works
- [ ] Treatment centers section displays
- [ ] Sources cited

#### Country Pages
- [ ] Data loads from API
- [ ] Charts render (Area, Line, Bar, Pie)
- [ ] USA shows aggregated 51-state data
- [ ] Demographics section (USA)
- [ ] Substance statistics (USA)
- [ ] Compare link works

#### Interactive Features
- [ ] Global map - clicking navigates to country
- [ ] Compare tool - add/remove countries
- [ ] Compare tool - charts render
- [ ] Search on treatment centers page
- [ ] Language switching persists

#### Admin Functions
- [ ] Login works
- [ ] Dashboard loads
- [ ] CMS pages editable
- [ ] SEO Manager functional
- [ ] Data export works

---

### SEO Checklist

#### Technical SEO
- [ ] Sitemap accessible `/api/seo/sitemap.xml`
- [ ] Robots.txt accessible `/api/seo/robots.txt`
- [ ] All pages have unique titles
- [ ] All pages have meta descriptions
- [ ] Canonical URLs set correctly
- [ ] No duplicate content issues

#### On-Page SEO
- [ ] H1 tags on all pages
- [ ] Image alt texts
- [ ] Internal linking working
- [ ] External links open in new tab
- [ ] Schema markup (if added)

#### Performance
- [ ] Lighthouse score > 80
- [ ] Images optimized
- [ ] No render-blocking resources
- [ ] Fast Time to First Byte

---

### Mobile Testing
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad/Tablet
- [ ] Responsive breakpoints work

---

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

### Security Checklist
- [ ] HTTPS working (after domain setup)
- [ ] Admin password changed from default
- [ ] No sensitive data exposed in console
- [ ] API endpoints protected appropriately

---

## 📅 LAUNCH TIMELINE

### Jan 25-27 (Days 1-3): QA Phase
- Run through all 404 checks
- Test all functionality
- Fix any bugs found
- Document issues

### Jan 28-29 (Days 4-5): Final Fixes
- Address all QA issues
- Final content review
- Performance optimization
- Backup everything

### Jan 30 (Day 6): Pre-Launch
- Deploy to production
- Connect custom domain
- SSL verification
- Final smoke test

### Jan 31 (Day 7): LAUNCH DAY 🚀
- DNS propagation complete
- Monitor for issues
- Announce launch
- Celebrate!

---

## 🔗 IMPORTANT URLS

| Purpose | URL |
|---------|-----|
| Preview Site | https://data-qa-pass.preview.emergentagent.com |
| Sitemap | /api/seo/sitemap.xml |
| Robots | /api/seo/robots.txt |
| Health Check | /api/health |

---

## 📞 LAUNCH DAY CONTACTS

- Domain Provider: [Your registrar]
- Emergent Support: Platform support
- Your backup: [Contact info]

---

## ✅ POST-LAUNCH

### Day 1 After Launch
- [ ] Submit sitemap to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Monitor for 404 errors
- [ ] Check server logs

### Week 1 After Launch
- [ ] Set up Google Analytics 4
- [ ] Monitor Core Web Vitals
- [ ] Check indexing status
- [ ] Fix any reported issues

---

*Document created: January 24, 2026*
*Target launch: January 31, 2026*

**Let's save lives. 🚀**
