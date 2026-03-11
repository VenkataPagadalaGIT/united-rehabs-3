#!/usr/bin/env python3
"""
Comprehensive Production vs Local API Comparison
Final verification round - field-by-field comparison of ALL endpoints.
"""

import json
import urllib.request
import urllib.error
import sys
import time
from collections import OrderedDict

PROD = "https://unitedrehabs.com"
LOCAL = "http://localhost:8000"

STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
]

COUNTRIES = [
    "USA","GBR","CAN","AUS","DEU","FRA","BRA","MEX","IND","JPN",
    "ESP","ITA","NLD","ZAF","THA","POL","ARG","KOR","RUS","CHN"
]

passed = 0
failed = 0
errors = 0
mismatches = []

def fetch(base, path):
    url = f"{base}{path}"
    try:
        req = urllib.request.Request(url)
        req.add_header("User-Agent", "UnitedRehabs-Comparator/1.0")
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return {"__error__": f"HTTP {e.code}"}
    except Exception as e:
        return {"__error__": str(e)}

def compare_values(label, prod_val, local_val):
    global passed, failed
    if prod_val == local_val:
        passed += 1
        return True
    else:
        failed += 1
        mismatches.append({
            "endpoint": label,
            "prod": prod_val,
            "local": local_val
        })
        return False

def check(label, prod_val, local_val, show_pass=False):
    ok = compare_values(label, prod_val, local_val)
    if not ok:
        print(f"  ❌ {label}")
        print(f"     PROD:  {str(prod_val)[:200]}")
        print(f"     LOCAL: {str(local_val)[:200]}")
    elif show_pass:
        print(f"  ✅ {label}: {str(prod_val)[:100]}")
    return ok

def section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}")

def deep_compare(label, prod, local, path=""):
    """Recursively compare two JSON structures field by field."""
    global passed, failed, errors
    if isinstance(prod, dict) and isinstance(local, dict):
        all_keys = set(list(prod.keys()) + list(local.keys()))
        for k in sorted(all_keys):
            p = path + "." + k if path else k
            if k not in prod:
                failed += 1
                mismatches.append({"endpoint": f"{label} -> {p}", "prod": "MISSING", "local": local[k]})
                print(f"  ❌ {label} -> {p}: MISSING in prod, local={str(local[k])[:100]}")
            elif k not in local:
                failed += 1
                mismatches.append({"endpoint": f"{label} -> {p}", "prod": prod[k], "local": "MISSING"})
                print(f"  ❌ {label} -> {p}: MISSING in local, prod={str(prod[k])[:100]}")
            else:
                deep_compare(label, prod[k], local[k], p)
    elif isinstance(prod, list) and isinstance(local, list):
        if len(prod) != len(local):
            failed += 1
            mismatches.append({"endpoint": f"{label} -> {path} (list length)", "prod": len(prod), "local": len(local)})
            print(f"  ❌ {label} -> {path}: list length prod={len(prod)} local={len(local)}")
        for i in range(min(len(prod), len(local))):
            deep_compare(label, prod[i], local[i], f"{path}[{i}]")
    else:
        # Leaf comparison - normalize for known dynamic fields
        p_val = prod
        l_val = local
        # Skip dynamic fields
        if any(skip in (path or "") for skip in ["_id", "id", "created_at", "updated_at", "last_updated"]):
            passed += 1
            return
        # For sitemap/robots URLs, normalize base URL
        if isinstance(p_val, str) and PROD in p_val:
            p_val = p_val.replace(PROD, "BASE")
        if isinstance(l_val, str) and LOCAL in l_val:
            l_val = l_val.replace(LOCAL, "BASE")
        if p_val == l_val:
            passed += 1
        else:
            failed += 1
            short_path = path if len(path) < 60 else "..." + path[-57:]
            mismatches.append({"endpoint": f"{label} -> {short_path}", "prod": p_val, "local": l_val})
            print(f"  ❌ {label} -> {short_path}")
            print(f"     PROD:  {str(p_val)[:200]}")
            print(f"     LOCAL: {str(l_val)[:200]}")


