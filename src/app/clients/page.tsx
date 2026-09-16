'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Trash2, Edit2 } from 'lucide-react'

// The clients table carries a full brand intake -- 30 columns. This form used to
// collect five of them, so everything that makes a client usable downstream
// (tone, palette, audiences, measurement IDs, asset links) could only be written
// straight into Postgres by hand. This covers the table.

const CHANNELS = [
  'GA4', 'GSC', 'GTM', 'SEO', 'Web/CRO', 'Email/CRM',
  'Google Ads', 'Meta Ads', 'LinkedIn Ads', 'Bing Ads', 'TikTok Ads', 'Programmatic',
]

const SOCIALS = [
  'linkedin', 'instagram', 'facebook', 'twitter', 'youtube',
  'tiktok', 'threads', 'pinterest', 'meta', 'other',
] as const

const EMPTY = {
  name: '', company: '', email: '', website: '', domain: '', industry: '',
  tagline: '', status: 'active', notes: '',
  tone_of_voice: '', logo_url: '',
  primary: '', secondary: '', accent: '',
  headline_font: '', body_font: '',
  key_values: '', target_audiences: '', dos: '', donts: '',
  ga4_property_id: '', gsc_property: '', google_ads_id: '',
  drive_folder_id: '', brand_assets_hub: '', poc_contacts: '', brand_asset_links: '',
  social: {} as Record<string, string>,
  channels: [] as string[],
}

type Form = typeof EMPTY

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const joinLines = (v: unknown) => (Array.isArray(v) ? v.join('\n') : '')
const splitLines = (s: string) => s.split('\n').map((v) => v.trim()).filter(Boolean)
const orNull = (s: string) => s.trim() || null
const blankForm = (): Form => ({ ...EMPTY, social: {}, channels: [] })

const FIELD =
  'w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm'
const LABEL = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'
const SUMMARY = 'text-sm font-semibold text-slate-900 dark:text-white cursor-pointer select-none py-2'

// Declared at module scope on purpose. Defined inside the page component these
// would be a new component type on every render, so React would remount the
// input and the field would lose focus after each keystroke.
function Text({
  label, value, onChange, hint, type = 'text', required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <input type={type} className={FIELD} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  )
}

