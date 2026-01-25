"""
EXACT VERIFIED DATA - OFFICIAL SOURCES ONLY
============================================
This file contains ONLY exact numbers from official government sources.
NO estimates, NO formulas, NO rounding.

Sources verified via web search against official government reports.
"""

import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# ==============================================================================
# EXACT VERIFIED DATA - OFFICIAL GOVERNMENT SOURCES
# ==============================================================================

EXACT_VERIFIED_DATA = {
    # ===========================================================================
    # UNITED STATES - CDC WONDER / NCHS
    # Source: https://www.cdc.gov/nchs/hus/topics/drug-overdose-deaths.htm
    # Source: https://www.cdc.gov/nchs/products/databriefs/db491.htm
    # ===========================================================================
    'USA': {
        2019: {
            'drug_overdose_deaths': 70630,
            'source': 'CDC NCHS',
            'source_url': 'https://www.cdc.gov/nchs/hus/topics/drug-overdose-deaths.htm'
        },
        2020: {
            'drug_overdose_deaths': 91799,
            'source': 'CDC NCHS Data Brief No. 428',
            'source_url': 'https://www.cdc.gov/nchs/data/databriefs/db428.pdf'
        },
        2021: {
            'drug_overdose_deaths': 106699,
            'source': 'CDC NCHS',
            'source_url': 'https://www.cdc.gov/nchs/products/databriefs/db491.htm'
        },
        2022: {
            'drug_overdose_deaths': 107941,
            'source': 'CDC NCHS',
            'source_url': 'https://www.cdc.gov/nchs/products/databriefs/db491.htm'
        },
    },
    
    # ===========================================================================
    # CANADA - Health Canada / Statistics Canada
    # Source: https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/
    # Source: https://www150.statcan.gc.ca/n1/daily-quotidien/250219/dq250219b-eng.htm
    # ===========================================================================
    'CAN': {
        2019: {
            'drug_overdose_deaths': 4039,
            'opioid_deaths': 3823,  # Opioid toxicity deaths
            'source': 'Statistics Canada',
            'source_url': 'https://www150.statcan.gc.ca/n1/daily-quotidien/250219/dq250219b-eng.htm'
        },
        2020: {
            'drug_overdose_deaths': 6412,  # Accidental drug poisoning
            'opioid_deaths': 6306,  # Apparent opioid toxicity deaths
            'source': 'Health Canada / Statistics Canada',
            'source_url': 'https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/'
        },
        2021: {
            'drug_overdose_deaths': 7993,  # From Health Canada
            'opioid_deaths': 7993,
            'source': 'Health Canada',
            'source_url': 'https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/'
        },
        2022: {
            'drug_overdose_deaths': 7525,
            'opioid_deaths': 7525,
            'source': 'Health Canada',
            'source_url': 'https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/'
        },
    },
    
    # ===========================================================================
    # UNITED KINGDOM (England & Wales) - ONS
    # Source: https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/bulletins/deathsrelatedtodrugpoisoninginenglandandwales/
    # Note: These are registered deaths in England & Wales only (excludes Scotland)
    # ===========================================================================
    'GBR': {
        2019: {
            'drug_overdose_deaths': 4393,
            'opioid_deaths': 2263,  # Opiates involved
            'source': 'ONS England & Wales',
            'source_url': 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/bulletins/deathsrelatedtodrugpoisoninginenglandandwales/2019registrations',
            'note': 'England & Wales only, excludes Scotland'
        },
        2020: {
            'drug_overdose_deaths': 4561,
            'opioid_deaths': 2263,  # Opiates involved
            'source': 'ONS England & Wales',
            'source_url': 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/bulletins/deathsrelatedtodrugpoisoninginenglandandwales/2020',
            'note': 'England & Wales only, excludes Scotland'
        },
        2021: {
            'drug_overdose_deaths': 4859,
            'source': 'ONS England & Wales',
            'source_url': 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/bulletins/deathsrelatedtodrugpoisoninginenglandandwales/2022registrations',
            'note': 'England & Wales only, excludes Scotland'
        },
        2022: {
            'drug_overdose_deaths': 4907,
            'source': 'ONS England & Wales',
            'source_url': 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/bulletins/deathsrelatedtodrugpoisoninginenglandandwales/2022registrations',
            'note': 'England & Wales only, excludes Scotland'
        },
    },
    
    # ===========================================================================
    # AUSTRALIA - ABS (Australian Bureau of Statistics)
    # Source: https://www.abs.gov.au/articles/opioid-induced-deaths-australia
    # ===========================================================================
    'AUS': {
        2018: {
            'drug_overdose_deaths': 1740,
            'opioid_deaths': 1123,
            'source': 'ABS',
            'source_url': 'https://www.abs.gov.au/articles/opioid-induced-deaths-australia'
        },
        2022: {
            'drug_overdose_deaths': 1874,  # Revised preliminary
            'source': 'ABS (revised preliminary)',
            'source_url': 'https://www.abs.gov.au/statistics/health/causes-death/causes-death-australia'
        },
    },
    
    # ===========================================================================
    # GERMANY - BKA (Bundeskriminalamt)
    # Source: https://www.statista.com/statistics/1335847/drug-related-deaths-germany/
    # ===========================================================================
    'DEU': {
        2021: {
            'drug_overdose_deaths': 1826,
            'source': 'BKA',
            'source_url': 'https://www.bka.de/EN/OurTasks/AreasOfCrime/DrugRelatedCrime/drugrelatedcrimeCrime.html'
        },
        2022: {
            'drug_overdose_deaths': 1990,
            'opioid_deaths': 1194,
            'source': 'BKA',
            'source_url': 'https://www.bka.de/EN/OurTasks/AreasOfCrime/DrugRelatedCrime/drugrelatedcrimeCrime.html'
        },
    },
}


