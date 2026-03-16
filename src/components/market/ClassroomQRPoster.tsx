/**
 * Classroom QR Poster
 *
 * Generates a printable A4-style poster with a large QR code
 * pointing to the school-student app. Teachers can pin this
 * in the classroom for quick student access.
 */

import { QRCodeSVG } from 'qrcode.react'
import { Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClassroomQRPosterProps {
  /** Session code (e.g. "TR-ABCD") */
  code: string
  /** Classroom name (e.g. "Klasse 3b") */
  classroomName?: string
  /** Full URL for the QR code (defaults to student app) */
  url?: string
}

export default function ClassroomQRPoster({
  code,
  classroomName,
  url,
}: ClassroomQRPosterProps) {
  const studentUrl = url || `https://tl-school-student.fintutto.cloud/${code}`

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadSVG = () => {
    const svg = document.querySelector('#classroom-qr-svg svg') as SVGElement
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `qr-${classroomName || code}.svg`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-4">
      {/* Printable poster area */}
      <div
        id="classroom-qr-poster"
        className="bg-white text-black p-8 rounded-xl border-2 border-dashed border-gray-300 print:border-none print:p-0"
      >
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-600">
              School Translator
            </h2>
            {classroomName && (
              <p className="text-xl font-semibold mt-1">{classroomName}</p>
            )}
          </div>

          {/* QR Code */}
          <div id="classroom-qr-svg" className="bg-white p-4">
            <QRCodeSVG value={studentUrl} size={240} level="H" />
          </div>

          {/* Session Code */}
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider">
              Session-Code
            </p>
            <p className="text-4xl font-bold font-mono tracking-widest mt-1">
              {code}
            </p>
          </div>

          {/* Multilingual instructions */}
          <div className="text-center space-y-1 text-sm text-gray-600">
            <p>Scanne den QR-Code oder gib den Code in der App ein.</p>
            <p>Scan the QR code or enter the code in the app.</p>
            <p dir="rtl">امسح رمز QR اضغط الكود في التطبيق</p>
            <p>QR kodunu tara veya kodu uygulamaya gir.</p>
          </div>

          {/* URL hint */}
          <p className="text-xs text-gray-400">
            {studentUrl}
          </p>
        </div>
      </div>

      {/* Action buttons (hidden in print) */}
      <div className="flex gap-2 print:hidden">
        <Button onClick={handlePrint} className="flex-1 gap-2">
          <Printer className="h-4 w-4" />
          Drucken
        </Button>
        <Button
          onClick={handleDownloadSVG}
          variant="outline"
          className="flex-1 gap-2"
        >
          <Download className="h-4 w-4" />
          SVG speichern
        </Button>
      </div>
    </div>
  )
}
