'use client'

import Link from 'next/link'

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
            Team
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage team members and permissions
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">Team management coming soon...</p>
        </div>
      </div>
    </div>
  )
}
