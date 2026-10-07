import { NextResponse } from "next/server"
import { readProgress } from "@/app/actions"
import { posterByToken, posterById } from "@/lib/hunt"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("t") || ""
  const posterToken = url.searchParams.get("poster")
  const progress = await readProgress(token)
  if (!progress) return NextResponse.json({ progress: null }, { status: 401 })

  // Only send what the team is allowed to see. Never send accepted answers.
  const found = progress.introSolvedAt && posterToken ? posterByToken(posterToken) : undefined
  let poster: { id: string; label: string; riddle?: string; clue?: string } | undefined
  if (found) {
    const solved = progress.solved.some((item) => item.posterId === found.id)
    const blocked = Boolean(progress.nextPosterId) && progress.nextPosterId !== found.id
    poster = { id: found.id, label: found.label, ...(solved || blocked || progress.finishedAt ? {} : { riddle: found.riddle }), clue: progress.nextPosterId ? posterById(progress.nextPosterId)?.clue : undefined }
  }

  return NextResponse.json({
    token,
    progress,
    finished: Boolean(progress.finishedAt),
    clue: progress.nextPosterId ? posterById(progress.nextPosterId)?.clue : undefined,
    poster,
  })
}
