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
