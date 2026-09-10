import { useEffect, useState } from 'react'
import { faMagnifyingGlass, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'
import GSSelect from '../../gs-lib/components/gs-select'
import GSRadioGroup from '../../gs-lib/components/gs-radio-group'
import GSQuickFilter from '../../gs-lib/components/gs-quick-filter'
import { registeredTeams } from '../../data/mockTeams.js'
import { sponsors } from '../../data/mockSponsors.js'
import { responsesForFormAcrossOrders, isNumberQuestion, QUESTION_OPTIONS } from '../orders/orderUtils'
import './AddResponseFields.scss'

export const emptyResponseDraft = { links: [], formIds: [], answers: {} }

// "Player" answers for every player on a team at once (see
// questionsForCategory below), so its own search still finds a Team — same
// list `category: 'team'` searches — rather than a flat list of individual
// players; picking one just opens that team's whole roster up to answer for
// instead of answering as the team itself.
const CATEGORY_OPTIONS = [
  { value: 'player', label: 'Player' },
  { value: 'team', label: 'Team' },
  { value: 'order', label: 'Order' },
  { value: 'sponsor', label: 'Sponsor' },
]

const CATEGORY_LABELS = { player: 'Team', team: 'Team', order: 'Order', sponsor: 'Sponsor' }

// Which of a form's known questions (see formQuestionsFor) apply to a given
// link — a team link only answers that form's team-level questions, a
// sponsor link only its sponsor-level ones, a player link only its player-
// level ones (once per player, see buildFields below). An Order link has no
// single fillLevel of its own (it's the whole purchase, not a specific
// team/sponsor/player within it) — so it isn't filtered at all and picks up
// every question the form has, regardless of fillLevel.
const CATEGORY_FILL_LEVEL = { team: 'team', sponsor: 'sponsor', player: 'player' }

// A form's known questions (text + fillLevel), discovered from whatever's
// already been answered on real orders — there's no form-builder in this
// prototype to ask a form for its own question list directly (see
// mockForms.js), so this reuses the same cross-order lookup the rest of the
// Forms flow already relies on (responsesForFormAcrossOrders). A brand new
// form with no orders against it yet just comes back empty.
export function formQuestionsFor(orders, form) {
  return responsesForFormAcrossOrders(orders, form.name, form.id).map(q => ({ question: q.question, fillLevel: q.fillLevel }))
}

function questionsForCategory(orders, form, category) {
  const questions = formQuestionsFor(orders, form)
  const fillLevel = CATEGORY_FILL_LEVEL[category]
  return fillLevel ? questions.filter(q => q.fillLevel === fillLevel) : questions
}

export function answerKey(linkKey, formId, question) {
  return `${linkKey}__${formId}__${question}`
}

export function playerAnswerKey(linkKey, playerId, formId, question) {
  return `${linkKey}__${playerId}__${formId}__${question}`
}

// The Team search doubles as the Player search (see CATEGORY_OPTIONS'
// comment above) — both list every registered team, just answered
// differently once picked. Sponsors search sponsors; Orders search real
// orders directly (buyer/business name), skipping any already-manual one
// (see EventSitePackagesListPage's handleAddResponseSave) since a manual
// entry has nothing of its own worth linking a second response to.
function searchListFor(category, orders) {
  if (category === 'sponsor') {
    return sponsors.map(s => ({ id: s.id, name: s.sponsorName, sub: s.contactName }))
  }
  if (category === 'order') {
    return orders
      .filter(o => !o.id.startsWith('manual-'))
      .map(o => ({ id: o.id, name: o.businessName || o.buyerName, sub: o.businessName ? o.buyerName : o.dateTime ?? o.date ?? '' }))
  }
  return registeredTeams.map(t => ({ id: t.id, name: t.teamName, sub: t.contactName, players: t.players }))
}

function matchesSearch(item, query) {
  if (!query) return true
  return item.name.toLowerCase().includes(query) || (item.sub ?? '').toLowerCase().includes(query)
}

// The "Add Response" screen (opened from the Form Responses page's own Add
// Response button — see AllOrderResponsesForFormDraft1.jsx/
// EventSitePackagesListPage.jsx) — lets someone record a response that
// didn't come through an actual order at all. Picking who it's for is a
// two-step drill-down: a Player/Team/Order/Sponsor radio narrows the search
// below to that category's own list (same GSQuickFilter search-and-link
// widget WaveRoundsPanel uses for its round roster), and every result
// picked stays linked regardless of which category is active when you pick
// the next one — so a team, a sponsor, and an order can all end up linked
// to the same response. Each linked team/sponsor/order then gets its own
// section of that category's question fields to fill in (or leave blank
// for now — same "No response yet" placeholder a real unanswered question
// already gets); a linked *player* team instead expands into one section
// per player on its roster, so every player gets their own answer to the
// same player-level question rather than one shared answer for the whole
// team. A fully controlled fields-only component, same convention as
// AddQuestionFields/AddFormFields: the page that owns the single
// AppSidePanel holds the draft and the Save/Cancel actions, and turns a
// save into a synthetic order (see EventSitePackagesListPage's
// handleAddResponseSave) rather than this component knowing anything about
// `orders` beyond reading their existing questions.
export default function AddResponseFields({ orders, forms, draft, onChange }) {
  const [category, setCategory] = useState('team')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setSearch('')
  }, [category])

  const formOptions = forms.map(f => ({ value: f.id, label: f.name }))
  const selectedForms = forms.filter(f => draft.formIds.includes(f.id))

  const query = search.trim().toLowerCase()
  const fullList = searchListFor(category, orders)
  const linkedKeys = new Set(draft.links.map(l => l.key))
  const filteredList = fullList
    .filter(item => !linkedKeys.has(`${category}-${item.id}`))
    .filter(item => matchesSearch(item, query))
  const selectedList = draft.links.filter(l => l.category === category)

  function addLink(item) {
    const key = `${category}-${item.id}`
    if (linkedKeys.has(key)) return
    onChange({
      links: [
        ...draft.links,
        { key, category, id: item.id, name: item.name, players: category === 'player' ? item.players : undefined },
      ],
    })
  }

  function removeLink(key) {
    onChange({ links: draft.links.filter(l => l.key !== key) })
  }

  function setAnswer(key, value) {
    onChange({ answers: { ...draft.answers, [key]: value } })
  }

  // One GSFormSection field per question a link needs answered — `playerId`
  // is only passed for a player-team's own per-player sections (see the
  // render below), which is what pushes the answer into its own keyed slot
  // instead of the team-level one.
  function buildFields(linkCategory, linkKey, playerId) {
    const fields = []
    selectedForms.forEach(form => {
      questionsForCategory(orders, form, linkCategory).forEach(q => {
        const key = playerId != null ? playerAnswerKey(linkKey, playerId, form.id, q.question) : answerKey(linkKey, form.id, q.question)
        const options = QUESTION_OPTIONS[q.question]
        fields.push({
          label: selectedForms.length > 1 ? `${form.name}: ${q.question}` : q.question,
          isEditable: true,
          customView: true,
          value: options ? (
            <GSSelect
              options={options}
              selectedOption={options.find(o => o.value === (draft.answers[key] ?? '')) ?? null}
              onChange={option => setAnswer(key, option?.value ?? '')}
              isSearchable={false}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Select..."
            />
          ) : (
            <GSinput
              type={isNumberQuestion(q.question) ? 'number' : undefined}
              placeholder="Response"
              textValue={draft.answers[key] ?? ''}
              onChange={e => setAnswer(key, e.target.value)}
            />
          ),
        })
      })
    })
    return fields.length > 0
      ? fields
      : [{ label: '', isEditable: false, customView: true, value: <div className="arf-empty arf-empty--inline">No questions on the selected form(s) yet.</div> }]
  }

  return (
    <div className="ordr1-list arf-fields">
      <GSActionBar type="form-header H3" header="Add Response" />

      <GSFormSection
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Link To',
            required: true,
            isEditable: true,
            customView: true,
            value: <GSRadioGroup isLtr options={CATEGORY_OPTIONS} selectedOption={CATEGORY_OPTIONS.find(o => o.value === category)} selectionChanged={option => setCategory(option.value)} />,
          },
          {
            label: '',
            isEditable: true,
            customView: true,
            value: (
              <GSQuickFilter
                multiple
                filteredList={filteredList}
                selectedList={selectedList}
                getItem={item => (
                  <div className="arf-search-row">
                    <div className="arf-search-row-name">{item.name}</div>
                    {item.sub && <div className="arf-search-row-sub">{item.sub}</div>}
                  </div>
                )}
                getDefaultSearch={() => (
                  <GSinput
                    leftIcon={faMagnifyingGlass}
                    rightIcon={search ? faXmark : null}
                    rightIconClick={() => setSearch('')}
                    placeholder={`Search ${CATEGORY_LABELS[category]}s...`}
                    textValue={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                )}
                itemSelected={addLink}
                itemRemoved={item => removeLink(item.key)}
                emptySearchList={<div className="arf-empty arf-empty--inline">No matches.</div>}
                emptySelectedList={<div className="arf-empty arf-empty--inline">Nothing linked yet for this category.</div>}
              />
            ),
          },
          {
            label: 'Forms',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSSelect
                isMulti
                options={formOptions}
                selectedOption={selectedForms.map(f => ({ value: f.id, label: f.name }))}
                onChange={options => onChange({ formIds: (options ?? []).map(o => o.value) })}
                placeholder="Search forms..."
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            ),
          },
        ]}
      />

      {draft.links.length === 0 ? (
        <div className="arf-empty">Link at least one team, sponsor, order, or player to start recording their answers.</div>
      ) : selectedForms.length === 0 ? (
        <div className="arf-empty">Pick at least one form to see its questions.</div>
      ) : (
        draft.links.map(link =>
          link.category === 'player' ? (
            <div className="arf-player-link" key={link.key}>
              <GSActionBar
                type="H5"
                header={`${link.name} (Team)`}
                pageActions={[{ buttonIcon: faTrash, type: 'light-grey icon', actionClick: () => removeLink(link.key) }]}
              />
              {link.players.length === 0 ? (
                <div className="arf-empty arf-empty--inline">This team has no players.</div>
              ) : (
                link.players.map(player => (
                  <GSFormSection
                    key={player.id}
                    title={player.name}
                    type="vertical xx-large-gap"
                    fields={buildFields('player', link.key, player.id)}
                  />
                ))
              )}
            </div>
          ) : (
            <GSFormSection
              key={link.key}
              title={`${link.name} (${CATEGORY_OPTIONS.find(o => o.value === link.category)?.label})`}
              type="vertical xx-large-gap"
              sectionActions={[{ buttonIcon: faTrash, type: 'light-grey icon', actionClick: () => removeLink(link.key) }]}
              fields={buildFields(link.category, link.key)}
            />
          )
        )
      )}
    </div>
  )
}
