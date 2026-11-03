import type { Progress } from "@/lib/hunt"

export type HuntStage = "no-team" | "intro" | "first-clue" | "second-clue" | "final-clue" | "finished"

export function getStage(progress?: Pick<Progress, "introSolvedAt" | "finishedAt" | "solved" | "clue"> | null) {
  const uniqueSolved = [...new Set((progress?.solved || []).map((item) => item.posterId))]
  const solvedCount = uniqueSolved.length
  const currentLevel = Math.min(solvedCount + 1, 3)
  if (!progress) return { stage: "no-team" as const, solvedCount: 0, currentLevel: 1, clue: undefined }
  if (progress.finishedAt || solvedCount >= 3) return { stage: "finished" as const, solvedCount, currentLevel: 3, clue: undefined }
  if (!progress.introSolvedAt) return { stage: "intro" as const, solvedCount, currentLevel, clue: undefined }
  const stage: Exclude<HuntStage, "no-team" | "intro" | "finished"> = solvedCount === 0 ? "first-clue" : solvedCount === 1 ? "second-clue" : "final-clue"
  return { stage, solvedCount, currentLevel, clue: progress.clue }
}

// Stage cases: intro solved => first clue; 1 stop => second clue; 2 stops => final clue; 3 stops => finish.
// PIN re-login and a second phone use the same latest token, so both derive the same stage.
