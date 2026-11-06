"use client"

import { useEffect, useState, useTransition } from "react"
import { listResetTeams, resetPin } from "@/app/staff/actions"
import type { ResetTeam } from "@/lib/log"

type Props = { open: boolean; onClose: () => void }

export function StaffPinReset({ open, onClose }: Props) {
  const [teams, setTeams] = useState<ResetTeam[]>([])
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pin, setPin] = useState("")
  const [notice, setNotice] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setSearch(""); setExpanded(null); setPin(""); setError("")
    startTransition(async () => { const result = await listResetTeams(); if (result.teams) setTeams(result.teams); else setError(result.error || "Unable to load teams.") })
  }, [open])

  useEffect(() => { if (!open) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }; document.addEventListener("keydown", onKeyDown); return () => document.removeEventListener("keydown", onKeyDown) }, [open, onClose])
  if (!open) return null
  const filtered = teams.filter((team) => team.teamName.toLowerCase().includes(search.toLowerCase()))

  const save = (team: ResetTeam) => startTransition(async () => { const result = await resetPin(team.teamId, pin); if (result.ok) { setTeams((items) => items.map((item) => item.teamId === team.teamId ? { ...item, locked: false } : item)); setNotice((items) => ({ ...items, [team.teamId]: `PIN updated. Tell ${team.teamName} their new PIN.` })); setExpanded(null); setPin(""); window.setTimeout(() => setNotice((items) => { const next = { ...items }; delete next[team.teamId]; return next }), 5000) } else setNotice((items) => ({ ...items, [team.teamId]: result.error || "Unable to reset PIN." })) })

  return <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="reset-pin-title"><div className="flex w-full max-w-xl flex-col bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-3xl"><header className="flex items-center justify-between border-b border-slate-200 p-5"><div><h2 id="reset-pin-title" className="text-xl font-black text-[#23004C]">Reset a team's PIN</h2><p className="mt-1 text-sm text-slate-500">Choose a team to set a new 4-digit PIN.</p></div><button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-2xl leading-none text-slate-500 hover:bg-slate-100" aria-label="Close">×</button></header><div className="border-b border-slate-200 p-4"><label className="sr-only" htmlFor="team-search">Search team name</label><input id="team-search" autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search team name…" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></div><div className="min-h-0 flex-1 overflow-y-auto p-4">{error ? <p role="alert" className="rounded-xl bg-red-50 p-4 font-semibold text-red-700">{error}</p> : pending && !teams.length ? <p className="p-4 text-sm text-slate-500">Loading teams…</p> : !teams.length ? <p className="p-4 text-sm text-slate-500">No teams yet.</p> : !filtered.length ? <p className="p-4 text-sm text-slate-500">No team matches '{search}'.</p> : <div className="space-y-2">{filtered.map((team) => <div key={team.teamId} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center gap-2"><div className="min-w-0 flex-1"><p className="truncate font-bold text-[#23004C]">{team.teamName}</p><div className="mt-1 flex flex-wrap gap-1"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{team.status}</span>{team.locked && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Locked</span>}</div></div><button type="button" onClick={() => { setExpanded(expanded === team.teamId ? null : team.teamId); setPin(""); setNotice((items) => ({ ...items, [team.teamId]: "" })) }} className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">Reset PIN</button></div>{expanded === team.teamId && <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3"><label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-bold text-slate-600">New 4-digit PIN<input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" pattern="[0-9]{4}" maxLength={4} className="rounded-lg border border-slate-300 px-3 py-2 text-base tracking-[0.3em]" /></label><button type="button" disabled={pending || pin.length !== 4} onClick={() => save(team)} className="rounded-lg bg-primary px-3 py-2 font-bold text-white disabled:opacity-40">Save</button><button type="button" disabled={pending} onClick={() => { setExpanded(null); setPin("") }} className="rounded-lg border border-slate-300 px-3 py-2 font-bold text-slate-700">Cancel</button></div>}{notice[team.teamId] && <p className={`mt-2 text-sm font-semibold ${notice[team.teamId].startsWith("PIN updated") ? "text-green-700" : "text-red-700"}`} role="status">{notice[team.teamId].startsWith("PIN updated") ? "✓ " : ""}{notice[team.teamId]}</p>}</div>)}</div>}</div><footer className="border-t border-slate-200 p-4 text-right"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700">Close</button></footer></div></div>
}
