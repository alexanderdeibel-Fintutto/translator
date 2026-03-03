// User Context — Manages authentication state, tier, and feature access.
// Wraps Supabase Auth and provides tier-aware helpers to the entire app.
// Until Supabase Auth is fully set up, supports "local-only" mode with
// tier stored in localStorage (for development / demo).

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { TIERS, type TierId, type TierDefinition } from '../lib/tiers'
import { setUsageTier, getUsage, type UsageRecord } from '../lib/usage-tracker'
import { startUsageSync, stopUsageSync } from '../lib/usage-sync'
import type { UserRole } from '../lib/admin-types'

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
          // Fetch user profile with tier from database
          let { data: profile } = await supabase
            .from('gt_users')
            .select('tier_id, organization_id, stripe_customer_id, display_name, role')
            .eq('id', session.user.id)
            .single()

          // Auto-create profile if missing (fallback for users who signed up
          // before the DB trigger existed, or if the trigger didn't fire)
          if (!profile) {
            const { data: created } = await supabase
              .from('gt_users')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.email,
                tier_id: 'free',
                role: 'user',
              }, { onConflict: 'id' })
              .select('tier_id, organization_id, stripe_customer_id, display_name, role')
              .single()
            profile = created
          }

          const userTier = (profile?.tier_id as TierId) || 'free'

          setUser({
            id: session.user.id,
            email: session.user.email ?? null,
            displayName: profile?.display_name ?? session.user.email ?? null,
            tierId: userTier,
            organizationId: profile?.organization_id ?? null,
            stripeCustomerId: profile?.stripe_customer_id ?? null,
            role: (profile?.role as UserRole) || 'user',
          })
          setTierId(userTier)

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
