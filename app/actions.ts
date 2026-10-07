"use server"
import "server-only"

import { SignJWT, jwtVerify } from "jose"
import { isCorrect, posterById, posterByToken, posters, type Progress } from "@/lib/hunt"

const secret = new TextEncoder().encode(process.env.HUNT_SECRET || "development-only-hunt-secret-change-me")

async function sign(progress: Progress) {
  return new SignJWT(progress as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(secret)
}

export async function readProgress(token?: string) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] })
    return payload as unknown as Progress
  } catch {
    return null
  }
}

export async function startHunt(teamName: string) {
  const name = teamName.trim()
  if (name.length < 2 || name.length > 30) return { error: "Team name must be 2–30 characters." }
  const token = await sign({ teamName: name, startedAt: new Date().toISOString(), solved: [] })
  return { token }
}

export async function submitAnswer(progressToken: string, posterToken: string, guess: string) {
  const progress = await readProgress(progressToken)
  const poster = posterByToken(posterToken)
  if (!progress || !poster) return { error: "This QR code isn't part of the hunt." }
  if (progress.finishedAt) return { finished: true }
  if (progress.nextPosterId && progress.nextPosterId !== poster.id) return { error: "This isn't your next stop." }
  if (progress.solved.some((item) => item.posterId === poster.id)) return { error: "You've already solved this one." }
  if (!isCorrect(guess, poster.acceptedAnswers)) return { error: "Not quite, try again." }

  const solved = [...progress.solved, { posterId: poster.id, at: new Date().toISOString() }]
  const remaining = posters.filter((item) => !solved.some((answer) => answer.posterId === item.id))
  const nextPosterId = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)].id : undefined
  const updated: Progress = { ...progress, solved, nextPosterId, ...(remaining.length ? {} : { finishedAt: new Date().toISOString() }) }
  return { token: await sign(updated), finished: !remaining.length, clue: nextPosterId ? posterById(nextPosterId)?.clue : undefined }
}

export async function issueVerificationToken(token: string) {
  return (await readProgress(token)) ? token : null
}
