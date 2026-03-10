#!/usr/bin/env python3
"""
News Tag Taxonomy & Normalization System
==========================================
Defines a structured tagging system and normalizes all existing articles.

Usage:
  python scripts/tag_taxonomy.py              # Dry run - show what would change
  python scripts/tag_taxonomy.py --apply      # Apply normalization to MongoDB
  python scripts/tag_taxonomy.py --seed       # Seed the tag_taxonomy collection
"""

import asyncio
import os
import sys
import argparse
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# ══════════════════════════════════════════════════════════════
# TAG TAXONOMY - Structured like Reuters/AP/NYT
# ══════════════════════════════════════════════════════════════
# Categories: Substances, Issues, Actions, Agencies, Regions, Formats

TAXONOMY = {
    # ── SUBSTANCES ─────────────────────────────────────
    "Substances": {
        "color": "#DC2626",  # red
        "tags": {
            "fentanyl": {"label": "Fentanyl", "aliases": ["fentanyl", "fentanil", "synthetic opioid fentanyl"]},
            "opioids": {"label": "Opioids", "aliases": ["opioid", "opioids", "opioid crisis", "opioid epidemic"]},
            "heroin": {"label": "Heroin", "aliases": ["heroin"]},
            "methamphetamine": {"label": "Methamphetamine", "aliases": ["methamphetamine", "meth", "crystal meth"]},
            "cocaine": {"label": "Cocaine", "aliases": ["cocaine", "crack cocaine", "crack"]},
            "cannabis": {"label": "Cannabis", "aliases": ["cannabis", "marijuana", "weed", "pot", "hemp", "thc"]},
            "xylazine": {"label": "Xylazine", "aliases": ["xylazine", "tranq", "tranq dope"]},
            "nitazenes": {"label": "Nitazenes", "aliases": ["nitazene", "nitazenes", "synthetic opioids nitazenes"]},
            "psychedelics": {"label": "Psychedelics", "aliases": ["psychedelics", "psilocybin", "mdma", "lsd", "ketamine"]},
            "alcohol": {"label": "Alcohol", "aliases": ["alcohol", "alcoholism", "alcohol abuse"]},
            "prescription-drugs": {"label": "Prescription Drugs", "aliases": ["prescription drugs", "prescription opioids", "painkillers", "benzodiazepines"]},
            "synthetic-drugs": {"label": "Synthetic Drugs", "aliases": ["synthetic drugs", "new psychoactive substances", "nps", "designer drugs"]},
        }
    },

    # ── ISSUES ─────────────────────────────────────────
    "Issues": {
        "color": "#2563EB",  # blue
        "tags": {
            "overdose": {"label": "Overdose", "aliases": ["overdose", "overdose deaths", "drug overdose", "fatal overdose", "overdose crisis"]},
            "addiction": {"label": "Addiction", "aliases": ["addiction", "substance abuse", "substance use disorder", "drug addiction"]},
            "treatment": {"label": "Treatment", "aliases": ["treatment", "addiction treatment", "rehab", "rehabilitation", "recovery"]},
            "harm-reduction": {"label": "Harm Reduction", "aliases": ["harm reduction", "needle exchange", "safe injection", "supervised consumption"]},
            "drug-trafficking": {"label": "Drug Trafficking", "aliases": ["drug trafficking", "trafficking", "smuggling", "drug trade"]},
            "mental-health": {"label": "Mental Health", "aliases": ["mental health", "co-occurring disorders", "dual diagnosis"]},
            "prevention": {"label": "Prevention", "aliases": ["prevention", "drug prevention", "education"]},
            "public-health": {"label": "Public Health", "aliases": ["public health", "health crisis", "epidemic"]},
            "incarceration": {"label": "Incarceration", "aliases": ["incarceration", "prison", "jail", "criminal justice"]},
            "homelessness": {"label": "Homelessness", "aliases": ["homelessness", "homeless", "housing"]},
            "racial-disparities": {"label": "Racial Disparities", "aliases": ["racial disparities", "racial justice", "equity"]},
            "youth": {"label": "Youth", "aliases": ["youth", "teens", "adolescents", "college students", "young adults"]},
        }
    },

    # ── ACTIONS / EVENT TYPES ──────────────────────────
    "Actions": {
        "color": "#D97706",  # amber
        "tags": {
            "drug-seizure": {"label": "Drug Seizure", "aliases": ["drug seizure", "seizure", "drug bust", "drug raid", "bust"]},
            "arrest": {"label": "Arrest", "aliases": ["arrest", "arrests", "indictment", "charged"]},
            "legislation": {"label": "Legislation", "aliases": ["legislation", "bill", "law", "legalization", "decriminalization", "ballot measure"]},
            "court-ruling": {"label": "Court Ruling", "aliases": ["court ruling", "verdict", "sentencing", "trial"]},
            "policy-change": {"label": "Policy Change", "aliases": ["policy change", "drug policy", "policy reform", "regulation"]},
            "research": {"label": "Research", "aliases": ["research", "study", "clinical trial", "data"]},
            "funding": {"label": "Funding", "aliases": ["funding", "budget", "grants", "spending cuts", "federal funding"]},
            "investigation": {"label": "Investigation", "aliases": ["investigation", "probe", "inquiry"]},
        }
    },

    # ── AGENCIES & ORGANIZATIONS ───────────────────────
    "Agencies": {
        "color": "#7C3AED",  # purple
        "tags": {
            "dea": {"label": "DEA", "aliases": ["dea", "drug enforcement administration"]},
            "fda": {"label": "FDA", "aliases": ["fda", "food and drug administration"]},
            "cdc": {"label": "CDC", "aliases": ["cdc", "centers for disease control"]},
            "samhsa": {"label": "SAMHSA", "aliases": ["samhsa"]},
            "who": {"label": "WHO", "aliases": ["who", "world health organization"]},
            "unodc": {"label": "UNODC", "aliases": ["unodc", "united nations office on drugs and crime", "un drugs"]},
            "fbi": {"label": "FBI", "aliases": ["fbi"]},
            "cbp": {"label": "CBP", "aliases": ["cbp", "customs and border protection", "border patrol"]},
            "nida": {"label": "NIDA", "aliases": ["nida", "national institute on drug abuse"]},
        }
    },

    # ── REGIONS ────────────────────────────────────────
    "Regions": {
        "color": "#059669",  # green
        "tags": {
            "united-states": {"label": "United States", "aliases": ["united states", "usa", "us", "america"]},
            "mexico": {"label": "Mexico", "aliases": ["mexico", "mexican cartels"]},
            "canada": {"label": "Canada", "aliases": ["canada"]},
            "united-kingdom": {"label": "United Kingdom", "aliases": ["united kingdom", "uk", "britain", "england"]},
            "europe": {"label": "Europe", "aliases": ["europe", "eu", "european union"]},
            "latin-america": {"label": "Latin America", "aliases": ["latin america", "south america", "central america"]},
            "asia": {"label": "Asia", "aliases": ["asia", "china", "india", "philippines", "southeast asia"]},
            "africa": {"label": "Africa", "aliases": ["africa", "nigeria", "south africa"]},
            "australia": {"label": "Australia", "aliases": ["australia", "oceania"]},
        }
    },

    # ── ACTORS ─────────────────────────────────────────
    "Actors": {
        "color": "#BE185D",  # pink
        "tags": {
            "cartels": {"label": "Cartels", "aliases": ["cartel", "cartels", "sinaloa", "cjng", "drug cartel"]},
            "naloxone": {"label": "Naloxone", "aliases": ["naloxone", "narcan", "overdose reversal"]},
            "drug-courts": {"label": "Drug Courts", "aliases": ["drug court", "drug courts", "diversion"]},
            "border-security": {"label": "Border Security", "aliases": ["border security", "border", "border wall", "us-mexico border"]},
        }
    },
}

