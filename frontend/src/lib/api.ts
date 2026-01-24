import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================
// AUTH API
// ============================================

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string) => {
    const response = await api.post('/api/auth/register', { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  getCounts: async () => {
    const response = await api.get('/api/dashboard/counts');
    return response.data;
  },
};

// ============================================
// STATE STATISTICS API
// ============================================

export const statisticsApi = {
  getAll: async (params?: { state_id?: string; year?: number; skip?: number; limit?: number }) => {
    const response = await api.get('/api/statistics', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/statistics/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/statistics', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/statistics/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/statistics/${id}`);
    return response.data;
  },
};

// ============================================
// SUBSTANCE STATISTICS API
// ============================================

export const substanceStatisticsApi = {
  getAll: async (params?: { state_id?: string; year?: number; skip?: number; limit?: number }) => {
    const response = await api.get('/api/substance-statistics', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/substance-statistics', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/substance-statistics/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/substance-statistics/${id}`);
    return response.data;
  },
};

// ============================================
// FREE RESOURCES API
// ============================================

export const resourcesApi = {
  getAll: async (params?: { state_id?: string; resource_type?: string; is_nationwide?: boolean; skip?: number; limit?: number }) => {
    const response = await api.get('/api/resources', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/resources', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/resources/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/resources/${id}`);
    return response.data;
  },
};

// ============================================
// FAQs API
// ============================================

export const faqsApi = {
  getAll: async (params?: { state_id?: string; category?: string; is_active?: boolean; skip?: number; limit?: number }) => {
    const response = await api.get('/api/faqs', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/faqs', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/faqs/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/faqs/${id}`);
    return response.data;
  },
};

// ============================================
// DATA SOURCES API
// ============================================

export const dataSourcesApi = {
  getAll: async (params?: { skip?: number; limit?: number }) => {
    const response = await api.get('/api/data-sources', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/data-sources', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/data-sources/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/data-sources/${id}`);
    return response.data;
  },
};

// ============================================
// REHAB GUIDES API
// ============================================

export const guidesApi = {
  getAll: async (params?: { category?: string; is_active?: boolean; skip?: number; limit?: number }) => {
    const response = await api.get('/api/guides', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/guides', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/guides/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/guides/${id}`);
    return response.data;
  },
};

// ============================================
// PAGE CONTENT API
// ============================================

export const pageContentApi = {
  getAll: async (params?: { page_key?: string; state_id?: string; is_active?: boolean; skip?: number; limit?: number }) => {
    const response = await api.get('/api/page-content', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/page-content', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/page-content/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/page-content/${id}`);
    return response.data;
  },
};

// ============================================
// PAGE SEO API
// ============================================

export const pageSeoApi = {
  getAll: async (params?: { page_type?: string; state_id?: string; is_active?: boolean; skip?: number; limit?: number }) => {
    const response = await api.get('/api/page-seo', { params });
    return response.data;
  },
  
  getBySlug: async (slug: string) => {
    const response = await api.get(`/api/page-seo/by-slug/${slug}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/page-seo', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/page-seo/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/page-seo/${id}`);
    return response.data;
  },
};

// ============================================
// ARTICLES API
// ============================================

export const articlesApi = {
  getAll: async (params?: { content_type?: string; is_published?: boolean; is_featured?: boolean; category?: string; state_id?: string; skip?: number; limit?: number }) => {
    const response = await api.get('/api/articles', { params });
    return response.data;
  },
  
  getBySlug: async (contentType: string, slug: string) => {
    const response = await api.get(`/api/articles/by-slug/${contentType}/${slug}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/articles', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/articles/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/articles/${id}`);
    return response.data;
  },
};

// ============================================
// HOMEPAGE API (Optimized single call)
// ============================================

export interface HomepageData {
  national_stats: {
    total_affected: number;
    total_overdose_deaths: number;
    total_treatment_centers: number;
    total_treatment_admissions: number;
    avg_recovery_rate: number;
    total_economic_cost: number;
  };
  top_states: Array<{
    state_id: string;
    state_name: string;
    total_affected: number;
    overdose_deaths: number;
    total_treatment_centers: number;
    recovery_rate: number;
  }>;
  featured_centers: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    state_id: string;
    zip_code: string;
    phone: string;
    website?: string;
    rating: number;
    reviews_count: number;
    is_verified: boolean;
    is_featured: boolean;
    treatment_types: string[];
    services: string[];
    insurance_accepted: string[];
    image_url?: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  state_counts: Array<{
    state_id: string;
    state_name: string;
    total_treatment_centers: number;
  }>;
  data_year: number;
}

export const homepageApi = {
  getData: async (): Promise<HomepageData> => {
    const response = await api.get('/api/homepage/data');
    return response.data;
  },
};

// ============================================
// TREATMENT CENTERS API
// ============================================

export const treatmentCentersApi = {
  getAll: async (params?: { 
    state_id?: string; 
    city?: string; 
    treatment_type?: string; 
    is_featured?: boolean;
    skip?: number; 
    limit?: number 
  }) => {
    const response = await api.get('/api/treatment-centers', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/treatment-centers/${id}`);
    return response.data;
  },
};
