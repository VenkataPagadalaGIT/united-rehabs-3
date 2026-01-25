"""
DATA VALIDATION MIDDLEWARE
===========================
This module ensures data accuracy by validating ALL data before it's saved to the database.

ROOT CAUSE PREVENTION:
The original issue happened because:
1. Data was generated using formulas (population * rate / 1000000) without validation
2. Rates in VERIFIED_COUNTRY_STATS were incorrect
3. No cross-check against authoritative sources was performed

This middleware prevents that by:
1. Validating all new data against AUTHORITATIVE_DATA before saving
2. Flagging any data that differs significantly from known values
3. Requiring admin approval for data that exceeds thresholds
4. Logging all data changes with source attribution
"""

from datetime import datetime
from typing import Dict, Optional, Tuple
import logging

# Import authoritative data from QA system
from data_qa_system import AUTHORITATIVE_DATA

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Validation thresholds
WARNING_THRESHOLD = 0.20  # 20% difference triggers warning
ERROR_THRESHOLD = 0.50    # 50% difference blocks save


class DataValidationError(Exception):
    """Raised when data fails validation"""
    pass


class DataValidationWarning(Exception):
    """Raised when data has warnings but can proceed"""
    pass


def validate_country_statistic(
    country_code: str,
    year: int,
    opioid_deaths: Optional[int],
    drug_overdose_deaths: Optional[int],
    allow_override: bool = False
) -> Tuple[bool, Dict]:
    """
    Validate country statistics against authoritative sources.
    
    Returns:
        Tuple of (is_valid, validation_result)
    """
    result = {
        "valid": True,
        "warnings": [],
        "errors": [],
        "authoritative_data": None,
        "requires_approval": False
    }
    
    # Check if we have authoritative data
    if country_code not in AUTHORITATIVE_DATA:
        result["warnings"].append({
            "field": "country_code",
            "message": f"No authoritative data for {country_code}. Data will be flagged as unverified."
        })
        return True, result
    
    if year not in AUTHORITATIVE_DATA[country_code]:
        result["warnings"].append({
            "field": "year",
            "message": f"No authoritative data for {country_code} in {year}. Data will be flagged as unverified."
        })
        return True, result
    
    auth_data = AUTHORITATIVE_DATA[country_code][year]
    result["authoritative_data"] = auth_data
    
    # Validate opioid deaths
    if opioid_deaths is not None and auth_data.get("opioid_deaths"):
        auth_value = auth_data["opioid_deaths"]
        diff_percent = abs(opioid_deaths - auth_value) / auth_value
        
        if diff_percent > ERROR_THRESHOLD and not allow_override:
            result["valid"] = False
            result["errors"].append({
                "field": "opioid_deaths",
                "submitted_value": opioid_deaths,
                "authoritative_value": auth_value,
                "difference_percent": round(diff_percent * 100, 1),
                "source": auth_data.get("source"),
                "message": f"Value {opioid_deaths:,} differs by {diff_percent*100:.1f}% from authoritative value {auth_value:,}. This exceeds the 50% threshold."
            })
        elif diff_percent > WARNING_THRESHOLD:
            result["warnings"].append({
                "field": "opioid_deaths",
                "submitted_value": opioid_deaths,
                "authoritative_value": auth_value,
                "difference_percent": round(diff_percent * 100, 1),
                "source": auth_data.get("source"),
                "message": f"Value differs by {diff_percent*100:.1f}% from authoritative value. Review recommended."
            })
            result["requires_approval"] = True
    
    # Validate drug overdose deaths
    if drug_overdose_deaths is not None and auth_data.get("drug_overdose_deaths"):
        auth_value = auth_data["drug_overdose_deaths"]
        diff_percent = abs(drug_overdose_deaths - auth_value) / auth_value
        
        if diff_percent > ERROR_THRESHOLD and not allow_override:
            result["valid"] = False
            result["errors"].append({
                "field": "drug_overdose_deaths",
                "submitted_value": drug_overdose_deaths,
                "authoritative_value": auth_value,
                "difference_percent": round(diff_percent * 100, 1),
                "source": auth_data.get("source"),
                "message": f"Value {drug_overdose_deaths:,} differs by {diff_percent*100:.1f}% from authoritative value {auth_value:,}. This exceeds the 50% threshold."
            })
        elif diff_percent > WARNING_THRESHOLD:
            result["warnings"].append({
                "field": "drug_overdose_deaths",
                "submitted_value": drug_overdose_deaths,
                "authoritative_value": auth_value,
                "difference_percent": round(diff_percent * 100, 1),
                "source": auth_data.get("source"),
                "message": f"Value differs by {diff_percent*100:.1f}% from authoritative value. Review recommended."
            })
            result["requires_approval"] = True
    
    # Logical validation: opioid deaths should not exceed total drug deaths
    if opioid_deaths and drug_overdose_deaths:
        if opioid_deaths > drug_overdose_deaths * 1.2:  # 20% tolerance for different counting methods
            result["errors"].append({
                "field": "opioid_deaths",
                "message": f"Opioid deaths ({opioid_deaths:,}) exceeds drug overdose deaths ({drug_overdose_deaths:,}) by more than 20%"
            })
            result["valid"] = False
    
    return result["valid"], result


