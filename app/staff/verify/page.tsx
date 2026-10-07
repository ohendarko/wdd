import { redirect } from "next/navigation"
import { readProgress } from "@/app/actions"
import { isStaffAuthenticated } from "@/lib/staff-auth"

function formatTorontoTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDuration(startedAt: string, finishedAt: string) {
  const totalSeconds = Math.max(0, Math.floor((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours ? `${hours}h` : "", minutes ? `${minutes}m` : "", `${seconds}s`].filter(Boolean).join(" ")
}

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams
  if (!(await isStaffAuthenticated())) redirect(`/staff?next=${encodeURIComponent(`/staff/verify${t ? `?t=${encodeURIComponent(t)}` : ""}`)}`)
  const progress = await readProgress(t)
  const valid = Boolean(progress?.finishedAt)
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6"><section className={`w-full max-w-lg rounded-3xl p-8 text-center shadow-2xl ${valid ? "bg-emerald-50 text-emerald-950" : "bg-red-50 text-red-950"}`}><div className={`mx-auto mb-6 flex size-24 items-center justify-center rounded-full text-5xl ${valid ? "bg-emerald-200" : "bg-red-200"}`}>{valid ? "✅" : "❌"}</div><h1 className="text-4xl font-black tracking-tight">{valid ? "Valid finish" : "Not valid"}</h1>{valid && progress ? <div className="mt-8 flex flex-col gap-3 text-left"><div className="rounded-2xl bg-white/70 p-4"><p className="text-xs font-bold uppercase tracking-wider opacity-70">Team</p><p className="mt-1 text-2xl font-black">{progress.teamName}</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/70 p-4"><p className="text-xs font-bold uppercase tracking-wider opacity-70">Finish time</p><p className="mt-1 font-bold">{formatTorontoTime(progress.finishedAt)}</p><p className="text-xs opacity-70">America/Toronto</p></div><div className="rounded-2xl bg-white/70 p-4"><p className="text-xs font-bold uppercase tracking-wider opacity-70">Total time</p><p className="mt-1 font-bold">{formatDuration(progress.startedAt, progress.finishedAt)}</p></div></div></div> : <p className="mt-4 text-lg font-semibold">This finish QR is invalid or has expired.</p>}</section></main>
}
