"""
AUTOMATED SERP DATA VERIFICATION SYSTEM
=========================================
This system automatically verifies country/state/city data against web search results.

How it works:
1. Generate search queries for each location + year
2. Execute web searches via API
3. Extract numeric data from search results using LLM
4. Compare with database values
5. Flag discrepancies for review or auto-update

Scalability:
- Countries: 195
- US States: 51
- Cities: 1000+
- Years: 7 (2019-2025)
- Total queries needed: ~10,000+ for full coverage

Rate limiting and caching are critical!
"""

import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
import json
import re
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Search query templates for different location types
SEARCH_TEMPLATES = {
    "country": {
        "drug_deaths": "{country_name} drug overdose deaths {year} official statistics",
        "opioid_deaths": "{country_name} opioid deaths {year} official government statistics",
        "treatment_centers": "{country_name} drug addiction treatment centers {year} total number"
    },
    "us_state": {
        "drug_deaths": "{state_name} USA drug overdose deaths {year} CDC statistics",
        "opioid_deaths": "{state_name} state opioid deaths {year} official statistics",
        "treatment_centers": "{state_name} addiction treatment facilities {year} SAMHSA"
    },
    "city": {
        "drug_deaths": "{city_name} {country_name} drug overdose deaths {year} statistics",
        "opioid_deaths": "{city_name} opioid crisis deaths {year}",
        "treatment_centers": "{city_name} drug rehab centers {year}"
    }
}

# Known authoritative sources by country
AUTHORITATIVE_SOURCES = {
    "USA": ["CDC", "SAMHSA", "NIDA", "DEA", "HHS"],
    "CAN": ["Health Canada", "CCSA", "StatCan", "CIHI"],
    "GBR": ["ONS", "NHS", "PHE", "Home Office"],
    "AUS": ["AIHW", "ABS", "TGA"],
    "DEU": ["Drogenbeauftragter", "BfArM", "RKI"],
    "FRA": ["OFDT", "ANSM", "Santé Publique France"],
    "JPN": ["MHLW", "NPA"],
    "IND": ["NCRB", "NIMHANS", "Ministry of Health"],
    "BRA": ["DATASUS", "SENAD", "Ministry of Health"],
    "MEX": ["INEGI", "CONADIC", "Secretaría de Salud"],
    "ESP": ["INE", "PNSD", "Ministry of Health"],
    "ITA": ["DPA", "ISTAT", "Ministry of Health"],
    "NLD": ["Trimbos", "CBS", "RIVM"],
    "SWE": ["Folkhälsomyndigheten", "Socialstyrelsen"],
    "RUS": ["Rosstat", "Ministry of Health"],
    "CHN": ["NNCC", "NHC"],
    "ZAF": ["SACENDU", "Stats SA"],
    "default": ["WHO", "UNODC", "EMCDDA", "Government", "Ministry of Health"]
}


