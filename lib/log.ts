import "server-only"
import { Redis } from "@upstash/redis"
import { unstable_noStore as noStore } from "next/cache"
import { after } from "next/server"

export const HUNT_TEAMS_KEY = "hunt:teams"
export const HUNT_EVENTS_KEY = "hunt:events"
export const HUNT_WRONG_KEY = "hunt:wrong"

const redisUrlName = process.env.UPSTASH_REDIS_REST_URL ? "UPSTASH_REDIS_REST_URL" : process.env.KV_REST_API_URL ? "KV_REST_API_URL" : null
const redisTokenName = process.env.UPSTASH_REDIS_REST_TOKEN ? "UPSTASH_REDIS_REST_TOKEN" : process.env.KV_REST_API_TOKEN ? "KV_REST_API_TOKEN" : null
const redis = redisUrlName && redisTokenName ? new Redis({ url: process.env[redisUrlName]!, token: process.env[redisTokenName]! }) : null

export type HuntSummary = { teamId: string; teamName: string; startedAt: string; introSolvedAt?: string; solved: { posterId: string; label: string; level: string; at: string }[]; wrongGuesses: number; finishedAt?: string; prizeGivenAt?: string; lastActivity: string }
export type HuntEvent = { type: "team_created" | "intro_solved" | "poster_solved" | "wrong_answer" | "finished"; teamId: string; teamName: string; at: string; posterId?: string; label?: string; level?: string }
export type RedisStatus = { configured: boolean; variables: string[]; connection: string; teamCount: number; eventCount: number; latestEvent?: string; error?: string }
export type HuntLog = { teams: HuntSummary[]; events: HuntEvent[]; status: RedisStatus }

function withTimeout<T>(promise: Promise<T>) { return Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 2000))]) }
function report(error: unknown) { console.error("[log]", error) }
async function safe(task: () => Promise<unknown>) { try { await withTimeout(task()) } catch (error) { report(error) } }
function sendToSheet(event: HuntEvent) { const url = process.env.GOOGLE_SHEET_WEBHOOK_URL; const secret = process.env.GOOGLE_SHEET_SECRET; if (!url || !secret) return; const payload: Record<string, string> = { secret, type: event.type, teamId: event.teamId, teamName: event.teamName, at: event.at }; if (event.type === "poster_solved") { if (event.label) payload.label = event.label; if (event.level) payload.level = event.level } after(async () => { try { await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(5000), cache: "no-store" }) } catch (error) { console.error("[sheet]", error) } }) }
function parseValue<T>(value: unknown, key: string, field: string): T | null { if (typeof value !== "string") return value as T; try { return JSON.parse(value) as T } catch (error) { report(new Error(`Unable to parse ${key}[${field}]: ${error instanceof Error ? error.message : String(error)}`)); return null } }
function emptyStatus(error?: string): RedisStatus { return { configured: Boolean(redis), variables: [redisUrlName, redisTokenName].filter((value): value is string => Boolean(value)), connection: redis ? "Not checked" : "Not configured", teamCount: 0, eventCount: 0, error } }

export function logEvent(event: HuntEvent, summary: HuntSummary) { sendToSheet(event); if (!redis) return; void safe(async () => { const stored = { ...summary }; delete (stored as Partial<HuntSummary>).wrongGuesses; await redis.hset(HUNT_TEAMS_KEY, { [summary.teamId]: JSON.stringify(stored) }); await redis.lpush(HUNT_EVENTS_KEY, JSON.stringify(event)); await redis.ltrim(HUNT_EVENTS_KEY, 0, 499) }) }
export function updateTeamSummary(summary: HuntSummary) { void safe(() => { if (!redis) return Promise.resolve(); const stored = { ...summary }; delete (stored as Partial<HuntSummary>).wrongGuesses; return redis.hset(HUNT_TEAMS_KEY, { [summary.teamId]: JSON.stringify(stored) }) }) }
export function incrementWrongGuess(teamId: string) { if (redis) void safe(() => redis.hincrby(HUNT_WRONG_KEY, teamId, 1)) }

export async function getHuntLog(): Promise<HuntLog> {
  noStore()
  if (!redis) return { teams: [], events: [], status: emptyStatus() }
  try {
    const [ping, teamValues, eventValues, wrongValues] = await withTimeout(Promise.all([redis.ping(), redis.hgetall<Record<string, unknown>>(HUNT_TEAMS_KEY), redis.lrange<unknown>(HUNT_EVENTS_KEY, 0, 499), redis.hgetall<Record<string, unknown>>(HUNT_WRONG_KEY)]))
    const wrong = wrongValues && typeof wrongValues === "object" ? wrongValues as Record<string, unknown> : {}
    const teams = Object.entries(teamValues || {}).flatMap(([teamId, value]) => { const parsed = parseValue<Omit<HuntSummary, "wrongGuesses">>(value, HUNT_TEAMS_KEY, teamId); if (!parsed || typeof parsed !== "object") return []; return [{ ...parsed, teamId: parsed.teamId || teamId, wrongGuesses: Number(wrong[parsed.teamId || teamId] || 0) }] })
    const events = (eventValues || []).flatMap((value, index) => { const parsed = parseValue<HuntEvent>(value, HUNT_EVENTS_KEY, String(index)); return parsed && typeof parsed === "object" ? [parsed] : [] })
    return { teams, events, status: { ...emptyStatus(), connection: String(ping).toUpperCase() === "PONG" ? "OK" : String(ping), teamCount: teams.length, eventCount: events.length, latestEvent: events[0]?.at } }
  } catch (error) { report(error); const message = error instanceof Error ? error.message : String(error); return { teams: [], events: [], status: { ...emptyStatus(message), connection: message, error: message } } }
}
export async function clearHuntLog() { if (!redis) return; try { await withTimeout(redis.del(HUNT_TEAMS_KEY, HUNT_EVENTS_KEY, HUNT_WRONG_KEY)) } catch (error) { report(error); throw error } }
export async function getTeamSummary(teamId: string) { if (!redis) return null; try { const value = await withTimeout(redis.hget<unknown>(HUNT_TEAMS_KEY, teamId)); const parsed = parseValue<Omit<HuntSummary, "wrongGuesses">>(value, HUNT_TEAMS_KEY, teamId); return parsed ? { ...parsed, teamId, wrongGuesses: 0 } as HuntSummary : null } catch (error) { report(error); return null } }
export async function markPrizeGiven(teamId: string, at: string) { if (!redis) return { prizeGivenAt: at }; try { const existing = await withTimeout(redis.hget<unknown>(HUNT_TEAMS_KEY, teamId)); const summary = parseValue<HuntSummary>(existing, HUNT_TEAMS_KEY, teamId); if (!summary) return null; summary.prizeGivenAt = summary.prizeGivenAt || at; summary.lastActivity = at; delete (summary as Partial<HuntSummary>).wrongGuesses; await withTimeout(redis.hset(HUNT_TEAMS_KEY, { [teamId]: JSON.stringify(summary) })); return { prizeGivenAt: summary.prizeGivenAt } } catch (error) { report(error); throw error } }
export const redisIsConfigured = Boolean(redis)
export const redisVariableNames = [redisUrlName, redisTokenName].filter((value): value is string => Boolean(value))
export type { HuntLog as LiveLog }
export async function getHuntLogLegacy() { return getHuntLog() }
export { getHuntLog as readHuntLog }
export const logVersion = 3
void logVersion
void redisIsConfigured
void redisVariableNames
void getHuntLogLegacy
