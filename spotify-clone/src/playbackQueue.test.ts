import { describe, expect, it } from 'vitest'
import { advanceQueue, buildQueue, pickNext, rewindQueue } from './playbackQueue'

// Deterministic stand-in for Math.random: returns the given values in order
const randomOf = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]
}

describe('pickNext', () => {
  it('walks the tracklist in order and wraps at the end', () => {
    expect(pickNext(0, 5, false)).toBe(1)
    expect(pickNext(4, 5, false)).toBe(0)
  })

  it('picks a random track under shuffle, never the current one', () => {
    // random lands on the current index -> bumped to the next slot
    expect(pickNext(2, 5, true, randomOf(2 / 5))).toBe(3)
    expect(pickNext(2, 5, true, randomOf(4 / 5))).toBe(4)
  })

  it('falls back to sequential order with a single track', () => {
    expect(pickNext(0, 1, true)).toBe(0)
  })
})

describe('buildQueue', () => {
  it('chains the two upcoming tracks from the current one', () => {
    expect(buildQueue(3, 5, false)).toEqual({
      trackIndex: 3,
      nextTrackIndex: 4,
      nextNextTrackIndex: 0,
    })
  })
})

describe('advanceQueue', () => {
  it('shifts the lookahead window forward and appends a new pick', () => {
    const queue = { trackIndex: 1, nextTrackIndex: 2, nextNextTrackIndex: 3 }
    expect(advanceQueue(queue, 5, false)).toEqual({
      trackIndex: 2,
      nextTrackIndex: 3,
      nextNextTrackIndex: 4,
    })
  })

  it('keeps the promised lookahead even when shuffle picks change later', () => {
    const queue = buildQueue(0, 5, true, randomOf(2 / 5, 4 / 5))
    const advanced = advanceQueue(queue, 5, true, randomOf(1 / 5))
    // Whatever was shown as "next" must be what actually plays
    expect(advanced.trackIndex).toBe(queue.nextTrackIndex)
    expect(advanced.nextTrackIndex).toBe(queue.nextNextTrackIndex)
  })
})

describe('rewindQueue', () => {
  it('steps back one track and reuses the old queue as lookahead', () => {
    const queue = { trackIndex: 2, nextTrackIndex: 4, nextNextTrackIndex: 1 }
    expect(rewindQueue(queue, 5)).toEqual({
      trackIndex: 1,
      nextTrackIndex: 2,
      nextNextTrackIndex: 4,
    })
  })

  it('wraps to the last track from the first', () => {
    expect(
      rewindQueue({ trackIndex: 0, nextTrackIndex: 1, nextNextTrackIndex: 2 }, 5).trackIndex,
    ).toBe(4)
  })
})
