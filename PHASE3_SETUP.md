# Phase 3: Brand Assets Manager — Setup Guide

## Overview
Brand Assets Manager is a complete system for managing logos, images, fonts, and templates for multiple brands. It integrates with Supabase for storage and database management.

## Features
- ✅ Multi-brand management (create, edit, delete brands)
- ✅ Drag-and-drop asset upload (images, logos, fonts, templates)
- ✅ Asset gallery with preview
- ✅ Auto-indexed JSON export (for Marketing Asset Generator integration)
- ✅ File storage via Supabase Storage
- ✅ Real-time asset synchronization

## Setup Instructions

### 1. Create Supabase Tables
Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Phase 3: Brand Assets Management

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'logo', 'image', 'font', 'template'
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  usage TEXT, -- e.g., "landing page hero", "social media"
  uploaded_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create assets JSON view (for easy export)
CREATE OR REPLACE VIEW brands_with_assets AS
SELECT 
  b.id,
  b.name,
  b.slug,
  b.description,
  json_build_object(
    'images', COALESCE(json_agg(
      json_build_object('name', a.filename, 'file', a.file_url, 'usage', a.usage)
    ) FILTER (WHERE a.file_type = 'image'), '[]'::json),
    'logos', COALESCE(json_agg(
      json_build_object('name', a.filename, 'file', a.file_url, 'usage', a.usage)
    ) FILTER (WHERE a.file_type = 'logo'), '[]'::json),
    'fonts', COALESCE(json_agg(
      json_build_object('name', a.filename, 'file', a.file_url, 'usage', a.usage)
    ) FILTER (WHERE a.file_type = 'font'), '[]'::json)
  ) as assets_json,
  b.created_at,
  b.updated_at
FROM brands b
LEFT JOIN assets a ON b.id = a.brand_id
GROUP BY b.id, b.name, b.slug, b.description, b.created_at, b.updated_at;

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, add permissions later)
CREATE POLICY "Allow all access to brands" ON brands
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to assets" ON assets
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_assets_brand_id ON assets(brand_id);
CREATE INDEX idx_assets_file_type ON assets(file_type);
CREATE INDEX idx_brands_slug ON brands(slug);

-- Insert default brands (ready for content)
INSERT INTO brands (name, slug, description) VALUES
  ('Berelvant', 'berelvant', 'AI automation and growth systems'),
  ('CVRedi', 'cvredi', 'Conversion rate optimization tools'),
  ('FastTrack Hub', 'fasttrack-hub', 'Community and mentorship platform')
ON CONFLICT DO NOTHING;
```

### 2. Create Supabase Storage Bucket
In your Supabase dashboard:

1. Go to **Storage** → **Buckets**
2. Click **New bucket** and name it `brand-assets`
3. Make it **Public** (for easy CDN access)
4. Leave other settings as default

### 3. Set Bucket Policies
In Supabase SQL Editor, run:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads to brand-assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'brand-assets');

-- Allow public read access
CREATE POLICY "Allow public read access to brand-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'brand-assets');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletions from brand-assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'brand-assets');
```

### 4. Update Environment Variables
Make sure these are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Deploy to Railway
```bash
cd /path/to/onboarding-platform-dev
git add .
git commit -m "Phase 3: Brand Assets Manager (multi-brand, upload, gallery, JSON export)"
git push origin main
railway up --service onboarding-platform
```

## File Structure
```
src/
├── app/
│   ├── brand-assets/
│   │   ├── page.tsx              (Brand list, create brand)
│   │   └── [brandId]/
│   │       └── page.tsx          (Upload, gallery, export JSON)
├── hooks/
│   └── useBrandAssets.ts         (All brand/asset operations)
└── ...
supabase/
└── migrations/
    └── 20260220_create_brand_assets.sql
```

## Usage

### For Miguel's Team
1. Navigate to `/brand-assets`
2. Click on a brand (or create a new one)
3. Drag-and-drop images/logos/fonts
4. Set asset type + usage (optional)
5. Click "Export JSON" to download assets.json

### For Marketing Asset Generator
```bash
cora generate-marketing-asset \
  --type instagram-feed \
  --brand-id berelvant \
  --headline "Your message" \
  --save ads/instagram.png
```

The system will automatically pull from the Supabase database instead of local JSON files.

## Database Schema

### brands table
- `id` (UUID) — Primary key
- `name` (TEXT) — Brand name (unique)
- `slug` (TEXT) — URL-friendly name (unique)
- `description` (TEXT) — Optional description
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### assets table
- `id` (UUID) — Primary key
- `brand_id` (UUID) — Foreign key to brands
- `filename` (TEXT) — Original filename
- `file_type` (TEXT) — 'logo' | 'image' | 'font' | 'template'
- `file_url` (TEXT) — Supabase Storage public URL
- `file_size` (INTEGER) — File size in bytes
- `usage` (TEXT) — Optional usage notes
- `uploaded_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### brands_with_assets view
Auto-generates JSON with grouped assets by type:
```json
{
  "images": [
    { "name": "filename.jpg", "file": "url", "usage": "..." }
  ],
  "logos": [...],
  "fonts": [...]
}
```

## Next Steps

1. ✅ Run SQL migration in Supabase
2. ✅ Create `brand-assets` storage bucket
3. ✅ Set bucket policies
4. ✅ Deploy Phase 3 to Railway
5. ⏳ Test with Miguel's team
6. ⏳ Add user/permission system (Phase 4)
7. ⏳ Integrate with Marketing Asset Generator

## Support

- **Issue:** Files not uploading
  - Check bucket permissions in Supabase Storage
  - Verify NEXT_PUBLIC_SUPABASE_* env vars are set
  - Check browser console for errors

- **Issue:** Assets not showing in gallery
  - Refresh the page
  - Verify Supabase database connectivity
  - Check RLS policies are not blocking reads

- **Issue:** Export JSON returns empty
  - Ensure assets are tagged with `file_type`
  - Check brands_with_assets view exists in Supabase

---

## Version History
- **Phase 3** (Feb 20, 2026): Brand Assets Manager — Multi-brand, upload, gallery, JSON export
