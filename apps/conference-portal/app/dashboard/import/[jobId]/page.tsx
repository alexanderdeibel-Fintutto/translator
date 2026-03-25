'use client'
import { use } from 'react'
import Link from 'next/link'

export default function ImportJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params)
  return (
    <div className="p-8">
      <div className="mb-4">
        <Link href="/dashboard/import" className="text-slate-400 hover:text-white text-sm">← Zurück zum Import</Link>
      </div>
      <h1 className="text-2xl font-bold text-white mb-4">Import-Job {jobId}</h1>
      <div className="bg-slate-800 rounded-xl p-6 text-slate-400">
        <p>Import-Details werden geladen…</p>
        <p className="mt-2 text-sm">Job-ID: <code className="text-cyan-400">{jobId}</code></p>
      </div>
    </div>
  )
}
