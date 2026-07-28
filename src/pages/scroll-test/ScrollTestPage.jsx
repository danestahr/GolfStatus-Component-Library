import { useState, useRef, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import AppSidePanel from '../../components/AppSidePanel'
import GSButton from '../../gs-lib/components/gs-button'
import './ScrollTestPage.scss'

// ── Long list (12 items, triggers near-bottom pill edge case) ─────────────────
const LONG_LIST = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Player ${i + 1}`,
  email: `player${i + 1}@example.com`,
  team: `Team ${(i % 3) + 1}`,
}))
const LONG_TOTAL     = LONG_LIST.length
const LONG_PAGE_SIZE = 4

// ── Short list (3 items, never scrollable — pill should never appear) ─────────
const SHORT_LIST = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  name: `Player ${i + 1}`,
  email: `player${i + 1}@example.com`,
  team: `Team ${i + 1}`,
}))

export default function ScrollTestPage() {
  return (
    <div className="scroll-test-page">
      <div className="page-background">
        <div className="st-scenario-row">
          <ScenarioCard
            label="Long list"
            description="12 items — pill appears then hides as you near the bottom"
          >
            {(open, setOpen) => <LongListPanel panelOpen={open} setPanelOpen={setOpen} />}
          </ScenarioCard>

          <ScenarioCard
            label="Tiny list"
            description="3 items — fits on screen, pill never appears"
          >
            {(open, setOpen) => <ShortListPanel panelOpen={open} setPanelOpen={setOpen} />}
          </ScenarioCard>
        </div>
      </div>
    </div>
  )
}

function ScenarioCard({ label, description, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="st-scenario-card">
      <div className="st-scenario-label">{label}</div>
      <div className="st-scenario-desc">{description}</div>
      <GSButton
        title="Open Panel"
        type="black"
        onClick={() => setOpen(true)}
        isFocusable
      />
      {children(open, setOpen)}
    </div>
  )
}

function LongListPanel({ panelOpen, setPanelOpen }) {
  const [visibleCount,     setVisibleCount]     = useState(0)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isLoading,        setIsLoading]        = useState(false)
  const [showPill,         setShowPill]         = useState(false)

  const listRef     = useRef(null)
  const sentinelRef = useRef(null)
  const loadingRef  = useRef(false)

  const isDone = visibleCount >= LONG_TOTAL

  const getScrollEl = useCallback(
    () => listRef.current?.closest('.app-side-panel-body'),
    []
  )

  // Reset when panel opens and kick off initial fetch
  useEffect(() => {
    if (!panelOpen) return
    setVisibleCount(0)
    setIsLoading(false)
    setShowPill(false)
    setIsInitialLoading(true)
    loadingRef.current = true
    const timer = setTimeout(() => {
      setVisibleCount(LONG_PAGE_SIZE)
      loadingRef.current = false
    }, 800)
    return () => clearTimeout(timer)
  }, [panelOpen])

  // Clear initial loading once first items are in the DOM
  useEffect(() => {
    if (isInitialLoading && visibleCount >= LONG_PAGE_SIZE) {
      setIsInitialLoading(false)
    }
  }, [isInitialLoading, visibleCount])

  const loadMore = useCallback(() => {
    if (loadingRef.current || visibleCount >= LONG_TOTAL) return
    loadingRef.current = true
    setIsLoading(true)
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + LONG_PAGE_SIZE, LONG_TOTAL))
      setIsLoading(false)
      loadingRef.current = false
    }, 800)
  }, [visibleCount])

  // Pill check — runs on scroll, resize, and whenever content changes
  useEffect(() => {
    const el = getScrollEl()
    if (!el || !panelOpen || isInitialLoading) return
    const check = () => {
      const scrollRemaining = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowPill(el.scrollTop < 200 && scrollRemaining >= 200)
    }
    const rafId = requestAnimationFrame(check)
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [panelOpen, getScrollEl, isInitialLoading, visibleCount])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || isDone) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isDone, loadMore])

  const visiblePlayers = LONG_LIST.slice(0, visibleCount)

  return (
    <AppSidePanel
      isOpen={panelOpen}
      onClose={() => setPanelOpen(false)}
      title="Long List (12)"
      bottomContent={
        <div className={`st-pill-wrapper${showPill ? '' : ' hidden'}`}>
          <GSButton
            title="scroll for more"
            type="secondary pill cyan"
            onClick={() => getScrollEl()?.scrollBy({ top: 200, behavior: 'smooth' })}
          />
        </div>
      }
    >
      {isInitialLoading ? (
        <div className="st-initial-loading">
          <FontAwesomeIcon icon={faCircleNotch} className="st-spinner" />
        </div>
      ) : (
        <div className="st-list" ref={listRef}>
          {visiblePlayers.map(p => (
            <div key={p.id} className="st-list-item">
              <div className="st-player-name">{p.name}</div>
              <div className="st-player-email">{p.email}</div>
              <div className="st-player-team">{p.team}</div>
            </div>
          ))}

          {!isDone && !isLoading && <div ref={sentinelRef} className="st-sentinel" />}
          {isLoading && (
            <div className="st-loading-row">
              <FontAwesomeIcon icon={faCircleNotch} className="st-spinner" />
            </div>
          )}
          {isDone && (
            <div className="st-end-row">
              <div className="st-end-sublabel">Showing All {LONG_TOTAL} Players</div>
            </div>
          )}
        </div>
      )}
    </AppSidePanel>
  )
}

function ShortListPanel({ panelOpen, setPanelOpen }) {
  const [showPill, setShowPill] = useState(false)

  const listRef = useRef(null)

  const getScrollEl = useCallback(
    () => listRef.current?.closest('.app-side-panel-body'),
    []
  )

  useEffect(() => {
    const el = getScrollEl()
    if (!el || !panelOpen) return
    const check = () => {
      const scrollRemaining = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowPill(el.scrollTop < 200 && scrollRemaining >= 200)
    }
    const rafId = requestAnimationFrame(check)
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [panelOpen, getScrollEl])

  return (
    <AppSidePanel
      isOpen={panelOpen}
      onClose={() => setPanelOpen(false)}
      title="Tiny List (3)"
      bottomContent={
        <div className={`st-pill-wrapper${showPill ? '' : ' hidden'}`}>
          <GSButton
            title="scroll for more"
            type="secondary pill cyan"
            onClick={() => getScrollEl()?.scrollBy({ top: 200, behavior: 'smooth' })}
          />
        </div>
      }
    >
      <div className="st-list" ref={listRef}>
        {SHORT_LIST.map(p => (
          <div key={p.id} className="st-list-item">
            <div className="st-player-name">{p.name}</div>
            <div className="st-player-email">{p.email}</div>
            <div className="st-player-team">{p.team}</div>
          </div>
        ))}
        <div className="st-end-row">
          <div className="st-end-sublabel">Showing All {SHORT_LIST.length} Players</div>
        </div>
      </div>
    </AppSidePanel>
  )
}
