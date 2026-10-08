import { NextResponse } from "next/server"
import { readProgress } from "@/app/actions"
import { getLatestToken } from "@/lib/log"
import { posterByToken, posterById } from "@/lib/hunt"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("t") || ""
  const posterToken = url.searchParams.get("poster")
  let progress = await readProgress(token)
  let latestToken: string = token
  if (progress?.teamId) { const remote = await getLatestToken(progress.teamId).catch(() => null); const remoteProgress = remote ? await readProgress(remote) : null; if (remoteProgress && (!progress.updatedAt || remoteProgress.updatedAt > progress.updatedAt)) { progress = remoteProgress; latestToken = remote! } }
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
    token: latestToken,
    progress,
    finished: Boolean(progress.finishedAt),
    clue: progress.nextPosterId ? posterById(progress.nextPosterId)?.clue : undefined,
    poster,
  })
}