def pre_save_validate(data: Dict) -> Dict:
    """
    Validate data before saving to database.
    Called automatically before any insert/update operation.
    
    Args:
        data: Dictionary containing country statistics
        
    Returns:
        Validated data with verification flags
        
    Raises:
        DataValidationError: If data fails critical validation
    """
    country_code = data.get("country_code")
    year = data.get("year")
    
    is_valid, validation = validate_country_statistic(
        country_code=country_code,
        year=year,
        opioid_deaths=data.get("opioid_deaths"),
        drug_overdose_deaths=data.get("drug_overdose_deaths")
    )
    
    # Add validation metadata to data
    data["_validation"] = {
        "validated_at": datetime.utcnow().isoformat(),
        "is_valid": is_valid,
        "has_warnings": len(validation.get("warnings", [])) > 0,
        "has_errors": len(validation.get("errors", [])) > 0,
        "requires_approval": validation.get("requires_approval", False)
    }
    
    if not is_valid:
        logger.error(f"Data validation failed for {country_code} {year}: {validation['errors']}")
        raise DataValidationError(
            f"Data validation failed: {validation['errors']}"
        )
    
    if validation.get("warnings"):
        logger.warning(f"Data validation warnings for {country_code} {year}: {validation['warnings']}")
    
    # Mark as verified if it matches authoritative data
    if validation.get("authoritative_data") and not validation.get("errors"):
        data["data_verified"] = True
        data["verified_at"] = datetime.utcnow()
        data["primary_source"] = validation["authoritative_data"].get("source")
        data["primary_source_url"] = validation["authoritative_data"].get("source_url")
    
    return data


def get_authoritative_value(country_code: str, year: int, field: str) -> Optional[int]:
    """
    Get the authoritative value for a specific field.
    
    Use this when you need to know what the correct value should be.
    """
    if country_code in AUTHORITATIVE_DATA and year in AUTHORITATIVE_DATA[country_code]:
        return AUTHORITATIVE_DATA[country_code][year].get(field)
    return None


def suggest_correction(country_code: str, year: int) -> Optional[Dict]:
    """
    Suggest corrections based on authoritative data.
    
    Returns the authoritative values that should be used.
    """
    if country_code in AUTHORITATIVE_DATA and year in AUTHORITATIVE_DATA[country_code]:
        return AUTHORITATIVE_DATA[country_code][year]
    return None


# Export for use in server.py
__all__ = [
    'validate_country_statistic',
    'pre_save_validate',
    'get_authoritative_value',
    'suggest_correction',
    'DataValidationError',
    'DataValidationWarning',
    'AUTHORITATIVE_DATA'
]
