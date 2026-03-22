// Fintutto World — Web Push Notification Manager
// Registers push subscription, sends to backend, handles permission flow
// Works with VitePWA's auto-generated service worker

import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

/** Check if push notifications are supported */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** Get current permission state */
export function getPushPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied'
  return Notification.permission
}

/** Request push notification permission and register subscription */
export async function requestPushPermission(): Promise<{
  granted: boolean
  subscription?: PushSubscription
}> {
  if (!isPushSupported()) return { granted: false }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { granted: false }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    })

    // Store subscription in Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('fw_push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
        user_agent: navigator.userAgent,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,endpoint' })
    }

    return { granted: true, subscription }
  } catch (error) {
    console.warn('[Push] Registration failed:', error)
    return { granted: false }
  }
}

/** Unsubscribe from push notifications */
export async function unsubscribePush(): Promise<void> {
  if (!isPushSupported()) return

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()

      // Mark inactive in DB
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('fw_push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)
      }
    }
  } catch {
    // silently fail
  }
}

/** Show a local notification (for geofence triggers etc.) */
export async function showLocalNotification(
  title: string,
  body: string,
  options?: {
    icon?: string
    badge?: string
    tag?: string
    data?: Record<string, unknown>
    actions?: { action: string; title: string }[]
  },
): Promise<void> {
  if (Notification.permission !== 'granted') return

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, {
      body,
      icon: options?.icon || '/favicon.svg',
      badge: options?.badge || '/favicon.svg',
      tag: options?.tag,
      data: options?.data,
      // @ts-expect-error — actions is part of the Notification API but not in all TS DOM libs
      actions: options?.actions,
      vibrate: [200, 100, 200],
    })
  } catch {
    // Fallback to standard Notification API
    new Notification(title, { body, icon: options?.icon || '/favicon.svg' })
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from(rawData, char => char.charCodeAt(0))
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return window.btoa(binary)
}
