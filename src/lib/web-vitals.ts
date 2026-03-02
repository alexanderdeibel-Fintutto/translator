// Web Vitals reporting — LCP, FID, CLS, TTFB, INP
// Reports to both GA4 and admin dashboard

import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals'
import { trackPerformance } from './analytics'
import { reportEvent } from './admin-reporter'

function getRating(metric: Metric): string {
  return metric.rating || 'unknown'
}

function handleMetric(metric: Metric) {
  trackPerformance(metric.name, metric.value, getRating(metric))

  // Detailed report for admin dashboard
  reportEvent('web_vital_detail', {
    name: metric.name,
    value: Math.round(metric.value * 100) / 100,
    rating: getRating(metric),
    delta: Math.round(metric.delta * 100) / 100,
    id: metric.id,
    navigationType: metric.navigationType,
  })
}

export function initWebVitals() {
  onCLS(handleMetric)
  onINP(handleMetric)
  onLCP(handleMetric)
  onFCP(handleMetric)
  onTTFB(handleMetric)
}
