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
    riddle: "I can be counted, but I am not a number. I can be checked, but I am not a box. What am I?",
    acceptedAnswers: ["a list", "list"],
    clue: "Your next stop is where ideas grow tall and questions grow bigger.",
  },
  {
    id: "stop-2",
    token: "purplepath3k8n6w1",
    label: "Stop 2",
    riddle: "I have a face and two hands, but I never clap. What am I?",
    acceptedAnswers: ["a clock", "clock"],
    clue: "Your next stop is marked by a circle of blue and a message of hope.",
  },
  {
    id: "stop-3",
    token: "hopehunt9p5r2t7",
    label: "Stop 3",
    riddle: "I travel around the world while staying in one corner. What am I?",
    acceptedAnswers: ["a stamp", "stamp"],
    clue: "Your next stop is the place where paths meet and teams take their next step.",
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
