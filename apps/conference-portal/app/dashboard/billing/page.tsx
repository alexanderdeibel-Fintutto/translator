'use client'
export default function BillingPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Abrechnung & Plan</h1>
      <div className="bg-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-semibold">Conference Basic</p>
            <p className="text-slate-400 text-sm">Bis zu 3 Konferenzen / Monat</p>
          </div>
          <span className="bg-cyan-900 text-cyan-300 text-xs px-3 py-1 rounded-full">Aktiv</span>
        </div>
        <hr className="border-slate-700" />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Übersetzungsminuten</span>
            <span className="text-white">1.247 / 5.000</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-cyan-500 h-2 rounded-full" style={{width: '25%'}} />
          </div>
        </div>
        <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-4 py-2 font-medium transition-colors">
          Plan upgraden
        </button>
      </div>
    </div>
  )
}
