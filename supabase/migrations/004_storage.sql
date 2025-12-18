-- ============================================
-- AUTORESCUE - CONFIGURATION STORAGE
-- Version: 1.0.0
-- ============================================

-- ============================================
-- BUCKETS DE STOCKAGE
-- ============================================

-- Bucket pour les avatars utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Bucket pour les photos de pannes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'breakdowns',
    'breakdowns',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Bucket pour les rapports et documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reports',
    'reports',
    false,
    20971520, -- 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Bucket pour les logos et images des garages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'garages',
    'garages',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Bucket pour les signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'signatures',
    'signatures',
    false,
    2097152, -- 2MB
    ARRAY['image/png', 'image/svg+xml']
);

-- ============================================
-- POLICIES DE STOCKAGE
-- ============================================

-- AVATARS: Public read, authenticated write own
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- BREAKDOWNS: Restricted access
CREATE POLICY "Breakdown photos viewable by relevant parties"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'breakdowns' AND
    (
        -- Owner of breakdown
        auth.uid()::text = (storage.foldername(name))[1] OR
        -- Admin
        EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
);

CREATE POLICY "Users can upload breakdown photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'breakdowns' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their breakdown photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'breakdowns' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- REPORTS: Restricted access
CREATE POLICY "Reports viewable by relevant parties"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'reports' AND
    (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mechanic', 'garage'))
    )
);

CREATE POLICY "Mechanics can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'reports' AND
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mechanic'))
);

-- GARAGES: Public read for logos
CREATE POLICY "Garage images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'garages');

CREATE POLICY "Garage owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'garages' AND
    EXISTS(
        SELECT 1 FROM garages g 
        WHERE g.owner_id = auth.uid() 
        AND g.id::text = (storage.foldername(name))[1]
    )
);

CREATE POLICY "Garage owners can update images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'garages' AND
    EXISTS(
        SELECT 1 FROM garages g 
        WHERE g.owner_id = auth.uid() 
        AND g.id::text = (storage.foldername(name))[1]
    )
);

-- SIGNATURES: Restricted access
CREATE POLICY "Signatures viewable by relevant parties"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'signatures' AND
    (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mechanic', 'garage'))
    )
);

CREATE POLICY "Users can upload their signatures"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'signatures' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
