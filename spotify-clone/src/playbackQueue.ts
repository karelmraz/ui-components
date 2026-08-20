// Pure queue logic behind usePlayback: the current track plus a two-deep
// lookahead, so the UI can always show what plays next. `random` is injectable
// for deterministic tests.

export interface Queue {
  trackIndex: number
  nextTrackIndex: number
  nextNextTrackIndex: number
}

export function pickNext(
  currentIndex: number,
  trackCount: number,
  shuffleOn: boolean,
  random: () => number = Math.random,
): number {
  if (shuffleOn && trackCount > 1) {
    let r = Math.floor(random() * trackCount)
    if (r === currentIndex) r = (r + 1) % trackCount
    return r
  }
  return (currentIndex + 1) % trackCount
}

export function buildQueue(
  trackIndex: number,
  trackCount: number,
  shuffleOn: boolean,
  random?: () => number,
): Queue {
  const nextTrackIndex = pickNext(trackIndex, trackCount, shuffleOn, random)
  return {
    trackIndex,
    nextTrackIndex,
    nextNextTrackIndex: pickNext(nextTrackIndex, trackCount, shuffleOn, random),
  }
}

// The lookahead is a promise to the listener: advancing plays exactly what was
// shown as "next", and only the new tail is picked fresh.
export function advanceQueue(
  queue: Queue,
  trackCount: number,
  shuffleOn: boolean,
  random?: () => number,
): Queue {
  return {
    trackIndex: queue.nextTrackIndex,
    nextTrackIndex: queue.nextNextTrackIndex,
    nextNextTrackIndex: pickNext(queue.nextNextTrackIndex, trackCount, shuffleOn, random),
  }
}

export function rewindQueue(queue: Queue, trackCount: number): Queue {
  return {
    trackIndex: (queue.trackIndex - 1 + trackCount) % trackCount,
    nextTrackIndex: queue.trackIndex,
    nextNextTrackIndex: queue.nextTrackIndex,
  }
}