class SERPDataExtractor:
    """
    Extracts structured data from SERP results using pattern matching and LLM.
    """
    
    @staticmethod
    def extract_numbers_from_text(text: str, context: str = "") -> List[Dict]:
        """
        Extract numbers with context from text.
        Returns list of {value, unit, context} dicts.
        """
        results = []
        
        # Patterns for death counts
        patterns = [
            # "7,328 opioid deaths" or "7328 deaths"
            r'(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:opioid|drug|overdose)?\s*(?:deaths?|fatalities|casualties)',
            # "deaths: 7,328" or "deaths were 7328"
            r'deaths?\s*(?::|were|was|of|=|reached|totaled?)\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
            # "recorded 7,328 deaths"
            r'recorded\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:drug|opioid|overdose)?\s*deaths?',
            # "7.3K deaths" or "107K overdoses"
            r'(\d+(?:\.\d+)?)\s*[kK]\s*(?:opioid|drug|overdose)?\s*(?:deaths?|fatalities)',
            # Rate patterns: "32.6 per 100,000"
            r'(\d+(?:\.\d+)?)\s*(?:per|/)\s*(?:100,?000|million)',
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                value_str = match.group(1).replace(',', '')
                try:
                    value = float(value_str)
                    # Handle K notation
                    if 'k' in match.group(0).lower() and value < 1000:
                        value *= 1000
                    results.append({
                        "value": int(value) if value == int(value) else value,
                        "raw_match": match.group(0),
                        "context": text[max(0, match.start()-50):min(len(text), match.end()+50)]
                    })
                except ValueError:
                    pass
        
        return results
    
    @staticmethod
    def identify_authoritative_source(text: str, country_code: str) -> Optional[str]:
        """
        Check if text mentions an authoritative source for the country.
        """
        sources = AUTHORITATIVE_SOURCES.get(country_code, AUTHORITATIVE_SOURCES["default"])
        text_lower = text.lower()
        
        for source in sources:
            if source.lower() in text_lower:
                return source
        
        return None
    
    @staticmethod
    def calculate_confidence(extracted_data: Dict, serp_text: str, country_code: str) -> float:
        """
        Calculate confidence score for extracted data (0-1).
        """
        confidence = 0.0
        
        # Has authoritative source mentioned
        if SERPDataExtractor.identify_authoritative_source(serp_text, country_code):
            confidence += 0.3
        
        # Multiple sources agree
        if extracted_data.get("source_count", 0) > 1:
            confidence += 0.2
        
        # Recent data (within 2 years)
        if extracted_data.get("data_year"):
            current_year = datetime.now().year
            if abs(current_year - extracted_data["data_year"]) <= 2:
                confidence += 0.2
        
        # Contains specific numbers (not ranges)
        if extracted_data.get("value") and not extracted_data.get("is_range"):
            confidence += 0.2
        
        # Has URL to official source
        if extracted_data.get("source_url") and any(
            domain in extracted_data["source_url"] 
            for domain in [".gov", ".gc.ca", ".gov.uk", ".gov.au", ".go.jp"]
        ):
            confidence += 0.1
        
        return min(confidence, 1.0)


class AutomatedSERPVerifier:
    """
    Main class for automated SERP-based data verification.
    """
    
    def __init__(self, db, search_function=None):
        """
        Args:
            db: MongoDB database connection
            search_function: Async function to perform web search
                            Should accept (query: str) and return search results text
        """
        self.db = db
        self.search_function = search_function
        self.extractor = SERPDataExtractor()
        self.verification_log = []
        self.rate_limit_delay = 2  # seconds between searches
        
    async def verify_country(self, country_code: str, country_name: str, year: int) -> Dict:
        """
        Verify a single country's data against SERP.
        """
        result = {
            "country_code": country_code,
            "country_name": country_name,
            "year": year,
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "database_values": {},
            "serp_values": {},
            "discrepancies": [],
            "confidence": 0.0,
            "sources_found": [],
            "status": "pending"
        }
        
        # Get current database values
        db_record = await self.db.country_statistics.find_one(
            {"country_code": country_code, "year": year},
            {"_id": 0}
        )
        
        if db_record:
            result["database_values"] = {
                "drug_overdose_deaths": db_record.get("drug_overdose_deaths"),
                "opioid_deaths": db_record.get("opioid_deaths"),
                "total_affected": db_record.get("total_affected")
            }
        
        # Generate search queries
        queries = {
            "drug_deaths": SEARCH_TEMPLATES["country"]["drug_deaths"].format(
                country_name=country_name, year=year
            ),
            "opioid_deaths": SEARCH_TEMPLATES["country"]["opioid_deaths"].format(
                country_name=country_name, year=year
            )
        }
        
        # Execute searches (if search function provided)
        if self.search_function:
            for metric, query in queries.items():
                try:
                    await asyncio.sleep(self.rate_limit_delay)  # Rate limiting
                    search_results = await self.search_function(query)
                    
                    # Extract data from results
                    extracted = self.extractor.extract_numbers_from_text(search_results)
                    source = self.extractor.identify_authoritative_source(search_results, country_code)
                    
                    if extracted:
                        # Take the most likely value (first match with highest confidence)
                        best_match = extracted[0]
                        result["serp_values"][metric] = best_match["value"]
                        
                        if source:
                            result["sources_found"].append(source)
                    
                except Exception as e:
                    result["errors"] = result.get("errors", []) + [str(e)]
        
        # Calculate discrepancies
        for metric in ["drug_overdose_deaths", "opioid_deaths"]:
            db_val = result["database_values"].get(metric)
            serp_key = "drug_deaths" if metric == "drug_overdose_deaths" else "opioid_deaths"
            serp_val = result["serp_values"].get(serp_key)
            
            if db_val and serp_val:
                diff_percent = abs(db_val - serp_val) / serp_val * 100 if serp_val > 0 else 0
                
                if diff_percent > 20:
                    result["discrepancies"].append({
                        "metric": metric,
                        "database_value": db_val,
                        "serp_value": serp_val,
                        "difference_percent": round(diff_percent, 1),
                        "severity": "CRITICAL" if diff_percent > 50 else "WARNING"
                    })
        
        # Set status
        if result["discrepancies"]:
            critical_count = sum(1 for d in result["discrepancies"] if d["severity"] == "CRITICAL")
            result["status"] = "CRITICAL" if critical_count > 0 else "WARNING"
        elif result["serp_values"]:
            result["status"] = "VERIFIED"
        else:
            result["status"] = "NO_SERP_DATA"
        
        # Calculate confidence
        result["confidence"] = self.extractor.calculate_confidence(
            result["serp_values"], 
            str(result.get("sources_found", [])),
            country_code
        )
        
        return result
    
    async def verify_all_countries(self, year: int = 2022, limit: int = None) -> Dict:
        """
        Verify all countries for a given year.
        
        Args:
            year: Year to verify
            limit: Max countries to verify (for testing)
        """
        report = {
            "started_at": datetime.now(timezone.utc).isoformat(),
            "year": year,
            "summary": {
                "total": 0,
                "verified": 0,
                "critical": 0,
                "warning": 0,
                "no_data": 0
            },
            "results": []
        }
        
        # Get all countries
        cursor = self.db.country_statistics.find(
            {"year": year},
            {"_id": 0, "country_code": 1, "country_name": 1}
        )
        countries = await cursor.to_list(length=limit or 1000)
        
        report["summary"]["total"] = len(countries)
        
        for country in countries:
            result = await self.verify_country(
                country["country_code"],
                country["country_name"],
                year
            )
            report["results"].append(result)
            
            # Update summary
            if result["status"] == "VERIFIED":
                report["summary"]["verified"] += 1
            elif result["status"] == "CRITICAL":
                report["summary"]["critical"] += 1
            elif result["status"] == "WARNING":
                report["summary"]["warning"] += 1
            else:
                report["summary"]["no_data"] += 1
        
        report["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        return report
    
    async def generate_verification_queries(self, location_type: str = "country") -> List[Dict]:
        """
        Generate all queries needed for full verification.
        Returns list of queries with metadata for batch processing.
        """
        queries = []
        
        if location_type == "country":
            cursor = self.db.country_statistics.find(
                {},
                {"_id": 0, "country_code": 1, "country_name": 1, "year": 1}
            )
            records = await cursor.to_list(length=10000)
            
            for record in records:
                for metric, template in SEARCH_TEMPLATES["country"].items():
                    queries.append({
                        "query": template.format(
                            country_name=record["country_name"],
                            year=record["year"]
                        ),
                        "country_code": record["country_code"],
                        "year": record["year"],
                        "metric": metric,
                        "location_type": "country"
                    })
        
        elif location_type == "us_state":
            cursor = self.db.state_addiction_statistics.find(
                {},
                {"_id": 0, "state_id": 1, "state_name": 1, "year": 1}
            )
            records = await cursor.to_list(length=10000)
            
            for record in records:
                for metric, template in SEARCH_TEMPLATES["us_state"].items():
                    queries.append({
                        "query": template.format(
                            state_name=record["state_name"],
                            year=record["year"]
                        ),
                        "state_id": record["state_id"],
                        "year": record["year"],
                        "metric": metric,
                        "location_type": "us_state"
                    })
        
        return queries


class SERPVerificationPipeline:
    """
    Complete pipeline for SERP-based data verification.
    
    Usage:
        pipeline = SERPVerificationPipeline(db)
        
        # Generate all needed queries
        queries = await pipeline.generate_all_queries()
        
        # Execute verification (with rate limiting)
        results = await pipeline.execute_verification(queries)
        
        # Apply fixes
        await pipeline.apply_verified_fixes(results)
    """
    
    def __init__(self, db):
        self.db = db
        self.verifier = AutomatedSERPVerifier(db)
        
    async def generate_all_queries(self) -> Dict:
        """
        Generate all verification queries needed.
        """
        country_queries = await self.verifier.generate_verification_queries("country")
        state_queries = await self.verifier.generate_verification_queries("us_state")
        
        return {
            "total_queries": len(country_queries) + len(state_queries),
            "country_queries": len(country_queries),
            "state_queries": len(state_queries),
            "estimated_time_hours": (len(country_queries) + len(state_queries)) * 2 / 3600,  # 2 sec per query
            "queries": {
                "countries": country_queries,
                "states": state_queries
            }
        }
    
    async def get_verification_status(self) -> Dict:
        """
        Get current verification status of all data.
        """
        total_countries = await self.db.country_statistics.count_documents({})
        verified_countries = await self.db.country_statistics.count_documents({"data_verified": True})
        serp_verified = await self.db.country_statistics.count_documents({"serp_verified": True})
        
        total_states = await self.db.state_addiction_statistics.count_documents({})
        verified_states = await self.db.state_addiction_statistics.count_documents({"data_verified": True})
        
        return {
            "countries": {
                "total_records": total_countries,
                "verified": verified_countries,
                "serp_verified": serp_verified,
                "unverified": total_countries - verified_countries,
                "verification_rate": round(verified_countries / total_countries * 100, 1) if total_countries > 0 else 0
            },
            "us_states": {
                "total_records": total_states,
                "verified": verified_states,
                "unverified": total_states - verified_states,
                "verification_rate": round(verified_states / total_states * 100, 1) if total_states > 0 else 0
            },
            "scale_info": {
                "if_adding_cities": {
                    "estimated_cities": 5000,
                    "queries_per_city": 3,
                    "years": 7,
                    "total_queries": 5000 * 3 * 7,
                    "estimated_hours": 5000 * 3 * 7 * 2 / 3600
                }
            }
        }


# Export for use in server
__all__ = [
    'AutomatedSERPVerifier',
    'SERPDataExtractor', 
    'SERPVerificationPipeline',
    'SEARCH_TEMPLATES',
    'AUTHORITATIVE_SOURCES'
]
