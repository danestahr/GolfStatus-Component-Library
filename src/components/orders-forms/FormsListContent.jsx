import { useState } from 'react'
import { faMagnifyingGlass, faXmark, faPlus, faArrowCircleDown } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import './FormsListPanel.scss'

// Opens straight to that form's overview (OrderFormOverviewDraft1) — see
// EventSitePackagesListPage's onSelectForm.
function FormRow({ form, onClick }) {
  return (
    <div
      className="fp-row"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="fp-row-name">{form.name}</div>
      <div className="fp-row-sub">Created on {form.createdAt}</div>
    </div>
  )
}

// The "Forms" screen opened from the "Forms" row on EventSitePackagesListPage
// (Figma "Event Site + Packages" → Forms) — same action-bar/search/list
// shell as the other Draft 1 side-panel lists (e.g. OrderResponsesListDraft1).
// Plain content, not its own panel: the page that owns the single
// AppSidePanel renders this in place, alongside whatever other screens
// (Add Form, Form Overview) share that same panel.
export default function FormsListContent({ forms, onAddForm, onSelectForm }) {
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()
  const visibleForms = forms.filter(form => !query || form.name.toLowerCase().includes(query))

  return (
    <div className="fp-list">
      <GSActionBar
        type="x-large-pad H3"
        header="Forms"
        pageActions={[
          { buttonTitle: 'Add Form', buttonIcon: faPlus, type: 'black', actionClick: onAddForm },
          // Stubbed — no export exists for this prototype yet, same
          // convention as ScorecardListPage's Upload/Download actions.
          { actionIcon: faArrowCircleDown, type: 'light-grey icon', actionClick: () => {} },
        ]}
      />

      <div className="fp-list-search">
        <GSinput
          leftIcon={faMagnifyingGlass}
          rightIcon={search ? faXmark : null}
          rightIconClick={() => setSearch('')}
          placeholder="Search Forms..."
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
          visibleForms.map(form => <FormRow key={form.id} form={form} onClick={() => onSelectForm(form)} />)
        )}
      </div>
    </div>
  )
}
