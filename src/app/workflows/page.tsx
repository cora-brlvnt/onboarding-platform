'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_days: 30,
    status: 'active',
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchWorkflows()
  }, [])

  async function fetchWorkflows() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('workflows').select('*').order('created_at', { ascending: false })

      if (error) throw error
      setWorkflows(data || [])
    } catch (error) {
      console.error('Error fetching workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (editingId) {
        const { error } = await supabase.from('workflows').update(formData).eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('workflows').insert([formData])

        if (error) throw error
      }

      setFormData({ name: '', description: '', duration_days: 30, status: 'active' })
      setEditingId(null)
      setShowForm(false)
      fetchWorkflows()
    } catch (error) {
      console.error('Error saving workflow:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return

    try {
      const { error } = await supabase.from('workflows').delete().eq('id', id)

      if (error) throw error
      fetchWorkflows()
    } catch (error) {
      console.error('Error deleting workflow:', error)
    }
  }

  function handleEdit(workflow: any) {
    setFormData({
      name: workflow.name,
      description: workflow.description,
      duration_days: workflow.duration_days,
      status: workflow.status,
    })
    setEditingId(workflow.id)
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
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Workflows</h1>
          </div>
          <button
            onClick={() => {
              setFormData({ name: '', description: '', duration_days: 30, status: 'active' })
              setEditingId(null)
              setShowForm(!showForm)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:shadow-lg"
          >
            <Plus size={20} />
            Create Workflow
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Workflow' : 'New Workflow'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Workflow Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Duration (days)"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
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
            <p className="text-slate-600 dark:text-slate-400">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400">No workflows yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{workflow.name}</h3>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        workflow.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : workflow.status === 'draft'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {workflow.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(workflow)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(workflow.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{workflow.description}</p>
                <p className="text-slate-500 dark:text-slate-500 text-xs">Duration: {workflow.duration_days} days</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
