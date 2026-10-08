import "server-only"
import { Redis } from "@upstash/redis"

const redis = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? new Redis({ url, token }) : null
})()

export type HuntSummary = {
  teamId: string
  teamName: string
  startedAt: string
  introSolvedAt?: string
  solved: { posterId: string; label: string; level: string; at: string }[]
  wrongGuesses: number
  finishedAt?: string
  prizeGivenAt?: string
  lastActivity: string
}

export type HuntEvent = {
  type: "team_created" | "intro_solved" | "poster_solved" | "wrong_answer" | "finished"
  teamId: string
  teamName: string
  at: string
  posterId?: string
  label?: string
  level?: string
}

function withTimeout<T>(promise: Promise<T>) {
  return Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 2000))])
}

async function safe(task: () => Promise<unknown>) {
  if (!redis) return
  try { await withTimeout(task()) } catch (error) { console.error("[hunt-log] Redis operation failed:", error) }
}

export function logEvent(event: HuntEvent, summary: HuntSummary) {
  if (!redis) return
  void safe(async () => {
    await redis.hset("hunt:teams", { [summary.teamId]: JSON.stringify(summary) })
    await redis.lpush("hunt:events", JSON.stringify(event))
    await redis.ltrim("hunt:events", 0, 499)
  })
}

export function updateTeamSummary(summary: HuntSummary) {
  void safe(() => redis ? redis.hset("hunt:teams", { [summary.teamId]: JSON.stringify(summary) }) : Promise.resolve())
}

export async function getHuntLog() {
  if (!redis) return { teams: [] as HuntSummary[], events: [] as HuntEvent[] }
  try {
    const [teamValues, eventValues] = await withTimeout(Promise.all([redis.hgetall<Record<string, string>>("hunt:teams"), redis.lrange<string>("hunt:events", 0, 19)]))
    const teams = Object.values(teamValues || {}).flatMap((value) => { try { return [JSON.parse(value) as HuntSummary] } catch { return [] } })
    const events = (eventValues || []).flatMap((value) => { try { return [JSON.parse(value) as HuntEvent] } catch { return [] } })
    return { teams, events }
  } catch (error) { console.error("[hunt-log] Failed to read log:", error); return { teams: [], events: [] } }
}

export async function clearHuntLog() {
  if (!redis) return
  await withTimeout(redis.del("hunt:teams", "hunt:events"))
}

export async function getTeamSummary(teamId: string) {
  if (!redis) return null
  try {
    const value = await withTimeout(redis.hget<string>("hunt:teams", teamId))
    return value ? JSON.parse(value) as HuntSummary : null
  } catch (error) {
    console.error("[hunt-log] Failed to read team summary:", error)
    return null
  }
}

export async function markPrizeGiven(teamId: string, at: string) {
  if (!redis) return { prizeGivenAt: at }
  const existing = await withTimeout(redis.hget<string>("hunt:teams", teamId))
  if (!existing) return null
  const summary = JSON.parse(existing) as HuntSummary
  if (summary.prizeGivenAt) return { prizeGivenAt: summary.prizeGivenAt }
  summary.prizeGivenAt = at
  summary.lastActivity = at
  await withTimeout(redis.hset("hunt:teams", { [teamId]: JSON.stringify(summary) }))
  return { prizeGivenAt: at }
}
