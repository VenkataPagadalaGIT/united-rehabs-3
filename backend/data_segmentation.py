"""
Data Segmentation System
Organizes verified data into segments for analysis and reporting.
"""
import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Segment definitions
DATA_SEGMENTS = {
    'tier_1_high_priority': {
        'name': 'Tier 1: High Priority Countries',
        'description': 'Major economies with high drug death rates, reliable official data',
        'countries': ['USA', 'CAN', 'GBR', 'DEU', 'FRA', 'AUS', 'BRA', 'MEX', 'IND', 'CHN', 'RUS', 'JPN'],
        'criteria': 'Population > 50M or overdose deaths > 1000/year'
    },
    'tier_2_europe': {
        'name': 'Tier 2: European Countries',
        'description': 'EU and EFTA countries with EMCDDA data',
        'countries': ['ESP', 'ITA', 'NLD', 'BEL', 'AUT', 'CHE', 'PRT', 'IRL', 'SWE', 'NOR', 'FIN', 'DNK', 'POL', 'CZE', 'GRC'],
        'criteria': 'EMCDDA member or observer'
    },
    'tier_3_asia_pacific': {
        'name': 'Tier 3: Asia-Pacific',
        'description': 'Major Asia-Pacific countries',
        'countries': ['KOR', 'NZL', 'THA', 'SGP', 'MYS', 'PHL', 'IDN', 'VNM', 'PAK'],
        'criteria': 'Population > 10M in Asia-Pacific region'
    },
    'tier_4_americas': {
        'name': 'Tier 4: Americas (non-NA)',
        'description': 'Central and South American countries',
        'countries': ['ARG', 'COL', 'CHL', 'PER', 'VEN', 'ECU', 'GTM', 'CRI', 'PAN'],
        'criteria': 'Major Latin American countries'
    },
    'tier_5_mena': {
        'name': 'Tier 5: Middle East & North Africa',
        'description': 'MENA region countries',
        'countries': ['IRN', 'TUR', 'ISR', 'SAU', 'ARE', 'EGY', 'MAR'],
        'criteria': 'Major MENA countries with health data'
    },
    'tier_6_africa': {
        'name': 'Tier 6: Sub-Saharan Africa',
        'description': 'Major African countries',
        'countries': ['ZAF', 'NGA', 'KEN', 'ETH', 'GHA', 'TZA'],
        'criteria': 'Population > 30M in Africa'
    },
    'us_states': {
        'name': 'US States',
        'description': 'All 50 US states + DC',
        'states': ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 
                   'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
                   'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
                   'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
                   'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
        'criteria': 'All US states and territories'
    }
}

# Data quality tiers
QUALITY_TIERS = {
    'gold': {
        'name': 'Gold Standard',
        'description': 'Official government statistics from primary sources',
        'min_reliability': 9,
        'sources': ['CDC WONDER', 'Health Canada', 'ONS UK', 'AIHW Australia']
    },
    'silver': {
        'name': 'Silver Standard',
        'description': 'International organization data (UN, EU)',
        'min_reliability': 7,
        'sources': ['UNODC World Drug Report', 'EMCDDA', 'WHO']
    },
    'bronze': {
        'name': 'Bronze Standard',
        'description': 'SERP-verified or secondary sources',
        'min_reliability': 5,
        'sources': ['DataForSEO SERP', 'News sources', 'Academic papers']
    },
    'unverified': {
        'name': 'Unverified',
        'description': 'Estimated or algorithm-generated data',
        'min_reliability': 0,
        'sources': ['Trend extrapolation', 'Population-based estimates']
    }
}


