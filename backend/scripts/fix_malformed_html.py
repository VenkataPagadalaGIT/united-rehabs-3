#!/usr/bin/env python3
"""
Fix malformed HTML content in state_drug_laws MongoDB collection.

Handles two main patterns:
1. Dict literals inside <li> tags: <li>{'key': 'val', ...}</li>
2. Snake_case bold keys: <p><strong>snake_case:</strong> value</p>
"""
import os
import re
import ast
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "united_rehabs")

FIELDS = [
    "possession_penalties", "dui_dwi_laws", "marijuana_details",
    "good_samaritan_law", "naloxone_access", "drug_courts",
    "mandatory_minimums", "treatment_alternatives", "recent_changes"
]


def snake_to_title(s):
    """Convert snake_case to Title Case. E.g. 'possession_limit' -> 'Possession Limit'"""
    return s.replace("_", " ").title()


def format_dict_as_text(d):
    """Format a dict into readable HTML text based on its keys."""
    if not isinstance(d, dict):
        return str(d)

    # Year-based entries (recent_changes, marijuana timeline)
    if "year" in d and "event" in d:
        return f"<strong>{d['year']}:</strong> {d['event']}"

    # Offense/penalty entries (mandatory_minimums)
    if "offense" in d:
        parts = [f"<strong>{d['offense']}</strong>"]
        for key in ["statute", "minimum", "details", "penalty", "mandatory_minimum",
                     "notes", "sentence", "classification"]:
            if key in d and d[key]:
                parts.append(f"{snake_to_title(key)}: {d[key]}")
        return " — ".join(parts[:2]) + (("<br>" + "<br>".join(parts[2:])) if len(parts) > 2 else "")

    # Substance-based entries (Nebraska mandatory_minimums)
    if "substance" in d:
        parts = [f"<strong>{d['substance']}</strong>"]
        for key in ["amount", "offense", "minimum", "penalty", "details", "statute",
                     "classification", "mandatory_minimum"]:
            if key in d and d[key]:
                parts.append(f"{snake_to_title(key)}: {d[key]}")
        return " — ".join(parts[:2]) + (("<br>" + "<br>".join(parts[2:])) if len(parts) > 2 else "")

    # Named programs (drug_courts, treatment_alternatives)
    if "name" in d:
        parts = []
        name = d["name"]
        statute = d.get("statute", "")
        if statute and statute != "N/A":
            parts.append(f"<strong>{name}</strong> ({statute})")
        else:
            parts.append(f"<strong>{name}</strong>")

        for key in ["description", "eligibility", "requirements", "outcome",
                     "duration", "website", "details"]:
            if key in d and d[key]:
                parts.append(f"{snake_to_title(key)}: {d[key]}")
        return "<br>".join(parts)

    # Tier-based entries (PA DUI tiers)
    if "tier" in d:
        parts = [f"<strong>{d['tier']}</strong>"]
        for key in ["bac", "description", "first_offense", "second_offense",
                     "third_offense", "penalty", "details", "license_suspension",
                     "jail_time", "fine"]:
            if key in d and d[key]:
                parts.append(f"{snake_to_title(key)}: {d[key]}")
        return "<br>".join(parts)

    # DUI offense entries
    if "offense" in d or "level" in d:
        label = d.get("offense") or d.get("level") or "Offense"
        parts = [f"<strong>{label}</strong>"]
        for key in sorted(d.keys()):
            if key in ("offense", "level"):
                continue
            if d[key]:
                parts.append(f"{snake_to_title(key)}: {d[key]}")
        return "<br>".join(parts)

    # Generic fallback: format all key-value pairs
    parts = []
    for key, val in d.items():
        if val:
            parts.append(f"<strong>{snake_to_title(key)}:</strong> {val}")
    return "<br>".join(parts)


def fix_li_dict_patterns(html):
    """Fix <li>{...dict...}</li> patterns."""
    pattern = re.compile(r"<li>\s*(\{[^}]+\})\s*</li>", re.DOTALL)

    def replace_li_dict(match):
        dict_str = match.group(1)
        try:
            d = ast.literal_eval(dict_str)
            return f"<li>{format_dict_as_text(d)}</li>"
        except (ValueError, SyntaxError):
            # Try to handle truncated or malformed dicts
            return match.group(0)

    return pattern.sub(replace_li_dict, html)


def fix_li_multiline_dict_patterns(html):
    """Fix <li>{...} patterns that might span content with nested quotes."""
    # More aggressive pattern for dicts that might have commas in values
    pattern = re.compile(r"<li>\s*(\{.*?\})\s*</li>", re.DOTALL)

    def replace_match(match):
        dict_str = match.group(1)
        try:
            d = ast.literal_eval(dict_str)
            return f"<li>{format_dict_as_text(d)}</li>"
        except (ValueError, SyntaxError):
            return match.group(0)

    return pattern.sub(replace_match, html)


