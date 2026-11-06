import { NextResponse } from "next/server"
import { getHuntLog } from "@/lib/log"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { events, status } = await getHuntLog()
    if (status.error) return NextResponse.json({ error: true }, { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } })
    const feed = events.filter((event) => event.type === "team_created" || (event.type === "poster_solved" && ["1st", "2nd", "3rd"].includes(event.level || ""))).slice(0, 30).map((event) => ({ teamName: event.teamName, message: event.type === "team_created" ? "entered the game" : event.level === "1st" ? "found their 1st code" : event.level === "2nd" ? "found their 2nd code" : "found their final code 🏁", at: event.at }))
    return NextResponse.json(feed, { headers: { "Cache-Control": "no-store, max-age=0" } })
  } catch (error) { console.error("[feed] failed:", error); return NextResponse.json({ error: true }, { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }) }
}
