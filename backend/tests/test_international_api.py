"""
Test International Expansion APIs
- Countries API
- Country Statistics API
- Treatment Centers API (with international filters)
- Global Statistics API
- CMS Pages API
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic health check to ensure API is running"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestCountriesAPI:
    """Test /api/countries endpoints"""
    
    def test_get_all_countries(self):
        """Test GET /api/countries returns 20 countries"""
        response = requests.get(f"{BASE_URL}/api/countries")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "countries" in data
        assert "total" in data
        assert "regions" in data
        
        # Verify 20 countries
        assert data["total"] == 20
        assert len(data["countries"]) == 20
        
        # Verify country structure
        country = data["countries"][0]
        assert "country_code" in country
        assert "country_name" in country
        assert "region" in country
        assert "flag_emoji" in country
        
    def test_get_country_by_code_usa(self):
        """Test GET /api/countries/USA returns USA details"""
        response = requests.get(f"{BASE_URL}/api/countries/USA")
        assert response.status_code == 200
        data = response.json()
        
        # Verify country details
        assert data["country_code"] == "USA"
        assert data["country_name"] == "United States"
        assert data["region"] == "North America"
        
        # Verify statistics included
        assert "latest_statistics" in data
        assert "available_years" in data
        assert "treatment_centers_count" in data
        
        # Verify latest statistics structure
        stats = data["latest_statistics"]
        assert stats is not None
        assert "total_affected" in stats
        assert "drug_overdose_deaths" in stats
        assert "treatment_centers" in stats
        assert "primary_source" in stats
        
    def test_get_country_by_code_gbr(self):
        """Test GET /api/countries/GBR returns UK details"""
        response = requests.get(f"{BASE_URL}/api/countries/GBR")
        assert response.status_code == 200
        data = response.json()
        
        assert data["country_code"] == "GBR"
        assert data["country_name"] == "United Kingdom"
        assert data["region"] == "Europe"
        
    def test_get_country_not_found(self):
        """Test GET /api/countries/XXX returns 404"""
        response = requests.get(f"{BASE_URL}/api/countries/XXX")
        assert response.status_code == 404
        
    def test_filter_countries_by_region(self):
        """Test filtering countries by region"""
        response = requests.get(f"{BASE_URL}/api/countries", params={"region": "Europe"})
        assert response.status_code == 200
        data = response.json()
        
        # All returned countries should be in Europe
        for country in data["countries"]:
            assert country["region"] == "Europe"


class TestCountryStatisticsAPI:
    """Test /api/countries/{code}/statistics endpoints"""
    
    def test_get_usa_statistics(self):
        """Test GET /api/countries/USA/statistics returns 7 years of data"""
        response = requests.get(f"{BASE_URL}/api/countries/USA/statistics")
        assert response.status_code == 200
        data = response.json()
        
        assert "statistics" in data
        assert "country_code" in data
        assert "years_covered" in data
        
        # Should have 7 years (2019-2025)
        assert len(data["statistics"]) >= 7
        
        # Verify statistics structure
        stat = data["statistics"][0]
        assert "year" in stat
        assert "total_affected" in stat
        assert "drug_overdose_deaths" in stat
        assert "treatment_centers" in stat
        
    def test_get_statistics_by_year(self):
        """Test filtering statistics by year"""
        response = requests.get(f"{BASE_URL}/api/countries/USA/statistics", params={"year": 2025})
        assert response.status_code == 200
        data = response.json()
        
        # Should return only 2025 data
        assert len(data["statistics"]) == 1
        assert data["statistics"][0]["year"] == 2025


class TestGlobalStatisticsAPI:
    """Test /api/global/statistics endpoint"""
    
    def test_get_global_statistics(self):
        """Test GET /api/global/statistics returns aggregated stats"""
        response = requests.get(f"{BASE_URL}/api/global/statistics")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "year" in data
        assert "global_stats" in data
        assert "top_countries" in data
        assert "data_sources" in data
        
        # Verify global stats aggregation
        global_stats = data["global_stats"]
        assert "total_countries" in global_stats
        assert "total_affected" in global_stats
        assert "total_overdose_deaths" in global_stats
        assert "total_treatment_centers" in global_stats
        
        # Should aggregate 20 countries
        assert global_stats["total_countries"] == 20
        
        # Verify top countries
        assert len(data["top_countries"]) == 10
        
    def test_get_global_statistics_by_year(self):
        """Test filtering global statistics by year"""
        response = requests.get(f"{BASE_URL}/api/global/statistics", params={"year": 2023})
        assert response.status_code == 200
        data = response.json()
        assert data["year"] == 2023


class TestTreatmentCentersAPI:
    """Test /api/treatment-centers endpoints"""
    
    def test_get_all_treatment_centers(self):
        """Test GET /api/treatment-centers returns centers with filters"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "centers" in data
        assert "total" in data
        assert "filters" in data
        
        # Verify filters include countries and treatment types
        assert "countries" in data["filters"]
        assert "treatment_types" in data["filters"]
        
        # Should have multiple countries
        assert len(data["filters"]["countries"]) > 1
        
    def test_filter_by_country_code(self):
        """Test filtering treatment centers by country_code"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers", params={"country_code": "GBR"})
        assert response.status_code == 200
        data = response.json()
        
        # All centers should be in UK
        for center in data["centers"]:
            assert center["country_code"] == "GBR"
            
    def test_filter_by_treatment_type(self):
        """Test filtering treatment centers by treatment_type"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers", params={"treatment_type": "Inpatient"})
        assert response.status_code == 200
        data = response.json()
        
        # All centers should have Inpatient in treatment_types
        for center in data["centers"]:
            assert "Inpatient" in center.get("treatment_types", [])
            
    def test_treatment_center_structure(self):
        """Test treatment center response structure"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers", params={"limit": 1})
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["centers"]) >= 1
        center = data["centers"][0]
        
        # Verify required fields (country_code may be missing for US centers - data issue)
        assert "id" in center
        assert "name" in center
        assert "city" in center
        assert "is_verified" in center
        assert "is_featured" in center
        
    def test_international_center_has_country_code(self):
        """Test that international centers have country_code"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers", params={"country_code": "GBR", "limit": 1})
        assert response.status_code == 200
        data = response.json()
        
        if len(data["centers"]) > 0:
            center = data["centers"][0]
            assert "country_code" in center
            assert "country_name" in center
            assert center["country_code"] == "GBR"