# ============================================================================
# 1. ALL 51 STATES
# ============================================================================
section("1. STATE STATISTICS (51 states x 3 fields)")
for st in STATES:
    prod = fetch(PROD, f"/api/statistics?state_id={st}")
    local = fetch(LOCAL, f"/api/statistics?state_id={st}")

    if "__error__" in (prod if isinstance(prod, dict) else {}) or "__error__" in (local if isinstance(local, dict) else {}):
        errors += 1
        print(f"  ⚠️  {st} statistics: ERROR prod={prod} local={local}")
        continue

    # Both should be lists; find year 2025
    p2025 = next((x for x in prod if x.get("year") == 2025), None) if isinstance(prod, list) else None
    l2025 = next((x for x in local if x.get("year") == 2025), None) if isinstance(local, list) else None

    if not p2025 or not l2025:
        errors += 1
        print(f"  ⚠️  {st}: No 2025 data (prod={'yes' if p2025 else 'no'}, local={'yes' if l2025 else 'no'})")
        continue

    all_ok = True
    all_ok &= check(f"{st} overdose_deaths", p2025.get("overdose_deaths"), l2025.get("overdose_deaths"))
    all_ok &= check(f"{st} total_affected", p2025.get("total_affected"), l2025.get("total_affected"))
    all_ok &= check(f"{st} recovery_rate", p2025.get("recovery_rate"), l2025.get("recovery_rate"))

    if all_ok:
        print(f"  ✅ {st}: deaths={p2025.get('overdose_deaths')}, affected={p2025.get('total_affected')}, recovery={p2025.get('recovery_rate')}")

    time.sleep(0.05)  # be gentle

section("1b. STATE SUBSTANCE STATISTICS (51 states)")
for st in STATES:
    prod = fetch(PROD, f"/api/substance-statistics?state_id={st}")
    local = fetch(LOCAL, f"/api/substance-statistics?state_id={st}")

    if "__error__" in (prod if isinstance(prod, dict) else {}) or "__error__" in (local if isinstance(local, dict) else {}):
        errors += 1
        print(f"  ⚠️  {st} substance-stats: ERROR")
        continue

    # Find 2025 with alcohol_binge_drinking_percent
    p2025 = next((x for x in prod if x.get("year") == 2025), None) if isinstance(prod, list) else None
    l2025 = next((x for x in local if x.get("year") == 2025), None) if isinstance(local, list) else None

    if not p2025 or not l2025:
        errors += 1
        print(f"  ⚠️  {st}: No 2025 substance data")
        continue

    pv = p2025.get("alcohol_binge_drinking_percent")
    lv = l2025.get("alcohol_binge_drinking_percent")
    ok = check(f"{st} binge_drinking%", pv, lv)
    if ok:
        print(f"  ✅ {st} binge_drinking%: {pv}")

    time.sleep(0.05)

section("1c. STATE RESOURCES count (51 states)")
for st in STATES:
    prod = fetch(PROD, f"/api/resources?state_id={st}")
    local = fetch(LOCAL, f"/api/resources?state_id={st}")

    pc = len(prod) if isinstance(prod, list) else -1
    lc = len(local) if isinstance(local, list) else -1

    ok = check(f"{st} resources count", pc, lc)
    if ok:
        print(f"  ✅ {st} resources: {pc}")

    time.sleep(0.05)

section("1d. STATE FAQs count (51 states)")
for st in STATES:
    prod = fetch(PROD, f"/api/faqs?state_id={st}")
    local = fetch(LOCAL, f"/api/faqs?state_id={st}")

    pc = len(prod) if isinstance(prod, list) else -1
    lc = len(local) if isinstance(local, list) else -1

    ok = check(f"{st} faqs count", pc, lc)
    if ok:
        print(f"  ✅ {st} faqs: {pc}")

    time.sleep(0.05)