def fix_p_strong_snake_keys(html):
    """Fix <p><strong>snake_case:</strong> value</p> patterns."""
    pattern = re.compile(r"<p><strong>([a-z][a-z0-9_]+):</strong>\s*(.*?)</p>", re.DOTALL)

    def replace_match(match):
        key = match.group(1)
        value = match.group(2).strip()
        nice_key = snake_to_title(key)

        # For URL/website fields, make them clickable
        if key in ("website", "url", "link") and value.startswith("http"):
            return f'<p><strong>{nice_key}:</strong> <a href="{value}" target="_blank" rel="noopener">{value}</a></p>'

        return f"<p><strong>{nice_key}:</strong> {value}</p>"

    return pattern.sub(replace_match, html)


def fix_standalone_strong_snake(html):
    """Fix remaining <strong>snake_case:</strong> inside other tags."""
    pattern = re.compile(r"<strong>([a-z][a-z0-9_]+):</strong>")

    def replace_match(match):
        key = match.group(1)
        # Only replace keys that contain underscores (snake_case)
        if "_" in key:
            return f"<strong>{snake_to_title(key)}:</strong>"
        return match.group(0)

    return pattern.sub(replace_match, html)


def clean_field(html):
    """Apply all cleaning transformations to a field's HTML content."""
    if not html or not isinstance(html, str):
        return html

    original = html

    # Step 1: Fix dict literals inside <li> tags (greedy approach for long dicts)
    html = fix_li_multiline_dict_patterns(html)
    # Step 2: Fix remaining simple dict literals in <li>
    html = fix_li_dict_patterns(html)
    # Step 3: Fix <p><strong>snake_case:</strong> value</p>
    html = fix_p_strong_snake_keys(html)
    # Step 4: Fix remaining standalone <strong>snake_case:</strong>
    html = fix_standalone_strong_snake(html)

    changed = html != original
    return html, changed


def main():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    col = db["state_drug_laws"]

    total_docs = col.count_documents({})
    print(f"Processing {total_docs} documents in state_drug_laws...\n")

    states_fixed = 0
    fields_fixed = 0
    before_after_examples = []

    for doc in col.find().sort("state_name", 1):
        state = doc.get("state_name", "unknown")
        updates = {}
        state_field_fixes = []

        for field in FIELDS:
            val = doc.get(field, "")
            if not isinstance(val, str) or not val:
                continue

            cleaned, changed = clean_field(val)
            if changed:
                updates[field] = cleaned
                state_field_fixes.append(field)

                # Collect before/after examples
                if len(before_after_examples) < 6:
                    before_after_examples.append({
                        "state": state,
                        "field": field,
                        "before": val[:600],
                        "after": cleaned[:600],
                    })

        if updates:
            col.update_one({"_id": doc["_id"]}, {"$set": updates})
            states_fixed += 1
            fields_fixed += len(updates)
            print(f"  Fixed {state}: {len(updates)} fields — {', '.join(state_field_fixes)}")
        else:
            print(f"  {state}: no issues found")

    print(f"\n{'='*80}")
    print(f"SUMMARY")
    print(f"{'='*80}")
    print(f"Total documents scanned: {total_docs}")
    print(f"States with fixes applied: {states_fixed}")
    print(f"Total fields fixed: {fields_fixed}")

    print(f"\n{'='*80}")
    print(f"BEFORE / AFTER EXAMPLES")
    print(f"{'='*80}")
    for ex in before_after_examples:
        print(f"\n--- {ex['state']} / {ex['field']} ---")
        print(f"BEFORE:\n{ex['before']}")
        print(f"\nAFTER:\n{ex['after']}")
        print("-" * 60)

    # Verification pass
    print(f"\n{'='*80}")
    print("VERIFICATION: Checking for remaining issues...")
    print(f"{'='*80}")
    remaining = 0
    check_patterns = [
        re.compile(r"<strong>\w+_\w+:?\s*</strong>"),
        re.compile(r"<li>\s*\{'[a-z_]+':\s"),
        re.compile(r"<p><strong>[a-z_]+_[a-z_]+:</strong>"),
    ]
    for doc in col.find().sort("state_name", 1):
        state = doc.get("state_name", "?")
        for field in FIELDS:
            val = doc.get(field, "")
            if not isinstance(val, str):
                continue
            for p in check_patterns:
                if p.search(val):
                    remaining += 1
                    found = p.findall(val)
                    print(f"  REMAINING: {state}/{field}: {found[:3]}")
                    break

    if remaining == 0:
        print("  All clean! No remaining malformed patterns detected.")
    else:
        print(f"  {remaining} fields still have issues.")

    client.close()


if __name__ == "__main__":
    main()
