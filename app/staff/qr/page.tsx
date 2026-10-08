export const dynamic = "force-dynamic"
export const revalidate = 0

import QRCode from "qrcode"
import { headers } from "next/headers"
import { absoluteSiteUrl, posters } from "@/lib/hunt"
import { requireStaff } from "@/app/staff/layout"

export default async function StaffQrPage() {
  await requireStaff("/staff/qr")
  const headerList = await headers()
    const rows = await Promise.all(posters.map(async (poster) => {
    const url = absoluteSiteUrl(`/p/${poster.token}`)
    const qr = await QRCode.toDataURL(url, { width: 1000, margin: 3, errorCorrectionLevel: "H" })
    return { ...poster, url, qr }
  }))
  return <main className="min-h-screen bg-background px-6 py-10 text-foreground"><div className="mx-auto max-w-6xl"><header className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Staff area</p><h1 className="mt-2 text-4xl font-black tracking-tight">Poster QR codes</h1><p className="mt-2 text-slate-600">Download the high-error-correction QR code for each printed poster.</p></header><div className="grid gap-6 md:grid-cols-3">{rows.map((row) => <article key={row.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><img src={row.qr} alt={`${row.label} QR code`} className="mx-auto aspect-square w-full max-w-[300px]" /><h2 className="mt-5 text-xl font-black">{row.label}</h2><p className="mt-2 break-all text-sm text-slate-500">{row.url}</p><a href={row.qr} download={`${row.id}-qr.png`} className="mt-5 block rounded-xl bg-primary px-4 py-3 text-center font-bold text-white hover:bg-secondary">Download 1000px PNG</a></article>)}</div></div></main>
}
