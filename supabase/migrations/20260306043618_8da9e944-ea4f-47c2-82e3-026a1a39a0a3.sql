
-- Create storage bucket for boutique media (images, videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('boutique-media', 'boutique-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their boutique folder
CREATE POLICY "Authenticated users can upload boutique media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'boutique-media');

-- Allow public read access
CREATE POLICY "Public read access for boutique media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'boutique-media');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update boutique media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'boutique-media');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete boutique media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'boutique-media');
