import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarsStaggered, faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import EntityListPage from '../orders-forms/EntityListPage.jsx'
import './FullListPage.scss'

// The standard full-size list page: action bar header (with page actions that
// collapse to icon-only on small screens) + search row (input with a
// times-circle clear button, plus a staggered-bars filter popover) + a
// scrollable list body. Build new list pages by passing rows as `children`
// (see FullListRow) and owning the search/filter state in the page:
//
//   const [search, setSearch] = useState('')
//   const [filters, setFilters] = useState([])
//   <FullListPage
//     header="My Tournaments"
//     pageActions={[{ buttonTitle: 'Create Tournament', actionIcon: faPlus, type: 'black', actionClick }]}
//     searchPlaceholder="Search by Tournament Name"
//     search={search} onSearchChange={setSearch}
//     filterTitle="Status" filterOptions={[{ id, label }]}
//     activeFilters={filters} onActiveFiltersChange={setFilters}
//     isEmpty={rows.length === 0} emptyMessage="No tournaments match your search."
//   >{rows.map(r => <FullListRow ... />)}</FullListPage>
//
// Omit filterOptions to hide the filter button.
export default function FullListPage({
  className,
  header,
  pageActions,
  searchPlaceholder,
  search,
  onSearchChange,
  filterTitle = 'Filter',
  filterOptions,
  activeFilters = [],
  onActiveFiltersChange,
  isEmpty,
  emptyMessage,
  children,
}) {
  const [filterOpen, setFilterOpen] = useState(false)

  const toggleFilter = id =>
    onActiveFiltersChange(activeFilters.includes(id) ? activeFilters.filter(f => f !== id) : [...activeFilters, id])

  const filterButton = filterOptions?.length > 0 && (
    <div className="fl-filter">
      <GSButton buttonIcon={faBarsStaggered} type="transparent" onClick={() => setFilterOpen(o => !o)} isFocusable />
      {filterOpen && (
        <>
          <div className="fl-filter-backdrop" onClick={() => setFilterOpen(false)} />
          <div className="fl-filter-menu">
            <div className="fl-filter-title">{filterTitle}</div>
            {filterOptions.map(option => (
              <div key={option.id} className="fl-filter-option" onClick={() => toggleFilter(option.id)}>
                <span>{option.label}</span>
                {activeFilters.includes(option.id) && <FontAwesomeIcon icon={faCheck} />}
              </div>
            ))}
            {activeFilters.length > 0 && (
              <div className="fl-filter-clear" onClick={() => onActiveFiltersChange([])}>Clear filter</div>
            )}
          </div>
        </>
      )}
    </div>
  )

  return (
    <EntityListPage
      className={`fl-page${className ? ` ${className}` : ''}`}
      header={header}
      pageActions={pageActions}
      searchPlaceholder={searchPlaceholder}
      searchClearIcon={faCircleXmark}
      keepClearSpace
      searchClearButtonProps={{ type: 'secondary transparent' }}
      search={search}
      onSearchChange={onSearchChange}
      searchActions={filterButton}
      emptyMessage={emptyMessage}
    >
      {isEmpty ? <div className="efp-empty">{emptyMessage}</div> : children}
    </EntityListPage>
  )
}

// One row of a full-size list: optional 2:1 image, an info column (use
// FullListRowText for the name/meta stacks), right-aligned counts and a
// trailing action. The image and counts hide at the large-phone breakpoint.
export function FullListRow({ image, showImage = true, info, counts, action, onClick }) {
  return (
    <div className="fl-row" onClick={onClick}>
      {showImage && <div className="fl-row-image">{image}</div>}
      <div className="fl-row-info">{info}</div>
      {counts && <div className="fl-row-counts">{counts}</div>}
      {action}
    </div>
  )
}

// A stack of text lines; `title` renders bold, `lines` as muted meta text.
export function FullListRowText({ title, lines = [] }) {
  return (
    <div className="fl-row-text">
      {title && <div className="fl-row-title">{title}</div>}
      {lines.map(line => <div key={line} className="fl-row-meta">{line}</div>)}
    </div>
  )
}