# ============================================================================
# 2. COUNTRIES
# ============================================================================
section("2a. COUNTRY DETAILS (20 countries)")
for cc in COUNTRIES:
    prod = fetch(PROD, f"/api/countries/{cc}")
    local = fetch(LOCAL, f"/api/countries/{cc}")

    if "__error__" in (prod if isinstance(prod, dict) else {}) or "__error__" in (local if isinstance(local, dict) else {}):
        errors += 1
        print(f"  ⚠️  {cc}: ERROR prod={prod.get('__error__','')} local={local.get('__error__','')}")
        continue

    all_ok = True
    all_ok &= check(f"{cc} population", prod.get("population"), local.get("population"))
    all_ok &= check(f"{cc} country_name", prod.get("country_name"), local.get("country_name"))
    all_ok &= check(f"{cc} region", prod.get("region"), local.get("region"))
    all_ok &= check(f"{cc} is_active", prod.get("is_active"), local.get("is_active"))

    # Compare latest_statistics if present
    ps = prod.get("latest_statistics", {})
    ls = local.get("latest_statistics", {})
    if ps and ls:
        all_ok &= check(f"{cc} total_affected", ps.get("total_affected"), ls.get("total_affected"))
        all_ok &= check(f"{cc} drug_overdose_deaths", ps.get("drug_overdose_deaths"), ls.get("drug_overdose_deaths"))

    if all_ok:
        print(f"  ✅ {cc}: pop={prod.get('population')}, region={prod.get('region')}")

    time.sleep(0.05)

section("2b. COUNTRY STATISTICS (20 countries, all years)")
for cc in COUNTRIES:
    prod = fetch(PROD, f"/api/countries/{cc}/statistics")
    local = fetch(LOCAL, f"/api/countries/{cc}/statistics")

    p_stats = prod.get("statistics", []) if isinstance(prod, dict) else []
    l_stats = local.get("statistics", []) if isinstance(local, dict) else []

    ok = check(f"{cc} stats count", len(p_stats), len(l_stats))

    # Compare each year's drug_overdose_deaths
    p_by_year = {s.get("year"): s for s in p_stats}
    l_by_year = {s.get("year"): s for s in l_stats}

    year_ok = True
    for yr in sorted(set(list(p_by_year.keys()) + list(l_by_year.keys()))):
        ps = p_by_year.get(yr, {})
        ls = l_by_year.get(yr, {})
        year_ok &= check(f"{cc} yr{yr} overdose_deaths", ps.get("drug_overdose_deaths"), ls.get("drug_overdose_deaths"))

    if ok and year_ok:
        print(f"  ✅ {cc} statistics: {len(p_stats)} years all match")

    time.sleep(0.05)

section("2c. COUNTRY CENTERS (20 countries)")
for cc in COUNTRIES:
    prod = fetch(PROD, f"/api/countries/{cc}/centers")
    local = fetch(LOCAL, f"/api/countries/{cc}/centers")

    p_centers = prod.get("centers", []) if isinstance(prod, dict) else []
    l_centers = local.get("centers", []) if isinstance(local, dict) else []

    ok = check(f"{cc} centers count", len(p_centers), len(l_centers))

    # Compare center names
    p_names = sorted([c.get("name","") for c in p_centers])
    l_names = sorted([c.get("name","") for c in l_centers])
    names_ok = check(f"{cc} center names", p_names, l_names)

    if ok and names_ok:
        print(f"  ✅ {cc} centers: {len(p_centers)} centers, names match")

    time.sleep(0.05)

# ============================================================================
# 3. ARTICLES
# ============================================================================
section("3. ARTICLES (all 6)")
prod = fetch(PROD, "/api/articles")
local = fetch(LOCAL, "/api/articles")

p_items = prod.get("items", []) if isinstance(prod, dict) else []
l_items = local.get("items", []) if isinstance(local, dict) else []

check("articles total", prod.get("total"), local.get("total"), show_pass=True)
check("articles count", len(p_items), len(l_items), show_pass=True)

