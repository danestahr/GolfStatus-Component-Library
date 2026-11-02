// Mock facility directory for Quick Start's course search (round details).
export const FACILITIES = [
  { id: 'f1', name: 'Pine Valley', city: 'Pine Valley', state: 'NJ' },
  { id: 'f2', name: 'Pine Valley Golf Club', city: 'Dallas', state: 'TX' },
  { id: 'f3', name: 'Pinehurst Resort', city: 'Pinehurst', state: 'NC' },
  { id: 'f4', name: 'Pine Hollow Country Club', city: 'Austin', state: 'TX' },
  { id: 'f5', name: 'Barton Creek', city: 'Austin', state: 'TX' },
  { id: 'f6', name: 'Cedar Ridge Country Club', city: 'Tulsa', state: 'OK' },
  { id: 'f7', name: 'Oak Hollow Golf Course', city: 'High Point', state: 'NC' },
]

// Name is a contains-match, state (optional) an exact abbreviation match.
export const searchFacilities = (name, state) => {
  const n = name.trim().toLowerCase()
  const s = state.trim().toLowerCase()
  if (!n && !s) return []
  return FACILITIES.filter(f =>
    (!n || f.name.toLowerCase().includes(n)) && (!s || f.state.toLowerCase() === s)
  )
}

export const ROUND_FORMATS = [
  { value: 'four-person-scramble', label: 'Four Person Scramble (4)' },
  { value: 'two-person-scramble', label: 'Two Person Scramble (2)' },
  { value: 'best-ball', label: 'Best Ball' },
  { value: 'stroke-play', label: 'Individual Stroke Play' },
  { value: 'stableford', label: 'Stableford' },
]
