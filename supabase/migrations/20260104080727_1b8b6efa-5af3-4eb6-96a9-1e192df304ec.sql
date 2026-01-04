-- Add location columns for filtering/sorting (scalable for worldwide)
ALTER TABLE public.page_content 
ADD COLUMN IF NOT EXISTS country_code text DEFAULT 'us',
ADD COLUMN IF NOT EXISTS state_id text,
ADD COLUMN IF NOT EXISTS city_id text;

-- Add indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_page_content_country ON public.page_content(country_code);
CREATE INDEX IF NOT EXISTS idx_page_content_state ON public.page_content(state_id);
CREATE INDEX IF NOT EXISTS idx_page_content_city ON public.page_content(city_id);
CREATE INDEX IF NOT EXISTS idx_page_content_location ON public.page_content(country_code, state_id, city_id);

-- Update existing records to extract state from page_key where applicable
UPDATE public.page_content 
SET state_id = 'ca' 
WHERE page_key LIKE 'california%' AND state_id IS NULL;

UPDATE public.page_content 
SET state_id = 'tx' 
WHERE page_key LIKE 'texas%' AND state_id IS NULL;

UPDATE public.page_content 
SET state_id = 'fl' 
WHERE page_key LIKE 'florida%' AND state_id IS NULL;

UPDATE public.page_content 
SET state_id = 'ny' 
WHERE page_key LIKE 'new-york%' AND state_id IS NULL;