# Sort by slug for consistent comparison
p_items.sort(key=lambda x: x.get("slug", ""))
l_items.sort(key=lambda x: x.get("slug", ""))

article_slugs = []
for i in range(min(len(p_items), len(l_items))):
    pa = p_items[i]
    la = l_items[i]
    slug = pa.get("slug", "?")
    article_slugs.append(slug)
    all_ok = True
    all_ok &= check(f"article[{slug}] title", pa.get("title"), la.get("title"))
    all_ok &= check(f"article[{slug}] slug", pa.get("slug"), la.get("slug"))
    all_ok &= check(f"article[{slug}] is_published", pa.get("is_published"), la.get("is_published"))
    all_ok &= check(f"article[{slug}] tags", pa.get("tags"), la.get("tags"))
    # Compare content length (exact content may differ by whitespace)
    pc_len = len(pa.get("content", "")) if pa.get("content") else 0
    lc_len = len(la.get("content", "")) if la.get("content") else 0
    all_ok &= check(f"article[{slug}] content_length", pc_len, lc_len)

    if all_ok:
        print(f"  ✅ article[{slug}]: title={pa.get('title','')[:50]}, published={pa.get('is_published')}, content_len={pc_len}")

# ============================================================================
# 4. PAGE SEO (26 entries)
# ============================================================================
section("4. PAGE SEO (26 entries)")
prod = fetch(PROD, "/api/page-seo")
local = fetch(LOCAL, "/api/page-seo")

if isinstance(prod, list) and isinstance(local, list):
    check("page-seo count", len(prod), len(local), show_pass=True)

    # Sort by page_type+slug
    prod.sort(key=lambda x: f"{x.get('page_type','')}-{x.get('slug','')}")
    local.sort(key=lambda x: f"{x.get('page_type','')}-{x.get('slug','')}")

    for i in range(min(len(prod), len(local))):
        ps = prod[i]
        ls = local[i]
        key = f"{ps.get('page_type','?')}/{ps.get('slug','?')}"
        all_ok = True
        all_ok &= check(f"seo[{key}] page_type", ps.get("page_type"), ls.get("page_type"))
        all_ok &= check(f"seo[{key}] slug", ps.get("slug"), ls.get("slug"))
        all_ok &= check(f"seo[{key}] title", ps.get("title"), ls.get("title"))
        all_ok &= check(f"seo[{key}] description", ps.get("meta_description"), ls.get("meta_description"))

        if all_ok:
            print(f"  ✅ seo[{key}]: {ps.get('title','')[:60]}")

# ============================================================================
# 5. TREATMENT CENTERS
# ============================================================================
section("5. TREATMENT CENTERS (up to 200)")
prod = fetch(PROD, "/api/treatment-centers?limit=200")
local = fetch(LOCAL, "/api/treatment-centers?limit=200")

p_centers = prod.get("centers", []) if isinstance(prod, dict) else []
l_centers = local.get("centers", []) if isinstance(local, dict) else []

check("treatment-centers total", prod.get("total"), local.get("total"), show_pass=True)
check("treatment-centers fetched", len(p_centers), len(l_centers), show_pass=True)

# Sort by name for consistent comparison
p_centers.sort(key=lambda x: x.get("name", ""))
l_centers.sort(key=lambda x: x.get("name", ""))

all_centers_ok = True
for i in range(min(len(p_centers), len(l_centers))):
    pc = p_centers[i]
    lc = l_centers[i]
    name = pc.get("name", "?")[:40]
    ok = True
    ok &= check(f"center[{name}] name", pc.get("name"), lc.get("name"))
    ok &= check(f"center[{name}] state_id", pc.get("state_id"), lc.get("state_id"))
    ok &= check(f"center[{name}] city", pc.get("city"), lc.get("city"))
    ok &= check(f"center[{name}] rating", pc.get("rating"), lc.get("rating"))
    ok &= check(f"center[{name}] treatment_types", pc.get("treatment_types"), lc.get("treatment_types"))

    if not ok:
        all_centers_ok = False

