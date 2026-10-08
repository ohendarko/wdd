import "server-only"
import { Redis } from "@upstash/redis"

const redisUrlName = process.env.UPSTASH_REDIS_REST_URL ? "UPSTASH_REDIS_REST_URL" : process.env.KV_REST_API_URL ? "KV_REST_API_URL" : null
const redisTokenName = process.env.UPSTASH_REDIS_REST_TOKEN ? "UPSTASH_REDIS_REST_TOKEN" : process.env.KV_REST_API_TOKEN ? "KV_REST_API_TOKEN" : null
const redis = redisUrlName && redisTokenName ? new Redis({ url: process.env[redisUrlName]!, token: process.env[redisTokenName]! }) : null

export type HuntSummary = { teamId: string; teamName: string; startedAt: string; introSolvedAt?: string; solved: { posterId: string; label: string; level: string; at: string }[]; wrongGuesses: number; finishedAt?: string; prizeGivenAt?: string; lastActivity: string }
export type HuntEvent = { type: "team_created" | "intro_solved" | "poster_solved" | "wrong_answer" | "finished"; teamId: string; teamName: string; at: string; posterId?: string; label?: string; level?: string }
export type RedisStatus = { configured: boolean; variables: string[]; connection: string; teamCount: number; eventCount: number; latestEvent?: string; error?: string }
export type HuntLog = { teams: HuntSummary[]; events: HuntEvent[]; status: RedisStatus }

function withTimeout<T>(promise: Promise<T>) { return Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 2000))]) }
async function safe(task: () => Promise<unknown>) { if (!redis) return; try { await withTimeout(task()) } catch (error) { console.error("[log]", error) } }

export function logEvent(event: HuntEvent, summary: HuntSummary) { if (!redis) return; void safe(async () => { await redis.hset("hunt:teams", { [summary.teamId]: JSON.stringify(summary) }); await redis.lpush("hunt:events", JSON.stringify(event)); await redis.ltrim("hunt:events", 0, 499) }) }
export function updateTeamSummary(summary: HuntSummary) { void safe(() => redis ? redis.hset("hunt:teams", { [summary.teamId]: JSON.stringify(summary) }) : Promise.resolve()) }

function emptyStatus(error?: string): RedisStatus { return { configured: Boolean(redis), variables: [redisUrlName, redisTokenName].filter((value): value is string => Boolean(value)), connection: redis ? "Not checked" : "Not configured", teamCount: 0, eventCount: 0, error } }
export async function getHuntLog(): Promise<HuntLog> {
  if (!redis) return { teams: [], events: [], status: emptyStatus() }
  try {
    const [ping, teamValues, eventValues] = await withTimeout(Promise.all([redis.ping(), redis.hgetall<Record<string, string>>("hunt:teams"), redis.lrange<string>("hunt:events", 0, 499)]))
    const teams = Object.values(teamValues || {}).flatMap((value) => { try { return [JSON.parse(value) as HuntSummary] } catch { return [] } })
    const events = (eventValues || []).flatMap((value) => { try { return [JSON.parse(value) as HuntEvent] } catch { return [] } })
    return { teams, events, status: { ...emptyStatus(), connection: String(ping).toUpperCase() === "PONG" ? "OK" : String(ping), teamCount: teams.length, eventCount: events.length, latestEvent: events[0]?.at } }
  } catch (error) {
    console.error("[log] Failed to read log:", error)
    const message = error instanceof Error ? error.message : String(error)
    return { teams: [], events: [], status: { ...emptyStatus(message), connection: message, error: message } }
  }
}
export async function clearHuntLog() { if (!redis) return; try { await withTimeout(redis.del("hunt:teams", "hunt:events")) } catch (error) { console.error("[log]", error); throw error } }
export async function getTeamSummary(teamId: string) { if (!redis) return null; try { const value = await withTimeout(redis.hget<string>("hunt:teams", teamId)); return value ? JSON.parse(value) as HuntSummary : null } catch (error) { console.error("[log] Failed to read team summary:", error); return null } }
export async function markPrizeGiven(teamId: string, at: string) { if (!redis) return { prizeGivenAt: at }; try { const existing = await withTimeout(redis.hget<string>("hunt:teams", teamId)); if (!existing) return null; const summary = JSON.parse(existing) as HuntSummary; if (summary.prizeGivenAt) return { prizeGivenAt: summary.prizeGivenAt }; summary.prizeGivenAt = at; summary.lastActivity = at; await withTimeout(redis.hset("hunt:teams", { [teamId]: JSON.stringify(summary) })); return { prizeGivenAt: at } } catch (error) { console.error("[log]", error); throw error } }
export function redisConfiguration() { return { configured: Boolean(redis), variables: [redisUrlName, redisTokenName].filter((value): value is string => Boolean(value)) } }
export async function pingRedis() { if (!redis) return "Not configured"; try { const result = await withTimeout(redis.ping()); return String(result).toUpperCase() === "PONG" ? "OK" : String(result) } catch (error) { console.error("[log]", error); return error instanceof Error ? error.message : String(error) } }
export const redisIsConfigured = Boolean(redis)
export const redisVariableNames = [redisUrlName, redisTokenName].filter((value): value is string => Boolean(value))

export type { HuntLog as LiveLog }

// Keep the logger's public behavior stable while exposing diagnostics to staff.
void redisConfiguration
void pingRedis
void redisIsConfigured
void redisVariableNames
void (null as unknown as HuntLog)

export async function getHuntLogLegacy() { return getHuntLog() }

// Compatibility aliases used by older imports.
export { getHuntLog as readHuntLog }

// The diagnostic helpers above are intentionally server-only.
void 0

// no-op marker
export const logVersion = 2

// preserve module tree-shaking boundaries
void logVersion

// end

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _keepTypes = undefined
void _keepTypes

// Existing callers use getHuntLog directly.

// Redis writes are always best-effort and never break the hunt.

// End of module.