# ══════════════════════════════════════════════════════════════
# Build reverse lookup: alias → (category, tag_slug, label)
# ══════════════════════════════════════════════════════════════

def build_alias_map():
    """Build a lowercase alias → canonical tag mapping."""
    alias_map = {}
    for cat_name, cat in TAXONOMY.items():
        for slug, tag_info in cat["tags"].items():
            for alias in tag_info["aliases"]:
                alias_map[alias.lower().strip()] = {
                    "slug": slug,
                    "label": tag_info["label"],
                    "category": cat_name,
                }
    return alias_map


def normalize_tags(raw_tags, alias_map):
    """Normalize a list of raw tags to canonical slugs. Returns list of canonical slugs."""
    normalized = set()
    for tag in raw_tags:
        clean = tag.lower().strip().replace("-", " ")
        if clean in alias_map:
            normalized.add(alias_map[clean]["slug"])
        else:
            # Try partial matching
            matched = False
            for alias, info in alias_map.items():
                if alias in clean or clean in alias:
                    normalized.add(info["slug"])
                    matched = True
                    break
            if not matched:
                # Keep as-is but slugify
                slug = clean.replace(" ", "-")
                normalized.add(slug)
    return sorted(normalized)


# ══════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════

async def main():
    parser = argparse.ArgumentParser(description="Tag Taxonomy Manager")
    parser.add_argument("--apply", action="store_true", help="Apply normalization to MongoDB")
    parser.add_argument("--seed", action="store_true", help="Seed tag_taxonomy collection")
    args = parser.parse_args()

    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client[os.getenv("DB_NAME", "united_rehabs")]
    alias_map = build_alias_map()

    print(f"{'='*60}")
    print(f"  Tag Taxonomy System")
    print(f"{'='*60}\n")

    # ── Seed taxonomy collection ─────────────────────
    if args.seed:
        print("Seeding tag_taxonomy collection...\n")
        for cat_name, cat in TAXONOMY.items():
            for slug, tag_info in cat["tags"].items():
                doc = {
                    "slug": slug,
                    "label": tag_info["label"],
                    "category": cat_name,
                    "color": cat["color"],
                    "aliases": tag_info["aliases"],
                    "article_count": 0,
                    "created_at": datetime.now(timezone.utc),
                }
                await db.tag_taxonomy.update_one(
                    {"slug": slug}, {"$set": doc}, upsert=True
                )
                print(f"  {cat_name:12} | {slug:25} | {tag_info['label']}")
        total = await db.tag_taxonomy.count_documents({})
        print(f"\nSeeded {total} tags in tag_taxonomy collection.")
        return

    # ── Show taxonomy ────────────────────────────────
    total_tags = 0
    for cat_name, cat in TAXONOMY.items():
        tag_count = len(cat["tags"])
        total_tags += tag_count
        print(f"  {cat_name} ({tag_count} tags)")
        for slug, tag_info in cat["tags"].items():
            print(f"    {tag_info['label']:25} aliases: {', '.join(tag_info['aliases'][:3])}")
        print()

    print(f"  Total canonical tags: {total_tags}")
    print(f"  Total aliases: {sum(len(t['aliases']) for c in TAXONOMY.values() for t in c['tags'].values())}")

    # ── Normalize articles ───────────────────────────
    articles = await db.articles.find({}, {"_id": 1, "slug": 1, "title": 1, "tags": 1}).to_list(100)
    print(f"\n{'─'*60}")
    print(f"  Normalizing {len(articles)} articles...\n")

    changes = 0
    for art in articles:
        old_tags = art.get("tags", [])
        if not old_tags:
            continue
        new_tags = normalize_tags(old_tags, alias_map)
        if set(new_tags) != set(t.lower().replace(" ", "-") for t in old_tags):
            changes += 1
            title = (art.get("title", "")[:50] + "...") if len(art.get("title", "")) > 50 else art.get("title", "")
            print(f"  {title}")
            print(f"    OLD: {old_tags}")
            print(f"    NEW: {new_tags}")
            print()
            if args.apply:
                await db.articles.update_one(
                    {"_id": art["_id"]},
                    {"$set": {"tags": new_tags, "updated_at": datetime.now(timezone.utc)}}
                )

    # ── Update tag counts ────────────────────────────
    if args.apply:
        # Count articles per tag
        pipeline = [
            {"$unwind": "$tags"},
            {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        ]
        counts = {}
        async for doc in db.articles.aggregate(pipeline):
            counts[doc["_id"]] = doc["count"]

        for slug, count in counts.items():
            await db.tag_taxonomy.update_one(
                {"slug": slug},
                {"$set": {"article_count": count}},
            )

    print(f"{'='*60}")
    print(f"  Articles needing changes: {changes}/{len(articles)}")
    if not args.apply and changes > 0:
        print(f"  Run with --apply to update MongoDB")
    elif args.apply:
        print(f"  Applied {changes} tag normalizations")
    print()


if __name__ == "__main__":
    asyncio.run(main())
