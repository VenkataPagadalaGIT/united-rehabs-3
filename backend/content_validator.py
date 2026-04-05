"""
CONTENT STANDARDS & VALIDATION ENGINE
Validates all content before it reaches the database.
Call POST /api/content/validate with any article/guide JSON to check.
"""
import re
import requests
from typing import Dict, List, Tuple

# ============================================
# CONTENT RULES - Single source of truth
# ============================================
RULES = {
    "news": {
        "min_content_chars": 12000,
        "min_words": 1500,
        "min_h2_headings": 4,
        "max_paragraph_chars": 500,
        "required_sections": ["Key Takeaways", "Sources"],
        "required_meta_fields": ["title", "slug", "excerpt", "meta_title", "meta_description", "meta_keywords", "tags", "featured_image_url"],
        "title_max_chars": 60,
        "meta_desc_max_chars": 155,
        "min_faq_items": 2,
        "must_have_youtube": True,
        "must_have_image": True,
        "no_em_dashes": True,
        "no_ai_patterns": True,
        "max_internal_link_per_name": 1,
        "no_local_uploads": True,
        "image_domains": ["images.unsplash.com", "upload.wikimedia.org", "pubchem.ncbi.nlm.nih.gov"],
    },
    "drug_guide": {
        "min_content_chars": 18000,
        "min_words": 2500,
        "min_h2_headings": 6,
        "max_paragraph_chars": 500,
        "required_sections": ["Short-Term Effects", "Long-Term Effects", "Treatment", "Sources"],
        "required_meta_fields": ["name", "slug", "category", "excerpt", "meta_title", "meta_description", "key_takeaways", "faq_items"],
        "title_max_chars": 60,
        "meta_desc_max_chars": 155,
        "min_faq_items": 3,
        "min_key_takeaways": 4,
        "must_have_youtube": True,
        "must_have_image": True,
        "no_em_dashes": True,
        "no_ai_patterns": True,
        "valid_categories": ["opioids", "stimulants", "depressants", "hallucinogens", "cannabis", "synthetic-drugs", "prescription-drugs", "club-drugs", "inhalants", "alcohol", "nicotine", "treatment-medications"],
        "image_domains": ["images.unsplash.com", "upload.wikimedia.org", "pubchem.ncbi.nlm.nih.gov"],
    },
    "drug_laws": {
        "required_meta_fields": ["state_id", "state_name", "status", "key_takeaways", "overview", "penalty_table", "sources"],
        "min_key_takeaways": 4,
        "min_penalties": 3,
        "min_sources": 2,
    }
}

AI_PATTERNS = [
    "in conclusion", "let's dive in", "it's worth noting", "it is important to note",
    "in summary", "to summarize", "as we've seen", "moving forward",
    "without further ado", "at the end of the day", "needless to say",
    "it goes without saying", "last but not least", "all in all",
]

