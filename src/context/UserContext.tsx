// User Context — Manages authentication state, tier, and feature access.
// Wraps Supabase Auth and provides tier-aware helpers to the entire app.
// Until Supabase Auth is fully set up, supports "local-only" mode with
// tier stored in localStorage (for development / demo).

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { TIERS, isInternalTier, type TierId, type TierDefinition } from '../lib/tiers'
import { setUsageTier, getUsage, type UsageRecord } from '../lib/usage-tracker'
import { startUsageSync, stopUsageSync } from '../lib/usage-sync'
import type { UserRole } from '../lib/admin-types'

// Supabase URL and anon key for direct REST API calls
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNTU2NzYsImV4cCI6MjA1MzgzMTY3Nn0.KzAlgorLEJf_yfPY4RFEs1MERPyt5sYjIEvVPmPsWH4'

/** Fetch user profile directly via Supabase REST API using the session's access token.
 *  This avoids the race condition where onAuthStateChange fires before the
 *  Supabase JS client has internally set the session (causing RLS to block). */
async function fetchProfileDirect(userId: string, accessToken: string) {
  const url = `${SUPABASE_URL}/rest/v1/gt_users?id=eq.${userId}&select=tier_id,organization_id,stripe_customer_id,display_name,role`
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  })
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length === 1 ? rows[0] : null
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string
  email: string | null
  displayName: string | null
  tierId: TierId
  organizationId: string | null
  stripeCustomerId: string | null
  role: UserRole
}

interface UserContextValue {
  // Auth state
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean

  // Tier info
  tier: TierDefinition
  tierId: TierId

  // Role
  isAdmin: boolean
  isSalesAgent: boolean

  // Usage
  usage: UsageRecord

  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setTier: (tierId: TierId) => void  // For dev/demo: manually override tier
  refreshUsage: () => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const UserContext = createContext<UserContextValue | null>(null)

const LOCAL_TIER_KEY = 'gt_user_tier'

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tierId, setTierId] = useState<TierId>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_TIER_KEY) as TierId | null
      return saved && TIERS[saved] ? saved : 'free'
    } catch {
      return 'free'
    }
  })
  const [usage, setUsage] = useState<UsageRecord>(getUsage())

  // Sync tier to usage tracker
  useEffect(() => {
    setUsageTier(tierId)
    try {
      localStorage.setItem(LOCAL_TIER_KEY, tierId)
    } catch { /* */ }
  }, [tierId])

  // Listen for Supabase auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Fetch profile using the session's access token directly via REST API.
          // This avoids the race condition where onAuthStateChange fires before
          // the Supabase JS client has internally stored the session token
          // (which would cause auth.uid() to be null in RLS policies).
          let profile = await fetchProfileDirect(session.user.id, session.access_token)

          // Auto-create profile if the row truly doesn't exist.
          // Use INSERT (not upsert) to avoid overwriting existing role/tier.
          if (!profile) {
            const { data: created } = await supabase
              .from('gt_users')
              .insert({
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.email,
                tier_id: 'free',
                role: 'user',
              })
              .select('tier_id, organization_id, stripe_customer_id, display_name, role')
              .single()
            profile = created

            // If insert also failed (row existed but SELECT was blocked), try once more
            if (!profile) {
              await new Promise(r => setTimeout(r, 1000))
              profile = await fetchProfileDirect(session.user.id, session.access_token)
            }
          }

          const dbTier = (profile?.tier_id as TierId) || 'free'
          const userRole = (profile?.role as UserRole) || 'user'

          // Internal roles get their internal tier automatically (all features, no cost).
          // If the DB already has the correct internal tier, keep it; otherwise override.
          let effectiveTier: TierId = dbTier
          if (userRole === 'admin' && !isInternalTier(dbTier)) {
            effectiveTier = 'internal_admin'
          } else if (userRole === 'sales_agent' && !isInternalTier(dbTier)) {
            effectiveTier = 'internal_sales'
          } else if (userRole === 'tester' && !isInternalTier(dbTier)) {
            effectiveTier = 'internal_tester'
          }

          setUser({
            id: session.user.id,
            email: session.user.email ?? null,
            displayName: profile?.display_name ?? session.user.email ?? null,
            tierId: effectiveTier,
            organizationId: profile?.organization_id ?? null,
            stripeCustomerId: profile?.stripe_customer_id ?? null,
            role: userRole,
          })
          setTierId(effectiveTier)

          // Start syncing usage to server
          startUsageSync(session.user.id)
        } else {
          setUser(null)
          stopUsageSync()
          // Keep local tier for anonymous/demo users
        }
        setIsLoading(false)
      }
    )

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setIsLoading(false)
      // onAuthStateChange will handle the rest
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    stopUsageSync()
    await supabase.auth.signOut()
    setUser(null)
    setTierId('free')
  }, [])

  const setTier = useCallback((newTierId: TierId) => {
    if (TIERS[newTierId]) {
      setTierId(newTierId)
    }
  }, [])

  const refreshUsage = useCallback(() => {
    setUsage({ ...getUsage() })
  }, [])

  const tier = TIERS[tierId] ?? TIERS.free
  const isAdmin = user?.role === 'admin'
  const isSalesAgent = user?.role === 'admin' || user?.role === 'sales_agent'

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      tier,
      tierId,
      isAdmin,
      isSalesAgent,
      usage,
      signIn,
      signUp,
      signOut,
      setTier,
      refreshUsage,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx
}

// Convenience hooks
export function useTier(): TierDefinition {
  return useUser().tier
}

export function useTierId(): TierId {
  return useUser().tierId
}

export function useRole() {
  const { user, isAdmin, isSalesAgent } = useUser()
  return { role: user?.role ?? 'user', isAdmin, isSalesAgent }
}
