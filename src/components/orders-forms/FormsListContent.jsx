import { useState } from 'react'
import { faCheckCircle, faMagnifyingGlass, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSinput from '../../gs-lib/components/gs-input'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import './FormsListPanel.scss'

// Opens straight to that form's overview (OrderFormOverviewDraft1) — see
// EventSitePackagesListPage's onSelectForm — UNLESS `pickerStatus` is given
// (see FormsListContent below), in which case the row itself does nothing
// and its right-side button is the only way to act on it.
function FormRow({ form, onClick, pickerStatus, onPickForm }) {
  const isPicker = !!pickerStatus
  const status = isPicker ? pickerStatus(form) : null

  return (
    <div
      className={`fp-row${isPicker ? ' fp-row--picker' : ''}`}
      onClick={isPicker ? undefined : onClick}
      role={isPicker ? undefined : 'button'}
      tabIndex={isPicker ? undefined : 0}
      onKeyDown={isPicker ? undefined : e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="fp-row-text">
        <div className="fp-row-name">{form.name}</div>
        <div className="fp-row-sub">Created on {form.createdAt}</div>
        {status === 'done' && (
          <div className="fp-row-added">
            <GSButton type="green" size="secondary" isPill title="Added" buttonIcon={faCheckCircle} />
          </div>
        )}
      </div>
      {isPicker && status !== 'done' && (
        <div className="fp-row-action">
          <GSButton
            type="light-grey"
            size="primary"
            title="Add Form"
            buttonIcon={faPlus}
            isFocusable
            onClick={() => onPickForm(form)}
          />
        </div>
      )}
    </div>
  )
}

// The "Forms" screen opened from the "Forms" row on EventSitePackagesListPage
// (Figma "Event Site + Packages" → Forms) — same action-bar/search/list
// shell as the other Draft 1 side-panel lists (e.g. OrderResponsesListDraft1).
// Plain content, not its own panel: the page that owns the single
// AppSidePanel renders this in place, alongside whatever other screens
// (Add Form, Form Overview) share that same panel.
//
// Repurposed as a form PICKER (see TeamsListPage.jsx's/SponsorsListPage.jsx's
// openFormsPicker) by passing `pickerStatus`/`onPickForm` instead of
// `onSelectForm` — same list/search/empty-state shell, but each row's own
// Add/Adding…/Added button becomes the point of the screen rather than a
// click-through to that form's overview. Once added, a form stays added —
// this screen offers no way to remove it (that only ever happens from the
// Form Responses page's own trash, which knows to block/explain removing a
// real, linked response instead of just silently doing nothing).
export default function FormsListContent({
  forms,
  onAddForm,
  onSelectForm,
  pickerStatus = null,
  onPickForm = null,
}) {
  const [search, setSearch] = useState('')
  const isPicker = !!pickerStatus

  const query = search.trim().toLowerCase()
  const visibleForms = forms.filter(form => !query || form.name.toLowerCase().includes(query))

  return (
    <div className="fp-list">
      <GSActionBar
        type="x-large-pad H3"
        header="Forms"
        pageActions={
          isPicker
            ? []
            : [
                { buttonTitle: 'Add Form', buttonIcon: faPlus, type: 'black', actionClick: onAddForm },
                // Hidden for now — stubbed (no export exists for this prototype
                // yet, same convention as ScorecardListPage's Upload/Download
                // actions); uncomment to bring it back.
                // { actionIcon: faArrowCircleDown, type: 'light-grey icon', actionClick: () => {} },
              ]
        }
      />

      <div className="fp-list-search">
        <GSinput
          leftIcon={faMagnifyingGlass}
          rightIcon={search ? faXmark : null}
          rightIconClick={() => setSearch('')}
          placeholder="Search..."
          textValue={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="fp-list-body">
        {visibleForms.length === 0 ? (
          search ? (
            <div className="fp-list-empty">No results for "{search}"</div>
          ) : (
            <GSEmptyList title="No Forms Yet" detail="Add a form to collect additional registrant information." />
          )
        ) : (
          visibleForms.map(form => (
            <FormRow
              key={form.id}
              form={form}
              onClick={() => onSelectForm(form)}
              pickerStatus={pickerStatus}
              onPickForm={onPickForm}
            />
          ))
        )}
      </div>
    </div>
  )
}
