'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
    status: 'active',
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (editingId) {
        const { error } = await supabase.from('clients').update(formData).eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('clients').insert([formData])

        if (error) throw error
      }

      setFormData({ name: '', email: '', company: '', industry: '', status: 'active' })
      setEditingId(null)
      setShowForm(false)
      fetchClients()
    } catch (error) {
      console.error('Error saving client:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)

      if (error) throw error
      fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  function handleEdit(client: any) {
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company,
      industry: client.industry,
      status: client.status,
    })
    setEditingId(client.id)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block text-sm">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Clients</h1>
          </div>
          <button
            onClick={() => {
              setFormData({ name: '', email: '', company: '', industry: '', status: 'active' })
              setEditingId(null)
              setShowForm(!showForm)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:shadow-lg"
          >
            <Plus size={20} />
            Add Client
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Client' : 'New Client'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400">No clients yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-3 text-slate-900 dark:text-white font-medium">{client.name}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{client.company || '-'}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400 text-sm">{client.email || '-'}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          client.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : client.status === 'paused'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleEdit(client)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
