import { createClient } from '@supabase/supabase-js'

const HARDCODED_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co'
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.qsLTEZo7shbafWY9w4Fo7is9GDW-1Af1wup_iCy2vVQ'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || HARDCODED_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || HARDCODED_KEY

// Warn if env var overrides the hardcoded key (common source of "Invalid API key" errors)
if (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== HARDCODED_KEY) {
  console.warn('[Supabase] VITE_SUPABASE_ANON_KEY env var overrides hardcoded key. If auth fails with "Invalid API key", check this env var.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
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
