#!/usr/bin/env python3
"""
United Rehabs Backend API Test Suite
Tests all backend endpoints for the FastAPI + MongoDB migration
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://rehab-migration.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@unitedrehabs.com"
ADMIN_PASSWORD = "Admin123!"

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def test_health_check(self):
        """Test basic health endpoints"""
        try:
            # Test root endpoint
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Root endpoint", True, f"Status: {data.get('status', 'N/A')}")
            else:
                self.log_test("Root endpoint", False, f"Status code: {response.status_code}", response.text)
            
            # Test health endpoint
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health check", True, f"Status: {data.get('status', 'N/A')}")
            else:
                self.log_test("Health check", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Health endpoints", False, f"Exception: {str(e)}")

    def test_authentication(self):
        """Test authentication endpoints"""
        try:
            # Test login with admin credentials
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                user_info = data.get("user", {})
                self.log_test("Admin login", True, 
                             f"User: {user_info.get('email')}, Role: {user_info.get('role')}")
                
                # Set authorization header for future requests
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                
                # Test /auth/me endpoint
                me_response = self.session.get(f"{self.base_url}/auth/me")
                if me_response.status_code == 200:
                    me_data = me_response.json()
                    self.log_test("Get current user (/auth/me)", True, 
                                 f"Email: {me_data.get('email')}, Role: {me_data.get('role')}")
                else:
                    self.log_test("Get current user (/auth/me)", False, 
                                 f"Status code: {me_response.status_code}", me_response.text)
                    
            else:
                self.log_test("Admin login", False, 
                             f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Authentication", False, f"Exception: {str(e)}")
            return False
            
        return True

    def test_dashboard(self):
        """Test dashboard endpoints"""
        try:
            response = self.session.get(f"{self.base_url}/dashboard/counts")
            
            if response.status_code == 200:
                data = response.json()
                counts_summary = ", ".join([f"{k}: {v}" for k, v in data.items()])
                self.log_test("Dashboard counts", True, f"Counts: {counts_summary}")
            else:
                self.log_test("Dashboard counts", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Dashboard", False, f"Exception: {str(e)}")

    def test_state_statistics(self):
        """Test state statistics CRUD operations"""
        try:
            # Test GET all statistics
            response = self.session.get(f"{self.base_url}/statistics")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all state statistics", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all state statistics", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new statistic
            test_stat = {
                "state_id": "CA",
                "state_name": "California",
                "year": 2024,
                "total_affected": 500000,
                "overdose_deaths": 5000,
                "opioid_deaths": 3000,
                "drug_abuse_rate": 12.5,
                "alcohol_abuse_rate": 8.2,
                "total_treatment_centers": 250,
                "data_source": "Test API"
            }
            
            response = self.session.post(f"{self.base_url}/statistics", json=test_stat)
            if response.status_code == 200:
                created_stat = response.json()
                stat_id = created_stat.get("id")
                self.log_test("Create state statistic", True, 
                             f"Created ID: {stat_id}, State: {created_stat.get('state_name')}")
                
                # Test PUT - Update the created statistic
                update_data = test_stat.copy()
                update_data["total_affected"] = 550000
                
                response = self.session.put(f"{self.base_url}/statistics/{stat_id}", json=update_data)
                if response.status_code == 200:
                    updated_stat = response.json()
                    self.log_test("Update state statistic", True, 
                                 f"Updated total_affected: {updated_stat.get('total_affected')}")
                else:
                    self.log_test("Update state statistic", False, 
                                 f"Status code: {response.status_code}", response.text)
                
                # Test DELETE - Remove the created statistic
                response = self.session.delete(f"{self.base_url}/statistics/{stat_id}")
                if response.status_code == 200:
                    self.log_test("Delete state statistic", True, "Successfully deleted")
                else:
                    self.log_test("Delete state statistic", False, 
                                 f"Status code: {response.status_code}", response.text)
                    
            else:
                self.log_test("Create state statistic", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("State statistics CRUD", False, f"Exception: {str(e)}")

    def test_substance_statistics(self):
        """Test substance statistics CRUD operations"""
        try:
            # Test GET all substance statistics
            response = self.session.get(f"{self.base_url}/substance-statistics")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all substance statistics", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all substance statistics", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new substance statistic
            test_substance_stat = {
                "state_id": "TX",
                "state_name": "Texas",
                "year": 2024,
                "alcohol_use_past_month_percent": 45.2,
                "alcohol_binge_drinking_percent": 22.1,
                "opioid_use_disorder": 125000,
                "opioid_misuse_past_year": 85000,
                "fentanyl_deaths": 2500,
                "marijuana_use_past_month": 180000,
                "cocaine_use_past_year": 45000,
                "meth_use_past_year": 32000,
                "treatment_received": 75000,
                "treatment_needed_not_received": 200000
            }
            
            response = self.session.post(f"{self.base_url}/substance-statistics", json=test_substance_stat)
            if response.status_code == 200:
                created_stat = response.json()
                stat_id = created_stat.get("id")
                self.log_test("Create substance statistic", True, 
                             f"Created ID: {stat_id}, State: {created_stat.get('state_name')}")
                
                # Clean up - delete the test record
                self.session.delete(f"{self.base_url}/substance-statistics/{stat_id}")
                
            else:
                self.log_test("Create substance statistic", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Substance statistics CRUD", False, f"Exception: {str(e)}")

    def test_faqs(self):
        """Test FAQs CRUD operations"""
        try:
            # Test GET all FAQs
            response = self.session.get(f"{self.base_url}/faqs")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all FAQs", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all FAQs", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new FAQ
            test_faq = {
                "question": "What is addiction recovery?",
                "answer": "Addiction recovery is the process of overcoming substance use disorders through treatment, support, and lifestyle changes.",
                "category": "General",
                "is_active": True,
                "sort_order": 1
            }
            
            response = self.session.post(f"{self.base_url}/faqs", json=test_faq)
            if response.status_code == 200:
                created_faq = response.json()
                faq_id = created_faq.get("id")
                self.log_test("Create FAQ", True, 
                             f"Created ID: {faq_id}, Question: {created_faq.get('question')[:50]}...")
                
                # Clean up - delete the test record
                self.session.delete(f"{self.base_url}/faqs/{faq_id}")
                
            else:
                self.log_test("Create FAQ", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("FAQs CRUD", False, f"Exception: {str(e)}")

    def test_data_sources(self):
        """Test data sources CRUD operations"""
        try:
            # Test GET all data sources
            response = self.session.get(f"{self.base_url}/data-sources")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all data sources", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all data sources", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new data source
            test_source = {
                "source_name": "Test Data Source",
                "source_abbreviation": "TDS",
                "agency": "Test Agency",
                "source_url": "https://test.example.com",
                "description": "A test data source for API testing",
                "data_types": ["statistics", "demographics"],
                "last_updated_year": 2024
            }
            
            response = self.session.post(f"{self.base_url}/data-sources", json=test_source)
            if response.status_code == 200:
                created_source = response.json()
                source_id = created_source.get("id")
                self.log_test("Create data source", True, 
                             f"Created ID: {source_id}, Name: {created_source.get('source_name')}")
                
                # Clean up - delete the test record
                self.session.delete(f"{self.base_url}/data-sources/{source_id}")
                
            else:
                self.log_test("Create data source", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Data sources CRUD", False, f"Exception: {str(e)}")

    def test_articles(self):
        """Test articles CRUD operations"""
        try:
            # Test GET all articles
            response = self.session.get(f"{self.base_url}/articles")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all articles", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all articles", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new article
            test_article = {
                "title": "Understanding Addiction Recovery",
                "slug": "understanding-addiction-recovery-test",
                "excerpt": "A comprehensive guide to addiction recovery processes and methods.",
                "content": "This is test content for the article about addiction recovery...",
                "content_type": "blog",
                "author_name": "Test Author",
                "category": "Recovery",
                "tags": ["recovery", "addiction", "treatment"],
                "meta_title": "Understanding Addiction Recovery - Test Article",
                "meta_description": "Learn about addiction recovery processes and methods.",
                "is_featured": False,
                "is_published": True,
                "read_time": "5 min read"
            }
            
            response = self.session.post(f"{self.base_url}/articles", json=test_article)
            if response.status_code == 200:
                created_article = response.json()
                article_id = created_article.get("id")
                self.log_test("Create article", True, 
                             f"Created ID: {article_id}, Title: {created_article.get('title')}")
                
                # Clean up - delete the test record
                self.session.delete(f"{self.base_url}/articles/{article_id}")
                
            else:
                self.log_test("Create article", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Articles CRUD", False, f"Exception: {str(e)}")

    def test_free_resources(self):
        """Test free resources CRUD operations"""
        try:
            # Test GET all resources
            response = self.session.get(f"{self.base_url}/resources")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all free resources", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all free resources", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new resource
            test_resource = {
                "title": "Test Recovery Hotline",
                "description": "24/7 support hotline for addiction recovery",
                "resource_type": "hotline",
                "phone": "1-800-TEST-123",
                "website": "https://test-recovery.example.com",
                "is_free": True,
                "is_nationwide": True,
                "featured": False,
                "sort_order": 1
            }
            
            response = self.session.post(f"{self.base_url}/resources", json=test_resource)
            if response.status_code == 200:
                created_resource = response.json()
                resource_id = created_resource.get("id")
                self.log_test("Create free resource", True, 
                             f"Created ID: {resource_id}, Title: {created_resource.get('title')}")
                
                # Clean up - delete the test record
                self.session.delete(f"{self.base_url}/resources/{resource_id}")
                
            else:
                self.log_test("Create free resource", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Free resources CRUD", False, f"Exception: {str(e)}")

    def test_rehab_guides(self):
        """Test rehab guides CRUD operations"""
        try:
            # Test GET all guides
            response = self.session.get(f"{self.base_url}/guides")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all rehab guides", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all rehab guides", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new guide
            test_guide = {
                "title": "Test Recovery Guide",
                "description": "A comprehensive guide to starting your recovery journey",
                "category": "Getting Started",
                "content": "This is test content for the recovery guide...",
                "icon_name": "heart",
                "read_time": "10 min read",
                "is_active": True,
                "sort_order": 1
            }
            
            response = self.session.post(f"{self.base_url}/guides", json=test_guide)
            if response.status_code == 200:
                created_guide = response.json()
                guide_id = created_guide.get("id")
                self.log_test("Create rehab guide", True, 
                             f"Created ID: {guide_id}, Title: {created_guide.get('title')}")
                
                # Clean up - delete the test record
                self.session.delete(f"{self.base_url}/guides/{guide_id}")
                
            else:
                self.log_test("Create rehab guide", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Rehab guides CRUD", False, f"Exception: {str(e)}")

    def test_page_content(self):
        """Test page content CRUD operations"""
        try:
            # Test GET all page content
            response = self.session.get(f"{self.base_url}/page-content")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all page content", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all page content", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new page content
            test_content = {
                "page_key": "test-page",
                "section_key": "hero",
                "content_type": "text",
                "title": "Test Page Title",
                "subtitle": "Test Page Subtitle",
                "body": "This is test body content for the page.",
                "metadata": {"test": True},
                "is_active": True,
                "sort_order": 1
            }
            
            response = self.session.post(f"{self.base_url}/page-content", json=test_content)
            if response.status_code == 200:
                created_content = response.json()
                content_id = created_content.get("id")
                self.log_test("Create page content", True, 
                             f"Created ID: {content_id}, Page: {created_content.get('page_key')}")
                
                # Clean up - delete the test record
                self.session.delete(f"{self.base_url}/page-content/{content_id}")
                
            else:
                self.log_test("Create page content", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Page content CRUD", False, f"Exception: {str(e)}")

    def test_page_seo(self):
        """Test page SEO CRUD operations"""
        try:
            # Test GET all page SEO
            response = self.session.get(f"{self.base_url}/page-seo")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get all page SEO", True, f"Found {len(data)} records")
            else:
                self.log_test("Get all page SEO", False, 
                             f"Status code: {response.status_code}", response.text)
            
            # Test POST - Create new page SEO
            test_seo = {
                "page_slug": "test-page-slug",
                "page_type": "state",
                "meta_title": "Test Page - Addiction Recovery Resources",
                "meta_description": "Find addiction recovery resources and treatment options in your area.",
                "meta_keywords": ["addiction", "recovery", "treatment", "test"],
                "h1_title": "Test Page for Recovery Resources",
                "intro_text": "This is a test page for addiction recovery resources.",
                "og_title": "Test Page - Recovery Resources",
                "og_description": "Find the help you need for addiction recovery.",
                "canonical_url": "https://example.com/test-page",
                "robots": "index,follow",
                "structured_data": {"@type": "WebPage"},
                "is_active": True
            }
            
            response = self.session.post(f"{self.base_url}/page-seo", json=test_seo)
            if response.status_code == 200:
                created_seo = response.json()
                seo_id = created_seo.get("id")
                self.log_test("Create page SEO", True, 
                             f"Created ID: {seo_id}, Slug: {created_seo.get('page_slug')}")
                
                # Clean up - delete the test record
                self.session.delete(f"{self.base_url}/page-seo/{seo_id}")
                
            else:
                self.log_test("Create page SEO", False, 
                             f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Page SEO CRUD", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 60)
        print("UNITED REHABS BACKEND API TEST SUITE")
        print("=" * 60)
        print(f"Testing against: {self.base_url}")
        print(f"Admin credentials: {ADMIN_EMAIL}")
        print("=" * 60)
        print()
        
        # Run tests in order
        self.test_health_check()
        
        # Authentication is required for most endpoints
        if self.test_authentication():
            self.test_dashboard()
            self.test_state_statistics()
            self.test_substance_statistics()
            self.test_faqs()
            self.test_data_sources()
            self.test_articles()
            self.test_free_resources()
            self.test_rehab_guides()
            self.test_page_content()
            self.test_page_seo()
        else:
            print("❌ Authentication failed - skipping protected endpoint tests")
        
        # Print summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        
        if failed > 0:
            print("\nFailed tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['details']}")
        
        print("=" * 60)
        
        return failed == 0

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)