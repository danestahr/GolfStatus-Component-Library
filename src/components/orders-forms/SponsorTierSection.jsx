import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import SponsorRow from './SponsorRow.jsx'
import './SponsorTierSection.scss'

// One tier's header + sponsor rows on the Sponsors list page. Reordering
// (via SponsorRow's drag handle) is only meaningful within a tier that has
// more than one sponsor, so `onReorder` is only wired up — and the handle
// only shown — when `sponsors.length > 1`.
//
// Pointer-based drag-to-reorder, same live-swap convention as
// AddQuestionFields' dropdown options / WavesPanel's waves: dragging past
// the midpoint of a neighboring row swaps it immediately in `draftOrder`,
// with a brief reverse-offset "flash" on whichever row just got displaced
// so it visibly slides into its new slot instead of jump-cutting there.
// Deliberately not native HTML5 drag-and-drop — that only reorders on drop,
// with a static drag-ghost image in between; this swaps live as you drag.
export default function SponsorTierSection({ tierName, sponsors, onReorder, onEditTier, onSelectSponsor }) {
  const reorderable = sponsors.length > 1

  const [draggingId, setDraggingId] = useState(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const [draftOrder, setDraftOrder] = useState(null)
  const [flashOffsets, setFlashOffsets] = useState({})
  const rowRefs = useRef(new Map())
  const rowsBoxRef = useRef(null)
  const dragStartYRef = useRef(0)
  // Tracks whether the pointer actually traveled during the current grab —
  // a plain click on the handle (no movement) shouldn't be swallowed, but a
  // real drag shouldn't fall through to onSelectSponsor once released on
  // top of the row it landed on.
  const pointerDownYRef = useRef(0)
  const dragMovedRef = useRef(false)

  function setRowRef(id, el) {
    if (el) rowRefs.current.set(id, el)
    else rowRefs.current.delete(id)
  }

  // One row's height + the gap after it — every row's movement during a
  // drag is some whole multiple of this. See AddQuestionFields'/WavesPanel's
  // identical helper for why it's measured fresh each move rather than cached.
  function measureRowStep(excludeId) {
    const gap = rowsBoxRef.current ? parseFloat(getComputedStyle(rowsBoxRef.current).rowGap) || 0 : 0
    for (const [id, el] of rowRefs.current) {
      if (id === excludeId) continue
      return el.getBoundingClientRect().height + gap
    }
    return 0
  }

  function handleGrabberPointerDown(e, id) {
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    dragStartYRef.current = e.clientY
    pointerDownYRef.current = e.clientY
    dragMovedRef.current = false
    setDraggingId(id)
    setDragOffsetY(0)
    setDraftOrder(sponsors.map(s => s.id))
  }

  function handleGrabberPointerMove(e) {
    if (draggingId == null) return
    if (Math.abs(e.clientY - pointerDownYRef.current) > 4) dragMovedRef.current = true
    const step = measureRowStep(draggingId)
    let offset = e.clientY - dragStartYRef.current
    if (step > 0) {
      const order = [...(draftOrder ?? sponsors.map(s => s.id))]
      let idx = order.indexOf(draggingId)
      const flashes = {}
      let didSwap = false
      while (idx < order.length - 1 && offset > step / 2) {
        const otherId = order[idx + 1]
        order[idx] = otherId
        order[idx + 1] = draggingId
        flashes[otherId] = step
        idx += 1
        offset -= step
        didSwap = true
      }
      while (idx > 0 && offset < -step / 2) {
        const otherId = order[idx - 1]
        order[idx] = otherId
        order[idx - 1] = draggingId
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
        // to animate from (see AddQuestionFields'/WavesPanel's identical
        // comment).
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
    dragStartYRef.current = e.clientY - offset
  }

  function handleGrabberPointerUp() {
    if (draftOrder && draftOrder.some((id, i) => id !== sponsors[i]?.id)) {
      onReorder(draftOrder)
    }
    setDraggingId(null)
    setDragOffsetY(0)
    setFlashOffsets({})
    setDraftOrder(null)
  }

  // Refs, not direct listener args — same reasoning as AddQuestionFields:
  // the window listener effect only re-subscribes when draggingId flips, so
  // its closure would otherwise be stuck on a stale draftOrder.
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

  const displaySponsors = draftOrder
    ? draftOrder.map(id => sponsors.find(s => s.id === id)).filter(Boolean)
    : sponsors

  return (
    <div className="spn-tier-section">
      <div className="spn-tier-header">
        <div className="spn-tier-name">{tierName} ({sponsors.length})</div>
        <button type="button" className="spn-tier-edit" onClick={onEditTier} aria-label={`Edit ${tierName}`}>
          <FontAwesomeIcon icon={faPen} />
        </button>
      </div>

      <div className={`spn-tier-rows${draggingId != null ? ' spn-tier-rows--reordering' : ''}`} ref={rowsBoxRef}>
        {displaySponsors.map(sponsor => (
          <SponsorRow
            key={sponsor.id}
            sponsor={sponsor}
            showGrabber={reorderable}
            isDragging={sponsor.id === draggingId}
            offsetY={sponsor.id === draggingId ? dragOffsetY : (flashOffsets[sponsor.id] ?? 0)}
            onGrabberPointerDown={e => handleGrabberPointerDown(e, sponsor.id)}
            onRowRef={el => setRowRef(sponsor.id, el)}
            onClick={() => { if (!dragMovedRef.current) onSelectSponsor(sponsor) }}
          />
        ))}
      </div>
    </div>
  )
}
