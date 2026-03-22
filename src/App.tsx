import { useState, useEffect, useRef } from 'react'
import { quizData } from './quizData'

function getDocsUrl(css: { [key: string]: string }) {
  const firstKey = Object.keys(css)[0]
  const baseProp = firstKey.replace(/-(top|right|bottom|left|start|end)$/, '')
  return `https://tailwindcss.com/docs/${baseProp}`
}

interface PersistedState {
  wrongIds: number[]
  currentIndex: number
  seenIds: number[]
}

async function fetchState(): Promise<{ wrongIds: Set<number>; seenIds: Set<number>; currentIndex: number }> {
  try {
    const res = await fetch('/api/wrong-answers')
    const data: PersistedState = await res.json()
    return {
      wrongIds: new Set(data.wrongIds ?? []),
      seenIds: new Set(data.seenIds ?? []),
      currentIndex: data.currentIndex ?? 0,
    }
  } catch {
    return { wrongIds: new Set(), seenIds: new Set(), currentIndex: 0 }
  }
}

async function persistState(wrongIds: Set<number>, seenIds: Set<number>, currentIndex: number) {
  await fetch('/api/wrong-answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wrongIds: [...wrongIds], seenIds: [...seenIds], currentIndex }),
  })
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [hintsEnabled, setHintsEnabled] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [reviewMode, setReviewMode] = useState(false)
  const [wrongIds, setWrongIds] = useState<Set<number>>(new Set())
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchState().then(({ wrongIds, seenIds, currentIndex }) => {
      setWrongIds(wrongIds)
      setSeenIds(seenIds)
      setCurrentIndex(currentIndex)
      // Mark initial question as seen
      setSeenIds(prev => {
        const q = quizData[currentIndex]
        if (!q || prev.has(q.id)) return prev
        const next = new Set(prev)
        next.add(q.id)
        persistState(wrongIds, next, currentIndex)
        return next
      })
    })
  }, [])

  const activeQuestions = reviewMode
    ? quizData.filter(q => wrongIds.has(q.id))
    : quizData

  const currentQuestion = activeQuestions[currentIndex] ?? quizData[0]

  const formatCSS = (css: { [key: string]: string }, showHints: boolean = false) => {
    return Object.entries(css)
      .map(([property, value]) => showHints ? `${property}: ____;` : `${property}: ${value};`)
      .join('\n')
  }

  const isAnswerCorrect = (answer: string) => {
    const trimmedAnswer = answer.trim().toLowerCase()
    if (isFlipped) {
      const correctAnswer = formatCSS(currentQuestion.css).toLowerCase().replace(/\s+/g, ' ')
      return trimmedAnswer.replace(/\s+/g, ' ') === correctAnswer
    } else {
      return trimmedAnswer === currentQuestion.tailwindClass.toLowerCase()
    }
  }

  const markSeen = (questionId: number, idx: number, currentWrongIds: Set<number>, currentSeenIds: Set<number>) => {
    if (currentSeenIds.has(questionId)) return currentSeenIds
    const next = new Set(currentSeenIds)
    next.add(questionId)
    persistState(currentWrongIds, next, idx)
    return next
  }

  const checkAnswer = () => {
    if (isAnswerCorrect(userAnswer)) {
      setFeedback('correct')
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setFeedback('incorrect')
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
      setWrongIds(prev => {
        const next = new Set(prev)
        next.add(currentQuestion.id)
        persistState(next, seenIds, currentIndex)
        return next
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setUserAnswer(value)
    if (isAnswerCorrect(value)) {
      setFeedback('correct')
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
      setTimeout(nextQuestion, 800)
    }
  }

  const nextQuestion = () => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % activeQuestions.length
      const nextId = activeQuestions[next]?.id
      setSeenIds(s => nextId ? markSeen(nextId, next, wrongIds, s) : s)
      persistState(wrongIds, seenIds, next)
      return next
    })
    setUserAnswer('')
    setFeedback(null)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const prevQuestion = () => {
    setCurrentIndex((prev) => {
      const next = (prev - 1 + activeQuestions.length) % activeQuestions.length
      const nextId = activeQuestions[next]?.id
      setSeenIds(s => nextId ? markSeen(nextId, next, wrongIds, s) : s)
      persistState(wrongIds, seenIds, next)
      return next
    })
    setUserAnswer('')
    setFeedback(null)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const navigateToQuestion = (questionId: number) => {
    const idx = quizData.findIndex(q => q.id === questionId)
    if (idx === -1) return
    if (reviewMode) setReviewMode(false)
    setSeenIds(s => markSeen(questionId, idx, wrongIds, s))
    persistState(wrongIds, seenIds, idx)
    setCurrentIndex(idx)
    setUserAnswer('')
    setFeedback(null)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const clearCurrentFromWrong = () => {
    setWrongIds(prev => {
      const next = new Set(prev)
      next.delete(currentQuestion.id)
      persistState(next, seenIds, currentIndex)
      return next
    })
  }

  const handleFlipToggle = () => {
    setIsFlipped(!isFlipped)
    setUserAnswer('')
    setFeedback(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !feedback) {
      checkAnswer()
    } else if (e.key === 'Enter' && feedback) {
      nextQuestion()
    }
  }

  const handleReviewToggle = () => {
    const next = !reviewMode
    if (next && wrongIds.size === 0) return
    setReviewMode(next)
    setCurrentIndex(0)
    setUserAnswer('')
    setFeedback(null)
  }

  const isCurrentWrong = wrongIds.has(currentQuestion.id)

  // Build seen question cards from full quizData order
  const seenQuestions = quizData.filter(q => seenIds.has(q.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Tailwind CSS Quiz</h1>
          <p className="text-gray-300">
            Score: {score.correct} / {score.total}
            {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <button
            onClick={handleFlipToggle}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isFlipped ? '🔄 Mode: Tailwind → CSS' : '🔄 Mode: CSS → Tailwind'}
          </button>

          {!isFlipped && (
            <button
              onClick={() => setHintsEnabled(!hintsEnabled)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                hintsEnabled ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {hintsEnabled ? '💡 Hints: ON' : '💡 Hints: OFF'}
            </button>
          )}

          <button
            onClick={handleReviewToggle}
            disabled={!reviewMode && wrongIds.size === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              reviewMode
                ? 'bg-red-600 hover:bg-red-700'
                : wrongIds.size === 0
                  ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            📋 Review Wrong ({wrongIds.size})
          </button>

          {isCurrentWrong && (
            <button
              onClick={clearCurrentFromWrong}
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-600 hover:bg-gray-700"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {reviewMode && (
          <div className="text-center mb-4 text-orange-400 font-semibold">
            Review Mode — {activeQuestions.length} question{activeQuestions.length !== 1 ? 's' : ''} to review
          </div>
        )}

        {/* Quiz Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Question Panel */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-purple-400">
              {isFlipped ? 'Tailwind Class' : 'CSS Properties'}
            </h2>
            <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm">
              <pre className="text-green-400">
                {isFlipped
                  ? currentQuestion.tailwindClass
                  : formatCSS(currentQuestion.css, !isFlipped && hintsEnabled)
                }
              </pre>
            </div>
          </div>

          {/* Answer Panel */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-purple-400">
              {isFlipped ? 'Write the CSS' : 'Write the Tailwind Class'}
            </h2>
            <textarea
              ref={textareaRef}
              value={userAnswer}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={isFlipped ? "Enter CSS properties..." : "Enter Tailwind class..."}
              className="w-full h-32 bg-slate-900 text-white rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={feedback !== null}
            />

            {/* Feedback */}
            {feedback && (
              <div className={`mt-4 p-4 rounded-lg ${
                feedback === 'correct' ? 'bg-green-900/50 border-2 border-green-500' : 'bg-red-900/50 border-2 border-red-500'
              }`}>
                <p className="font-bold mb-2">
                  {feedback === 'correct' ? '✅ Correct!' : '❌ Incorrect'}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Answer: </span>
                  {isFlipped ? (
                    <pre className="inline text-green-300">{formatCSS(currentQuestion.css)}</pre>
                  ) : (
                    <code className="text-green-300">{currentQuestion.tailwindClass}</code>
                  )}
                </p>
                {feedback === 'incorrect' && (
                  <a
                    href={getDocsUrl(currentQuestion.css)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    📖 View Tailwind docs →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={prevQuestion}
            className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Previous
          </button>

          {!feedback ? (
            <button
              onClick={checkAnswer}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Next Question →
            </button>
          )}

          <button
            onClick={nextQuestion}
            className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Skip →
          </button>
        </div>

        {/* Progress */}
        <div className="text-center mt-8 text-gray-400">
          Question {currentIndex + 1} of {activeQuestions.length}
        </div>

        {/* Question cards */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-6">
          {quizData.map(q => {
            const isCurrent = q.id === currentQuestion.id
            const isWrong = wrongIds.has(q.id)
            const isSeen = seenIds.has(q.id)
            return (
              <button
                key={q.id}
                onClick={() => isSeen && navigateToQuestion(q.id)}
                disabled={!isSeen}
                className={`w-8 h-8 text-xs font-bold rounded transition-colors ${
                  isCurrent
                    ? 'bg-purple-500 text-white ring-2 ring-white'
                    : isWrong
                      ? 'bg-red-700 hover:bg-red-600 text-white'
                      : isSeen
                        ? 'bg-slate-600 hover:bg-slate-500 text-gray-300'
                        : 'bg-slate-800 text-slate-600 cursor-default'
                }`}
              >
                {q.id}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App
