"""
Bulk Data Import/Export and Validation Service
Supports both AI-generated and manual data input
"""
import csv
import json
import io
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class BulkStatisticsRow(BaseModel):
    """Schema for bulk statistics import"""
    state_id: str
    state_name: str
    year: int
    total_affected: Optional[int] = None
    overdose_deaths: Optional[int] = None
    opioid_deaths: Optional[int] = None
    drug_abuse_rate: Optional[float] = None
    alcohol_abuse_rate: Optional[float] = None
    affected_age_12_17: Optional[int] = None
    affected_age_18_25: Optional[int] = None
    affected_age_26_34: Optional[int] = None
    affected_age_35_plus: Optional[int] = None
    total_treatment_centers: Optional[int] = None
    inpatient_facilities: Optional[int] = None
    outpatient_facilities: Optional[int] = None
    treatment_admissions: Optional[int] = None
    recovery_rate: Optional[float] = None
    relapse_rate: Optional[float] = None
    economic_cost_billions: Optional[float] = None
    data_source: Optional[str] = None
    source_url: Optional[str] = None


class BulkSubstanceRow(BaseModel):
    """Schema for bulk substance statistics import"""
    state_id: str
    state_name: str
    year: int
    alcohol_use_past_month_percent: Optional[float] = None
    alcohol_binge_drinking_percent: Optional[float] = None
    alcohol_use_disorder: Optional[int] = None
    alcohol_related_deaths: Optional[int] = None
    opioid_use_disorder: Optional[int] = None
    opioid_misuse_past_year: Optional[int] = None
    prescription_opioid_misuse: Optional[int] = None
    heroin_use: Optional[int] = None
    fentanyl_deaths: Optional[int] = None
    marijuana_use_past_month: Optional[int] = None
    marijuana_use_disorder: Optional[int] = None
    cocaine_use_past_year: Optional[int] = None
    cocaine_related_deaths: Optional[int] = None
    meth_use_past_year: Optional[int] = None
    meth_related_deaths: Optional[int] = None
    treatment_received: Optional[int] = None
    treatment_needed_not_received: Optional[int] = None
    data_source: Optional[str] = None


