#!/usr/bin/env python3
"""Import detailed, fact-checked state drug law data from Python files into MongoDB."""

import asyncio
import os
import sys
import uuid
import importlib.util
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Files to import (relative to backend dir)
FILES = [
    "florida_drug_laws_data.py",
    "texas_drug_laws.py",
    "pennsylvania_drug_laws.py",
    "illinois_drug_laws.py",
    "virginia_drug_laws.py",
    "georgia_drug_laws_data.py",
    "ohio_drug_law_data.py",
    "nj_drug_laws_data.py",
    "nc_drug_law_data.py",
    "tennessee_drug_laws.py",
]

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_law_from_file(filepath):
    """Load the `law` dict from a Python file."""
    spec = importlib.util.spec_from_file_location("mod", filepath)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.law


def normalize_sources(sources):
    """Normalize sources to match the LawSource model: {title, url, description}."""
    if not sources:
        return sources
    normalized = []
    for s in sources:
        entry = {}
        # Handle different key names
        entry["title"] = s.get("title") or s.get("name") or s.get("source") or ""
        entry["url"] = s.get("url") or s.get("link") or ""
        entry["description"] = s.get("description") or s.get("section") or s.get("notes") or ""
        normalized.append(entry)
    return normalized


def normalize_faqs(faqs):
    """Ensure FAQs are [{question, answer}] format."""
    if not faqs:
        return faqs
    normalized = []
    for f in faqs:
        normalized.append({
            "question": f.get("question", ""),
            "answer": f.get("answer", ""),
        })
    return normalized


def normalize_penalty_table(table):
    """Normalize penalty table rows to match expected format."""
    if not table:
        return table
    normalized = []
    for row in table:
        entry = {
            "offense": row.get("offense", ""),
            "substance": row.get("substance", row.get("drug", "")),
            "amount": row.get("amount", row.get("quantity", "")),
            "classification": row.get("classification", row.get("class", "")),
            "jail_time": row.get("jail_time") or row.get("penalty") or row.get("max_prison") or row.get("prison") or "",
            "fine": row.get("fine") or row.get("max_fine") or row.get("mandatory_fine") or "",
        }
        # Add extra fields if present
        if row.get("statute"):
            entry["statute"] = row["statute"]
        if row.get("notes"):
            entry["notes"] = row["notes"]
        if row.get("ars_citation"):
            entry["statute"] = row["ars_citation"]
        if row.get("mcl_citation"):
            entry["statute"] = row["mcl_citation"]
        normalized.append(entry)
    return normalized


def normalize_drug_schedules(schedules):
    """Normalize drug schedules to [{schedule, description, examples}] format."""
    if not schedules:
        return schedules
    # Handle dict with "schedules" key
    if isinstance(schedules, dict) and "schedules" in schedules:
        schedules = schedules["schedules"]
    normalized = []
    for s in schedules:
        examples = s.get("examples", "")
        if isinstance(examples, list):
            examples = ", ".join(examples)
        entry = {
            "schedule": s.get("schedule", ""),
            "description": s.get("description", ""),
            "examples": examples,
        }
        normalized.append(entry)
    return normalized


def flatten_for_mongo(law_data):
    """Flatten nested structures that the frontend expects as simple strings/lists."""
    data = dict(law_data)

    # Normalize arrays
    data["sources"] = normalize_sources(data.get("sources"))
    data["faqs"] = normalize_faqs(data.get("faqs"))
    data["penalty_table"] = normalize_penalty_table(data.get("penalty_table"))
    data["drug_schedules"] = normalize_drug_schedules(data.get("drug_schedules"))

    # Flatten complex nested objects to strings for fields the frontend expects as HTML strings
    for field in ["possession_penalties", "dui_dwi_laws", "marijuana_details",
                   "good_samaritan_law", "naloxone_access", "drug_courts",
                   "mandatory_minimums", "treatment_alternatives"]:
        val = data.get(field)
        if isinstance(val, dict):
            # Convert dict to HTML paragraphs
            parts = []
            for k, v in val.items():
                if isinstance(v, str) and v:
                    parts.append(f"<p>{v}</p>")
                elif isinstance(v, list):
                    items = "".join(f"<li>{item if isinstance(item, str) else str(item)}</li>" for item in v)
                    parts.append(f"<ul>{items}</ul>")
                elif isinstance(v, dict):
                    for k2, v2 in v.items():
                        if isinstance(v2, str) and v2:
                            parts.append(f"<p><strong>{k2}:</strong> {v2}</p>")
            if parts:
                data[field] = "\n".join(parts)
            else:
                data[field] = str(val)

    # Handle recent_changes - convert list of dicts to HTML
    rc = data.get("recent_changes")
    if isinstance(rc, list) and rc and isinstance(rc[0], dict):
        parts = []
        for item in rc:
            year = item.get("year", item.get("date", ""))
            desc = item.get("description", item.get("change", ""))
            parts.append(f"<p><strong>{year}:</strong> {desc}</p>")
        data["recent_changes"] = "\n".join(parts)

    # Ensure marijuana_status is a simple string
    ms = data.get("marijuana_status")
    if isinstance(ms, dict):
        data["marijuana_status"] = ms.get("status", str(ms))

    # Handle key_takeaways - ensure it's a list of strings
    kt = data.get("key_takeaways")
    if isinstance(kt, list):
        data["key_takeaways"] = [str(t) for t in kt]

    # Remove any fields not in the model
    # Keep slug, reviewed_by, reviewer_credentials, confidence_score etc.
    # but handle confidence_score type
    cs = data.get("confidence_score")
    if isinstance(cs, (int, float)):
        data["confidence_score"] = "high" if cs >= 0.85 else "medium" if cs >= 0.6 else "low"

    return data


async def main():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DB_NAME', 'united_rehabs')]

    imported = 0
    errors = 0

    for filename in FILES:
        filepath = os.path.join(BACKEND_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  ✗ {filename}: file not found")
            errors += 1
            continue

        try:
            law_data = load_law_from_file(filepath)
            state_id = law_data.get("state_id", "").upper()
            state_name = law_data.get("state_name", "")

            if not state_id:
                print(f"  ✗ {filename}: no state_id found")
                errors += 1
                continue

            # Normalize the data
            data = flatten_for_mongo(law_data)
            data["state_id"] = state_id
            data["updated_at"] = datetime.now(timezone.utc)
            data["status"] = "published"

            # Upsert into MongoDB
            result = await db.state_drug_laws.update_one(
                {"state_id": state_id},
                {"$set": data},
                upsert=True
            )

            action = "updated" if result.matched_count > 0 else "inserted"
            print(f"  ✓ {state_id} - {state_name} ({action}) [{filename}]")
            imported += 1

        except Exception as e:
            print(f"  ✗ {filename}: {e}")
            errors += 1

    print(f"\nDone! Imported: {imported}, Errors: {errors}")
    total = await db.state_drug_laws.count_documents({})
    print(f"Total states in database: {total}")


if __name__ == "__main__":
    asyncio.run(main())
