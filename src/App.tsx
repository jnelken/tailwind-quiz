import { useState } from 'react'
import { quizData, QuizQuestion } from './quizData'

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [isFlipped, setIsFlipped] = useState(false) // false = CSS to Tailwind, true = Tailwind to CSS
  const [hintsEnabled, setHintsEnabled] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const currentQuestion = quizData[currentIndex]

  const formatCSS = (css: { [key: string]: string }, showHints: boolean = false) => {
    return Object.entries(css)
      .map(([property, value]) => {
        if (showHints) {
          return `${property}: ____;`
        }
        return `${property}: ${value};`
      })
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

  const checkAnswer = () => {
    if (isAnswerCorrect(userAnswer)) {
      setFeedback('correct')
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setFeedback('incorrect')
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
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
    setCurrentIndex((prev) => (prev + 1) % quizData.length)
    setUserAnswer('')
    setFeedback(null)
  }

  const prevQuestion = () => {
    setCurrentIndex((prev) => (prev - 1 + quizData.length) % quizData.length)
    setUserAnswer('')
    setFeedback(null)
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
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
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
                hintsEnabled
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {hintsEnabled ? '💡 Hints: ON' : '💡 Hints: OFF'}
            </button>
          )}
        </div>

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
                <p className="text-sm">
                  <span className="font-semibold">Answer: </span>
                  {isFlipped ? (
                    <pre className="inline text-green-300">{formatCSS(currentQuestion.css)}</pre>
                  ) : (
                    <code className="text-green-300">{currentQuestion.tailwindClass}</code>
                  )}
                </p>
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
          Question {currentIndex + 1} of {quizData.length}
        </div>
      </div>
    </div>
  )
}

export default App
