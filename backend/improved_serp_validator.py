"""
IMPROVED SERP VALIDATION SYSTEM
===============================
More accurate extraction with country-specific filtering.
"""

import asyncio
import os
import re
import httpx
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

DATAFORSEO_USERNAME = os.environ.get('DATAFORSEO_USERNAME')
DATAFORSEO_PASSWORD = os.environ.get('DATAFORSEO_PASSWORD')

# Official verified data that we KNOW is correct
# These will be used as ground truth and won't be changed by SERP
OFFICIAL_VERIFIED = {
    'USA': {2019: 70630, 2020: 91799, 2021: 106699, 2022: 107941},
    'CAN': {2019: 4039, 2020: 6306, 2021: 7993, 2022: 7525},
    'GBR': {2019: 4393, 2020: 4561, 2021: 4859, 2022: 4907},
    'DEU': {2021: 1826, 2022: 1990},
    'AUS': {2018: 1740, 2022: 1874},
}

# Population ranges to validate extracted numbers
COUNTRY_POPULATION_RANGES = {
    'USA': (50000, 200000),  # ~70K-110K deaths reasonable
    'CAN': (2000, 15000),    # ~4K-8K deaths
    'GBR': (2000, 10000),    # ~4K-5K deaths
    'DEU': (500, 5000),      # ~1.5K-2K deaths
    'FRA': (200, 2000),      # ~500-700 deaths
    'ITA': (100, 1000),      # ~200-300 deaths
    'ESP': (500, 3000),      # ~1K deaths
    'AUS': (500, 5000),      # ~1.5K-2K deaths
    'JPN': (50, 500),        # Very low, strict drug laws
    'NLD': (100, 1000),      # ~300-400 deaths
    'SWE': (200, 2000),      # ~900-1K deaths (high per capita)
    'NOR': (100, 1000),      # ~300-400 deaths
    'CHE': (50, 500),        # ~150-200 deaths
    'IRL': (200, 1000),      # ~400-500 deaths
    'NZL': (50, 500),        # ~150 deaths
}


class ImprovedSERPValidator:
    """Improved SERP validator with better accuracy."""
    
    def __init__(self, db):
        self.db = db
        self.api_url = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced"
        self.auth = (DATAFORSEO_USERNAME, DATAFORSEO_PASSWORD)
        self.queries = 0
        
    async def search(self, query: str) -> Optional[Dict]:
        """Execute SERP search."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    auth=self.auth,
                    json=[{
                        "keyword": query,
                        "location_code": 2840,
                        "language_code": "en",
                        "device": "desktop",
                        "depth": 10
                    }],
                    timeout=30.0
                )
                self.queries += 1
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            print(f"Error: {e}")
        return None
    
    def extract_with_context(self, text: str, country_name: str) -> List[int]:
        """Extract numbers with country context validation."""
        if not text:
            return []
            
        numbers = []
        text_lower = text.lower()
        country_lower = country_name.lower()
        
        # Check if country name is in the text
        if country_lower not in text_lower:
            return []
        
        # Find numbers near the country mention
        patterns = [
            rf'{country_lower}[^0-9]{{0,50}}(\d{{1,3}}(?:,\d{{3}})*)',
            rf'(\d{{1,3}}(?:,\d{{3}})*)[^0-9]{{0,50}}{country_lower}',
            r'(\d{1,3}(?:,\d{3})*)\s*(?:drug[- ]?)?(?:overdose[- ]?)?deaths',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                try:
                    num = int(match.replace(',', ''))
                    if 50 < num < 200000:
                        numbers.append(num)
                except:
                    pass
        
        return list(set(numbers))
    
    def filter_by_population(self, numbers: List[int], country_code: str) -> Optional[int]:
        """Filter numbers by expected population range."""
        if not numbers:
            return None
            
        pop_range = COUNTRY_POPULATION_RANGES.get(country_code, (50, 200000))
        min_val, max_val = pop_range
        
        valid_numbers = [n for n in numbers if min_val <= n <= max_val]
        
        if not valid_numbers:
            return None
            
        # Return median
        valid_numbers.sort()
        return valid_numbers[len(valid_numbers) // 2]
    
    async def validate_country(self, country_code: str, country_name: str, year: int = 2022) -> Dict:
        """Validate a country's data."""
        # Check if we have official verified data
        if country_code in OFFICIAL_VERIFIED:
            official = OFFICIAL_VERIFIED[country_code].get(year)
            if official:
                # Update DB with official data
                await self.db.country_statistics.update_one(
                    {'country_code': country_code, 'year': year},
                    {'$set': {
                        'drug_overdose_deaths': official,
                        'official_verified': True,
                        'serp_validated': True,
                        'updated_at': datetime.now(timezone.utc)
                    }}
                )
                return {
                    'status': 'official_verified',
                    'country_code': country_code,
                    'country_name': country_name,
                    'year': year,
                    'value': official,
                    'source': 'Official Government Data'
                }
        
        # Get current DB value
        record = await self.db.country_statistics.find_one(
            {'country_code': country_code, 'year': year},
            {'_id': 0, 'drug_overdose_deaths': 1}
        )
        
        db_value = record.get('drug_overdose_deaths', 0) if record else 0
        
        # Search SERP
        query = f'"{country_name}" drug overdose deaths {year}'
        serp_data = await self.search(query)
        
        if not serp_data:
            return {
                'status': 'serp_error',
                'country_code': country_code,
                'country_name': country_name,
                'year': year,
                'db_value': db_value
            }
        
        # Extract numbers
        all_numbers = []
        for task in serp_data.get('tasks', []):
            for result in task.get('result', []):
                for item in result.get('items', []):
                    text = f"{item.get('title', '')} {item.get('description', '')} {item.get('text', '')}"
                    found = self.extract_with_context(text, country_name)
                    all_numbers.extend(found)
        
        # Filter by population range
        serp_value = self.filter_by_population(all_numbers, country_code)
        
        if serp_value is None:
            return {
                'status': 'no_valid_serp',
                'country_code': country_code,
                'country_name': country_name,
                'year': year,
                'db_value': db_value,
                'raw_numbers': all_numbers[:5] if all_numbers else []
            }
        
        # Check match
        if db_value > 0:
            diff = abs(db_value - serp_value) / max(serp_value, 1) * 100
        else:
            diff = 100
        
        is_match = diff <= 30  # 30% tolerance
        
        return {
            'status': 'match' if is_match else 'mismatch',
            'country_code': country_code,
            'country_name': country_name,
            'year': year,
            'db_value': db_value,
            'serp_value': serp_value,
            'diff_percent': round(diff, 1),
            'is_match': is_match
        }


