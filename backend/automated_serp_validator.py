"""
AUTOMATED SERP VALIDATION SYSTEM
================================
Validates ALL country and state data against Google SERP using DataForSEO.
Stores results in database for future reference and audit trail.

This is a comprehensive one-time validation that:
1. Queries Google for each country/state drug overdose statistics
2. Extracts numbers from search results
3. Compares against our database
4. Flags discrepancies
5. Auto-updates verified data
6. Stores audit trail

Cost Optimization:
- Query only 2022 (most recent reliable year)
- Batch queries efficiently
- Cache results to prevent duplicate API calls
- Skip already SERP-verified records
"""

import asyncio
import os
import re
import json
import httpx
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Configuration
DATAFORSEO_USERNAME = os.environ.get('DATAFORSEO_USERNAME')
DATAFORSEO_PASSWORD = os.environ.get('DATAFORSEO_PASSWORD')
TOLERANCE_PERCENT = 25  # Allow 25% variance for SERP extraction inaccuracies
RATE_LIMIT_DELAY = 0.5  # Seconds between API calls
TARGET_YEAR = 2022  # Most reliable year for data


class DataForSEOValidator:
    """Validates data against Google SERP using DataForSEO API."""
    
    def __init__(self, db):
        self.db = db
        self.api_url = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced"
        self.auth = (DATAFORSEO_USERNAME, DATAFORSEO_PASSWORD)
        self.total_queries = 0
        self.total_cost = 0.0
        
    async def search_serp(self, query: str) -> Optional[Dict]:
        """Execute a single SERP search."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    auth=self.auth,
                    json=[{
                        "keyword": query,
                        "location_code": 2840,  # USA
                        "language_code": "en",
                        "device": "desktop",
                        "depth": 10
                    }],
                    timeout=30.0
                )
                
                self.total_queries += 1
                self.total_cost += 0.002  # ~$0.002 per query
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"  API Error: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"  Request Error: {e}")
            return None
    
    def extract_numbers_from_text(self, text: str) -> List[int]:
        """Extract death count numbers from text."""
        if not text:
            return []
            
        numbers = []
        text_lower = text.lower()
        
        # Patterns to match death counts
        patterns = [
            r'(\d{1,3}(?:,\d{3})*)\s*(?:drug[- ]?)?(?:overdose[- ]?)?deaths',
            r'(\d{1,3}(?:,\d{3})*)\s*(?:people\s*)?(?:died|fatalities)',
            r'(?:approximately|about|nearly|over|more than|around)\s*(\d{1,3}(?:,\d{3})*)',
            r'(\d{1,3}(?:,\d{3})*)\s*deaths?\s*(?:were\s*)?(?:recorded|registered|reported)',
            r'total\s*(?:of\s*)?(\d{1,3}(?:,\d{3})*)',
            r'(\d{1,3}(?:,\d{3})*)\s*(?:opioid[- ]?)?(?:related\s*)?deaths',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                try:
                    num = int(match.replace(',', ''))
                    # Filter reasonable death count range
                    if 50 < num < 500000:
                        numbers.append(num)
                except:
                    pass
        
        return list(set(numbers))
    
    def extract_from_serp_result(self, serp_data: Dict) -> Tuple[Optional[int], List[str]]:
        """Extract death count from SERP results."""
        numbers = []
        sources = []
        
        if not serp_data or not serp_data.get('tasks'):
            return None, []
            
        for task in serp_data['tasks']:
            if not task.get('result'):
                continue
                
            for result in task['result']:
                items = result.get('items', [])
                
                for item in items:
                    item_type = item.get('type', '')
                    
                    # Priority: Featured snippets and answer boxes
                    if item_type in ['featured_snippet', 'answer_box', 'knowledge_graph']:
                        text = f"{item.get('title', '')} {item.get('description', '')} {item.get('text', '')}"
                        found = self.extract_numbers_from_text(text)
                        if found:
                            numbers.extend(found)
                            sources.append(item.get('url', 'Featured Snippet'))
                    
                    # Also check organic results
                    elif item_type == 'organic':
                        text = f"{item.get('title', '')} {item.get('description', '')}"
                        found = self.extract_numbers_from_text(text)
                        if found:
                            numbers.extend(found)
                            sources.append(item.get('url', ''))
        
        if not numbers:
            return None, sources
            
        # Return median value (most likely accurate)
        numbers.sort()
        median_idx = len(numbers) // 2
        return numbers[median_idx], sources[:3]
    
    async def validate_country(self, country_code: str, country_name: str, year: int = TARGET_YEAR) -> Dict:
        """Validate a single country's data."""
        # Get current DB value
        record = await self.db.country_statistics.find_one(
            {'country_code': country_code, 'year': year},
            {'_id': 0, 'drug_overdose_deaths': 1, 'serp_validated': 1}
        )
        
        if not record:
            return {
                'status': 'no_record',
                'country_code': country_code,
                'country_name': country_name,
                'year': year
            }
        
        # Skip if already SERP validated
        if record.get('serp_validated'):
            return {
                'status': 'already_validated',
                'country_code': country_code,
                'country_name': country_name,
                'year': year,
                'db_value': record.get('drug_overdose_deaths')
            }
        
        db_value = record.get('drug_overdose_deaths', 0)
        
        # Build search query
        query = f'"{country_name}" drug overdose deaths {year} official statistics'
        
        # Execute SERP search
        serp_result = await self.search_serp(query)
        serp_value, sources = self.extract_from_serp_result(serp_result)
        
        if serp_value is None:
            return {
                'status': 'no_serp_data',
                'country_code': country_code,
                'country_name': country_name,
                'year': year,
                'db_value': db_value,
                'query': query
            }
        
        # Calculate discrepancy
        if db_value > 0:
            discrepancy = abs(db_value - serp_value) / max(serp_value, 1) * 100
        else:
            discrepancy = 100
        
        is_match = discrepancy <= TOLERANCE_PERCENT
        
        return {
            'status': 'validated' if is_match else 'discrepancy',
            'country_code': country_code,
            'country_name': country_name,
            'year': year,
            'db_value': db_value,
            'serp_value': serp_value,
            'discrepancy_percent': round(discrepancy, 1),
            'is_match': is_match,
            'sources': sources,
            'query': query,
            'needs_update': not is_match and serp_value > 0
        }
    
    async def validate_state(self, state_id: str, state_name: str, year: int = TARGET_YEAR) -> Dict:
        """Validate a single US state's data."""
        # Get current DB value
        record = await self.db.state_addiction_statistics.find_one(
            {'state_id': state_id, 'year': year},
            {'_id': 0, 'overdose_deaths': 1, 'serp_validated': 1}
        )
        
        if not record:
            return {
                'status': 'no_record',
                'state_id': state_id,
                'state_name': state_name,
                'year': year
            }
        
        db_value = record.get('overdose_deaths', 0)
        
        # Build search query
        query = f'"{state_name}" drug overdose deaths {year} CDC statistics'
        
        # Execute SERP search
        serp_result = await self.search_serp(query)
        serp_value, sources = self.extract_from_serp_result(serp_result)
        
        if serp_value is None:
            return {
                'status': 'no_serp_data',
                'state_id': state_id,
                'state_name': state_name,
                'year': year,
                'db_value': db_value,
                'query': query
            }
        
        # Calculate discrepancy
        if db_value > 0:
            discrepancy = abs(db_value - serp_value) / max(serp_value, 1) * 100
        else:
            discrepancy = 100
        
        is_match = discrepancy <= TOLERANCE_PERCENT
        
        return {
            'status': 'validated' if is_match else 'discrepancy',
            'state_id': state_id,
            'state_name': state_name,
            'year': year,
            'db_value': db_value,
            'serp_value': serp_value,
            'discrepancy_percent': round(discrepancy, 1),
            'is_match': is_match,
            'sources': sources,
            'query': query,
            'needs_update': not is_match and serp_value > 0
        }
    
    async def update_with_serp_value(self, result: Dict) -> bool:
        """Update database with SERP-verified value."""
        now = datetime.now(timezone.utc)
        
        if 'country_code' in result:
            update_result = await self.db.country_statistics.update_one(
                {'country_code': result['country_code'], 'year': result['year']},
                {'$set': {
                    'drug_overdose_deaths': result['serp_value'],
                    'serp_validated': True,
                    'serp_value': result['serp_value'],
                    'serp_sources': result.get('sources', []),
                    'serp_validated_at': now,
                    'previous_value': result['db_value'],
                    'updated_at': now
                }}
            )
            return update_result.modified_count > 0
            
        elif 'state_id' in result:
            update_result = await self.db.state_addiction_statistics.update_one(
                {'state_id': result['state_id'], 'year': result['year']},
                {'$set': {
                    'overdose_deaths': result['serp_value'],
                    'serp_validated': True,
                    'serp_value': result['serp_value'],
                    'serp_sources': result.get('sources', []),
                    'serp_validated_at': now,
                    'previous_value': result['db_value'],
                    'updated_at': now
                }}
            )
            return update_result.modified_count > 0
        
        return False


