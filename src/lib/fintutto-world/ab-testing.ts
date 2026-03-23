// A/B Testing for Content Layers
// Tests different content depths (brief vs standard vs detailed) and personalization strategies

export interface AbTest {
  id: string
  name: string
  description: string
  variants: AbVariant[]
  trafficSplit: number[] // e.g. [50, 50] for 50/50 split
  status: 'draft' | 'running' | 'completed'
  startDate: string
  endDate?: string
  metric: 'engagement_time' | 'audio_plays' | 'tour_completions' | 'rating' | 'return_rate'
}

export interface AbVariant {
  id: string
  name: string
  contentLayer: 'brief' | 'standard' | 'detailed' | 'children' | 'youth'
  audienceTarget?: string
  modifications?: Record<string, unknown>
}

export interface AbResult {
  variantId: string
  impressions: number
  conversions: number
  conversionRate: number
  avgEngagementSeconds: number
  confidence: number // 0-1, statistical significance
}

/**
 * Assign a visitor to an A/B test variant.
 * Uses consistent hashing so the same visitor always gets the same variant.
 */
export function assignVariant(testId: string, visitorId: string, trafficSplit: number[]): number {
  // Simple hash-based assignment
  const hash = simpleHash(`${testId}:${visitorId}`)
  const normalized = (hash % 10000) / 10000 // 0-1

  let cumulative = 0
  for (let i = 0; i < trafficSplit.length; i++) {
    cumulative += trafficSplit[i] / 100
    if (normalized < cumulative) return i
  }
  return trafficSplit.length - 1
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Calculate statistical significance using chi-squared approximation.
 */
export function calculateSignificance(
  controlConversions: number,
  controlTotal: number,
  variantConversions: number,
  variantTotal: number,
): number {
  if (controlTotal === 0 || variantTotal === 0) return 0

  const p1 = controlConversions / controlTotal
  const p2 = variantConversions / variantTotal
  const pPooled = (controlConversions + variantConversions) / (controlTotal + variantTotal)

  if (pPooled === 0 || pPooled === 1) return 0

  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / controlTotal + 1 / variantTotal))
  if (se === 0) return 0

  const z = Math.abs(p1 - p2) / se

  // Approximate p-value from z-score (simplified)
  const confidence = 1 - Math.exp(-0.5 * z * z) * (z < 3.5 ? 1 : 0)
  return Math.min(confidence, 0.999)
}

/**
 * Get the content layer to show based on A/B test assignment.
 */
export function getTestContentLayer(
  test: AbTest,
  variantIndex: number,
): string {
  const variant = test.variants[variantIndex]
  return variant?.contentLayer || 'standard'
}
