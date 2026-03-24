// Organization API — Supabase queries for organization management.

import { supabase } from './supabase'
import type { UserProfile } from '@/context/UserContext'

export interface Organization {
  id: string
  name: string
  tier_id: string
  owner_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  max_seats: number
  created_at: string
}

export interface OrgInvite {
  id: string
  organization_id: string
  email: string
  invited_by: string | null
  status: string
  created_at: string
  expires_at: string
}

export async function fetchOrganization(id: string): Promise<Organization> {
  const { data, error } = await supabase
    .from('gt_organizations')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Organization
}

export async function fetchOrgMembers(orgId: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('gt_users')
    .select('id, email, display_name, tier_id, organization_id, stripe_customer_id, role')
    .eq('organization_id', orgId)
  if (error) throw error
  return (data ?? []).map(u => ({
    id: u.id,
    email: u.email,
    displayName: u.display_name,
    tierId: u.tier_id,
    organizationId: u.organization_id,
    stripeCustomerId: u.stripe_customer_id,
    role: u.role ?? 'user',
  })) as UserProfile[]
}

export async function fetchOrgInvites(orgId: string): Promise<OrgInvite[]> {
  const { data, error } = await supabase
    .from('gt_org_invites')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as OrgInvite[]
}

export async function inviteMember(orgId: string, email: string, invitedBy: string): Promise<void> {
  const { error } = await supabase
    .from('gt_org_invites')
    .insert({
      organization_id: orgId,
      email,
      invited_by: invitedBy,
      status: 'pending',
    })
  if (error) throw error
}

export async function removeMember(userId: string): Promise<void> {
  const { error } = await supabase
    .from('gt_users')
    .update({ organization_id: null })
    .eq('id', userId)
  if (error) throw error
}

export async function createOrganization(name: string, tierId: string, ownerId: string): Promise<Organization> {
  const { data, error } = await supabase
    .from('gt_organizations')
    .insert({ name, tier_id: tierId, owner_id: ownerId })
    .select()
    .single()
  if (error) throw error
  return data as Organization
}
