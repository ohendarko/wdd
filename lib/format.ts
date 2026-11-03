const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })

function validDate(value?: string) { if (!value) return null; const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date }

export function formatDateTime(value?: string) { const date = validDate(value); return date ? dateTimeFormatter.format(date) : "—" }

export function formatDuration(start?: string, end?: string) {
  const from = validDate(start); const to = validDate(end); if (!from || !to) return "—"
  let seconds = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 1000))
  const days = Math.floor(seconds / 86400); seconds %= 86400
  const hours = Math.floor(seconds / 3600); seconds %= 3600
  const minutes = Math.floor(seconds / 60); const parts = [days ? `${days}d` : "", hours ? `${hours}h` : "", minutes ? `${minutes}m` : "", `${seconds}s`].filter(Boolean)
  return parts.join(" ")
}
