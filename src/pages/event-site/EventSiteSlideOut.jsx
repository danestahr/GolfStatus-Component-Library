import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

import GSSidePanel from '../../gs-lib/components/gs-side-panel'
import GSSidePanelNavigation from '../../gs-lib/components/gs-side-panel-navigation'
import './EventSiteSlideOut.scss'

// Shared shell for every slide-out on the public Event Site (Contact Details,
// package forms, ...): the dimmed backdrop, the top nav (back chevron + title),
// the heading row, and the pinned footer all look the same and read the site's
// page-background / subnav colors. Only the form body (`children`), the
// heading's optional action, and the footer buttons change per slide-out.
//
// Rendered inside .es-page so the site's theme variables cascade into it.
export default function EventSiteSlideOut({ isOpen, onClose, title, heading, headingAction, footer, children, onSubmit }) {
  return (
    <>
      {isOpen && <div className="es-slide-out-overlay" onClick={onClose} />}
      <GSSidePanel sidePanelOpen={isOpen}>
        <form className="es-slide-out" onSubmit={onSubmit} noValidate>
          <GSSidePanelNavigation title={title} leftIcon={faChevronLeft} leftButtonClick={onClose} />
          <div className="es-slide-out-scroll">
            <div className="es-slide-out-heading">
              <h2>{heading ?? title}</h2>
              {headingAction}
            </div>
            <div className="es-slide-out-body">{children}</div>
          </div>
          {footer && <div className="es-slide-out-footer">{footer}</div>}
        </form>
      </GSSidePanel>
    </>
  )
}
