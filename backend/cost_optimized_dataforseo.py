"""
COST-OPTIMIZED DATAFORSEO VERIFICATION SYSTEM
==============================================
Minimizes API costs while maximizing data accuracy.

Cost Optimization Strategies:
1. Skip countries already verified (UNODC, manual)
2. Prioritize high-traffic countries first
3. Validate extracted numbers against population (sanity check)
4. Cache results to prevent duplicate queries
5. Use targeted queries with country name prominent
6. Skip small countries where official data unlikely exists
7. Batch processing to reduce API overhead

Pricing: ~$0.0015 per query (Standard method)
"""

import asyncio
import os
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import httpx

load_dotenv()

# High-priority countries (high traffic, reliable data exists)
HIGH_PRIORITY_COUNTRIES = [
    "USA", "CAN", "GBR", "AUS", "DEU", "FRA", "JPN", "IND", "BRA", "MEX",
    "ESP", "ITA", "NLD", "CHE", "SWE", "NOR", "DNK", "FIN", "BEL", "AUT",
    "RUS", "CHN", "KOR", "POL", "PRT", "IRL", "NZL", "ZAF", "ARG", "CHL",
    "COL", "THA", "MYS", "SGP", "PHL", "IDN", "VNM", "PAK", "IRN", "TUR"
]

# Countries to skip (small populations, no reliable drug death data)
SKIP_COUNTRIES = [
    # Small island nations (population < 100k, no drug death reporting)
    "AND", "ATG", "BRB", "BRN", "CPV", "COM", "DMA", "FSM", "GRD", "KIR",
    "LIE", "MCO", "MHL", "NRU", "PLW", "KNA", "LCA", "VCT", "SMR", "STP",
    "SYC", "TUV", "VUT", "WSM",
    # Countries with no reliable health statistics
    "PRK", "SOM", "SSD", "SYR", "YEM", "ERI", "TKM"
]

# Maximum deaths per 100k population (sanity check)
# USA has ~32 per 100k, most countries are <20
MAX_DEATH_RATE_PER_100K = 50


