import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 dark:text-white mb-6">
          Onboarding Platform
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
          Professional client onboarding workflows for Berelvant
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/dashboard">
            <button className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              Dashboard
            </button>
          </Link>
          <Link href="/brand-assets">
            <button className="px-8 py-3 bg-slate-700 dark:bg-slate-800 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow">
              Brand Assets
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="px-8 py-3 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              Sign In
            </button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-serif text-lg font-bold mb-2">Multi-tenant</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage multiple clients in one platform</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-serif text-lg font-bold mb-2">Workflows</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Automated onboarding workflows and tracking</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-serif text-lg font-bold mb-2">Analytics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Real-time progress and team analytics</p>
          </div>
        </div>
      </div>
    </main>
  )
}
