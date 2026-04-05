import ast
#!/usr/bin/env python3
"""
QA & Auto-Fix Tool for State Drug Law Pages
=============================================
Scans all state_drug_laws documents in MongoDB for formatting issues,
raw HTML leaking, malformed content, and auto-fixes what it can.

Usage:
  python scripts/qa_drug_law_pages.py              # Audit only (dry run)
  python scripts/qa_drug_law_pages.py --fix        # Audit + auto-fix
  python scripts/qa_drug_law_pages.py --state CA   # Single state
  python scripts/qa_drug_law_pages.py --counties   # Also check county data
"""

import asyncio
import os
import re
import sys
import argparse
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# ── Fields to audit ──────────────────────────────────────────────────
HTML_FIELDS = [
    "overview", "possession_penalties", "dui_dwi_laws",
    "marijuana_details", "good_samaritan_law", "naloxone_access",
    "drug_courts", "mandatory_minimums", "treatment_alternatives",
    "recent_changes",
]

LIST_FIELDS = [
    ("key_takeaways", 3),
    ("drug_schedules", 3),
    ("penalty_table", 5),
    ("faqs", 4),
    ("sources", 5),
]

STRING_FIELDS = [
    ("state_name", 2),
    ("state_id", 2),
    ("overview", 100),
    ("marijuana_status", 2),
    ("meta_title", 10),
    ("meta_description", 30),
]


# ── Issue Detectors ──────────────────────────────────────────────────

def detect_raw_dict_literals(text):
    """Detect Python dict literals like {'key': 'value'} in content."""
    return re.findall(r"\{['\"][\w_]+['\"]:\s*['\"]", text)


def detect_snake_case_keys(text):
    """Detect <strong>snake_case_key:</strong> patterns."""
    return re.findall(r"<strong>\w+_\w+[:\s]*</strong>", text)


def detect_unclosed_tags(text):
    """Detect unclosed HTML tags (basic check)."""
    issues = []
    for tag in ["p", "ul", "ol", "li", "div", "strong", "em"]:
        opens = len(re.findall(f"<{tag}[\\s>]", text, re.IGNORECASE))
        closes = len(re.findall(f"</{tag}>", text, re.IGNORECASE))
        if opens != closes:
            issues.append(f"<{tag}> opened {opens}x but closed {closes}x")
    return issues


def detect_raw_html_as_text(text):
    """Detect patterns where HTML entities are escaped (showing as text)."""
    return re.findall(r"&lt;/?(?:p|ul|ol|li|strong|em|h[1-6]|div|a)\b", text)


def detect_empty_tags(text):
    """Detect empty tags like <p></p>, <li></li>."""
    return re.findall(r"<(p|li|ul|ol|div|strong)>\s*</\1>", text)


def detect_nested_html_in_text(text):
    """Detect literal HTML tags showing as text (not rendered)."""
    # e.g., content has "&lt;p&gt;" or shows "<p>" inside text that isn't HTML
    return re.findall(r"(?:^|[^<])<(?:p|strong|ul|li|ol)>(?:.*?)</(?:p|strong|ul|li|ol)>", text[:200])


def detect_double_encoding(text):
    """Detect double-encoded HTML like &amp;lt; or &amp;amp;."""
    return re.findall(r"&amp;(?:lt|gt|amp|quot);", text)


def detect_json_artifacts(text):
    """Detect JSON/dict artifacts like 'null', 'None', 'True', 'False' as standalone."""
    return re.findall(r"(?:^|\s)(?:null|None|True|False|undefined)(?:\s|$|[,.<])", text)


# ── Auto-Fixers ──────────────────────────────────────────────────────

def fix_snake_case_keys(text):
    """Convert <strong>snake_case:</strong> to <strong>Title Case:</strong>."""
    def replace_key(m):
        key = m.group(1)
        readable = key.replace("_", " ").title()
        colon = m.group(2)
        return f"<strong>{readable}{colon}</strong>"
    return re.sub(r"<strong>(\w+(?:_\w+)+)(:\s*)</strong>", replace_key, text)


def fix_dict_literals_in_li(text):
    """Fix <li>{'year': 2024, 'event': '...'}</li> patterns."""
    def replace_dict_li(m):
        raw = m.group(1)
        try:
            d = ast.literal_eval(raw)  # Safe here — we control the data
            if isinstance(d, dict):
                # Year-based
                if "year" in d:
                    year = d.get("year", "")
                    desc = d.get("event", d.get("description", d.get("change", d.get("detail", str(d)))))
                    return f"<li><strong>{year}:</strong> {desc}</li>"
                # Offense-based
                if "offense" in d:
                    return f"<li><strong>{d.get('offense', '')}:</strong> {d.get('penalty', d.get('description', ''))}</li>"
                # Name-based
                if "name" in d:
                    return f"<li><strong>{d.get('name', '')}:</strong> {d.get('description', d.get('details', ''))}</li>"
                # Program/tier-based
                if "program" in d:
                    return f"<li><strong>{d.get('program', '')}:</strong> {d.get('description', d.get('details', ''))}</li>"
                # Generic key-value
                parts = []
                for k, v in d.items():
                    readable_key = k.replace("_", " ").title()
                    parts.append(f"<strong>{readable_key}:</strong> {v}")
                return f"<li>{'; '.join(parts)}</li>"
        except Exception:
            pass
        return m.group(0)
    return re.sub(r"<li>\s*(\{['\"].*?\})\s*</li>", replace_dict_li, text, flags=re.DOTALL)