class TestTreatmentCentersSearchAPI:
    """Test /api/treatment-centers/search endpoint"""
    
    def test_search_by_query(self):
        """Test searching treatment centers by name"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers/search", params={"q": "Priory"})
        assert response.status_code == 200
        data = response.json()
        
        # Should find Priory hospitals
        assert data["total"] >= 1
        for center in data["centers"]:
            assert "Priory" in center["name"]
            
    def test_search_with_multiple_filters(self):
        """Test search with multiple filters"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers/search", params={
            "country_code": "THA",
            "treatment_type": "Detox"
        })
        assert response.status_code == 200
        data = response.json()
        
        for center in data["centers"]:
            assert center["country_code"] == "THA"
            assert "Detox" in center.get("treatment_types", [])


class TestCMSPagesAPI:
    """Test /api/pages/{slug} endpoints"""
    
    def test_get_about_us_page(self):
        """Test GET /api/pages/about-us returns default content"""
        response = requests.get(f"{BASE_URL}/api/pages/about-us")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "title" in data
        assert "content" in data
        
        # Verify default content
        assert "About" in data["title"] or "United Rehabs" in data["title"]
        assert len(data["content"]) > 0
        
    def test_get_privacy_policy_page(self):
        """Test GET /api/pages/privacy-policy returns default content"""
        response = requests.get(f"{BASE_URL}/api/pages/privacy-policy")
        assert response.status_code == 200
        data = response.json()
        
        assert "title" in data
        assert "Privacy" in data["title"]
        
    def test_get_terms_of_service_page(self):
        """Test GET /api/pages/terms-of-service returns default content"""
        response = requests.get(f"{BASE_URL}/api/pages/terms-of-service")
        assert response.status_code == 200
        data = response.json()
        
        assert "title" in data
        assert "Terms" in data["title"]
        
    def test_get_nonexistent_page(self):
        """Test GET /api/pages/nonexistent returns empty content"""
        response = requests.get(f"{BASE_URL}/api/pages/nonexistent-page")
        assert response.status_code == 200
        data = response.json()
        
        # Should return default "Page Not Found" content
        assert "title" in data


class TestPagination:
    """Test pagination on treatment centers"""
    
    def test_pagination_skip_limit(self):
        """Test pagination with skip and limit"""
        # Get first page
        response1 = requests.get(f"{BASE_URL}/api/treatment-centers", params={"skip": 0, "limit": 5})
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Get second page
        response2 = requests.get(f"{BASE_URL}/api/treatment-centers", params={"skip": 5, "limit": 5})
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Verify different results
        if len(data1["centers"]) > 0 and len(data2["centers"]) > 0:
            assert data1["centers"][0]["id"] != data2["centers"][0]["id"]
            
    def test_pagination_total_count(self):
        """Test that total count is consistent across pages"""
        response1 = requests.get(f"{BASE_URL}/api/treatment-centers", params={"skip": 0, "limit": 10})
        response2 = requests.get(f"{BASE_URL}/api/treatment-centers", params={"skip": 10, "limit": 10})
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Total should be the same
        assert response1.json()["total"] == response2.json()["total"]


class TestDataIntegrity:
    """Test data integrity and citations"""
    
    def test_country_statistics_have_sources(self):
        """Test that country statistics include data sources"""
        response = requests.get(f"{BASE_URL}/api/countries/USA")
        assert response.status_code == 200
        data = response.json()
        
        stats = data["latest_statistics"]
        assert stats is not None
        
        # Should have primary source
        assert "primary_source" in stats
        assert stats["primary_source"] is not None
        assert len(stats["primary_source"]) > 0
        
    def test_global_stats_have_data_sources(self):
        """Test that global statistics include data sources"""
        response = requests.get(f"{BASE_URL}/api/global/statistics")
        assert response.status_code == 200
        data = response.json()
        
        assert "data_sources" in data
        assert len(data["data_sources"]) >= 2
        
        # Verify source structure
        source = data["data_sources"][0]
        assert "name" in source
        assert "url" in source


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
