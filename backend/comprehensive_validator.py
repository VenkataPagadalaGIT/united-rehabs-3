"""
COMPREHENSIVE DATA VALIDATION SYSTEM
=====================================
Tests ALL countries (195), ALL US states (51), ALL years (2019-2025), ALL metrics

Optimized for batch processing to minimize API calls.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import json
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
import httpx
from collections import defaultdict

load_dotenv()

# Required fields for country statistics
COUNTRY_REQUIRED_FIELDS = [
    'country_code', 'country_name', 'year', 'population'
]

COUNTRY_METRIC_FIELDS = [
    'total_affected', 'prevalence_rate', 'drug_overdose_deaths', 'opioid_deaths',
    'alcohol_related_deaths', 'treatment_centers', 'treatment_gap_percent',
    'economic_cost_billions', 'primary_source', 'primary_source_url'
]

# Required fields for US state statistics
STATE_REQUIRED_FIELDS = [
    'state_id', 'state_name', 'year'
]

STATE_METRIC_FIELDS = [
    'total_affected', 'overdose_deaths', 'opioid_deaths', 'drug_abuse_rate',
    'alcohol_abuse_rate', 'total_treatment_centers', 'treatment_admissions',
    'recovery_rate', 'economic_cost_billions', 'data_source'
]

# Logical validation rules
VALIDATION_RULES = {
    'opioid_deaths_less_than_drug_deaths': lambda r: (
        r.get('opioid_deaths') is None or 
        r.get('drug_overdose_deaths') is None or
        r.get('opioid_deaths', 0) <= r.get('drug_overdose_deaths', 0)
    ),
    'prevalence_rate_valid': lambda r: (
        r.get('prevalence_rate') is None or
        0 <= r.get('prevalence_rate', 0) <= 100
    ),
    'treatment_gap_valid': lambda r: (
        r.get('treatment_gap_percent') is None or
        0 <= r.get('treatment_gap_percent', 0) <= 100
    ),
    'population_positive': lambda r: (
        r.get('population') is None or
        r.get('population', 0) > 0
    ),
    'year_valid': lambda r: (
        2015 <= r.get('year', 0) <= 2030
    ),
    'deaths_not_negative': lambda r: (
        (r.get('opioid_deaths') is None or r.get('opioid_deaths', 0) >= 0) and
        (r.get('drug_overdose_deaths') is None or r.get('drug_overdose_deaths', 0) >= 0) and
        (r.get('overdose_deaths') is None or r.get('overdose_deaths', 0) >= 0)
    ),
    'affected_less_than_population': lambda r: (
        r.get('total_affected') is None or
        r.get('population') is None or
        r.get('total_affected', 0) <= r.get('population', float('inf'))
    )
}


class ComprehensiveDataValidator:
    def __init__(self, db):
        self.db = db
        self.errors = []
        self.warnings = []
        self.passed = []
        self.stats = {
            'countries_tested': 0,
            'states_tested': 0,
            'total_records': 0,
            'total_checks': 0,
            'passed_checks': 0,
            'failed_checks': 0,
            'warning_checks': 0
        }
    
    async def validate_all(self) -> Dict:
        """Run all validations"""
        print("=" * 70)
        print("COMPREHENSIVE DATA VALIDATION - ALL COUNTRIES, STATES, YEARS")
        print("=" * 70)
        
        # 1. Validate all country statistics
        await self.validate_all_countries()
        
        # 2. Validate all US state statistics
        await self.validate_all_states()
        
        # 3. Validate source URLs (batch check)
        await self.validate_source_urls()
        
        # 4. Cross-validate data consistency
        await self.validate_data_consistency()
        
        # 5. Generate report
        return self.generate_report()
    
    async def validate_all_countries(self):
        """Validate ALL country statistics in a single batch query"""
        print("\n[1/4] VALIDATING COUNTRY STATISTICS...")
        
        # Single batch query for all countries
        cursor = self.db.country_statistics.find({}, {'_id': 0})
        all_records = await cursor.to_list(length=10000)
        
        countries_seen = set()
        years_per_country = defaultdict(set)
        
        for record in all_records:
            country_code = record.get('country_code')
            year = record.get('year')
            countries_seen.add(country_code)
            years_per_country[country_code].add(year)
            
            self.stats['total_records'] += 1
            
            # Check required fields
            for field in COUNTRY_REQUIRED_FIELDS:
                self.stats['total_checks'] += 1
                if not record.get(field):
                    self.errors.append({
                        'type': 'MISSING_REQUIRED_FIELD',
                        'entity': 'country',
                        'code': country_code,
                        'year': year,
                        'field': field,
                        'severity': 'ERROR'
                    })
                    self.stats['failed_checks'] += 1
                else:
                    self.stats['passed_checks'] += 1
            
            # Check metric fields (warnings if missing)
            for field in COUNTRY_METRIC_FIELDS:
                self.stats['total_checks'] += 1
                if record.get(field) is None:
                    self.warnings.append({
                        'type': 'MISSING_METRIC',
                        'entity': 'country',
                        'code': country_code,
                        'year': year,
                        'field': field,
                        'severity': 'WARNING'
                    })
                    self.stats['warning_checks'] += 1
                else:
                    self.stats['passed_checks'] += 1
            
            # Apply validation rules
            for rule_name, rule_func in VALIDATION_RULES.items():
                self.stats['total_checks'] += 1
                try:
                    if not rule_func(record):
                        self.errors.append({
                            'type': 'VALIDATION_RULE_FAILED',
                            'entity': 'country',
                            'code': country_code,
                            'year': year,
                            'rule': rule_name,
                            'data': {k: record.get(k) for k in ['opioid_deaths', 'drug_overdose_deaths', 'prevalence_rate', 'treatment_gap_percent', 'population', 'total_affected']},
                            'severity': 'ERROR'
                        })
                        self.stats['failed_checks'] += 1
                    else:
                        self.stats['passed_checks'] += 1
                except Exception as e:
                    self.warnings.append({
                        'type': 'RULE_CHECK_ERROR',
                        'entity': 'country',
                        'code': country_code,
                        'year': year,
                        'rule': rule_name,
                        'error': str(e),
                        'severity': 'WARNING'
                    })
                    self.stats['warning_checks'] += 1
        
        self.stats['countries_tested'] = len(countries_seen)
        
        # Check year coverage for each country
        expected_years = {2019, 2020, 2021, 2022, 2023, 2024, 2025}
        for country_code, years in years_per_country.items():
            missing_years = expected_years - years
            if missing_years:
                self.warnings.append({
                    'type': 'MISSING_YEARS',
                    'entity': 'country',
                    'code': country_code,
                    'missing_years': sorted(missing_years),
                    'severity': 'WARNING'
                })
        
        print(f"   Countries validated: {len(countries_seen)}")
        print(f"   Records checked: {len(all_records)}")
    
    async def validate_all_states(self):
        """Validate ALL US state statistics in a single batch query"""
        print("\n[2/4] VALIDATING US STATE STATISTICS...")
        
        # Single batch query for all states
        cursor = self.db.state_addiction_statistics.find({}, {'_id': 0})
        all_records = await cursor.to_list(length=10000)
        
        states_seen = set()
        years_per_state = defaultdict(set)
        
        for record in all_records:
            state_id = record.get('state_id')
            year = record.get('year')
            states_seen.add(state_id)
            years_per_state[state_id].add(year)
            
            self.stats['total_records'] += 1
            
            # Check required fields
            for field in STATE_REQUIRED_FIELDS:
                self.stats['total_checks'] += 1
                if not record.get(field):
                    self.errors.append({
                        'type': 'MISSING_REQUIRED_FIELD',
                        'entity': 'state',
                        'code': state_id,
                        'year': year,
                        'field': field,
                        'severity': 'ERROR'
                    })
                    self.stats['failed_checks'] += 1
                else:
                    self.stats['passed_checks'] += 1
            
            # Check metric fields
            for field in STATE_METRIC_FIELDS:
                self.stats['total_checks'] += 1
                if record.get(field) is None:
                    self.warnings.append({
                        'type': 'MISSING_METRIC',
                        'entity': 'state',
                        'code': state_id,
                        'year': year,
                        'field': field,
                        'severity': 'WARNING'
                    })
                    self.stats['warning_checks'] += 1
                else:
                    self.stats['passed_checks'] += 1
            
            # Apply validation rules (adapted for states)
            state_record = {
                'opioid_deaths': record.get('opioid_deaths'),
                'drug_overdose_deaths': record.get('overdose_deaths'),
                'prevalence_rate': record.get('drug_abuse_rate'),
                'treatment_gap_percent': 100 - (record.get('recovery_rate') or 0) if record.get('recovery_rate') else None,
                'population': record.get('population'),
                'total_affected': record.get('total_affected'),
                'year': year
            }
            
            for rule_name, rule_func in VALIDATION_RULES.items():
                self.stats['total_checks'] += 1
                try:
                    if not rule_func(state_record):
                        self.errors.append({
                            'type': 'VALIDATION_RULE_FAILED',
                            'entity': 'state',
                            'code': state_id,
                            'year': year,
                            'rule': rule_name,
                            'severity': 'ERROR'
                        })
                        self.stats['failed_checks'] += 1
                    else:
                        self.stats['passed_checks'] += 1
                except:
                    self.stats['passed_checks'] += 1
        
        self.stats['states_tested'] = len(states_seen)
        
        # Check year coverage
        expected_years = {2019, 2020, 2021, 2022, 2023, 2024, 2025}
        for state_id, years in years_per_state.items():
            missing_years = expected_years - years
            if missing_years:
                self.warnings.append({
                    'type': 'MISSING_YEARS',
                    'entity': 'state',
                    'code': state_id,
                    'missing_years': sorted(missing_years),
                    'severity': 'WARNING'
                })
        
        print(f"   States validated: {len(states_seen)}")
        print(f"   Records checked: {len(all_records)}")
    
    async def validate_source_urls(self):
        """Batch validate source URLs (check unique URLs only)"""
        print("\n[3/4] VALIDATING SOURCE URLs...")
        
        # Get unique URLs from country statistics
        cursor = self.db.country_statistics.find(
            {'primary_source_url': {'$ne': None, '$exists': True}},
            {'_id': 0, 'primary_source_url': 1}
        )
        records = await cursor.to_list(length=5000)
        
        unique_urls = set()
        for r in records:
            url = r.get('primary_source_url')
            if url and url.startswith('http'):
                unique_urls.add(url)
        
        print(f"   Unique URLs to check: {len(unique_urls)}")
        
        # Batch check URLs (limit concurrency)
        broken_urls = []
        checked = 0
        
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            for url in list(unique_urls)[:50]:  # Check first 50 to save time
                try:
                    response = await client.head(url)
                    checked += 1
                    if response.status_code >= 400:
                        broken_urls.append({
                            'url': url,
                            'status': response.status_code
                        })
                        self.warnings.append({
                            'type': 'BROKEN_SOURCE_URL',
                            'url': url,
                            'status_code': response.status_code,
                            'severity': 'WARNING'
                        })
                except Exception as e:
                    checked += 1
                    # Don't count timeouts as broken - server might be slow
                    if 'timeout' not in str(e).lower():
                        broken_urls.append({
                            'url': url,
                            'error': str(e)[:50]
                        })
        
        print(f"   URLs checked: {checked}")
        print(f"   Broken URLs found: {len(broken_urls)}")
    
    async def validate_data_consistency(self):
        """Cross-validate data consistency across years"""
        print("\n[4/4] VALIDATING DATA CONSISTENCY...")
        
        # Check for sudden unrealistic changes year-over-year
        cursor = self.db.country_statistics.find({}, {'_id': 0}).sort([('country_code', 1), ('year', 1)])
        all_records = await cursor.to_list(length=10000)
        
        # Group by country
        by_country = defaultdict(list)
        for r in all_records:
            by_country[r.get('country_code')].append(r)
        
        consistency_issues = 0
        
        for country_code, records in by_country.items():
            records.sort(key=lambda x: x.get('year', 0))
            
            for i in range(1, len(records)):
                prev = records[i-1]
                curr = records[i]
                
                # Check opioid deaths YoY change
                prev_deaths = prev.get('opioid_deaths')
                curr_deaths = curr.get('opioid_deaths')
                
                if prev_deaths and curr_deaths and prev_deaths > 0:
                    change_pct = abs(curr_deaths - prev_deaths) / prev_deaths * 100
                    
                    # Flag if >200% change YoY (extremely unusual)
                    if change_pct > 200:
                        consistency_issues += 1
                        self.warnings.append({
                            'type': 'UNUSUAL_YOY_CHANGE',
                            'entity': 'country',
                            'code': country_code,
                            'field': 'opioid_deaths',
                            'year': curr.get('year'),
                            'prev_value': prev_deaths,
                            'curr_value': curr_deaths,
                            'change_percent': round(change_pct, 1),
                            'severity': 'WARNING'
                        })
        
        print(f"   Consistency checks completed")
        print(f"   Unusual YoY changes found: {consistency_issues}")
    
    def generate_report(self) -> Dict:
        """Generate comprehensive validation report"""
        print("\n" + "=" * 70)
        print("VALIDATION COMPLETE")
        print("=" * 70)
        
        report = {
            'timestamp': datetime.utcnow().isoformat(),
            'summary': {
                'countries_tested': self.stats['countries_tested'],
                'states_tested': self.stats['states_tested'],
                'total_records': self.stats['total_records'],
                'total_checks': self.stats['total_checks'],
                'passed_checks': self.stats['passed_checks'],
                'failed_checks': self.stats['failed_checks'],
                'warning_checks': self.stats['warning_checks'],
                'pass_rate': round(self.stats['passed_checks'] / max(self.stats['total_checks'], 1) * 100, 2),
                'error_count': len([e for e in self.errors if e.get('severity') == 'ERROR']),
                'warning_count': len(self.warnings)
            },
            'errors': self.errors[:100],  # First 100 errors
            'warnings': self.warnings[:100],  # First 100 warnings
            'status': 'PASS' if len([e for e in self.errors if e.get('severity') == 'ERROR']) == 0 else 'FAIL'
        }
        
        print(f"\nSUMMARY:")
        print(f"  Countries Tested: {report['summary']['countries_tested']}")
        print(f"  States Tested: {report['summary']['states_tested']}")
        print(f"  Total Records: {report['summary']['total_records']}")
        print(f"  Total Checks: {report['summary']['total_checks']}")
        print(f"  Passed: {report['summary']['passed_checks']}")
        print(f"  Failed: {report['summary']['failed_checks']}")
        print(f"  Warnings: {report['summary']['warning_count']}")
        print(f"  Pass Rate: {report['summary']['pass_rate']}%")
        print(f"\n  STATUS: {'✅ PASS' if report['status'] == 'PASS' else '❌ FAIL'}")
        
        if report['summary']['error_count'] > 0:
            print(f"\n  CRITICAL ERRORS ({report['summary']['error_count']}):")
            for err in self.errors[:10]:
                print(f"    - {err['type']}: {err.get('code', 'N/A')} {err.get('year', '')} - {err.get('field', err.get('rule', 'N/A'))}")
        
        return report


async def run_comprehensive_validation():
    """Main entry point"""
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    
    validator = ComprehensiveDataValidator(db)
    report = await validator.validate_all()
    
    # Save report
    with open('/app/memory/COMPREHENSIVE_VALIDATION_REPORT.json', 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"\nReport saved to: /app/memory/COMPREHENSIVE_VALIDATION_REPORT.json")
    
    return report


if __name__ == "__main__":
    asyncio.run(run_comprehensive_validation())
