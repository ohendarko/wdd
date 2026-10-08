"use client"
import { useState, useTransition } from "react"
import { givePrize } from "@/app/staff/actions"

export function PrizeButton({ teamId, given }: { teamId: string; given?: string }) {
  const [label, setLabel] = useState(given ? "Prize given" : "Mark prize given")
  const [pending, startTransition] = useTransition()
  return <button type="button" disabled={Boolean(given) || pending} onClick={() => startTransition(async () => { const result = await givePrize(teamId); setLabel("error" in result ? result.error : "Prize given") })} className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 font-black text-white disabled:opacity-60">{pending ? "Saving…" : label}</button>
}
