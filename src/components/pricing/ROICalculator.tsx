// ROICalculator — Interactive savings calculator per segment.
// Shows how much a customer saves vs. the competitor alternative.

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getTiersBySegment,
  formatPrice,
  type TierId,
  type Segment,
} from '@/lib/tiers'
import {
  calculateGuideSavings,
  calculateEventSavings,
  calculateCruiseSavings,
  type SavingsResult,
} from '@/lib/sales-calculator'

type CalcSegment = 'guide' | 'event' | 'cruise'

interface ROICalculatorProps {
  segment: CalcSegment
}

// ---- Segment-specific input configs ----

interface SliderDef {
  key: string
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit: string
}

const SEGMENT_SLIDERS: Record<CalcSegment, SliderDef[]> = {
  guide: [
    { key: 'listenersPerTour', label: 'Hörer pro Tour', min: 5, max: 100, step: 5, defaultValue: 25, unit: '' },
    { key: 'toursPerMonth', label: 'Touren pro Monat', min: 1, max: 60, step: 1, defaultValue: 12, unit: '' },
  ],
  event: [
    { key: 'hoursPerMonth', label: 'Stunden pro Monat', min: 1, max: 200, step: 1, defaultValue: 20, unit: 'h' },
  ],
  cruise: [
    { key: 'shipsCount', label: 'Anzahl Schiffe', min: 1, max: 20, step: 1, defaultValue: 1, unit: '' },
    { key: 'excursionsPerMonth', label: 'Exkursionen pro Monat', min: 1, max: 60, step: 1, defaultValue: 15, unit: '' },
    { key: 'minutesPerExcursion', label: 'Minuten pro Exkursion', min: 15, max: 240, step: 15, defaultValue: 90, unit: 'min' },
    { key: 'languages', label: 'Sprachen', min: 2, max: 20, step: 1, defaultValue: 8, unit: '' },
  ],
}

const SEGMENT_LABELS: Record<CalcSegment, { title: string; competitor: string }> = {
  guide: { title: 'Guide: ROI-Rechner', competitor: 'Vox Hardware-Miete' },
  event: { title: 'Event: ROI-Rechner', competitor: 'Wordly.ai' },
  cruise: { title: 'Cruise: ROI-Rechner', competitor: 'Dolmetscher-Kosten' },
}

export default function ROICalculator({ segment }: ROICalculatorProps) {
  const tiers = getTiersBySegment(segment as Segment)
  const [selectedTierId, setSelectedTierId] = useState<TierId>(tiers[0]?.id ?? 'free')
  const sliders = SEGMENT_SLIDERS[segment]
  const labels = SEGMENT_LABELS[segment]

  // Slider states
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const s of sliders) init[s.key] = s.defaultValue
    return init
  })

  const setSliderValue = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  // Compute savings
  const result: SavingsResult = useMemo(() => {
    switch (segment) {
      case 'guide':
        return calculateGuideSavings({
          tierId: selectedTierId,
          listenersPerTour: values.listenersPerTour,
          toursPerMonth: values.toursPerMonth,
        })
      case 'event':
        return calculateEventSavings({
          tierId: selectedTierId,
          hoursPerMonth: values.hoursPerMonth,
        })
      case 'cruise':
        return calculateCruiseSavings({
          tierId: selectedTierId,
          shipsCount: values.shipsCount,
          excursionsPerMonth: values.excursionsPerMonth,
          minutesPerExcursion: values.minutesPerExcursion,
          languages: values.languages,
        })
    }
  }, [segment, selectedTierId, values])

  const savingsPositive = result.savingsEurMonth > 0
  const barWidthOurs = savingsPositive
    ? Math.round((result.ourMonthlyCost / result.competitorMonthlyCost) * 100)
    : 100
  const barWidthComp = 100

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-lg font-semibold">{labels.title}</h3>
      </div>

      {/* Tier selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Plan auswählen</label>
        <div className="flex flex-wrap gap-2">
          {tiers.map(tier => (
            <button
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedTierId === tier.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tier.displayName} ({formatPrice(tier.pricing.monthlyEur)}/Mo)
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {sliders.map(slider => (
          <div key={slider.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">{slider.label}</label>
              <span className="text-sm font-semibold tabular-nums">
                {values[slider.key]}{slider.unit && ` ${slider.unit}`}
              </span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={values[slider.key]}
              onChange={e => setSliderValue(slider.key, Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>

      {/* Results — bar comparison */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">GuideTranslator</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatPrice(result.ourMonthlyCost)}/Mo
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(barWidthOurs, 2)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{labels.competitor}</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {formatPrice(result.competitorMonthlyCost)}/Mo
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-300"
              style={{ width: `${barWidthComp}%` }}
            />
          </div>
        </div>
      </div>

      {/* Savings summary */}
      {savingsPositive && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center space-y-1">
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {result.savingsPercent}% günstiger
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-500">
            Sie sparen {formatPrice(result.savingsEurMonth)}/Monat
            &middot; {formatPrice(result.savingsEurYear)}/Jahr
          </p>
        </div>
      )}

      <Link to="/pricing">
        <Button className="w-full gap-2">
          Jetzt starten
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </Card>
  )
}