if all_centers_ok:
    print(f"  ✅ All {len(p_centers)} treatment centers match on name, state_id, city, rating, treatment_types")

# ============================================================================
# 6. HOMEPAGE DATA
# ============================================================================
section("6a. HOMEPAGE DATA (deep compare)")
prod = fetch(PROD, "/api/homepage/data")
local = fetch(LOCAL, "/api/homepage/data")

if isinstance(prod, dict) and isinstance(local, dict):
    # National stats
    print("  --- national_stats ---")
    deep_compare("homepage national_stats", prod.get("national_stats", {}), local.get("national_stats", {}))

    # Top states
    print("  --- top_states ---")
    p_ts = prod.get("top_states", [])
    l_ts = local.get("top_states", [])
    check("homepage top_states count", len(p_ts), len(l_ts), show_pass=True)
    for i in range(min(len(p_ts), len(l_ts))):
        for key in ["state_id", "state_name", "total_affected", "overdose_deaths", "total_treatment_centers", "recovery_rate"]:
            check(f"top_states[{i}].{key}", p_ts[i].get(key), l_ts[i].get(key))
    ts_ok = all(p_ts[i].get(k) == l_ts[i].get(k) for i in range(min(len(p_ts), len(l_ts))) for k in ["state_id", "total_affected", "overdose_deaths"])
    if ts_ok:
        print(f"  ✅ All {len(p_ts)} top_states match")

    # Featured centers
    print("  --- featured_centers ---")
    p_fc = prod.get("featured_centers", [])
    l_fc = local.get("featured_centers", [])
    check("homepage featured_centers count", len(p_fc), len(l_fc), show_pass=True)
    p_fc.sort(key=lambda x: x.get("name", ""))
    l_fc.sort(key=lambda x: x.get("name", ""))
    fc_ok = True
    for i in range(min(len(p_fc), len(l_fc))):
        for key in ["name", "city", "state_id", "rating"]:
            fc_ok &= check(f"featured_centers[{i}].{key}", p_fc[i].get(key), l_fc[i].get(key))
    if fc_ok:
        print(f"  ✅ All {len(p_fc)} featured_centers match")

    # FAQs
    print("  --- faqs ---")
    p_faq = prod.get("faqs", [])
    l_faq = local.get("faqs", [])
    check("homepage faqs count", len(p_faq), len(l_faq), show_pass=True)
    faq_ok = True
    for i in range(min(len(p_faq), len(l_faq))):
        faq_ok &= check(f"faq[{i}] question", p_faq[i].get("question"), l_faq[i].get("question"))
        faq_ok &= check(f"faq[{i}] answer", p_faq[i].get("answer"), l_faq[i].get("answer"))
    if faq_ok:
        print(f"  ✅ All {len(p_faq)} FAQs match")

section("6b. HOMEPAGE INTERNATIONAL DATA (deep compare)")
prod = fetch(PROD, "/api/homepage/data/international")
local = fetch(LOCAL, "/api/homepage/data/international")

if isinstance(prod, dict) and isinstance(local, dict):
    print("  --- global_stats ---")
    deep_compare("intl global_stats", prod.get("global_stats", {}), local.get("global_stats", {}))

    print("  --- top_countries ---")
    p_tc = prod.get("top_countries", [])
    l_tc = local.get("top_countries", [])
    check("intl top_countries count", len(p_tc), len(l_tc), show_pass=True)
    for i in range(min(len(p_tc), len(l_tc))):
        for key in ["country_code", "country_name", "total_affected", "treatment_centers", "primary_source"]:
            check(f"top_countries[{i}].{key}", p_tc[i].get(key), l_tc[i].get(key))

    print("  --- regions ---")
    p_reg = prod.get("regions", [])
    l_reg = local.get("regions", [])
    if isinstance(p_reg, list) and isinstance(l_reg, list):
        check("intl regions count", len(p_reg), len(l_reg), show_pass=True)
        deep_compare("intl regions", p_reg, l_reg)

