import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Onboarding Platform | Berelvant',
  description: 'Multi-tenant client onboarding platform',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+Pro:wght@400;600&family=JetBrains+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
