-- Create storage buckets for cake images and shop logo
INSERT INTO storage.buckets (id, name, public) VALUES ('cake-images', 'cake-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('shop', 'shop', true);

-- Set up security policies for the buckets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (true);