# ============================================================================
# 7. CONFIG & SEO
# ============================================================================
section("7a. SIDEBAR LINKS")
prod = fetch(PROD, "/api/config/sidebar-links")
local = fetch(LOCAL, "/api/config/sidebar-links")
if isinstance(prod, list) and isinstance(local, list):
    check("sidebar-links count", len(prod), len(local), show_pass=True)
    for i in range(min(len(prod), len(local))):
        check(f"sidebar[{i}] label", prod[i].get("label"), local[i].get("label"))
        check(f"sidebar[{i}] url", prod[i].get("url"), local[i].get("url"))
    print(f"  ✅ Sidebar links fully compared")

section("7b. SEO GLOBAL")
prod = fetch(PROD, "/api/seo/global")
local = fetch(LOCAL, "/api/seo/global")
if isinstance(prod, dict) and isinstance(local, dict):
    for key in ["site_name", "default_title_suffix", "default_meta_description", "default_robots"]:
        check(f"seo_global.{key}", prod.get(key), local.get(key), show_pass=True)

section("7c. ROBOTS.TXT")
# robots.txt is text, not JSON
try:
    with urllib.request.urlopen(f"{PROD}/api/seo/robots.txt", timeout=10) as r:
        prod_robots = r.read().decode()
    with urllib.request.urlopen(f"{LOCAL}/api/seo/robots.txt", timeout=10) as r:
        local_robots = r.read().decode()
    # Normalize base URLs
    prod_norm = prod_robots.replace(PROD, "BASE").replace("https://unitedrehabs.com", "BASE")
    local_norm = local_robots.replace(LOCAL, "BASE").replace("http://localhost:8000", "BASE")
    check("robots.txt (normalized)", prod_norm.strip(), local_norm.strip(), show_pass=True)
except Exception as e:
    errors += 1
    print(f"  ⚠️  robots.txt error: {e}")

section("7d. SITEMAP.XML URL COUNT")
try:
    with urllib.request.urlopen(f"{PROD}/api/seo/sitemap.xml", timeout=15) as r:
        prod_sitemap = r.read().decode()
    with urllib.request.urlopen(f"{LOCAL}/api/seo/sitemap.xml", timeout=15) as r:
        local_sitemap = r.read().decode()
    p_urls = prod_sitemap.count("<loc>")
    l_urls = local_sitemap.count("<loc>")
    check("sitemap URL count", p_urls, l_urls, show_pass=True)
    # Normalize and compare
    prod_norm = prod_sitemap.replace(PROD, "BASE").replace("https://unitedrehabs.com", "BASE")
    local_norm = local_sitemap.replace(LOCAL, "BASE").replace("http://localhost:8000", "BASE")
    check("sitemap content (normalized)", prod_norm.strip(), local_norm.strip())
except Exception as e:
    errors += 1
    print(f"  ⚠️  sitemap error: {e}")

# ============================================================================
# 8. EDGE CASES
# ============================================================================
section("8a. EDGE: DC (District of Columbia)")
prod = fetch(PROD, "/api/statistics?state_id=DC")
local = fetch(LOCAL, "/api/statistics?state_id=DC")
if isinstance(prod, list) and isinstance(local, list):
    p2025 = next((x for x in prod if x.get("year") == 2025), None)
    l2025 = next((x for x in local if x.get("year") == 2025), None)
    if p2025 and l2025:
        for key in ["overdose_deaths", "total_affected", "recovery_rate", "opioid_deaths", "drug_abuse_rate"]:
            check(f"DC {key}", p2025.get(key), l2025.get(key), show_pass=True)

section("8b. EDGE: NZL (New Zealand)")
prod = fetch(PROD, "/api/countries/NZL")
local = fetch(LOCAL, "/api/countries/NZL")
if isinstance(prod, dict) and isinstance(local, dict):
    for key in ["country_name", "population", "region", "is_active"]:
        check(f"NZL {key}", prod.get(key), local.get(key), show_pass=True)