async def generate_segment_report():
    """Generate comprehensive segment analysis report."""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    
    now = datetime.now(timezone.utc)
    
    report = {
        'generated_at': now.isoformat(),
        'segments': {},
        'quality_breakdown': {},
        'summary': {}
    }
    
    # Analyze each segment
    for segment_id, segment in DATA_SEGMENTS.items():
        if segment_id == 'us_states':
            # US States segment
            codes = segment['states']
            total = await db.state_addiction_statistics.count_documents({'state_id': {'$in': codes}})
            verified = await db.state_addiction_statistics.count_documents({
                'state_id': {'$in': codes},
                'data_verified': True
            })
            gold = await db.state_addiction_statistics.count_documents({
                'state_id': {'$in': codes},
                'reliability_score': {'$gte': 9}
            })
        else:
            # Country segments
            codes = segment['countries']
            total = await db.country_statistics.count_documents({'country_code': {'$in': codes}})
            verified = await db.country_statistics.count_documents({
                'country_code': {'$in': codes},
                'data_verified': True
            })
            gold = await db.country_statistics.count_documents({
                'country_code': {'$in': codes},
                'reliability_score': {'$gte': 9}
            })
        
        report['segments'][segment_id] = {
            'name': segment['name'],
            'description': segment['description'],
            'total_records': total,
            'verified_records': verified,
            'gold_standard_records': gold,
            'coverage_percent': round(verified / max(total, 1) * 100, 1),
            'locations_count': len(codes) if isinstance(codes, list) else len(segment.get('states', []))
        }
    
    # Quality tier breakdown
    for tier_id, tier in QUALITY_TIERS.items():
        if tier_id == 'unverified':
            country_count = await db.country_statistics.count_documents({'data_verified': {'$ne': True}})
            state_count = await db.state_addiction_statistics.count_documents({'data_verified': {'$ne': True}})
        else:
            min_rel = tier['min_reliability']
            max_rel = QUALITY_TIERS.get('gold', {}).get('min_reliability', 10) if tier_id != 'gold' else 10
            
            country_count = await db.country_statistics.count_documents({
                'reliability_score': {'$gte': min_rel, '$lt': max_rel if tier_id != 'gold' else 11}
            })
            state_count = await db.state_addiction_statistics.count_documents({
                'reliability_score': {'$gte': min_rel, '$lt': max_rel if tier_id != 'gold' else 11}
            })
        
        report['quality_breakdown'][tier_id] = {
            'name': tier['name'],
            'description': tier['description'],
            'country_records': country_count,
            'state_records': state_count,
            'total_records': country_count + state_count
        }
    
    # Summary
    total_countries = await db.country_statistics.count_documents({})
    total_states = await db.state_addiction_statistics.count_documents({})
    verified_countries = await db.country_statistics.count_documents({'data_verified': True})
    verified_states = await db.state_addiction_statistics.count_documents({'data_verified': True})
    
    report['summary'] = {
        'total_records': total_countries + total_states,
        'total_verified': verified_countries + verified_states,
        'overall_coverage': round((verified_countries + verified_states) / max(total_countries + total_states, 1) * 100, 1),
        'countries': {
            'total': total_countries,
            'verified': verified_countries,
            'unique_codes': len(await db.country_statistics.distinct('country_code'))
        },
        'states': {
            'total': total_states,
            'verified': verified_states,
            'unique_codes': len(await db.state_addiction_statistics.distinct('state_id'))
        }
    }
    
    # Save report
    await db.segment_reports.insert_one({
        **report,
        'report_type': 'DATA_SEGMENT_ANALYSIS'
    })
    
    client.close()
    return report


async def get_segment_details(segment_id: str):
    """Get detailed data for a specific segment."""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    
    segment = DATA_SEGMENTS.get(segment_id)
    if not segment:
        return {'error': f'Unknown segment: {segment_id}'}
    
    if segment_id == 'us_states':
        codes = segment['states']
        records = await db.state_addiction_statistics.find(
            {'state_id': {'$in': codes}, 'year': 2022},
            {'_id': 0, 'state_id': 1, 'state_name': 1, 'year': 1, 
             'overdose_deaths': 1, 'opioid_deaths': 1, 'data_verified': 1,
             'data_source': 1, 'reliability_score': 1, 'verified_at': 1}
        ).to_list(length=100)
    else:
        codes = segment['countries']
        records = await db.country_statistics.find(
            {'country_code': {'$in': codes}, 'year': 2022},
            {'_id': 0, 'country_code': 1, 'country_name': 1, 'year': 1,
             'drug_overdose_deaths': 1, 'opioid_deaths': 1, 'data_verified': 1,
             'primary_source': 1, 'reliability_score': 1, 'verified_at': 1}
        ).to_list(length=100)
    
    # Convert datetime objects
    for r in records:
        if r.get('verified_at'):
            r['verified_at'] = r['verified_at'].isoformat()
    
    client.close()
    
    return {
        'segment_id': segment_id,
        'segment_name': segment['name'],
        'segment_description': segment['description'],
        'year': 2022,
        'records': records,
        'total_count': len(records),
        'verified_count': sum(1 for r in records if r.get('data_verified'))
    }


if __name__ == '__main__':
    print("=" * 70)
    print("DATA SEGMENTATION REPORT")
    print("=" * 70)
    
    report = asyncio.run(generate_segment_report())
    
    print(f"\nGenerated at: {report['generated_at']}")
    
    print(f"\n{'=' * 70}")
    print("SEGMENT ANALYSIS")
    print(f"{'=' * 70}")
    
    for seg_id, seg in report['segments'].items():
        print(f"\n{seg['name']}")
        print(f"  Records: {seg['verified_records']}/{seg['total_records']} verified ({seg['coverage_percent']}%)")
        print(f"  Gold Standard: {seg['gold_standard_records']}")
    
    print(f"\n{'=' * 70}")
    print("QUALITY TIER BREAKDOWN")
    print(f"{'=' * 70}")
    
    for tier_id, tier in report['quality_breakdown'].items():
        print(f"\n{tier['name']}: {tier['total_records']} records")
        print(f"  Countries: {tier['country_records']}, States: {tier['state_records']}")
    
    print(f"\n{'=' * 70}")
    print("OVERALL SUMMARY")
    print(f"{'=' * 70}")
    
    summary = report['summary']
    print(f"\nTotal Records: {summary['total_records']}")
    print(f"Verified Records: {summary['total_verified']}")
    print(f"Overall Coverage: {summary['overall_coverage']}%")
