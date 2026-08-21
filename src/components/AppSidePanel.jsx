import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import GSSidePanel from '../gs-lib/components/gs-side-panel'
import GSSidePanelNavigation from '../gs-lib/components/gs-side-panel-navigation'
import GSActionDrawer from '../gs-lib/components/gs-action-drawer'
import './AppSidePanel.scss'

/**
 * Standard app-wide side panel wrapper.
 *
 * Props:
 *   className     extra class on the panel's content wrapper, for one-off overrides (optional)
 *   isOpen        boolean
 *   onClose       () => void
 *   onBack        () => void (optional) — overrides what the panel's own top-left
 *                 chevron does; defaults to onClose. Use when the panel is a
 *                 multi-step flow so the chevron steps back one screen at a
 *                 time instead of always closing the whole panel outright.
 *   title         string
 *   rightIcon     FA icon (optional)
 *   onRightAction () => void (optional)
 *   actions       GSActionDrawer actions array (optional)
 *   expanded      boolean — widen panel to viewport minus 220px on tablet/desktop (optional)
 *   animateWidth  boolean — animate the expand/collapse width change; leave false so viewport resizes stay instant (optional)
 *   noTransition  boolean — skip the open/close slide animation, e.g. for a panel opened on top of another (optional)
 *   dimOverlay    boolean — darken the backdrop (default true); pass false when this panel opens on top of
 *                 another already-dimmed AppSidePanel, so the two overlays don't stack into a darker tint (optional)
 *   bodyRef       ref attached to the scrollable body div — lets a caller read/reset/restore
 *                 scrollTop across content swaps, since the div itself never unmounts (optional)
 *   children      scrollable panel content
 */
export default function AppSidePanel({
  className,
  isOpen,
  onClose,
  onBack,
  title,
  rightIcon,
  onRightAction,
  actions,
  banner,
  bottomContent,
  expanded,
  animateWidth,
  noTransition,
  dimOverlay = true,
  bodyRef,
  children,
}) {
  return (
    <>
      {isOpen && (
        <div
          className={`app-side-panel-overlay${dimOverlay ? '' : ' app-side-panel-overlay--clear'}`}
          onClick={onClose}
        />
      )}

      <GSSidePanel sidePanelOpen={isOpen} noTransition={noTransition} animateWidth={animateWidth}>
        <div className={`light app-side-panel-content${expanded ? ' expanded' : ''}${className ? ` ${className}` : ''}`}>
          <GSSidePanelNavigation
            title={title}
            leftIcon={faChevronLeft}
            leftButtonClick={onBack ?? onClose}
            rightIcon={rightIcon}
            rightButtonClick={onRightAction}
          />
          {banner && (
            <div className="app-side-panel-banner">{banner}</div>
          )}

          <div className="app-side-panel-body-wrapper">
            <div className="app-side-panel-body" ref={bodyRef}>
              {children}
            </div>
            {bottomContent && (
              <div className="app-side-panel-bottom">
                {bottomContent}
              </div>
            )}
          </div>

          {actions?.length > 0 && (
            <GSActionDrawer actions={actions} />
          )}
        </div>
      </GSSidePanel>
    </>
  )
}
