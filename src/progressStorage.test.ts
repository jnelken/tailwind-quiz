import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  PROGRESS_STORAGE_KEY,
  loadProgress,
  parseProgress,
  saveProgress,
  serializeProgress,
} from './progressStorage.ts'

const VALID_IDS = new Set([1, 2, 3, 4])
const QUESTION_COUNT = 4

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

const throwingStorage = {
  getItem: (): string | null => {
    throw new Error('SecurityError')
  },
  setItem: (): void => {
    throw new Error('QuotaExceededError')
  },
}

describe('parseProgress', () => {
  it('returns empty progress when nothing is stored', () => {
    assert.deepEqual(parseProgress(null, VALID_IDS, QUESTION_COUNT), {
      wrongIds: new Set(),
      seenIds: new Set(),
      currentIndex: 0,
    })
  })

  it('round-trips serialized progress', () => {
    const progress = { wrongIds: new Set([2]), seenIds: new Set([1, 2, 3]), currentIndex: 2 }
    assert.deepEqual(parseProgress(serializeProgress(progress), VALID_IDS, QUESTION_COUNT), progress)
  })

  it('falls back to empty progress on malformed JSON or non-object values', () => {
    for (const raw of ['{not json', 'null', '42', '"text"']) {
      assert.deepEqual(parseProgress(raw, VALID_IDS, QUESTION_COUNT).currentIndex, 0)
      assert.equal(parseProgress(raw, VALID_IDS, QUESTION_COUNT).wrongIds.size, 0)
    }
  })

  it('drops unknown IDs and non-number entries', () => {
    const raw = JSON.stringify({ wrongIds: [1, 99, '2', null], seenIds: [3, -1, 4.5], currentIndex: 1 })
    const progress = parseProgress(raw, VALID_IDS, QUESTION_COUNT)
    assert.deepEqual(progress.wrongIds, new Set([1]))
    assert.deepEqual(progress.seenIds, new Set([3]))
  })

  it('treats wrongly typed fields as empty', () => {
    const raw = JSON.stringify({ wrongIds: 'oops', seenIds: { 1: true }, currentIndex: '2' })
    assert.deepEqual(parseProgress(raw, VALID_IDS, QUESTION_COUNT), {
      wrongIds: new Set(),
      seenIds: new Set(),
      currentIndex: 0,
    })
  })

  it('resets an out-of-range or fractional current index', () => {
    for (const currentIndex of [-1, 4, 100, 1.5, Number.NaN]) {
      const raw = JSON.stringify({ wrongIds: [], seenIds: [], currentIndex })
      assert.equal(parseProgress(raw, VALID_IDS, QUESTION_COUNT).currentIndex, 0)
    }
  })
})

describe('loadProgress / saveProgress', () => {
  it('saves under the versioned key and loads it back', () => {
    const storage = memoryStorage()
    const progress = { wrongIds: new Set([4]), seenIds: new Set([1, 4]), currentIndex: 3 }
    saveProgress(progress, storage)
    assert.ok(storage.data.has(PROGRESS_STORAGE_KEY))
    assert.deepEqual(loadProgress(VALID_IDS, QUESTION_COUNT, storage), progress)
  })

  it('tolerates missing storage', () => {
    assert.equal(loadProgress(VALID_IDS, QUESTION_COUNT, null).currentIndex, 0)
    assert.doesNotThrow(() => saveProgress({ wrongIds: new Set(), seenIds: new Set(), currentIndex: 0 }, null))
  })

  it('tolerates storage that throws', () => {
    assert.equal(loadProgress(VALID_IDS, QUESTION_COUNT, throwingStorage).seenIds.size, 0)
    assert.doesNotThrow(() =>
      saveProgress({ wrongIds: new Set([1]), seenIds: new Set(), currentIndex: 0 }, throwingStorage),
    )
  })
})
