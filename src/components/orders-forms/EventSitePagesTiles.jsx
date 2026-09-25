import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faCheck } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSToggle from '../../gs-lib/components/gs-toggle'
import GSinput from '../../gs-lib/components/gs-input'
import { EVENT_SITE_PAGES, EVENT_SITE_PAGE_URLS } from '../../data/eventSitePages.js'
import './EventSitePagesTiles.scss'

// The Event Site Pages screen's list (Event Site & Packages hub) — one row
// per top-level page of the public event site, in the same order as that
// site's own sub-nav tab row (see data/eventSitePages.js, which both this
// and EventWebsitePage.jsx's SUB_NAV_ITEMS read from). `visibility`/
// `onToggleVisibility` are owned by EventSitePackagesListPage, same
// lift-state-up convention as its other screens.
//
// Event Details isn't a toggleable page (it's the site's core landing
// content, always shown) or one with its own separate settings screen — its
// actual content is edited on the Event Site Homepage screen (formerly its
// own top-level nav row on the hub, now only reachable from here via
// `onEditHomepage`), so its row swaps both the toggle and the copy-a-link
// affordance every other page gets for a link straight there. Donate has no
// toggle at all — its visibility is already controlled by a separate
// Donation setting, so a second switch here would just fight it. Auction's
// toggle instead gates a required URL field: turning it on reveals where
// the event's external auction lives, saved inline via the input's own
// embedded Save button rather than the panel's Save/Cancel (this screen has
// neither).
export default function EventSitePagesTiles({ visibility, onToggleVisibility, auctionUrl, onSaveAuctionUrl, onEditHomepage }) {
  const [auctionUrlDraft, setAuctionUrlDraft] = useState(auctionUrl)
  const canSaveAuctionUrl = auctionUrlDraft.trim() !== '' && auctionUrlDraft.trim() !== auctionUrl
  // Which row's link was just tapped — briefly shows a "Copied!" checkmark
  // in its place instead of a toast, same "revert after a beat" convention
  // as EventSiteHomepageSectionsList's own drag-flash timers.
  const [copiedPage, setCopiedPage] = useState(null)

  function handleCopy(page, url) {
    // Best-effort — a background/unfocused tab can reject this (e.g.
    // NotAllowedError), which shouldn't stop the "Copied!" feedback below.
    try {
      navigator.clipboard?.writeText(url)
    } catch {
      // ignored
    }
    setCopiedPage(page)
    setTimeout(() => setCopiedPage(prev => (prev === page ? null : prev)), 1500)
  }

  return (
    <div className="ordr1-list">
      <GSActionBar type="form-header H3" header="Event Site Pages" />

      <div className="esp-rows">
        {EVENT_SITE_PAGES.map(page => (
          <div key={page} className="esp-row">
            <div className="esp-row-main">
              <div className="esp-row-info">
                <div className="esp-row-label">{page}</div>
                {page === 'Event Details' ? (
                  <button type="button" className="esp-row-url" onClick={onEditHomepage}>
                    <FontAwesomeIcon icon={faPen} /> Edit Event Site Homepage
                  </button>
                ) : (
                  <button
                    type="button"
                    className="esp-row-url"
                    onClick={() => handleCopy(page, EVENT_SITE_PAGE_URLS[page])}
                  >
                    {copiedPage === page ? (
                      <span className="esp-row-copied">
                        <FontAwesomeIcon icon={faCheck} /> Copied!
                      </span>
                    ) : (
                      EVENT_SITE_PAGE_URLS[page]
                    )}
                  </button>
                )}
              </div>
              {page !== 'Donate' && page !== 'Event Details' && (
                <GSToggle value={visibility[page]} onClick={() => onToggleVisibility(page)} />
              )}
            </div>

            {page === 'Donate' && (
              <div className="esp-row-note">Visibility is managed in the Donation setting.</div>
            )}

            {page === 'Auction' && visibility[page] && (
              <div className="esp-auction-url">
                <div className="esp-auction-url-label">Auction URL *</div>
                <GSinput
                  placeholder="https://your-auction-site.com"
                  textValue={auctionUrlDraft}
                  onChange={e => setAuctionUrlDraft(e.target.value)}
                  onSubmit={() => canSaveAuctionUrl && onSaveAuctionUrl(auctionUrlDraft.trim())}
                  rightButtonProps={{
                    title: 'Save',
                    isDisabled: !canSaveAuctionUrl,
                    onClick: () => onSaveAuctionUrl(auctionUrlDraft.trim()),
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