function Area({
  label, value, onChange, hint, rows = 4,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  rows?: number
}) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <textarea rows={rows} className={FIELD} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Saves used to fail into console.error only, so a rejected write looked
  // exactly like a successful one. Anything that goes wrong now says so.
  const [problem, setProblem] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(blankForm)
  // The jsonb columns hold keys this form does not edit -- drive_structure,
  // client_documents, integration_registry. Writing a fresh object over them
  // would drop that data silently, so the edited row is kept and merged into.
  const [editingRow, setEditingRow] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setClients(data || [])
    } catch (err: any) {
      setProblem(err?.message || 'Could not load clients.')
    } finally {
      setLoading(false)
    }
  }

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function buildPayload() {
    const prev = editingRow || {}
    return {
      name: form.name.trim(),
      company: orNull(form.company),
      email: orNull(form.email),
      website: orNull(form.website),
      domain: orNull(form.domain),
      industry: orNull(form.industry),
      tagline: orNull(form.tagline),
      status: form.status,
      notes: orNull(form.notes),
      tone_of_voice: orNull(form.tone_of_voice),
      logo_url: orNull(form.logo_url),
      ga4_property_id: orNull(form.ga4_property_id),
      gsc_property: orNull(form.gsc_property),
      google_ads_id: orNull(form.google_ads_id),
      drive_folder_id: orNull(form.drive_folder_id),
      key_values: splitLines(form.key_values),
      target_audiences: splitLines(form.target_audiences),
      dos: splitLines(form.dos),
      donts: splitLines(form.donts),
      colors: {
        ...(prev.colors || {}),
        primary: orNull(form.primary),
        secondary: orNull(form.secondary),
        accent: orNull(form.accent),
      },
      typography: {
        ...(prev.typography || {}),
        headline_font: orNull(form.headline_font),
        body_font: orNull(form.body_font),
      },
      social_handles: {
        ...(prev.social_handles || {}),
        ...Object.fromEntries(SOCIALS.map((s) => [s, orNull(form.social[s] || '')])),
      },
      ad_strategy: { ...(prev.ad_strategy || {}), enabled_channels: form.channels },
      visual_style: {
        ...(prev.visual_style || {}),
        poc_contacts: orNull(form.poc_contacts),
        brand_asset_links: orNull(form.brand_asset_links),
        brand_assets_hub: orNull(form.brand_assets_hub),
      },
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setProblem(null)
    try {
      const body = buildPayload()
      const { error } = editingId
        ? await supabase.from('clients').update(body).eq('id', editingId)
        : await supabase.from('clients').insert([body])
      if (error) throw error
      resetForm()
      setShowForm(false)
      fetchClients()
    } catch (err: any) {
      setProblem(err?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this client?')) return
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      fetchClients()
    } catch (err: any) {
      setProblem(err?.message || 'Delete failed.')
    }
  }

  function resetForm() {
    setForm(blankForm())
    setEditingId(null)
    setEditingRow(null)
    setProblem(null)
  }

  function handleEdit(c: any) {
    const vs = c.visual_style || {}
    setForm({
      name: str(c.name),
      company: str(c.company),
      email: str(c.email),
      website: str(c.website),
      domain: str(c.domain),
      industry: str(c.industry),
      tagline: str(c.tagline),
      status: c.status || 'active',
      notes: str(c.notes),
      tone_of_voice: str(c.tone_of_voice),
      logo_url: str(c.logo_url),
      primary: str(c.colors?.primary),
      secondary: str(c.colors?.secondary),
      accent: str(c.colors?.accent),
      headline_font: str(c.typography?.headline_font),
      body_font: str(c.typography?.body_font),
      key_values: joinLines(c.key_values),
      target_audiences: joinLines(c.target_audiences),
      dos: joinLines(c.dos),
      donts: joinLines(c.donts),
      ga4_property_id: str(c.ga4_property_id),
      gsc_property: str(c.gsc_property),
      google_ads_id: str(c.google_ads_id),
      drive_folder_id: str(c.drive_folder_id),
      brand_assets_hub: str(vs.brand_assets_hub),
      poc_contacts: str(vs.poc_contacts),
      brand_asset_links: str(vs.brand_asset_links),
      social: Object.fromEntries(SOCIALS.map((s) => [s, str(c.social_handles?.[s])])),
      channels: Array.isArray(c.ad_strategy?.enabled_channels) ? c.ad_strategy.enabled_channels : [],
    })
    setEditingRow(c)
    setEditingId(c.id)
    setProblem(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
              resetForm()
              setShowForm(!showForm)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:shadow-lg"
          >
            <Plus size={20} />
            Add Client
          </button>
        </div>

        {problem && (
          <div className="mb-6 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {problem}
          </div>
        )}

        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
              {editingId ? 'Edit Client' : 'New Client'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <details open className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <summary className={SUMMARY}>Basics</summary>
                <div className="grid md:grid-cols-2 gap-4 pt-3">
                  <Text label="Client name *" value={form.name} onChange={(v) => set('name', v)} required />
                  <Text label="Company" value={form.company} onChange={(v) => set('company', v)} />
                  <Text label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
                  <Text label="Website" value={form.website} onChange={(v) => set('website', v)} />
                  <Text
                    label="Domain"
                    value={form.domain}
                    onChange={(v) => set('domain', v)}
                    hint="Bare domain, for analytics matching"
                  />
                  <Text label="Industry" value={form.industry} onChange={(v) => set('industry', v)} />
                  <Text label="Tagline" value={form.tagline} onChange={(v) => set('tagline', v)} />
                  <label className="block">
                    <span className={LABEL}>Status</span>
                    <select className={FIELD} value={form.status} onChange={(e) => set('status', e.target.value)}>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                </div>
              </details>

              <details className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <summary className={SUMMARY}>Brand &amp; voice</summary>
                <div className="space-y-4 pt-3">
                  <Area
                    label="Tone of voice"
                    rows={3}
                    value={form.tone_of_voice}
                    onChange={(v) => set('tone_of_voice', v)}
                    hint="How they sound. Words to use, words to avoid."
                  />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Text label="Logo URL" value={form.logo_url} onChange={(v) => set('logo_url', v)} />
                    <Text label="Headline font" value={form.headline_font} onChange={(v) => set('headline_font', v)} />
                    <Text label="Body font" value={form.body_font} onChange={(v) => set('body_font', v)} />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Text label="Primary colour" value={form.primary} onChange={(v) => set('primary', v)} hint="Hex, e.g. #0F172A" />
                    <Text label="Secondary colour" value={form.secondary} onChange={(v) => set('secondary', v)} />
                    <Text label="Accent colour" value={form.accent} onChange={(v) => set('accent', v)} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Area label="Key values" value={form.key_values} onChange={(v) => set('key_values', v)} hint="One per line." />
                    <Area label="Target audiences" value={form.target_audiences} onChange={(v) => set('target_audiences', v)} hint="One per line." />
                    <Area label="Do" value={form.dos} onChange={(v) => set('dos', v)} hint="One per line." />
                    <Area label="Don't" value={form.donts} onChange={(v) => set('donts', v)} hint="One per line." />
                  </div>
                </div>
              </details>

              <details className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <summary className={SUMMARY}>Channels &amp; measurement</summary>
                <div className="space-y-4 pt-3">
                  <div>
                    <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Active channels</span>
                    <div className="flex flex-wrap gap-2">
                      {CHANNELS.map((c) => {
                        const on = form.channels.includes(c)
                        return (
                          <button
                            key={c}
                            type="button"
                            aria-pressed={on}
                            onClick={() =>
                              set('channels', on ? form.channels.filter((x) => x !== c) : [...form.channels, c])
                            }
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              on
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {c}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Text label="GA4 property ID" value={form.ga4_property_id} onChange={(v) => set('ga4_property_id', v)} />
                    <Text label="GSC property" value={form.gsc_property} onChange={(v) => set('gsc_property', v)} hint="Full URL as registered" />
                    <Text label="Google Ads ID" value={form.google_ads_id} onChange={(v) => set('google_ads_id', v)} />
                  </div>
                </div>
              </details>

              <details className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <summary className={SUMMARY}>Social</summary>
                <div className="grid md:grid-cols-2 gap-4 pt-3">
                  {SOCIALS.map((s) => (
                    <Text
                      key={s}
                      label={s[0].toUpperCase() + s.slice(1)}
                      value={form.social[s] || ''}
                      onChange={(v) => set('social', { ...form.social, [s]: v })}
                    />
                  ))}
                </div>
              </details>

              <details className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <summary className={SUMMARY}>Assets, contacts &amp; notes</summary>
                <div className="space-y-4 pt-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Text label="Drive folder ID" value={form.drive_folder_id} onChange={(v) => set('drive_folder_id', v)} />
                    <Text label="Brand assets hub URL" value={form.brand_assets_hub} onChange={(v) => set('brand_assets_hub', v)} />
                  </div>
                  <Area
                    label="Points of contact"
                    rows={3}
                    value={form.poc_contacts}
                    onChange={(v) => set('poc_contacts', v)}
                    hint="One per line: Name | Role | Email | Phone"
                  />
                  <Area
                    label="Brand asset links"
                    rows={5}
                    value={form.brand_asset_links}
                    onChange={(v) => set('brand_asset_links', v)}
                    hint="One per line: Type | URL | Note"
                  />
                  <Area label="Notes" rows={3} value={form.notes} onChange={(v) => set('notes', v)} />
                </div>
              </details>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Industry</th>
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
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400 text-sm">{client.industry || '-'}</td>
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
