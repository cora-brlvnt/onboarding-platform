'use client';

import { useState } from 'react';
import { useBrandAssets } from '@/hooks/useBrandAssets';
import Link from 'next/link';

export default function BrandAssetsPage() {
  const { brands, loading, error, createBrand } = useBrandAssets();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;

    try {
      setIsCreating(true);
      await createBrand(newBrandName, newBrandDesc);
      setNewBrandName('');
      setNewBrandDesc('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create brand:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-800 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Brand Assets</h1>
          <p className="text-gray-400">
            Manage logos, images, fonts, and templates for each brand.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Create Brand Button */}
        <div className="mb-8">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              + New Brand
            </button>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Create Brand</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Brand Name (e.g., Berelvant)"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateBrand}
                    disabled={isCreating}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded font-semibold transition"
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand-assets/${brand.id}`}
              className="group"
            >
              <div className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-lg p-6 transition cursor-pointer h-full">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition">
                  {brand.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {brand.description || 'No description'}
                </p>
                <div className="text-xs text-gray-500">
                  Manage assets →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {brands.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No brands created yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Create Your First Brand
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
