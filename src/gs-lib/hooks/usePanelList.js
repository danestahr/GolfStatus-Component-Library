import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * Manages loading state, pagination, and scroll-pill visibility for a
 * panel that contains an infinite/paginated list.
 *
 * @param {object[]} data             Full dataset to paginate through
 * @param {number}   pageSize         Items per incremental load
 * @param {number}   [initialPageSize] Items to load on first open (defaults to pageSize)
 * @param {boolean}  panelOpen        Whether the panel is currently open
 */
export function usePanelList({ data, pageSize, initialPageSize, panelOpen }) {
  const total     = data.length
  const firstLoad = initialPageSize ?? pageSize

  const [visibleCount,     setVisibleCount]     = useState(0)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isLoading,        setIsLoading]        = useState(false)
  const [showPill,         setShowPill]         = useState(false)

  const listRef     = useRef(null)
  const sentinelRef = useRef(null)
  const loadingRef  = useRef(false)

  const isDone = visibleCount >= total

  const getScrollEl = useCallback(
    () => listRef.current?.closest('.app-side-panel-body'),
    []
  )

  // Reset and kick off initial fetch when panel opens
  useEffect(() => {
    if (!panelOpen) return
    setVisibleCount(0)
    setIsLoading(false)
    setShowPill(false)
    setIsInitialLoading(true)
    loadingRef.current = true
    const timer = setTimeout(() => {
      setVisibleCount(firstLoad)
      loadingRef.current = false
    }, 800)
    return () => clearTimeout(timer)
  }, [panelOpen, firstLoad])

  // Clear initial loading once first items are in the DOM
  useEffect(() => {
    if (isInitialLoading && visibleCount >= firstLoad) {
      setIsInitialLoading(false)
    }
  }, [isInitialLoading, visibleCount, firstLoad])

  const loadMore = useCallback(() => {
    if (loadingRef.current || visibleCount >= total) return
    loadingRef.current = true
    setIsLoading(true)
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + pageSize, total))
      setIsLoading(false)
      loadingRef.current = false
    }, 800)
  }, [visibleCount, total, pageSize])

  // Pill check — scroll, resize, and content changes
  useEffect(() => {
    const el = getScrollEl()
    if (!el || !panelOpen || isInitialLoading) return
    const check = () => {
      const scrollRemaining = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowPill(el.scrollTop < 200 && scrollRemaining >= 56)
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

  // IntersectionObserver on sentinel → load next page
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || isDone) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isDone, loadMore, isInitialLoading])

  return {
    visibleItems: data.slice(0, visibleCount),
    isInitialLoading,
    isLoading,
    isDone,
    showPill,
    total,
    listRef,
    sentinelRef,
    getScrollEl,
  }
}
