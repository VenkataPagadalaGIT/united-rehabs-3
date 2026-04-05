"""
Test suite for i18n (internationalization) and CMS features
Tests: Auth, CMS pages, Countries, Treatment Centers APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@unitedrehabs.com"
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "admin_password")


class TestHealthCheck:
    """Health check tests - run first"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"API Health: {data}")


class TestAuthentication:
    """Authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print(f"Admin login successful: {data['user']['email']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Invalid credentials correctly rejected")
    
    def test_get_current_user(self):
        """Test getting current user info"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"Current user: {data}")


class TestCMSPages:
    """CMS Pages API tests"""
    
    def test_get_about_page(self):
        """Test getting about-us page"""
        response = requests.get(f"{BASE_URL}/api/pages/about-us")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "content" in data
        print(f"About page title: {data.get('title', 'N/A')}")
    
    def test_get_privacy_policy(self):
        """Test getting privacy-policy page"""
        response = requests.get(f"{BASE_URL}/api/pages/privacy-policy")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        print(f"Privacy policy title: {data.get('title', 'N/A')}")
    
    def test_get_terms_of_service(self):
        """Test getting terms-of-service page"""
        response = requests.get(f"{BASE_URL}/api/pages/terms-of-service")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        print(f"Terms of service title: {data.get('title', 'N/A')}")
    
    def test_update_cms_page_requires_auth(self):
        """Test that updating CMS page requires authentication"""
        response = requests.put(f"{BASE_URL}/api/pages/about-us", json={
            "title": "Test Title",
            "content": "Test Content",
            "is_published": True
        })
        assert response.status_code == 403
        print("CMS update correctly requires authentication")


class TestCountries:
    """Countries API tests"""
    
    def test_get_countries_list(self):
        """Test getting list of countries"""
        response = requests.get(f"{BASE_URL}/api/countries")
        assert response.status_code == 200
        data = response.json()
        assert "countries" in data
        assert "total" in data
        assert data["total"] > 0
        print(f"Total countries: {data['total']}")
    
    def test_get_country_by_code(self):
        """Test getting country by code (Nigeria - 3-letter ISO code)"""
        response = requests.get(f"{BASE_URL}/api/countries/NGA")
        assert response.status_code == 200
        data = response.json()
        assert data["country_code"] == "NGA"
        assert "country_name" in data
        print(f"Country: {data.get('country_name', 'N/A')}")
    
    def test_get_country_statistics(self):
        """Test getting country statistics"""
        response = requests.get(f"{BASE_URL}/api/countries/NGA/statistics")
        assert response.status_code == 200
        data = response.json()
        assert "statistics" in data
        assert data["country_code"] == "NGA"
        print(f"Nigeria statistics years: {data.get('years_covered', [])}")
    
    def test_get_country_treatment_centers(self):
        """Test getting treatment centers for a country"""
        response = requests.get(f"{BASE_URL}/api/countries/US/centers")
        assert response.status_code == 200
        data = response.json()
        assert "centers" in data
        assert "total" in data
        print(f"US treatment centers: {data['total']}")


class TestTreatmentCenters:
    """Treatment Centers API tests"""
    
    def test_get_treatment_centers(self):
        """Test getting treatment centers list"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers")
        assert response.status_code == 200
        data = response.json()
        assert "centers" in data
        assert "total" in data
        assert "filters" in data
        print(f"Total treatment centers: {data['total']}")
    
    def test_search_treatment_centers(self):
        """Test searching treatment centers"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers/search?q=recovery")
        assert response.status_code == 200
        data = response.json()
        assert "centers" in data
        print(f"Search results: {data['total']} centers found")
    
    def test_filter_by_country(self):
        """Test filtering treatment centers by country"""
        response = requests.get(f"{BASE_URL}/api/treatment-centers?country_code=US")
        assert response.status_code == 200
        data = response.json()
        assert "centers" in data
        # Verify all returned centers are from US
        for center in data["centers"]:
            assert center["country_code"] == "US"
        print(f"US centers: {data['total']}")


class TestHomepageData:
    """Homepage data API tests"""
    
    def test_get_homepage_data(self):
        """Test getting homepage data"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        data = response.json()
        assert "national_stats" in data
        assert "featured_centers" in data
        print(f"Homepage data loaded successfully")
    
    def test_get_international_homepage_data(self):
        """Test getting international homepage data"""
        response = requests.get(f"{BASE_URL}/api/homepage/data/international")
        assert response.status_code == 200
        data = response.json()
        assert "global_stats" in data
        assert "top_countries" in data
        assert "featured_centers" in data
        print(f"International homepage data loaded successfully")


class TestGlobalStatistics:
    """Global statistics API tests"""
    
    def test_get_global_statistics(self):
        """Test getting global statistics"""
        response = requests.get(f"{BASE_URL}/api/global/statistics")
        assert response.status_code == 200
        data = response.json()
        assert "year" in data
        assert "global_stats" in data
        assert "top_countries" in data
        print(f"Global statistics for year: {data['year']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
