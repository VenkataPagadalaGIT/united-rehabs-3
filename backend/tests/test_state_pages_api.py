"""
Backend API Tests for State Pages (Statistics, Resources, FAQs)
Tests the API endpoints used by the public-facing state pages.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://globaladdicts.preview.emergentagent.com')


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test that the health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"Health check passed: {data}")


class TestStatisticsAPI:
    """State Statistics API tests"""
    
    def test_get_florida_statistics(self):
        """Test GET /api/statistics?state_id=FL returns Florida data"""
        response = requests.get(f"{BASE_URL}/api/statistics", params={"state_id": "FL"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected Florida statistics data"
        
        # Verify first record is Florida
        first_record = data[0]
        assert first_record["state_id"] == "FL"
        assert first_record["state_name"] == "Florida"
        assert "total_affected" in first_record
        assert "overdose_deaths" in first_record
        assert "year" in first_record
        print(f"Florida statistics: {len(data)} records found, latest year: {first_record['year']}")
    
    def test_get_california_statistics(self):
        """Test GET /api/statistics?state_id=CA returns California data"""
        response = requests.get(f"{BASE_URL}/api/statistics", params={"state_id": "CA"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected California statistics data"
        
        # Verify first record is California
        first_record = data[0]
        assert first_record["state_id"] == "CA"
        assert first_record["state_name"] == "California"
        print(f"California statistics: {len(data)} records found, latest year: {first_record['year']}")
    
    def test_statistics_data_structure(self):
        """Test that statistics data has expected structure"""
        response = requests.get(f"{BASE_URL}/api/statistics", params={"state_id": "FL", "limit": 1})
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        
        record = data[0]
        # Required fields
        assert "id" in record
        assert "state_id" in record
        assert "state_name" in record
        assert "year" in record
        assert "created_at" in record
        assert "updated_at" in record
        
        # Optional but expected fields
        expected_fields = [
            "total_affected", "overdose_deaths", "opioid_deaths",
            "drug_abuse_rate", "alcohol_abuse_rate", "recovery_rate",
            "total_treatment_centers", "treatment_admissions"
        ]
        for field in expected_fields:
            assert field in record, f"Missing field: {field}"
        print(f"Statistics data structure validated: {list(record.keys())}")


class TestResourcesAPI:
    """Free Resources API tests"""
    
    def test_get_florida_resources(self):
        """Test GET /api/resources?state_id=FL returns Florida and nationwide resources"""
        response = requests.get(f"{BASE_URL}/api/resources", params={"state_id": "FL"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected resources data"
        
        # Check for both nationwide and state-specific resources
        nationwide_count = sum(1 for r in data if r.get("is_nationwide"))
        state_count = sum(1 for r in data if not r.get("is_nationwide"))
        
        print(f"Florida resources: {len(data)} total, {nationwide_count} nationwide, {state_count} state-specific")
        assert nationwide_count > 0 or state_count > 0, "Expected at least some resources"
    
    def test_resources_include_nationwide(self):
        """Test that state resources query includes nationwide resources"""
        response = requests.get(f"{BASE_URL}/api/resources", params={"state_id": "FL"})
        assert response.status_code == 200
        data = response.json()
        
        # Should include SAMHSA National Helpline (nationwide)
        nationwide_resources = [r for r in data if r.get("is_nationwide")]
        assert len(nationwide_resources) > 0, "Expected nationwide resources to be included"
        
        # Check for SAMHSA helpline
        samhsa = next((r for r in nationwide_resources if "SAMHSA" in r.get("title", "")), None)
        assert samhsa is not None, "Expected SAMHSA National Helpline in resources"
        print(f"Found SAMHSA helpline: {samhsa['title']}")
    
    def test_resources_data_structure(self):
        """Test that resources data has expected structure"""
        response = requests.get(f"{BASE_URL}/api/resources", params={"state_id": "FL", "limit": 1})
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        
        record = data[0]
        # Required fields
        assert "id" in record
        assert "title" in record
        assert "is_nationwide" in record
        assert "is_free" in record
        
        # Optional but expected fields
        expected_fields = ["description", "phone", "website", "resource_type"]
        for field in expected_fields:
            assert field in record, f"Missing field: {field}"
        print(f"Resources data structure validated: {list(record.keys())}")


class TestFAQsAPI:
    """FAQs API tests"""
    
    def test_get_florida_faqs(self):
        """Test GET /api/faqs?state_id=FL returns FAQs for Florida"""
        response = requests.get(f"{BASE_URL}/api/faqs", params={"state_id": "FL"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected FAQs data"
        
        # Check for Florida-specific and general FAQs
        florida_faqs = [f for f in data if f.get("state_id") == "FL"]
        general_faqs = [f for f in data if f.get("state_id") is None]
        
        print(f"Florida FAQs: {len(data)} total, {len(florida_faqs)} FL-specific, {len(general_faqs)} general")
    
    def test_faqs_include_general(self):
        """Test that state FAQs query includes general FAQs (state_id=None)"""
        response = requests.get(f"{BASE_URL}/api/faqs", params={"state_id": "FL"})
        assert response.status_code == 200
        data = response.json()
        
        # Should include general FAQs (state_id is None)
        general_faqs = [f for f in data if f.get("state_id") is None]
        assert len(general_faqs) > 0, "Expected general FAQs to be included"
        print(f"Found {len(general_faqs)} general FAQs")
    
    def test_faqs_data_structure(self):
        """Test that FAQs data has expected structure"""
        response = requests.get(f"{BASE_URL}/api/faqs", params={"state_id": "FL", "limit": 1})
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        
        record = data[0]
        # Required fields
        assert "id" in record
        assert "question" in record
        assert "answer" in record
        assert "is_active" in record
        
        # Verify question and answer are not empty
        assert len(record["question"]) > 0, "Question should not be empty"
        assert len(record["answer"]) > 0, "Answer should not be empty"
        print(f"FAQs data structure validated: {list(record.keys())}")


class TestStateIdFormat:
    """Tests to verify state_id format (uppercase abbreviation)"""
    
    def test_statistics_uses_uppercase_state_id(self):
        """Verify statistics API uses uppercase state_id (FL, CA, etc.)"""
        # Test with uppercase (should work)
        response_upper = requests.get(f"{BASE_URL}/api/statistics", params={"state_id": "FL"})
        assert response_upper.status_code == 200
        data_upper = response_upper.json()
        assert len(data_upper) > 0, "Expected data with uppercase state_id"
        
        # Test with lowercase (should return empty or different results)
        response_lower = requests.get(f"{BASE_URL}/api/statistics", params={"state_id": "fl"})
        assert response_lower.status_code == 200
        data_lower = response_lower.json()
        
        # Lowercase should return empty (database uses uppercase)
        assert len(data_lower) == 0, "Lowercase state_id should not match database records"
        print("State ID format test passed: uppercase required")
    
    def test_resources_uses_uppercase_state_id(self):
        """Verify resources API uses uppercase state_id"""
        response = requests.get(f"{BASE_URL}/api/resources", params={"state_id": "FL"})
        assert response.status_code == 200
        data = response.json()
        
        # Check that state-specific resources have uppercase state_id
        state_resources = [r for r in data if r.get("state_id") and not r.get("is_nationwide")]
        for resource in state_resources:
            assert resource["state_id"] == resource["state_id"].upper(), "state_id should be uppercase"
        print("Resources state_id format validated")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