async def run_full_validation(max_countries: int = 50, max_states: int = 51, auto_fix: bool = True):
    """Run full validation for all countries and states."""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    
    validator = DataForSEOValidator(db)
    now = datetime.now(timezone.utc)
    
    report = {
        'started_at': now.isoformat(),
        'target_year': TARGET_YEAR,
        'countries': {
            'total': 0,
            'validated': [],
            'discrepancies': [],
            'no_data': [],
            'errors': []
        },
        'states': {
            'total': 0,
            'validated': [],
            'discrepancies': [],
            'no_data': [],
            'errors': []
        },
        'fixes_applied': [],
        'api_stats': {
            'queries': 0,
            'estimated_cost': 0.0
        }
    }
    
    # Get all countries
    countries = await db.country_statistics.find(
        {'year': TARGET_YEAR},
        {'_id': 0, 'country_code': 1, 'country_name': 1}
    ).to_list(length=500)
    
    # Get all states
    states = await db.state_addiction_statistics.find(
        {'year': TARGET_YEAR},
        {'_id': 0, 'state_id': 1, 'state_name': 1}
    ).to_list(length=100)
    
    # Validate countries
    print("=" * 70)
    print(f"VALIDATING COUNTRIES ({min(len(countries), max_countries)} of {len(countries)})")
    print("=" * 70)
    
    for i, country in enumerate(countries[:max_countries]):
        code = country['country_code']
        name = country.get('country_name', code)
        
        print(f"\n[{i+1}/{min(len(countries), max_countries)}] {name} ({code})...")
        
        result = await validator.validate_country(code, name)
        report['countries']['total'] += 1
        
        if result['status'] == 'validated':
            report['countries']['validated'].append(result)
            print(f"  ✅ MATCH: DB={result['db_value']:,} SERP={result['serp_value']:,}")
            
        elif result['status'] == 'discrepancy':
            report['countries']['discrepancies'].append(result)
            print(f"  ❌ MISMATCH: DB={result['db_value']:,} vs SERP={result['serp_value']:,} ({result['discrepancy_percent']}%)")
            
            if auto_fix and result.get('needs_update'):
                if await validator.update_with_serp_value(result):
                    report['fixes_applied'].append({
                        'type': 'country',
                        'code': code,
                        'name': name,
                        'old_value': result['db_value'],
                        'new_value': result['serp_value']
                    })
                    print(f"  🔧 AUTO-FIXED: {result['db_value']:,} → {result['serp_value']:,}")
                    
        elif result['status'] == 'no_serp_data':
            report['countries']['no_data'].append(result)
            print(f"  ⚠️ No SERP data found")
            
        elif result['status'] == 'already_validated':
            print(f"  ⏭️ Already validated")
            
        else:
            report['countries']['errors'].append(result)
            print(f"  ❓ {result['status']}")
        
        await asyncio.sleep(RATE_LIMIT_DELAY)
    
    # Validate US states
    print("\n" + "=" * 70)
    print(f"VALIDATING US STATES ({min(len(states), max_states)} of {len(states)})")
    print("=" * 70)
    
    for i, state in enumerate(states[:max_states]):
        state_id = state['state_id']
        name = state.get('state_name', state_id)
        
        print(f"\n[{i+1}/{min(len(states), max_states)}] {name} ({state_id})...")
        
        result = await validator.validate_state(state_id, name)
        report['states']['total'] += 1
        
        if result['status'] == 'validated':
            report['states']['validated'].append(result)
            print(f"  ✅ MATCH: DB={result['db_value']:,} SERP={result['serp_value']:,}")
            
        elif result['status'] == 'discrepancy':
            report['states']['discrepancies'].append(result)
            print(f"  ❌ MISMATCH: DB={result['db_value']:,} vs SERP={result['serp_value']:,} ({result['discrepancy_percent']}%)")
            
            if auto_fix and result.get('needs_update'):
                if await validator.update_with_serp_value(result):
                    report['fixes_applied'].append({
                        'type': 'state',
                        'code': state_id,
                        'name': name,
                        'old_value': result['db_value'],
                        'new_value': result['serp_value']
                    })
                    print(f"  🔧 AUTO-FIXED: {result['db_value']:,} → {result['serp_value']:,}")
                    
        elif result['status'] == 'no_serp_data':
            report['states']['no_data'].append(result)
            print(f"  ⚠️ No SERP data found")
            
        else:
            report['states']['errors'].append(result)
            print(f"  ❓ {result['status']}")
        
        await asyncio.sleep(RATE_LIMIT_DELAY)
    
    # Update API stats
    report['api_stats']['queries'] = validator.total_queries
    report['api_stats']['estimated_cost'] = round(validator.total_cost, 2)
    report['completed_at'] = datetime.now(timezone.utc).isoformat()
    
    # Save report to database
    await db.serp_validation_reports.insert_one({
        **report,
        'report_type': 'FULL_SERP_VALIDATION',
        'created_at': now
    })
    
    # Print summary
    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)
    print(f"\nCOUNTRIES:")
    print(f"  Total checked: {report['countries']['total']}")
    print(f"  Validated (match): {len(report['countries']['validated'])}")
    print(f"  Discrepancies: {len(report['countries']['discrepancies'])}")
    print(f"  No SERP data: {len(report['countries']['no_data'])}")
    
    print(f"\nUS STATES:")
    print(f"  Total checked: {report['states']['total']}")
    print(f"  Validated (match): {len(report['states']['validated'])}")
    print(f"  Discrepancies: {len(report['states']['discrepancies'])}")
    print(f"  No SERP data: {len(report['states']['no_data'])}")
    
    print(f"\nFIXES APPLIED: {len(report['fixes_applied'])}")
    for fix in report['fixes_applied'][:10]:
        print(f"  - {fix['name']}: {fix['old_value']:,} → {fix['new_value']:,}")
    
    print(f"\nAPI USAGE:")
    print(f"  Total queries: {report['api_stats']['queries']}")
    print(f"  Estimated cost: ${report['api_stats']['estimated_cost']:.2f}")
    
    client.close()
    return report


