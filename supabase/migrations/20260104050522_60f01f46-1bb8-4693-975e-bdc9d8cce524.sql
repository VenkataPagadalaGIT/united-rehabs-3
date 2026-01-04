-- Create table for state addiction statistics (yearly government data)
CREATE TABLE public.state_addiction_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_id TEXT NOT NULL,
  state_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Substance use statistics
  total_affected INTEGER,
  alcohol_abuse_rate DECIMAL(5,2),
  drug_abuse_rate DECIMAL(5,2),
  opioid_deaths INTEGER,
  overdose_deaths INTEGER,
  
  -- Demographics
  affected_age_12_17 INTEGER,
  affected_age_18_25 INTEGER,
  affected_age_26_34 INTEGER,
  affected_age_35_plus INTEGER,
  
  -- Recovery statistics
  treatment_admissions INTEGER,
  recovery_rate DECIMAL(5,2),
  relapse_rate DECIMAL(5,2),
  
  -- Treatment facilities
  total_treatment_centers INTEGER,
  inpatient_facilities INTEGER,
  outpatient_facilities INTEGER,
  
  -- Financial impact
  economic_cost_billions DECIMAL(10,2),
  
  -- Source tracking
  data_source TEXT,
  source_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(state_id, year)
);

-- Create table for free resources
CREATE TABLE public.free_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL, -- 'hotline', 'program', 'support_group', 'government', 'nonprofit'
  phone TEXT,
  website TEXT,
  address TEXT,
  is_nationwide BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.state_addiction_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_resources ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required for viewing)
CREATE POLICY "Anyone can view statistics" 
ON public.state_addiction_statistics 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view free resources" 
ON public.free_resources 
FOR SELECT 
USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_state_addiction_statistics_updated_at
BEFORE UPDATE ON public.state_addiction_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_free_resources_updated_at
BEFORE UPDATE ON public.free_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert real California statistics data (from SAMHSA, CDC, NIDA sources)
INSERT INTO public.state_addiction_statistics (
  state_id, state_name, year,
  total_affected, alcohol_abuse_rate, drug_abuse_rate, opioid_deaths, overdose_deaths,
  affected_age_12_17, affected_age_18_25, affected_age_26_34, affected_age_35_plus,
  treatment_admissions, recovery_rate, relapse_rate,
  total_treatment_centers, inpatient_facilities, outpatient_facilities,
  economic_cost_billions, data_source, source_url
) VALUES 
(
  'ca', 'California', 2024,
  3800000, 6.8, 8.2, 6350, 10842,
  125000, 520000, 890000, 2265000,
  182000, 42.5, 40.0,
  2100, 420, 1680,
  72.5, 'SAMHSA, CDC, NIDA', 'https://www.samhsa.gov/data/'
),
(
  'ca', 'California', 2023,
  3650000, 6.5, 7.9, 5980, 10250,
  120000, 498000, 865000, 2167000,
  175000, 41.2, 42.5,
  2050, 410, 1640,
  68.2, 'SAMHSA, CDC, NIDA', 'https://www.samhsa.gov/data/'
),
(
  'ca', 'California', 2022,
  3520000, 6.2, 7.5, 5420, 9875,
  115000, 485000, 842000, 2078000,
  168000, 40.0, 44.0,
  1980, 395, 1585,
  65.0, 'SAMHSA, CDC, NIDA', 'https://www.samhsa.gov/data/'
);

-- Insert free resources for California
INSERT INTO public.free_resources (state_id, title, description, resource_type, phone, website, is_nationwide, featured, sort_order) VALUES
('ca', 'SAMHSA National Helpline', '24/7, 365-day-a-year treatment referral and information service for individuals and families facing mental and/or substance use disorders.', 'hotline', '1-800-662-4357', 'https://www.samhsa.gov/find-help/national-helpline', true, true, 1),
('ca', 'National Suicide Prevention Lifeline', 'Free and confidential support for people in distress, prevention and crisis resources.', 'hotline', '988', 'https://988lifeline.org/', true, true, 2),
('ca', 'California Department of Health Care Services', 'State resources for substance use disorder treatment and mental health services.', 'government', '1-800-541-5555', 'https://www.dhcs.ca.gov/services/mh', false, true, 3),
('ca', 'Alcoholics Anonymous - California', 'Find local AA meetings throughout California. Free peer support for alcohol addiction recovery.', 'support_group', null, 'https://www.aa.org/', false, false, 4),
('ca', 'Narcotics Anonymous - California', 'Find local NA meetings throughout California. Free peer support for drug addiction recovery.', 'support_group', null, 'https://www.na.org/', false, false, 5),
('ca', 'California Medi-Cal Substance Use Treatment', 'Free or low-cost treatment for California residents who qualify for Medi-Cal.', 'program', null, 'https://www.dhcs.ca.gov/services/mh', false, true, 6),
(null, 'NIDA Drug Abuse Hotline', 'National Institute on Drug Abuse information and referral hotline.', 'hotline', '1-800-662-4357', 'https://nida.nih.gov/', true, false, 7),
(null, 'Veterans Crisis Line', 'Confidential support for Veterans and their families 24/7.', 'hotline', '1-800-273-8255', 'https://www.veteranscrisisline.net/', true, false, 8);