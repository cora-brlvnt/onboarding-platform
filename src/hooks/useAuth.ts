import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [supabase.auth])

  return { user, loading }
}

export async function signUp(email: string, password: string) {
  const supabase = createClientComponentClient()
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${location.origin}/auth/callback`,
    },
  })
}

export async function signIn(email: string, password: string) {
  const supabase = createClientComponentClient()
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  const supabase = createClientComponentClient()
  return supabase.auth.signOut()
}
