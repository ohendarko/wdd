"use client"

import { useEffect, useRef, useState, type TouchEvent } from "react"
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"
import { diabetesFacts } from "@/lib/facts"

export function DidYouKnow() {
  const [index, setIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [paused, setPaused] = useState(false)
  const touchStart = useRef<number | null>(null)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (reducedMotion || paused) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % diabetesFacts.length), 7000)
    return () => window.clearInterval(timer)
  }, [paused, reducedMotion])

  const move = (direction: number) => setIndex((current) => (current + direction + diabetesFacts.length) % diabetesFacts.length)
  const onTouchStart = (event: TouchEvent) => { touchStart.current = event.touches[0]?.clientX ?? null; setPaused(true) }
  const onTouchEnd = (event: TouchEvent) => { const start = touchStart.current; const end = event.changedTouches[0]?.clientX; touchStart.current = null; setPaused(false); if (start !== null && end !== undefined && Math.abs(end - start) > 40) move(end < start ? 1 : -1) }

  return <section className="rounded-3xl bg-white p-5 shadow-lg" aria-labelledby="did-you-know-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <div className="flex min-h-[190px] items-center gap-3">
      <button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-[var(--miracle-purple)] transition-colors hover:bg-muted" onClick={() => move(-1)} aria-label="Previous fact"><ChevronLeft /></button>
      <div className={reducedMotion ? "flex-1" : "flex-1 animate-in fade-in duration-500"} key={index}>
        <h2 id="did-you-know-title" className="flex items-center gap-2 text-lg font-black text-[var(--miracle-purple)]"><Lightbulb className="size-5" aria-hidden="true" />Did you know?</h2>
        <p className="mt-5 text-base font-semibold leading-7 text-foreground">{diabetesFacts[index]}</p>
      </div>
      <button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-[var(--miracle-purple)] transition-colors hover:bg-muted" onClick={() => move(1)} aria-label="Next fact"><ChevronRight /></button>
    </div>
    <div className="mt-2 flex justify-center gap-2" role="tablist" aria-label="Choose a fact">{diabetesFacts.map((fact, factIndex) => <button key={fact} type="button" role="tab" aria-selected={factIndex === index} aria-label={`Show fact ${factIndex + 1}`} className={`size-2.5 rounded-full ${factIndex === index ? "bg-[#7A00E6]" : "bg-slate-300"}`} onClick={() => setIndex(factIndex)} />)}</div>
  </section>
}
