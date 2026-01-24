"""
Test suite for new features:
- Interactive Global Map (country navigation)
- Country Comparison Tool
- Data Export endpoints
- Draft/Review/Publish workflow
- CMS pages (About Us, Privacy Policy)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ API health check passed")
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "United Rehabs API" in data["message"]
        print("✓ API root check passed")


class TestAuthentication:
    """Authentication tests for admin features"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@unitedrehabs.com",
            "password": "admin_password"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@unitedrehabs.com",
            "password": "admin_password"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "admin@unitedrehabs.com"
        print("✓ Admin login passed")
    
    def test_invalid_login(self):
        """Test invalid login credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")


class TestCountriesAPI:
    """Tests for countries API - used by Interactive Global Map"""
    
    def test_get_all_countries(self):
        """Test getting all countries"""
        response = requests.get(f"{BASE_URL}/api/countries")
        assert response.status_code == 200
        data = response.json()
        assert "countries" in data
        assert "total" in data
        assert data["total"] >= 50  # Should have many countries
        print(f"✓ Countries list: {data['total']} countries found")
    
    def test_get_country_by_code_usa(self):
        """Test getting USA country details"""
        response = requests.get(f"{BASE_URL}/api/countries/USA")
        assert response.status_code == 200
        data = response.json()
        assert data["country_code"] == "USA"
        assert "country_name" in data
        print(f"✓ USA country details: {data.get('country_name')}")
    
    def test_get_country_by_code_gbr(self):
        """Test getting UK country details"""
        response = requests.get(f"{BASE_URL}/api/countries/GBR")
        assert response.status_code == 200
        data = response.json()
        assert data["country_code"] == "GBR"
        print(f"✓ GBR country details: {data.get('country_name')}")
    
    def test_get_country_by_code_deu(self):
        """Test getting Germany country details"""
        response = requests.get(f"{BASE_URL}/api/countries/DEU")
        assert response.status_code == 200
        data = response.json()
        assert data["country_code"] == "DEU"
        print(f"✓ DEU country details: {data.get('country_name')}")
    
    def test_get_country_statistics(self):
        """Test getting country statistics for comparison"""
        response = requests.get(f"{BASE_URL}/api/countries/USA/statistics")
        assert response.status_code == 200
        data = response.json()
        assert "statistics" in data
        assert data["country_code"] == "USA"
        print(f"✓ USA statistics: {len(data.get('statistics', []))} records")
    
    def test_get_country_statistics_with_year(self):
        """Test getting country statistics for specific year"""
        response = requests.get(f"{BASE_URL}/api/countries/USA/statistics?year=2025")
        assert response.status_code == 200
        data = response.json()
        assert "statistics" in data
        print(f"✓ USA 2025 statistics retrieved")
    
    def test_get_countries_by_region(self):
        """Test filtering countries by region"""
        response = requests.get(f"{BASE_URL}/api/countries?region=Europe")
        assert response.status_code == 200
        data = response.json()
        assert "countries" in data
        print(f"✓ European countries: {len(data.get('countries', []))} found")


class TestCountryComparisonData:
    """Tests for data needed by Country Comparison page"""
    
    def test_compare_multiple_countries_stats(self):
        """Test getting stats for multiple countries (USA, GBR, DEU)"""
        countries = ["USA", "GBR", "DEU"]
        stats = []
        for code in countries:
            response = requests.get(f"{BASE_URL}/api/countries/{code}/statistics?year=2025")
            assert response.status_code == 200
            data = response.json()
            if data.get("statistics"):
                stats.append(data["statistics"][0])
        
        assert len(stats) >= 1  # At least one country should have stats
        print(f"✓ Comparison data: {len(stats)} countries have 2025 statistics")
    
    def test_global_statistics(self):
        """Test global statistics endpoint"""
        response = requests.get(f"{BASE_URL}/api/global/statistics?year=2025")
        assert response.status_code == 200
        data = response.json()
        assert "year" in data
        assert "global_stats" in data
        print(f"✓ Global statistics retrieved for year {data.get('year')}")


class TestDataExportEndpoints:
    """Tests for data export endpoints - require admin auth"""
    
    @pytest.fixture
    def admin_headers(self):
        """Get admin authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@unitedrehabs.com",
            "password": "admin_password"
        })
        if response.status_code == 200:
            token = response.json().get("access_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin authentication failed")
    
    def test_export_countries_json(self, admin_headers):
        """Test exporting country statistics as JSON"""
        response = requests.get(
            f"{BASE_URL}/api/export/countries?format=json",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "count" in data
        print(f"✓ Export countries JSON: {data.get('count')} records")
    
    def test_export_statistics_json(self, admin_headers):
        """Test exporting state statistics as JSON"""
        response = requests.get(
            f"{BASE_URL}/api/export/statistics?format=json",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "count" in data
        print(f"✓ Export statistics JSON: {data.get('count')} records")
    
    def test_export_treatment_centers_json(self, admin_headers):
        """Test exporting treatment centers as JSON"""
        response = requests.get(
            f"{BASE_URL}/api/export/treatment-centers?format=json",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "count" in data
        print(f"✓ Export treatment centers JSON: {data.get('count')} records")
    
    def test_export_requires_auth(self):
        """Test that export endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/export/countries?format=json")
        assert response.status_code == 403
        print("✓ Export endpoints correctly require authentication")


class TestStatusWorkflow:
    """Tests for Draft -> Review -> Publish workflow"""
    
    @pytest.fixture
    def admin_headers(self):
        """Get admin authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@unitedrehabs.com",
            "password": "admin_password"
        })
        if response.status_code == 200:
            token = response.json().get("access_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin authentication failed")
    
    def test_get_pending_review_statistics(self, admin_headers):
        """Test getting statistics pending review"""
        response = requests.get(
            f"{BASE_URL}/api/statistics/pending-review",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "pending" in data
        assert "count" in data
        print(f"✓ Pending review: {data.get('count')} items")
    
    def test_status_update_requires_auth(self):
        """Test that status update requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/statistics/test-id/status",
            json={"status": "review"}
        )
        assert response.status_code == 403
        print("✓ Status update correctly requires authentication")
    
    def test_status_update_invalid_status(self, admin_headers):
        """Test that invalid status is rejected"""
        # First get a valid statistic ID
        stats_response = requests.get(f"{BASE_URL}/api/statistics?limit=1")
        if stats_response.status_code != 200 or not stats_response.json():
            pytest.skip("No statistics available for testing")
        
        stat_id = stats_response.json()[0].get("id")
        if not stat_id:
            pytest.skip("No statistic ID found")
        
        response = requests.put(
            f"{BASE_URL}/api/statistics/{stat_id}/status",
            headers=admin_headers,
            json={"status": "invalid_status"}
        )
        assert response.status_code == 400
        print("✓ Invalid status correctly rejected")


class TestCMSPages:
    """Tests for CMS pages (About Us, Privacy Policy)"""
    
    def test_get_about_us_page(self):
        """Test getting About Us page content"""
        response = requests.get(f"{BASE_URL}/api/pages/about-us")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "content" in data
        print(f"✓ About Us page: '{data.get('title')}'")
    
    def test_get_privacy_policy_page(self):
        """Test getting Privacy Policy page content"""
        response = requests.get(f"{BASE_URL}/api/pages/privacy-policy")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "content" in data
        print(f"✓ Privacy Policy page: '{data.get('title')}'")
    
    def test_get_terms_of_service_page(self):
        """Test getting Terms of Service page content"""
        response = requests.get(f"{BASE_URL}/api/pages/terms-of-service")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        print(f"✓ Terms of Service page: '{data.get('title')}'")


class TestTreatmentCenters:
    """Tests for treatment centers API"""
    
    def test_get_treatment_centers(self):
        """Test getting treatment centers list"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers")
        assert response.status_code == 200
        data = response.json()
        assert "centers" in data
        assert "total" in data
        print(f"✓ Treatment centers: {data.get('total')} total")
    
    def test_get_treatment_centers_by_country(self):
        """Test filtering treatment centers by country"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers?country_code=USA")
        assert response.status_code == 200
        data = response.json()
        assert "centers" in data
        print(f"✓ USA treatment centers: {len(data.get('centers', []))} found")
    
    def test_search_treatment_centers(self):
        """Test searching treatment centers"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers/search?q=recovery")
        assert response.status_code == 200
        data = response.json()
        assert "centers" in data
        assert "total" in data
        print(f"✓ Search 'recovery': {data.get('total')} results")


class TestHomepageData:
    """Tests for homepage data endpoints"""
    
    def test_homepage_data(self):
        """Test homepage data endpoint"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        data = response.json()
        assert "featured_centers" in data or "national_stats" in data
        print("✓ Homepage data retrieved")
    
    def test_international_homepage_data(self):
        """Test international homepage data endpoint"""
        response = requests.get(f"{BASE_URL}/api/homepage/data/international")
        assert response.status_code == 200
        data = response.json()
        assert "global_stats" in data or "top_countries" in data
        print("✓ International homepage data retrieved")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
