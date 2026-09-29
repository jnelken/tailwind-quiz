export const PROGRESS_STORAGE_KEY = 'tailwind-quiz:progress:v1'

export interface QuizProgress {
  wrongIds: Set<number>
  seenIds: Set<number>
  currentIndex: number
}

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

function getBrowserStorage(): KeyValueStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function sanitizeIds(value: unknown, validIds: ReadonlySet<number>): Set<number> {
  if (!Array.isArray(value)) return new Set()
  return new Set(value.filter((id): id is number => typeof id === 'number' && validIds.has(id)))
}

function sanitizeIndex(value: unknown, questionCount: number): number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) < questionCount
    ? (value as number)
    : 0
}

export function emptyProgress(): QuizProgress {
  return { wrongIds: new Set(), seenIds: new Set(), currentIndex: 0 }
}

export function parseProgress(
  raw: string | null,
  validIds: ReadonlySet<number>,
  questionCount: number,
): QuizProgress {
  if (raw === null) return emptyProgress()
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return emptyProgress()
  }
  if (typeof data !== 'object' || data === null) return emptyProgress()
  const record = data as Record<string, unknown>
  return {
    wrongIds: sanitizeIds(record.wrongIds, validIds),
    seenIds: sanitizeIds(record.seenIds, validIds),
    currentIndex: sanitizeIndex(record.currentIndex, questionCount),
  }
}

export function serializeProgress({ wrongIds, seenIds, currentIndex }: QuizProgress): string {
  return JSON.stringify({ wrongIds: [...wrongIds], seenIds: [...seenIds], currentIndex })
}

export function loadProgress(
  validIds: ReadonlySet<number>,
  questionCount: number,
  storage: KeyValueStorage | null = getBrowserStorage(),
): QuizProgress {
  try {
    return parseProgress(storage?.getItem(PROGRESS_STORAGE_KEY) ?? null, validIds, questionCount)
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(
  progress: QuizProgress,
  storage: KeyValueStorage | null = getBrowserStorage(),
): void {
  try {
    storage?.setItem(PROGRESS_STORAGE_KEY, serializeProgress(progress))
  } catch {
    // Storage full or blocked (e.g. private mode): progress just won't persist.
  }
}