def validate_content(data: Dict, content_type: str) -> Dict:
    """Validate content against rules. Returns {passed, score, issues, warnings}"""
    rules = RULES.get(content_type, {})
    issues: List[str] = []
    warnings: List[str] = []
    
    content = data.get("content", "")
    title = data.get("title") or data.get("name") or data.get("meta_title", "")
    
    # --- REQUIRED FIELDS ---
    for field in rules.get("required_meta_fields", []):
        val = data.get(field)
        if not val or (isinstance(val, str) and len(val.strip()) < 2):
            issues.append(f"MISSING: '{field}' is required")
        elif isinstance(val, list) and len(val) == 0:
            issues.append(f"EMPTY: '{field}' must have at least 1 item")
    
    # --- TITLE ---
    max_title = rules.get("title_max_chars", 60)
    if title and len(title) > max_title:
        issues.append(f"TITLE: {len(title)} chars (max {max_title})")
    
    # --- META DESCRIPTION ---
    meta_desc = data.get("meta_description") or data.get("excerpt", "")
    max_desc = rules.get("meta_desc_max_chars", 155)
    if meta_desc and len(meta_desc) > max_desc:
        warnings.append(f"META_DESC: {len(meta_desc)} chars (max {max_desc})")
    if not meta_desc or len(meta_desc) < 50:
        issues.append(f"META_DESC: Too short or missing ({len(meta_desc)} chars, min 50)")
    
    # --- SLUG ---
    slug = data.get("slug", "")
    if slug:
        if re.search(r'\d{4}$', slug):
            warnings.append(f"SLUG: Ends with year '{slug}' - avoid years in slugs")
        if not re.match(r'^[a-z0-9-]+$', slug):
            issues.append(f"SLUG: Invalid characters in '{slug}' - use lowercase, numbers, hyphens only")
    
    # --- CONTENT LENGTH ---
    if content:
        plain_text = re.sub(r'<[^>]+>', ' ', content)
        plain_text = re.sub(r'\s+', ' ', plain_text).strip()
        word_count = len(plain_text.split())
        
        min_chars = rules.get("min_content_chars", 0)
        if len(content) < min_chars:
            issues.append(f"CONTENT: {len(content)} chars (min {min_chars})")
        
        min_words = rules.get("min_words", 0)
        if word_count < min_words:
            issues.append(f"WORDS: {word_count} words (min {min_words})")
        
        # H2 headings
        h2_count = len(re.findall(r'<h2', content, re.IGNORECASE))
        min_h2 = rules.get("min_h2_headings", 0)
        if h2_count < min_h2:
            issues.append(f"HEADINGS: {h2_count} H2 tags (min {min_h2})")
        
        # Long paragraphs
        max_p = rules.get("max_paragraph_chars", 0)
        if max_p:
            paras = re.findall(r'<p>(.*?)</p>', content, re.DOTALL)
            long_paras = [p for p in paras if len(re.sub(r'<[^>]+>', '', p)) > max_p]
            if long_paras:
                warnings.append(f"PARAGRAPHS: {len(long_paras)} paragraphs exceed {max_p} chars - break them up")
        
        # Required sections
        for section in rules.get("required_sections", []):
            if section.lower() not in content.lower():
                issues.append(f"SECTION: Missing '{section}' section")
        
        # Em dashes
        if rules.get("no_em_dashes") and ("\u2014" in content or "&mdash;" in content):
            issues.append("EM_DASH: Content contains em dashes - use hyphens (-)")
        
        # AI patterns
        if rules.get("no_ai_patterns"):
            content_lower = content.lower()
            found_patterns = [p for p in AI_PATTERNS if p in content_lower]
            if found_patterns:
                issues.append(f"AI_PATTERN: Contains AI writing patterns: {', '.join(found_patterns[:3])}")
        
        # YouTube video
        has_video = bool(re.search(r'youtube\.com/embed/[a-zA-Z0-9_-]+', content))
        if rules.get("must_have_youtube") and not has_video:
            issues.append("VIDEO: No YouTube video embedded in content")
        
        # Duplicate internal links
        if rules.get("max_internal_link_per_name"):
            link_hrefs = re.findall(r'href="(/[^"]*)"', content)
            seen = {}
            for href in link_hrefs:
                seen[href] = seen.get(href, 0) + 1
            dupes = {k: v for k, v in seen.items() if v > 1}
            if dupes:
                issues.append(f"LINKS: Duplicate internal links: {list(dupes.keys())[:3]}")
    
    # --- IMAGE ---
    img = data.get("featured_image_url", "")
    if rules.get("must_have_image"):
        if not img:
            issues.append("IMAGE: Missing featured_image_url")
        elif rules.get("no_local_uploads") and "/api/uploads/" in img:
            issues.append("IMAGE: Uses /api/uploads/ - won't work on production. Use Unsplash URL")
        elif rules.get("image_domains"):
            valid = any(domain in img for domain in rules["image_domains"])
            if not valid:
                warnings.append(f"IMAGE: Not from approved domain. Use: {', '.join(rules['image_domains'])}")
    
    # --- FAQ ---
    faq_items = data.get("faq_items", [])
    min_faq = rules.get("min_faq_items", 0)
    if min_faq and len(faq_items) < min_faq:
        issues.append(f"FAQ: {len(faq_items)} items (min {min_faq})")
    
    # --- KEY TAKEAWAYS ---
    takeaways = data.get("key_takeaways", [])
    min_kt = rules.get("min_key_takeaways", 0)
    if min_kt and len(takeaways) < min_kt:
        issues.append(f"KEY_TAKEAWAYS: {len(takeaways)} items (min {min_kt})")
    
    # --- CATEGORY (drug guides) ---
    valid_cats = rules.get("valid_categories", [])
    if valid_cats and data.get("category") and data["category"] not in valid_cats:
        issues.append(f"CATEGORY: '{data['category']}' not valid. Use: {', '.join(valid_cats)}")
    
    # --- TAGS ---
    tags = data.get("tags", [])
    if content_type == "news" and len(tags) < 2:
        warnings.append(f"TAGS: Only {len(tags)} tags (recommend 3-6)")
    
    # Score
    score = max(0, 100 - len(issues) * 15 - len(warnings) * 5)
    
    return {
        "passed": len(issues) == 0,
        "score": score,
        "issues": issues,
        "warnings": warnings,
        "stats": {
            "content_chars": len(content),
            "word_count": len(re.sub(r'<[^>]+>', ' ', content).split()) if content else 0,
            "h2_count": len(re.findall(r'<h2', content, re.IGNORECASE)) if content else 0,
            "has_video": bool(re.search(r'youtube\.com/embed/', content)) if content else False,
            "has_image": bool(img),
            "faq_count": len(faq_items),
            "tag_count": len(tags),
        }
    }


def get_rules(content_type: str) -> Dict:
    """Return the rules for a content type"""
    return RULES.get(content_type, {})
