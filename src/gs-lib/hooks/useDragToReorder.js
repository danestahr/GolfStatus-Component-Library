import { useEffect, useRef, useState } from 'react'

// Shared pointer-based drag-to-reorder for a vertical list of rows —
// previously copy-pasted (with only variable names changed) across
// EventSiteHomepageSectionsList, PackageCategorySection(V2), SponsorTierSection,
// AddQuestionFields' dropdown options, and WavesPanel's waves. Dragging a grip
// handle past the midpoint of a neighboring row swaps it immediately in a
// draft order, with a brief reverse-offset "flash" on whichever row just got
// displaced so it visibly slides into its new slot instead of jump-cutting
// there. Deliberately not native HTML5 drag-and-drop — that only reorders on
// drop, with a static drag-ghost image in between; this swaps live as you drag.
//
// Also auto-scrolls the nearest scrollable ancestor (an `.app-side-panel-body`,
// or the window itself for a page-level list) once the pointer nears its
// top/bottom edge, so a list taller than the viewport can still be reordered
// end to end. Every pixel that auto-scroll moves the content is fed straight
// back into the dragged row's own offset (see `applyDragPosition`'s callers) —
// without that, the row would only track raw pointer movement and would
// visibly fall behind the cursor for as long as the content kept scrolling
// underneath it.
//
// @param {(string|number)[]} ids         Current order, as ids — map back to
//                                        full items with `displayOrder.map(getItem)`
// @param {(order: (string|number)[]) => void} onReorder  Called once, on release,
//                                        only if the order actually changed
// @param {string|number|null} [excludeId]  An id to skip when measuring row
//                                        height, e.g. one that's expanded
//                                        taller than the rest (see
//                                        EventSiteHomepageSectionsList's
//                                        `editingSection`)
export function useDragToReorder(ids, onReorder, excludeId = null) {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const [draftOrder, setDraftOrder] = useState(null)
  const [flashOffsets, setFlashOffsets] = useState({})

  const rowRefs = useRef(new Map())
  const rowsBoxRef = useRef(null)
  const dragStartYRef = useRef(0)
  // Tracks whether the pointer actually traveled during the current grab —
  // a plain click on the handle (no movement) shouldn't be swallowed, but a
  // real drag shouldn't fall through to a row's own onClick once released on
  // top of whichever row it landed on. Reset on every pointerup so a later,
  // unrelated click isn't still blocked by an earlier drag.
  const pointerDownYRef = useRef(0)
  const dragMovedRef = useRef(false)
  // The latest raw pointer Y — pointermove only fires when the pointer
  // itself moves, but the auto-scroll loop below has to keep re-applying
  // this same position on every frame, since the content (and therefore
  // what's under an unmoving pointer) keeps changing while it scrolls.
  const lastPointerYRef = useRef(0)

  function setRowRef(id, el) {
    if (el) rowRefs.current.set(id, el)
    else rowRefs.current.delete(id)
  }

  // One row's height + the gap after it — every row's movement during a
  // drag is some whole multiple of this. Measured fresh on every move (not
  // cached) since it only needs the size of a row that isn't the one being
  // dragged (and isn't `excludeId`, if that row is taller than the rest).
  function measureRowStep(draggingIdValue) {
    const gap = rowsBoxRef.current ? parseFloat(getComputedStyle(rowsBoxRef.current).rowGap) || 0 : 0
    for (const [id, el] of rowRefs.current) {
      if (id === draggingIdValue || id === excludeId) continue
      return el.getBoundingClientRect().height + gap
    }
    return 0
  }

  // Applies one clientY to the in-progress drag: swaps `draftOrder` as many
  // times as the accumulated offset now covers, flashes whichever rows just
  // got displaced, and rebases `dragStartYRef` so the next call (whether
  // that's a real pointermove or another auto-scroll tick) measures only
  // what's happened since. Shared by handleGrabberPointerMove and the
  // auto-scroll loop, which both need to run the exact same swap/offset math
  // — the loop just supplies the same (unmoving) clientY repeatedly instead
  // of a new one from the browser.
  function applyDragPosition(clientY, draggingIdValue) {
    const step = measureRowStep(draggingIdValue)
    let offset = clientY - dragStartYRef.current
    if (step > 0) {
      const order = [...(draftOrder ?? ids)]
      let idx = order.indexOf(draggingIdValue)
      const flashes = {}
      let didSwap = false
      while (idx < order.length - 1 && offset > step / 2) {
        const otherId = order[idx + 1]
        order[idx] = otherId
        order[idx + 1] = draggingIdValue
        flashes[otherId] = step
        idx += 1
        offset -= step
        didSwap = true
      }
      while (idx > 0 && offset < -step / 2) {
        const otherId = order[idx - 1]
        order[idx] = otherId
        order[idx - 1] = draggingIdValue
        flashes[otherId] = -step
        idx -= 1
        offset += step
        didSwap = true
      }
      if (didSwap) {
        setDraftOrder(order)
        setFlashOffsets(prev => ({ ...prev, ...flashes }))
        // Double rAF: the flash offset needs to actually paint before the
        // next frame clears it to 0, or there's nothing for the transition
        // to animate from.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setFlashOffsets(prev => {
              const next = { ...prev }
              Object.keys(flashes).forEach(flashedId => { next[flashedId] = 0 })
              return next
            })
          })
        })
      }
      const min = -idx * step
      const max = (order.length - 1 - idx) * step
      offset = Math.min(Math.max(offset, min), max)
    }
    setDragOffsetY(offset)
    dragStartYRef.current = clientY - offset
  }

  function handleGrabberPointerDown(e, id) {
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    dragStartYRef.current = e.clientY
    pointerDownYRef.current = e.clientY
    lastPointerYRef.current = e.clientY
    dragMovedRef.current = false
    setDraggingId(id)
    setDragOffsetY(0)
    setDraftOrder([...ids])
  }

  function handleGrabberPointerMove(e) {
    if (draggingId == null) return
    if (Math.abs(e.clientY - pointerDownYRef.current) > 4) dragMovedRef.current = true
    lastPointerYRef.current = e.clientY
    applyDragPosition(e.clientY, draggingId)
  }

  function handleGrabberPointerUp() {
    if (draftOrder && draftOrder.some((id, i) => id !== ids[i])) {
      onReorder(draftOrder)
    }
    setDraggingId(null)
    setDragOffsetY(0)
    setFlashOffsets({})
    setDraftOrder(null)
    dragMovedRef.current = false
  }

  // Refs, not direct listener args — the window listener effect below only
  // re-subscribes when draggingId flips, so its closure would otherwise be
  // stuck on a stale draftOrder.
  const pointerMoveRef = useRef(() => {})
  const pointerUpRef = useRef(() => {})
  pointerMoveRef.current = handleGrabberPointerMove
  pointerUpRef.current = handleGrabberPointerUp

  useEffect(() => {
    if (draggingId == null) return
    const onMove = e => pointerMoveRef.current(e)
    const onUp = e => pointerUpRef.current(e)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [draggingId])

  // The nearest ancestor of the rows box that can actually scroll — an
  // `.app-side-panel-body` for a list living in a side panel, some other
  // `overflow-y: auto/scroll` container, or (falling all the way out)
  // `document.scrollingElement` for a page-level list scrolled by the window
  // itself. Walked fresh each time rather than cached: nothing here changes
  // mid-drag, but which ancestor actually scrolls can vary by where a given
  // list happens to be mounted, and this keeps the hook from needing to know
  // that in advance.
  function getScrollContainer() {
    let el = rowsBoxRef.current?.parentElement
    while (el && el !== document.body) {
      const style = getComputedStyle(el)
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el
      }
      el = el.parentElement
    }
    return document.scrollingElement || document.documentElement
  }

  // One tick of the auto-scroll loop: nudges the scroll container while the
  // pointer sits within EDGE px of its top/bottom, at a speed that ramps up
  // the closer the pointer is to that edge. Whatever the scroll actually
  // moved (it may be less than requested, or nothing at all, right at either
  // end) gets folded straight into the drag via applyDragPosition, so the
  // dragged row keeps tracking the pointer's screen position exactly — and
  // keeps swapping past rows as they scroll by underneath it — instead of
  // sitting still until the pointer itself moves again.
  function autoScrollTick() {
    if (draggingId == null) return
    const EDGE = 72
    const MAX_SPEED = 20
    const scroller = getScrollContainer()
    const isWindowScroller = scroller === document.scrollingElement || scroller === document.documentElement
    const rect = isWindowScroller
      ? { top: 0, bottom: window.innerHeight }
      : scroller.getBoundingClientRect()
    const top = Math.max(rect.top, 0)
    const bottom = Math.min(rect.bottom, window.innerHeight)
    const y = lastPointerYRef.current

    let dy = 0
    if (y < top + EDGE) {
      dy = -Math.ceil(MAX_SPEED * Math.min(1, (top + EDGE - y) / EDGE))
    } else if (y > bottom - EDGE) {
      dy = Math.ceil(MAX_SPEED * Math.min(1, (y - (bottom - EDGE)) / EDGE))
    }
    if (dy === 0) return

    const before = isWindowScroller ? window.scrollY : scroller.scrollTop
    if (isWindowScroller) window.scrollBy(0, dy)
    else scroller.scrollTop += dy
    const actualDy = (isWindowScroller ? window.scrollY : scroller.scrollTop) - before
    if (actualDy === 0) return

    dragStartYRef.current -= actualDy
    applyDragPosition(lastPointerYRef.current, draggingId)
  }

  const autoScrollTickRef = useRef(() => {})
  autoScrollTickRef.current = autoScrollTick

  useEffect(() => {
    if (draggingId == null) return
    let rafId
    const loop = () => {
      autoScrollTickRef.current()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [draggingId])

  return {
    draggingId,
    dragOffsetY,
    flashOffsets,
    displayOrder: draftOrder ?? ids,
    isReordering: draggingId != null,
    dragMovedRef,
    rowsBoxRef,
    setRowRef,
    handleGrabberPointerDown,
  }
}
