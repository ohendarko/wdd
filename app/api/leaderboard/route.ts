import { NextRequest, NextResponse } from "next/server"
import { readProgress } from "@/app/actions"
import { getHuntLog } from "@/lib/log"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const log = await getHuntLog()
    const entries = log.teams.filter((team) => team.finishedAt).sort((a, b) => Date.parse(a.finishedAt!) - Date.parse(b.finishedAt!)).map((team, index) => ({ position: index + 1, teamName: team.teamName, finishedAt: team.finishedAt! }))
    let yourPosition: number | null = null
    const token = request.nextUrl.searchParams.get("t")
    if (token) {
      const progress = await readProgress(token)
      if (progress?.finishedAt) yourPosition = entries.find((entry) => entry.teamName === progress.teamName && entry.finishedAt === progress.finishedAt)?.position || null
    }
    return NextResponse.json({ finishedCount: entries.length, entries, ...(token ? { yourPosition } : {}) }, { headers: { "Cache-Control": "no-store, max-age=0" } })
  } catch (error) {
    console.error("[leaderboard] failed:", error)
    return NextResponse.json({ error: true }, { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } })
  }
}
