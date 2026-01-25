"""
DATAFORSEO SERP VERIFICATION SYSTEM
====================================
Uses DataForSEO API to automatically verify addiction statistics for ALL countries.

This system:
1. Generates search queries for all countries × years × metrics
2. Submits batches to DataForSEO (100 queries per request)
3. Extracts numerical data from SERP results
4. Compares with database values
5. Flags discrepancies for review
"""

import asyncio
import os
import re
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import httpx
from asyncio import Semaphore

load_dotenv()

# DataForSEO API endpoints
DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3"
DATAFORSEO_SERP_POST = f"{DATAFORSEO_BASE_URL}/serp/google/organic/task_post"
DATAFORSEO_SERP_GET = f"{DATAFORSEO_BASE_URL}/serp/google/organic/task_get/advanced"

# Search query templates
QUERY_TEMPLATES = {
    "opioid_deaths": "{country} opioid overdose deaths {year} official statistics government",
    "drug_overdose_deaths": "{country} drug overdose deaths {year} official statistics",
    "treatment_centers": "{country} addiction treatment centers {year} total number"
}

# Country location codes for DataForSEO (ISO 3166-1)
# See: https://docs.dataforseo.com/v3/appendix/locations
COUNTRY_LOCATION_CODES = {
    "USA": 2840, "CAN": 2124, "GBR": 2826, "AUS": 2036, "DEU": 2276,
    "FRA": 2250, "JPN": 2392, "IND": 2356, "BRA": 2076, "MEX": 2484,
    "ESP": 2724, "ITA": 2380, "NLD": 2528, "CHE": 2756, "SWE": 2752,
    "NOR": 2578, "DNK": 2208, "FIN": 2246, "BEL": 2056, "AUT": 2040,
    "RUS": 2643, "CHN": 2156, "KOR": 2410, "POL": 2616, "PRT": 2620,
    "IRL": 2372, "NZL": 2554, "ZAF": 2710, "ARG": 2032, "CHL": 2152,
    # Add more as needed...
}

# Pattern for extracting numbers from text
NUMBER_PATTERNS = [
    r'(\d{1,3}(?:,\d{3})*)\s*(?:opioid|drug|overdose)?\s*deaths?',
    r'(\d{1,3}(?:,\d{3})*)\s*(?:people|persons|individuals)\s*died',
    r'(?:recorded|reported|were)\s*(\d{1,3}(?:,\d{3})*)\s*(?:deaths|fatalities)',
    r'(\d+(?:\.\d+)?)\s*(?:K|k|thousand)\s*(?:opioid|drug)?\s*deaths?',
    r'death\s*(?:toll|count|rate)\s*(?:of|was|reached)\s*(\d{1,3}(?:,\d{3})*)',
]


