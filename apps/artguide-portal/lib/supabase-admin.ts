import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'

// Use SERVICE_ROLE_KEY for server-side admin client to bypass RLS
// This is safe because this file is only used in server-side API routes (never exposed to client)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2MDQ3MCwiZXhwIjoyMDg0MzM2NDcwfQ.cUzSAWSOXSkVkbXewXPaZS-CvdptCx5mE8kjXJnT6Ok'

// Server-side admin client (bypasses RLS for server-side operations)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
