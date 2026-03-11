#!/usr/bin/env python3
"""
Sync local MongoDB → Production via API.

Usage:
  python scripts/sync_to_production.py                    # Sync all collections
  python scripts/sync_to_production.py state_drug_laws    # Sync one collection
  python scripts/sync_to_production.py --dry-run          # Preview only
"""
import asyncio, json, os, sys, argparse
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
import httpx

# Production URL
PROD_URL = os.getenv("PROD_URL", "https://unitedrehabs.com")

# Collections to sync
COLLECTIONS = [
    "state_drug_laws",
    "county_drug_laws",
    "articles",
    "tag_taxonomy",
    "state_addiction_statistics",
    "substance_statistics",
    "faqs",
    "free_resources",
    "page_seo",
    "countries",
    "country_statistics",
    "treatment_centers",
    "site_config",
    "seo_global",
]

def json_serializer(obj):
    """Handle MongoDB types for JSON serialization."""
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Not serializable: {type(obj)}")


def get_local_data(collection: str) -> list:
    """Read all documents from local MongoDB."""
    client = MongoClient("mongodb://localhost:27017")
    db = client["united_rehabs"]
    docs = list(db[collection].find({}))
    # Convert ObjectId and datetime for JSON serialization
    clean = []
    for doc in docs:
        d = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                d[k] = str(v)
            elif isinstance(v, datetime):
                d[k] = v.isoformat()
            else:
                d[k] = v
        clean.append(d)
    return clean


async def login(client: httpx.AsyncClient) -> str:
    """Login to production and return JWT token."""
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not password:
        print("\n  Set ADMIN_EMAIL and ADMIN_PASSWORD env vars:")
        print("  export ADMIN_EMAIL=your@email.com")
        print("  export ADMIN_PASSWORD=yourpassword\n")
        sys.exit(1)

    resp = await client.post(f"{PROD_URL}/api/auth/login", json={
        "email": email, "password": password
    })
    if resp.status_code != 200:
        print(f"  LOGIN FAILED: {resp.status_code} {resp.text}")
        sys.exit(1)
    token = resp.json()["access_token"]
    print(f"  Logged in as {email}")
    return token


async def sync_collection(client: httpx.AsyncClient, token: str, collection: str, dry_run: bool = False):
    """Sync a single collection to production."""
    docs = get_local_data(collection)
    print(f"\n  {collection}: {len(docs)} documents")

    if dry_run:
        print(f"    [DRY RUN] Would push {len(docs)} docs")
        return

    if not docs:
        print(f"    Skipping (empty)")
        return

    # Send in batches of 100 to avoid payload limits
    batch_size = 100
    total_inserted = 0
    for i in range(0, len(docs), batch_size):
        batch = docs[i:i + batch_size]
        payload = json.loads(json.dumps(batch, default=json_serializer))
        # First batch clears the collection (replace=true), rest append
        params = {"replace": "true"} if i == 0 else {}
        resp = await client.post(
            f"{PROD_URL}/api/sync/{collection}",
            json=payload,
            params=params,
            headers={"Authorization": f"Bearer {token}"},
            timeout=60.0,
        )
        if resp.status_code == 200:
            result = resp.json()
            total_inserted += result.get("inserted", len(batch))
            print(f"    Batch {i//batch_size + 1}: {len(batch)} docs → total in prod: {result.get('total', '?')}")
        else:
            print(f"    FAILED batch {i//batch_size + 1}: {resp.status_code} {resp.text[:200]}")
            return

    print(f"    Synced: {total_inserted}")


async def verify_sync(client: httpx.AsyncClient, token: str):
    """Compare local vs production counts."""
    local_client = MongoClient("mongodb://localhost:27017")
    local_db = local_client["united_rehabs"]

    resp = await client.get(
        f"{PROD_URL}/api/sync/status",
        headers={"Authorization": f"Bearer {token}"},
    )
    if resp.status_code != 200:
        print(f"\n  Could not verify: {resp.status_code}")
        return

    prod_counts = resp.json()

    print(f"\n  {'Collection':<30} {'Local':>8} {'Prod':>8} {'Match':>8}")
    print(f"  {'─'*30} {'─'*8} {'─'*8} {'─'*8}")
    all_match = True
    for name in sorted(COLLECTIONS):
        local_count = local_db[name].count_documents({})
        prod_count = prod_counts.get(name, "?")
        match = "✓" if local_count == prod_count else "✗"
        if local_count != prod_count:
            all_match = False
        print(f"  {name:<30} {local_count:>8} {str(prod_count):>8} {match:>8}")

    print(f"\n  {'ALL MATCHED!' if all_match else 'SOME MISMATCHES — re-run sync for failed collections'}")


async def main():
    parser = argparse.ArgumentParser(description="Sync local MongoDB to production")
    parser.add_argument("collections", nargs="*", help="Specific collections to sync (default: all)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without pushing")
    parser.add_argument("--verify", action="store_true", help="Only verify counts, don't sync")
    args = parser.parse_args()

    target_collections = args.collections if args.collections else COLLECTIONS

    print(f"\n  Syncing to: {PROD_URL}")
    print(f"  Collections: {len(target_collections)}")

    async with httpx.AsyncClient() as client:
        token = await login(client)

        if args.verify:
            await verify_sync(client, token)
            return

        for coll in target_collections:
            if coll not in COLLECTIONS:
                print(f"\n  SKIP: {coll} (not in syncable list)")
                continue
            await sync_collection(client, token, coll, dry_run=args.dry_run)

        # Verify after sync
        if not args.dry_run:
            print("\n  Verifying sync...")
            await verify_sync(client, token)

    print("\n  Done!\n")


if __name__ == "__main__":
    asyncio.run(main())