section("8c. EDGE: Article full content by slug")
for slug in article_slugs:
    prod = fetch(PROD, f"/api/articles/by-slug/news/{slug}")
    local = fetch(LOCAL, f"/api/articles/by-slug/news/{slug}")

    if "__error__" in (prod if isinstance(prod, dict) else {}) or "__error__" in (local if isinstance(local, dict) else {}):
        # Try without news/ prefix
        prod = fetch(PROD, f"/api/articles/by-slug/{slug}")
        local = fetch(LOCAL, f"/api/articles/by-slug/{slug}")

    if isinstance(prod, dict) and isinstance(local, dict) and "__error__" not in prod and "__error__" not in local:
        all_ok = True
        all_ok &= check(f"article-full[{slug}] title", prod.get("title"), local.get("title"))
        pc = prod.get("content", "")
        lc = local.get("content", "")
        all_ok &= check(f"article-full[{slug}] content_len", len(pc) if pc else 0, len(lc) if lc else 0)
        all_ok &= check(f"article-full[{slug}] content_match", pc, lc)
        if all_ok:
            print(f"  ✅ article-full[{slug}]: full content matches ({len(pc)} chars)")
    else:
        errors += 1
        pe = prod.get("__error__", "") if isinstance(prod, dict) else ""
        le = local.get("__error__", "") if isinstance(local, dict) else ""
        print(f"  ⚠️  article-full[{slug}]: error prod={pe} local={le}")
    time.sleep(0.05)

section("8d. EDGE: Treatment center search")
prod = fetch(PROD, "/api/treatment-centers/search?q=detox")
local = fetch(LOCAL, "/api/treatment-centers/search?q=detox")

p_total = prod.get("total", -1) if isinstance(prod, dict) else -1
l_total = local.get("total", -1) if isinstance(local, dict) else -1
check("search 'detox' total", p_total, l_total, show_pass=True)

p_centers = prod.get("centers", []) if isinstance(prod, dict) else []
l_centers = local.get("centers", []) if isinstance(local, dict) else []
check("search 'detox' returned", len(p_centers), len(l_centers), show_pass=True)

# Compare center names
p_names = sorted([c.get("name","") for c in p_centers])
l_names = sorted([c.get("name","") for c in l_centers])
check("search 'detox' names", p_names, l_names, show_pass=True)

section("8e. EDGE: Export endpoints")
prod = fetch(PROD, "/api/export/countries")
local = fetch(LOCAL, "/api/export/countries")
check("export/countries",
      prod.get("__error__", "ok") if isinstance(prod, dict) else "ok",
      local.get("__error__", "ok") if isinstance(local, dict) else "ok",
      show_pass=True)

prod = fetch(PROD, "/api/export/statistics")
local = fetch(LOCAL, "/api/export/statistics")
check("export/statistics",
      prod.get("__error__", "ok") if isinstance(prod, dict) else "ok",
      local.get("__error__", "ok") if isinstance(local, dict) else "ok",
      show_pass=True)

# ============================================================================
# FINAL REPORT
# ============================================================================
section("FINAL REPORT")
total = passed + failed
print(f"  Total checks:  {total}")
print(f"  ✅ Passed:     {passed}")
print(f"  ❌ Failed:     {failed}")
print(f"  ⚠️  Errors:    {errors}")
print(f"  Pass rate:     {(passed/total*100) if total else 0:.1f}%")

if mismatches:
    print(f"\n  === MISMATCH DETAILS ({len(mismatches)} total) ===")
    for m in mismatches[:50]:  # Show first 50
        print(f"  - {m['endpoint']}")
        print(f"    PROD:  {str(m['prod'])[:150]}")
        print(f"    LOCAL: {str(m['local'])[:150]}")
    if len(mismatches) > 50:
        print(f"  ... and {len(mismatches) - 50} more mismatches")
else:
    print("\n  🎉 PERFECT MATCH — Production and Local are identical!")

print()
