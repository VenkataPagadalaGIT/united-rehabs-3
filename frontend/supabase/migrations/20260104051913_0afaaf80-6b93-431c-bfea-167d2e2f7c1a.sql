-- Create a new table for detailed substance-specific statistics from government sources
CREATE TABLE public.substance_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_id TEXT NOT NULL,
  state_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Alcohol statistics
  alcohol_use_disorder INTEGER,
  alcohol_use_past_month_percent NUMERIC,
  alcohol_binge_drinking_percent NUMERIC,
  alcohol_heavy_use_percent NUMERIC,
  alcohol_related_deaths INTEGER,
  
  -- Opioid statistics
  opioid_use_disorder INTEGER,
  opioid_misuse_past_year INTEGER,
  prescription_opioid_misuse INTEGER,
  heroin_use INTEGER,
  
  -- Fentanyl statistics
  fentanyl_deaths INTEGER,
  fentanyl_involved_overdoses INTEGER,
  
  -- Cocaine statistics
  cocaine_use_past_year INTEGER,
  cocaine_use_disorder INTEGER,
  cocaine_related_deaths INTEGER,
  
  -- Methamphetamine statistics
  meth_use_past_year INTEGER,
  meth_use_disorder INTEGER,
  meth_related_deaths INTEGER,
  
  -- Marijuana/Cannabis statistics
  marijuana_use_past_month INTEGER,
  marijuana_use_past_year INTEGER,
  marijuana_use_disorder INTEGER,
  
  -- Prescription drug statistics
  prescription_stimulant_misuse INTEGER,
  prescription_sedative_misuse INTEGER,
  prescription_tranquilizer_misuse INTEGER,
  
  -- Treatment statistics
  treatment_received INTEGER,
  treatment_needed_not_received INTEGER,
  mat_recipients INTEGER,
  
  -- Mental health co-occurring
  mental_illness_with_sud INTEGER,
  serious_mental_illness_with_sud INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(state_id, year)
);

-- Create a table for data sources/citations
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_abbreviation TEXT NOT NULL,
  source_url TEXT NOT NULL,
  description TEXT,
  data_types TEXT[], -- Types of data this source provides
  last_updated_year INTEGER,
  agency TEXT NOT NULL, -- e.g., "U.S. Department of Health and Human Services"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.substance_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

-- Create read-only policies for public access
CREATE POLICY "Anyone can view substance statistics"
ON public.substance_statistics
FOR SELECT
USING (true);

CREATE POLICY "Anyone can view data sources"
ON public.data_sources
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_substance_statistics_updated_at
BEFORE UPDATE ON public.substance_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert official government data sources
INSERT INTO public.data_sources (source_name, source_abbreviation, source_url, description, data_types, last_updated_year, agency) VALUES
('National Survey on Drug Use and Health', 'NSDUH', 'https://www.samhsa.gov/data/data-we-collect/nsduh-national-survey-drug-use-and-health', 'Annual nationwide survey on substance use, mental health, and treatment. Provides state-level estimates for alcohol, marijuana, opioids, cocaine, and other substances.', ARRAY['alcohol', 'marijuana', 'opioids', 'cocaine', 'methamphetamine', 'prescription drugs', 'mental health'], 2024, 'Substance Abuse and Mental Health Services Administration (SAMHSA)'),
('CDC WONDER Multiple Cause of Death', 'CDC WONDER', 'https://wonder.cdc.gov/mcd.html', 'Provides detailed mortality data including drug overdose deaths by specific substances like fentanyl, cocaine, methamphetamine, and opioids.', ARRAY['fentanyl deaths', 'opioid deaths', 'cocaine deaths', 'methamphetamine deaths', 'overdose deaths'], 2023, 'Centers for Disease Control and Prevention (CDC)'),
('Treatment Episode Data Set', 'TEDS', 'https://www.samhsa.gov/data/data-we-collect/teds-treatment-episode-data-set', 'Data on admissions and discharges from substance use treatment facilities, including primary substance of abuse.', ARRAY['treatment admissions', 'treatment discharges', 'primary substances'], 2022, 'Substance Abuse and Mental Health Services Administration (SAMHSA)'),
('National Center for Health Statistics Drug Overdose Mortality', 'NCHS', 'https://www.cdc.gov/nchs/pressroom/sosmap/drug_poisoning_mortality/drug_poisoning.htm', 'State-level drug overdose mortality rates and counts, updated annually.', ARRAY['overdose mortality rates', 'state comparisons'], 2023, 'Centers for Disease Control and Prevention (CDC)'),
('National Institute on Drug Abuse', 'NIDA', 'https://nida.nih.gov/research-topics/trends-statistics', 'Research-based statistics and trends on drug use, addiction, and related health consequences.', ARRAY['drug use trends', 'addiction research', 'health consequences'], 2024, 'National Institutes of Health (NIH)'),
('Behavioral Health Treatment Services Locator', 'SAMHSA Locator', 'https://findtreatment.gov/', 'Information on substance use and mental health treatment facilities across the United States.', ARRAY['treatment facilities', 'facility counts'], 2024, 'Substance Abuse and Mental Health Services Administration (SAMHSA)');