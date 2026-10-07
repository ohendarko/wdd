export type Poster = {
  id: string
  token: string
  label: string
  riddle: string
  acceptedAnswers: string[]
  clue: string
}

export const posters: Poster[] = [
  {
    id: "stop-1",
    token: "bluecircle7x4m2q9",
    label: "Stop 1",
    riddle: "I make insulin to help sugar along,\nI sit inside you, working away,\nWhen I do my job, things can stay strong,\nWhat am I that works every day?",
    acceptedAnswers: ["pancreas", "pancreas gland", "pancrease"],
    clue: "[CLUE TO STOP 1 LOCATION]",
  },
  {
    id: "stop-2",
    token: "purplepath3k8n6w1",
    label: "Stop 2",
    riddle: "I can make you shaky and make you sweat,\nWhen blood sugar drops below the line,\nI'm something you should not forget,\nWhat am I when glucose declines?",
    acceptedAnswers: ["hypoglycemia", "hypoglycaemia", "hypoglycemic", "hypo", "low blood sugar", "low sugar", "low glucose", "low blood glucose"],
    clue: "[CLUE TO STOP 2 LOCATION]",
  },
  {
    id: "stop-3",
    token: "hopehunt9p5r2t7",
    label: "Stop 3",
    riddle: "I'm not a key, but I help cells unlock,\nI help glucose get where it belongs,\nWithout my help, sugar can build up a lot,\nWhat am I that keeps things moving along?",
    acceptedAnswers: ["insulin", "insulin hormone", "hormone insulin"],
    clue: "[CLUE TO STOP 3 LOCATION]",
  },
]

export function posterByToken(token: string) {
  return posters.find((poster) => poster.token === token)
}

export function posterById(id: string) {
  return posters.find((poster) => poster.id === id)
}

export function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\p{P}\p{S}]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^(the|a|an)\s+/, "")
}

export function levenshtein(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const above = row[j]
      row[j] = a[i - 1] === b[j - 1] ? diagonal : Math.min(row[j - 1] + 1, above + 1, diagonal + 1)
      diagonal = above
    }
  }
  return row[b.length]
}

export function isCorrect(guess: string, answers: string[]) {
  const normalizedGuess = normalize(guess)
  return answers.some((answer) => {
    const normalizedAnswer = normalize(answer)
    return normalizedGuess === normalizedAnswer || (normalizedAnswer.length >= 6 && levenshtein(normalizedGuess, normalizedAnswer) <= 1)
  })
}

export type Progress = {
  teamName: string
  startedAt: string
  solved: { posterId: string; at: string }[]
  nextPosterId?: string
  finishedAt?: string
}
