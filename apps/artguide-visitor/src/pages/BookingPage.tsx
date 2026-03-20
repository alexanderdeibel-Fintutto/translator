import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

export default function BookingPage() {
  const { offerId, partnerId } = useParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [partySize, setPartySize] = useState(1)
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('confirm')
  }

  function handleConfirm() {
    // TODO: Submit booking to Supabase
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Buchung erfolgreich!</h1>
          <p className="text-white/60 mb-6">
            Du erhaeltst eine Bestaetigung per E-Mail an {email}
          </p>
          <div className="rounded-xl bg-white/10 p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Datum</span>
              <span>{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Uhrzeit</span>
              <span>{time || 'Keine Angabe'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Personen</span>
              <span>{partySize}</span>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 rounded-xl bg-amber-400 text-indigo-950 font-semibold"
          >
            Zurueck zur App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => step === 'confirm' ? setStep('form') : window.history.back()} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">
          {step === 'form' ? 'Buchen' : 'Bestaetigen'}
        </h1>
      </header>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Datum *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:border-amber-400/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Uhrzeit</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:border-amber-400/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Party Size */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Personen</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="w-10 h-10 rounded-lg bg-white/10 text-lg font-bold hover:bg-white/20 transition"
              >
                -
              </button>
              <span className="text-2xl font-bold w-8 text-center">{partySize}</span>
              <button
                type="button"
                onClick={() => setPartySize(partySize + 1)}
                className="w-10 h-10 rounded-lg bg-white/10 text-lg font-bold hover:bg-white/20 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Dein Name"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">E-Mail *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="email@beispiel.de"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+49 ..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Anmerkungen</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Besondere Wuensche..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-amber-400 text-indigo-950 font-semibold text-lg mt-4"
          >
            Weiter zur Bestaetigung
          </button>

          <p className="text-center text-white/30 text-xs">
            Keine Provision — Buchung direkt beim Anbieter
          </p>
        </form>
      ) : (
        /* Confirmation Step */
        <div className="px-6 pb-8">
          <div className="rounded-xl bg-white/10 p-6 mb-6 space-y-3">
            <h3 className="font-semibold text-lg mb-4">Buchungsuebersicht</h3>
            {[
              ['Datum', date],
              ['Uhrzeit', time || 'Keine Angabe'],
              ['Personen', String(partySize)],
              ['Name', name],
              ['E-Mail', email],
              ['Telefon', phone || '—'],
              ['Anmerkungen', notes || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-white/50">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-xl bg-green-500 text-white font-semibold text-lg mb-3"
          >
            Buchung bestaetigen
          </button>
          <button
            onClick={() => setStep('form')}
            className="w-full py-3 rounded-xl bg-white/10 text-white/70 text-sm"
          >
            Zurueck bearbeiten
          </button>
        </div>
      )}
    </div>
  )
}
