-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Anyone can view article images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'article-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload article images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update images
CREATE POLICY "Admins can update article images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'article-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete article images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'article-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);