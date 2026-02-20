'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, Users, FileText } from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    clients: 0,
    workflows: 0,
    tasks: 0,
    teamMembers: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Import supabase dynamically to avoid SSR issues
        const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
        const supabase = createClientComponentClient()

        const [clientsData, workflowsData, tasksData, teamData] = await Promise.all([
          supabase.from('clients').select('count', { count: 'exact' }),
          supabase.from('workflows').select('count', { count: 'exact' }),
          supabase.from('tasks').select('count', { count: 'exact' }),
          supabase.from('team_members').select('count', { count: 'exact' }),
        ])

        setStats({
          clients: clientsData.count || 0,
          workflows: workflowsData.count || 0,
          tasks: tasksData.count || 0,
          teamMembers: teamData.count || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Fallback to sample data
        setStats({
          clients: 0,
          workflows: 0,
          tasks: 0,
          teamMembers: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    { label: 'Clients', value: stats.clients, icon: Users },
    { label: 'Workflows', value: stats.workflows, icon: FileText },
    { label: 'Tasks', value: stats.tasks, icon: BarChart3 },
    { label: 'Team Members', value: stats.teamMembers, icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome to your onboarding platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/clients"
            className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-2">
              Manage Clients
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              View all clients and their onboarding progress
            </p>
          </Link>

          <Link
            href="/workflows"
            className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-2">
              Workflows
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Create and manage onboarding workflows
            </p>
          </Link>

          <Link
            href="/team"
            className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-2">
              Team
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Manage team members and permissions
            </p>
          </Link>

          <Link
            href="/settings"
            className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-2">
              Settings
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Configure your platform settings
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
