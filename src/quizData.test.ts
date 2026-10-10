import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { quizCategories, quizData } from './quizData.ts'

const ids = quizData.map(q => q.id)

describe('quizData', () => {
  it('contains every question from every category exactly once', () => {
    const fromCategories = quizCategories.flatMap(c => c.questions)
    assert.equal(quizData.length, fromCategories.length)
    assert.deepEqual(new Set(quizData), new Set(fromCategories))
  })

  it('has unique, positive integer IDs', () => {
    assert.equal(new Set(ids).size, ids.length)
    for (const id of ids) assert.ok(Number.isInteger(id) && id > 0, `bad ID ${id}`)
  })

  it('is ordered by ascending ID so saved positions stay stable', () => {
    assert.deepEqual(ids, [...ids].sort((a, b) => a - b))
  })

  it('still includes every previously shipped ID (saved progress references them)', () => {
    const shipped = Array.from({ length: 42 }, (_, i) => i + 1)
    for (const id of shipped) assert.ok(ids.includes(id), `missing shipped ID ${id}`)
  })

  it('gives every question an answer key', () => {
    for (const q of quizData) {
      assert.ok(q.tailwindClass.trim().length > 0, `ID ${q.id} has no class`)
      assert.ok(Object.keys(q.css).length > 0, `ID ${q.id} has no CSS`)
    }
  })
})

describe('quizCategories', () => {
  it('has unique category IDs', () => {
    const categoryIds = quizCategories.map(c => c.id)
    assert.equal(new Set(categoryIds).size, categoryIds.length)
  })
})
