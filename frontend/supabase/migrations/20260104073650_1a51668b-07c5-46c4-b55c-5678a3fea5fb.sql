-- Create table for page SEO metadata
CREATE TABLE public.page_seo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  page_type TEXT NOT NULL DEFAULT 'state',
  state_id TEXT,
  meta_title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  structured_data JSONB,
  h1_title TEXT,
  intro_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

-- Public can view active SEO data
CREATE POLICY "Anyone can view active page SEO"
ON public.page_seo
FOR SELECT
USING (is_active = true);

-- Admins can manage SEO data
CREATE POLICY "Admins can manage page SEO"
ON public.page_seo
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_page_seo_updated_at
BEFORE UPDATE ON public.page_seo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default SEO for California pages
INSERT INTO public.page_seo (page_slug, page_type, state_id, meta_title, meta_description, h1_title, intro_text)
VALUES 
  ('california-addiction-stats', 'state_stats', 'ca', 
   'California Addiction Statistics 2024 | Drug & Alcohol Data', 
   'Comprehensive California addiction statistics including overdose deaths, treatment admissions, and recovery rates. Data from SAMHSA, CDC, and NIDA.',
   'California Addiction Statistics',
   'Explore the latest addiction statistics for California, including substance abuse rates, treatment data, and recovery outcomes.'),
  ('california-addiction-rehab-centers', 'state_rehabs', 'ca',
   'California Rehab Centers | Find Addiction Treatment Near You',
   'Find the best drug and alcohol rehab centers in California. Compare treatment options, insurance coverage, and read reviews.',
   'Addiction Treatment & Rehab Centers in California',
   'Discover top-rated addiction treatment facilities across California offering detox, inpatient, outpatient, and specialized care.'),
  ('california-addiction-free-resources', 'state_resources', 'ca',
   'Free Addiction Resources in California | Hotlines & Support',
   'Access free addiction resources in California including 24/7 hotlines, support groups, government programs, and nonprofit services.',
   'Free Addiction Resources for California',
   'Find free and low-cost addiction support services available to California residents.');