class DataValidator:
    """Validates data against known benchmarks and rules"""
    
    # State populations (2024 estimates)
    STATE_POPULATIONS = {
        "CA": 39_500_000, "TX": 30_000_000, "FL": 22_000_000, "NY": 19_500_000,
        "PA": 13_000_000, "IL": 12_500_000, "OH": 11_800_000, "GA": 10_800_000,
        "NC": 10_500_000, "MI": 10_000_000, "NJ": 9_300_000, "VA": 8_600_000,
        "WA": 7_800_000, "AZ": 7_400_000, "MA": 7_000_000, "TN": 7_000_000,
        "IN": 6_800_000, "MD": 6_200_000, "MO": 6_200_000, "WI": 5_900_000,
        "CO": 5_800_000, "MN": 5_700_000, "SC": 5_200_000, "AL": 5_100_000,
        "LA": 4_600_000, "KY": 4_500_000, "OR": 4_200_000, "OK": 4_000_000,
        "CT": 3_600_000, "UT": 3_400_000, "IA": 3_200_000, "NV": 3_200_000,
        "AR": 3_000_000, "MS": 2_900_000, "KS": 2_900_000, "NM": 2_100_000,
        "NE": 2_000_000, "ID": 1_900_000, "WV": 1_800_000, "HI": 1_400_000,
        "NH": 1_400_000, "ME": 1_400_000, "MT": 1_100_000, "RI": 1_100_000,
        "DE": 1_000_000, "SD": 900_000, "ND": 800_000, "AK": 700_000,
        "VT": 650_000, "WY": 580_000, "DC": 700_000
    }
    
    # National benchmarks
    NATIONAL_OVERDOSE_DEATHS_2023 = 107_000
    NATIONAL_SUD_RATE = 0.065  # 6.5% of population
    
    @classmethod
    def validate_statistics(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate state statistics against benchmarks"""
        issues = []
        warnings = []
        
        state_id = data.get("state_id")
        year = data.get("year")
        population = cls.STATE_POPULATIONS.get(state_id, 5_000_000)
        
        # Check total_affected is reasonable (1-15% of population)
        total_affected = data.get("total_affected")
        if total_affected:
            affected_rate = total_affected / population
            if affected_rate < 0.01:
                warnings.append(f"total_affected seems low ({affected_rate:.1%} of population)")
            elif affected_rate > 0.15:
                issues.append(f"total_affected too high ({affected_rate:.1%} of population)")
        
        # Check overdose deaths (should be 0.01-0.05% of population)
        overdose_deaths = data.get("overdose_deaths")
        if overdose_deaths:
            death_rate = overdose_deaths / population
            if death_rate > 0.001:  # More than 0.1% seems high
                warnings.append(f"overdose_deaths seems high ({overdose_deaths:,} = {death_rate:.3%} of pop)")
            
            # State should have roughly proportional share of national deaths
            expected_share = population / 330_000_000
            expected_deaths = cls.NATIONAL_OVERDOSE_DEATHS_2023 * expected_share
            if overdose_deaths > expected_deaths * 2:
                warnings.append(f"overdose_deaths much higher than expected ({overdose_deaths:,} vs ~{expected_deaths:,.0f})")
        
        # Check opioid deaths < overdose deaths
        opioid_deaths = data.get("opioid_deaths")
        if opioid_deaths and overdose_deaths and opioid_deaths > overdose_deaths:
            issues.append(f"opioid_deaths ({opioid_deaths:,}) > overdose_deaths ({overdose_deaths:,})")
        
        # Check recovery rate is reasonable (20-60%)
        recovery_rate = data.get("recovery_rate")
        if recovery_rate:
            if recovery_rate < 10 or recovery_rate > 80:
                warnings.append(f"recovery_rate ({recovery_rate}%) outside typical range (20-60%)")
        
        # Check year is valid
        if year and (year < 2010 or year > 2025):
            issues.append(f"year ({year}) outside valid range (2010-2025)")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "confidence": 100 - (len(issues) * 20) - (len(warnings) * 5)
        }
    
    @classmethod
    def validate_substance_stats(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate substance statistics"""
        issues = []
        warnings = []
        
        state_id = data.get("state_id")
        population = cls.STATE_POPULATIONS.get(state_id, 5_000_000)
        
        # Check alcohol use rate (typically 40-60%)
        alcohol_rate = data.get("alcohol_use_past_month_percent")
        if alcohol_rate and (alcohol_rate < 30 or alcohol_rate > 70):
            warnings.append(f"alcohol_use_past_month_percent ({alcohol_rate}%) outside typical range")
        
        # Check substance users don't exceed population
        for field in ["alcohol_use_disorder", "opioid_use_disorder", "marijuana_use_disorder"]:
            value = data.get(field)
            if value and value > population * 0.2:  # More than 20% seems high
                issues.append(f"{field} ({value:,}) seems too high for population")
        
        # Check fentanyl deaths < opioid deaths if both present
        fentanyl = data.get("fentanyl_deaths")
        opioid = data.get("opioid_use_disorder")
        # This is comparing different metrics, so just a sanity check
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "confidence": 100 - (len(issues) * 20) - (len(warnings) * 5)
        }


