import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { quizCategories, quizData } from './quizData.ts'

const ids = quizData.map(q => q.id)

// Append new questions here; never edit or remove an existing entry.
const SHIPPED_IDS: Record<number, string> = {
  1: 'flex',
  2: 'grid',
  3: 'hidden',
  4: 'block',
  5: 'inline',
  6: 'inline-block',
  7: 'flex-col',
  8: 'flex-row',
  9: 'justify-center',
  10: 'justify-between',
  11: 'items-center',
  12: 'items-start',
  13: 'gap-4',
  14: 'flex-wrap',
  15: 'p-4',
  16: 'px-6',
  17: 'py-2',
  18: 'm-4',
  19: 'mx-auto',
  20: 'mt-8',
  21: 'w-full',
  22: 'h-screen',
  23: 'max-w-md',
  24: 'min-h-screen',
  25: 'text-center',
  26: 'text-xl',
  27: 'font-bold',
  28: 'text-gray-500',
  29: 'uppercase',
  30: 'bg-blue-500',
  31: 'rounded-lg',
  32: 'border-2',
  33: 'shadow-md',
  34: 'relative',
  35: 'absolute',
  36: 'fixed',
  37: 'top-0',
  38: 'right-4',
  39: 'opacity-50',
  40: 'cursor-pointer',
  41: 'overflow-hidden',
  42: 'z-10',
}

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

  it('keeps every shipped ID bound to the same question (saved progress references them)', () => {
    const byId = new Map(quizData.map(q => [q.id, q.tailwindClass]))
    for (const [id, tailwindClass] of Object.entries(SHIPPED_IDS)) {
      assert.equal(byId.get(Number(id)), tailwindClass, `shipped ID ${id} changed`)
    }
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