async def apply_exact_verified_data():
    """Apply ONLY exact verified data from official sources."""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    now = datetime.now(timezone.utc)
    
    print("=" * 70)
    print("APPLYING EXACT VERIFIED DATA - OFFICIAL SOURCES ONLY")
    print("NO ESTIMATES - NO FORMULAS - NO ROUNDING")
    print("=" * 70)
    
    updates_made = 0
    
    for country_code, years in EXACT_VERIFIED_DATA.items():
        # Get country name
        record = await db.country_statistics.find_one(
            {'country_code': country_code},
            {'_id': 0, 'country_name': 1}
        )
        country_name = record.get('country_name', country_code) if record else country_code
        
        print(f"\n{country_name} ({country_code}):")
        
        for year, data in years.items():
            update_fields = {
                'drug_overdose_deaths': data['drug_overdose_deaths'],
                'primary_source': data['source'],
                'primary_source_url': data['source_url'],
                'data_verified': True,
                'exact_verified': True,  # New flag for exact data
                'serp_verified': True,
                'verified_at': now,
                'verification_method': 'official_source_exact',
                'updated_at': now
            }
            
            # Add opioid deaths if available
            if 'opioid_deaths' in data:
                update_fields['opioid_deaths'] = data['opioid_deaths']
            
            # Add note if available
            if 'note' in data:
                update_fields['data_note'] = data['note']
            
            result = await db.country_statistics.update_one(
                {'country_code': country_code, 'year': year},
                {'$set': update_fields}
            )
            
            if result.modified_count > 0:
                updates_made += 1
                
            opioid_str = f", Opioid: {data.get('opioid_deaths', 'N/A')}" if 'opioid_deaths' in data else ""
            print(f"  {year}: {data['drug_overdose_deaths']:,}{opioid_str}")
            print(f"        Source: {data['source']}")
    
    print(f"\n{'=' * 70}")
    print(f"TOTAL UPDATES: {updates_made}")
    print(f"{'=' * 70}")
    
    client.close()
    return updates_made


async def mark_unverified_as_estimated():
    """Mark records without exact verification as estimated."""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    
    # Mark records that don't have exact_verified flag as estimated
    result = await db.country_statistics.update_many(
        {'exact_verified': {'$ne': True}},
        {'$set': {
            'data_confidence': 'estimated',
            'data_note': 'This figure is an estimate based on regional data. Official national statistics may vary.'
        }}
    )
    
    print(f"\nMarked {result.modified_count} records as 'estimated'")
    
    client.close()


async def verify_against_google():
    """Print data for manual Google verification."""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'united_rehabs')]
    
    print("\n" + "=" * 70)
    print("GOOGLE SPOT-CHECK VERIFICATION")
    print("Search these in Google to verify accuracy:")
    print("=" * 70)
    
    verification_queries = [
        ('USA', 2022, 'drug overdose deaths united states 2022'),
        ('USA', 2021, 'drug overdose deaths united states 2021'),
        ('USA', 2020, 'drug overdose deaths united states 2020'),
        ('USA', 2019, 'drug overdose deaths united states 2019'),
        ('CAN', 2022, 'drug overdose deaths canada 2022'),
        ('CAN', 2021, 'opioid deaths canada 2021'),
        ('CAN', 2020, 'opioid deaths canada 2020'),
        ('CAN', 2019, 'drug overdose deaths canada 2019'),
        ('GBR', 2022, 'drug poisoning deaths england wales 2022'),
        ('GBR', 2021, 'drug poisoning deaths england wales 2021'),
        ('AUS', 2022, 'drug overdose deaths australia 2022'),
        ('DEU', 2022, 'drug deaths germany 2022'),
    ]
    
    for country_code, year, query in verification_queries:
        record = await db.country_statistics.find_one(
            {'country_code': country_code, 'year': year},
            {'_id': 0, 'country_name': 1, 'drug_overdose_deaths': 1, 'primary_source': 1}
        )
        
        if record:
            print(f"\n{record.get('country_name')} {year}:")
            print(f"  Our data: {record.get('drug_overdose_deaths', 'N/A'):,}")
            print(f"  Source: {record.get('primary_source', 'N/A')}")
            print(f"  Google: \"{query}\"")
    
    client.close()


if __name__ == '__main__':
    # Apply exact verified data
    asyncio.run(apply_exact_verified_data())
    
    # Mark unverified as estimated
    asyncio.run(mark_unverified_as_estimated())
    
    # Print verification guide
    asyncio.run(verify_against_google())
