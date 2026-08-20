import { useEffect, useRef } from 'react'

/**
 * Turn a horizontal scroll container into a click-and-drag scroller.
 * Touch scrolling is left to the browser; this only adds mouse drag.
 *
 * If the pointer moves past the threshold the drag takes over and the
 * resulting click is suppressed so child items don't also fire onClick.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let isDown = false
    let dragged = false
    let startX = 0
    let startScrollLeft = 0
    const THRESHOLD = 5

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      isDown = true
      dragged = false
      startX = e.clientX
      startScrollLeft = el.scrollLeft
    }

    const onMove = (e: MouseEvent) => {
      if (!isDown) return
      const dx = e.clientX - startX
      if (!dragged && Math.abs(dx) > THRESHOLD) {
        dragged = true
        el.style.cursor = 'grabbing'
        el.style.userSelect = 'none'
      }
      if (dragged) {
        el.scrollLeft = startScrollLeft - dx
      }
    }

    const onUp = () => {
      isDown = false
      el.style.cursor = ''
      el.style.userSelect = ''
    }

    const onClickCapture = (e: MouseEvent) => {
      if (dragged) {
        e.stopPropagation()
        e.preventDefault()
        dragged = false
      }
    }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('click', onClickCapture, true)

    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  return ref
}