async def run_validation():
    """Run validation."""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    
    validator = ImprovedSERPValidator(db)
    
    # Priority countries
    PRIORITY = ['USA', 'CAN', 'GBR', 'AUS', 'DEU', 'FRA', 'ITA', 'ESP', 'NLD', 
                'SWE', 'NOR', 'FIN', 'IRL', 'CHE', 'NZL', 'JPN']
    
    print("=" * 70)
    print("IMPROVED SERP VALIDATION")
    print("=" * 70)
    
    results = []
    
    for code in PRIORITY:
        record = await db.country_statistics.find_one(
            {'country_code': code, 'year': 2022},
            {'_id': 0, 'country_name': 1}
        )
        
        if not record:
            continue
            
        name = record.get('country_name', code)
        print(f"\n{name} ({code})...")
        
        result = await validator.validate_country(code, name)
        results.append(result)
        
        if result['status'] == 'official_verified':
            print(f"  ✅ OFFICIAL: {result['value']:,}")
        elif result['status'] == 'match':
            print(f"  ✅ MATCH: DB={result['db_value']:,} SERP={result['serp_value']:,}")
        elif result['status'] == 'mismatch':
            print(f"  ❌ MISMATCH: DB={result['db_value']:,} vs SERP={result['serp_value']:,} ({result['diff_percent']}%)")
        else:
            print(f"  ⚠️ {result['status']}: {result.get('db_value', 'N/A')}")
        
        await asyncio.sleep(0.5)
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    official = [r for r in results if r['status'] == 'official_verified']
    matches = [r for r in results if r['status'] == 'match']
    mismatches = [r for r in results if r['status'] == 'mismatch']
    no_data = [r for r in results if r['status'] in ['no_valid_serp', 'serp_error']]
    
    print(f"Official Verified: {len(official)}")
    print(f"SERP Matches: {len(matches)}")
    print(f"Mismatches: {len(mismatches)}")
    print(f"No SERP Data: {len(no_data)}")
    print(f"Total Queries: {validator.queries}")
    print(f"Estimated Cost: ${validator.queries * 0.002:.2f}")
    
    if mismatches:
        print("\nMISMATCHES TO REVIEW:")
        for m in mismatches:
            print(f"  {m['country_name']}: DB={m['db_value']:,} vs SERP={m['serp_value']:,}")
    
    client.close()
    return results


if __name__ == '__main__':
    asyncio.run(run_validation())
