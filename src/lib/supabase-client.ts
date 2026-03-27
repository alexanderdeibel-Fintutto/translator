// Compatibility shim: ConferenceLandingPage expects a createClient() factory
import { supabase } from './supabase'
export function createClient() { return supabase }
