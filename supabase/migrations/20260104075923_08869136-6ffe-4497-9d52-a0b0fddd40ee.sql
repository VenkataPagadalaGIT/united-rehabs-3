-- Drop the incorrect unique constraint on page_key alone
ALTER TABLE public.page_content DROP CONSTRAINT IF EXISTS page_content_page_key_key;

-- Add composite unique constraint for page_key + section_key
ALTER TABLE public.page_content ADD CONSTRAINT page_content_page_section_unique UNIQUE (page_key, section_key);