class DataForSEOVerifier:
    """
    Automated SERP verification using DataForSEO API.
    """
    
    def __init__(self, username: str, password: str, db):
        self.username = username
        self.password = password
        self.db = db
        self.auth = (username, password)
        self.semaphore = Semaphore(5)  # Limit concurrent requests
        self.results_cache = {}
        
    async def generate_all_queries(self, years: List[int] = None) -> List[Dict]:
        """
        Generate all search queries needed for verification.
        """
        if years is None:
            years = [2019, 2020, 2021, 2022, 2023]
        
        queries = []
        
        # Get all countries from database
        cursor = self.db.country_statistics.aggregate([
            {"$group": {"_id": "$country_code", "name": {"$first": "$country_name"}}}
        ])
        countries = await cursor.to_list(length=200)
        
        for country in countries:
            country_code = country["_id"]
            country_name = country["name"]
            location_code = COUNTRY_LOCATION_CODES.get(country_code, 2840)  # Default to US
            
            for year in years:
                for metric, template in QUERY_TEMPLATES.items():
                    query = template.format(country=country_name, year=year)
                    queries.append({
                        "keyword": query,
                        "country_code": country_code,
                        "country_name": country_name,
                        "year": year,
                        "metric": metric,
                        "location_code": location_code,
                        "language_code": "en"
                    })
        
        return queries
    
    async def submit_batch(self, queries: List[Dict]) -> List[str]:
        """
        Submit a batch of queries to DataForSEO (max 100 per request).
        Returns list of task IDs.
        """
        task_ids = []
        
        # Prepare tasks for API
        tasks = []
        for q in queries[:100]:  # Max 100 per request
            tasks.append({
                "keyword": q["keyword"],
                "location_code": q["location_code"],
                "language_code": q["language_code"],
                "device": "desktop",
                "os": "windows",
                "depth": 10,  # Top 10 results
                "tag": f"{q['country_code']}_{q['year']}_{q['metric']}"  # For tracking
            })
        
        async with self.semaphore:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        DATAFORSEO_SERP_POST,
                        auth=self.auth,
                        json=tasks,
                        timeout=60.0
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("tasks"):
                            for task in data["tasks"]:
                                if task.get("id"):
                                    task_ids.append(task["id"])
                                    
                                    # Store task metadata
                                    await self.db.serp_tasks.insert_one({
                                        "task_id": task["id"],
                                        "tag": task.get("data", {}).get("tag"),
                                        "status": "submitted",
                                        "created_at": datetime.now(timezone.utc)
                                    })
                    else:
                        print(f"DataForSEO API error: {response.status_code}")
                        print(response.text)
                        
            except Exception as e:
                print(f"Error submitting batch: {e}")
        
        return task_ids
    
    async def retrieve_results(self, task_id: str) -> Optional[Dict]:
        """
        Retrieve results for a completed task.
        """
        async with self.semaphore:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{DATAFORSEO_SERP_GET}/{task_id}",
                        auth=self.auth,
                        timeout=30.0
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("tasks") and len(data["tasks"]) > 0:
                            task = data["tasks"][0]
                            if task.get("result") and len(task["result"]) > 0:
                                return {
                                    "task_id": task_id,
                                    "items": task["result"][0].get("items", []),
                                    "se_results_count": task["result"][0].get("se_results_count", 0),
                                    "tag": task.get("data", {}).get("tag", "")
                                }
                    
            except Exception as e:
                print(f"Error retrieving results for {task_id}: {e}")
        
        return None
    
    def extract_number_from_text(self, text: str) -> Optional[int]:
        """
        Extract numerical value from SERP snippet text.
        """
        if not text:
            return None
            
        for pattern in NUMBER_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Get first match and clean it
                num_str = matches[0].replace(",", "")
                
                # Handle K notation (e.g., "107K")
                if "k" in text.lower():
                    try:
                        return int(float(num_str) * 1000)
                    except:
                        pass
                
                try:
                    return int(num_str)
                except:
                    pass
        
        return None
    
    def identify_authoritative_source(self, url: str, domain: str) -> bool:
        """
        Check if the source is authoritative (government, official).
        """
        authoritative_patterns = [
            ".gov", ".gc.ca", ".gov.uk", ".gov.au", ".go.jp",
            "who.int", "unodc.org", "cdc.gov", "health.gov",
            "ons.gov", "aihw.gov", "emcdda.europa"
        ]
        
        url_lower = (url or "").lower()
        domain_lower = (domain or "").lower()
        
        return any(p in url_lower or p in domain_lower for p in authoritative_patterns)
    
    async def process_results_and_verify(self, results: Dict) -> Dict:
        """
        Process SERP results and compare with database values.
        """
        verification = {
            "task_id": results["task_id"],
            "tag": results["tag"],
            "extracted_values": [],
            "authoritative_sources": [],
            "confidence": 0.0,
            "status": "processed"
        }
        
        # Parse tag to get country/year/metric
        tag_parts = results.get("tag", "").split("_")
        if len(tag_parts) >= 3:
            country_code = tag_parts[0]
            year = int(tag_parts[1])
            metric = tag_parts[2]
            
            verification["country_code"] = country_code
            verification["year"] = year
            verification["metric"] = metric
        
        # Extract values from SERP items
        for item in results.get("items", []):
            if item.get("type") == "organic":
                # Check snippet/description
                description = item.get("description", "")
                title = item.get("title", "")
                url = item.get("url", "")
                domain = item.get("domain", "")
                
                extracted = self.extract_number_from_text(description)
                if extracted:
                    is_authoritative = self.identify_authoritative_source(url, domain)
                    verification["extracted_values"].append({
                        "value": extracted,
                        "source_url": url,
                        "source_domain": domain,
                        "is_authoritative": is_authoritative,
                        "snippet": description[:200]
                    })
                    
                    if is_authoritative:
                        verification["authoritative_sources"].append({
                            "url": url,
                            "value": extracted
                        })
            
            # Check featured snippet (usually most reliable)
            elif item.get("type") == "featured_snippet":
                snippet_text = item.get("description", "")
                extracted = self.extract_number_from_text(snippet_text)
                if extracted:
                    verification["extracted_values"].insert(0, {  # Priority
                        "value": extracted,
                        "source_url": item.get("url", ""),
                        "source_domain": item.get("domain", ""),
                        "is_authoritative": True,
                        "snippet": snippet_text[:200],
                        "is_featured": True
                    })
        
        # Calculate confidence
        if verification["extracted_values"]:
            # Higher confidence if multiple sources agree
            values = [v["value"] for v in verification["extracted_values"]]
            unique_values = set(values)
            
            if len(unique_values) == 1:
                verification["confidence"] = 0.9 if verification["authoritative_sources"] else 0.7
            elif len(values) >= 3:
                # Most common value
                from collections import Counter
                most_common = Counter(values).most_common(1)[0]
                if most_common[1] >= 2:
                    verification["confidence"] = 0.6
                else:
                    verification["confidence"] = 0.3
            else:
                verification["confidence"] = 0.4
            
            # Boost if authoritative source
            if verification["authoritative_sources"]:
                verification["confidence"] = min(verification["confidence"] + 0.2, 1.0)
        
        return verification
    
    async def verify_and_update_database(self, verification: Dict) -> Dict:
        """
        Compare verified data with database and flag discrepancies.
        """
        result = {
            "country_code": verification.get("country_code"),
            "year": verification.get("year"),
            "metric": verification.get("metric"),
            "action": "none",
            "discrepancy": None
        }
        
        if not verification.get("extracted_values"):
            result["action"] = "no_data_found"
            return result
        
        # Get best extracted value (prefer authoritative sources)
        best_value = None
        if verification.get("authoritative_sources"):
            best_value = verification["authoritative_sources"][0]["value"]
        elif verification["extracted_values"]:
            best_value = verification["extracted_values"][0]["value"]
        
        if not best_value:
            result["action"] = "no_value_extracted"
            return result
        
        # Get database value
        db_field = "opioid_deaths" if verification["metric"] == "opioid_deaths" else "drug_overdose_deaths"
        
        db_record = await self.db.country_statistics.find_one({
            "country_code": verification["country_code"],
            "year": verification["year"]
        })
        
        if not db_record:
            result["action"] = "no_db_record"
            return result
        
        db_value = db_record.get(db_field)
        
        if db_value:
            # Calculate discrepancy
            diff_percent = abs(db_value - best_value) / best_value * 100 if best_value > 0 else 0
            
            if diff_percent > 50:
                result["action"] = "CRITICAL_DISCREPANCY"
                result["discrepancy"] = {
                    "db_value": db_value,
                    "serp_value": best_value,
                    "diff_percent": round(diff_percent, 1),
                    "confidence": verification["confidence"],
                    "sources": [s["url"] for s in verification.get("authoritative_sources", [])]
                }
                
                # Store discrepancy for review
                await self.db.serp_discrepancies.insert_one({
                    "country_code": verification["country_code"],
                    "year": verification["year"],
                    "metric": verification["metric"],
                    "db_value": db_value,
                    "serp_value": best_value,
                    "diff_percent": round(diff_percent, 1),
                    "confidence": verification["confidence"],
                    "sources": verification.get("authoritative_sources", []),
                    "created_at": datetime.now(timezone.utc),
                    "status": "pending_review"
                })
                
            elif diff_percent > 20:
                result["action"] = "WARNING_DISCREPANCY"
                result["discrepancy"] = {
                    "db_value": db_value,
                    "serp_value": best_value,
                    "diff_percent": round(diff_percent, 1)
                }
            else:
                result["action"] = "VERIFIED_OK"
                
                # Mark as SERP verified
                await self.db.country_statistics.update_one(
                    {"_id": db_record["_id"]},
                    {"$set": {
                        "serp_verified": True,
                        "serp_verified_at": datetime.now(timezone.utc),
                        "serp_value": best_value,
                        "serp_confidence": verification["confidence"]
                    }}
                )
        
        return result
    
    async def run_full_verification(self, limit: int = None) -> Dict:
        """
        Run full verification for all countries.
        
        This is a long-running operation that should be run in background.
        """
        report = {
            "started_at": datetime.now(timezone.utc).isoformat(),
            "status": "running",
            "queries_submitted": 0,
            "results_processed": 0,
            "verified_ok": 0,
            "critical_discrepancies": 0,
            "warnings": 0,
            "no_data": 0,
            "errors": []
        }
        
        # Generate queries
        queries = await self.generate_all_queries(years=[2022])  # Start with 2022
        
        if limit:
            queries = queries[:limit]
        
        report["total_queries"] = len(queries)
        
        # Submit in batches
        batch_size = 100
        all_task_ids = []
        
        for i in range(0, len(queries), batch_size):
            batch = queries[i:i + batch_size]
            task_ids = await self.submit_batch(batch)
            all_task_ids.extend(task_ids)
            report["queries_submitted"] += len(batch)
            
            # Rate limiting - wait between batches
            await asyncio.sleep(2)
        
        # Wait for results to be ready (DataForSEO Standard method)
        print(f"Submitted {len(all_task_ids)} tasks. Waiting for results...")
        await asyncio.sleep(60)  # Initial wait
        
        # Retrieve and process results
        for task_id in all_task_ids:
            try:
                results = await self.retrieve_results(task_id)
                
                if results:
                    verification = await self.process_results_and_verify(results)
                    update_result = await self.verify_and_update_database(verification)
                    
                    report["results_processed"] += 1
                    
                    if update_result["action"] == "VERIFIED_OK":
                        report["verified_ok"] += 1
                    elif update_result["action"] == "CRITICAL_DISCREPANCY":
                        report["critical_discrepancies"] += 1
                    elif update_result["action"] == "WARNING_DISCREPANCY":
                        report["warnings"] += 1
                    else:
                        report["no_data"] += 1
                
                # Rate limiting
                await asyncio.sleep(0.5)
                
            except Exception as e:
                report["errors"].append(str(e))
        
        report["completed_at"] = datetime.now(timezone.utc).isoformat()
        report["status"] = "completed"
        
        # Save report
        await self.db.serp_verification_reports.insert_one(report)
        
        return report


# Utility function to estimate cost
def estimate_dataforseo_cost(num_queries: int) -> Dict:
    """
    Estimate cost for DataForSEO queries.
    
    Pricing (approximate):
    - Standard method: ~$0.0015 per query
    - Live method: ~$0.003 per query
    """
    standard_cost = num_queries * 0.0015
    live_cost = num_queries * 0.003
    
    return {
        "num_queries": num_queries,
        "standard_method_cost": f"${standard_cost:.2f}",
        "live_method_cost": f"${live_cost:.2f}",
        "recommended": "standard" if num_queries > 100 else "live",
        "note": "Standard method is async (results in 1-10 min), Live is real-time"
    }


# Export
__all__ = [
    'DataForSEOVerifier',
    'estimate_dataforseo_cost',
    'QUERY_TEMPLATES',
    'COUNTRY_LOCATION_CODES'
]
