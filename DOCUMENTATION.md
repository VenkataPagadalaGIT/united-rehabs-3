# United Rehabs - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Admin Panel](#admin-panel)
7. [Key Components](#key-components)
8. [Data Flow](#data-flow)
9. [Environment Variables](#environment-variables)
10. [Development Guide](#development-guide)

---

## Project Overview

United Rehabs is a comprehensive web application for finding addiction treatment and rehabilitation centers across the United States. The platform provides:

- **State-specific rehab center listings** with filtering capabilities
- **Addiction statistics** by state and substance type
- **Free resources** including helplines and support services
- **Educational content** via articles, guides, and FAQs
- **Admin dashboard** for content management

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Pre-built UI components |
| **React Router v6** | Client-side routing |
| **TanStack Query (React Query)** | Server state management |
| **Lucide React** | Icon library |
| **Recharts** | Data visualization |

### Backend (Lovable Cloud / Supabase)
| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Database |
| **Row-Level Security (RLS)** | Data access control |
| **Supabase Auth** | User authentication |
| **Supabase Storage** | File/image storage |

---

## Project Structure

```
src/
├── components/
│   ├── admin/              # Admin-specific components
│   │   ├── BulkImportExport.tsx
│   │   └── PageTemplateGenerator.tsx
│   ├── article/            # Article/content components
│   │   ├── ImageUploader.tsx
│   │   ├── RelatedArticles.tsx
│   │   ├── RichContentEditor.tsx
│   │   ├── ShortcodeRenderer.tsx
│   │   └── TableOfContents.tsx
│   ├── auth/               # Authentication components
│   │   ├── TwoFactorManage.tsx
│   │   ├── TwoFactorSetup.tsx
│   │   └── TwoFactorVerify.tsx
│   ├── home/               # Homepage sections
│   │   ├── BrowseBySection.tsx
│   │   ├── CTACards.tsx
│   │   ├── FeaturedCenters.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── StatisticsSection.tsx
│   │   └── TestimonialsSection.tsx
│   ├── listing/            # Listing page components
│   │   ├── Breadcrumb.tsx
│   │   ├── FilterTabs.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── TreatmentCard.tsx
│   │   ├── TreatmentGrid.tsx
│   │   └── tabs/           # Tab content components
│   │       ├── FreeResourcesTab.tsx
│   │       ├── RehabListingsTab.tsx
│   │       ├── StatisticsTab.tsx
│   │       └── SubstanceCharts.tsx
│   └── ui/                 # shadcn/ui components
│
├── data/
│   └── mockData.ts         # Static/mock data for development
│
├── hooks/
│   ├── useAuth.ts          # Authentication hook
│   ├── useFilters.ts       # Filter state management
│   ├── useMFA.ts           # Multi-factor auth hook
│   └── usePageContent.ts   # Page content fetching
│
├── integrations/
│   └── supabase/
│       ├── client.ts       # Supabase client (auto-generated)
│       └── types.ts        # Database types (auto-generated)
│
├── lib/
│   ├── sanitize.ts         # HTML sanitization utilities
│   ├── utils.ts            # General utilities (cn, etc.)
│   └── validation.ts       # Form validation schemas
│
├── pages/
│   ├── admin/              # Admin panel pages
│   │   ├── ArticlesAdmin.tsx
│   │   ├── ContentAdmin.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FAQsAdmin.tsx
│   │   ├── GuidesAdmin.tsx
│   │   ├── ResourcesAdmin.tsx
│   │   ├── SecurityAdmin.tsx
│   │   ├── SEOAdmin.tsx
│   │   ├── SourcesAdmin.tsx
│   │   ├── StatisticsAdmin.tsx
│   │   ├── SubstanceAdmin.tsx
│   │   └── URLsAdmin.tsx
│   ├── Admin.tsx           # Admin layout wrapper
│   ├── AdminLogin.tsx      # Admin authentication
│   ├── ArticlePage.tsx     # Single article view
│   ├── ArticlesListPage.tsx
│   ├── Index.tsx           # Homepage
│   ├── NotFound.tsx        # 404 page
│   ├── PrivacyPolicy.tsx
│   ├── StateRehabsPage.tsx # State rehab listings
│   ├── StateResourcesPage.tsx
│   ├── StateStatsPage.tsx
│   └── TermsOfService.tsx
│
├── types/
│   └── index.ts            # TypeScript type definitions
│
├── App.tsx                 # Main app with routing
├── App.css                 # Global styles
├── index.css               # Tailwind + CSS variables
└── main.tsx                # App entry point
```

---

## Database Schema

### Tables Overview

| Table | Purpose |
|-------|---------|
| `articles` | Blog posts, news, and educational content |
| `data_sources` | External data source references |
| `faqs` | Frequently asked questions |
| `free_resources` | Helplines and free services |
| `page_content` | Dynamic page content blocks |
| `page_seo` | SEO metadata for pages |
| `rehab_guides` | Educational rehabilitation guides |
| `state_addiction_statistics` | State-level addiction data |
| `substance_statistics` | Substance-specific statistics |
| `user_roles` | User permission management |

### Detailed Table Schemas

#### `articles`
Stores all content types: blogs, news, guides.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `slug` | text | No | - | URL-friendly identifier |
| `title` | text | No | - | Article title |
| `excerpt` | text | Yes | - | Short summary |
| `content` | text | Yes | - | Full article content (HTML/Markdown) |
| `content_type` | text | No | `'blog'` | Type: blog, news, guide |
| `category` | text | Yes | - | Content category |
| `author_name` | text | Yes | - | Author display name |
| `featured_image_url` | text | Yes | - | Hero image URL |
| `meta_title` | text | Yes | - | SEO title |
| `meta_description` | text | Yes | - | SEO description |
| `tags` | text[] | Yes | - | Content tags array |
| `state_id` | text | Yes | - | Associated state code |
| `is_published` | boolean | Yes | `false` | Publication status |
| `is_featured` | boolean | Yes | `false` | Featured flag |
| `published_at` | timestamptz | Yes | - | Publication date |
| `read_time` | text | Yes | `'5 min read'` | Estimated read time |
| `views_count` | integer | Yes | `0` | View counter |
| `sort_order` | integer | Yes | `0` | Display order |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

**RLS Policies:**
- `Anyone can view published articles` - SELECT where `is_published = true`
- `Admins can manage articles` - ALL for users with admin role

---

#### `data_sources`
Reference data for statistics citations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `source_name` | text | No | - | Full source name |
| `source_abbreviation` | text | No | - | Short name (e.g., SAMHSA) |
| `agency` | text | No | - | Parent organization |
| `source_url` | text | No | - | Link to source |
| `description` | text | Yes | - | Source description |
| `data_types` | text[] | Yes | - | Types of data provided |
| `last_updated_year` | integer | Yes | - | Data currency year |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |

**RLS Policies:**
- `Anyone can view data sources` - SELECT (public)
- `Admins can manage data sources` - ALL for admins

---

#### `faqs`
Frequently asked questions, optionally state-specific.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `question` | text | No | - | FAQ question |
| `answer` | text | No | - | FAQ answer (supports HTML) |
| `category` | text | Yes | - | FAQ category |
| `state_id` | text | Yes | - | State-specific FAQ |
| `sort_order` | integer | Yes | `0` | Display order |
| `is_active` | boolean | Yes | `true` | Visibility flag |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

**RLS Policies:**
- `Anyone can view active FAQs` - SELECT where `is_active = true`
- `Admins can manage FAQs` - ALL for admins

---

#### `free_resources`
Helplines, hotlines, and free support services.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `title` | text | No | - | Resource name |
| `description` | text | Yes | - | Resource description |
| `resource_type` | text | No | - | Type: helpline, website, etc. |
| `phone` | text | Yes | - | Contact phone number |
| `website` | text | Yes | - | Website URL |
| `address` | text | Yes | - | Physical address |
| `state_id` | text | Yes | - | State-specific resource |
| `is_nationwide` | boolean | Yes | `false` | National availability |
| `is_free` | boolean | Yes | `true` | Free service flag |
| `featured` | boolean | Yes | `false` | Featured resource |
| `sort_order` | integer | Yes | `0` | Display order |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

**RLS Policies:**
- `Anyone can view free resources` - SELECT (public)
- `Admins can manage free resources` - ALL for admins

---

#### `page_content`
Dynamic content blocks for pages.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `page_key` | text | No | - | Page identifier |
| `section_key` | text | No | - | Section within page |
| `content_type` | text | No | `'text'` | Content type |
| `title` | text | Yes | - | Section title |
| `subtitle` | text | Yes | - | Section subtitle |
| `body` | text | Yes | - | Main content |
| `country_code` | text | Yes | `'us'` | Country targeting |
| `state_id` | text | Yes | - | State targeting |
| `city_id` | text | Yes | - | City targeting |
| `metadata` | jsonb | Yes | `'{}'` | Additional data |
| `sort_order` | integer | Yes | `0` | Display order |
| `is_active` | boolean | Yes | `true` | Visibility flag |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

**RLS Policies:**
- `Anyone can view active page content` - SELECT where `is_active = true`
- `Admins can manage page content` - ALL for admins

---

#### `page_seo`
SEO metadata configuration for pages.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `page_slug` | text | No | - | Page URL path |
| `page_type` | text | No | `'state'` | Page category |
| `meta_title` | text | No | - | SEO title |
| `meta_description` | text | Yes | - | SEO description |
| `meta_keywords` | text[] | Yes | - | SEO keywords |
| `h1_title` | text | Yes | - | Page H1 heading |
| `intro_text` | text | Yes | - | Introduction text |
| `og_title` | text | Yes | - | Open Graph title |
| `og_description` | text | Yes | - | Open Graph description |
| `og_image_url` | text | Yes | - | Open Graph image |
| `canonical_url` | text | Yes | - | Canonical URL |
| `robots` | text | Yes | `'index, follow'` | Robots directive |
| `structured_data` | jsonb | Yes | - | JSON-LD schema |
| `state_id` | text | Yes | - | Associated state |
| `is_active` | boolean | Yes | `true` | Active flag |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

**RLS Policies:**
- `Anyone can view active page SEO` - SELECT where `is_active = true`
- `Admins can manage page SEO` - ALL for admins

---

#### `rehab_guides`
Educational guides about rehabilitation.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `title` | text | No | - | Guide title |
| `description` | text | No | - | Short description |
| `category` | text | No | - | Guide category |
| `content` | text | Yes | - | Full guide content |
| `icon_name` | text | Yes | `'BookOpen'` | Lucide icon name |
| `read_time` | text | Yes | `'5 min read'` | Reading time |
| `sort_order` | integer | Yes | `0` | Display order |
| `is_active` | boolean | Yes | `true` | Visibility flag |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

**RLS Policies:**
- `Anyone can view active guides` - SELECT where `is_active = true`
- `Admins can manage guides` - ALL for admins

---

#### `state_addiction_statistics`
State-level addiction and treatment statistics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `state_id` | text | No | - | State code (e.g., 'ca') |
| `state_name` | text | No | - | Full state name |
| `year` | integer | No | - | Data year |
| `total_affected` | integer | Yes | - | Total affected population |
| `overdose_deaths` | integer | Yes | - | Overdose fatalities |
| `opioid_deaths` | integer | Yes | - | Opioid-specific deaths |
| `alcohol_abuse_rate` | numeric | Yes | - | Alcohol abuse percentage |
| `drug_abuse_rate` | numeric | Yes | - | Drug abuse percentage |
| `affected_age_12_17` | integer | Yes | - | Ages 12-17 affected |
| `affected_age_18_25` | integer | Yes | - | Ages 18-25 affected |
| `affected_age_26_34` | integer | Yes | - | Ages 26-34 affected |
| `affected_age_35_plus` | integer | Yes | - | Ages 35+ affected |
| `treatment_admissions` | integer | Yes | - | Treatment admissions |
| `recovery_rate` | numeric | Yes | - | Recovery percentage |
| `relapse_rate` | numeric | Yes | - | Relapse percentage |
| `total_treatment_centers` | integer | Yes | - | Treatment facility count |
| `inpatient_facilities` | integer | Yes | - | Inpatient centers |
| `outpatient_facilities` | integer | Yes | - | Outpatient centers |
| `economic_cost_billions` | numeric | Yes | - | Economic impact |
| `data_source` | text | Yes | - | Data source name |
| `source_url` | text | Yes | - | Source reference URL |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

**RLS Policies:**
- `Anyone can view statistics` - SELECT (public)
- `Admins can manage statistics` - ALL for admins

---

#### `substance_statistics`
Detailed substance-specific statistics by state.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `state_id` | text | No | - | State code |
| `state_name` | text | No | - | Full state name |
| `year` | integer | No | - | Data year |
| **Alcohol** | | | | |
| `alcohol_use_past_month_percent` | numeric | Yes | - | Monthly use % |
| `alcohol_binge_drinking_percent` | numeric | Yes | - | Binge drinking % |
| `alcohol_heavy_use_percent` | numeric | Yes | - | Heavy use % |
| `alcohol_use_disorder` | integer | Yes | - | Disorder count |
| `alcohol_related_deaths` | integer | Yes | - | Death count |
| **Opioids** | | | | |
| `opioid_use_disorder` | integer | Yes | - | Disorder count |
| `opioid_misuse_past_year` | integer | Yes | - | Yearly misuse |
| `prescription_opioid_misuse` | integer | Yes | - | Rx misuse |
| `heroin_use` | integer | Yes | - | Heroin users |
| `fentanyl_deaths` | integer | Yes | - | Fentanyl deaths |
| `fentanyl_involved_overdoses` | integer | Yes | - | Fentanyl ODs |
| **Cocaine** | | | | |
| `cocaine_use_past_year` | integer | Yes | - | Yearly use |
| `cocaine_use_disorder` | integer | Yes | - | Disorder count |
| `cocaine_related_deaths` | integer | Yes | - | Death count |
| **Methamphetamine** | | | | |
| `meth_use_past_year` | integer | Yes | - | Yearly use |
| `meth_use_disorder` | integer | Yes | - | Disorder count |
| `meth_related_deaths` | integer | Yes | - | Death count |
| **Marijuana** | | | | |
| `marijuana_use_past_month` | integer | Yes | - | Monthly use |
| `marijuana_use_past_year` | integer | Yes | - | Yearly use |
| `marijuana_use_disorder` | integer | Yes | - | Disorder count |
| **Prescriptions** | | | | |
| `prescription_tranquilizer_misuse` | integer | Yes | - | Tranquilizer misuse |
| `prescription_stimulant_misuse` | integer | Yes | - | Stimulant misuse |
| `prescription_sedative_misuse` | integer | Yes | - | Sedative misuse |
| **Treatment** | | | | |
| `treatment_received` | integer | Yes | - | Treated count |
| `treatment_needed_not_received` | integer | Yes | - | Untreated need |
| `mat_recipients` | integer | Yes | - | MAT patients |
| **Mental Health** | | | | |
| `mental_illness_with_sud` | integer | Yes | - | MI + SUD comorbidity |
| `serious_mental_illness_with_sud` | integer | Yes | - | SMI + SUD comorbidity |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

**RLS Policies:**
- `Anyone can view substance statistics` - SELECT (public)
- `Admins can manage substance statistics` - ALL for admins

---

#### `user_roles`
User authorization and role management.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `role` | app_role | No | `'viewer'` | User role enum |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |

**Enum: `app_role`**
- `admin` - Full system access
- `editor` - Content management
- `viewer` - Read-only access

**RLS Policies:**
- `Users can view their own roles` - SELECT where `auth.uid() = user_id`
- `Admins can view all roles` - SELECT for admins
- `Admins can manage roles` - ALL for admins

---

### Database Functions

#### `has_role(user_id, role)`
Checks if a user has a specific role. Used in RLS policies.

```sql
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

#### `update_updated_at_column()`
Trigger function to auto-update `updated_at` timestamps.

```sql
CREATE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

---

## Authentication & Authorization

### Authentication Flow
1. Users authenticate via Supabase Auth (email/password)
2. Upon login, check `user_roles` table for permissions
3. Admin access requires `admin` role in `user_roles`

### Authorization Architecture
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Supabase    │────▶│  PostgreSQL     │
│   (React)       │     │  Auth        │     │  RLS Policies   │
└─────────────────┘     └──────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │  user_roles  │
                        │  table       │
                        └──────────────┘
```

### Security Measures
- **Row-Level Security (RLS)** on all tables
- **SECURITY DEFINER** functions to prevent RLS recursion
- **Role-based access** via `user_roles` table (not stored on profiles)
- **Server-side validation** for all mutations

### Adding an Admin User
```sql
-- After user signs up, grant admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

---

## Admin Panel

### Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | `Admin.tsx` | Admin layout wrapper |
| `/admin/login` | `AdminLogin.tsx` | Admin authentication |
| `/admin/dashboard` | `Dashboard.tsx` | Overview dashboard |
| `/admin/articles` | `ArticlesAdmin.tsx` | Content management |
| `/admin/content` | `ContentAdmin.tsx` | Page content blocks |
| `/admin/faqs` | `FAQsAdmin.tsx` | FAQ management |
| `/admin/resources` | `ResourcesAdmin.tsx` | Free resources |
| `/admin/guides` | `GuidesAdmin.tsx` | Rehab guides |
| `/admin/statistics` | `StatisticsAdmin.tsx` | State statistics |
| `/admin/substance` | `SubstanceAdmin.tsx` | Substance data |
| `/admin/sources` | `SourcesAdmin.tsx` | Data sources |
| `/admin/seo` | `SEOAdmin.tsx` | SEO configuration |
| `/admin/urls` | `URLsAdmin.tsx` | URL management |
| `/admin/security` | `SecurityAdmin.tsx` | Security settings |

### Features
- CRUD operations for all content types
- Bulk import/export functionality
- Page template generation
- Rich text editing with shortcode support

---

## Key Components

### Public Pages

#### `StateRehabsPage`
Displays rehab centers for a specific state with filtering.
- Uses `useFilters` hook for state management
- Loads SEO data from `page_seo` table
- Displays treatment centers with pagination

#### `StateStatsPage`
Shows addiction statistics for a state.
- Fetches from `state_addiction_statistics`
- Displays charts via `StatisticsTab`

#### `StateResourcesPage`
Lists free resources for a state.
- Fetches from `free_resources`
- Displays via `FreeResourcesTab`

### Hooks

#### `useAuth`
Authentication state management.
```typescript
const { user, loading, signIn, signOut, isAdmin } = useAuth();
```

#### `useFilters`
Filter state for treatment center listings.
```typescript
const { 
  filters, 
  setFilters, 
  centers, 
  loading, 
  loadMore 
} = useFilters(stateId);
```

#### `usePageContent`
Fetches dynamic page content.
```typescript
const { content, loading } = usePageContent(pageKey, sectionKey);
```

---

## Data Flow

### Public Content Flow
```
User Request → React Router → Page Component
                                    │
                                    ▼
                             useQuery Hook
                                    │
                                    ▼
                             Supabase Client
                                    │
                                    ▼
                              RLS Check
                                    │
                                    ▼
                             PostgreSQL
                                    │
                                    ▼
                              Response
```

### Admin Mutation Flow
```
Admin Action → Form Submit → useMutation
                                  │
                                  ▼
                           Supabase Client
                                  │
                                  ▼
                            Auth Check
                                  │
                                  ▼
                         RLS Policy Check
                                  │
                                  ▼
                       has_role() Function
                                  │
                                  ▼
                           PostgreSQL
                                  │
                                  ▼
                        Query Invalidation
```

---

## Environment Variables

The following environment variables are auto-configured:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

**Note:** These are auto-managed by Lovable Cloud. Do not edit `.env` directly.

---

## Development Guide

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Adding New Tables
1. Create migration via Lovable's migration tool
2. Define RLS policies (use `has_role()` for admin checks)
3. Types auto-generate to `src/integrations/supabase/types.ts`

### Adding Admin Pages
1. Create component in `src/pages/admin/`
2. Add route in `src/App.tsx` under admin routes
3. Use `useQuery`/`useMutation` for data operations
4. Follow existing admin page patterns

### Code Conventions
- **Components:** PascalCase, one component per file
- **Hooks:** camelCase, prefix with `use`
- **Types:** PascalCase, defined in `src/types/`
- **Styling:** Tailwind CSS with semantic tokens from `index.css`

### Testing Locally
1. Run `npm run dev`
2. Access at `http://localhost:5173`
3. Admin panel at `/admin/login`

---

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `article-images` | Yes | Article featured images |

---

## File Upload Pattern
```typescript
import { supabase } from "@/integrations/supabase/client";

const uploadImage = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('article-images')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('article-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
};
```

---

## Contact & Support

For questions about this project, refer to:
- This documentation
- Code comments
- Lovable's documentation at https://docs.lovable.dev
