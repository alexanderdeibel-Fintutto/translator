import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — auth and database features will not work')
}

// Use placeholder values when env vars are missing (test/dev) — actual API calls will fail gracefully
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Use a simple in-process lock instead of navigator.locks to prevent
    // timeout errors in PWA environments with Service Workers.
    // navigator.locks can deadlock when the SW holds stale locks.
    lock: <R>(
      _name: string,
      _acquireTimeout: number,
      fn: () => Promise<R>
    ): Promise<R> => {
      return fn()
    },
  },
})