def fix_dict_literals_standalone(text):
    """Fix standalone dict literal strings like {'key': 'value'} outside tags."""
    def replace_dict(m):
        raw = m.group(0)
        try:
            d = ast.literal_eval(raw)
            if isinstance(d, dict):
                parts = []
                for k, v in d.items():
                    readable = k.replace("_", " ").title()
                    if isinstance(v, str):
                        parts.append(f"<p><strong>{readable}:</strong> {v}</p>")
                    elif isinstance(v, list):
                        items = "".join(f"<li>{i if isinstance(i, str) else str(i)}</li>" for i in v)
                        parts.append(f"<p><strong>{readable}:</strong></p><ul>{items}</ul>")
                return "\n".join(parts) if parts else raw
        except Exception:
            pass
        return raw
    return re.sub(r"\{['\"][\w_]+['\"]:\s*['\"].*?\}", replace_dict, text, flags=re.DOTALL)


def fix_empty_tags(text):
    """Remove empty tags."""
    return re.sub(r"<(p|li|ul|ol|div|strong|em)>\s*</\1>", "", text)


def fix_double_encoding(text):
    """Fix double-encoded HTML entities."""
    text = text.replace("&amp;lt;", "&lt;")
    text = text.replace("&amp;gt;", "&gt;")
    text = text.replace("&amp;amp;", "&amp;")
    text = text.replace("&amp;quot;", "&quot;")
    return text


def auto_fix_content(text):
    """Apply all auto-fixers to content."""
    if not text or not isinstance(text, str):
        return text, []
    original = text
    fixes = []

    # Fix dict literals in <li> tags
    new_text = fix_dict_literals_in_li(text)
    if new_text != text:
        fixes.append("dict_literals_in_li")
        text = new_text

    # Fix snake_case keys
    new_text = fix_snake_case_keys(text)
    if new_text != text:
        fixes.append("snake_case_keys")
        text = new_text

    # Fix empty tags
    new_text = fix_empty_tags(text)
    if new_text != text:
        fixes.append("empty_tags")
        text = new_text

    # Fix double encoding
    new_text = fix_double_encoding(text)
    if new_text != text:
        fixes.append("double_encoding")
        text = new_text

    return text, fixes


# ── Source URL Validation ────────────────────────────────────────────

def check_source_quality(sources):
    """Check source entries for missing/malformed URLs."""
    issues = []
    if not sources:
        return ["no sources at all"]
    for i, src in enumerate(sources):
        if not isinstance(src, dict):
            issues.append(f"source[{i}] is not a dict")
            continue
        title = src.get("title", "") or src.get("name", "")
        url = src.get("url", "") or src.get("link", "")
        if not title:
            issues.append(f"source[{i}] missing title")
        if not url:
            issues.append(f"source[{i}] missing URL")
        elif not url.startswith("http"):
            issues.append(f"source[{i}] bad URL: {url[:50]}")
    return issues


# ── Main Audit Function ─────────────────────────────────────────────

async def audit_document(doc, do_fix=False):
    """Audit a single state/county document. Returns (issues, fixes)."""
    state_id = doc.get("state_id", "??")
    name = doc.get("state_name") or doc.get("county_name", "Unknown")
    issues = []
    updates = {}

    # 1. Check required string fields
    for field, min_len in STRING_FIELDS:
        val = doc.get(field, "")
        if not val or not isinstance(val, str):
            issues.append(f"MISSING: {field}")
        elif len(val) < min_len:
            issues.append(f"SHORT: {field} ({len(val)} chars)")

    # 2. Check list fields
    for field, min_count in LIST_FIELDS:
        val = doc.get(field)
        if not val or not isinstance(val, list):
            issues.append(f"MISSING: {field}")
        elif len(val) < min_count:
            issues.append(f"LOW_COUNT: {field} ({len(val)}/{min_count})")

    # 3. Check HTML content fields for formatting issues
    for field in HTML_FIELDS:
        val = doc.get(field, "")
        if not val or not isinstance(val, str):
            continue

        field_issues = []

        # Raw dict literals
        dicts = detect_raw_dict_literals(val)
        if dicts:
            field_issues.append(f"dict_literals({len(dicts)})")

        # Snake case keys
        snakes = detect_snake_case_keys(val)
        if snakes:
            field_issues.append(f"snake_case_keys({len(snakes)})")

        # Unclosed tags
        unclosed = detect_unclosed_tags(val)
        for u in unclosed:
            field_issues.append(f"unclosed: {u}")

        # Empty tags
        empty = detect_empty_tags(val)
        if empty:
            field_issues.append(f"empty_tags({len(empty)})")

        # Double encoding
        dbl = detect_double_encoding(val)
        if dbl:
            field_issues.append(f"double_encoded({len(dbl)})")

        # JSON artifacts
        artifacts = detect_json_artifacts(val)
        if artifacts:
            field_issues.append(f"json_artifacts({len(artifacts)})")

        if field_issues:
            issues.append(f"HTML[{field}]: {', '.join(field_issues)}")

            if do_fix:
                fixed, fix_types = auto_fix_content(val)
                if fix_types:
                    updates[field] = fixed

    # 4. Check sources quality
    src_issues = check_source_quality(doc.get("sources"))
    for si in src_issues:
        issues.append(f"SOURCES: {si}")

    # 5. Check status
    if doc.get("status") != "published":
        issues.append(f"STATUS: {doc.get('status', 'missing')}")

    return issues, updates


