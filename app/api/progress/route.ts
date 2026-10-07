import { NextResponse } from "next/server"
import { readProgress } from "@/app/actions"
import { posterByToken, posterById } from "@/lib/hunt"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("t") || ""
  const posterToken = url.searchParams.get("poster")
  const progress = await readProgress(token)
  if (!progress) return NextResponse.json({ progress: null }, { status: 401 })
  return NextResponse.json({ token, progress, finished: Boolean(progress.finishedAt), clue: progress.nextPosterId ? posterById(progress.nextPosterId)?.clue : undefined, poster: progress.introSolvedAt && posterToken ? posterByToken(posterToken) : undefined })
}
