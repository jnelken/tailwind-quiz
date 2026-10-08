import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatCSS, getDocsUrl, isAnswerCorrect, markSeen } from './quizLogic.ts'

const flexCenter = {
  tailwindClass: 'flex items-center',
  css: { display: 'flex', 'align-items': 'center' },
}

describe('getDocsUrl', () => {
  it('links to the docs page for the first CSS property', () => {
    assert.equal(getDocsUrl({ display: 'flex', 'align-items': 'center' }), 'https://tailwindcss.com/docs/display')
  })

  it('strips a trailing side or logical-direction suffix', () => {
    for (const [prop, base] of [
      ['padding-top', 'padding'],
      ['margin-right', 'margin'],
      ['padding-bottom', 'padding'],
      ['margin-left', 'margin'],
      ['padding-inline-start', 'padding-inline'],
      ['margin-inline-end', 'margin-inline'],
    ]) {
      assert.equal(getDocsUrl({ [prop]: '1rem' }), `https://tailwindcss.com/docs/${base}`)
    }
  })

  it('only strips the suffix at the end of the property name', () => {
    assert.equal(getDocsUrl({ 'border-top-width': '1px' }), 'https://tailwindcss.com/docs/border-top-width')
    assert.equal(getDocsUrl({ 'justify-content': 'end' }), 'https://tailwindcss.com/docs/justify-content')
  })

  it('throws on an empty CSS object', () => {
    assert.throws(() => getDocsUrl({}), TypeError)
  })
})

describe('formatCSS', () => {
  it('renders one declaration per line', () => {
    assert.equal(formatCSS(flexCenter.css), 'display: flex;\nalign-items: center;')
  })

  it('blanks out values when hints are on', () => {
    assert.equal(formatCSS(flexCenter.css, true), 'display: ____;\nalign-items: ____;')
  })

  it('returns an empty string for an empty CSS object', () => {
    assert.equal(formatCSS({}), '')
  })
})

describe('isAnswerCorrect', () => {
  describe('CSS → Tailwind (not flipped)', () => {
    it('accepts the class ignoring case and surrounding whitespace', () => {
      assert.equal(isAnswerCorrect('flex items-center', false, flexCenter), true)
      assert.equal(isAnswerCorrect('  FLEX Items-Center\n', false, flexCenter), true)
    })

    it('treats inner whitespace as significant', () => {
      assert.equal(isAnswerCorrect('flex  items-center', false, flexCenter), false)
    })

    it('rejects a different class', () => {
      assert.equal(isAnswerCorrect('flex', false, flexCenter), false)
      assert.equal(isAnswerCorrect('', false, flexCenter), false)
    })
  })

  describe('Tailwind → CSS (flipped)', () => {
    it('accepts the formatted CSS', () => {
      assert.equal(isAnswerCorrect('display: flex;\nalign-items: center;', true, flexCenter), true)
    })

    it('ignores case and collapses any run of whitespace on both sides', () => {
      assert.equal(isAnswerCorrect('  DISPLAY:   flex;  \t align-items:\ncenter; ', true, flexCenter), true)
    })

    it('still requires spaces where the formatted CSS has them', () => {
      assert.equal(isAnswerCorrect('display:flex; align-items:center;', true, flexCenter), false)
    })

    it('rejects declarations in a different order or the bare class', () => {
      assert.equal(isAnswerCorrect('align-items: center; display: flex;', true, flexCenter), false)
      assert.equal(isAnswerCorrect('flex items-center', true, flexCenter), false)
    })
  })
})

describe('markSeen', () => {
  it('returns the same Set when the ID is already seen', () => {
    const seen = new Set([1, 2])
    assert.equal(markSeen(2, seen), seen)
    assert.deepEqual(seen, new Set([1, 2]))
  })

  it('returns a new Set with the ID added, leaving the input untouched', () => {
    const seen = new Set([1])
    const next = markSeen(3, seen)
    assert.notEqual(next, seen)
    assert.deepEqual(next, new Set([1, 3]))
    assert.deepEqual(seen, new Set([1]))
  })
})