async def main():
    parser = argparse.ArgumentParser(description="QA Drug Law Pages")
    parser.add_argument("--fix", action="store_true", help="Auto-fix issues")
    parser.add_argument("--state", type=str, help="Audit single state (e.g., CA)")
    parser.add_argument("--counties", action="store_true", help="Also audit county data")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show all details")
    args = parser.parse_args()

    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db_name = os.getenv("DB_NAME", "united_rehabs")
    db = client[db_name]

    print(f"{'='*60}")
    print(f"  Drug Law Pages QA {'+ AUTO-FIX' if args.fix else '(DRY RUN)'}")
    print(f"{'='*60}\n")

    # ── State Laws ───────────────────────────────────────────
    query = {}
    if args.state:
        query["state_id"] = args.state.upper()

    states = await db.state_drug_laws.find(query).to_list(length=60)
    print(f"Auditing {len(states)} state law pages...\n")

    total_issues = 0
    total_fixed = 0
    clean_states = 0
    problem_states = []

    for doc in sorted(states, key=lambda d: d.get("state_id", "")):
        sid = doc.get("state_id", "??")
        name = doc.get("state_name", "Unknown")
        issues, updates = await audit_document(doc, do_fix=args.fix)

        if issues:
            problem_states.append(sid)
            total_issues += len(issues)
            print(f"  {'!'*3} {sid} - {name} ({len(issues)} issues)")
            if args.verbose:
                for iss in issues:
                    print(f"      - {iss}")

            if updates and args.fix:
                updates["updated_at"] = datetime.now(timezone.utc)
                await db.state_drug_laws.update_one(
                    {"state_id": sid}, {"$set": updates}
                )
                total_fixed += len(updates) - 1  # -1 for updated_at
                print(f"      FIXED: {list(updates.keys())}")
        else:
            clean_states += 1
            if args.verbose:
                print(f"  OK  {sid} - {name}")

    # ── County Laws (optional) ───────────────────────────────
    county_count = 0
    county_issues_count = 0
    if args.counties:
        print(f"\n{'─'*40}")
        c_query = {}
        if args.state:
            c_query["state_id"] = args.state.upper()
        counties = await db.county_drug_laws.find(c_query).to_list(length=5000)
        print(f"Auditing {len(counties)} county law pages...\n")

        for doc in sorted(counties, key=lambda d: f"{d.get('state_id', '')}-{d.get('county_slug', '')}"):
            county_count += 1
            sid = doc.get("state_id", "??")
            cname = doc.get("county_name", "Unknown")
            issues, updates = await audit_document(doc, do_fix=args.fix)

            if issues:
                county_issues_count += len(issues)
                print(f"  {'!'*3} {sid}/{cname} ({len(issues)} issues)")
                if args.verbose:
                    for iss in issues:
                        print(f"      - {iss}")
                if updates and args.fix:
                    updates["updated_at"] = datetime.now(timezone.utc)
                    await db.county_drug_laws.update_one(
                        {"state_id": sid, "county_slug": doc.get("county_slug")},
                        {"$set": updates}
                    )

    # ── Summary ──────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  SUMMARY")
    print(f"{'='*60}")
    print(f"  States audited:  {len(states)}")
    print(f"  Clean:           {clean_states}")
    print(f"  With issues:     {len(problem_states)}")
    print(f"  Total issues:    {total_issues}")
    if args.fix:
        print(f"  Fields fixed:    {total_fixed}")
    if problem_states:
        print(f"  Problem states:  {', '.join(problem_states)}")
    if args.counties:
        print(f"\n  Counties audited: {county_count}")
        print(f"  County issues:    {county_issues_count}")
    if not args.fix and total_issues > 0:
        print(f"\n  Run with --fix to auto-repair. Add -v for details.")
    print()


if __name__ == "__main__":
    asyncio.run(main())