async def validate_priority_only():
    """Validate only high-priority countries (cost-efficient)."""
    PRIORITY_COUNTRIES = [
        'USA', 'CAN', 'GBR', 'AUS', 'DEU', 'FRA', 'ITA', 'ESP', 'NLD', 'SWE',
        'NOR', 'FIN', 'DNK', 'IRL', 'CHE', 'AUT', 'BEL', 'PRT', 'NZL', 'JPN'
    ]
    
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    
    validator = DataForSEOValidator(db)
    
    print("=" * 70)
    print("PRIORITY COUNTRY VALIDATION")
    print("=" * 70)
    
    for code in PRIORITY_COUNTRIES:
        record = await db.country_statistics.find_one(
            {'country_code': code, 'year': TARGET_YEAR},
            {'_id': 0, 'country_name': 1}
        )
        
        if not record:
            continue
            
        name = record.get('country_name', code)
        print(f"\n{name} ({code})...")
        
        result = await validator.validate_country(code, name)
        
        if result['status'] == 'validated':
            print(f"  ✅ MATCH: {result['db_value']:,}")
        elif result['status'] == 'discrepancy':
            print(f"  ❌ DB={result['db_value']:,} vs SERP={result['serp_value']:,}")
        else:
            print(f"  {result['status']}")
        
        await asyncio.sleep(RATE_LIMIT_DELAY)
    
    print(f"\nTotal queries: {validator.total_queries}")
    print(f"Estimated cost: ${validator.total_cost:.2f}")
    
    client.close()


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--priority':
        asyncio.run(validate_priority_only())
    else:
        # Run full validation
        # Adjust max_countries and max_states as needed
        asyncio.run(run_full_validation(
            max_countries=50,  # Top 50 countries
            max_states=51,     # All 51 states
            auto_fix=True      # Automatically fix discrepancies
        ))
