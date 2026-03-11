// User Context — Manages authentication state, tier, and feature access.
// Wraps Supabase Auth and provides tier-aware helpers to the entire app.
//
// OFFLINE SUPPORT: When the device goes offline, Supabase's auto-token-refresh
// fails and clears the session, logging the user out. We cache the user profile
// in localStorage so the app can continue working offline with the last known
// identity. When connectivity returns, normal auth resumes automatically.

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { TIERS, isInternalTier, type TierId, type TierDefinition } from '../lib/tiers'
import { setUsageTier, getUsage, type UsageRecord } from '../lib/usage-tracker'
import { startUsageSync, stopUsageSync } from '../lib/usage-sync'
import type { UserRole } from '../lib/admin-types'

// Supabase URL and anon key for direct REST API calls
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.qsLTEZo7shbafWY9w4Fo7is9GDW-1Af1wup_iCy2vVQ'

/** Fetch user profile via the SECURITY DEFINER RPC function get_my_profile().
 *  This bypasses RLS entirely and avoids the race condition / self-referencing
 *  policy issue that was blocking the direct SELECT on gt_users. */
async function fetchProfileRpc(accessToken: string) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/get_my_profile`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: '{}',
  })
  if (!res.ok) return null
  const data = await res.json()
  return data || null
}

/** Fallback: fetch profile directly via REST API with access token. */
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
// Offline session cache — survives token refresh failures when offline
// ---------------------------------------------------------------------------

const CACHED_PROFILE_KEY = 'gt_cached_user_profile'

function cacheUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(profile))
  } catch { /* quota exceeded or private browsing */ }
}

function getCachedUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CACHED_PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Basic validation
    if (parsed && typeof parsed.id === 'string' && typeof parsed.role === 'string') {
      return parsed as UserProfile
    }
  } catch { /* corrupt data */ }
  return null
}

function clearCachedUserProfile(): void {
  try {
    localStorage.removeItem(CACHED_PROFILE_KEY)
  } catch { /* */ }
}

function isDeviceOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
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
  // Ref to signal explicit sign-out to the auth state listener
  const signOutExplicitRef = useRef<() => void>(() => {})

  // Sync tier to usage tracker
  useEffect(() => {
    setUsageTier(tierId)
    try {
      localStorage.setItem(LOCAL_TIER_KEY, tierId)
    } catch { /* */ }
  }, [tierId])

  // Listen for Supabase auth changes
  useEffect(() => {
    // Track whether signOut was explicitly called by the user (not by token expiry)
    let explicitSignOut = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Strategy: try multiple approaches to load the user profile.
          // 1. RPC function (SECURITY DEFINER, bypasses RLS entirely)
          // 2. Direct REST API with access token
          // 3. Supabase client (may fail due to auth race condition)
          // 4. Auto-create if user truly doesn't exist
          let profile = await fetchProfileRpc(session.access_token)

          if (!profile) {
            profile = await fetchProfileDirect(session.user.id, session.access_token)
          }

          if (!profile) {
            // Try via Supabase client as last resort
            const { data } = await supabase
              .from('gt_users')
              .select('tier_id, organization_id, stripe_customer_id, display_name, role')
              .eq('id', session.user.id)
              .single()
            profile = data
          }

          // Auto-create profile if the row truly doesn't exist.
          // Use INSERT (not upsert) to avoid overwriting existing role/tier.
          if (!profile) {
            await supabase
              .from('gt_users')
              .insert({
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.email,
                tier_id: 'free',
                role: 'user',
              })
            // After insert, try to read it back
            profile = await fetchProfileRpc(session.access_token)
              || await fetchProfileDirect(session.user.id, session.access_token)
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

          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email ?? null,
            displayName: profile?.display_name ?? session.user.email ?? null,
            tierId: effectiveTier,
            organizationId: profile?.organization_id ?? null,
            stripeCustomerId: profile?.stripe_customer_id ?? null,
            role: userRole,
          }

          setUser(userProfile)
          setTierId(effectiveTier)

          // Cache profile for offline use
          cacheUserProfile(userProfile)

          // Start syncing usage to server
          startUsageSync(session.user.id)
        } else {
          // Session is null — either explicit sign-out or token refresh failed.
          //
          // OFFLINE GUARD: When the device is offline, Supabase's auto-token-refresh
          // fails and fires SIGNED_OUT with session=null. Instead of logging the user
          // out (which forces a re-login that's impossible offline), we restore the
          // cached profile so the app continues working.
          if (!explicitSignOut && isDeviceOffline()) {
            const cached = getCachedUserProfile()
            if (cached) {
              console.error('[Auth] Token refresh failed offline — restoring cached session')
              setUser(cached)
              setTierId(cached.tierId)
              // Don't start usage sync — we're offline
              setIsLoading(false)
              return
            }
          }

          // Genuine sign-out or no cached profile: clear everything
          explicitSignOut = false
          setUser(null)
          stopUsageSync()
          // Keep local tier for anonymous/demo users
        }
        setIsLoading(false)
      }
    )

    // Initial session check — also try cached profile if offline
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No active session. If offline, try to restore from cache.
        if (isDeviceOffline()) {
          const cached = getCachedUserProfile()
          if (cached) {
            console.error('[Auth] No session but offline — restoring cached profile')
            setUser(cached)
            setTierId(cached.tierId)
          }
        }
        setIsLoading(false)
      }
      // If session exists, onAuthStateChange will handle the rest
    })

    // Listen for online/offline transitions to re-attempt auth when back online
    const handleOnline = () => {
      // Device came back online — try to refresh the session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Session is still valid or was refreshed — onAuthStateChange handles it
        }
        // If no session, user stays in cached mode until they log in
      })
    }
    window.addEventListener('online', handleOnline)

    // Mark explicit sign-out so the offline guard doesn't interfere
    const origSignOut = signOutExplicitRef
    origSignOut.current = () => { explicitSignOut = true }

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
    }
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
    // Signal to the auth state listener that this is an explicit sign-out
    // so the offline guard doesn't restore the cached profile
    signOutExplicitRef.current()
    stopUsageSync()
    clearCachedUserProfile()
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