class CostOptimizedDataForSEO:
    """
    Cost-optimized DataForSEO SERP verification.
    """
    
    BASE_URL = "https://api.dataforseo.com/v3"
    
    def __init__(self, username: str, password: str, db):
        self.username = username
        self.password = password
        self.db = db
        self.auth = (username, password)
        self.query_cache: Set[str] = set()
        self.cost_tracker = {
            "queries_submitted": 0,
            "queries_skipped_verified": 0,
            "queries_skipped_cached": 0,
            "queries_skipped_small": 0,
            "estimated_cost": 0.0
        }
    
    async def get_unverified_countries(self, year: int = 2022) -> List[Dict]:
        """
        Get list of countries that need verification.
        Excludes already verified and small/skip countries.
        """
        # Get all countries for the year
        cursor = self.db.country_statistics.find(
            {"year": year},
            {"_id": 0, "country_code": 1, "country_name": 1, "population": 1,
             "data_verified": 1, "unodc_verified": 1, "serp_verified": 1}
        )
        all_countries = await cursor.to_list(length=500)
        
        unverified = []
        for country in all_countries:
            code = country.get("country_code")
            
            # Skip if already verified
            if country.get("data_verified") or country.get("unodc_verified") or country.get("serp_verified"):
                self.cost_tracker["queries_skipped_verified"] += 1
                continue
            
            # Skip small/problematic countries
            if code in SKIP_COUNTRIES:
                self.cost_tracker["queries_skipped_small"] += 1
                continue
            
            unverified.append(country)
        
        # Sort by priority (high priority first)
        def priority_key(c):
            code = c.get("country_code")
            if code in HIGH_PRIORITY_COUNTRIES:
                return HIGH_PRIORITY_COUNTRIES.index(code)
            return 1000  # Low priority
        
        unverified.sort(key=priority_key)
        
        return unverified
    
    def build_targeted_query(self, country_name: str, year: int, metric: str) -> str:
        """
        Build a targeted search query that's more likely to return country-specific data.
        """
        if metric == "opioid_deaths":
            return f'"{country_name}" opioid overdose deaths {year} official statistics -USA -United States'
        elif metric == "drug_overdose_deaths":
            return f'"{country_name}" drug overdose deaths {year} government statistics -USA -United States'
        else:
            return f'"{country_name}" drug deaths {year}'
    
    def validate_extracted_value(self, value: int, country: Dict, metric: str) -> bool:
        """
        Sanity check: Validate extracted value against population.
        Returns True if value seems reasonable.
        """
        population = country.get("population", 0)
        
        if population <= 0:
            return False
        
        # Calculate death rate per 100k
        rate_per_100k = (value / population) * 100000
        
        # Reject if rate is impossibly high
        if rate_per_100k > MAX_DEATH_RATE_PER_100K:
            return False
        
        # Reject if value is larger than population
        if value > population:
            return False
        
        # Reject obvious global numbers being misattributed
        # (91799, 107941, 100000 are common false positives)
        global_numbers = {91799, 107941, 100000, 106699, 70630, 68630, 80411}
        if value in global_numbers and population < 50000000:
            return False
        
        return True
    
    async def submit_optimized_batch(self, countries: List[Dict], year: int = 2022) -> Dict:
        """
        Submit an optimized batch of queries.
        Only queries what's needed, validates results.
        """
        report = {
            "started_at": datetime.now(timezone.utc).isoformat(),
            "year": year,
            "queries_submitted": 0,
            "results_valid": 0,
            "results_invalid": 0,
            "cost": 0.0,
            "countries_processed": [],
            "errors": []
        }
        
        tasks_to_submit = []
        task_metadata = []
        
        for country in countries:
            code = country.get("country_code")
            name = country.get("country_name")
            
            # Only query opioid_deaths (most important metric)
            query = self.build_targeted_query(name, year, "opioid_deaths")
            
            # Check cache
            cache_key = f"{code}_{year}_opioid_deaths"
            if cache_key in self.query_cache:
                self.cost_tracker["queries_skipped_cached"] += 1
                continue
            
            self.query_cache.add(cache_key)
            
            tasks_to_submit.append({
                "keyword": query,
                "location_code": 2840,  # Default to US location for English results
                "language_code": "en",
                "device": "desktop",
                "depth": 5,  # Only top 5 results (cheaper)
                "tag": f"{code}_{year}_opioid_deaths"
            })
            
            task_metadata.append({
                "country": country,
                "metric": "opioid_deaths"
            })
        
        if not tasks_to_submit:
            report["message"] = "No queries needed - all countries already verified or cached"
            return report
        
        # Submit batch (max 100 per request)
        batch_size = 100
        all_task_ids = []
        
        for i in range(0, len(tasks_to_submit), batch_size):
            batch = tasks_to_submit[i:i + batch_size]
            
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.BASE_URL}/serp/google/organic/task_post",
                        auth=self.auth,
                        json=batch,
                        timeout=60.0
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        for task in data.get("tasks", []):
                            if task.get("id"):
                                all_task_ids.append(task["id"])
                                report["queries_submitted"] += 1
                                self.cost_tracker["queries_submitted"] += 1
                    else:
                        report["errors"].append(f"API error: {response.status_code}")
                        
            except Exception as e:
                report["errors"].append(str(e))
            
            # Rate limit between batches
            await asyncio.sleep(1)
        
        report["cost"] = report["queries_submitted"] * 0.0015
        self.cost_tracker["estimated_cost"] += report["cost"]
        
        # Wait for results
        await asyncio.sleep(30)  # DataForSEO Standard method needs time
        
        # Retrieve and validate results
        for task_id in all_task_ids:
            try:
                result = await self._retrieve_and_validate(task_id, task_metadata)
                if result.get("valid"):
                    report["results_valid"] += 1
                    report["countries_processed"].append(result)
                else:
                    report["results_invalid"] += 1
                    
            except Exception as e:
                report["errors"].append(f"Task {task_id}: {str(e)}")
            
            await asyncio.sleep(0.5)  # Rate limit
        
        report["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        return report
    
    async def _retrieve_and_validate(self, task_id: str, metadata: List[Dict]) -> Dict:
        """
        Retrieve task result and validate extracted value.
        """
        result = {
            "task_id": task_id,
            "valid": False,
            "extracted_value": None,
            "country_code": None
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/serp/google/organic/task_get/advanced/{task_id}",
                    auth=self.auth,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data.get("tasks") and len(data["tasks"]) > 0:
                        task = data["tasks"][0]
                        tag = task.get("data", {}).get("tag", "")
                        
                        # Parse tag to get country code
                        parts = tag.split("_")
                        if len(parts) >= 1:
                            result["country_code"] = parts[0]
                        
                        # Find matching country metadata
                        country = None
                        for m in metadata:
                            if m.get("country", {}).get("country_code") == result["country_code"]:
                                country = m["country"]
                                break
                        
                        # Extract numbers from results
                        if task.get("result") and len(task["result"]) > 0:
                            items = task["result"][0].get("items", [])
                            
                            for item in items:
                                if item.get("type") == "organic":
                                    description = item.get("description", "")
                                    extracted = self._extract_number(description)
                                    
                                    if extracted and country:
                                        # Validate the extracted value
                                        if self.validate_extracted_value(extracted, country, "opioid_deaths"):
                                            result["extracted_value"] = extracted
                                            result["valid"] = True
                                            result["source_url"] = item.get("url")
                                            
                                            # Update database
                                            await self._update_verified_data(
                                                result["country_code"],
                                                2022,
                                                "opioid_deaths",
                                                extracted,
                                                item.get("url")
                                            )
                                            break
                                            
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def _extract_number(self, text: str) -> Optional[int]:
        """
        Extract death count from text.
        """
        if not text:
            return None
        
        patterns = [
            r'(\d{1,3}(?:,\d{3})*)\s*(?:opioid|drug)?\s*(?:overdose)?\s*deaths?',
            r'(\d{1,3}(?:,\d{3})*)\s*people\s*died',
            r'recorded\s*(\d{1,3}(?:,\d{3})*)\s*deaths?',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    return int(matches[0].replace(",", ""))
                except:
                    pass
        
        return None
    
    async def _update_verified_data(self, country_code: str, year: int, metric: str, 
                                     value: int, source_url: str):
        """
        Update database with SERP-verified data.
        """
        field = "opioid_deaths" if metric == "opioid_deaths" else "drug_overdose_deaths"
        
        await self.db.country_statistics.update_one(
            {"country_code": country_code, "year": year},
            {"$set": {
                field: value,
                "serp_verified": True,
                "serp_verified_at": datetime.now(timezone.utc),
                "serp_source_url": source_url,
                "data_verified": True
            }}
        )
    
    async def get_cost_summary(self) -> Dict:
        """
        Get cost tracking summary.
        """
        return {
            "queries_submitted": self.cost_tracker["queries_submitted"],
            "queries_skipped": {
                "already_verified": self.cost_tracker["queries_skipped_verified"],
                "cached": self.cost_tracker["queries_skipped_cached"],
                "small_countries": self.cost_tracker["queries_skipped_small"]
            },
            "total_skipped": (
                self.cost_tracker["queries_skipped_verified"] +
                self.cost_tracker["queries_skipped_cached"] +
                self.cost_tracker["queries_skipped_small"]
            ),
            "estimated_cost_usd": round(self.cost_tracker["estimated_cost"], 4),
            "cost_per_query_usd": 0.0015,
            "savings_from_optimization": f"${round(self.cost_tracker['queries_skipped_verified'] * 0.0015, 2)}"
        }
    
    async def run_optimized_verification(self, max_queries: int = 100) -> Dict:
        """
        Run cost-optimized verification.
        
        Args:
            max_queries: Maximum queries to run (cost control)
        """
        report = {
            "started_at": datetime.now(timezone.utc).isoformat(),
            "max_queries": max_queries,
            "estimated_max_cost": f"${max_queries * 0.0015:.2f}"
        }
        
        # Get unverified countries
        unverified = await self.get_unverified_countries(2022)
        
        report["unverified_countries_found"] = len(unverified)
        report["countries_to_process"] = min(len(unverified), max_queries)
        
        if not unverified:
            report["status"] = "complete"
            report["message"] = "All countries already verified!"
            return report
        
        # Process only up to max_queries
        to_process = unverified[:max_queries]
        
        # Run optimized batch
        batch_result = await self.submit_optimized_batch(to_process, 2022)
        
        report["batch_result"] = batch_result
        report["cost_summary"] = await self.get_cost_summary()
        report["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        return report


async def estimate_verification_cost(db) -> Dict:
    """
    Estimate cost to verify all remaining countries.
    """
    # Count unverified
    total = await db.country_statistics.count_documents({"year": 2022})
    verified = await db.country_statistics.count_documents({
        "year": 2022,
        "$or": [
            {"data_verified": True},
            {"unodc_verified": True},
            {"serp_verified": True}
        ]
    })
    
    unverified = total - verified
    
    # Subtract skip countries
    skip_count = await db.country_statistics.count_documents({
        "year": 2022,
        "country_code": {"$in": SKIP_COUNTRIES}
    })
    
    actual_to_verify = unverified - skip_count
    
    return {
        "total_countries_2022": total,
        "already_verified": verified,
        "skip_countries": skip_count,
        "need_verification": actual_to_verify,
        "queries_needed": actual_to_verify,  # 1 query per country (optimized)
        "estimated_cost_usd": round(actual_to_verify * 0.0015, 2),
        "vs_naive_approach": {
            "naive_queries": unverified * 3 * 7,  # 3 metrics × 7 years
            "naive_cost": round(unverified * 3 * 7 * 0.0015, 2),
            "savings": f"${round((unverified * 3 * 7 - actual_to_verify) * 0.0015, 2)}"
        }
    }


# Export
__all__ = [
    'CostOptimizedDataForSEO',
    'estimate_verification_cost',
    'HIGH_PRIORITY_COUNTRIES',
    'SKIP_COUNTRIES'
]
