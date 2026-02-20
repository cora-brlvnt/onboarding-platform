'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  brand_id: string;
  filename: string;
  file_type: 'logo' | 'image' | 'font' | 'template';
  file_url: string;
  file_size: number;
  usage: string;
  uploaded_at: string;
}

export function useBrandAssets() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setBrands(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Create brand
  const createBrand = async (name: string, description: string) => {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const { data, error: createError } = await supabase
        .from('brands')
        .insert([{ name, slug, description }])
        .select()
        .single();

      if (createError) throw createError;
      setBrands([...brands, data]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create brand');
    }
  };

  // Update brand
  const updateBrand = async (id: string, name: string, description: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('brands')
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setBrands(brands.map(b => b.id === id ? data : b));
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update brand');
    }
  };

  // Delete brand
  const deleteBrand = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setBrands(brands.filter(b => b.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete brand');
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}

export function useBrandAssetsList(brandId: string) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .eq('brand_id', brandId)
        .order('uploaded_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAssets(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Upload asset
  const uploadAsset = async (
    file: File,
    fileType: 'logo' | 'image' | 'font' | 'template',
    usage: string
  ) => {
    try {
      const fileName = `${brandId}/${fileType}/${Date.now()}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      // Create asset record
      const { data, error: insertError } = await supabase
        .from('assets')
        .insert([
          {
            brand_id: brandId,
            filename: file.name,
            file_type: fileType,
            file_url: urlData.publicUrl,
            file_size: file.size,
            usage,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      setAssets([data, ...assets]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to upload asset');
    }
  };

  // Delete asset
  const deleteAsset = async (id: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = fileUrl.split('/brand-assets/')[1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('brand-assets')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      setAssets(assets.filter(a => a.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete asset');
    }
  };

  // Export as JSON
  const exportAsJSON = async () => {
    const { data, error } = await supabase
      .from('brands_with_assets')
      .select('*')
      .eq('id', brandId)
      .single();

    if (error) throw error;
    return data?.assets_json;
  };

  useEffect(() => {
    if (brandId) {
      fetchAssets();
    }
  }, [brandId]);

  return {
    assets,
    loading,
    error,
    fetchAssets,
    uploadAsset,
    deleteAsset,
    exportAsJSON,
  };
}
