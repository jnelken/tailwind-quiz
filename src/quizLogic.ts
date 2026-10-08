import type { QuizQuestion } from './quizData'

type QuizAnswerKey = Pick<QuizQuestion, 'css' | 'tailwindClass'>

export function getDocsUrl(css: { [key: string]: string }) {
  const firstKey = Object.keys(css)[0]
  const baseProp = firstKey.replace(/-(top|right|bottom|left|start|end)$/, '')
  return `https://tailwindcss.com/docs/${baseProp}`
}

export function formatCSS(css: { [key: string]: string }, showHints: boolean = false) {
  return Object.entries(css)
    .map(([property, value]) => showHints ? `${property}: ____;` : `${property}: ${value};`)
    .join('\n')
}

export function isAnswerCorrect(answer: string, isFlipped: boolean, question: QuizAnswerKey) {
  const trimmedAnswer = answer.trim().toLowerCase()
  if (isFlipped) {
    const correctAnswer = formatCSS(question.css).toLowerCase().replace(/\s+/g, ' ')
    return trimmedAnswer.replace(/\s+/g, ' ') === correctAnswer
  } else {
    return trimmedAnswer === question.tailwindClass.toLowerCase()
  }
}

// Returns the same Set when nothing changes so React skips the persistence effect.
export function markSeen(questionId: number, currentSeenIds: Set<number>) {
  if (currentSeenIds.has(questionId)) return currentSeenIds
  const next = new Set(currentSeenIds)
  next.add(questionId)
  return next
}