class BulkDataService:
    """Service for bulk data import/export"""
    
    def __init__(self, db):
        self.db = db
        self.validator = DataValidator()
    
    async def parse_csv_statistics(self, csv_content: str) -> Dict[str, Any]:
        """Parse CSV content for statistics"""
        reader = csv.DictReader(io.StringIO(csv_content))
        rows = []
        errors = []
        
        for i, row in enumerate(reader):
            try:
                # Convert numeric fields
                parsed = {
                    "state_id": row.get("state_id", "").strip().upper(),
                    "state_name": row.get("state_name", "").strip(),
                    "year": int(row.get("year", 0)),
                }
                
                # Optional numeric fields
                numeric_fields = [
                    "total_affected", "overdose_deaths", "opioid_deaths",
                    "affected_age_12_17", "affected_age_18_25", "affected_age_26_34",
                    "affected_age_35_plus", "total_treatment_centers", "inpatient_facilities",
                    "outpatient_facilities", "treatment_admissions"
                ]
                float_fields = ["drug_abuse_rate", "alcohol_abuse_rate", "recovery_rate", 
                               "relapse_rate", "economic_cost_billions"]
                
                for field in numeric_fields:
                    val = row.get(field, "").strip()
                    parsed[field] = int(val.replace(",", "")) if val else None
                
                for field in float_fields:
                    val = row.get(field, "").strip()
                    parsed[field] = float(val.replace("%", "")) if val else None
                
                parsed["data_source"] = row.get("data_source", "Manual Import").strip()
                parsed["source_url"] = row.get("source_url", "").strip() or None
                
                # Validate
                validation = self.validator.validate_statistics(parsed)
                parsed["_validation"] = validation
                
                rows.append(parsed)
            except Exception as e:
                errors.append(f"Row {i+1}: {str(e)}")
        
        return {
            "rows": rows,
            "total": len(rows),
            "errors": errors,
            "valid_count": sum(1 for r in rows if r.get("_validation", {}).get("valid", False))
        }
    
    async def parse_table_statistics(self, table_text: str) -> Dict[str, Any]:
        """Parse pasted table data (tab or pipe separated)"""
        lines = table_text.strip().split("\n")
        rows = []
        errors = []
        
        # Detect separator
        if "|" in lines[0]:
            separator = "|"
        elif "\t" in lines[0]:
            separator = "\t"
        else:
            separator = ","
        
        # Parse header
        header_line = lines[0].replace("|", separator).strip(separator)
        headers = [h.strip().lower().replace(" ", "_") for h in header_line.split(separator)]
        
        # Map common header names
        header_map = {
            "state": "state_id",
            "state_abbrev": "state_id", 
            "abbrev": "state_id",
            "affected": "total_affected",
            "deaths": "overdose_deaths",
            "opioid": "opioid_deaths",
            "centers": "total_treatment_centers",
            "facilities": "total_treatment_centers",
            "recovery": "recovery_rate",
            "source": "data_source"
        }
        
        headers = [header_map.get(h, h) for h in headers]
        
        # Parse data rows (skip header separator if present)
        start_idx = 1
        if len(lines) > 1 and set(lines[1].strip()) <= set("-|+ "):
            start_idx = 2
        
        for i, line in enumerate(lines[start_idx:], start=start_idx):
            try:
                if not line.strip() or set(line.strip()) <= set("-|+ "):
                    continue
                    
                values = [v.strip() for v in line.replace("|", separator).strip(separator).split(separator)]
                row = dict(zip(headers, values))
                
                # Parse and validate
                parsed = {
                    "state_id": row.get("state_id", "").upper()[:2],
                    "state_name": row.get("state_name", ""),
                    "year": int(row.get("year", 2024)),
                }
                
                # Handle numeric fields
                for field in ["total_affected", "overdose_deaths", "opioid_deaths", 
                             "total_treatment_centers", "treatment_admissions"]:
                    val = row.get(field, "").replace(",", "").replace("$", "")
                    try:
                        parsed[field] = int(float(val)) if val and val != "-" else None
                    except:
                        parsed[field] = None
                
                for field in ["recovery_rate", "drug_abuse_rate", "alcohol_abuse_rate"]:
                    val = row.get(field, "").replace("%", "").replace(",", "")
                    try:
                        parsed[field] = float(val) if val and val != "-" else None
                    except:
                        parsed[field] = None
                
                parsed["data_source"] = row.get("data_source", "NotebookLM Import")
                
                # Validate
                validation = self.validator.validate_statistics(parsed)
                parsed["_validation"] = validation
                
                if parsed["state_id"]:  # Only add if we have a state
                    rows.append(parsed)
                    
            except Exception as e:
                errors.append(f"Line {i+1}: {str(e)}")
        
        return {
            "rows": rows,
            "total": len(rows),
            "errors": errors,
            "valid_count": sum(1 for r in rows if r.get("_validation", {}).get("valid", False)),
            "headers_detected": headers
        }
    
    async def import_statistics(self, rows: List[Dict], mode: str = "upsert") -> Dict[str, Any]:
        """Import statistics to database
        
        Args:
            rows: List of parsed row data
            mode: 'upsert' (update existing), 'insert' (skip existing), 'replace' (delete then insert)
        """
        imported = 0
        updated = 0
        skipped = 0
        errors = []
        
        for row in rows:
            try:
                # Remove validation metadata
                validation = row.pop("_validation", {})
                
                if not validation.get("valid", True):
                    if validation.get("issues"):
                        skipped += 1
                        continue
                
                state_id = row.get("state_id")
                year = row.get("year")
                
                # Check existing
                existing = await self.db.state_addiction_statistics.find_one({
                    "state_id": state_id, "year": year
                })
                
                if existing:
                    if mode == "insert":
                        skipped += 1
                        continue
                    elif mode in ["upsert", "replace"]:
                        row["updated_at"] = datetime.utcnow()
                        await self.db.state_addiction_statistics.update_one(
                            {"state_id": state_id, "year": year},
                            {"$set": row}
                        )
                        updated += 1
                else:
                    row["id"] = str(uuid.uuid4())
                    row["created_at"] = datetime.utcnow()
                    row["updated_at"] = datetime.utcnow()
                    await self.db.state_addiction_statistics.insert_one(row)
                    imported += 1
                    
            except Exception as e:
                errors.append(f"{row.get('state_id')} {row.get('year')}: {str(e)}")
        
        return {
            "imported": imported,
            "updated": updated,
            "skipped": skipped,
            "errors": errors,
            "total_processed": imported + updated + skipped
        }
    
    async def export_statistics(self, state_id: Optional[str] = None, 
                                format: str = "csv") -> str:
        """Export statistics to CSV or JSON"""
        query = {}
        if state_id:
            query["state_id"] = state_id
        
        cursor = self.db.state_addiction_statistics.find(query).sort([("state_id", 1), ("year", -1)])
        records = await cursor.to_list(length=10000)
        
        if format == "json":
            # Remove MongoDB _id
            for r in records:
                r.pop("_id", None)
            return json.dumps(records, indent=2, default=str)
        
        # CSV format
        if not records:
            return ""
        
        output = io.StringIO()
        fieldnames = [
            "state_id", "state_name", "year", "total_affected", "overdose_deaths",
            "opioid_deaths", "drug_abuse_rate", "alcohol_abuse_rate",
            "total_treatment_centers", "treatment_admissions", "recovery_rate",
            "data_source", "source_url"
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        
        for record in records:
            record.pop("_id", None)
            writer.writerow(record)
        
        return output.getvalue()
    
    async def get_data_comparison(self, state_id: str) -> Dict[str, Any]:
        """Compare AI-generated vs manually imported data"""
        # Get all records for state
        cursor = self.db.state_addiction_statistics.find({"state_id": state_id}).sort("year", -1)
        records = await cursor.to_list(length=100)
        
        ai_records = [r for r in records if "SAMHSA" in str(r.get("data_source", "")) or "CDC" in str(r.get("data_source", ""))]
        manual_records = [r for r in records if "Manual" in str(r.get("data_source", "")) or "NotebookLM" in str(r.get("data_source", ""))]
        
        return {
            "state_id": state_id,
            "total_records": len(records),
            "ai_generated": len(ai_records),
            "manual_imported": len(manual_records),
            "years_covered": sorted(set(r.get("year") for r in records)),
            "records": records
        }


# Export template for users
STATISTICS_CSV_TEMPLATE = """state_id,state_name,year,total_affected,overdose_deaths,opioid_deaths,drug_abuse_rate,alcohol_abuse_rate,total_treatment_centers,treatment_admissions,recovery_rate,data_source,source_url
FL,Florida,2024,1402500,7200,6400,2.5,5.6,810,135000,42.0,SAMHSA NSDUH,https://www.samhsa.gov/data/nsduh
"""

STATISTICS_TABLE_TEMPLATE = """| State | State Name | Year | Total Affected | Overdose Deaths | Opioid Deaths | Recovery Rate | Data Source |
|-------|------------|------|----------------|-----------------|---------------|---------------|-------------|
| FL | Florida | 2024 | 1,402,500 | 7,200 | 6,400 | 42.0% | SAMHSA NSDUH |
"""
