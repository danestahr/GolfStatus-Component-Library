import { faPen } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import { useDragToReorder } from '../../gs-lib/hooks/useDragToReorder.js'
import PackageRow from './PackageRow.jsx'
import './PackageCategorySection.scss'

// One category's sticky header + package rows on the Packages list (Figma
// "Packages" — PackagesListContent), same sticky-under-search convention as
// SponsorTierSection's tier header. The pencil opens the "Package Category"
// screen (Figma "Package Category" — EditPackageCategoryFields, opened via
// EventSitePackagesListPage's `openEditCategory`) to rename this category's
// label. The pencil itself is an undefined-type GSButton (no color/size
// class) — same plain look as NavRow's own chevron/AppSidePanel's back
// chevron — rather than a filled icon button.
//
// Reordering (via PackageRow's drag handle) is only meaningful within a
// category that has more than one package, so the handle is only shown when
// `packages.length > 1`. Packages start sorted price high to low (see
// EventSitePackagesListPage's `packageOrder`), and a manual drag here is what
// can override that.
//
// Pointer-based drag-to-reorder (useDragToReorder), same shared convention
// as SponsorTierSection's sponsor rows.
//
// `onEditCategory`/`onReorder` are both left undefined for a non-premium
// tournament (the Premium toggle lives on EventSitePackagesListPage's own
// hub action bar) — this section can't be renamed or manually reordered
// then, so the pencil and the grab handle just don't render rather than
// rendering disabled.
export default function PackageCategorySection({ label, packages, onCopyPackage, onEditCategory, onReorder }) {
  const reorderable = packages.length > 1 && Boolean(onReorder)

  const {
    draggingId,
    dragOffsetY,
    flashOffsets,
    displayOrder: displayIds,
    rowsBoxRef,
    setRowRef,
    handleGrabberPointerDown,
  } = useDragToReorder(packages.map(p => p.id), onReorder)

  const displayPackages = displayIds.map(id => packages.find(p => p.id === id)).filter(Boolean)

  return (
    <div className="pkgc-section">
      <div className="pkgc-header">
        <div className="pkgc-name">{label}</div>
        {onEditCategory && <GSButton buttonIcon={faPen} isFocusable onClick={onEditCategory} style={{ flexShrink: 0 }} />}
      </div>

      <div className={`pkgc-rows${draggingId != null ? ' pkgc-rows--reordering' : ''}`} ref={rowsBoxRef}>
        {displayPackages.map(pkg => (
          <PackageRow
            key={pkg.id}
            pkg={pkg}
            onCopy={onCopyPackage}
            showGrabber={reorderable}
            isDragging={pkg.id === draggingId}
            offsetY={pkg.id === draggingId ? dragOffsetY : (flashOffsets[pkg.id] ?? 0)}
            onGrabberPointerDown={e => handleGrabberPointerDown(e, pkg.id)}
            onRowRef={el => setRowRef(pkg.id, el)}
          />
        ))}
      </div>
    </div>
  )
}
