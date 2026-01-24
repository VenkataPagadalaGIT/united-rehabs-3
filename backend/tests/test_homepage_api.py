"""
Test suite for Homepage API endpoint /api/homepage/data
Tests the single optimized API call that returns all homepage data:
- national_stats
- top_states
- featured_centers
- faqs
- state_counts
- data_year
"""

import pytest
import requests
import os

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHomepageAPI:
    """Tests for /api/homepage/data endpoint"""
    
    def test_homepage_data_endpoint_returns_200(self):
        """Test that the homepage data endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Homepage data endpoint returns 200 OK")
    
    def test_homepage_data_has_all_required_keys(self):
        """Test that response contains all required keys"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        required_keys = ['national_stats', 'top_states', 'featured_centers', 'faqs', 'state_counts', 'data_year']
        
        for key in required_keys:
            assert key in data, f"Missing required key: {key}"
        
        print(f"✓ All required keys present: {required_keys}")
    
    def test_national_stats_structure(self):
        """Test national_stats has correct structure and values"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        national_stats = data.get('national_stats', {})
        
        # Check required fields
        expected_fields = ['total_affected', 'total_treatment_centers', 'avg_recovery_rate', 'total_treatment_admissions']
        for field in expected_fields:
            assert field in national_stats, f"Missing field in national_stats: {field}"
        
        # Validate values are reasonable
        assert national_stats['total_affected'] > 0, "total_affected should be positive"
        assert national_stats['total_treatment_centers'] > 0, "total_treatment_centers should be positive"
        assert 0 < national_stats['avg_recovery_rate'] < 100, "avg_recovery_rate should be between 0 and 100"
        assert national_stats['total_treatment_admissions'] > 0, "total_treatment_admissions should be positive"
        
        print(f"✓ national_stats structure valid: total_affected={national_stats['total_affected']}, centers={national_stats['total_treatment_centers']}, recovery_rate={national_stats['avg_recovery_rate']:.1f}%")
    
    def test_state_counts_returns_51_states(self):
        """Test that state_counts returns all 50 states + DC"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        state_counts = data.get('state_counts', [])
        
        assert len(state_counts) == 51, f"Expected 51 states (50 + DC), got {len(state_counts)}"
        
        # Check structure of first state
        if state_counts:
            first_state = state_counts[0]
            assert 'state_id' in first_state, "Missing state_id in state_counts"
            assert 'state_name' in first_state, "Missing state_name in state_counts"
            assert 'total_treatment_centers' in first_state, "Missing total_treatment_centers in state_counts"
        
        print(f"✓ state_counts returns {len(state_counts)} states")
    
    def test_state_counts_sorted_by_treatment_centers(self):
        """Test that state_counts is sorted by total_treatment_centers descending"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        state_counts = data.get('state_counts', [])
        
        # Check if sorted descending
        for i in range(len(state_counts) - 1):
            current = state_counts[i].get('total_treatment_centers', 0)
            next_val = state_counts[i + 1].get('total_treatment_centers', 0)
            assert current >= next_val, f"States not sorted: {state_counts[i]['state_name']} ({current}) should be >= {state_counts[i+1]['state_name']} ({next_val})"
        
        print(f"✓ state_counts sorted by treatment centers (top: {state_counts[0]['state_name']} with {state_counts[0]['total_treatment_centers']} centers)")
    
    def test_featured_centers_returns_data(self):
        """Test that featured_centers returns treatment center data"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        featured_centers = data.get('featured_centers', [])
        
        assert len(featured_centers) > 0, "featured_centers should not be empty"
        assert len(featured_centers) <= 8, f"featured_centers should have max 8 items, got {len(featured_centers)}"
        
        # Check structure of first center
        first_center = featured_centers[0]
        required_fields = ['id', 'name', 'city', 'state', 'rating']
        for field in required_fields:
            assert field in first_center, f"Missing field in featured_center: {field}"
        
        print(f"✓ featured_centers returns {len(featured_centers)} centers (first: {first_center['name']})")
    
    def test_featured_centers_have_valid_ratings(self):
        """Test that featured centers have valid ratings"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        featured_centers = data.get('featured_centers', [])
        
        for center in featured_centers:
            rating = center.get('rating', 0)
            assert 0 <= rating <= 5, f"Invalid rating {rating} for center {center.get('name')}"
        
        print(f"✓ All featured centers have valid ratings (0-5)")
    
    def test_top_states_returns_data(self):
        """Test that top_states returns top 10 states by affected population"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        top_states = data.get('top_states', [])
        
        assert len(top_states) == 10, f"Expected 10 top states, got {len(top_states)}"
        
        # Check structure
        if top_states:
            first_state = top_states[0]
            required_fields = ['state_id', 'state_name', 'total_affected', 'total_treatment_centers']
            for field in required_fields:
                assert field in first_state, f"Missing field in top_states: {field}"
        
        print(f"✓ top_states returns {len(top_states)} states (top: {top_states[0]['state_name']})")
    
    def test_faqs_returns_data(self):
        """Test that faqs returns FAQ data"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        faqs = data.get('faqs', [])
        
        # FAQs may be empty if no general FAQs exist, but should be a list
        assert isinstance(faqs, list), "faqs should be a list"
        
        if faqs:
            first_faq = faqs[0]
            assert 'question' in first_faq, "Missing question in FAQ"
            assert 'answer' in first_faq, "Missing answer in FAQ"
            print(f"✓ faqs returns {len(faqs)} FAQs")
        else:
            print("⚠ faqs is empty (no general FAQs in database)")
    
    def test_data_year_is_2025(self):
        """Test that data_year is 2025"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        data_year = data.get('data_year')
        
        assert data_year == 2025, f"Expected data_year 2025, got {data_year}"
        print(f"✓ data_year is {data_year}")
    
    def test_national_stats_total_matches_state_counts_sum(self):
        """Test that national total_treatment_centers matches sum of state_counts"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        national_total = data.get('national_stats', {}).get('total_treatment_centers', 0)
        state_counts = data.get('state_counts', [])
        
        state_sum = sum(s.get('total_treatment_centers', 0) for s in state_counts)
        
        # Allow small variance due to rounding
        assert abs(national_total - state_sum) < 10, f"National total ({national_total}) doesn't match state sum ({state_sum})"
        print(f"✓ National total ({national_total}) matches state sum ({state_sum})")


class TestHomepageDataIntegrity:
    """Tests for data integrity and consistency"""
    
    def test_california_is_top_state(self):
        """Test that California is in top states (largest population)"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        top_states = data.get('top_states', [])
        state_ids = [s.get('state_id') for s in top_states]
        
        assert 'CA' in state_ids, "California should be in top states"
        print(f"✓ California (CA) is in top states")
    
    def test_state_counts_have_positive_centers(self):
        """Test that all states have positive treatment center counts"""
        response = requests.get(f"{BASE_URL}/api/homepage/data")
        assert response.status_code == 200
        
        data = response.json()
        state_counts = data.get('state_counts', [])
        
        for state in state_counts:
            centers = state.get('total_treatment_centers', 0)
            assert centers > 0, f"State {state.get('state_name')} has {centers} centers (should be > 0)"
        
        print(f"✓ All {len(state_counts)} states have positive treatment center counts")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
