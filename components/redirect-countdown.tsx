"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

type RedirectCountdownProps = {
  seconds: number
  to: string
}

export function RedirectCountdown({ seconds: initialSeconds, to }: RedirectCountdownProps) {
  const router = useRouter()
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.push(to)
      window.setTimeout(() => window.location.assign(to), 1000)
    }, initialSeconds * 1000)
    const countdownTimer = window.setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1))
    }, 1000)

    return () => {
      window.clearTimeout(redirectTimer)
      window.clearInterval(countdownTimer)
    }
  }, [])

  return <>
    <p className="mt-5 text-center text-lg font-bold">Back to your dashboard in {seconds}…</p>
    <Button className="mt-4 min-h-11 w-full bg-primary" onClick={() => router.push(to)}>
      <Home data-icon="inline-start" />Dashboard
    </Button>
  </>
}
