'use client';

import { useState, useRef } from 'react';
import { useBrandAssetsList } from '@/hooks/useBrandAssets';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BrandAssetsDetailPage({
  params,
}: {
  params: { brandId: string };
}) {
  const { assets, loading, error, uploadAsset, deleteAsset, exportAsJSON } =
    useBrandAssetsList(params.brandId);

  const [brand, setBrand] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'logo' | 'image' | 'font' | 'template'>('image');
  const [usage, setUsage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch brand details
  useState(() => {
    const fetchBrand = async () => {
      const { data, error: fetchError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', params.brandId)
        .single();

      if (fetchError) console.error('Failed to fetch brand:', fetchError);
      else setBrand(data);
    };

    fetchBrand();
  }, []);

  // Handle file drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    try {
      setUploading(true);
      setUploadError(null);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadAsset(file, fileType, usage);
      }

      // Reset form
      setUsage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload files'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!window.confirm('Delete this asset?')) return;

    try {
      await deleteAsset(id, fileUrl);
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportAsJSON();
      const dataStr = JSON.stringify(json, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${brand?.slug}-assets.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-800 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/brand-assets" className="text-blue-400 hover:text-blue-300 mb-4 block">
              ← Back to Brands
            </Link>
            <h1 className="text-4xl font-bold">{brand?.name || 'Loading...'}</h1>
            <p className="text-gray-400 mt-2">{brand?.description}</p>
          </div>
          {assets.length > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
            >
              Export JSON
            </button>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {uploadError && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {uploadError}
          </div>
        )}

        {/* Upload Zone */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Upload Assets</h2>

          {/* File Type & Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Asset Type</label>
              <select
                value={fileType}
                onChange={(e) =>
                  setFileType(e.target.value as 'logo' | 'image' | 'font' | 'template')
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="logo">Logo</option>
                <option value="image">Image</option>
                <option value="font">Font</option>
                <option value="template">Template</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Usage (optional)</label>
              <input
                type="text"
                placeholder="e.g., Landing page hero"
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleChange}
              disabled={uploading}
              className="hidden"
              accept="image/*,.png,.jpg,.jpeg,.svg,.gif,.webp,.ttf,.otf,.woff,.woff2"
            />
            <div className="pointer-events-none">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-semibold mb-1">Drop files here or click to upload</p>
              <p className="text-sm text-gray-400">
                PNG, JPG, SVG, WebP, TTF, WOFF, WOFF2
              </p>
            </div>
          </div>

          {uploading && (
            <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-200">
              Uploading files...
            </div>
          )}
        </div>

        {/* Assets Gallery */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Assets ({assets.length})</h2>

          {assets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No assets uploaded yet. Upload your first asset above!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden group hover:border-gray-700 transition"
                >
                  {/* Preview */}
                  <div className="bg-gray-800 aspect-square overflow-hidden">
                    {asset.file_type === 'image' || asset.file_type === 'logo' ? (
                      <img
                        src={asset.file_url}
                        alt={asset.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        <span>{asset.file_type.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{asset.filename}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {(asset.file_size / 1024).toFixed(1)} KB
                    </p>
                    {asset.usage && (
                      <p className="text-xs text-gray-400 mb-3">{asset.usage}</p>
                    )}
                    <button
                      onClick={() => handleDelete(asset.id, asset.file_url)}
                      className="w-full px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
